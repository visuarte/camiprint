# Requirements Document

## Introduction

Esta especificacion define la fase inicial de backend para Camiprint: captura de cotizaciones desde la landing y persistencia segura de leads.

## Glossary

- Quote_API: API de backend para registrar solicitudes de cotizacion.
- Quote_Lead: registro de datos enviado desde el formulario de contacto.
- Request_Id: identificador unico por request para trazabilidad.
- Validation_Error: error de payload invalido con detalle por campo.
- Rate_Limit: proteccion contra abuso por exceso de solicitudes.

## Requirements

### Requirement 1: Endpoint de cotizaciones v1

**User Story:** Como negocio, quiero recibir cotizaciones desde el formulario, para convertir leads en oportunidades comerciales.

#### Acceptance Criteria

1. THE Quote_API SHALL expose `POST /api/v1/quotes`.
2. THE endpoint SHALL accept JSON body con campos `name`, `email`, `phone`, `companyName`, `quantity`, `message`.
3. WHEN el payload es valido, THE endpoint SHALL return `201` con `id`, `status`, `createdAt`.
4. WHEN el payload es invalido, THE endpoint SHALL return `422` con errores por campo.

### Requirement 2: Validacion y seguridad

**User Story:** Como sistema, quiero validar y proteger las entradas, para evitar datos corruptos y abuso.

#### Acceptance Criteria

1. THE backend SHALL validate formatos, longitudes y enums definidos.
2. THE backend SHALL trim y sanitizar cadenas de texto antes de persistir.
3. THE backend SHALL enforce body size limit.
4. THE backend SHALL apply rate limiting por IP.
5. THE backend SHALL not expose secretos ni detalles internos en respuestas.

### Requirement 3: Persistencia de leads

**User Story:** Como equipo comercial, quiero guardar cada cotizacion, para gestionarla posteriormente.

#### Acceptance Criteria

1. THE backend SHALL persistir cada lead valido en almacenamiento.
2. THE stored record SHALL include timestamps en UTC (`createdAt`, `updatedAt`).
3. THE stored record SHALL include `status` inicial `received`.
4. THE backend SHALL preserve trazabilidad de origen (`source`).

### Requirement 4: Estandar de errores y observabilidad

**User Story:** Como equipo tecnico, quiero errores consistentes y logs trazables, para operar y depurar rapido.

#### Acceptance Criteria

1. THE backend SHALL return errores con estructura `ok/error/meta`.
2. THE backend SHALL include `requestId` en toda respuesta.
3. THE backend SHALL log route, statusCode y durationMs por request.
4. WHEN ocurre error interno, THE backend SHALL return `500` con codigo estable `INTERNAL_ERROR`.

### Requirement 5: Compatibilidad con frontend actual

**User Story:** Como usuario, quiero que el formulario actual funcione igual, para no romper la experiencia.

#### Acceptance Criteria

1. THE backend contract SHALL mapear 1:1 con el formulario actual.
2. THE frontend SHALL mostrar estado de carga durante submit.
3. WHEN response is `201`, THE frontend SHALL mostrar mensaje de exito.
4. WHEN response is `422`, THE frontend SHALL mostrar errores por campo.
5. WHEN response is `429` o `500`, THE frontend SHALL mostrar error general recuperable.
