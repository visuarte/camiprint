## Guía: Webhooks Stripe, metadata de pagos y verificación Resend

Objetivo: documentar los 3 pasos críticos para producción y pruebas locales:
- Enlazar pagos con órdenes (metadata)
- Verificar dominio en Resend y enviar correo de prueba
- Configurar `STRIPE_WEBHOOK_SECRET` en Vercel y probar webhooks

1) Añadir `orderId` al PaymentIntent / Checkout (para enlazar pagos ↔ órdenes)

- Checkout Session (Node):
```js
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items,
  mode: 'payment',
  success_url,
  cancel_url,
  metadata: { orderId: 'ORD-12345' }
});
```

- PaymentIntent manual (Node):
```js
const pi = await stripe.paymentIntents.create({
  amount,
  currency: 'eur',
  metadata: { orderId: 'ORD-12345' }
});
```

Notas:
- Asegúrate de pasar `orderId` real desde tu backend cuando generes la sesión/PaymentIntent.
- En el webhook (`/api/webhook/stripe`) usa `event.data.object.metadata?.orderId` para buscar la orden.
- Si no existe `orderId`, no provoques error 500: guarda el evento en una cola/pending o responde 200 y loguea la anomalía.

2) Verificar dominio en Resend y enviar email de prueba

- En Resend (https://resend.com):
  1. Domains → Add domain → `camiart.com`
  2. Copia los registros DNS (TXT / DKIM) que te pida Resend y añádelos en tu proveedor DNS
  3. Espera propagación (puedes comprobar con):
```powershell
Resolve-DnsName -Type TXT resend._domainkey.camiart.com
Resolve-DnsName -Type TXT camiart.com
```
  4. Cuando Resend muestre Verified, ya puedes enviar desde `noreply@camiart.com`.

- Envío de prueba (PowerShell):
```powershell
$apiKey = "REPLACE_WITH_YOUR_KEY"
$body = @{ from = "noreply@camiart.com"; to = "tu@correo.com"; subject = "Prueba"; html = "<strong>Prueba</strong>" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.resend.com/emails" -Method Post -Headers @{ Authorization = "Bearer $apiKey"; "Content-Type" = "application/json" } -Body $body -Verbose
```

Si recibes errores de validación, revisa que el dominio esté verificado en Resend.

3) Configurar `STRIPE_WEBHOOK_SECRET` en Vercel y probar producción

- Local (pruebas con Stripe CLI):
  - Autenticar y escuchar:
```powershell
path\to\stripe.exe login
path\to\stripe.exe listen --forward-to http://localhost:3000/api/webhook/stripe
```
  - Stripe CLI mostrará un `webhook signing secret`. Para pruebas locales, copia ese valor en tu `.env` como `STRIPE_WEBHOOK_SECRET` o exportalo en la sesión antes de arrancar el server. No pegues secrets reales en documentación, tickets ni commits:
```powershell
$env:STRIPE_WEBHOOK_SECRET="REPLACE_WITH_LOCAL_STRIPE_WEBHOOK_SECRET"
npm run dev
```
  - Generar evento de prueba:
```powershell
path\to\stripe.exe trigger payment_intent.succeeded
```
  - Verifica en la terminal del dev server que el webhook llegó y el handler devolvió 200.

- Producción (Vercel):
  1. En Vercel Dashboard → Project → Settings → Environment Variables añade:
     - Name: `STRIPE_WEBHOOK_SECRET`
     - Value: (el signing secret real de producción; no lo documentes ni lo compartas por chat)
     - Environment: `Production`
  2. Redeploy o usar `vercel --prod` para forzar deploy.
  3. En Stripe Dashboard → Developers → Webhooks → añade/edita endpoint canónico `https://camiart.com/api/webhook/stripe` y comprueba que el secret coincide.
  4. Compatibilidad: Solo `https://camiart.com/api/webhook/stripe` responde (la ruta plural `/api/webhooks/stripe` se eliminó por ser duplicado).
  5. Reenvía eventos fallidos (`Resend`) desde Stripe Dashboard y revisa logs (`vercel logs --since 1h --prod`).

Incidente y rotación
- Si GitHub o tu proveedor detecta exposición de `STRIPE_WEBHOOK_SECRET`, rota primero el endpoint afectado en Stripe para no romper el flujo actual antes de actualizar entornos.
- Actualiza después `STRIPE_WEBHOOK_SECRET` en Vercel y en tus `.env` locales.
- Verifica en logs de Stripe y Vercel si hubo entregas sospechosas o firmas fallidas fuera de ventanas esperadas.
- Cierra la alerta solo cuando el secret anterior haya quedado revocado.

Prácticas y notas finales
- Mantén distinto secret para test vs prod. No subas secrets a Git.
- Implementa logging mínimo para eventos sin `orderId` y mecanismo de reconciliación.
- Si vas a procesar pagos en background, marca eventos procesados para evitar duplicados.

Archivo creado por automatización: guía para pruebas locales y producción.
