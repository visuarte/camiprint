# Requirements Document

## Introduction

Esta especificación define el backend de producción para Camiprint: captura de cotizaciones desde la landing con persistencia durable, observabilidad completa, resiliencia y seguridad robusta.

## Glossary

- **Quote_API**: API de backend para registrar solicitudes de cotización
- **Quote_Lead**: registro de datos enviado desde el formulario de contacto
- **Request_Id**: identificador único por request para trazabilidad distribuida
- **Validation_Error**: error de payload inválido con detalle por campo
- **Rate_Limiter**: componente que protege contra abuso por exceso de solicitudes
- **Structured_Logger**: sistema de logging con campos estructurados para análisis
- **Persistence_Layer**: capa de almacenamiento durable que sobrevive reinicios
- **Sanitizer**: componente que limpia y normaliza entradas para prevenir inyecciones
- **Circuit_Breaker**: patrón que previene cascadas de fallos en dependencias
- **Health_Endpoint**: endpoint que reporta estado del sistema para orquestadores

## Requirements

### Requirement 1: Endpoint de cotizaciones v1

**User Story:** Como negocio, quiero recibir cotizaciones desde el formulario, para convertir leads en oportunidades comerciales.

#### Acceptance Criteria

1. THE Quote_API SHALL expose `POST /api/v1/quotes`
2. THE Quote_API SHALL accept JSON body con campos `name`, `email`, `phone`, `companyName`, `quantity`, `message`
3. WHEN el payload es válido, THE Quote_API SHALL return `201` con `id`, `status`, `createdAt` en menos de 500ms (p95)
4. WHEN el payload es inválido, THE Quote_API SHALL return `422` con errores por campo
5. WHEN el sistema está sobrecargado, THE Quote_API SHALL return `503` con `Retry-After` header
6. THE Quote_API SHALL set `Content-Type: application/json` en todas las respuestas
7. THE Quote_API SHALL validate `Content-Type: application/json` en requests

### Requirement 2: Validación y sanitización robusta

**User Story:** Como sistema, quiero validar y sanitizar entradas rigurosamente, para prevenir inyecciones y datos corruptos.

#### Acceptance Criteria

1. THE Sanitizer SHALL trim espacios en todos los campos de texto
2. THE Sanitizer SHALL normalizar espacios múltiples a uno solo en campos de texto largo
3. THE Sanitizer SHALL remover caracteres de control (excepto newline en `message`)
4. THE Sanitizer SHALL validar formato email según RFC 5322 simplificado
5. THE Sanitizer SHALL validar teléfono con regex `/^[+0-9\s()-]{7,30}$/`
6. THE Sanitizer SHALL validar longitudes: `name` (2-120), `email` (max 254), `phone` (7-30), `companyName` (1-160), `message` (max 2000)
7. THE Sanitizer SHALL validar enum `quantity` contra valores permitidos
8. WHEN validación falla, THE Quote_API SHALL return `422` con array `details` conteniendo `field` e `issue`
9. THE Sanitizer SHALL reject payloads con campos adicionales no especificados
10. THE Sanitizer SHALL reject payloads que excedan 32KB

### Requirement 3: Persistencia durable y transaccional

**User Story:** Como equipo comercial, quiero que cada cotización se guarde de forma permanente, para no perder leads valiosos.

#### Acceptance Criteria

1. THE Persistence_Layer SHALL usar almacenamiento durable que sobreviva reinicios del servidor
2. THE Persistence_Layer SHALL generar IDs únicos con prefijo `q_` y sufijo alfanumérico
3. THE Persistence_Layer SHALL almacenar timestamps `createdAt` y `updatedAt` en formato ISO 8601 UTC
4. THE Persistence_Layer SHALL almacenar `status` inicial como `received`
5. THE Persistence_Layer SHALL almacenar `source` como `landing-contact-form`
6. THE Persistence_Layer SHALL garantizar atomicidad en escrituras (todo o nada)
7. WHEN ocurre fallo de escritura, THE Persistence_Layer SHALL propagar error sin corrupción parcial
8. THE Persistence_Layer SHALL soportar escrituras concurrentes sin race conditions
9. THE Persistence_Layer SHALL indexar por `createdAt` para consultas ordenadas

### Requirement 4: Rate limiting y protección contra abuso

