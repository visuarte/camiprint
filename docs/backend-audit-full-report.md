Informe de auditoría completo — Backend

Fecha: 25/05/2026
Autor: Auditoría automática + revisión manual rápida

Resumen ejecutivo
- Estado general: el backend contiene la mayor parte de los endpoints principales implementados, pero hay áreas con "stubs" o dependencias faltantes (Stripe, DB, Resend) que impiden ejecutar flujos end-to-end sin configuración/secretos. Se aplicó un fix crítico en el login admin (SSR hydration + cookie) y ahora el endpoint de login responde correctamente en dev.
- Riesgos principales: configuración sensible en `.env` (DB, Stripe), endpoints de admin protegidos por token estático, y código debug/longitud de token expuesto en logs (actualmente sólo en dev).
- Recomendación inmediata: finalizar la auditoría automática y convertir hallazgos P0 en issues/PRs, fijar CI y pruebas de integración mínimas antes de release.

1) Estructura y componentes clave
- Rutas Next (Server Components / API routes): `src/app/api/*` — endpoints REST/Server-Route handlers.
- Root server code: `src/server/**` — utilidades, repositorios, DB clients.
- Middleware: `src/middleware.ts` — protección de rutas admin y comprobación de tokens.
- Utilities: `src/lib/*` — validación, errores, stripe wrapper.
- UI admin: `src/app/admin/*` — `login/page.tsx`, `layout.tsx`.
- Tests: `src/__tests__/*` (vitest/Jest-like) — unitarias e integración.

2) Inventario rápido de endpoints (escaneo inicial)
- Public API
  - `POST /api/orders` — crear orden (público)
  - `POST /api/v1/quotes` — cotizaciones
  - `GET /api/v1/health` — health
  - `GET /api/v1/metrics` — metrics (token opcional)
- Admin API
  - `POST /api/admin/auth/login` — login admin (fix aplicado)
  - `GET /api/admin/orders` — listado admin
  - `GET /api/admin/metrics` — metrics (admin)
  - Varias rutas para `/api/admin/orders/[id]` y `send-email`
- Webhooks
  - `POST /api/webhook/stripe` — stripe webhook handler

3) Hallazgos técnicos (detallado)
- Login admin
  - Problema: Page devolvía `<html>/<body>` anidados => hydration mismatch.
  - Fix: eliminado markup anidado, añadido `credentials: 'same-origin'`, trim() token client/server, middleware excluye POST /api/admin/auth/login.
- Middleware
  - Protege `/admin` y `/api/admin/*`. Modificado para permitir login POST.
  - Recomendación: usar cookies httpOnly y servidor para sesiones; actualmente se mezcla cookie y localStorage en dev.
- Manejo de secrets y config
  - Faltantes: STRIPE_SECRET_KEY, DATABASE_URL y otros provocan `throw new Error(...)` en runtime — esto es por diseño para fallar rápido en dev.
  - Recomendación: documentar `.env.example`, usar `dotenv`/secret manager en CI, y mockear servicios en tests.
- Send-email / Resend
  - Endpoint existe en `src/app/api/orders/[id]/send-email/route.ts` pero depende de configuración de Resend. Requiere wiring y pruebas.
- Código con `throw new Error` indicando work pending
  - `src/lib/stripe.ts`, `src/server/db.ts`, `src/server/platform/config.ts`, `src/server/quotes/repository.ts` entre otros.
  - Estas ubicaciones son prioridades para habilitar flujos E2E.
- Tests
  - Hay tests en `src/__tests__` que indican comportamientos esperados; correr la suite permitirá priorizar fallos.

4) Código muerto / funciones potencialmente no cableadas
(Motivado por búsqueda rápida; requiere herramienta de análisis estático para confirmar)
- Revisar exports sin referencia y archivos con `export const` que no aparecen en imports de runtime.
- Ficheros candidatos para inspección manual:
  - `src/server/quotes/repository.ts` — throws on invalid format
  - `src/lib/stripe.ts` — lanza si falta `STRIPE_SECRET_KEY`
  - `src/server/platform/*` — validaciones que fallan si config incompleta
  - Revisar `src/server/**` para módulos no referenciados por `src/app/api`.

