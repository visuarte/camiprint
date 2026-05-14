# Implementation Plan: Backend Cotizaciones v1

## Estado de Ejecucion - Backend Cotizaciones v1

Fecha de corte: 2026-05-14
Estado general: En hardening documental y QA final

### Hecho

- Endpoint POST /api/v1/quotes implementado.
- Validacion y sanitizacion robustas implementadas.
- Persistencia durable con escritura atomica implementada.
- Rate limiting 5 por IP en 60 segundos implementado.
- Logging estructurado con masking de PII implementado.
- Metricas runtime y endpoint /api/v1/metrics implementados.
- Health endpoint /api/v1/health implementado.
- Timeout de persistencia y circuit breaker implementados.
- Integracion frontend-backend validada en pruebas automatizadas.
- Cobertura de modulos criticos por encima de objetivo interno.

### En progreso

- Hardening documental de especificaciones y plan.
- Consolidacion de evidencia final para operacion.

### Pendiente

- QA manual multibrowser y mobile real.
- Evidencia final de operacion y checklist de go-live.

### Nota de trazabilidad

Las tareas detalladas con checkboxes inferiores se conservan como backlog historico de plan inicial y no representan el estado real final de ejecucion.

## Overview

Este plan implementa el backend de producción para captura de cotizaciones en Camiprint con persistencia durable, observabilidad completa, resiliencia ante fallos, seguridad HTTP y rate limiting. El plan sigue una estrategia de 3 fases: Backend → Frontend → Deployment.

**Características principales:**
- Persistencia durable que sobrevive reinicios
- Rate limiting con sliding window (5 req/min por IP)
- Logging estructurado con enmascaramiento de PII
- Métricas en tiempo real (contadores, histogramas)
- Health checks para orquestadores
- Timeouts y circuit breakers
- Headers de seguridad y CORS configurables
- Validación y sanitización robusta

**Tecnologías:** TypeScript, Next.js App Router, Vercel KV o PostgreSQL + Prisma

---

## Tasks

### Fase 1: Implementación Backend (Semana 1-2)

#### Epic 1: Infraestructura Base y Utilidades HTTP

- [ ] 1.1 Crear estructura de carpetas y módulos base
  - Crear `src/server/http/` para utilidades HTTP compartidas
  - Crear `src/server/quotes/` para lógica de dominio de cotizaciones
  - Crear `src/app/api/v1/quotes/` para route handlers
  - Crear `src/app/api/v1/health/` para health checks
  - Crear `src/app/api/v1/metrics/` para exposición de métricas
  - _Requirements: 1.1, 7.1_
  - _Complejidad: S_

- [ ] 1.2 Implementar generación y propagación de Request ID
  - Crear `src/server/http/request-id.ts`
  - Implementar función `getOrCreateRequestId(request: Request): string`
  - Formato: `req_{timestamp_base36}{random_base36}`
  - Leer de header `X-Request-Id` si existe, generar si no
  - _Requirements: 5.1, 13.4_
  - _Complejidad: S_

