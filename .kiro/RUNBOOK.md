# Runbook de Incidentes â€” CAMIART API Cotizaciones

> VersiÃ³n: 1.0 Â· Fecha: 2026-05-19  
> Audiencia: On-call engineers

---

## Endpoints de referencia rÃ¡pida

| Endpoint | PropÃ³sito |
|---|---|
| `GET /api/v1/health` | Estado de la app y DB |
| `GET /api/v1/metrics` | MÃ©tricas runtime (Bearer token) |
| `POST /api/v1/quotes` | Captura de cotizaciones |

---

## 1. Error rate alto (> 5% de requests con 5xx)

**SÃ­ntomas:** MÃºltiples respuestas 500/503 en logs o dashboard.

**DiagnÃ³stico:**

```bash
# 1. Verificar salud de la app
curl https://camiart.com/api/v1/health

# 2. Ver mÃ©tricas de errores
curl -H "Authorization: Bearer $METRICS_TOKEN" https://camiart.com/api/v1/metrics

# 3. Buscar errores en logs de Vercel filtrando por requestId
#    Vercel Dashboard â†’ Functions â†’ Logs â†’ filtrar por level:error
```

**Acciones:**

1. Si `/health` devuelve 503 con `db: down` â†’ ver secciÃ³n 3 (DB down).
2. Si el circuit breaker estÃ¡ abierto, esperar 30 segundos y re-verificar.
3. Si el error es `INTERNAL_ERROR` consistente, revisar los Ãºltimos commits y hacer rollback si es necesario.

**Rollback de emergencia:**
```bash
# Desactivar API sin re-deploy
# En Vercel Dashboard â†’ Settings â†’ Environment Variables
# Cambiar NEXT_PUBLIC_QUOTES_API_ENABLED = false
# El formulario vuelve a simular Ã©xito sin llamar al backend
```

---

## 2. Latencia alta (p95 > 1000ms)

**SÃ­ntomas:** `/api/v1/metrics` muestra `p95 > 1000` en `quotes.request_duration_ms`.

**DiagnÃ³stico:**

```bash
# Ver histograma de duraciÃ³n
curl -H "Authorization: Bearer $METRICS_TOKEN" https://camiart.com/api/v1/metrics \
  | grep duration

# Verificar latencia de DB desde health
curl https://camiart.com/api/v1/health | jq '.checks'
```

**Causas comunes:**

| Causa | SÃ­ntoma | SoluciÃ³n |
|---|---|---|
| ConexiÃ³n DB lenta | `db.durationMs > 500` en health | Verificar plan DB, Ã­ndices |
| Cold start Vercel | Solo primeras requests | Normal; considerar warmup |
| Payload grande | requests con `413` cercanos | Revisar validaciÃ³n size |
| Rate limit store saturado | `in_flight_requests` alto | Revisar concurrencia |

---

## 3. Health check DOWN (503 en /api/v1/health)

**SÃ­ntomas:** `{ "status": "down", "checks": [{ "name": "db", "status": "down" }] }`

**DiagnÃ³stico:**

```bash
# Verificar conectividad con DB (desde panel del proveedor o psql)
psql $DATABASE_URL -c "SELECT 1;"

# Ver si el circuit breaker estÃ¡ abierto
curl https://camiart.com/api/v1/health | jq '.checks'
```

**Acciones:**

1. **DB inaccesible:** Verificar que el servicio PostgreSQL (Vercel Postgres / Neon / Supabase) estÃ¡ activo.
2. **Credenciales invÃ¡lidas:** Verificar `DATABASE_URL` en variables de entorno de Vercel.
3. **SSL requerido:** Confirmar que `DATABASE_URL` incluye `?sslmode=require` si el proveedor lo exige.
4. **Circuit breaker abierto:** Esperar 30 segundos; el circuit breaker pasa a half-open automÃ¡ticamente.

```bash
# Una vez restaurada la DB, verificar que el circuit se cierra
watch -n 5 'curl -s https://camiart.com/api/v1/health | jq .status'
```

---

## 4. Rate limiting excesivo (> 10% de requests â†’ 429)

**SÃ­ntomas:** `quotes.rate_limited.count` creciendo rÃ¡pido; usuarios reales bloqueados.

**DiagnÃ³stico:**

```bash
# Ver contadores de rate limit
curl -H "Authorization: Bearer $METRICS_TOKEN" https://camiart.com/api/v1/metrics \
  | grep rate_limited
```

**Causas y acciones:**

