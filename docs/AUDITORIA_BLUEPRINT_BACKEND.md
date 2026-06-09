# Auditoria y Blueprint de Mejora del Backend

Fecha: 2026-05-18
Proyecto: Camiart
Scope: backend v1 de cotizaciones y operacion asociada

## 1. Resumen ejecutivo

El backend actual ya cumple bien su papel como v1 funcional:

- `POST /api/v1/quotes` operativo.
- `GET /api/v1/health` operativo.
- `GET /api/v1/metrics` operativo.
- Validacion server-side, rate limiting, logging estructurado y circuit breaker presentes.
- Suite automatizada y build en verde.

Sin embargo, la base todavia no alcanza el nivel de backend de produccion fuerte por tres motivos estructurales:

1. La persistencia sigue apoyada en archivo local JSON.
2. El rate limit y las metricas viven en memoria de proceso.
3. La exposicion operativa aun no esta endurecida para despliegues distribuidos.

Conclusion:

- Estado actual: backend funcional y estable.
- Estado objetivo: backend durable, observable, escalable y operable.
- Prioridad maxima: reemplazar la persistencia local por almacenamiento durable real sin romper el contrato v1.

## 2. Estado actual auditado

### 2.1 Capacidades implementadas

- Handler HTTP delgado con parseo, validacion y delegacion a servicio.
- Contrato de respuesta consistente (`ok`, `data/error`, `meta.requestId`).
- Validacion estricta del payload y rechazo de campos extra.
- Rate limiting por IP.
- Timeout y circuit breaker para la persistencia.
- Logs estructurados con enmascaramiento de PII.
- Endpoint de metricas en texto compatible con scraping.
- Health check de persistencia.

### 2.2 Fortaleza del diseno actual

- La separacion ruta -> servicio -> repositorio esta bien encaminada.
- El frontend ya esta acoplado a un contrato razonablemente estable.
- La base de tests existente permite iterar sin romper integracion.
- El sistema ya tiene guardrails de arquitectura y manejo de errores coherente.

## 3. Hallazgos principales

### 3.1 Persistencia no durable a nivel de infraestructura

La escritura actual usa filesystem local y serializacion por lock en memoria del proceso.

Implicaciones:

- No escala bien a multiples instancias.
- No es fiable en entornos serverless o con disco efimero.
- No permite operacion robusta, backups ni consultas futuras serias.

### 3.2 Rate limiting local por proceso

El rate limit actual sirve como proteccion inicial, pero no como control consistente en despliegue horizontal.

Implicaciones:

- Cada replica contaria de forma distinta.
- Un reinicio resetea el historial.
- La proteccion frente a abuso queda debilitada.

### 3.3 Metricas locales no agregadas

Las metricas actuales son utiles para desarrollo y validacion local, pero no equivalen a observabilidad operativa completa.

Implicaciones:

- No hay agregacion entre instancias.
- No hay persistencia historica.
- Los percentiles calculados en memoria no reflejan una fotografia global del sistema.

### 3.4 Superficie operativa pendiente de endurecimiento

El endpoint de metricas debe considerarse interno o protegido.

Tambien queda por cerrar:

- politica de CORS explicita si la API saldra de same-origin,
- validacion de IP confiable detras del proxy de plataforma,
- estrategia de secretos y variables de entorno de despliegue.

## 4. Objetivo del blueprint

Transformar el backend actual en una base apta para produccion sin romper el frontend ni el contrato v1.

Principios del blueprint:

1. Mantener estable la API `/api/v1`.
2. Sustituir infraestructura, no reescribir la logica de negocio.
3. Preservar la separacion de capas ya existente.
4. Endurecer operacion y observabilidad con el menor radio de cambio posible.

## 5. Arquitectura objetivo

### 5.1 Capas

- Route handlers: HTTP, parseo, codigos, headers, requestId.
- Services: reglas de negocio, resiliencia, timeout, circuit breaker.
- Repository: persistencia durable.
- Observability: logging, metricas, trazabilidad.
- Platform adapters: rate limit, almacenamiento, configuracion de entorno.

