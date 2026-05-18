# Plan de Tareas Tecnicas del Backend por Fases

Fecha: 2026-05-18
Proyecto: Camiart
Base de referencia: AUDITORIA_BLUEPRINT_BACKEND.md
Objetivo: convertir el blueprint backend en un plan ejecutable, incremental y verificable sin romper el contrato v1.

## 1. Reglas de ejecucion

- No romper `POST /api/v1/quotes`, `GET /api/v1/health` ni `GET /api/v1/metrics`.
- No introducir cambios obligatorios en el frontend durante las fases de infraestructura.
- Mantener la arquitectura actual de Next.js App Router.
- Ejecutar validaciones al cierre de cada fase.
- No mezclar refactor de infraestructura con cambios de UX, branding o marketing.

## 2. Orden recomendado de ejecucion

1. Fase A: Congelacion de contrato y preparacion tecnica.
2. Fase B: Persistencia durable con PostgreSQL.
3. Fase C: Rate limiting distribuido.
4. Fase D: Observabilidad y hardening operativo.
5. Fase E: Cierre de go-live.

## 3. Fase A - Congelacion y preparacion

### Objetivo

Preparar el backend para cambios de infraestructura sin tocar el contrato publico.

### Tareas

#### A1. Congelar contrato v1

- Confirmar el shape actual de request y response.
- Confirmar codigos soportados: `201`, `413`, `415`, `422`, `429`, `500`, `503`.
- Congelar mensajes frontend dependientes.

Archivos objetivo:

- `src/app/api/v1/quotes/route.ts`
- `src/server/http/errors.ts`
- `src/server/quotes/types.ts`
- `src/server/quotes/validation.ts`

Validacion:

- `npm run test`
- revision de tests de contrato ya existentes

#### A2. Introducir contratos internos de infraestructura

- Crear interfaz para repositorio de quotes.
- Crear interfaz para store de rate limiting.
- Crear interfaz o adapter para health checks de dependencias.

Archivos sugeridos:

- `src/server/quotes/contracts.ts`
- `src/server/http/rate-limit.store.ts`
- `src/server/observability/health.ts`

Entregable:

- el servicio debe depender de contratos, no de implementaciones concretas.

#### A3. Aislar configuracion de plataforma

- Centralizar lectura de variables de entorno.
- Definir valores requeridos para DB, Redis y seguridad.
- Preparar validacion de config al arranque.

Archivos sugeridos:

- `src/server/platform/config.ts`
- `src/server/platform/env.ts`

Validacion:

- build verde
- errores claros si faltan variables criticas

### Salida de fase

- backend listo para sustituir infraestructura sin cambiar el contrato publico.

## 4. Fase B - Persistencia durable

### Objetivo

Reemplazar el repositorio JSON por PostgreSQL manteniendo el servicio y la API estables.

### Tareas

#### B1. Elegir stack de acceso a datos

- Decidir entre Prisma y Drizzle.
- Criterio sugerido:
  - Prisma si se prioriza velocidad de entrega.
  - Drizzle si se prioriza SQL explicito.

Entregable:

- decision registrada en la documentacion tecnica.

#### B2. Configurar la capa database

- Añadir conexion a PostgreSQL.
- Configurar cliente y pooling.
- Preparar separacion entre test y produccion.

Archivos sugeridos:

- `src/server/platform/database/client.ts`
- `src/server/platform/database/schema.ts` o equivalente
- `src/server/platform/database/migrations/*`

#### B3. Crear esquema inicial de quotes

- Crear tabla `quotes`.
- Añadir indices minimos.
- Mantener compatibilidad con el dominio actual.

Campos minimos:

- `id`
- `source`
- `status`
- `name`
- `email`
- `phone`
- `company_name`
- `quantity`
- `message`
- `metadata`
- `created_at`
- `updated_at`

#### B4. Implementar PostgresQuoteRepository

- Implementar `create`.
- Implementar `list` si sigue siendo necesario para soporte actual.
- Implementar `isHealthy` contra la base real.

Archivos sugeridos:

- `src/server/quotes/postgres.repository.ts`
- `src/server/quotes/repository.ts` como facade o wiring

Validacion:

- tests unitarios del repositorio
- health real contra DB de pruebas

#### B5. Mantener JSON solo para test o fallback local

- Conservar la implementacion JSON como adapter secundario.
- Evitar que el runtime productivo dependa del filesystem local.

Entregable:

- seleccion de repositorio por entorno o feature flag controlado.

#### B6. Preparar migracion de historico

- Analizar si los JSON actuales contienen datos utiles.
- Crear script de migracion `json-to-postgres` si aplica.
- Ejecutar migracion solo una vez y dejar procedimiento documentado.

Archivos sugeridos:

- `scripts/migrate-quotes-json-to-postgres.ts`

Validacion:

- conteo de registros antes y despues
- muestra aleatoria de integridad de datos

### Salida de fase

- persistencia durable real.
- health check conectado a DB.
- contrato HTTP sin cambios.