**User Story:** Como sistema, quiero limitar requests por origen, para prevenir abuso y garantizar disponibilidad.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL limitar a 5 requests por IP por ventana de 60 segundos
2. THE Rate_Limiter SHALL usar algoritmo sliding window o token bucket
3. WHEN límite es excedido, THE Rate_Limiter SHALL return `429` con código `RATE_LIMITED`
4. WHEN límite es excedido, THE Rate_Limiter SHALL incluir header `Retry-After` en segundos
5. THE Rate_Limiter SHALL usar almacenamiento en memoria con expiración automática
6. THE Rate_Limiter SHALL identificar origen por IP del header `x-forwarded-for` o `x-real-ip` (con fallback a socket IP)
7. THE Rate_Limiter SHALL incrementar contador `quotes.rate_limited.count` en métricas

### Requirement 5: Logging estructurado y trazabilidad

**User Story:** Como equipo técnico, quiero logs estructurados con contexto completo, para depurar incidentes rápidamente.

#### Acceptance Criteria

1. THE Structured_Logger SHALL registrar cada request con campos: `requestId`, `method`, `path`, `statusCode`, `durationMs`, `timestamp`
2. THE Structured_Logger SHALL registrar errores con campos adicionales: `errorCode`, `errorMessage`, `stackTrace` (solo en desarrollo)
3. THE Structured_Logger SHALL enmascarar PII en logs: mostrar solo primeros 3 caracteres de email y últimos 4 de teléfono
4. THE Structured_Logger SHALL usar formato JSON en producción para parsing automático
5. THE Structured_Logger SHALL incluir `environment` (development/staging/production) en cada log
6. WHEN validación falla, THE Structured_Logger SHALL registrar campos fallidos sin valores sensibles
7. THE Structured_Logger SHALL registrar nivel `info` para requests exitosos, `warn` para 4xx, `error` para 5xx

### Requirement 6: Métricas y monitoreo

**User Story:** Como equipo de operaciones, quiero métricas en tiempo real, para detectar anomalías y degradación.

#### Acceptance Criteria

1. THE Quote_API SHALL exponer contador `quotes.created.count` incrementado en cada 201
2. THE Quote_API SHALL exponer contador `quotes.validation_error.count` incrementado en cada 422
3. THE Quote_API SHALL exponer contador `quotes.rate_limited.count` incrementado en cada 429
4. THE Quote_API SHALL exponer contador `quotes.internal_error.count` incrementado en cada 500
5. THE Quote_API SHALL exponer histograma `quotes.request_duration_ms` con percentiles p50, p95, p99
6. THE Quote_API SHALL exponer gauge `quotes.in_flight_requests` con requests activos
7. THE Quote_API SHALL exponer métricas en formato compatible con Prometheus o similar

### Requirement 7: Health checks y readiness

**User Story:** Como orquestador (Kubernetes/Docker), quiero verificar salud del servicio, para enrutar tráfico correctamente.

#### Acceptance Criteria

1. THE Quote_API SHALL expose `GET /api/v1/health` retornando `200` cuando el sistema está operativo
2. THE Health_Endpoint SHALL verificar conectividad con Persistence_Layer
3. WHEN Persistence_Layer no responde en 2 segundos, THE Health_Endpoint SHALL return `503`
4. THE Health_Endpoint SHALL return JSON con campos: `status` (ok/degraded/down), `timestamp`, `checks` (array de verificaciones)
5. THE Health_Endpoint SHALL completar en menos de 3 segundos (timeout)

### Requirement 8: Seguridad y headers

**User Story:** Como sistema, quiero aplicar mejores prácticas de seguridad HTTP, para proteger usuarios y datos.

#### Acceptance Criteria

1. THE Quote_API SHALL set header `X-Content-Type-Options: nosniff`
2. THE Quote_API SHALL set header `X-Frame-Options: DENY`
3. THE Quote_API SHALL set header `Strict-Transport-Security: max-age=31536000; includeSubDomains` en producción
4. THE Quote_API SHALL configurar CORS permitiendo solo orígenes en whitelist por entorno
5. THE Quote_API SHALL rechazar requests sin `Content-Type: application/json` con `415 Unsupported Media Type`
6. THE Quote_API SHALL no exponer stack traces en respuestas de producción
7. THE Quote_API SHALL no loguear tokens, passwords o secretos completos

