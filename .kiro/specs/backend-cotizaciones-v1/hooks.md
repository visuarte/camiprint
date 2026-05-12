# Hooks de Implementacion Backend (Calidad y Control)

Objetivo: reducir errores de integracion y mantener consistencia tecnica durante la fase backend.

## Hook 1: Contract Hook (pre-codigo)

Antes de escribir logica:
- Verificar que request/response coincide con `API_V1_COTIZACIONES_TECNICO.md`.
- Confirmar codigos HTTP y estructura de error.
- Bloquear implementacion si hay dudas de contrato.

## Hook 2: Validation Hook (pre-merge)

Antes de mergear:
- Probar payload valido y 3 payloads invalidos.
- Confirmar que `422` incluye `details` por campo.
- Confirmar que no se filtran detalles internos.

## Hook 3: Observability Hook (pre-merge)

Checklist:
- Toda respuesta incluye `meta.requestId`.
- Logs incluyen `route`, `statusCode`, `durationMs`.
- Error interno mapea a `INTERNAL_ERROR`.

## Hook 4: Security Hook (pre-deploy)

Checklist:
- Rate limiting activo.
- Limite de body activo.
- CORS restringido por entorno.
- Variables sensibles fuera de codigo fuente.

## Hook 5: Integration Hook (pre-deploy)

Checklist:
- Frontend maneja estados 201/422/429/500.
- No hay regresiones en tests existentes.
- Formulario mantiene UX actual (loading, errores, exito).

## Hook 6: Performance Hook (continuo)

Checklist:
- p95 de latencia en endpoint bajo objetivo acordado.
- Sin operaciones bloqueantes innecesarias en handler.
- Persistencia y validacion con costo controlado.

## Sugerencia de automatizacion

Agregar scripts de validacion en CI:
- `npm run test`
- `npm run build`
- tests de endpoint y contrato
- chequeo de cobertura minima en modulos backend
