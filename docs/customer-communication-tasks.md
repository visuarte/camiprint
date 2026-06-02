# Plan de Ejecucion - Comunicacion Cliente (Basado en Spec)

Referencia principal: `docs/customer-communication-spec.md`

## Sprint 1 - MVP Anti-Abandono

## Objetivo
Garantizar que cada lead recibe confirmacion y que el equipo interno detecta silencio antes de perder la oportunidad.

## Tasks
- [ ] COM-01-T01 Definir matriz de estados/transiciones/mensajes/canal/SLA.
  - Skill: Backend/Product
  - Owner sugerido: Tech Lead + Ventas
  - Dependencias: ninguna
  - Estimacion: 0.5d

- [ ] COM-01-T02 Extender contrato de submit con metadata de seguimiento.
  - Skill: Backend API
  - Owner sugerido: Backend
  - Dependencias: COM-01-T01
  - Estimacion: 0.5d

- [ ] COM-01-T03 Implementar UX de confirmacion inmediata (móvil + desktop).
  - Skill: Frontend UX
  - Owner sugerido: Frontend
  - Dependencias: COM-01-T02
  - Estimacion: 1d

- [ ] COM-01-T04 Servicio email de recepcion + trazabilidad.
  - Skill: Backend Integrations
  - Owner sugerido: Backend Integrations
  - Dependencias: COM-01-T01
  - Estimacion: 1d

- [ ] COM-01-T05 Persistir timeline de comunicacion.
  - Skill: Backend Data
  - Owner sugerido: Backend
  - Dependencias: COM-01-T01
  - Estimacion: 1d

- [ ] COM-01-T06 Alertado por SLA-02 incumplido (primer contacto).
  - Skill: Backend/DevOps
  - Owner sugerido: Backend + DevOps
  - Dependencias: COM-01-T05
  - Estimacion: 1d

## Gate de salida Sprint 1
- [ ] Confirmacion visible inmediata en formulario.
- [ ] Email de recepcion entregado y registrado.
- [ ] Alerta interna activada si > 60 min sin respuesta.

## Sprint 2 - Transparencia Operativa

## Objetivo
Hacer visible el estado y automatizar comunicacion de retrasos sin friccion.

## Tasks
- [ ] COM-02-T01 Endpoint de estado de solicitud.
  - Skill: Backend API
  - Estimacion: 1d

- [ ] COM-02-T02 Aviso de retraso automatico al cliente.
  - Skill: Backend Integrations
  - Estimacion: 1d

- [ ] COM-02-T03 Reintentos + idempotencia + dead-letter.
  - Skill: Backend Reliability
  - Estimacion: 1.5d

## Gate de salida Sprint 2
- [ ] Estado consultable por solicitud.
- [ ] Aviso de retraso enviado una sola vez por breach.
- [ ] No hay perdida silenciosa de mensajes.

## Sprint 3 - Omnicanal y Optimización

## Objetivo
Aumentar contacto efectivo y cerrar mas presupuestos.

## Tasks
- [ ] COM-03-T01 Opt-in WhatsApp en formulario.
  - Skill: Frontend + Legal
  - Estimacion: 0.5d

- [ ] COM-03-T02 Envio WhatsApp con fallback email.
  - Skill: Backend Integrations
  - Estimacion: 1.5d

- [ ] COM-03-T03 Dashboard KPI SLA/conversion.
  - Skill: Data/BI
  - Estimacion: 1d

## Gate de salida Sprint 3
- [ ] Canal WhatsApp operativo con consentimiento.
- [ ] Dashboard semanal para decisiones comerciales.

## QA transversal (cada sprint)
- [ ] Unit tests reglas de SLA/transiciones.
- [ ] Integration tests APIs nuevas.
- [ ] E2E móvil iPhone + Android.
- [ ] Pruebas de fallo proveedor y reintentos.

## Criterio final de cierre
- [ ] 95% confirmaciones < 10s.
- [ ] 90% primera respuesta humana < 60 min (horario comercial).
- [ ] Reduccion medible del abandono post-formulario.
