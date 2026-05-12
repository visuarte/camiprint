# API v1 Cotizaciones - Documento Tecnico

Fecha: 2026-05-12
Version: v1
Base path: /api/v1

## 1. Objetivo

Definir el contrato tecnico de la API de cotizaciones para sustituir el submit simulado del frontend por una integracion real, segura y observable.

## 2. Endpoint inicial

Metodo: POST
Ruta: /api/v1/quotes
Content-Type: application/json

## 3. Contrato request

### 3.1 Body JSON

```json
{
  "name": "Carlos Perez",
  "email": "carlos@empresa.com",
  "phone": "+34 600 123 123",
  "companyName": "Camiprint SL",
  "quantity": "50-99",
  "message": "Necesitamos camisetas para evento corporativo"
}
```

### 3.2 Reglas de validacion

- name: requerido, string, 2 a 120 caracteres.
- email: requerido, string, formato email valido, max 254.
- phone: requerido, string, 7 a 30 caracteres, solo `+`, digitos, espacios y `()-`.
- companyName: requerido, string, 1 a 160 caracteres.
- quantity: requerido, enum: `10-24 | 25-49 | 50-99 | 100+`.
- message: opcional, string, max 2000 caracteres.

## 4. Contrato response

### 4.1 Exito 201

```json
{
  "ok": true,
  "data": {
    "id": "q_01JV8Q8R7QW6Y7K8N9P0",
    "status": "received",
    "createdAt": "2026-05-12T18:05:00.000Z"
  },
  "meta": {
    "requestId": "req_5f9db8f7d9ab4af9"
  }
}
```

### 4.2 Error de validacion 422

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Payload invalido",
    "details": [
      {
        "field": "email",
        "issue": "Formato de email invalido"
      }
    ]
  },
  "meta": {
    "requestId": "req_5f9db8f7d9ab4af9"
  }
}
```

### 4.3 Error de limite 429

```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Demasiadas solicitudes, intenta nuevamente en unos minutos"
  },
  "meta": {
    "requestId": "req_5f9db8f7d9ab4af9"
  }
}
```

### 4.4 Error interno 500

```json
{
  "ok": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Error interno"
  },
  "meta": {
    "requestId": "req_5f9db8f7d9ab4af9"
  }
}
```

## 5. Estandar de errores

Todos los errores usan estructura:

```json
{
  "ok": false,
  "error": {
    "code": "STRING_CODE",
    "message": "Mensaje legible",
    "details": []
  },
  "meta": {
    "requestId": "req_x"
  }
}
```

## 6. Persistencia minima sugerida

Tabla/coleccion: quotes

Campos:
- id (string, unico)
- name
- email
- phone
- company_name
- quantity
- message
- status (received | contacted | archived)
- created_at (UTC ISO8601)
- updated_at (UTC ISO8601)
- source (default: landing-v1)

## 7. Seguridad minima

- Validacion server-side obligatoria.
- Sanitizacion de strings (trim + normalizacion).
- Limite de tamano de body.
- Rate limiting por IP + fingerprint basico.
- CORS estricto (solo origenes permitidos).
- No loguear PII completa en texto plano.

## 8. Observabilidad minima

Por request registrar:
- requestId
- route
- method
- statusCode
- durationMs
- errorCode (si aplica)

Correlacion:
- Generar requestId en middleware si no existe.
- Devolver requestId en `meta.requestId`.

## 9. Integracion frontend actual

Mapeo directo desde el formulario actual:
- name -> name
- email -> email
- phone -> phone
- companyName -> companyName
- quantity -> quantity
- message -> message

Comportamiento de UI esperado:
- Durante submit: estado de carga.
- En 201: mostrar mensaje de exito.
- En 422: mostrar errores por campo cuando `details` exista.
- En 429/500: mostrar mensaje general de error.

## 10. Versionado y compatibilidad

- Mantener `v1` estable para no romper el frontend actual.
- Cambios breaking deben salir en `v2`.
- Cambios no breaking: nuevos campos opcionales permitidos.

## 11. Criterio de aceptacion fase 1

- POST /api/v1/quotes operativo en local y produccion.
- Validaciones y errores estandarizados funcionando.
- Persistencia de leads activa.
- RequestId visible en respuestas y logs.
- Frontend integrado sin regresiones en tests existentes.
