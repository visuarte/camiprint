# Resend Email Configuration Guide

## Overview

Camiprint uses **Resend** for reliable transactional email delivery. Resend is a modern email service optimized for developers and works seamlessly with Vercel.

## Setup Steps

### 1. Create Resend Account

1. Go to https://resend.com
2. Sign up with your email
3. Verify your email address

### 2. Get API Key

1. Go to https://resend.com/api-keys
2. Copy your API key (starts with `re_`)
3. Keep it safe - never commit it to Git

### 3. Configure Environment Variables

#### Local Development (.env.local)
```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@camiart.com
RESEND_FROM_NAME=Camiart
```

#### Vercel Production (Dashboard)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Go to **Settings → Environment Variables**
3. Add three variables:

| Variable | Value | Type |
|----------|-------|------|
| `RESEND_API_KEY` | Your API key from Resend | Secret |
| `RESEND_FROM_EMAIL` | `noreply@camiart.com` | Plain |
| `RESEND_FROM_NAME` | `Camiart` | Plain |

4. Click **Add** for each variable
5. Click **Redeploy** to apply changes

### 4. Verify Sender Email (Optional but Recommended)

For production, Resend recommends verifying your sender email domain:

1. In Resend Dashboard → Domains
2. Add your domain (e.g., camiart.com)
3. Follow DNS verification steps
4. Update `RESEND_FROM_EMAIL` to use your domain (e.g., `noreply@camiprint.com`)

## Testing Email Delivery

### Local Testing

```bash
# Run integration tests
npm run test:integration

# This includes email sending tests
```

### Manual Testing in Vercel

1. Deploy to Vercel (automatically happens on git push)
2. Visit your production app
3. Place a test order with a valid email
4. Check that order confirmation email arrives

### Troubleshooting

**Email not received?**
- Check spam/junk folder
- Verify `RESEND_API_KEY` is set in Vercel Dashboard
- Check Vercel function logs: Deployments → Runtime Logs
- Use Resend Dashboard to view email delivery status

**Invalid sender email?**
- Ensure `RESEND_FROM_EMAIL` is valid format
- For production, verify domain in Resend Dashboard first

**Development mode (no actual send)?**
- If `RESEND_API_KEY` is not set, emails log to console
- Useful for local development without API calls

## Email Templates

Order confirmation emails are sent with:
- **Subject**: `Confirmación de Pedido #[ORDER_ID]`
- **Template**: Responsive HTML email
- **Includes**: 
  - Order number
  - Customer details
  - Items ordered with quantities and prices
  - Total amount
  - Shipping address

Template is in: [`src/server/emails/templates.ts`](../src/server/emails/templates.ts)

## API Reference

### Resend API Features Used

- `resend.emails.send()` - Send transactional emails
- Parameters:
  - `from`: Sender address and name
  - `to`: Recipient email
  - `subject`: Email subject
  - `html`: Email content (HTML format)
  - `replyTo`: Reply-to address (optional)

### Response Handling

Success:
```json
{
  "data": {
    "id": "email_id_12345"
  },
  "error": null
}
```

Error:
```json
{
  "data": null,
  "error": {
    "message": "Error description"
  }
}
```

## Pricing

- **Free tier**: 100 emails/day
- **Pay as you go**: $0.20 per 1,000 emails after free tier
- Perfect for MVP and startup phase

See https://resend.com/pricing

## Migration from Nodemailer

Changed from SMTP (Nodemailer) to Resend because:

| Feature | Nodemailer | Resend |
|---------|-----------|--------|
| Setup | Requires SMTP config | Just API key |
| Reliability | Depends on SMTP host | Dedicated service |
| Deliverability | May have issues | Industry-leading |
| Development | Needs MailHog/etc | Console fallback |
| Production | Requires email service | Built-in |
| Cost | Varies | $0.20/1k emails |

## References

- Resend Docs: https://resend.com/docs
- Resend API: https://resend.com/docs/api
- Vercel Integration: https://vercel.com/integrations/resend

---

**Last Updated**: 2026-05-19  
**Status**: ✅ Production Ready  
**Tests**: ✅ 24/24 integration tests passing
