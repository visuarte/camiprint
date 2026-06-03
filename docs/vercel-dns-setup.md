# 🔧 Configurar DNS en Vercel para Resend - Guía Paso a Paso

## 📊 Estado Actual

```
Domain:     camiart.com
Status:     ⏳ PARTIALLY_VERIFIED
Sending:    ✅ Enabled
Receiving:  ❌ Disabled
```

---

## 🚀 PASO 1: Ir a Vercel Dashboard

1. Abre: **https://vercel.com/dashboard**
2. Login con tu cuenta
3. Selecciona el proyecto de **CamiArt**

---

## 🔗 PASO 2: Acceder a Dominios

1. Click en **"Settings"** (engranaje en la parte superior)
2. En el menú izquierdo, click en **"Domains"**
3. Busca **camiart.com** en la lista

---

## ✏️ PASO 3: Editar DNS Records

1. Junto a **camiart.com**, busca el botón **"Edit"** o el menú (**...**)
2. Click en **"Edit DNS Records"** o **"Manage DNS"**
3. Deberías ver una lista de records actuales

---

## 📝 PASO 4: Agregar Primer Record (CNAME - Links)

Haz click en **"+ Add Record"** o similar:

```
Type:        CNAME
Name:        links
Target:      links1.resend-dns.com
TTL:         3600 (default)
Priority:    (dejar en blanco)
```

Luego click en **"Save"** o **"Add"**

---

## 📝 PASO 5: Agregar Segundo Record (CNAME - Bounce)

Haz click en **"+ Add Record"** nuevamente:

```
Type:        CNAME
Name:        bounce
Target:      bounce1.resend-dns.com
TTL:         3600 (default)
Priority:    (dejar en blanco)
```

Luego click en **"Save"** o **"Add"**

---

## 📝 PASO 6: Agregar Tercer Record (TXT - DMARC)

Haz click en **"+ Add Record"** nuevamente:

```
Type:        TXT
Name:        _dmarc
Value:       v=DMARC1; p=quarantine; rua=mailto:admin@camiart.com
TTL:         3600 (default)
```

Luego click en **"Save"** o **"Add"**

---

## ✅ PASO 7: Verificar en Resend

Después de agregar los records en Vercel:

1. Espera **10-30 minutos** (Vercel propaga rápido)
2. Ejecuta en terminal:
   ```bash
   node scripts/check-domain-status.mjs
   ```
3. Verás que el status cambió de `partially_verified` a `verified`

---

## 🎯 Resultado Final

Una vez verificado completamente:

```
✅ Status: VERIFIED
✅ Click Tracking: Activo
✅ Open Tracking: Activo
✅ DMARC: Configurado
✅ Emails a Gmail: ¡Sin problemas!
```

---

## 🔍 Troubleshooting

Si después de 1 hora sigue `partially_verified`:

1. **Verifica que escribiste correctamente:**
   - `links` (no `links.camiart.com`)
   - `bounce` (no `bounce.camiart.com`)
   - `_dmarc` (con el guion bajo)

2. **Verifica los valores exactos:**
   - No pongas `www.` al inicio
   - No agregueshttps://
   - Copia/pega el valor exacto

3. **En Vercel, los records pueden tardar:**
   - Espera 15-30 minutos después de guardar
   - Luego ejecuta: `node scripts/check-domain-status.mjs`

---

## 📊 Monitorea el Progreso

```bash
# Ver estado actual cada minuto
watch -n 60 'node scripts/check-domain-status.mjs'

# O ejecuta manualmente:
node scripts/check-domain-status.mjs
```

---

**¡Una vez verificado, los emails funcionarán perfectamente!** 🎉
