# Design Document

## Overview

Backend fase 1 para cotizaciones con Next.js App Router Route Handlers, validacion server-side, persistencia y observabilidad.

## Architecture

Propuesta inicial (sin acoplarse a un proveedor concreto):

- API route: `src/app/api/v1/quotes/route.ts`
- Validation layer: `src/server/quotes/validation.ts`
- Service layer: `src/server/quotes/service.ts`
- Repository layer: `src/server/quotes/repository.ts`
- Error mapper: `src/server/http/errors.ts`
- Request id middleware/helper: `src/server/http/request-id.ts`

Flujo:
1. Route handler recibe request.
2. Se genera/propaga requestId.
3. Se parsea y valida payload.
4. Service aplica reglas de negocio.
5. Repository persiste lead.
6. Se responde contrato estandar.

## API Contract

Referencia principal:
- `API_V1_COTIZACIONES_TECNICO.md`

Decision:
- Mantener un unico endpoint POST para fase 1.
- Versionado fijo bajo `/api/v1`.

## Validation Strategy

- Validacion declarativa de schema (tipo zod o equivalente).
- Errores transformados a formato:
  - `code`
  - `message`
  - `details[]`
- Normalizacion:
  - trim de strings
  - colapso de espacios internos en campos de texto largos (opcional)

## Persistence Strategy

Interfaz de repositorio para aislar la DB:

```ts
interface CreateQuoteInput {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  quantity: '10-24' | '25-49' | '50-99' | '100+';
  message?: string;
  source: string;
}

interface QuoteRecord {
  id: string;
  status: 'received' | 'contacted' | 'archived';
  createdAt: string;
}

interface QuotesRepository {
  create(input: CreateQuoteInput): Promise<QuoteRecord>;
}
```

Ventaja:
- Permite cambiar de DB sin tocar handler ni servicio.

## Security

- Body size limit.
- Rate limiting por IP (middleware o wrapper).
- CORS estricto por entorno.
- No exponer stack traces al cliente.

## Observability

Log estructurado en cada request:
- `requestId`, `route`, `method`, `statusCode`, `durationMs`, `errorCode`.

Metrica minima sugerida:
- `quotes.created.count`
- `quotes.validation_error.count`
- `quotes.rate_limited.count`
- `quotes.internal_error.count`

## Testing Plan

Unit tests:
- validation schema
- service mapping
- error mapping

Integration tests:
- POST valido -> 201
- payload invalido -> 422
- rate limit -> 429
- fallo interno -> 500

Frontend integration tests:
- submit exitoso con respuesta 201 real/mocked
- visualizacion de errores por campo con 422

## Migration Plan

1. Implementar API manteniendo formulario actual en modo fallback.
2. Activar submit real por feature flag (`NEXT_PUBLIC_QUOTES_API_ENABLED`).
3. Monitorear errores y latencia en entorno de staging.
4. Activar en produccion.
