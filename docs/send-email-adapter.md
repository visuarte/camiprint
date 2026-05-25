Send-email adapter (Resend) + feature flag

Resumen
- Hemos unificado el envío de correos usando `emailService` en `src/server/emails/service.ts` (usa Resend SDK cuando `RESEND_API_KEY` está configurado, y cae a logging en dev).
- Añadimos una feature flag `ENABLE_EMAILS` que, cuando se establece a `false`, evita envíos reales y devuelve éxito simulado.

Cambios realizados
- `src/app/api/orders/[id]/send-email/route.ts`
  - Ahora respeta `ENABLE_EMAILS` y usa `emailService.sendOrderConfirmation`.
- `src/app/api/admin/orders/[id]/send-email/route.ts`
  - Reemplazado el uso de `nodemailer` por `emailService`.
  - Construye `OrderConfirmationData` y delega al servicio.

Cómo probar
1. En local (emails activos por defecto):
   - Asegúrate de `RESEND_API_KEY` en tu `.env` para envíos reales, o deja vacío para que se loguee en consola.
   - Llama al endpoint admin: `POST /api/admin/orders/<id>/send-email` con la autorización adecuada.
2. Para desactivar envíos (por ejemplo en CI):
   - Añade `ENABLE_EMAILS=false` en tu entorno; el endpoint respuesta con éxito sin enviar email.

Notas
- `emailService` ya gestiona fallback en dev y logs de preview.
- Recomiendo añadir métricas/logging (event id, message id) cuando Resend confirme envío.

Siguiente paso recomendado
- Añadir tests unitarios para `sendOrderConfirmation` y tests de integración que verifiquen el header `Set-Cookie` en flujos dependientes.
- Añadir feature flag `ENABLE_EMAILS` en Vercel variables si quieres control remoto.