## 5. Fase C - Rate limiting distribuido

### Objetivo

Hacer consistente el rate limiting en despliegues con multiples instancias.

### Tareas

#### C1. Extraer store actual a un adapter formal

- desacoplar la logica del algoritmo del almacenamiento.
- mantener la semantica actual de ventana y `Retry-After`.

Archivos objetivo:

- `src/server/http/rate-limit.ts`
- `src/server/http/rate-limit.store.ts`

#### C2. Implementar RedisRateLimitStore

- usar Redis gestionado.
- soportar expiracion por ventana.
- garantizar compatibilidad con el flujo actual.

Archivos sugeridos:

- `src/server/platform/redis/client.ts`
- `src/server/http/redis-rate-limit.store.ts`

#### C3. Mantener store in-memory para test

- no forzar Redis en toda la suite local.
- permitir tests veloces y deterministas.

Validacion:

- tests de `429`
- tests del adapter distribuido con fake store

### Salida de fase

- rate limit uniforme entre replicas.

## 6. Fase D - Observabilidad y hardening

### Objetivo

Cerrar los huecos operativos para una base de produccion confiable.

### Tareas

#### D1. Endurecer `GET /metrics`

- definir si sera interno, protegido por red o autenticado.
- evitar exposicion publica abierta por defecto.

Archivos objetivo:

- `src/app/api/v1/metrics/route.ts`
- `src/server/platform/config.ts`

#### D2. Centralizar logging operativo

- adoptar Pino o mantener logger propio con salida JSON clara.
- enviar logs a colector centralizado.
- verificar que no se filtre PII completa.

Archivos objetivo:

- `src/server/observability/logger.ts`
- adapters de transporte si fueran necesarios

#### D3. Mejorar health checks

- diferenciar `ok`, `degraded` y `down`.
- incluir DB y Redis como dependencias reales.
- medir latencia de checks clave.

Archivos objetivo:

- `src/app/api/v1/health/route.ts`
- `src/server/observability/health.ts`

#### D4. Formalizar politica de IP confiable

- confiar solo en headers del proxy conocido.
- documentar comportamiento por entorno.

Archivos objetivo:

- `src/server/http/rate-limit.ts`
- configuracion de plataforma

#### D5. Cerrar seguridad de plataforma

- politica de CORS explicita si la API deja de ser same-origin.
- politica de secretos y rotacion.
- backups y recuperacion documentados.

Entregables:

- configuracion versionada
- runbook minimo de operacion

### Salida de fase

- backend observable y protegido operativamente.

## 7. Fase E - Testing y go-live

### Objetivo

Validar que la nueva infraestructura no rompio el backend ni el frontend.

### Tareas

#### E1. Completar pruebas faltantes

- `413 PAYLOAD_TOO_LARGE`
- `422 JSON invalido`
- `health degraded/down`
- pruebas de repositorio con DB real de test
- pruebas de rate limiting distribuido
- smoke test de proteccion de `/metrics`

#### E2. Ejecutar validacion de release

- `npm run test`
- `npm run build`
- smoke test manual o automatizado sobre:
  - `/api/v1/health`
  - `/api/v1/quotes`
  - `/api/v1/metrics` segun politica definida

#### E3. Verificar operacion real

- dashboards visibles
- alertas configuradas
- backups confirmados
- procedimiento de rollback documentado

### Salida de fase

- backend listo para produccion real.

## 8. Dependencias entre fases

- A bloquea B, C y D.
- B debe completarse antes de declarar produccion real.
- C y D pueden solaparse parcialmente despues de B.
- E cierra el proyecto y no debe empezar sin B al menos estabilizada.

## 9. Criterios de aprobacion por fase

### Aprobacion Fase A

- contratos internos definidos
- sin cambios breaking en la API
- build y tests verdes

### Aprobacion Fase B

- PostgreSQL operativo
- health conectado a DB
- persistencia local fuera del runtime productivo

### Aprobacion Fase C

- rate limit consistente entre instancias
- `429` y `Retry-After` preservados

### Aprobacion Fase D

- metricas protegidas
- logs centralizados
- health de dependencias reales

### Aprobacion Fase E

- smoke tests exitosos
- runbook listo
- criterios de Definition of Done cumplidos

## 10. Secuencia de trabajo inmediata recomendada

1. Introducir `QuoteRepository` como contrato interno.
2. Añadir capa `src/server/platform` para config y database.
3. Implementar PostgreSQL y migrar el repositorio.
4. Conectar `health` a PostgreSQL.
5. Extraer el store del rate limit y moverlo a Redis.
6. Proteger `metrics` y cerrar runbook de operacion.

## 11. Nota de gestion

Este plan no sustituye la auditoria. La complementa.

- `AUDITORIA_BLUEPRINT_BACKEND.md` define el por que y la arquitectura objetivo.
- `PLAN_TAREAS_TECNICAS_BACKEND.md` define el como ejecutar el trabajo por fases.