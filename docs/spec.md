# Spec - Modulo Taller y Produccion

## Objetivo

Implementar el modulo de Taller y Produccion para:
- recepcion de disenos (PDF/TIFF),
- generacion de Job Tickets,
- enrutamiento a departamentos,
- consulta de colas de trabajo por operario,

respetando estrictamente la Arquitectura de Tres Capas con Control Persistente.

## Regla de Arquitectura (obligatoria)

1. Frontend (UI Client Components)
- Solo solicita y visualiza estado.
- No importa Engine ni DB.

2. Backend API (Route Handlers / Server Actions)
- Unico punto de entrada desde UI.
- Valida request con Zod.
- Gestiona upload (Storage/S3).
- Orquesta llamadas al Engine.
- No ejecuta logica de negocio compleja.

3. Engine (capa aislada `engine/` o `core/`)
- Ejecuta logica de negocio pura.
- No importa `next/*`, `react`, cookies, headers, ni objetos HTTP.
- Decide transiciones de estado, creacion de Job Tickets y escrituras de persistencia.

## Alcance funcional

- Envio de disenos por pedido de produccion.
- Validacion de formatos permitidos: PDF, TIFF.
- Almacenamiento de archivo en S3/Storage y persistencia de metadatos.
- Generacion de Job Ticket con datos tecnicos de produccion.
- Enrutamiento automatico a departamentos (ej. PREPRESS, PRINTING, QA, SHIPPING).
- Endpoints de lectura para colas de trabajo filtrables por departamento y estado.

## Modelo de dominio sugerido

### Entidades

1. ProductionOrder
- id
- quoteId
- customerId
- status: `PENDING_ASSETS | READY_FOR_REVIEW | IN_PRODUCTION | BLOCKED | DONE`
- priority: `LOW | NORMAL | HIGH | URGENT`
- createdAt / updatedAt

2. DesignAsset
- id
- productionOrderId
- originalFilename
- mimeType
- extension
- sizeBytes
- storageKey
- checksumSha256
- uploadedBy
- uploadedAt

3. JobTicket
- id
- productionOrderId
- ticketNumber
- garmentType
- printTechnique
- colorCount
- quantity
- dueDate
- notes
- status: `OPEN | IN_PROGRESS | PAUSED | COMPLETED`
- assignedDepartment: `PREPRESS | PRINTING | QA | SHIPPING`
- createdAt / updatedAt

4. WorkQueueItem
- id
- department
- jobTicketId
- position
- queueStatus: `WAITING | ACTIVE | BLOCKED | DONE`
- startedAt
- finishedAt

## Estructura tecnica sugerida

```txt
src/
  app/
    api/
      v1/
        production/
          uploads/route.ts
          tickets/route.ts
          queues/route.ts
  engine/
    production/
      production-engine.ts
      ticket-factory.ts
      routing-policy.ts
      validators.ts
      types.ts
  server/
    production/
      repositories/
      services/
      storage/
```

## Fases y tareas secuenciales

### Fase 1 - Setup de capa Engine aislada

1. Crear `src/engine/production/types.ts` con tipos de dominio.
2. Crear `src/engine/production/validators.ts` con validaciones puras de negocio.
3. Crear `src/engine/production/ticket-factory.ts` para generar Job Tickets.
4. Crear `src/engine/production/routing-policy.ts` para enrutamiento por reglas.
5. Crear `src/engine/production/production-engine.ts` como facade de casos de uso:
   - `registerDesignAsset(...)`
   - `createJobTicket(...)`
   - `routeTicketToDepartment(...)`
   - `getDepartmentQueue(...)`
6. Definir interfaces de puertos (repos/storage) que el Engine consume, sin dependencias de framework.

Criterio de aceptacion:
- Engine compila sin imports de `next/*`, `react` ni objetos HTTP.

### Fase 2 - Endpoints de recepcion y almacenamiento

1. Crear endpoint `POST /api/v1/production/uploads`.
2. Validar request con Zod en API layer:
   - archivo obligatorio,
   - extensiones permitidas `.pdf`, `.tif`, `.tiff`,
   - limite de tamano (ej. 50MB),
   - `productionOrderId` valido.
3. Implementar storage adapter (S3 o equivalente) en `server/storage`.
4. Calcular checksum SHA-256 y persistir metadatos de asset.
5. Llamar al Engine para registrar el asset y actualizar estado de orden.

Criterio de aceptacion:
- Responde 201 con `assetId`, `storageKey`, `requestId`.
- Rechaza archivos invalidos con 422 estandar.

### Fase 3 - Job Tickets y enrutamiento a departamentos

1. Crear endpoint `POST /api/v1/production/tickets`.
2. Validar payload con Zod (datos tecnicos minimos para ticket).
3. Invocar Engine para:
   - generar ticketNumber,
   - asignar estado inicial,
   - enrutar a departamento segun reglas.
4. Persistir ticket y alta en cola.
5. Registrar eventos de auditoria (quien creo, cuando, requestId).

Criterio de aceptacion:
- Responde 201 con `ticketId`, `ticketNumber`, `assignedDepartment`.

### Fase 4 - Endpoints de lectura para cola de operarios

1. Crear endpoint `GET /api/v1/production/queues` con filtros:
   - `department`
   - `queueStatus`
   - `limit`/`cursor`
2. Crear endpoint `GET /api/v1/production/queues/:department`.
3. Resolver datos via Engine + repositorio.
4. Devolver DTO de lectura sin exponer detalles internos de DB.

Criterio de aceptacion:
- Lectura paginada estable y consistente por departamento.

### Fase 5 - Observabilidad, seguridad y resiliencia

1. Incluir `requestId` en todas las respuestas.
2. Logging estructurado por request:
   - route, method, status, duration, errorCode.
3. Rate limit para endpoints de escritura.
4. Politica CORS por entorno.
5. Error contract uniforme:
   - `ok`, `error.code`, `error.message`, `error.details`, `meta.requestId`.

Criterio de aceptacion:
- Errores 422/429/500 con estructura uniforme en toda la API.

### Fase 6 - Pruebas y gates

1. Unit tests Engine (reglas, factory, routing).
2. Integration tests API:
   - upload valido/invalido,
   - creacion ticket,
   - lectura de cola.
3. Contract tests request/response para v1.
4. Activar `architecture-check.hook` en pre-commit y on-save.

Criterio de aceptacion:
- No se permite merge si falla el hook o tests criticos.

## Contratos API v1 (resumen)

### POST /api/v1/production/uploads

201:
```json
{
  "ok": true,
  "data": {
    "assetId": "asset_123",
    "storageKey": "production/2026/05/file.pdf"
  },
  "meta": {
    "requestId": "req_abc"
  }
}
```

### POST /api/v1/production/tickets

201:
```json
{
  "ok": true,
  "data": {
    "ticketId": "jt_123",
    "ticketNumber": "JT-2026-000231",
    "assignedDepartment": "PREPRESS"
  },
  "meta": {
    "requestId": "req_abc"
  }
}
```

### GET /api/v1/production/queues

200:
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "queueItemId": "q_1",
        "jobTicketId": "jt_123",
        "department": "PREPRESS",
        "queueStatus": "WAITING",
        "position": 1
      }
    ],
    "nextCursor": null
  },
  "meta": {
    "requestId": "req_abc"
  }
}
```

## Definicion de Done

- Endpoints v1 implementados y validados con Zod.
- Upload PDF/TIFF funcionando con storage real.
- Job Ticket creado por Engine y enrutado por politica.
- Colas consultables por departamento.
- Hook de arquitectura activo y bloqueando violaciones.
- Tests unit/integration/contract en verde.
