# Spec - Comunicacion Proactiva Cliente (Anti-Abandono)

## 1) Objetivo

Disenar e implementar un sistema de comunicacion proactiva para que el cliente nunca se sienta abandonado tras enviar una solicitud de presupuesto.

Resultado esperado:
- confirmacion inmediata,
- visibilidad del estado de su solicitud,
- tiempos estimados claros,
- avisos de retraso,
- seguimiento automatizado por email y canal directo (WhatsApp).

## 2) KPI y metas de negocio

### KPI primarios
- `first_confirmation_latency_ms`: tiempo desde submit hasta primera confirmacion visible.
- `first_human_response_minutes`: tiempo hasta primera respuesta comercial real.
- `stale_quote_count`: solicitudes sin actualizacion > SLA.
- `quote_dropoff_rate`: abandono entre solicitud y propuesta.

### Objetivos MVP (30 dias)
- 95% confirmaciones iniciales < 10s.
- 90% solicitudes con primera respuesta humana < 60 min en horario comercial.
- Reducir abandono post-formulario en >= 20%.

## 3) Alcance

### Incluido (MVP)
- Confirmacion inmediata en UI tras envio.
- Email transaccional de recepcion con identificador de seguimiento.
- Timeline de estado interno por solicitud.
- Alertas internas por SLA incumplido.
- Endpoint watchdog para visibilidad del formulario (ya activo).

### Incluido (Fase 2)
- Notificacion WhatsApp al cliente (opt-in).
- Recordatorio automatico al comercial si no hubo respuesta.
- Mensajes de retraso transparentes al cliente.

### Excluido (por ahora)
- Portal cliente autenticado de autoservicio.
- Integracion CRM bidireccional completa.

## 4) Diseno funcional

## Estados de solicitud

`RECEIVED -> TRIAGE -> IN_REVIEW -> QUOTE_DRAFTING -> QUOTE_SENT -> WON | LOST | EXPIRED`

Estados de comunicacion al cliente:
- `CONFIRMATION_SENT`
- `ACK_WITH_ETA_SENT`
- `DELAY_NOTICE_SENT`
- `QUOTE_SENT_NOTICE`
- `FOLLOWUP_SENT`

## Reglas de SLA

- SLA-01 Confirmacion inmediata: <= 10s tras submit.
- SLA-02 Primer contacto humano: <= 60 min horario comercial.
- SLA-03 Propuesta inicial: <= 24h laborables (salvo complejidad alta).
- SLA-04 Si incumple SLA-02 o SLA-03: enviar aviso de retraso + nueva ETA.

## Mensajeria (tono)

Principios:
- claro, humano, accionable,
- sin tecnicismos,
- siempre incluir siguiente paso y tiempo estimado.

Plantillas minimas MVP:
- Recepcion inmediata.
- Confirmacion de revision con ETA.
- Aviso de retraso con disculpa + nueva ETA.
- Propuesta enviada + CTA claro.

## 5) Diseno tecnico

## Arquitectura de eventos

Eventos de dominio:
- `quote.received`
- `quote.triaged`
- `quote.in_review`
- `quote.sent`
- `quote.sla_breached`

Eventos de comunicacion:
- `comm.confirmation.sent`
- `comm.eta.sent`
- `comm.delay_notice.sent`
- `comm.quote_notice.sent`
- `comm.failed`

## Componentes

1. UI Contacto (frontend)
- muestra estado de envio y requestId.
- fallback UX en error de red.

2. API Quotes (backend)
- valida payload,
- persiste solicitud,
- dispara evento `quote.received`.

3. Orquestador de comunicaciones (backend service)
- consume eventos,
- selecciona plantilla,
- envia por canal,
- registra trazabilidad e idempotencia.

4. Scheduler SLA (cron)
- detecta solicitudes estancadas,
- genera `quote.sla_breached`,
- dispara alertas internas y mensaje al cliente.

5. Observabilidad
- logs estructurados por `requestId`,
- metricas de latencia y entrega,
- panel de SLA roto.

## Modelo de datos sugerido

### `quote_communication_timeline`
- `id`
- `quote_id`
- `event_type`
- `channel` (`email|whatsapp|internal`)
- `status` (`queued|sent|failed`)
- `template_key`
- `payload_snapshot_json`
- `sent_at`
- `error_code`
- `request_id`

### `quote_sla_state`
- `quote_id`
- `first_response_due_at`
- `proposal_due_at`
- `last_customer_update_at`
- `breach_count`
- `is_breached`

## APIs/contratos propuestos

### POST `/api/v1/quotes` (existente, ampliar respuesta)
201:
```json
{
  "ok": true,
  "data": {
    "id": "q_123",
    "status": "RECEIVED",
    "createdAt": "2026-06-02T10:00:00.000Z"
  },
  "meta": {
    "requestId": "req_abc"
  }
}
```

### GET `/api/v1/quotes/:id/status` (nuevo)
200:
```json
{
  "ok": true,
  "data": {
    "quoteId": "q_123",
    "status": "IN_REVIEW",
    "eta": "2026-06-02T14:00:00.000Z",
    "lastUpdateAt": "2026-06-02T10:20:00.000Z"
  },
  "meta": {
    "requestId": "req_xyz"
  }
}
```

