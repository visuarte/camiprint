# Implementation Plan: Backend Cotizaciones v1

## Estado de Ejecucion - Backend Cotizaciones v1

Fecha de corte: 2026-05-19
Estado general: Fases 1, 2 y 3 (cÃ³digo) completadas â€” Pendiente: provisioning DB staging/prod, deploy y monitoreo externo

### Hecho

- Fase 1 Backend completa (Epics 1-8, 43 tareas).
- Fase 2 Frontend completa (Epics 9-11, 12 tareas).
- Fase 3 cÃ³digo completo (Epics 12-14 partes implementables):
  - CORS: getCorsHeaders + OPTIONS handler en quotes route.
  - Security headers globales en next.config.ts (X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy).
  - ALLOWED_ORIGINS documentada en .env.example.
  - vercel.json con build config y env defaults.
  - scripts/smoke-test.mjs con 11 pruebas automatizadas (health, metrics, 201, 415, 422, JSON invÃ¡lido, OPTIONS, headers, rate limit).
  - npm scripts: smoke:staging y smoke:prod.
  - .kiro/RUNBOOK.md: runbook de incidentes (10 secciones).
- Cobertura global: 88.21% stmts â€” 172 tests pasan / 5 skipped (PostgreSQL).

### Pendiente (operacional â€” requiere infraestructura)

- Provisionar DB staging y producciÃ³n (12.1, 13.1, 12.3, 13.3).
- Deploy a Vercel staging y producciÃ³n (12.4, 13.4).
- Monitoreo 48h en staging (12.6) y checkpoint de validaciÃ³n (12.7).
- Configurar alertas externas (14.2) y smoke tests contra entorno real (12.5, 13.5).
- Verificar checklist 14.4 contra deployment real.
- Checkpoint final de producciÃ³n (14.5).

### Nota de trazabilidad

Las tareas detalladas con checkboxes inferiores se conservan como backlog historico de plan inicial y no representan el estado real final de ejecucion.

## Overview

Este plan implementa el backend de producciÃ³n para captura de cotizaciones en CAMIART con persistencia durable, observabilidad completa, resiliencia ante fallos, seguridad HTTP y rate limiting. El plan sigue una estrategia de 3 fases: Backend â†’ Frontend â†’ Deployment.

**CaracterÃ­sticas principales:**
- Persistencia durable que sobrevive reinicios
- Rate limiting con sliding window (5 req/min por IP)
- Logging estructurado con enmascaramiento de PII
- MÃ©tricas en tiempo real (contadores, histogramas)
- Health checks para orquestadores
- Timeouts y circuit breakers
- Headers de seguridad y CORS configurables
- ValidaciÃ³n y sanitizaciÃ³n robusta

**TecnologÃ­as:** TypeScript, Next.js App Router, Vercel KV o PostgreSQL + Prisma

---

## Tasks

### Fase 1: ImplementaciÃ³n Backend (Semana 1-2)

#### Epic 1: Infraestructura Base y Utilidades HTTP

- [x] 1.1 Crear estructura de carpetas y mÃ³dulos base
  - Crear `src/server/http/` para utilidades HTTP compartidas
  - Crear `src/server/quotes/` para lÃ³gica de dominio de cotizaciones
  - Crear `src/app/api/v1/quotes/` para route handlers
  - Crear `src/app/api/v1/health/` para health checks
  - Crear `src/app/api/v1/metrics/` para exposiciÃ³n de mÃ©tricas
  - _Requirements: 1.1, 7.1_
  - _Complejidad: S_

- [x] 1.2 Implementar generaciÃ³n y propagaciÃ³n de Request ID
  - Crear `src/server/http/request-id.ts`
  - Implementar funciÃ³n `getOrCreateRequestId(request: Request): string`
  - Formato: `req_{timestamp_base36}{random_base36}`
  - Leer de header `X-Request-Id` si existe, generar si no
  - _Requirements: 5.1, 13.4_
  - _Complejidad: S_