5) Auditoría de seguridad mínima
- Asegurar que `ADMIN_AUTH_TOKEN` no esté versionado y esté en secret store en staging/production.
- Revisar cookies: `httpOnly` activado; en `production` asegurar `secure: true` y ajustar `SameSite` y dominio.
- El endpoint debug (`/api/debug/admin-token`) añadido debe ser eliminado o protegido antes de deploy.
- Remover logs de longitudes y debug en entorno que no sea `development`.

6) Plan de abordaje y tareas priorizadas (P0..P2)
P0 — Lista crítica (go-live)
- P0.1: Hardening auth admin
  - Objetivo: reemplazar token estático con sesión firmada (HMAC/JWT) o mantener token pero documentar rotación y storage seguro.
  - Aceptación: login crea sesión válida, logout invalida, middleware verifica cookie firmada.
- P0.2: Send-email (end-to-end)
  - Objetivo: cablear `send-email` usando Resend (o mock en staging), añadir feature flag `ENABLE_EMAILS`.
  - Aceptación: orden puede enviar email en entorno staging con resultados capturados en logs/tests.
- P0.3: DB readiness
  - Objetivo: confirmar `DATABASE_URL` en staging, controlar migraciones y fallos claros.
  - Aceptación: conectividad DB en staging y tests DB-mocking local.

P1 — Funcionalidad y cobertura
- P1.1: Stripe wiring
  - Objetivo: conectar `src/lib/stripe.ts`, pruebas de webhook y pagos simulados.
- P1.2: Quotes repository drivers
  - Objetivo: garantizar `json` driver y `postgres` driver operativos según `QUOTES_REPOSITORY_DRIVER`.

P2 — Limpieza y refactor
- P2.1: Detectar y eliminar código muerto (exports no usados).
- P2.2: Re-estructurar `src/server` para módulos claros y APIs internas reutilizables.

7) Diseño de tasks (ejemplo con PRs)
- TASK-001 (P0.1): Implementar sesión para admin
  - Modificar `POST /api/admin/auth/login` para emitir cookie firmada (ej: HMAC + timestamp), añadir `POST /api/admin/auth/logout`.
  - Añadir tests unitarios y e2e.
  - Estimación: 1-2 días.

- TASK-002 (P0.2): Wire send-email
  - Añadir adapter `src/server/mailer/resend-adapter.ts`, feature flag `ENABLE_EMAILS` y tests.
  - Estimación: 1 día.

- TASK-003 (P0.3): DB readiness & migrations
  - Añadir check en startup, documentación `.env.example` y script de migraciones.
  - Estimación: 1-2 días.

- TASK-004 (P1.1): Stripe integration
  - Conectar `src/lib/stripe.ts`, tests de webhook y pagos con test keys.
  - Estimación: 1-3 días.

- TASK-005 (P2.1): Código muerto
  - Ejecutar `ts-prune` o similar, crear PR con removals.
  - Estimación: 1 día.

8) Entregables y criterios de aceptación
- Para cada TASK: PR con tests, documentación (README o docs/), y checklist de revisión.
- Integración: CI (vitest + lint) antes de merge a main.

9) Siguientes pasos inmediatos (qué haré si me das OK)
- Ejecutar escaneo automático: listar endpoints, exports no referenciados y archivos con TODO/FIXME y `throw new Error` (JSON + Markdown).
- Generar issues automáticos (plantillas) por cada hallazgo P0.
- Preparar PRs pequeños para P0.1 (auth) y P0.2 (send-email) con tests de humo.

10) Notas operativas
- He añadido temporalmente `src/app/api/debug/admin-token/route.ts` y logging en login para debugging; plan de eliminar antes de producción.
- Cambios aplicados para login: `src/app/admin/login/page.tsx`, `src/app/api/admin/auth/login/route.ts`, `src/middleware.ts`.

---
Si quieres, ahora ejecuto el escaneo automático (genera JSON + Markdown con todos los endpoints, ficheros con `throw new Error`, y posibles exports sin uso), y luego creo las issues/PRs para los P0 listados.
También puedo generar un conjunto de comandos `git` para que confirmes commit y push (no tengo acceso remoto para hacer el push por ti).