- **Bot / scraper:** Analizar `x-forwarded-for` en los logs de Vercel para identificar IPs ofensoras. Bloquear en Vercel Edge Config o Firewall.
- **TRUSTED_PROXY_COUNT incorrecto:** Si se estÃ¡ capturando la IP del proxy en vez del cliente real, ajustar `TRUSTED_PROXY_COUNT` en las variables de entorno.
- **LÃ­mite muy restrictivo:** El lÃ­mite actual es 5 req/60s por IP. Si hay usuarios legÃ­timos afectados, evaluar aumentarlo (cambiar en `src/server/http/rate-limit.ts`).

---

## 5. Leads perdidos (cotizaciones no guardadas)

**SÃ­ntomas:** Usuarios reportan envÃ­o exitoso pero no aparece en DB.

**DiagnÃ³stico:**

```bash
# Buscar en logs un requestId especÃ­fico reportado por el usuario
# Vercel Dashboard â†’ Functions â†’ Logs â†’ buscar el requestId

# Consultar DB directamente
psql $DATABASE_URL -c "SELECT id, email, created_at FROM quotes ORDER BY created_at DESC LIMIT 20;"
```

**Acciones:**

1. Si el log muestra 201 pero la DB no tiene el registro â†’ posible timeout post-escritura o rollback silencioso. Revisar logs con nivel `error` en torno al mismo timestamp.
2. Si el log muestra 503 â†’ el circuit breaker estaba abierto; el lead NO se guardÃ³. Informar al usuario para que reintente.
3. El frontend muestra el `requestId` en errores; pedirlo al usuario para cruzar con logs.

---

## 6. PÃ©rdida de datos en restart

**VerificaciÃ³n:**

```bash
# Confirmar que el driver es postgres (no json)
curl https://camiart.com/api/v1/health | jq '.checks[] | select(.name=="db")'

# Si usa json driver (desarrollo) los datos NO persisten en Vercel (sistema de archivos efÃ­mero)
# Verificar variable: QUOTES_REPOSITORY_DRIVER=postgres en Vercel
```

---

## 7. Comandos Ãºtiles de debugging

```bash
# Health completo con jq
curl -s https://camiart.com/api/v1/health | jq .

# MÃ©tricas formateadas (Prometheus format)
curl -s -H "Authorization: Bearer $METRICS_TOKEN" https://camiart.com/api/v1/metrics

# Enviar cotizaciÃ³n de prueba manual
curl -s -X POST https://camiart.com/api/v1/quotes \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: debug_manual_$(date +%s)" \
  -d '{"name":"Debug Test","email":"debug@test.com","phone":"+34 600 000 000","companyName":"Debug Corp","quantity":"10-24"}' \
  | jq .

# Ejecutar smoke tests completos
BASE_URL=https://camiart.com METRICS_TOKEN=xxx npm run smoke:prod

# Migraciones (si se aÃ±aden nuevas)
DATABASE_URL=postgresql://... npm run db:migrate
```

---

## 8. EscalaciÃ³n

| Nivel | Trigger | Contacto |
|---|---|---|
| L1 | Error rate > 5% por 5 min | On-call dev |
| L2 | DB down > 10 min, pÃ©rdida de leads confirmada | Equipo tÃ©cnico + CTO |
| L3 | Brecha de seguridad o datos de clientes expuestos | CTO + DPO inmediatamente |

---

## 9. Checklist de resoluciÃ³n post-incidente

- [ ] Identificar causa raÃ­z con `requestId` del incidente
- [ ] Confirmar que no hubo pÃ©rdida de leads (consultar DB)
- [ ] Verificar que `/api/v1/health` vuelve a `status: ok`
- [ ] Actualizar runbook con nueva causa si no estaba documentada
- [ ] Crear issue para prevenir recurrencia

---

## 10. Variables de entorno de producciÃ³n

| Variable | DescripciÃ³n | Valor producciÃ³n |
|---|---|---|
| `DATABASE_URL` | ConexiÃ³n PostgreSQL | Vercel Postgres connection string |
| `QUOTES_REPOSITORY_DRIVER` | Driver de persistencia | `postgres` |
| `RATE_LIMIT_STORE_DRIVER` | Store de rate limit | `memory` (single replica) o `redis` |
| `REDIS_URL` | Redis para rate limit multi-replica | `redis://...` (si aplica) |
| `METRICS_TOKEN` | Token Bearer para `/api/v1/metrics` | Secret generado con `openssl rand -hex 32` |
| `LOG_LEVEL` | Nivel de log pino | `info` |
| `TRUSTED_PROXY_COUNT` | Proxies delante de la app | `1` (Vercel tiene 1 proxy) |
| `ALLOWED_ORIGINS` | CORS whitelist | `https://camiart.com,https://www.camiart.com` |
| `NEXT_PUBLIC_QUOTES_API_ENABLED` | Feature flag API | `true` |