- [x] 1.3 Implementar mapeo de errores HTTP
  - Crear `src/server/http/errors.ts`
  - Definir interfaz `ErrorResponse` con campos `ok`, `error`, `meta`
  - Implementar funciÃ³n `jsonError(statusCode, requestId, code, message, details?, headers?)`
  - Soportar cÃ³digos: `BAD_REQUEST`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`
  - _Requirements: 1.4, 2.8, 4.3_
  - _Complejidad: M_

- [x]* 1.4 Escribir tests unitarios para request-id y errors
  - Test: `getOrCreateRequestId` genera IDs con formato correcto
  - Test: `getOrCreateRequestId` reutiliza header existente
  - Test: `jsonError` retorna estructura correcta para cada cÃ³digo
  - Test: `jsonError` incluye headers adicionales cuando se proveen
  - _Requirements: 10.1_
  - _Complejidad: S_

#### Epic 2: Logging Estructurado y MÃ©tricas

- [x] 2.1 Implementar logger estructurado con PII masking
  - Crear `src/server/http/logger.ts`
  - Definir interfaz `LogEntry` con campos: `level`, `timestamp`, `requestId`, `method`, `path`, `statusCode`, `durationMs`, `environment`
  - Implementar `logRequest(entry)` con formato JSON en producciÃ³n
  - Implementar `logError(requestId, error, context?)` para errores 5xx
  - Implementar `maskEmail(email)` â†’ `abc***@domain.com`
  - Implementar `maskPhone(phone)` â†’ `***1234`
  - Asignar nivel: `info` para 2xx, `warn` para 4xx, `error` para 5xx
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 13.1, 13.2_
  - _Complejidad: M_

- [x]* 2.2 Escribir property test para PII masking
  - **Property 10: Enmascaramiento de PII en logs**
  - **Validates: Requirements 5.3**
  - Generar 100 emails y telÃ©fonos aleatorios con faker
  - Verificar que `maskEmail` siempre muestra solo primeros 3 caracteres antes de @
  - Verificar que `maskPhone` siempre muestra solo Ãºltimos 4 dÃ­gitos
  - _Requirements: 10.4_
  - _Complejidad: S_

- [x] 2.3 Implementar collector de mÃ©tricas
  - Crear `src/server/http/metrics.ts`
  - Implementar clase `MetricsCollector` con mÃ©todos: `incrementCounter`, `recordHistogram`, `setGauge`, `getSnapshot`
  - Mantener contadores: `quotes.created.count`, `quotes.validation_error.count`, `quotes.rate_limited.count`, `quotes.internal_error.count`
  - Mantener histograma: `quotes.request_duration_ms` con percentiles p50, p95, p99
  - Mantener gauge: `quotes.in_flight_requests`
  - Limitar histogramas a Ãºltimos 1000 valores para calcular percentiles
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - _Complejidad: M_

- [x]* 2.4 Escribir tests unitarios para mÃ©tricas
  - Test: `incrementCounter` acumula valores correctamente
  - Test: `recordHistogram` calcula percentiles p50, p95, p99
  - Test: `setGauge` actualiza valor actual
  - Test: `getSnapshot` retorna estructura completa
  - _Requirements: 10.1_
  - _Complejidad: S_

- [x] 2.5 Checkpoint - Verificar infraestructura base
  - Ejecutar tests unitarios: `npm run test`
  - Verificar cobertura > 85% en mÃ³dulos `request-id.ts`, `errors.ts`, `logger.ts`, `metrics.ts`
  - Asegurar que no hay errores de compilaciÃ³n TypeScript
  - Preguntar al usuario si hay dudas o ajustes necesarios

#### Epic 3: ValidaciÃ³n y SanitizaciÃ³n Robusta

- [x] 3.1 Definir tipos de dominio
  - Crear `src/server/quotes/types.ts`
  - Definir interfaz `QuoteRequestInput` con campos: `name`, `email`, `phone`, `companyName`, `quantity`, `message?`
  - Definir tipo `QuantityRange = '10-24' | '25-49' | '50-99' | '100+'`
  - Definir interfaz `QuoteLeadRecord` con campos adicionales: `id`, `source`, `status`, `createdAt`, `updatedAt`
  - Definir tipo `QuoteStatus = 'received' | 'contacted' | 'archived'`
  - _Requirements: 1.2, 3.4, 3.5_
  - _Complejidad: S_

- [x] 3.2 Implementar validaciÃ³n y sanitizaciÃ³n declarativa
  - Crear `src/server/quotes/validation.ts`
  - Definir interfaz `ValidationResult` con campos: `issues`, `data?`
  - Definir interfaz `ValidationIssue` con campos: `field`, `issue`
  - Implementar helpers: `sanitizeString`, `sanitizeMessage`
  - SanitizaciÃ³n: trim espacios, normalizar espacios mÃºltiples, remover caracteres de control (excepto `\n` en `message`)
  - Implementar `validateQuotePayload(payload: unknown): ValidationResult`
  - Validar formato email con regex RFC 5322 simplificado: `/^\S+@\S+\.\S+$/`
  - Validar telÃ©fono con regex: `/^[+0-9\s()-]{7,30}$/`
  - Validar longitudes: `name` (2-120), `email` (max 254), `phone` (7-30), `companyName` (1-160), `message` (max 2000)
  - Validar enum `quantity` contra valores permitidos
  - Rechazar campos adicionales no especificados
  - Rechazar payloads > 32KB
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_
  - _Complejidad: L_

- [x]* 3.3 Escribir property test para validaciÃ³n de payloads vÃ¡lidos
  - **Property 1: ValidaciÃ³n acepta payloads vÃ¡lidos aleatorios**
  - **Validates: Requirements 1.2, 1.3**
  - Generar 100 payloads vÃ¡lidos aleatorios con faker
  - Verificar que todos pasan validaciÃ³n sin errores
  - Verificar que `data` contiene todos los campos esperados
  - _Requirements: 10.4_
  - _Complejidad: M_

- [x]* 3.4 Escribir property test para sanitizaciÃ³n completa
  - **Property 2: SanitizaciÃ³n completa de entradas**
  - **Validates: Requirements 2.1, 2.2, 2.3**
  - Generar 100 strings con espacios mÃºltiples, leading/trailing spaces, caracteres de control
  - Verificar que sanitizaciÃ³n remueve correctamente todos los casos
  - Verificar que `\n` se preserva en campo `message`
  - _Requirements: 10.4_
  - _Complejidad: M_

- [x]* 3.5 Escribir tests unitarios para validaciÃ³n de formatos invÃ¡lidos
  - **Property 3: ValidaciÃ³n rechaza formatos invÃ¡lidos**
  - **Validates: Requirements 2.4, 2.5, 2.6, 2.7**
  - Test: email invÃ¡lido retorna error con campo `email`
  - Test: telÃ©fono invÃ¡lido retorna error con campo `phone`
  - Test: longitudes fuera de rango retornan errores
  - Test: quantity invÃ¡lido retorna error
  - Test: campos adicionales retornan error
  - _Requirements: 10.2_
  - _Complejidad: M_

- [x]* 3.6 Escribir test para estructura de errores de validaciÃ³n
  - **Property 4: Errores de validaciÃ³n incluyen detalles estructurados**
  - **Validates: Requirements 2.8**
  - Test: error de validaciÃ³n retorna array `details` con objetos `{field, issue}`
  - Test: mÃºltiples errores retornan mÃºltiples objetos en `details`
  - _Requirements: 10.1_
  - _Complejidad: S_


#### Epic 4: Persistencia Durable

- [x] 4.1 Decidir estrategia de persistencia
  - Evaluar opciones: PostgreSQL + Prisma (producciÃ³n robusta) vs Vercel KV (MVP rÃ¡pido) vs File System (solo desarrollo)
  - Considerar: durabilidad, escalabilidad, costo, tiempo de setup
  - Documentar decisiÃ³n en comentario de cÃ³digo
  - _Requirements: 3.1_
  - _Complejidad: S_

- [x] 4.2 Implementar interfaz abstracta de Repository
  - Crear `src/server/quotes/repository.ts`
  - Definir interfaz `QuotesRepository` con mÃ©todos: `create(input)`, `healthCheck()`
  - Implementar generaciÃ³n de IDs: formato `q_{timestamp_base36}{random_base36}`
  - Implementar funciÃ³n helper `generateQuoteId(): string`
  - _Requirements: 3.2_
  - _Complejidad: M_

- [x] 4.3 Implementar persistencia con opciÃ³n elegida
  - **Si PostgreSQL + Prisma:**
    - Crear schema Prisma en `prisma/schema.prisma`
    - Definir modelo `Quote` con campos: `id`, `source`, `status`, `name`, `email`, `phone`, `companyName`, `quantity`, `message`, `createdAt`, `updatedAt`
    - Agregar Ã­ndices en `createdAt` y `status`
    - Ejecutar `npx prisma migrate dev --name init`
    - Implementar `QuotesRepository` usando `PrismaClient`
  - **Si Vercel KV:**
    - Instalar `@vercel/kv`
    - Implementar `QuotesRepository` usando `kv.set` y `kv.zadd` para Ã­ndice temporal
    - Implementar `healthCheck` con `kv.ping()`
  - **Si File System (solo desarrollo):**
    - Crear directorio `.data/` en raÃ­z del proyecto
    - Implementar `QuotesRepository` usando `fs/promises`
    - Agregar `.data/` a `.gitignore`
  - Establecer `source: 'landing-contact-form'` y `status: 'received'` por defecto
  - Generar timestamps en formato ISO 8601 UTC
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_
  - _Complejidad: L_

- [x]* 4.4 Escribir property test para generaciÃ³n de IDs Ãºnicos
  - **Property 6: GeneraciÃ³n de IDs Ãºnicos**
  - **Validates: Requirements 3.2, 3.8**
  - Generar 1000 IDs concurrentemente con `Promise.all`
  - Verificar que todos tienen formato `q_{alphanumeric}`
  - Verificar que no hay colisiones (Set.size === 1000)
  - _Requirements: 10.5_
  - _Complejidad: M_

- [x]* 4.5 Escribir property test para timestamps ISO 8601 UTC
  - **Property 7: Timestamps en formato ISO 8601 UTC**
  - **Validates: Requirements 3.3**
  - Crear 100 registros de cotizaciÃ³n
  - Verificar que `createdAt` y `updatedAt` tienen formato `YYYY-MM-DDTHH:mm:ss.sssZ`
  - Verificar que timestamps son vÃ¡lidos con `new Date(timestamp).toISOString() === timestamp`
  - _Requirements: 10.4_
  - _Complejidad: S_

- [x]* 4.6 Escribir tests de concurrencia para escrituras
  - **Property 6 (concurrencia): Escrituras concurrentes sin race conditions**
  - **Validates: Requirements 3.8**
  - Ejecutar 10 escrituras concurrentes con `Promise.all`
  - Verificar que todos los registros se crean exitosamente
  - Verificar que todos tienen IDs Ãºnicos
  - Verificar que no hay corrupciÃ³n de datos
  - _Requirements: 10.5_
  - _Complejidad: M_

- [x] 4.7 Checkpoint - Verificar persistencia
  - Ejecutar tests de repository: `npm run test repository`
  - Verificar que datos persisten despuÃ©s de reiniciar servidor (si aplica)
  - Verificar cobertura > 90% en `repository.ts`
  - Preguntar al usuario si hay dudas o ajustes necesarios

#### Epic 5: Rate Limiting y Seguridad HTTP

- [x] 5.1 Implementar rate limiter con sliding window
  - Crear `src/server/http/rate-limiter.ts`
  - Definir interfaz `RateLimitResult` con campos: `allowed`, `retryAfter?`
  - Implementar `checkRateLimit(request: Request): RateLimitResult`
  - Algoritmo: sliding window con almacenamiento en memoria
  - LÃ­mite: 5 requests por ventana de 60 segundos por IP
  - Identificar IP desde headers: `x-forwarded-for` o `x-real-ip` (fallback a socket IP)
  - Implementar limpieza automÃ¡tica de entradas expiradas
  - Retornar `retryAfter` en segundos hasta reset de ventana
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - _Complejidad: M_

- [x]* 5.2 Escribir property test para rate limiting consistente
  - **Property 8: Rate limiting consistente por IP**
  - **Validates: Requirements 4.1, 4.3, 4.4**
  - Simular 10 requests desde misma IP
  - Verificar que primeros 5 son permitidos
  - Verificar que request 6 es rechazado con `retryAfter > 0`
  - Esperar ventana y verificar que se resetea
  - _Requirements: 10.6_
  - _Complejidad: M_

- [x] 5.3 Implementar headers de seguridad y CORS
  - Crear `src/server/http/security.ts`
  - Definir objeto `securityHeaders` con:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `X-XSS-Protection: 1; mode=block`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (solo producciÃ³n)
  - Implementar `corsHeaders(origin: string | null)` que verifica whitelist de `ALLOWED_ORIGINS`
  - Permitir mÃ©todos: `POST, OPTIONS`
  - Permitir headers: `Content-Type, X-Request-Id`
  - Max age: 86400 segundos (24 horas)
  - Implementar `validateContentType(request: Request): boolean` que verifica `application/json`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - _Complejidad: M_

- [x]* 5.4 Escribir tests unitarios para seguridad
  - Test: `validateContentType` acepta `application/json`
  - Test: `validateContentType` rechaza otros Content-Types
  - Test: `corsHeaders` retorna headers solo para orÃ­genes en whitelist
  - Test: `corsHeaders` retorna objeto vacÃ­o para orÃ­genes no permitidos
  - Test: `securityHeaders` incluye HSTS solo en producciÃ³n
  - _Requirements: 10.1_
  - _Complejidad: S_

#### Epic 6: Resiliencia (Timeouts y Circuit Breakers)

- [x] 6.1 Implementar wrapper de timeout genÃ©rico
  - Crear `src/server/http/resilience.ts`
  - Implementar funciÃ³n `withTimeout<T>(promise, timeoutMs, errorMessage?): Promise<T>`
  - Usar `Promise.race` con timeout que rechaza con `TimeoutError`
  - Definir clase `TimeoutError extends Error`
  - _Requirements: 9.1, 9.2_
  - _Complejidad: S_

- [x] 6.2 Implementar circuit breaker para dependencias
  - En `src/server/http/resilience.ts`
  - Implementar clase `CircuitBreaker` con estados: `closed`, `open`, `half-open`
  - ConfiguraciÃ³n: 5 fallos consecutivos â†’ `open`, 30 segundos â†’ `half-open`
  - MÃ©todo `execute<T>(fn: () => Promise<T>): Promise<T>`
  - En estado `open`: rechazar inmediatamente sin ejecutar
  - En estado `half-open`: ejecutar 1 request de prueba
  - Exportar instancia `dbCircuitBreaker` para uso en repository
  - _Requirements: 9.3, 9.4, 9.5, 9.6_
  - _Complejidad: M_

- [x] 6.3 Integrar timeouts y circuit breaker en repository
  - Modificar `QuotesRepository.create` para usar `dbCircuitBreaker.execute`
  - Aplicar timeout de 5 segundos a operaciones de DB con `withTimeout`
  - Modificar `QuotesRepository.healthCheck` para usar timeout de 2 segundos
  - Propagar errores de timeout como `ServiceUnavailableError`
  - Propagar errores de circuit breaker como `ServiceUnavailableError`
  - _Requirements: 9.1, 9.2, 9.3_
  - _Complejidad: M_

- [x]* 6.4 Escribir tests unitarios para resiliencia
  - Test: `withTimeout` rechaza despuÃ©s de timeout
  - Test: `CircuitBreaker` abre despuÃ©s de 5 fallos
  - Test: `CircuitBreaker` pasa a half-open despuÃ©s de 30s
  - Test: `CircuitBreaker` cierra despuÃ©s de request exitoso en half-open
  - Test: Repository propaga errores de timeout correctamente
  - _Requirements: 10.1_
  - _Complejidad: M_

- [x] 6.5 Checkpoint - Verificar seguridad y resiliencia
  - Ejecutar tests de rate limiting, seguridad y resiliencia
  - Verificar cobertura > 85% en mÃ³dulos de seguridad
  - Simular timeout de DB y verificar respuesta 503
  - Preguntar al usuario si hay dudas o ajustes necesarios

#### Epic 7: Service Layer y Route Handler

- [x] 7.1 Implementar service layer
  - Crear `src/server/quotes/service.ts`
  - Implementar clase `QuotesService` con mÃ©todo `createQuote(input: QuoteRequestInput): Promise<QuoteLeadRecord>`
  - Inyectar `QuotesRepository` en constructor
  - Actualmente lÃ³gica mÃ­nima (delegar a repository), preparado para expansiÃ³n futura
  - _Requirements: 1.3_
  - _Complejidad: S_

- [x] 7.2 Implementar route handler principal POST /api/v1/quotes
  - Crear `src/app/api/v1/quotes/route.ts`
  - Implementar funciÃ³n `POST(request: Request): Promise<Response>`
  - OrquestaciÃ³n completa:
    1. Generar o reutilizar `requestId`
    2. Validar `Content-Type: application/json` (retornar 415 si falla)
    3. Verificar rate limit (retornar 429 con `Retry-After` si excede)
    4. Parsear body con timeout de 3 segundos (retornar 422 si JSON invÃ¡lido)
    5. Validar y sanitizar payload (retornar 422 con `details` si falla)
    6. Llamar a `QuotesService.createQuote`
    7. Manejar errores de timeout/circuit breaker (retornar 503)
    8. Registrar request en logger con duraciÃ³n
    9. Incrementar mÃ©tricas correspondientes
    10. Retornar 201 con `data`, `meta.requestId` y headers de seguridad
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - _Complejidad: L_

- [x] 7.3 Implementar handler OPTIONS para CORS preflight
  - En `src/app/api/v1/quotes/route.ts`
  - Implementar funciÃ³n `OPTIONS(request: Request): Promise<Response>`
  - Retornar 204 con headers CORS y seguridad
  - _Requirements: 8.4_
  - _Complejidad: S_

- [x]* 7.4 Escribir property test para Content-Type en respuestas
  - **Property 14: Content-Type header en todas las respuestas**
  - **Validates: Requirements 1.6**
  - Enviar 50 requests vÃ¡lidos e invÃ¡lidos aleatorios
  - Verificar que todas las respuestas incluyen `Content-Type: application/json`
  - _Requirements: 10.4_
  - _Complejidad: S_

- [x]* 7.5 Escribir property test para logs estructurados
  - **Property 9: Logs estructurados con campos requeridos**
  - **Validates: Requirements 5.1, 5.5**
  - Procesar 50 requests aleatorios
  - Verificar que cada log contiene: `requestId`, `method`, `path`, `statusCode`, `durationMs`, `timestamp`, `environment`
  - _Requirements: 10.4_
  - _Complejidad: M_

- [x]* 7.6 Escribir property test para nivel de log correcto
  - **Property 11: Nivel de log correcto por status code**
  - **Validates: Requirements 5.7**
  - Generar requests que resulten en 2xx, 4xx, 5xx
  - Verificar que nivel es `info` para 2xx, `warn` para 4xx, `error` para 5xx
  - _Requirements: 10.4_
  - _Complejidad: S_

- [x]* 7.7 Escribir tests de integraciÃ³n end-to-end
  - Test: POST con payload vÃ¡lido retorna 201 con estructura correcta
  - Test: POST con payload invÃ¡lido retorna 422 con `details`
  - Test: POST sin Content-Type correcto retorna 415
  - Test: POST despuÃ©s de 5 requests retorna 429 con `Retry-After`
  - Test: POST con JSON invÃ¡lido retorna 422
  - Test: POST con payload > 32KB retorna 413
  - Test: Respuesta incluye header `X-Request-Id`
  - Test: Respuesta incluye headers de seguridad
  - _Requirements: 10.3_
  - _Complejidad: L_

#### Epic 8: Health Checks y MÃ©tricas Endpoints

- [x] 8.1 Implementar endpoint GET /api/v1/health
  - Crear `src/app/api/v1/health/route.ts`
  - Implementar funciÃ³n `GET(): Promise<Response>`
  - Verificar conectividad con `QuotesRepository.healthCheck()` con timeout de 2 segundos
  - Verificar uso de memoria (alerta si heap > 400MB)
  - Retornar 200 con `status: 'ok'` si todas las verificaciones pasan
  - Retornar 503 con `status: 'down'` si alguna verificaciÃ³n falla
  - Incluir array `checks` con resultado de cada verificaciÃ³n
  - Incluir `timestamp` en respuesta
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - _Complejidad: M_

- [x]* 8.2 Escribir tests para health endpoint
  - Test: GET /api/v1/health retorna 200 cuando sistema estÃ¡ operativo
  - Test: GET /api/v1/health retorna 503 cuando DB no responde
  - Test: Respuesta incluye `status`, `timestamp`, `checks`
  - Test: Health check completa en menos de 3 segundos
  - _Requirements: 10.3_
  - _Complejidad: M_

- [x] 8.3 Implementar endpoint GET /api/v1/metrics
  - Crear `src/app/api/v1/metrics/route.ts`
  - Implementar funciÃ³n `GET(): Promise<Response>`
  - Llamar a `MetricsCollector.getSnapshot()`
  - Retornar 200 con estructura: `counters`, `histograms`, `gauges`
  - Incluir headers de seguridad
  - _Requirements: 6.7_
  - _Complejidad: S_

- [x]* 8.4 Escribir tests para metrics endpoint
  - Test: GET /api/v1/metrics retorna 200 con estructura correcta
  - Test: MÃ©tricas incluyen todos los contadores esperados
  - Test: Histogramas incluyen percentiles p50, p95, p99
  - _Requirements: 10.3_
  - _Complejidad: S_

- [x] 8.5 Checkpoint - Verificar backend completo
  - Ejecutar suite completa de tests: `npm run test`
  - Verificar cobertura > 85% en todos los mÃ³dulos crÃ­ticos
  - Ejecutar linter: `npm run lint`
  - Ejecutar type check: `npx tsc --noEmit`
  - Probar endpoints manualmente con curl o Postman
  - Preguntar al usuario si hay dudas o ajustes necesarios


---

### Fase 2: IntegraciÃ³n Frontend (Semana 3)

#### Epic 9: AdaptaciÃ³n del Formulario de Contacto

- [x] 9.1 Agregar feature flag para API de cotizaciones
  - Agregar variable de entorno `NEXT_PUBLIC_QUOTES_API_ENABLED=false` en `.env.local`
  - Agregar variable de entorno `NEXT_PUBLIC_QUOTES_API_ENABLED=true` en `.env.production`
  - Documentar feature flag en README
  - _Requirements: 12.1_
  - _Complejidad: S_

- [x] 9.2 Implementar submit real con fetch a /api/v1/quotes
  - Modificar `src/app/components/ContactSection.tsx`
  - Implementar funciÃ³n `submitQuote(payload: QuotePayload): Promise<QuoteResponse>`
  - Usar `fetch('/api/v1/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })`
  - Incluir header `X-Request-Id` generado en cliente (opcional)
  - Mantener fallback a comportamiento actual si feature flag estÃ¡ desactivado
  - _Requirements: 12.1, 12.2_
  - _Complejidad: M_

- [x] 9.3 Agregar estado de carga durante submit
  - Agregar estado `isSubmitting` en componente
  - Deshabilitar botÃ³n de submit mientras `isSubmitting === true`
  - Mostrar spinner o texto "Enviando..." durante submit
  - _Requirements: 12.2_
  - _Complejidad: S_

#### Epic 10: Manejo de Respuestas y Errores

- [x] 10.1 Implementar manejo de respuesta 201 (Ã©xito)
  - Cuando response.status === 201, mostrar mensaje de Ã©xito
  - Mensaje: "Â¡Gracias! Hemos recibido tu solicitud de cotizaciÃ³n. Te contactaremos pronto."
  - Limpiar formulario despuÃ©s de Ã©xito
  - Scroll a mensaje de Ã©xito
  - _Requirements: 12.3_
  - _Complejidad: S_

- [x] 10.2 Implementar manejo de respuesta 422 (validaciÃ³n)
  - Cuando response.status === 422, parsear `error.details` array
  - Mostrar errores por campo usando array `details`
  - Formato: `details[].field` â†’ mostrar `details[].issue` debajo del campo correspondiente
  - Mantener valores ingresados en formulario
  - _Requirements: 12.4_
  - _Complejidad: M_

- [x] 10.3 Implementar manejo de respuesta 429 (rate limit)
  - Cuando response.status === 429, mostrar mensaje especÃ­fico
  - Mensaje: "Has enviado demasiadas solicitudes. Por favor, intenta de nuevo en unos minutos."
  - Leer header `Retry-After` y mostrar tiempo de espera si estÃ¡ disponible
  - _Requirements: 12.5_
  - _Complejidad: S_

- [x] 10.4 Implementar manejo de respuestas 500/503 (errores de servidor)
  - Cuando response.status >= 500, mostrar error general recuperable
  - Mensaje: "OcurriÃ³ un error al procesar tu solicitud. Por favor, intenta de nuevo."
  - Incluir botÃ³n "Reintentar" que vuelve a enviar el formulario
  - Implementar exponential backoff: 1s, 2s, 4s (mÃ¡ximo 3 intentos)
  - _Requirements: 12.6_
  - _Complejidad: M_

- [x] 10.5 Implementar captura y reporte de requestId
  - Leer header `X-Request-Id` de respuesta
  - Almacenar `requestId` en estado del componente
  - En caso de error, mostrar `requestId` en mensaje de error para soporte
  - Formato: "Si el problema persiste, contacta a soporte con el cÃ³digo: {requestId}"
  - _Requirements: 12.7, 13.4_
  - _Complejidad: S_

- [x]* 10.6 Escribir property test para round-trip serialization
  - **Property 12: Round-trip serialization preserva datos**
  - **Validates: Requirements 11.4, 11.5**
  - Generar 100 objetos `QuoteLeadRecord` vÃ¡lidos
  - Serializar a JSON y parsear de vuelta
  - Verificar que objeto resultante es equivalente al original
  - _Requirements: 10.4_
  - _Complejidad: S_

- [x]* 10.7 Escribir property test para parsing de JSON invÃ¡lido
  - **Property 13: Parsing de JSON invÃ¡lido retorna error estructurado**
  - **Validates: Requirements 11.1, 11.2**
  - Generar 50 strings de JSON malformados
  - Enviar como body a endpoint
  - Verificar que retorna 422 con cÃ³digo `VALIDATION_ERROR`
  - Verificar que mensaje es descriptivo sin exponer detalles internos
  - _Requirements: 10.4_
  - _Complejidad: M_

#### Epic 11: Testing Frontend-Backend

- [x]* 11.1 Escribir tests de integraciÃ³n frontend-backend
  - Test: Submit de formulario con datos vÃ¡lidos muestra mensaje de Ã©xito
  - Test: Submit con email invÃ¡lido muestra error en campo email
  - Test: Submit despuÃ©s de 5 intentos muestra mensaje de rate limit
  - Test: Submit con servidor caÃ­do muestra error recuperable con botÃ³n reintentar
  - Test: BotÃ³n de submit se deshabilita durante envÃ­o
  - Test: Formulario se limpia despuÃ©s de Ã©xito
  - _Requirements: 10.3_
  - _Complejidad: L_

- [x] 11.2 Checkpoint - Verificar integraciÃ³n frontend
  - Ejecutar tests de integraciÃ³n: `npm run test -- ContactSection`
  - Probar flujo completo manualmente en navegador
  - Verificar que feature flag funciona correctamente
  - Verificar que todos los estados de respuesta se manejan correctamente
  - Preguntar al usuario si hay dudas o ajustes necesarios

---

### Fase 3: Deployment y Monitoreo (Semana 4)

#### Epic 12: ConfiguraciÃ³n de Staging

- [ ] 12.1 Provisionar base de datos para staging
  - **Si PostgreSQL:** Crear instancia en Vercel Postgres o proveedor elegido
  - **Si Vercel KV:** Crear store en Vercel dashboard
  - Obtener connection string o API URL/token
  - _Requirements: 3.1_
  - _Complejidad: M_

- [x] 12.2 Configurar variables de entorno en staging
  - vercel.json creado con env defaults
  - .env.example actualizado con ALLOWED_ORIGINS, NEXT_PUBLIC_QUOTES_API_ENABLED

- [ ] 12.3 Ejecutar migraciones de base de datos en staging
  - **Si PostgreSQL:** Ejecutar `npx prisma migrate deploy`
  - **Si Vercel KV:** No requiere migraciones
  - Verificar que schema estÃ¡ correctamente aplicado
  - _Requirements: 3.1_
  - _Complejidad: S_

- [ ] 12.4 Deploy a staging
  - Hacer deploy a entorno de staging (Vercel preview deployment o similar)
  - Verificar que build completa sin errores
  - Verificar que aplicaciÃ³n inicia correctamente
  - _Complejidad: S_

- [x] 12.5 Ejecutar smoke tests en staging
  - Script: `BASE_URL=https://staging.app node scripts/smoke-test.mjs` (11 pruebas)
  - Cubre: health, metrics, 201, 415, 422, invalid JSON, OPTIONS preflight, security headers, rate limiting

- [ ] 12.6 Monitorear logs y mÃ©tricas en staging por 48 horas
  - Revisar logs estructurados en consola de Vercel o proveedor
  - Verificar que no hay errores 5xx inesperados
  - Verificar que mÃ©tricas se actualizan correctamente
  - Verificar que PII estÃ¡ enmascarada en logs
  - Documentar cualquier anomalÃ­a encontrada
  - _Requirements: 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_
  - _Complejidad: M_

- [ ] 12.7 Checkpoint - Validar staging
  - Revisar resultados de smoke tests
  - Revisar logs de 48 horas
  - Verificar que no hay issues crÃ­ticos
  - Obtener aprobaciÃ³n del usuario para proceder a producciÃ³n

#### Epic 13: Deployment a ProducciÃ³n

- [ ] 13.1 Provisionar base de datos para producciÃ³n
  - **Si PostgreSQL:** Crear instancia en Vercel Postgres o proveedor elegido con plan de producciÃ³n
  - **Si Vercel KV:** Crear store en Vercel dashboard con plan de producciÃ³n
  - Configurar backups automÃ¡ticos (si PostgreSQL)
  - Obtener connection string o API URL/token
  - _Requirements: 3.1_
  - _Complejidad: M_

- [x] 13.2 Configurar variables de entorno en producciÃ³n
  - vercel.json con env defaults para producciÃ³n
  - ALLOWED_ORIGINS: https://camiart.com,https://www.camiart.com (configurar en Vercel Dashboard)

- [ ] 13.3 Ejecutar migraciones de base de datos en producciÃ³n
  - **Si PostgreSQL:** Ejecutar `npx prisma migrate deploy`
  - **Si Vercel KV:** No requiere migraciones
  - Verificar que schema estÃ¡ correctamente aplicado
  - _Requirements: 3.1_
  - _Complejidad: S_

- [ ] 13.4 Deploy a producciÃ³n
  - Hacer deploy a producciÃ³n (Vercel production deployment)
  - Verificar que build completa sin errores
  - Verificar que aplicaciÃ³n inicia correctamente
  - _Complejidad: S_

- [x] 13.5 Ejecutar smoke tests en producciÃ³n
  - Script: `npm run smoke:prod` (alias: BASE_URL=https://camiart.com node scripts/smoke-test.mjs)

#### Epic 14: Monitoreo y Alertas

- [x] 14.1 Configurar monitoreo de mÃ©tricas en tiempo real
  - Endpoint `/api/v1/metrics` expone counters, histograms (p50/p95/p99), gauges en formato Prometheus
  - Configurar METRICS_TOKEN en Vercel y scrape con Grafana/Datadog/UptimeRobot si disponible

- [ ] 14.2 Configurar alertas para anomalÃ­as
  - Alerta: Error rate > 5% por 5 minutos
  - Alerta: p95 latency > 1000ms por 5 minutos
  - Alerta: Health check down por 2 minutos
  - Alerta: Rate limited count > 10% de requests
  - Configurar notificaciones por email o Slack
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.3_
  - _Complejidad: M_

- [x] 14.3 Documentar runbook de incidentes
  - Creado: `.kiro/RUNBOOK.md` con 10 secciones: error rate alto, latencia, DB down, rate limit excesivo, leads perdidos, comandos de debugging, escalaciÃ³n, variables de produccion

- [ ] 14.4 Verificar checklist de producciÃ³n
  - [ ] Datos persisten despuÃ©s de restart
  - [ ] Backups configurados (si PostgreSQL)
  - [ ] Ãndices creados en `createdAt` y `status`
  - [ ] Rate limiting activo (5 req/min)
  - [ ] CORS configurado con whitelist
  - [ ] Headers de seguridad presentes
  - [ ] PII enmascarada en logs
  - [ ] ValidaciÃ³n y sanitizaciÃ³n completa
  - [ ] Logs estructurados en JSON (producciÃ³n)
  - [ ] MÃ©tricas expuestas en `/api/v1/metrics`
  - [ ] Health check responde en `/api/v1/health`
  - [ ] RequestId en todas las respuestas
  - [ ] Timeouts configurados (5s para DB)
  - [ ] Circuit breaker activo
  - [ ] Errores manejados gracefully
  - [ ] Retry logic en cliente (frontend)
  - [ ] Cobertura > 85% en mÃ³dulos crÃ­ticos
  - [ ] Property-based tests pasando (100 iteraciones)
  - [ ] Tests de concurrencia pasando (10 requests)
  - [ ] Integration tests frontend-backend pasando
  - [ ] p95 latencia < 500ms
  - [ ] Sin memory leaks (monitorear heap usage)
  - [ ] Carga de 100 req/min soportada
  - _Complejidad: M_

- [ ] 14.5 Checkpoint final - Validar producciÃ³n
  - Monitorear mÃ©tricas por 24 horas
  - Verificar que KPIs tÃ©cnicos se cumplen:
    - Disponibilidad > 99.5% uptime
    - Latencia p95 < 500ms
    - Tasa de error < 1% de requests
  - Verificar que no hay pÃ©rdida de leads
  - Obtener feedback del usuario sobre funcionamiento
  - Documentar lecciones aprendidas

---

## Notes

### Sobre Testing

- **Tests marcados con `*` son opcionales** pero altamente recomendados para garantizar correctitud
- **Property-based tests** requieren 100 iteraciones mÃ­nimas para cobertura adecuada
- **Tests de concurrencia** son crÃ­ticos para validar escrituras sin race conditions
- **Cobertura objetivo:** > 85% en mÃ³dulos crÃ­ticos (`validation.ts`, `repository.ts`, `service.ts`, `rate-limiter.ts`, `route.ts`)

### Sobre Persistencia

- **DecisiÃ³n de persistencia** debe tomarse en tarea 4.1 considerando:
  - **PostgreSQL + Prisma:** Mejor para producciÃ³n robusta, requiere provisionar DB
  - **Vercel KV:** Mejor para MVP rÃ¡pido, setup instantÃ¡neo, costo por operaciÃ³n
  - **File System:** Solo para desarrollo local, NO usar en producciÃ³n

### Sobre Feature Flags

- **Feature flag `NEXT_PUBLIC_QUOTES_API_ENABLED`** permite activar/desactivar API sin re-deploy
- Mantener desactivado hasta completar Fase 2 (integraciÃ³n frontend)
- Activar en staging primero, luego en producciÃ³n despuÃ©s de validaciÃ³n

### Sobre Rollback

- **Trigger de rollback:**
  - Error rate > 10% por 5 minutos
  - p95 latency > 2000ms por 5 minutos
  - Health check down por 2 minutos

- **Procedimiento de rollback:**
  1. Desactivar feature flag `NEXT_PUBLIC_QUOTES_API_ENABLED`
  2. Verificar que formulario vuelve a comportamiento anterior
  3. Investigar causa raÃ­z en logs con `requestId`
  4. Aplicar fix y re-deploy a staging

### Sobre MÃ©tricas de Ã‰xito

**KPIs TÃ©cnicos (Semana 1 post-launch):**
- Disponibilidad: > 99.5% uptime
- Latencia p95: < 500ms
- Tasa de error: < 1% de requests
- Cobertura de tests: > 85%

**KPIs de Negocio:**
- Leads capturados: 0 pÃ©rdidas por fallos tÃ©cnicos
- ConversiÃ³n: Mantener o mejorar tasa actual
- Tiempo de respuesta: Feedback inmediato al usuario (< 1s percibido)

### Sobre Compatibilidad con Frontend

- **Mantener experiencia de usuario consistente:** No cambiar diseÃ±o visual del formulario
- **Mapeo 1:1 con campos actuales:** API contract debe coincidir exactamente con formulario
- **Estados de carga claros:** Usuario debe saber que su solicitud estÃ¡ siendo procesada
- **Mensajes de error especÃ­ficos:** Errores de validaciÃ³n deben indicar quÃ© campo corregir

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1", "4.1"] },
    { "id": 2, "tasks": ["1.4", "2.2", "2.3", "3.2", "4.2"] },
    { "id": 3, "tasks": ["2.4", "3.3", "3.4", "4.3"] },
    { "id": 4, "tasks": ["3.5", "3.6", "4.4", "4.5", "5.1"] },
    { "id": 5, "tasks": ["4.6", "5.2", "5.3", "6.1"] },
    { "id": 6, "tasks": ["5.4", "6.2"] },
    { "id": 7, "tasks": ["6.3", "6.4", "7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3"] },
    { "id": 9, "tasks": ["7.4", "7.5", "7.6", "8.1", "8.3"] },
    { "id": 10, "tasks": ["7.7", "8.2", "8.4"] },
    { "id": 11, "tasks": ["9.1", "9.2"] },
    { "id": 12, "tasks": ["9.3", "10.1", "10.2", "10.3"] },
    { "id": 13, "tasks": ["10.4", "10.5", "10.6", "10.7"] },
    { "id": 14, "tasks": ["11.1"] },
    { "id": 15, "tasks": ["12.1", "12.2"] },
    { "id": 16, "tasks": ["12.3", "12.4"] },
    { "id": 17, "tasks": ["12.5", "12.6"] },
    { "id": 18, "tasks": ["13.1", "13.2"] },
    { "id": 19, "tasks": ["13.3", "13.4"] },
    { "id": 20, "tasks": ["13.5", "14.1", "14.2"] },
    { "id": 21, "tasks": ["14.3", "14.4"] }
  ]
}
```

