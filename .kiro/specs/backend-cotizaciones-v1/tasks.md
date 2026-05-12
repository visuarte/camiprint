# Implementation Plan: Backend Cotizaciones v1

## Tasks

- [ ] 1. Estructura base backend
  - Crear ruta `src/app/api/v1/quotes/route.ts`
  - Crear modulos `validation`, `service`, `repository`, `errors`
  - Definir tipos compartidos de contrato

- [ ] 2. Contrato y validacion
  - Implementar schema de request segun `API_V1_COTIZACIONES_TECNICO.md`
  - Implementar mapper de errores a formato estandar
  - Devolver `422` con `details` por campo

- [ ] 3. Persistencia de leads
  - Implementar `QuotesRepository.create`
  - Persistir `source`, `status`, `createdAt`, `updatedAt`
  - Asegurar UTC en timestamps

- [ ] 4. Seguridad basica
  - Limitar tamano de body
  - Implementar rate limiting por IP
  - Definir CORS por entorno

- [ ] 5. Observabilidad
  - Generar `requestId` por request
  - Incluir `meta.requestId` en respuestas
  - Registrar logs estructurados con duracion

- [ ] 6. Integracion con frontend
  - Reemplazar submit simulado por llamada real a `/api/v1/quotes`
  - Soportar estados 201/422/429/500 en UI
  - Mantener experiencia de formulario existente

- [ ] 7. Testing backend + integracion
  - Unit tests para validacion y mappers
  - Integration tests para endpoint
  - Test de integracion frontend-backend de cotizacion

- [ ] 8. Hardening y despliegue
  - Probar en staging con carga moderada
  - Revisar latencia y errores
  - Activar en produccion con checklist de rollback

## Notes

- Frontend esta en modo estabilidad; evitar cambios visuales fuera de integracion.
- Mantener contrato v1 estable durante toda la fase inicial.
