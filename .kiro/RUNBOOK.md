# Runbook de Incidentes — Camiprint API Cotizaciones

> Versión: 1.0 · Fecha: 2026-05-19  
> Audiencia: On-call engineers

---

## Endpoints de referencia rápida

| Endpoint | Propósito |
|---|---|
| `GET /api/v1/health` | Estado de la app y DB |
| `GET /api/v1/metrics` | Métricas runtime (Bearer token) |
| `POST /api/v1/quotes` | Captura de cotizaciones |

---

## 1. Error rate alto (> 5% de requests con 5xx)

**Síntomas:** Múltiples respuestas 500/503 en logs o dashboard.

**Diagnóstico:**

```bash
# 1. Verificar salud de la app
curl https://camiprint.com/api/v1/health

# 2. Ver métricas de errores
curl -H "Authorization: Bearer $METRICS_TOKEN" https://camiprint.com/api/v1/metrics

# 3. Buscar errores en logs de Vercel filtrando por requestId
#    Vercel Dashboard → Functions → Logs → filtrar por level:error
```

**Acciones:**

1. Si `/health` devuelve 503 con `db: down` → ver sección 3 (DB down).
2. Si el circuit breaker está abierto, esperar 30 segundos y re-verificar.
3. Si el error es `INTERNAL_ERROR` consistente, revisar los últimos commits y hacer rollback si es necesario.

**Rollback de emergencia:**
```bash
# Desactivar API sin re-deploy
# En Vercel Dashboard → Settings → Environment Variables
# Cambiar NEXT_PUBLIC_QUOTES_API_ENABLED = false
# El formulario vuelve a simular éxito sin llamar al backend
```

---

## 2. Latencia alta (p95 > 1000ms)

**Síntomas:** `/api/v1/metrics` muestra `p95 > 1000` en `quotes.request_duration_ms`.

**Diagnóstico:**

```bash
# Ver histograma de duración
curl -H "Authorization: Bearer $METRICS_TOKEN" https://camiprint.com/api/v1/metrics \
  | grep duration

# Verificar latencia de DB desde health
curl https://camiprint.com/api/v1/health | jq '.checks'
```

**Causas comunes:**

| Causa | Síntoma | Solución |
|---|---|---|
| Conexión DB lenta | `db.durationMs > 500` en health | Verificar plan DB, índices |
| Cold start Vercel | Solo primeras requests | Normal; considerar warmup |
| Payload grande | requests con `413` cercanos | Revisar validación size |
| Rate limit store saturado | `in_flight_requests` alto | Revisar concurrencia |

---

## 3. Health check DOWN (503 en /api/v1/health)

**Síntomas:** `{ "status": "down", "checks": [{ "name": "db", "status": "down" }] }`

**Diagnóstico:**

```bash
# Verificar conectividad con DB (desde panel del proveedor o psql)
psql $DATABASE_URL -c "SELECT 1;"

# Ver si el circuit breaker está abierto
curl https://camiprint.com/api/v1/health | jq '.checks'
```

**Acciones:**

1. **DB inaccesible:** Verificar que el servicio PostgreSQL (Vercel Postgres / Neon / Supabase) está activo.
2. **Credenciales inválidas:** Verificar `DATABASE_URL` en variables de entorno de Vercel.
3. **SSL requerido:** Confirmar que `DATABASE_URL` incluye `?sslmode=require` si el proveedor lo exige.
4. **Circuit breaker abierto:** Esperar 30 segundos; el circuit breaker pasa a half-open automáticamente.

```bash
# Una vez restaurada la DB, verificar que el circuit se cierra
watch -n 5 'curl -s https://camiprint.com/api/v1/health | jq .status'
```

---

## 4. Rate limiting excesivo (> 10% de requests → 429)

**Síntomas:** `quotes.rate_limited.count` creciendo rápido; usuarios reales bloqueados.

**Diagnóstico:**

```bash
# Ver contadores de rate limit
curl -H "Authorization: Bearer $METRICS_TOKEN" https://camiprint.com/api/v1/metrics \
  | grep rate_limited
```

**Causas y acciones:**

