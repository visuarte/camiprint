## Sesion 28 May 2026 - Cierre operativo

- [x] Build Preview validado en Vercel sin exigir `DATABASE_URL`, `ADMIN_AUTH_TOKEN` ni `RESEND_API_KEY`.
- [x] Build Production mantiene validacion estricta de variables criticas.
- [x] Compatibilidad webhook Stripe activa en ruta singular (`/api/webhook/stripe`). Ruta plural `/api/webhooks/stripe` eliminada (era duplicado).
- [x] Endpoint obsoleto con 404 eliminado en Stripe CLI.
- [x] Endpoint legacy duplicado eliminado en Stripe CLI.
- [x] Endpoint webhook final activo: `https://camiart.com/api/webhook/stripe`.
- [x] Trigger de prueba Stripe ejecutado con entrega correcta (`pending_webhooks=0` en evento nuevo).
- [x] Sin fallos recientes de entrega en Stripe (ventana ultimos 10 minutos: 0).
- [x] Higiene de repo aplicada: `public/prod-ca-2021.crt` ignorado en `.gitignore`.

## Pendiente menor

- [ ] Revisar en 24h el panel de Stripe para confirmar que no se reabren fallos por reintentos historicos.

## Template 3 - mapeo 3D publicado

- [x] Publicar online la version inicial de `template-3` con mapeo de imagen sobre el modelo 3D.
- [ ] Arreglar el entorno local antes de seguir iterando: la instalacion de `react`, `react-dom` y `next` quedo incompleta y `npm run dev` no arranca de forma fiable.
- [ ] Revisar y limpiar los procesos `node` colgados / caché npm si vuelve a fallar la instalacion local.