### Requirement 9: Resiliencia y timeouts

**User Story:** Como sistema, quiero manejar fallos de dependencias gracefully, para no propagar cascadas de errores.

#### Acceptance Criteria

1. THE Quote_API SHALL aplicar timeout de 5 segundos a operaciones de Persistence_Layer
2. WHEN Persistence_Layer timeout ocurre, THE Quote_API SHALL return `503` con código `SERVICE_UNAVAILABLE`
3. THE Quote_API SHALL implementar Circuit_Breaker para Persistence_Layer con umbral de 5 fallos consecutivos
4. WHEN Circuit_Breaker está abierto, THE Quote_API SHALL return `503` sin intentar escritura
5. THE Circuit_Breaker SHALL intentar recuperación después de 30 segundos (half-open state)
6. THE Quote_API SHALL registrar eventos de circuit breaker en logs y métricas

### Requirement 10: Testing y cobertura

**User Story:** Como equipo de desarrollo, quiero tests exhaustivos, para garantizar correctitud y prevenir regresiones.

#### Acceptance Criteria

1. THE test suite SHALL incluir unit tests para validación con casos válidos e inválidos
2. THE test suite SHALL incluir unit tests para sanitización con caracteres especiales y edge cases
3. THE test suite SHALL incluir integration tests para endpoint con mocks de Persistence_Layer
4. THE test suite SHALL incluir property-based tests para validación (generar 100 payloads aleatorios)
5. THE test suite SHALL incluir tests de concurrencia (10 requests simultáneos sin race conditions)
6. THE test suite SHALL incluir tests de rate limiting (verificar 429 después de límite)
7. THE test suite SHALL alcanzar mínimo 85% de cobertura de líneas en módulos críticos (validation, service, repository)
8. THE test suite SHALL incluir tests de regresión para bugs conocidos

### Requirement 11: Parser y serialización de datos

**User Story:** Como desarrollador, quiero parsear y serializar datos de forma robusta, para evitar corrupción en transformaciones.

#### Acceptance Criteria

1. THE Quote_API SHALL parsear JSON request body con manejo de errores de sintaxis
2. WHEN JSON es inválido, THE Quote_API SHALL return `422` con código `VALIDATION_ERROR` y mensaje descriptivo
3. THE Quote_API SHALL serializar respuestas a JSON válido con encoding UTF-8
4. THE Quote_API SHALL preservar tipos de datos en round-trip: parsear request → procesar → serializar response
5. FOR ALL valid Quote_Lead records, serializar a JSON y parsear SHALL producir objeto equivalente (round-trip property)

### Requirement 12: Compatibilidad con frontend actual

**User Story:** Como usuario, quiero que el formulario actual funcione sin cambios, para mantener experiencia consistente.

#### Acceptance Criteria

1. THE Quote_API contract SHALL mapear 1:1 con campos del formulario actual
2. THE frontend SHALL mostrar estado de carga durante submit
3. WHEN response is `201`, THE frontend SHALL mostrar mensaje de éxito
4. WHEN response is `422`, THE frontend SHALL mostrar errores por campo usando `details` array
5. WHEN response is `429`, THE frontend SHALL mostrar mensaje "Demasiadas solicitudes, intenta en unos minutos"
6. WHEN response is `500` o `503`, THE frontend SHALL mostrar error general recuperable con opción de reintentar
7. THE frontend SHALL incluir `requestId` en reportes de error para soporte

### Requirement 13: Observabilidad de errores

**User Story:** Como equipo de soporte, quiero contexto completo de errores, para resolver incidentes sin reproducción.

#### Acceptance Criteria

1. WHEN error 5xx ocurre, THE Structured_Logger SHALL registrar: `requestId`, `errorCode`, `errorMessage`, `timestamp`, `path`, `method`
2. WHEN error 5xx ocurre, THE Structured_Logger SHALL registrar payload sanitizado (sin PII completa)
3. WHEN Persistence_Layer falla, THE Structured_Logger SHALL registrar tipo de error y duración del intento
4. THE Quote_API SHALL incluir `requestId` en header `X-Request-Id` de respuesta para correlación
5. THE Quote_API SHALL propagar `requestId` a Persistence_Layer para trazabilidad end-to-end