- **Bot / scraper:** Analizar `x-forwarded-for` en los logs de Vercel para identificar IPs ofensoras. Bloquear en Vercel Edge Config o Firewall.
- **TRUSTED_PROXY_COUNT incorrecto:** Si se está capturando la IP del proxy en vez del cliente real, ajustar `TRUSTED_PROXY_COUNT` en las variables de entorno.
- **Límite muy restrictivo:** El límite actual es 5 req/60s por IP. Si hay usuarios legítimos afectados, evaluar aumentarlo (cambiar en `src/server/http/rate-limit.ts`).

---

## 5. Leads perdidos (cotizaciones no guardadas)

**Síntomas:** Usuarios reportan envío exitoso pero no aparece en DB.

**Diagnóstico:**

```bash
# Buscar en logs un requestId específico reportado por el usuario
# Vercel Dashboard → Functions → Logs → buscar el requestId

# Consultar DB directamente
psql $DATABASE_URL -c "SELECT id, email, created_at FROM quotes ORDER BY created_at DESC LIMIT 20;"
```

**Acciones:**

1. Si el log muestra 201 pero la DB no tiene el registro → posible timeout post-escritura o rollback silencioso. Revisar logs con nivel `error` en torno al mismo timestamp.
2. Si el log muestra 503 → el circuit breaker estaba abierto; el lead NO se guardó. Informar al usuario para que reintente.
3. El frontend muestra el `requestId` en errores; pedirlo al usuario para cruzar con logs.

---

## 6. Pérdida de datos en restart

**Verificación:**

```bash
# Confirmar que el driver es postgres (no json)
curl https://camiprint.com/api/v1/health | jq '.checks[] | select(.name=="db")'

# Si usa json driver (desarrollo) los datos NO persisten en Vercel (sistema de archivos efímero)
# Verificar variable: QUOTES_REPOSITORY_DRIVER=postgres en Vercel
```

---

## 7. Comandos útiles de debugging

```bash
# Health completo con jq
curl -s https://camiprint.com/api/v1/health | jq .

# Métricas formateadas (Prometheus format)
curl -s -H "Authorization: Bearer $METRICS_TOKEN" https://camiprint.com/api/v1/metrics

# Enviar cotización de prueba manual
curl -s -X POST https://camiprint.com/api/v1/quotes \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: debug_manual_$(date +%s)" \
  -d '{"name":"Debug Test","email":"debug@test.com","phone":"+34 600 000 000","companyName":"Debug Corp","quantity":"10-24"}' \
  | jq .

# Ejecutar smoke tests completos
BASE_URL=https://camiprint.com METRICS_TOKEN=xxx npm run smoke:prod

# Migraciones (si se añaden nuevas)
DATABASE_URL=postgresql://... npm run db:migrate
```

---

## 8. Escalación

| Nivel | Trigger | Contacto |
|---|---|---|
| L1 | Error rate > 5% por 5 min | On-call dev |
| L2 | DB down > 10 min, pérdida de leads confirmada | Equipo técnico + CTO |
| L3 | Brecha de seguridad o datos de clientes expuestos | CTO + DPO inmediatamente |

---

## 9. Checklist de resolución post-incidente

- [ ] Identificar causa raíz con `requestId` del incidente
- [ ] Confirmar que no hubo pérdida de leads (consultar DB)
- [ ] Verificar que `/api/v1/health` vuelve a `status: ok`
- [ ] Actualizar runbook con nueva causa si no estaba documentada
- [ ] Crear issue para prevenir recurrencia

---

## 10. Variables de entorno de producción

| Variable | Descripción | Valor producción |
|---|---|---|
| `DATABASE_URL` | Conexión PostgreSQL | Vercel Postgres connection string |
| `QUOTES_REPOSITORY_DRIVER` | Driver de persistencia | `postgres` |
| `RATE_LIMIT_STORE_DRIVER` | Store de rate limit | `memory` (single replica) o `redis` |
| `REDIS_URL` | Redis para rate limit multi-replica | `redis://...` (si aplica) |
| `METRICS_TOKEN` | Token Bearer para `/api/v1/metrics` | Secret generado con `openssl rand -hex 32` |
| `LOG_LEVEL` | Nivel de log pino | `info` |
| `TRUSTED_PROXY_COUNT` | Proxies delante de la app | `1` (Vercel tiene 1 proxy) |
| `ALLOWED_ORIGINS` | CORS whitelist | `https://camiprint.com,https://www.camiprint.com` |
| `NEXT_PUBLIC_QUOTES_API_ENABLED` | Feature flag API | `true` |