### 5.2 Stack tecnologico recomendado

- Runtime: Node.js + TypeScript.
- Framework de ejecucion: Next.js App Router manteniendo route handlers actuales.
- Persistencia: PostgreSQL gestionado.
- Acceso a datos: Prisma o Drizzle.
- Rate limit distribuido: Redis gestionado.
- Logging: Pino como opcion preferente por simplicidad y rendimiento.
- Metricas: Prometheus + Grafana o proveedor equivalente.

Nota de alineacion:

- No se recomienda migrar esta v1 a Express o Fastify como primer paso.
- La prioridad es endurecer infraestructura preservando el backend actual sobre Next.js.
- Cualquier cambio de framework de transporte solo tendria sentido despues de estabilizar persistencia, observabilidad y operacion.

### 5.3 Infraestructura objetivo recomendada

- Base de datos principal: PostgreSQL gestionado.
- Rate limit distribuido: Redis o servicio equivalente gestionado.
- Metricas: scraping Prometheus o proveedor equivalente, con agregacion por instancia.
- Logs: salida estructurada hacia colector centralizado.

### 5.4 Topologia objetivo

- Cliente web Camiart consumiendo la API same-origin.
- Reverse proxy o edge layer delante del runtime para TLS, cache y proteccion basica.
- Multiples instancias del backend usando el mismo contrato v1.
- PostgreSQL como fuente de verdad de cotizaciones.
- Redis como store compartido para rate limiting y futuros locks distribuidos si fueran necesarios.
- Prometheus/Grafana o equivalente para recoleccion y visualizacion de metricas agregadas.

### 5.5 Contratos que deben mantenerse estables

- `POST /api/v1/quotes`
- `GET /api/v1/health`
- `GET /api/v1/metrics`
- formato de errores y `meta.requestId`
- mensajes UX ya integrados con el formulario actual

## 6. Modelo de datos objetivo

La fase de persistencia durable debe ser una transposicion limpia del modelo actual, sin rediseñar el dominio antes de tiempo.

Tabla sugerida: `quotes`

