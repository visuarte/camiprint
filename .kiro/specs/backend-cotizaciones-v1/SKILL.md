# SKILL: Implementacion Backend Cotizaciones v1

## Cuando usar este skill

Usar este skill cuando se implementen o modifiquen:
- Endpoint `POST /api/v1/quotes`
- Validacion de payload de cotizacion
- Persistencia de leads de contacto
- Manejo de errores API y observabilidad
- Integracion frontend con backend de cotizaciones

## Objetivo

Asegurar una implementacion consistente con:
- Contrato v1 estable
- Seguridad minima
- Errores estandarizados
- Trazabilidad con requestId
- Compatibilidad con frontend existente

## Entradas obligatorias

- `API_V1_COTIZACIONES_TECNICO.md`
- `.kiro/specs/backend-cotizaciones-v1/requirements.md`
- `.kiro/specs/backend-cotizaciones-v1/design.md`
- `.kiro/specs/backend-cotizaciones-v1/hooks.md`

## Hook de ejecucion (orden recomendado)

1. Contract Hook:
   - Confirmar request/response y codigos.
2. Validation Hook:
   - Implementar schema y mapper de errores.
3. Repository Hook:
   - Implementar persistencia con timestamps UTC.
4. Observability Hook:
   - Inyectar requestId y logs estructurados.
5. Integration Hook:
   - Conectar formulario frontend con manejo de estados.
6. Performance Hook:
   - Revisar latencia p95 y carga moderada.

## Checklist de salida minima

- Endpoint operativo local.
- 201/422/429/500 correctos.
- requestId presente en respuesta.
- Logs y metricas base disponibles.
- Tests de endpoint e integracion en verde.
