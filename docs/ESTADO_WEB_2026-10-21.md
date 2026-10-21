# camiart.com — estado de la web (21 Oct 2026, 19:45)

> **ACTUALIZADO 21 oct 22:15 — DECISIÓN DE DIEGO: la web vuelve a MANTENIMIENTO y se queda cerrada de momento, ya con la base de datos nueva montada y verificada.** Retrato medido, no de memoria. Todo lo de abajo está comprobado contra producción
> o contra el disco en el momento que dice la cabecera.
> De cara a decidir el acceso a Supabase: **antes el estado, después la llave.**

---

## 1. Qué es la web

| Sección | Ruta | Qué hace |
|---|---|---|
| Portada | `/` | Presentación de CamiArt |
| Catálogo | `/catalog` | Listado de productos (sale de la base de datos) |
| Ficha de producto | `/product/[slug]` | Detalle + precios por cantidad |
| Diseñador | `/designer` | Mockup / vista previa de la camiseta |
| Carrito y pago | `/cart`, `/checkout` | Stripe |
| Presupuestos | `/api/v1/quotes` | Formulario de presupuesto + aviso por correo |
| Panel | `/admin` | Login (Supabase Auth) + gestión |
| Legales | `/aviso-legal`, `/politica-*`, `/terminos-y-condiciones` | Canon legal web |
| Portfolio y guías | `/portfolio`, `/guia-tallas`, `/impresion-dtf`, `/merchandising-empresas`, `/camisetas-personalizadas` | Contenido/SEO |

## 2. Estado (21 oct, 22:15) — **EN MANTENIMIENTO, cerrada a propósito**

`MAINTENANCE_MODE=1` en Vercel. Las 15 rutas sirven la portada de obras; `/api` sigue respondiendo
(verificado: `/api/products` 200) para poder diagnosticar. La base de datos está viva y sembrada;
lo que está cerrado es la puerta, no el motor.

Comprobado ruta por ruta (15/15): todas sirven la portada de obras con **HTTP 200**.

| | Estado | Detalle |
|---|---|---|
| Dominio | ✅ vivo | `camiart.com`, DNS en Vercel, TLS correcto |
| Páginas | ✅ en obras | `MAINTENANCE_MODE=1` en Vercel Production |
| Marca | ✅ CamiArt | 0 restos de «camiprint» en lo visible |
| Catálogo | ⛔ parado | `/api/products` = **500**: no hay base de datos |
| Panel `/admin` | ⛔ parado | Supabase Auth del proyecto borrado |
| Cron SLA | ⏸ desactivado | `quotes-sla-breach-cron` = `disabled_manually` |
| Avisos de presupuesto | ⚠️ arreglado pero sin probar | ya apuntan a un buzón real (Gmail), falta base de datos para probarlo |

## 3. Por qué está así (causa, no síntoma)

El proyecto Supabase `madcsrixjqvnlaqsovuo` (base de datos **y** autenticación) ya no existe:
su DNS no resuelve. Se borró al cerrar el RLS abierto que tenía una tabla en `public`.
Sin él, la web no tiene de dónde leer el catálogo ni contra quién autenticar el panel.

Lo demás (código, dominio, marca, Stripe, correo) está intacto.

## 4. Qué datos hay y qué no

| Dato | Estado |
|---|---|
| Catálogo de productos | **Se re-siembra** con `scripts/seed-products.mjs` (está en el repo) |
| Presupuestos recibidos | **0 reales** — confirmado por Diego, 21 oct 2026 |
| Pedidos y clientes | 0 reales |
| Usuarios del panel | Solo el de Diego; se recrea |
| Conclusión | **No hay nada que rescatar.** No se persigue la restauración |

## 5. Qué falta para volver a producción

1. Proyecto Supabase **nuevo, región europea**.
2. `alter default privileges` → toda tabla nueva nace **cerrada** (la lección del borrado).
3. `pnpm prisma migrate deploy` + `node scripts/seed-products.mjs`.
4. Actualizar en Vercel las variables que apuntan al proyecto muerto:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL`,
   `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`, `POSTGRES_*`.
5. Verificar **antes de abrir**: `/api/products` 200 · catálogo visible · login del panel ·
   un presupuesto de prueba creado y borrado.
6. Quitar `MAINTENANCE_MODE` → redeploy. Reactivar el cron (`gh workflow enable`).

## 6. Lo que NO está en juego

- **La marca**: CamiArt, decidida en junio; «camiprint» solo sobrevive en identificadores internos y en la redirección 301.
- **El dominio y el SEO**: `camiprint.com` sigue redirigiendo 301 a `camiart.com`.
- **El código**: completo, con migraciones y semilla.
- **La identidad legal**: aviso legal, privacidad, cookies, desistimiento.

## 7. Deudas que siguen abiertas (no bloquean la vuelta)

1. **Resend sin cuota** (la misma cuenta que Brefy): los avisos por correo no salen hasta que se recargue o se cambie de proveedor.
2. **Correo de Auth en plan Free**: sin SMTP propio no se puede personalizar la plantilla del «restablecer contraseña»; saldrá con el remitente genérico de Supabase.
3. **30 de octubre**: el Data API deja de exponer tablas nuevas de `public`. A camiprint le da igual (usa prisma), pero **afecta a tus otros proyectos Supabase vivos** — hay que revisar grants antes de esa fecha.
4. **Página demo** `src/app/supabase/page.tsx` (tabla `todos`): residuo de tutorial, se borra en el proyecto nuevo.