- `id` UUID PK
- `source` VARCHAR NOT NULL
- `status` VARCHAR NOT NULL
- `name` VARCHAR(120) NOT NULL
- `email` VARCHAR(254) NOT NULL
- `phone` VARCHAR NOT NULL
- `company_name` VARCHAR(160) NOT NULL
- `quantity` VARCHAR NOT NULL
- `message` TEXT NULL
- `metadata` JSONB NULL
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL
- `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL

Indices minimos sugeridos:

- indice por `created_at`
- indice por `email`
- indice compuesto por `status, created_at`

Observaciones:

- `quantity` debe mantenerse compatible con el contrato actual (`10-24`, `25-49`, `50-99`, `100+`).
- `metadata` permite evolucion no breaking sin contaminar la tabla principal.
- No conviene convertir `quantity` a entero mientras el frontend y el contrato v1 usan rangos string.

## 7. Estructura objetivo del backend

La evolucion recomendada debe respetar el codigo existente y moverse hacia una estructura mas explicita, sin una reescritura completa.

Estructura objetivo sugerida dentro del proyecto actual:

- `src/app/api/v1/...`: handlers HTTP y borde de transporte.
- `src/server/quotes`: servicio, repositorio, validacion y tipos del dominio de cotizaciones.
- `src/server/http`: request id, errores, rate limit, headers, helpers de borde.
- `src/server/observability`: logger, metricas, health adapters.
- `src/server/platform`: nuevos adapters de database, redis y configuracion de entorno.

Ruta de transicion recomendada:

- mantener la forma actual del repo,
- introducir adapters nuevos en `src/server/platform`,
- migrar el repositorio JSON a un repositorio PostgreSQL sin alterar el servicio ni los handlers.

## 8. Plan de implementacion por fases

### Fase 0 - Congelacion de contrato

Objetivo:

- Declarar que v1 no cambia para frontend.

Acciones:

- Mantener tipos y payload actuales.
- Congelar mensajes de exito y error ya integrados.
- Revisar que cualquier cambio interno no altere el shape de respuesta.

Salida esperada:

- Cero cambios obligatorios en UI.

### Fase 1 - Persistencia durable

Objetivo:

- Reemplazar JSON local por base de datos durable.

Acciones:

- Introducir una implementacion de repositorio respaldada por PostgreSQL.
- Añadir una interfaz o contrato interno para repositorio de quotes.
- Crear tabla inicial de quotes con indices minimos.
- Mantener la interfaz del repositorio para no tocar servicio ni route en exceso.
- Ajustar health check para verificar la dependencia real.
- Preparar script de migracion desde JSON si los datos existentes deben conservarse.

Esquema minimo sugerido:

- `id`
- `source`
- `status`
- `created_at`
- `updated_at`
- `name`
- `email`
- `phone`
- `company_name`
- `quantity`
- `message`

Salida esperada:

- Persistencia durable y consistente entre instancias.
- Repositorio JSON conservado solo como fallback local o soporte de tests, no como backend de produccion.

### Fase 2 - Rate limit distribuido

Objetivo:

- Hacer que el rate limit sea consistente en produccion.

Acciones:

- Extraer el store actual a un adapter.
- Implementar backend Redis o equivalente.
- Conservar la semantica actual de `429` y `Retry-After`.
- Mantener una implementacion in-memory solo para test o desarrollo controlado.

Salida esperada:

- Proteccion uniforme frente a abuso en multiples instancias.

### Fase 3 - Observabilidad operativa

Objetivo:

- Pasar de metricas locales a operacion medible.

Acciones:

- Mantener el endpoint de metricas para compatibilidad local.
- Definir exposicion interna o protegida del scrape endpoint.
- Integrar logs en un colector centralizado.
- Añadir dashboards minimos con p50/p95/p99, 4xx, 5xx, 429 y disponibilidad.
- Evitar depender de percentiles construidos solo en memoria local como fuente final de verdad.

Salida esperada:

- Visibilidad real de salud y rendimiento.

### Fase 4 - Hardening de plataforma

Objetivo:

- Cerrar huecos operativos antes de produccion.

Acciones:

- Politica de CORS explicita si aplica.
- Confiar solo en headers de IP del proxy conocido.
- Proteger `GET /metrics`.
- Formalizar configuracion por entorno.
- Definir backups, retencion y recuperacion.
- Definir politica de secretos y rotacion de credenciales.

Salida esperada:

- Backend listo para operacion continua.

## 9. Blueprint tecnico de refactor minimo

### 7.1 Mantener

- Route handlers.
- Servicio de quotes.
- Validacion.
- Contrato HTTP.
- Integracion actual con el frontend.

### 7.2 Cambiar

- Implementacion del repositorio.
- Store del rate limiter.
- Fuente de metricas operativas.
- Health check para verificar dependencias reales.

Blueprint de interfaces internas sugeridas:

- `QuoteRepository`
- `RateLimitStore`
- `HealthCheckService`
- `MetricsSink` o adapter equivalente

Esto permite intercambiar JSON por PostgreSQL y memoria por Redis sin romper la capa de servicio.

### 7.3 Evitar

- Reescribir el flujo del formulario.
- Cambiar nombres de campos del payload.
- Introducir una v2 antes de estabilizar la v1.
- Mezclar infraestructura con UI o client components.

## 10. Recomendacion de librerias

### Persistencia

- Prisma: mejor ergonomia y migraciones sencillas.
- Drizzle: mayor control SQL y menor peso de abstraccion.

Decisiones sugeridas:

- Si el equipo prioriza velocidad de entrega y tipado guiado, Prisma.
- Si el equipo prioriza SQL explicito y menor magia, Drizzle.

### Logging

- Pino recomendado por rendimiento y sencillez de salida JSON.
- Winston solo si se necesitan transports complejos desde muy temprano.

### Rate limiting

- Redis gestionado con adapter simple propio o libreria contrastada.
- Evitar introducir middleware pesado que complique el modelo actual de route handlers.

## 11. Matriz de prioridades

### P0

- Persistencia durable real.
- Health check conectado a la dependencia real.

### P1

- Rate limit distribuido.
- Proteccion o internalizacion de metricas.
- Politica de IP y proxy confiable.

### P2

- Dashboards y alertas.
- Runbook operativo.
- Retencion y auditoria de datos.

## 12. Testing blueprint

### 9.1 Tests que deben mantenerse

- contrato de `POST /quotes`
- validacion 422
- `415`, `429`, `503`
- integracion frontend + backend
- build completo

### 9.2 Tests nuevos recomendados

- `413 PAYLOAD_TOO_LARGE`
- `422 JSON invalido`
- health degraded/down con dependencia real simulada
- repositorio durable con DB de pruebas
- rate limiting distribuido con adapter fake/in-memory para test
- migracion de datos JSON -> SQL si se decide preservar historico
- smoke test de proteccion de `/metrics` cuando se endurezca

### 9.3 Validaciones de release

- `npm run test`
- `npm run build`
- smoke test sobre `/api/v1/health`
- smoke test sobre `/api/v1/quotes`
- validacion de metricas protegidas o accesibles solo desde red interna

## 13. Riesgos del cambio

### Riesgos principales

- Introducir latencia extra por DB sin pool adecuado.
- Romper tests si el repositorio deja de ser intercambiable.
- Acoplar el handler a detalles de infraestructura.
- Cambiar sin querer el contrato consumido por frontend.

### Mitigaciones

- Mantener interfaz de repositorio.
- Introducir adapters por etapa.
- Migrar con tests de contrato primero.
- Medir antes y despues de cada fase.
- Desplegar primero persistencia durable sin tocar el contrato del frontend.
- No mezclar el refactor de infraestructura con cambios de UX o branding.

## 14. Definition of Done del backend objetivo

El backend puede considerarse listo para produccion cuando se cumpla todo esto:

- Persistencia durable en infraestructura real.
- Health check conectado a dependencias reales.
- Rate limiting consistente entre instancias.
- Logs centralizados y metricas operativas agregadas.
- Endpoint de metricas protegido o interno.
- Suite automatizada en verde.
- Build de produccion en verde.
- Runbook minimo de operacion y recuperacion documentado.
- Script o procedimiento de migracion de datos definido si existe historico relevante.

## 15. Roadmap tecnico recomendado

### Tramo A - Estabilizacion

1. Congelar contrato v1.
2. Introducir interfaces internas para repositorio y rate limit.
3. Aislar configuracion de entorno y adapters de plataforma.

### Tramo B - Infraestructura durable

1. Implementar PostgreSQL.
2. Sustituir el repositorio JSON en runtime productivo.
3. Conectar health check a la base real.

### Tramo C - Operacion distribuida

1. Implementar Redis para rate limit.
2. Proteger metricas.
3. Centralizar logs y dashboards.

### Tramo D - Go-live duro

1. Ejecutar smoke tests reales.
2. Verificar alertas y dashboards.
3. Validar backups y recuperacion.

## 16. Siguiente secuencia recomendada

1. Implementar repositorio durable manteniendo la interfaz actual.
2. Ajustar health check a la nueva dependencia.
3. Extraer rate limiting a adapter y moverlo a store compartido.
4. Proteger metricas y formalizar configuracion de plataforma.
5. Añadir tests faltantes de errores y degradacion.
6. Consolidar documentacion de despliegue y operacion.

## 17. Cierre

La base actual no necesita una reescritura. Necesita endurecimiento selectivo.

El mejor camino es evolucionar desde la arquitectura existente, preservando contrato, UI y pruebas, y sustituyendo las piezas de infraestructura que hoy limitan la durabilidad y la operacion real.

Documento complementario de ejecucion:

- `PLAN_TAREAS_TECNICAS_BACKEND.md`