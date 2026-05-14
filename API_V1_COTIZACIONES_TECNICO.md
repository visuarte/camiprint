# API v1 Cotizaciones - Documento Tecnico

Fecha: 2026-05-14
Version: v1
Base path: /api/v1

## 1. Objetivo

Contrato tecnico de la API de cotizaciones en produccion, con persistencia durable, validacion robusta, resiliencia y observabilidad.

## 2. Endpoints activos

- POST /api/v1/quotes
- GET /api/v1/health
- GET /api/v1/metrics

## 3. Contrato request (POST /quotes)

Content-Type requerido: application/json

Body:
- name
- email
- phone
- companyName
- quantity
- message (opcional)

Reglas de validacion:
- name: requerido, 2 a 120 caracteres.
- email: requerido, regex de frontend, max 254.
- phone: requerido, minimo 7, sin maximo.
- companyName: requerido, 1 a 160.
- quantity: enum exacto 10-24, 25-49, 50-99, 100+.
- message: opcional, max 2000.
- payload maximo: 32KB.
- rechazo de campos extra no permitidos.

## 4. Contrato response (POST /quotes)

Exito:
- 201 con ok true, data id/status/createdAt, meta requestId.

Errores:
- 422 VALIDATION_ERROR para payload invalido o JSON invalido.
- 429 RATE_LIMITED con Retry-After.
- 415 UNSUPPORTED_MEDIA_TYPE si Content-Type no es application/json.
- 413 PAYLOAD_TOO_LARGE si body supera 32KB.
- 503 SERVICE_UNAVAILABLE con Retry-After (timeout o circuit breaker).
- 500 INTERNAL_ERROR para fallo inesperado.

Estandar comun:
- ok siempre presente.
- meta.requestId siempre presente.

## 5. Headers de respuesta

Siempre:
- Content-Type application/json en respuestas JSON.
- X-Request-Id.
- X-Content-Type-Options: nosniff.
- X-Frame-Options: DENY.

En produccion:
- Strict-Transport-Security: max-age=31536000; includeSubDomains.

## 6. Persistencia real

- Source persistido: landing-contact-form.
- Status inicial: received.
- Fechas: ISO 8601 UTC.
- Escrituras atomicas y serializadas para evitar corrupcion.

## 7. Observabilidad real

- Logs estructurados por request con requestId, metodo, ruta, status, duracion.
- Enmascaramiento de PII en email y telefono.
- Metricas runtime:
  - quotes_created_count
  - quotes_validation_error_count
  - quotes_rate_limited_count
  - quotes_internal_error_count
  - quotes_circuit_open_count
  - quotes_in_flight_requests
  - percentiles de latencia p50/p95/p99
  - labels por status e IP enmascarada

## 8. Integracion frontend

Mensajes esperados:
- 201: Solicitud enviada. Te contactaremos en breve.
- 422: mapeo por campo con details.
- 429: Hay alta demanda en este momento. Intentalo nuevamente en unos minutos.
- 500 o 503: No pudimos procesar tu solicitud. Intentalo de nuevo.

## 9. Versionado y compatibilidad

- Mantener v1 estable para no romper frontend actual.
- Cambios breaking salen en v2.
- Cambios no breaking: solo campos opcionales nuevos.

## 10. Criterio de aceptacion fase 1 (estado actual)

- POST /api/v1/quotes operativo.
- Validaciones y errores estandarizados funcionando.
- Persistencia durable activa.
- requestId visible en body y header.
- Frontend integrado sin regresiones en pruebas automatizadas.
