# Tickets Issue-Ready - Customer Communication

Guia rapida:
1. Copia un bloque completo.
2. Crea una issue nueva en GitHub.
3. Pega titulo, labels y cuerpo.
4. Asignalo al sprint indicado.

---

## ISSUE 1
Titulo: COM-01-T01 Definir matriz de estados, transiciones, mensajes y SLA
Labels sugeridos: epic:com-01, type:product, priority:high, sprint:1

Cuerpo:

### Objetivo
Definir la fuente de verdad de estados del lead y su estrategia de comunicacion para evitar silencio percibido por el cliente.

### Alcance
- Enumerar estados de solicitud y estados de comunicacion.
- Definir transiciones validas.
- Mapear mensaje por estado, canal y SLA.
- Validar tono de copy con ventas/soporte.

### Criterios de aceptacion
- Existe matriz aprobada por negocio y soporte.
- Cada estado tiene mensaje, canal, trigger y SLA.
- No hay estados ambiguos ni sin accion definida.

### Entregables
- Documento de matriz versionada en repo.
- Lista de plantillas iniciales para email y WhatsApp.

### Dependencias
- Ninguna.

---

## ISSUE 2
Titulo: COM-01-T02 Extender contrato de submit de cotizacion con metadata de seguimiento
Labels sugeridos: epic:com-01, type:backend, priority:high, sprint:1

Cuerpo:

### Objetivo
Garantizar que la respuesta del submit devuelva datos de seguimiento para UX y soporte.

### Alcance
- Revisar contrato de POST /api/v1/quotes.
- Confirmar presencia estable de meta.requestId.
- Asegurar estado inicial y timestamp en payload de exito.

### Criterios de aceptacion
- Respuesta 201 incluye id, status, createdAt y meta.requestId.
- Errores mantienen contrato uniforme.
- Tests de contrato en verde.

### Entregables
- Contrato actualizado y documentado.
- Tests API actualizados.

### Dependencias
- COM-01-T01.

---

## ISSUE 3
Titulo: COM-01-T03 UX de confirmacion inmediata en formulario (movil y desktop)
Labels sugeridos: epic:com-01, type:frontend, priority:high, sprint:1

Cuerpo:

### Objetivo
Mostrar al cliente feedback inmediato y tranquilizador tras enviar la solicitud.

### Alcance
- Estado loading claro durante envio.
- Estado success con mensaje humano y siguiente paso.
- Mostrar referencia de seguimiento.
- Estado error con reintento y contacto alternativo.

### Criterios de aceptacion
- Confirmacion visible en menos de 10s tras submit exitoso.
- Mensajes consistentes en iPhone, Android y desktop.
- Sin bloqueo de foco ni elementos invisibles.

### Entregables
- Componentes UI de estado.
- Textos finales aprobados.
- Evidencia QA multi-dispositivo.

### Dependencias
- COM-01-T02.

---

## ISSUE 4
Titulo: COM-01-T04 Servicio de email de recepcion con trazabilidad
Labels sugeridos: epic:com-01, type:backend, type:integrations, priority:high, sprint:1

Cuerpo:

### Objetivo
Enviar un email transaccional de recepcion para confirmar al cliente que su solicitud esta en proceso.

### Alcance
- Definir plantilla de recepcion.
- Enviar email al evento quote.received.
- Registrar resultado de envio (sent o failed).

### Criterios de aceptacion
- Se envia email de recepcion en flujo feliz.
- Si falla envio, queda log estructurado y evento de error.
- Se evita duplicado por idempotencia basica.

### Entregables
- Plantilla email versionada.
- Servicio de envio con logs.
- Tests de integracion.

### Dependencias
- COM-01-T01.

---

## ISSUE 5
Titulo: COM-01-T05 Persistencia de timeline de comunicacion por solicitud
Labels sugeridos: epic:com-01, type:backend, type:data, priority:high, sprint:1

Cuerpo:

### Objetivo
Tener trazabilidad completa de comunicaciones cliente por quoteId.

### Alcance
- Crear modelo o tabla quote_communication_timeline.
- Guardar evento, canal, plantilla, estado, error y requestId.
- Escribir registros en cada envio y fallo.

### Criterios de aceptacion
- Cada quote tiene historial auditable.
- Se puede consultar secuencia temporal de eventos.
- Errores de comunicacion no se pierden.

### Entregables
- Migracion y repositorio.
- Escritura de timeline integrada.
- Pruebas de persistencia.

### Dependencias
- COM-01-T01.

---

## ISSUE 6
Titulo: COM-01-T06 Alerta interna por SLA de primera respuesta incumplido
Labels sugeridos: epic:com-01, type:backend, type:devops, priority:high, sprint:1

Cuerpo:

### Objetivo
Detectar solicitudes sin contacto humano y escalar internamente antes de perder la oportunidad.

### Alcance
- Definir job o scheduler SLA.
- Detectar first_human_response_minutes > 60 (horario comercial).
- Emitir alerta interna con contexto de quote.

### Criterios de aceptacion
- Se genera alerta cuando se incumple SLA-02.
- No hay spam de alertas duplicadas por solicitud.
- Queda registro de alerta emitida.

### Entregables
- Job programado.
- Canal de alerta interno configurado.
- Tests de regla SLA.

### Dependencias
- COM-01-T05.

