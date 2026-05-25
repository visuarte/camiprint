Auditoría inicial del backend — alcance y plan

Objetivo
- Detectar funciones "muertas" o no cableadas en backend, priorizar endpoints críticos, y generar un plan de tareas para conectar/cablear funcionalidades y limpiar código muerto.

Alcance propuesto
- Revisar todo `src/server/**` y `src/app/api/**` para:
  - Endpoints expuestos (implementados vs stubs vs throw new Error)
  - Funciones exportadas no referenciadas (posible código muerto)
  - Comentarios `TODO`/`FIXME` y `throw new Error(...)` que indiquen trabajo pendiente
  - Dependencias críticas (Stripe, DB, Redis) y su configuración/env
  - Pruebas existentes y su cobertura (`__tests__`)

Hallazgos rápidos (basado en scan inicial):
- Endpoints detectados: `/api/admin/*`, `/api/orders`, `/api/v1/quotes`, `/api/webhook/stripe`, `/api/v1/metrics`, `/api/v1/health`, entre otros.
- Se encontraron `throw new Error('...')` en puntos que indican falta de configuración (DB, STRIPE) — estas son barreras claras para ejecutar flujos completos.
- Se detectaron tests y utilidades (`src/__tests__`) indicando rutas y comportamiento esperado; usar las pruebas para guiar el cableado.

Riesgos prioritarios
- Feature-critical: flujo de órdenes y envío de emails (`/api/orders`, `/api/orders/[id]/send-email`) deben estar cableadas y protegidas.
- Configuración sensible: variables `DATABASE_URL`, `STRIPE_SECRET_KEY`, `ADMIN_AUTH_TOKEN` deben estar definidas en los entornos adecuados.
- Código inmaduro: funciones que lanzan `Error` por config faltante son intencionales; necesitan feature flags o mocks para dev.

Plan de auditoría (pasos)
1. Static scan: listar todas las exportaciones en `src/server` y `src/app/api`, mapear referencias con búsqueda semántica (o `rg`/`grep`).
2. Ejecutar tests (`npm test` / `vitest`) para ver fallos y áreas rotas.
3. Generar un informe detallado: por endpoint, estado (OK / parcial / stub / requiere config), lista de funciones exportadas no referenciadas.
4. Priorizar: catalogar tareas como P0 (ordenes/emails/auth), P1 (metrics/quotes), P2 (limpieza y refactor).
5. Crear tasks detalladas (PR por task), estimaciones y asignación.

Ejemplo de desglose inicial de tareas
- P0-1: Asegurar flujo `POST /api/admin/auth/login` (completado).
- P0-2: Verificar `POST /api/orders` en dev con backend simulado y luego en staging contra la DB.
- P0-3: Revisar y cablear `send-email` (dependencia de Resend/SMTP). Añadir feature flag y pruebas.
- P1-1: Validar `api/v1/quotes` y configuraciones para `QUOTES_REPOSITORY_DRIVER`.
- P2-1: Eliminar código muerto y sincronizar exports.

Propuesta de trabajo inmediato (fase 1)
- Crear el informe automático (script que produce JSON con endpoints y estado).
- Ejecutar tests y capturar fallos.
- Revisar las 10 funciones/archivos con más `throw new Error` o `TODO` y priorizarlos.

¿Quieres que:
- a) Ejecute ahora un escaneo automático y genere el informe detallado (JSON + Markdown)?
- b) O prefieres que cree directamente las tareas/PRs para los P0 listados y empiece a cablear `send-email` y `orders`?

Siguiente paso recomendado: ejecutar el escaneo automático para tener datos precisos y luego creer la lista de tareas PR-ready.