# Camiprint — nueva base de datos (Opción A)

> **21 Oct 2026.** El proyecto Supabase de camiprint (`madcsrixjqvnlaqsovuo`) se borró hoy
> en la limpieza de seguridad: tenía una tabla en `public` **sin RLS**. Al borrarlo, la web
> se quedó sin base de datos: `/api/products` devolvía 500, el panel de admin no podía
> autenticar y el cron de SLA fallaba cada 15 minutos avisando de lo mismo.
>
> **Decisión de Diego:** ir a la **Opción A** (proyecto Supabase nuevo, mismo código) y
> **sacar la web de producción mientras se construye** — `camiart.com` sirve una portada
> de obras (`public/mantenimiento.html`) y el cron queda desactivado.

---

## Lo que YA está hecho (21 oct)

| | Qué | Cómo se comprueba |
|---|---|---|
| 1 | Portada de obras en `public/mantenimiento.html` | abrir camiart.com |
| 2 | Interruptor de obras en `next.config.ts` (`rewrites`, `MAINTENANCE_MODE=1`) | la variable está en Vercel Production |
| 3 | Cron `quotes-sla-breach-cron` desactivado en el repo | `gh workflow list` → *disabled* |
| 4 | Copia de seguridad del `.env` productivo: no hay datos que guardar (el proyecto está borrado) | — |
| 5 | Avisos de presupuesto: `QUOTES_NOTIFICATION_EMAIL` (Vercel, Production) apunta a un buzón real | antes iban a `hola@camiprint.com`, dominio **sin MX** → rebotaban |

### 21 oct 2026, 21:00 — la Opción A está HECHA (proyecto `ymansresyxotrmjjriuv`, eu-central-1)

| | Qué | Prueba |
|---|---|---|
| 1 | Proyecto nuevo en Supabase (Europa) | API: `ACTIVE_HEALTHY` |
| 2 | 18 tablas del esquema + `_prisma_migrations` con las 4 migraciones y sus checksums | `select count(*) from pg_tables` = 20 |
| 3 | **RLS cerrado en todas** | tablas sin RLS = **0** · políticas = **0** |
| 4 | `alter default privileges`: toda tabla nueva nace cerrada | ejecutado |
| 5 | Catálogo sembrado | 48 filas en `Product` |
| 6 | 15 variables actualizadas en Vercel (las públicas, en `vercel.json`) | `vercel env ls` |
| 7 | Web **fuera de obras** | `/`, `/catalog` 200 con su título real |
| 8 | Catálogo vivo | `/api/products` 200 · `/api/v1/gor-catalog` 200 (409 modelos) |
| 9 | Presupuesto de punta a punta | POST → 201 · fila en `Quote` · **borrada** después |
| 10 | Cron reactivado y en verde | run `39657100651` → success (9 s) |

> El modo obras se apaga **borrando la variable** `MAINTENANCE_MODE` en Vercel (hecho). No hay que
> revertir código, y el historial de git queda entero.

### Pendiente tras la A

1. **Rotar la contraseña de la base** desde el dashboard (Settings → Database → Reset password): la
   contraseña apareció en una traza de depuración de Prisma mientras se diagnosticaba la conexión.
   El rol `postgres` del proyecto **no es superusuario**, así que no se puede cambiar por SQL.
2. **Revocar el token de Supabase** usado para el montaje (Account → Access Tokens).
3. **Resend**: la cuota mensual está agotada (cuenta compartida con Brefy) — los avisos por correo
   no salen hasta recargar o cambiar de proveedor.

---

## Paso 0 — decisión previa: ¿hay datos que rescatar?

El proyecto Supabase está borrado y su DNS no resuelve. Supabase permite **restaurar un
proyecto eliminado durante un tiempo** desde el dashboard (Projects → *deleted projects*).

- **Si aparece** → restaurar y **saltar al Paso 3** (solo hay que arreglar RLS y variables).
- **Si no aparece** → Paso 1: proyecto nuevo; el catálogo se re-siembra con
  `scripts/seed-products.mjs`. **Se pierden** presupuestos, pedidos, clientes y usuarios
  que vivieran solo ahí.

---

## Paso 1 — crear el proyecto nuevo

En el dashboard de Supabase (**región europea**, `eu-west-1` o `eu-central-1`):

1. New project → nombre `camiprint`, región europea, contraseña de base de datos fuerte
   (guardarla en el gestor de claves, no en el repo).
2. Anotar el **project ref** (los 20 caracteres del subdominio).

## Paso 2 — RLS desde el minuto uno (la lección de esta semana)

En el SQL editor, **antes** de meter datos:

```sql
-- Toda tabla nueva nace cerrada.
alter default privileges in schema public
  revoke all on tables from anon, authenticated;
```

Y después de `prisma migrate deploy`, comprobar que **ninguna** tabla queda abierta:

```sql
select tablename, rowsecurity
from pg_tables where schemaname = 'public' and rowsecurity = false;
-- debe devolver 0 filas
```

Regla: el acceso a datos va por `prisma` desde el servidor (service role / conexión directa).
`anon` no necesita leer nada. Una política `using (true)` es exactamente lo que se borró hoy.

## Paso 3 — migrar el esquema y sembrar

```bash
export DATABASE_URL="postgresql://postgres.<ref>:<pass>@aws-0-eu-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.<ref>:<pass>@aws-0-eu-<region>.pooler.supabase.com:5432/postgres"
pnpm prisma migrate deploy
node scripts/seed-products.mjs        # catálogo
```

> Si el Paso 0 dio un proyecto restaurado, esto se salta.

## Paso 4 — variables en Vercel (Production)

Hay que cambiar **las que apuntan al proyecto muerto**. En el proyecto `camiprint`:

| Variable | De dónde sale |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | dashboard → API keys (publishable) |
| `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY` | idem |
| `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | dashboard → API keys (secret) |
| `SUPABASE_JWT_SECRET` | dashboard → Settings → API → JWT |
| `DATABASE_URL` (pooler 6543), `POSTGRES_PRISMA_URL` | cadena con `?pgbouncer=true` |
| `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL` (5432) | cadena directa |
| `POSTGRES_HOST` / `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DATABASE` | datos del proyecto |

## Paso 5 — volver a producción (en este orden)

1. Quitar `MAINTENANCE_MODE` de Vercel → redeploy.
2. Probar **antes de cantar victoria**:
   - `curl -s -o /dev/null -w '%{http_code}' https://camiart.com/api/products` → **200**
   - catálogo visible en `/` y una ficha de producto
   - login del panel `/admin` (Supabase Auth del proyecto nuevo)
   - crear un presupuesto de prueba y borrarlo
3. Reactivar el cron: `gh workflow enable quotes-sla-breach-cron.yml`
4. Ejecutarlo a mano una vez (`gh workflow run`) y ver el 200 en verde.

---

## Guardas que no se saltan

- **Nada de RLS abierto.** Si una tabla necesita lectura pública, se abre **la tabla** con
  una política explícita de solo lectura sobre las columnas públicas, no `using (true)` en
  todo el esquema.
- **`service_role` / secret key nunca en el navegador** (`NEXT_PUBLIC_*` jamás).
- **No se publica nada hasta que `/api/products` responda 200** y el panel entre.
- La contraseña de la base y las claves nuevas van al gestor, no al repo ni al chat.