---

## ISSUE 7
Titulo: COM-02-T01 Endpoint de estado de solicitud para transparencia
Labels sugeridos: epic:com-02, type:backend, priority:medium, sprint:2

Cuerpo:

### Objetivo
Permitir consulta de estado y ETA de la solicitud para reducir incertidumbre del cliente.

### Alcance
- Implementar GET /api/v1/quotes/:id/status.
- Devolver estado actual, ETA y ultima actualizacion.
- Mantener contrato con meta.requestId.

### Criterios de aceptacion
- Endpoint responde 200 con contrato definido.
- Manejo 404, 422 y 500 uniforme.
- Tests de contrato en verde.

### Entregables
- Route y servicio.
- Documentacion API.
- Tests API.

### Dependencias
- COM-01-T05.

---

## ISSUE 8
Titulo: COM-02-T02 Aviso automatico de retraso al cliente con nueva ETA
Labels sugeridos: epic:com-02, type:backend, type:integrations, priority:medium, sprint:2

Cuerpo:

### Objetivo
Informar proactivamente al cliente cuando se rompe SLA para mantener confianza.

### Alcance
- Trigger en quote.sla_breached.
- Plantilla de disculpa y nueva ETA.
- Registro en timeline.

### Criterios de aceptacion
- Se envia aviso solo cuando aplica.
- El mensaje incluye siguiente paso y ETA.
- Se guarda evidencia de envio o fallo.

### Entregables
- Regla de disparo.
- Plantilla delay.
- Integracion timeline.

### Dependencias
- COM-02-T01.

---

## ISSUE 9
Titulo: COM-02-T03 Reintentos, idempotencia y control de fallos en comunicaciones
Labels sugeridos: epic:com-02, type:backend, type:reliability, priority:medium, sprint:2

Cuerpo:

### Objetivo
Evitar perdida silenciosa y duplicidad de mensajes en errores transitorios.

### Alcance
- Reintentos exponenciales para envios fallidos.
- Llave idempotente por quoteId + eventType + channel.
- Registro de fallos terminales.

### Criterios de aceptacion
- No se duplican mensajes por reintento.
- Fallos terminales quedan auditados.
- Pruebas de resiliencia en verde.

### Entregables
- Politica de retries.
- Mecanismo de idempotencia.
- Pruebas de caos basicas.

### Dependencias
- COM-02-T02.

---

## ISSUE 10
Titulo: COM-03-T01 Opt-in de WhatsApp en formulario con consentimiento auditable
Labels sugeridos: epic:com-03, type:frontend, type:legal, priority:medium, sprint:3

Cuerpo:

### Objetivo
Habilitar canal WhatsApp con consentimiento explicito y trazable.

### Alcance
- Checkbox opt-in con texto legal.
- Persistencia de consentimiento y timestamp.
- Ajuste de payload para backend.

### Criterios de aceptacion
- No se envia WhatsApp sin consentimiento.
- Consentimiento queda registrado y consultable.
- UX clara en movil.

### Entregables
- UI de consentimiento.
- Persistencia de opt-in.
- Tests de validacion.

### Dependencias
- COM-01-T03.

---

## ISSUE 11
Titulo: COM-03-T02 Envio de WhatsApp por estados criticos con fallback email
Labels sugeridos: epic:com-03, type:backend, type:integrations, priority:medium, sprint:3

Cuerpo:

### Objetivo
Aumentar contacto efectivo en estados clave usando canal rapido.

### Alcance
- Integracion proveedor WhatsApp.
- Envio por eventos definidos.
- Fallback a email si falla WhatsApp.

### Criterios de aceptacion
- WhatsApp se envia con opt-in valido.
- Si falla, se activa fallback email.
- Todo queda trazado en timeline.

### Entregables
- Adaptador WhatsApp.
- Politica fallback.
- Tests integracion.

### Dependencias
- COM-03-T01.

---

## ISSUE 12
Titulo: COM-03-T03 Dashboard de SLA y conversion para operacion comercial
Labels sugeridos: epic:com-03, type:data, type:ops, priority:medium, sprint:3

Cuerpo:

### Objetivo
Dar visibilidad accionable al equipo sobre tiempos, incidencias y conversion.

### Alcance
- KPI: confirmacion, primera respuesta, stale quotes y dropoff.
- Segmentacion por canal y estado.
- Vista semanal para seguimiento comercial.

### Criterios de aceptacion
- Dashboard disponible y actualizado.
- KPI definidos y entendibles por negocio.
- Permite detectar cuellos de botella.

### Entregables
- Panel operativo.
- Definicion de metricas.
- Guia de lectura para ventas.

### Dependencias
- COM-01 y COM-02 completados.

---

## Plantilla generica reutilizable

Titulo: [EPIC]-[TASK] Nombre corto de la tarea
Labels sugeridos: epic:*, type:*, priority:*, sprint:*

Cuerpo:

### Objetivo
<Que resultado de negocio o usuario se busca>

### Alcance
- <Punto 1>
- <Punto 2>
- <Punto 3>

### Criterios de aceptacion
- <Criterio verificable 1>
- <Criterio verificable 2>
- <Criterio verificable 3>

### Entregables
- <Artefacto 1>
- <Artefacto 2>

### Dependencias
- <Issue o ninguna>
