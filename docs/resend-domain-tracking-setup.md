# Resend Domain Configuration & Tracking Setup

## ✅ Estado Actual

- ✅ **RESEND_API_KEY**: Configurada
- ✅ **RESEND_FROM_EMAIL**: `noreply@camiart.com`
- ✅ **RESEND_FROM_NAME**: `Camiart`
- ⏳ **Dominio**: Requiere verificación en Resend Dashboard

---

## 🔧 Paso 1: Ir al Dashboard de Resend

1. Ve a: **https://dashboard.resend.com**
2. Inicia sesión con tu cuenta

---

## 📋 Paso 2: Agregar Dominio camiart.com

### 2.1 En Resend Dashboard:
1. Click en **"Domains"** (menú izquierdo)
2. Click en **"+ Add Domain"**
3. Ingresa: `camiart.com`
4. Click en **"Add"**

### 2.2 Resend genera 3 DNS Records:

Verás algo como:

```
Record Type  | Name                    | Value
─────────────────────────────────────────────────────────────────
CNAME        | links.camiart.com       | links1.resend-dns.com
CNAME        | bounce.camiart.com      | bounce1.resend-dns.com
TXT          | camiart.com             | v=spf1 include:...
```

---

## 🌐 Paso 3: Configurar DNS Records

### 3.1 En tu proveedor DNS (Namecheap, GoDaddy, etc.):

Copia los 3 records que Resend muestra:

1. **CNAME para links** → `links.camiart.com` → `links1.resend-dns.com`
2. **CNAME para bounce** → `bounce.camiart.com` → `bounce1.resend-dns.com`
3. **TXT para SPF** → `camiart.com` → (copia el valor completo de Resend)

### 3.2 Esperar propagación:

- DNS puede tomar **24-48 horas** para propagarse
- O a veces **15-30 minutos** si tu proveedor es rápido

---

## ✨ Paso 4: Habilitar Tracking

### 4.1 Una vez verificado el dominio:

1. En **Resend Dashboard → Domains → camiart.com**
2. Click en **"Settings"**
3. Activa:
   - ✅ **Open Tracking** (rastrear si se abre el email)
   - ✅ **Click Tracking** (rastrear clics en links)

### 4.2 Resultado:

```
✅ Open Tracking:  Habilitado
✅ Click Tracking: Habilitado
✅ Bounce Management: Automático
```

---

## 🔗 Paso 5: Usar el Dominio en Emails

### 5.1 En el código (ya configurado):

```typescript
// src/server/emails/service.ts
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@camiart.com';
const fromName = process.env.RESEND_FROM_NAME || 'Camiart';

// Resend usa automáticamente el dominio configurado (camiart.com)
const data = await this.resend.emails.send({
  from: `${fromName} <${fromEmail}>`,  // noreply@camiart.com
  to: recipient,
  subject: 'Tu email',
  html: template,
});
```

### 5.2 Ventajas del tracking:

```
📊 En Resend Dashboard puedes ver:
├── 👁️  Opens: Quién abrió el email
├── 🖱️  Clicks: Qué links clickearon
├── ⚠️  Bounces: Emails que no llegaron
└── 📈 Analytics: Estadísticas por dominio
```

---

## 🐛 Troubleshooting: "amazon.com issue"

Si ves error sobre amazon.com:

### Problema:
Resend detectó que el dominio o SPF está mal configurado

### Solución:
1. ✅ Verifica que **camiart.com** sea tu dominio real
2. ✅ Asegúrate que los DNS records están correctos
3. ✅ Espera propagación DNS (24-48h)
4. ✅ En Resend → Click en "Verify Domain" de nuevo

---

## 🚀 Testing Tracking

Una vez verificado, prueba:

```bash
# Enviar email de prueba con tracking
npm run email:test:order -- tu-email@example.com
```

Luego:
1. Abre el email
2. Haz click en un link
3. Ve a **Resend Dashboard → Analytics**
4. ¡Verás registrados el open y el click! 📈

---

## 📝 Resumen de Configuración

| Aspecto | Estado | Acción |
|--------|--------|--------|
| API Key | ✅ | Ya configurada en .env |
| From Email | ✅ | `noreply@camiart.com` |
| Dominio | ⏳ | Agregar en Resend Dashboard |
| DNS Records | ⏳ | Configurar en tu proveedor |
| Tracking | ⏳ | Habilitar en settings |
| Testing | ✅ | Listo con `npm run email:test` |

---

## 🔗 Links Útiles

- **Resend Dashboard**: https://dashboard.resend.com
- **Resend Docs**: https://resend.com/docs
- **Domain Setup Guide**: https://resend.com/docs/features/domain-configuration

---

**Last Updated**: 2026-06-01  
**Status**: Ready for Domain Configuration