### POST `/api/v1/internal/quotes/:id/transition` (nuevo, interno/admin)
- aplica cambio de estado + dispara evento comunicacional correspondiente.

## 6) Plan de implementacion por fases

### Fase A - MVP anti-abandono (1 sprint)
- Confirmacion inmediata UI + requestId.
- Email de recepcion automatico.
- Timeline persistida en backend.
- Alertas internas por SLA-02.

Criterio de salida:
- flujo completo funcionando en prod con logs y metricas.

### Fase B - Transparencia y continuidad (1 sprint)
- Estado consultable por `quoteId`.
- Avisos de retraso automaticos.
- Reglas de reintento e idempotencia en comunicaciones.

Criterio de salida:
- 0 duplicados de notificacion por misma transicion.

### Fase C - Escalado comercial (1 sprint)
- WhatsApp opt-in.
- Recordatorios inteligentes para comerciales.
- Dashboard de SLA y conversion.

Criterio de salida:
- mejora medible de respuesta y reduccion de abandono.

## 7) Backlog de tareas con skill recomendado

## Epic COM-01 (MVP anti-abandono)

### COM-01-T01 - Definir catalogo de estados y transiciones
- Skill: `Backend/Product`
- Entregable: matriz estados -> mensaje -> canal -> SLA.
- Aceptacion: documento validado por ventas + soporte.

### COM-01-T02 - Extender respuesta del submit con metadata de seguimiento
- Skill: `Backend API`
- Entregable: contrato de respuesta estable con `requestId`.
- Aceptacion: tests de contrato verdes.

### COM-01-T03 - UX de confirmacion inmediata en formulario
- Skill: `Frontend UX`
- Entregable: estados loading/success/error con copy final.
- Aceptacion: visible en movil iPhone/Android y desktop.

### COM-01-T04 - Servicio de envio email de recepcion
- Skill: `Backend Integrations`
- Entregable: plantilla + envio + registro de entrega.
- Aceptacion: email recibido y trazado en timeline.

### COM-01-T05 - Persistencia timeline de comunicacion
- Skill: `Backend Data`
- Entregable: tabla/modelo + writes por evento.
- Aceptacion: cada solicitud tiene historial auditable.

### COM-01-T06 - Alerta interna por SLA incumplido (primer contacto)
- Skill: `Backend/DevOps`
- Entregable: job programado + alerta canal interno.
- Aceptacion: genera alerta al superar 60 min.

## Epic COM-02 (Transparencia)

### COM-02-T01 - Endpoint de estado de solicitud
- Skill: `Backend API`
- Entregable: `GET /api/v1/quotes/:id/status`.
- Aceptacion: devuelve estado/ETA/ultima actualizacion.

### COM-02-T02 - Aviso automatico de retraso al cliente
- Skill: `Backend Integrations`
- Entregable: plantilla delay + regla de disparo.
- Aceptacion: envio unico por breach (idempotente).

### COM-02-T03 - Politica de reintentos y dead-letter
- Skill: `Backend Reliability`
- Entregable: reintentos exponenciales + registro de fallos.
- Aceptacion: no perdida silenciosa de mensajes.

## Epic COM-03 (Omnicanal y optimizacion)

### COM-03-T01 - WhatsApp opt-in en formulario
- Skill: `Frontend + Legal`
- Entregable: checkbox consentimiento + texto legal.
- Aceptacion: consentimiento persistido y auditable.

### COM-03-T02 - Envio WhatsApp por estado critico
- Skill: `Backend Integrations`
- Entregable: canal secundario con fallback email.
- Aceptacion: entrega confirmada o fallback ejecutado.

### COM-03-T03 - Dashboard SLA/conversion
- Skill: `Data/BI`
- Entregable: panel operativo por dia, canal y estado.
- Aceptacion: lectura semanal accionable por equipo comercial.

## 8) QA / pruebas requeridas

- Unit tests de reglas de transicion y SLA.
- Integration tests API de submit y status.
- E2E movil (iPhone, Android) para formulario y confirmaciones.
- Test de resiliencia: fallo proveedor email/WhatsApp.
- Test de idempotencia: no duplicar mensajes ante reintentos.

## 9) Riesgos y mitigaciones

- Riesgo: saturacion comercial en picos de demanda.
  Mitigacion: cola de prioridades + aviso de ETA real.

- Riesgo: duplicado de mensajes por retries.
  Mitigacion: llaves idempotentes por `quoteId + eventType + channel`.

- Riesgo: tono inconsistente y percepcion robotica.
  Mitigacion: biblioteca de copy aprobada por ventas.

## 10) Definition of Done (incidente cerrado)

- Confirmacion inmediata visible en todos los dispositivos principales.
- Cliente recibe al menos 1 mensaje transaccional de recepcion.
- Solicitudes sin respuesta detectadas y escaladas automaticamente.
- Timeline completa por solicitud disponible para soporte.
- KPIs primarios medibles en dashboard operativo.