- [ ] 1.3 Implementar mapeo de errores HTTP
  - Crear `src/server/http/errors.ts`
  - Definir interfaz `ErrorResponse` con campos `ok`, `error`, `meta`
  - Implementar función `jsonError(statusCode, requestId, code, message, details?, headers?)`
  - Soportar códigos: `BAD_REQUEST`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`
  - _Requirements: 1.4, 2.8, 4.3_
  - _Complejidad: M_

- [ ]* 1.4 Escribir tests unitarios para request-id y errors
  - Test: `getOrCreateRequestId` genera IDs con formato correcto
  - Test: `getOrCreateRequestId` reutiliza header existente
  - Test: `jsonError` retorna estructura correcta para cada código
  - Test: `jsonError` incluye headers adicionales cuando se proveen
  - _Requirements: 10.1_
  - _Complejidad: S_

#### Epic 2: Logging Estructurado y Métricas

- [ ] 2.1 Implementar logger estructurado con PII masking
  - Crear `src/server/http/logger.ts`
  - Definir interfaz `LogEntry` con campos: `level`, `timestamp`, `requestId`, `method`, `path`, `statusCode`, `durationMs`, `environment`
  - Implementar `logRequest(entry)` con formato JSON en producción
  - Implementar `logError(requestId, error, context?)` para errores 5xx
  - Implementar `maskEmail(email)` → `abc***@domain.com`
  - Implementar `maskPhone(phone)` → `***1234`
  - Asignar nivel: `info` para 2xx, `warn` para 4xx, `error` para 5xx
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 13.1, 13.2_
  - _Complejidad: M_

- [ ]* 2.2 Escribir property test para PII masking
  - **Property 10: Enmascaramiento de PII en logs**
  - **Validates: Requirements 5.3**
  - Generar 100 emails y teléfonos aleatorios con faker
  - Verificar que `maskEmail` siempre muestra solo primeros 3 caracteres antes de @
  - Verificar que `maskPhone` siempre muestra solo últimos 4 dígitos
  - _Requirements: 10.4_
  - _Complejidad: S_

- [ ] 2.3 Implementar collector de métricas
  - Crear `src/server/http/metrics.ts`
  - Implementar clase `MetricsCollector` con métodos: `incrementCounter`, `recordHistogram`, `setGauge`, `getSnapshot`
  - Mantener contadores: `quotes.created.count`, `quotes.validation_error.count`, `quotes.rate_limited.count`, `quotes.internal_error.count`
  - Mantener histograma: `quotes.request_duration_ms` con percentiles p50, p95, p99
  - Mantener gauge: `quotes.in_flight_requests`
  - Limitar histogramas a últimos 1000 valores para calcular percentiles
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - _Complejidad: M_

- [ ]* 2.4 Escribir tests unitarios para métricas
  - Test: `incrementCounter` acumula valores correctamente
  - Test: `recordHistogram` calcula percentiles p50, p95, p99
  - Test: `setGauge` actualiza valor actual
  - Test: `getSnapshot` retorna estructura completa
  - _Requirements: 10.1_
  - _Complejidad: S_

- [ ] 2.5 Checkpoint - Verificar infraestructura base
  - Ejecutar tests unitarios: `npm run test`
  - Verificar cobertura > 85% en módulos `request-id.ts`, `errors.ts`, `logger.ts`, `metrics.ts`
  - Asegurar que no hay errores de compilación TypeScript
  - Preguntar al usuario si hay dudas o ajustes necesarios

#### Epic 3: Validación y Sanitización Robusta

- [ ] 3.1 Definir tipos de dominio
  - Crear `src/server/quotes/types.ts`
  - Definir interfaz `QuoteRequestInput` con campos: `name`, `email`, `phone`, `companyName`, `quantity`, `message?`
  - Definir tipo `QuantityRange = '10-24' | '25-49' | '50-99' | '100+'`
  - Definir interfaz `QuoteLeadRecord` con campos adicionales: `id`, `source`, `status`, `createdAt`, `updatedAt`
  - Definir tipo `QuoteStatus = 'received' | 'contacted' | 'archived'`
  - _Requirements: 1.2, 3.4, 3.5_
  - _Complejidad: S_

- [ ] 3.2 Implementar validación y sanitización declarativa
  - Crear `src/server/quotes/validation.ts`
  - Definir interfaz `ValidationResult` con campos: `issues`, `data?`
  - Definir interfaz `ValidationIssue` con campos: `field`, `issue`
  - Implementar helpers: `sanitizeString`, `sanitizeMessage`
  - Sanitización: trim espacios, normalizar espacios múltiples, remover caracteres de control (excepto `\n` en `message`)
  - Implementar `validateQuotePayload(payload: unknown): ValidationResult`
  - Validar formato email con regex RFC 5322 simplificado: `/^\S+@\S+\.\S+$/`
  - Validar teléfono con regex: `/^[+0-9\s()-]{7,30}$/`
  - Validar longitudes: `name` (2-120), `email` (max 254), `phone` (7-30), `companyName` (1-160), `message` (max 2000)
  - Validar enum `quantity` contra valores permitidos
  - Rechazar campos adicionales no especificados
  - Rechazar payloads > 32KB
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_
  - _Complejidad: L_

- [ ]* 3.3 Escribir property test para validación de payloads válidos
  - **Property 1: Validación acepta payloads válidos aleatorios**
  - **Validates: Requirements 1.2, 1.3**
  - Generar 100 payloads válidos aleatorios con faker
  - Verificar que todos pasan validación sin errores
  - Verificar que `data` contiene todos los campos esperados
  - _Requirements: 10.4_
  - _Complejidad: M_

- [ ]* 3.4 Escribir property test para sanitización completa
  - **Property 2: Sanitización completa de entradas**
  - **Validates: Requirements 2.1, 2.2, 2.3**
  - Generar 100 strings con espacios múltiples, leading/trailing spaces, caracteres de control
  - Verificar que sanitización remueve correctamente todos los casos
  - Verificar que `\n` se preserva en campo `message`
  - _Requirements: 10.4_
  - _Complejidad: M_

- [ ]* 3.5 Escribir tests unitarios para validación de formatos inválidos
  - **Property 3: Validación rechaza formatos inválidos**
  - **Validates: Requirements 2.4, 2.5, 2.6, 2.7**
  - Test: email inválido retorna error con campo `email`
  - Test: teléfono inválido retorna error con campo `phone`
  - Test: longitudes fuera de rango retornan errores
  - Test: quantity inválido retorna error
  - Test: campos adicionales retornan error
  - _Requirements: 10.2_
  - _Complejidad: M_

- [ ]* 3.6 Escribir test para estructura de errores de validación
  - **Property 4: Errores de validación incluyen detalles estructurados**
  - **Validates: Requirements 2.8**
  - Test: error de validación retorna array `details` con objetos `{field, issue}`
  - Test: múltiples errores retornan múltiples objetos en `details`
  - _Requirements: 10.1_
  - _Complejidad: S_


#### Epic 4: Persistencia Durable

- [ ] 4.1 Decidir estrategia de persistencia
  - Evaluar opciones: PostgreSQL + Prisma (producción robusta) vs Vercel KV (MVP rápido) vs File System (solo desarrollo)
  - Considerar: durabilidad, escalabilidad, costo, tiempo de setup
  - Documentar decisión en comentario de código
  - _Requirements: 3.1_
  - _Complejidad: S_

- [ ] 4.2 Implementar interfaz abstracta de Repository
  - Crear `src/server/quotes/repository.ts`
  - Definir interfaz `QuotesRepository` con métodos: `create(input)`, `healthCheck()`
  - Implementar generación de IDs: formato `q_{timestamp_base36}{random_base36}`
  - Implementar función helper `generateQuoteId(): string`
  - _Requirements: 3.2_
  - _Complejidad: M_

- [ ] 4.3 Implementar persistencia con opción elegida
  - **Si PostgreSQL + Prisma:**
    - Crear schema Prisma en `prisma/schema.prisma`
    - Definir modelo `Quote` con campos: `id`, `source`, `status`, `name`, `email`, `phone`, `companyName`, `quantity`, `message`, `createdAt`, `updatedAt`
    - Agregar índices en `createdAt` y `status`
    - Ejecutar `npx prisma migrate dev --name init`
    - Implementar `QuotesRepository` usando `PrismaClient`
  - **Si Vercel KV:**
    - Instalar `@vercel/kv`
    - Implementar `QuotesRepository` usando `kv.set` y `kv.zadd` para índice temporal
    - Implementar `healthCheck` con `kv.ping()`
  - **Si File System (solo desarrollo):**
    - Crear directorio `.data/` en raíz del proyecto
    - Implementar `QuotesRepository` usando `fs/promises`
    - Agregar `.data/` a `.gitignore`
  - Establecer `source: 'landing-contact-form'` y `status: 'received'` por defecto
  - Generar timestamps en formato ISO 8601 UTC
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_
  - _Complejidad: L_

- [ ]* 4.4 Escribir property test para generación de IDs únicos
  - **Property 6: Generación de IDs únicos**
  - **Validates: Requirements 3.2, 3.8**
  - Generar 1000 IDs concurrentemente con `Promise.all`
  - Verificar que todos tienen formato `q_{alphanumeric}`
  - Verificar que no hay colisiones (Set.size === 1000)
  - _Requirements: 10.5_
  - _Complejidad: M_

- [ ]* 4.5 Escribir property test para timestamps ISO 8601 UTC
  - **Property 7: Timestamps en formato ISO 8601 UTC**
  - **Validates: Requirements 3.3**
  - Crear 100 registros de cotización
  - Verificar que `createdAt` y `updatedAt` tienen formato `YYYY-MM-DDTHH:mm:ss.sssZ`
  - Verificar que timestamps son válidos con `new Date(timestamp).toISOString() === timestamp`
  - _Requirements: 10.4_
  - _Complejidad: S_

- [ ]* 4.6 Escribir tests de concurrencia para escrituras
  - **Property 6 (concurrencia): Escrituras concurrentes sin race conditions**
  - **Validates: Requirements 3.8**
  - Ejecutar 10 escrituras concurrentes con `Promise.all`
  - Verificar que todos los registros se crean exitosamente
  - Verificar que todos tienen IDs únicos
  - Verificar que no hay corrupción de datos
  - _Requirements: 10.5_
  - _Complejidad: M_

- [ ] 4.7 Checkpoint - Verificar persistencia
  - Ejecutar tests de repository: `npm run test repository`
  - Verificar que datos persisten después de reiniciar servidor (si aplica)
  - Verificar cobertura > 90% en `repository.ts`
  - Preguntar al usuario si hay dudas o ajustes necesarios

#### Epic 5: Rate Limiting y Seguridad HTTP

- [ ] 5.1 Implementar rate limiter con sliding window
  - Crear `src/server/http/rate-limiter.ts`
  - Definir interfaz `RateLimitResult` con campos: `allowed`, `retryAfter?`
  - Implementar `checkRateLimit(request: Request): RateLimitResult`
  - Algoritmo: sliding window con almacenamiento en memoria
  - Límite: 5 requests por ventana de 60 segundos por IP
  - Identificar IP desde headers: `x-forwarded-for` o `x-real-ip` (fallback a socket IP)
  - Implementar limpieza automática de entradas expiradas
  - Retornar `retryAfter` en segundos hasta reset de ventana
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - _Complejidad: M_

- [ ]* 5.2 Escribir property test para rate limiting consistente
  - **Property 8: Rate limiting consistente por IP**
  - **Validates: Requirements 4.1, 4.3, 4.4**
  - Simular 10 requests desde misma IP
  - Verificar que primeros 5 son permitidos
  - Verificar que request 6 es rechazado con `retryAfter > 0`
  - Esperar ventana y verificar que se resetea
  - _Requirements: 10.6_
  - _Complejidad: M_

- [ ] 5.3 Implementar headers de seguridad y CORS
  - Crear `src/server/http/security.ts`
  - Definir objeto `securityHeaders` con:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `X-XSS-Protection: 1; mode=block`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (solo producción)
  - Implementar `corsHeaders(origin: string | null)` que verifica whitelist de `ALLOWED_ORIGINS`
  - Permitir métodos: `POST, OPTIONS`
  - Permitir headers: `Content-Type, X-Request-Id`
  - Max age: 86400 segundos (24 horas)
  - Implementar `validateContentType(request: Request): boolean` que verifica `application/json`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - _Complejidad: M_

- [ ]* 5.4 Escribir tests unitarios para seguridad
  - Test: `validateContentType` acepta `application/json`
  - Test: `validateContentType` rechaza otros Content-Types
  - Test: `corsHeaders` retorna headers solo para orígenes en whitelist
  - Test: `corsHeaders` retorna objeto vacío para orígenes no permitidos
  - Test: `securityHeaders` incluye HSTS solo en producción
  - _Requirements: 10.1_
  - _Complejidad: S_

#### Epic 6: Resiliencia (Timeouts y Circuit Breakers)

- [ ] 6.1 Implementar wrapper de timeout genérico
  - Crear `src/server/http/resilience.ts`
  - Implementar función `withTimeout<T>(promise, timeoutMs, errorMessage?): Promise<T>`
  - Usar `Promise.race` con timeout que rechaza con `TimeoutError`
  - Definir clase `TimeoutError extends Error`
  - _Requirements: 9.1, 9.2_
  - _Complejidad: S_

- [ ] 6.2 Implementar circuit breaker para dependencias
  - En `src/server/http/resilience.ts`
  - Implementar clase `CircuitBreaker` con estados: `closed`, `open`, `half-open`
  - Configuración: 5 fallos consecutivos → `open`, 30 segundos → `half-open`
  - Método `execute<T>(fn: () => Promise<T>): Promise<T>`
  - En estado `open`: rechazar inmediatamente sin ejecutar
  - En estado `half-open`: ejecutar 1 request de prueba
  - Exportar instancia `dbCircuitBreaker` para uso en repository
  - _Requirements: 9.3, 9.4, 9.5, 9.6_
  - _Complejidad: M_

- [ ] 6.3 Integrar timeouts y circuit breaker en repository
  - Modificar `QuotesRepository.create` para usar `dbCircuitBreaker.execute`
  - Aplicar timeout de 5 segundos a operaciones de DB con `withTimeout`
  - Modificar `QuotesRepository.healthCheck` para usar timeout de 2 segundos
  - Propagar errores de timeout como `ServiceUnavailableError`
  - Propagar errores de circuit breaker como `ServiceUnavailableError`
  - _Requirements: 9.1, 9.2, 9.3_
  - _Complejidad: M_

- [ ]* 6.4 Escribir tests unitarios para resiliencia
  - Test: `withTimeout` rechaza después de timeout
  - Test: `CircuitBreaker` abre después de 5 fallos
  - Test: `CircuitBreaker` pasa a half-open después de 30s
  - Test: `CircuitBreaker` cierra después de request exitoso en half-open
  - Test: Repository propaga errores de timeout correctamente
  - _Requirements: 10.1_
  - _Complejidad: M_

- [ ] 6.5 Checkpoint - Verificar seguridad y resiliencia
  - Ejecutar tests de rate limiting, seguridad y resiliencia
  - Verificar cobertura > 85% en módulos de seguridad
  - Simular timeout de DB y verificar respuesta 503
  - Preguntar al usuario si hay dudas o ajustes necesarios

#### Epic 7: Service Layer y Route Handler

- [ ] 7.1 Implementar service layer
  - Crear `src/server/quotes/service.ts`
  - Implementar clase `QuotesService` con método `createQuote(input: QuoteRequestInput): Promise<QuoteLeadRecord>`
  - Inyectar `QuotesRepository` en constructor
  - Actualmente lógica mínima (delegar a repository), preparado para expansión futura
  - _Requirements: 1.3_
  - _Complejidad: S_

- [ ] 7.2 Implementar route handler principal POST /api/v1/quotes
  - Crear `src/app/api/v1/quotes/route.ts`
  - Implementar función `POST(request: Request): Promise<Response>`
  - Orquestación completa:
    1. Generar o reutilizar `requestId`
    2. Validar `Content-Type: application/json` (retornar 415 si falla)
    3. Verificar rate limit (retornar 429 con `Retry-After` si excede)
    4. Parsear body con timeout de 3 segundos (retornar 422 si JSON inválido)
    5. Validar y sanitizar payload (retornar 422 con `details` si falla)
    6. Llamar a `QuotesService.createQuote`
    7. Manejar errores de timeout/circuit breaker (retornar 503)
    8. Registrar request en logger con duración
    9. Incrementar métricas correspondientes
    10. Retornar 201 con `data`, `meta.requestId` y headers de seguridad
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - _Complejidad: L_

- [ ] 7.3 Implementar handler OPTIONS para CORS preflight
  - En `src/app/api/v1/quotes/route.ts`
  - Implementar función `OPTIONS(request: Request): Promise<Response>`
  - Retornar 204 con headers CORS y seguridad
  - _Requirements: 8.4_
  - _Complejidad: S_

- [ ]* 7.4 Escribir property test para Content-Type en respuestas
  - **Property 14: Content-Type header en todas las respuestas**
  - **Validates: Requirements 1.6**
  - Enviar 50 requests válidos e inválidos aleatorios
  - Verificar que todas las respuestas incluyen `Content-Type: application/json`
  - _Requirements: 10.4_
  - _Complejidad: S_

- [ ]* 7.5 Escribir property test para logs estructurados
  - **Property 9: Logs estructurados con campos requeridos**
  - **Validates: Requirements 5.1, 5.5**
  - Procesar 50 requests aleatorios
  - Verificar que cada log contiene: `requestId`, `method`, `path`, `statusCode`, `durationMs`, `timestamp`, `environment`
  - _Requirements: 10.4_
  - _Complejidad: M_

- [ ]* 7.6 Escribir property test para nivel de log correcto
  - **Property 11: Nivel de log correcto por status code**
  - **Validates: Requirements 5.7**
  - Generar requests que resulten en 2xx, 4xx, 5xx
  - Verificar que nivel es `info` para 2xx, `warn` para 4xx, `error` para 5xx
  - _Requirements: 10.4_
  - _Complejidad: S_

- [ ]* 7.7 Escribir tests de integración end-to-end
  - Test: POST con payload válido retorna 201 con estructura correcta
  - Test: POST con payload inválido retorna 422 con `details`
  - Test: POST sin Content-Type correcto retorna 415
  - Test: POST después de 5 requests retorna 429 con `Retry-After`
  - Test: POST con JSON inválido retorna 422
  - Test: POST con payload > 32KB retorna 413
  - Test: Respuesta incluye header `X-Request-Id`
  - Test: Respuesta incluye headers de seguridad
  - _Requirements: 10.3_
  - _Complejidad: L_

#### Epic 8: Health Checks y Métricas Endpoints

- [ ] 8.1 Implementar endpoint GET /api/v1/health
  - Crear `src/app/api/v1/health/route.ts`
  - Implementar función `GET(): Promise<Response>`
  - Verificar conectividad con `QuotesRepository.healthCheck()` con timeout de 2 segundos
  - Verificar uso de memoria (alerta si heap > 400MB)
  - Retornar 200 con `status: 'ok'` si todas las verificaciones pasan
  - Retornar 503 con `status: 'down'` si alguna verificación falla
  - Incluir array `checks` con resultado de cada verificación
  - Incluir `timestamp` en respuesta
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - _Complejidad: M_

- [ ]* 8.2 Escribir tests para health endpoint
  - Test: GET /api/v1/health retorna 200 cuando sistema está operativo
  - Test: GET /api/v1/health retorna 503 cuando DB no responde
  - Test: Respuesta incluye `status`, `timestamp`, `checks`
  - Test: Health check completa en menos de 3 segundos
  - _Requirements: 10.3_
  - _Complejidad: M_

- [ ] 8.3 Implementar endpoint GET /api/v1/metrics
  - Crear `src/app/api/v1/metrics/route.ts`
  - Implementar función `GET(): Promise<Response>`
  - Llamar a `MetricsCollector.getSnapshot()`
  - Retornar 200 con estructura: `counters`, `histograms`, `gauges`
  - Incluir headers de seguridad
  - _Requirements: 6.7_
  - _Complejidad: S_

- [ ]* 8.4 Escribir tests para metrics endpoint
  - Test: GET /api/v1/metrics retorna 200 con estructura correcta
  - Test: Métricas incluyen todos los contadores esperados
  - Test: Histogramas incluyen percentiles p50, p95, p99
  - _Requirements: 10.3_
  - _Complejidad: S_

- [ ] 8.5 Checkpoint - Verificar backend completo
  - Ejecutar suite completa de tests: `npm run test`
  - Verificar cobertura > 85% en todos los módulos críticos
  - Ejecutar linter: `npm run lint`
  - Ejecutar type check: `npx tsc --noEmit`
  - Probar endpoints manualmente con curl o Postman
  - Preguntar al usuario si hay dudas o ajustes necesarios


---

### Fase 2: Integración Frontend (Semana 3)

#### Epic 9: Adaptación del Formulario de Contacto

- [ ] 9.1 Agregar feature flag para API de cotizaciones
  - Agregar variable de entorno `NEXT_PUBLIC_QUOTES_API_ENABLED=false` en `.env.local`
  - Agregar variable de entorno `NEXT_PUBLIC_QUOTES_API_ENABLED=true` en `.env.production`
  - Documentar feature flag en README
  - _Requirements: 12.1_
  - _Complejidad: S_

- [ ] 9.2 Implementar submit real con fetch a /api/v1/quotes
  - Modificar `src/app/components/ContactSection.tsx`
  - Implementar función `submitQuote(payload: QuotePayload): Promise<QuoteResponse>`
  - Usar `fetch('/api/v1/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })`
  - Incluir header `X-Request-Id` generado en cliente (opcional)
  - Mantener fallback a comportamiento actual si feature flag está desactivado
  - _Requirements: 12.1, 12.2_
  - _Complejidad: M_

- [ ] 9.3 Agregar estado de carga durante submit
  - Agregar estado `isSubmitting` en componente
  - Deshabilitar botón de submit mientras `isSubmitting === true`
  - Mostrar spinner o texto "Enviando..." durante submit
  - _Requirements: 12.2_
  - _Complejidad: S_

#### Epic 10: Manejo de Respuestas y Errores

- [ ] 10.1 Implementar manejo de respuesta 201 (éxito)
  - Cuando response.status === 201, mostrar mensaje de éxito
  - Mensaje: "¡Gracias! Hemos recibido tu solicitud de cotización. Te contactaremos pronto."
  - Limpiar formulario después de éxito
  - Scroll a mensaje de éxito
  - _Requirements: 12.3_
  - _Complejidad: S_

- [ ] 10.2 Implementar manejo de respuesta 422 (validación)
  - Cuando response.status === 422, parsear `error.details` array
  - Mostrar errores por campo usando array `details`
  - Formato: `details[].field` → mostrar `details[].issue` debajo del campo correspondiente
  - Mantener valores ingresados en formulario
  - _Requirements: 12.4_
  - _Complejidad: M_

- [ ] 10.3 Implementar manejo de respuesta 429 (rate limit)
  - Cuando response.status === 429, mostrar mensaje específico
  - Mensaje: "Has enviado demasiadas solicitudes. Por favor, intenta de nuevo en unos minutos."
  - Leer header `Retry-After` y mostrar tiempo de espera si está disponible
  - _Requirements: 12.5_
  - _Complejidad: S_

- [ ] 10.4 Implementar manejo de respuestas 500/503 (errores de servidor)
  - Cuando response.status >= 500, mostrar error general recuperable
  - Mensaje: "Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo."
  - Incluir botón "Reintentar" que vuelve a enviar el formulario
  - Implementar exponential backoff: 1s, 2s, 4s (máximo 3 intentos)
  - _Requirements: 12.6_
  - _Complejidad: M_

- [ ] 10.5 Implementar captura y reporte de requestId
  - Leer header `X-Request-Id` de respuesta
  - Almacenar `requestId` en estado del componente
  - En caso de error, mostrar `requestId` en mensaje de error para soporte
  - Formato: "Si el problema persiste, contacta a soporte con el código: {requestId}"
  - _Requirements: 12.7, 13.4_
  - _Complejidad: S_

- [ ]* 10.6 Escribir property test para round-trip serialization
  - **Property 12: Round-trip serialization preserva datos**
  - **Validates: Requirements 11.4, 11.5**
  - Generar 100 objetos `QuoteLeadRecord` válidos
  - Serializar a JSON y parsear de vuelta
  - Verificar que objeto resultante es equivalente al original
  - _Requirements: 10.4_
  - _Complejidad: S_

- [ ]* 10.7 Escribir property test para parsing de JSON inválido
  - **Property 13: Parsing de JSON inválido retorna error estructurado**
  - **Validates: Requirements 11.1, 11.2**
  - Generar 50 strings de JSON malformados
  - Enviar como body a endpoint
  - Verificar que retorna 422 con código `VALIDATION_ERROR`
  - Verificar que mensaje es descriptivo sin exponer detalles internos
  - _Requirements: 10.4_
  - _Complejidad: M_

#### Epic 11: Testing Frontend-Backend

- [ ]* 11.1 Escribir tests de integración frontend-backend
  - Test: Submit de formulario con datos válidos muestra mensaje de éxito
  - Test: Submit con email inválido muestra error en campo email
  - Test: Submit después de 5 intentos muestra mensaje de rate limit
  - Test: Submit con servidor caído muestra error recuperable con botón reintentar
  - Test: Botón de submit se deshabilita durante envío
  - Test: Formulario se limpia después de éxito
  - _Requirements: 10.3_
  - _Complejidad: L_

- [ ] 11.2 Checkpoint - Verificar integración frontend
  - Ejecutar tests de integración: `npm run test -- ContactSection`
  - Probar flujo completo manualmente en navegador
  - Verificar que feature flag funciona correctamente
  - Verificar que todos los estados de respuesta se manejan correctamente
  - Preguntar al usuario si hay dudas o ajustes necesarios

---

### Fase 3: Deployment y Monitoreo (Semana 4)

#### Epic 12: Configuración de Staging

- [ ] 12.1 Provisionar base de datos para staging
  - **Si PostgreSQL:** Crear instancia en Vercel Postgres o proveedor elegido
  - **Si Vercel KV:** Crear store en Vercel dashboard
  - Obtener connection string o API URL/token
  - _Requirements: 3.1_
  - _Complejidad: M_

- [ ] 12.2 Configurar variables de entorno en staging
  - Configurar `DATABASE_URL` (si PostgreSQL) o `KV_REST_API_URL` + `KV_REST_API_TOKEN` (si Vercel KV)
  - Configurar `ALLOWED_ORIGINS` con dominio de staging
  - Configurar `NODE_ENV=staging`
  - Configurar `NEXT_PUBLIC_QUOTES_API_ENABLED=true`
  - Verificar que variables están correctamente configuradas
  - _Requirements: 8.4_
  - _Complejidad: S_

- [ ] 12.3 Ejecutar migraciones de base de datos en staging
  - **Si PostgreSQL:** Ejecutar `npx prisma migrate deploy`
  - **Si Vercel KV:** No requiere migraciones
  - Verificar que schema está correctamente aplicado
  - _Requirements: 3.1_
  - _Complejidad: S_

- [ ] 12.4 Deploy a staging
  - Hacer deploy a entorno de staging (Vercel preview deployment o similar)
  - Verificar que build completa sin errores
  - Verificar que aplicación inicia correctamente
  - _Complejidad: S_

- [ ] 12.5 Ejecutar smoke tests en staging
  - Verificar que GET /api/v1/health retorna 200
  - Verificar que GET /api/v1/metrics retorna 200
  - Enviar cotización de prueba y verificar 201
  - Verificar que datos persisten en base de datos
  - Verificar rate limiting enviando 6 requests
  - Verificar CORS desde dominio permitido
  - _Requirements: 10.3_
  - _Complejidad: M_

- [ ] 12.6 Monitorear logs y métricas en staging por 48 horas
  - Revisar logs estructurados en consola de Vercel o proveedor
  - Verificar que no hay errores 5xx inesperados
  - Verificar que métricas se actualizan correctamente
  - Verificar que PII está enmascarada en logs
  - Documentar cualquier anomalía encontrada
  - _Requirements: 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_
  - _Complejidad: M_

- [ ] 12.7 Checkpoint - Validar staging
  - Revisar resultados de smoke tests
  - Revisar logs de 48 horas
  - Verificar que no hay issues críticos
  - Obtener aprobación del usuario para proceder a producción

#### Epic 13: Deployment a Producción

- [ ] 13.1 Provisionar base de datos para producción
  - **Si PostgreSQL:** Crear instancia en Vercel Postgres o proveedor elegido con plan de producción
  - **Si Vercel KV:** Crear store en Vercel dashboard con plan de producción
  - Configurar backups automáticos (si PostgreSQL)
  - Obtener connection string o API URL/token
  - _Requirements: 3.1_
  - _Complejidad: M_

- [ ] 13.2 Configurar variables de entorno en producción
  - Configurar `DATABASE_URL` (si PostgreSQL) o `KV_REST_API_URL` + `KV_REST_API_TOKEN` (si Vercel KV)
  - Configurar `ALLOWED_ORIGINS` con dominios de producción: `https://camiprint.com,https://www.camiprint.com`
  - Configurar `NODE_ENV=production`
  - Configurar `NEXT_PUBLIC_QUOTES_API_ENABLED=true`
  - Verificar que variables están correctamente configuradas
  - _Requirements: 8.4_
  - _Complejidad: S_

- [ ] 13.3 Ejecutar migraciones de base de datos en producción
  - **Si PostgreSQL:** Ejecutar `npx prisma migrate deploy`
  - **Si Vercel KV:** No requiere migraciones
  - Verificar que schema está correctamente aplicado
  - _Requirements: 3.1_
  - _Complejidad: S_

- [ ] 13.4 Deploy a producción
  - Hacer deploy a producción (Vercel production deployment)
  - Verificar que build completa sin errores
  - Verificar que aplicación inicia correctamente
  - _Complejidad: S_

- [ ] 13.5 Ejecutar smoke tests en producción
  - Verificar que GET /api/v1/health retorna 200
  - Verificar que GET /api/v1/metrics retorna 200
  - Enviar cotización de prueba desde formulario real
  - Verificar que datos persisten en base de datos de producción
  - Verificar que email de confirmación se envía (si implementado)
  - _Requirements: 10.3_
  - _Complejidad: M_

#### Epic 14: Monitoreo y Alertas

- [ ] 14.1 Configurar monitoreo de métricas en tiempo real
  - Configurar dashboard para visualizar métricas de `/api/v1/metrics`
  - Monitorear: `quotes.created.count`, `quotes.validation_error.count`, `quotes.rate_limited.count`, `quotes.internal_error.count`
  - Monitorear: `quotes.request_duration_ms` (p50, p95, p99)
  - Monitorear: `quotes.in_flight_requests`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - _Complejidad: M_

- [ ] 14.2 Configurar alertas para anomalías
  - Alerta: Error rate > 5% por 5 minutos
  - Alerta: p95 latency > 1000ms por 5 minutos
  - Alerta: Health check down por 2 minutos
  - Alerta: Rate limited count > 10% de requests
  - Configurar notificaciones por email o Slack
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.3_
  - _Complejidad: M_

- [ ] 14.3 Documentar runbook de incidentes
  - Crear documento con procedimientos para incidentes comunes:
    - Error rate alto: revisar logs con `requestId`, verificar DB
    - Latencia alta: verificar circuit breaker, revisar queries lentas
    - Health check down: verificar conectividad DB, reiniciar servicio
    - Rate limiting excesivo: investigar IPs, ajustar límites si necesario
  - Incluir comandos útiles para debugging
  - Incluir contactos de escalación
  - _Requirements: 13.1, 13.2, 13.3_
  - _Complejidad: S_

- [ ] 14.4 Verificar checklist de producción
  - [ ] Datos persisten después de restart
  - [ ] Backups configurados (si PostgreSQL)
  - [ ] Índices creados en `createdAt` y `status`
  - [ ] Rate limiting activo (5 req/min)
  - [ ] CORS configurado con whitelist
  - [ ] Headers de seguridad presentes
  - [ ] PII enmascarada en logs
  - [ ] Validación y sanitización completa
  - [ ] Logs estructurados en JSON (producción)
  - [ ] Métricas expuestas en `/api/v1/metrics`
  - [ ] Health check responde en `/api/v1/health`
  - [ ] RequestId en todas las respuestas
  - [ ] Timeouts configurados (5s para DB)
  - [ ] Circuit breaker activo
  - [ ] Errores manejados gracefully
  - [ ] Retry logic en cliente (frontend)
  - [ ] Cobertura > 85% en módulos críticos
  - [ ] Property-based tests pasando (100 iteraciones)
  - [ ] Tests de concurrencia pasando (10 requests)
  - [ ] Integration tests frontend-backend pasando
  - [ ] p95 latencia < 500ms
  - [ ] Sin memory leaks (monitorear heap usage)
  - [ ] Carga de 100 req/min soportada
  - _Complejidad: M_

- [ ] 14.5 Checkpoint final - Validar producción
  - Monitorear métricas por 24 horas
  - Verificar que KPIs técnicos se cumplen:
    - Disponibilidad > 99.5% uptime
    - Latencia p95 < 500ms
    - Tasa de error < 1% de requests
  - Verificar que no hay pérdida de leads
  - Obtener feedback del usuario sobre funcionamiento
  - Documentar lecciones aprendidas

---

## Notes

### Sobre Testing

- **Tests marcados con `*` son opcionales** pero altamente recomendados para garantizar correctitud
- **Property-based tests** requieren 100 iteraciones mínimas para cobertura adecuada
- **Tests de concurrencia** son críticos para validar escrituras sin race conditions
- **Cobertura objetivo:** > 85% en módulos críticos (`validation.ts`, `repository.ts`, `service.ts`, `rate-limiter.ts`, `route.ts`)

### Sobre Persistencia

- **Decisión de persistencia** debe tomarse en tarea 4.1 considerando:
  - **PostgreSQL + Prisma:** Mejor para producción robusta, requiere provisionar DB
  - **Vercel KV:** Mejor para MVP rápido, setup instantáneo, costo por operación
  - **File System:** Solo para desarrollo local, NO usar en producción

### Sobre Feature Flags

- **Feature flag `NEXT_PUBLIC_QUOTES_API_ENABLED`** permite activar/desactivar API sin re-deploy
- Mantener desactivado hasta completar Fase 2 (integración frontend)
- Activar en staging primero, luego en producción después de validación

### Sobre Rollback

- **Trigger de rollback:**
  - Error rate > 10% por 5 minutos
  - p95 latency > 2000ms por 5 minutos
  - Health check down por 2 minutos

- **Procedimiento de rollback:**
  1. Desactivar feature flag `NEXT_PUBLIC_QUOTES_API_ENABLED`
  2. Verificar que formulario vuelve a comportamiento anterior
  3. Investigar causa raíz en logs con `requestId`
  4. Aplicar fix y re-deploy a staging

### Sobre Métricas de Éxito

**KPIs Técnicos (Semana 1 post-launch):**
- Disponibilidad: > 99.5% uptime
- Latencia p95: < 500ms
- Tasa de error: < 1% de requests
- Cobertura de tests: > 85%

**KPIs de Negocio:**
- Leads capturados: 0 pérdidas por fallos técnicos
- Conversión: Mantener o mejorar tasa actual
- Tiempo de respuesta: Feedback inmediato al usuario (< 1s percibido)

### Sobre Compatibilidad con Frontend

- **Mantener experiencia de usuario consistente:** No cambiar diseño visual del formulario
- **Mapeo 1:1 con campos actuales:** API contract debe coincidir exactamente con formulario
- **Estados de carga claros:** Usuario debe saber que su solicitud está siendo procesada
- **Mensajes de error específicos:** Errores de validación deben indicar qué campo corregir

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

