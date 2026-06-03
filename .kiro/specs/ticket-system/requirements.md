# Requirements Document

## Introduction

El sistema de tickets de incidencias para CAMIART es una soluciÃ³n integral de gestiÃ³n de soporte que permite a clientes y usuarios internos reportar problemas, consultas y solicitudes. El sistema facilita la asignaciÃ³n, priorizaciÃ³n, seguimiento y resoluciÃ³n de incidencias, con comunicaciÃ³n bidireccional, notificaciones automÃ¡ticas, seguimiento de SLA, base de conocimientos y reportes de desempeÃ±o. Se integrarÃ¡ con el customer-portal existente y soportarÃ¡ mÃºltiples canales de entrada.

## Glossary

- **Ticket_System**: El sistema completo de gestiÃ³n de tickets de incidencias de CAMIART
- **Ticket**: Una incidencia, problema, consulta o solicitud registrada en el sistema
- **Client**: Usuario externo de CAMIART que puede crear y consultar tickets
- **Support_Agent**: Usuario interno del equipo de soporte que gestiona y resuelve tickets
- **Admin**: Usuario con permisos administrativos para configurar el sistema
- **Priority**: Nivel de urgencia de un ticket (Baja, Media, Alta, CrÃ­tica)
- **Status**: Estado actual de un ticket (Nuevo, Asignado, En Progreso, Esperando Cliente, Resuelto, Cerrado)
- **Category**: ClasificaciÃ³n temÃ¡tica del ticket (ej: TÃ©cnico, FacturaciÃ³n, Consulta General)
- **SLA**: Service Level Agreement - Acuerdo de nivel de servicio que define tiempos mÃ¡ximos de respuesta y resoluciÃ³n
- **Knowledge_Base**: Base de conocimientos con artÃ­culos de autoservicio
- **Message**: ComunicaciÃ³n dentro de un ticket entre Client y Support_Agent
- **Notification**: Alerta enviada por email o sistema cuando ocurre una actualizaciÃ³n
- **Customer_Portal**: Portal existente de CAMIART donde los clientes acceden a sus servicios
- **Assignment**: AcciÃ³n de asignar un ticket a un Support_Agent especÃ­fico
- **Response_Time**: Tiempo transcurrido desde la creaciÃ³n del ticket hasta la primera respuesta
- **Resolution_Time**: Tiempo transcurrido desde la creaciÃ³n del ticket hasta su resoluciÃ³n
- **Attachment**: Archivo adjunto a un ticket o mensaje
- **Escalation**: Proceso de elevar la prioridad o visibilidad de un ticket

## Requirements

### Requirement 1: CreaciÃ³n de Tickets por Clientes

**User Story:** Como cliente de CAMIART, quiero crear tickets de incidencias desde el customer-portal, para que pueda reportar problemas, hacer consultas o solicitar ayuda.

#### Acceptance Criteria

1. WHEN a Client accesses the ticket creation form, THE Ticket_System SHALL display fields for title, description, category, and attachments
2. WHEN a Client submits a valid ticket, THE Ticket_System SHALL create the ticket with status "Nuevo" and priority "Media" by default
3. WHEN a Client submits a ticket, THE Ticket_System SHALL generate a unique ticket identifier
4. WHEN a ticket is created, THE Ticket_System SHALL send a confirmation notification to the Client
5. IF a Client submits a ticket with missing required fields, THEN THE Ticket_System SHALL return a validation error with specific field requirements
6. WHEN a Client attaches files to a ticket, THE Ticket_System SHALL validate file types and size limits (max 10MB per file, max 5 files)

### Requirement 2: CreaciÃ³n de Tickets por Usuarios Internos

**User Story:** Como Support_Agent, quiero crear tickets en nombre de clientes, para que pueda registrar incidencias reportadas por otros canales como telÃ©fono o email.

#### Acceptance Criteria

1. WHEN a Support_Agent accesses the ticket creation form, THE Ticket_System SHALL display all fields including client selection, priority, and category
2. WHEN a Support_Agent creates a ticket, THE Ticket_System SHALL allow setting the initial priority and status
3. WHEN a Support_Agent creates a ticket for a Client, THE Ticket_System SHALL send a notification to that Client
4. THE Ticket_System SHALL record which Support_Agent created the ticket

### Requirement 3: VisualizaciÃ³n de Tickets

**User Story:** Como Client, quiero ver una lista de mis tickets y sus detalles, para que pueda hacer seguimiento de mis incidencias.

#### Acceptance Criteria

1. WHEN a Client accesses the ticket list, THE Ticket_System SHALL display only tickets created by or assigned to that Client
2. WHEN a Client views a ticket, THE Ticket_System SHALL display ticket details including title, description, status, priority, creation date, and all messages
3. THE Ticket_System SHALL display tickets ordered by most recent activity first
4. WHEN a Client filters tickets, THE Ticket_System SHALL support filtering by status, priority, and category
5. WHEN a Client searches tickets, THE Ticket_System SHALL search by ticket ID, title, and description content

### Requirement 4: GestiÃ³n de Tickets por Soporte

**User Story:** Como Support_Agent, quiero ver y gestionar todos los tickets, para que pueda organizar y priorizar mi trabajo de soporte.

#### Acceptance Criteria

1. WHEN a Support_Agent accesses the ticket dashboard, THE Ticket_System SHALL display all tickets with their current status, priority, and assignment
2. WHEN a Support_Agent filters tickets, THE Ticket_System SHALL support filtering by status, priority, category, assignment, and date range
3. WHEN a Support_Agent views unassigned tickets, THE Ticket_System SHALL highlight tickets that exceed SLA response time
4. THE Ticket_System SHALL display ticket count by status and priority in the dashboard
5. WHEN a Support_Agent searches tickets, THE Ticket_System SHALL search across all ticket fields including client name and messages

### Requirement 5: AsignaciÃ³n de Tickets

**User Story:** Como Support_Agent o Admin, quiero asignar tickets a miembros del equipo, para que las incidencias sean atendidas por la persona adecuada.

#### Acceptance Criteria

1. WHEN a Support_Agent assigns a ticket, THE Ticket_System SHALL update the ticket status to "Asignado"
2. WHEN a ticket is assigned, THE Ticket_System SHALL send a notification to the assigned Support_Agent
3. WHEN a ticket is reassigned, THE Ticket_System SHALL record the assignment history
4. THE Ticket_System SHALL allow a Support_Agent to assign tickets to themselves
5. WHERE auto-assignment is enabled, WHEN a new ticket is created, THE Ticket_System SHALL assign it to the Support_Agent with the lowest current workload in the relevant category

### Requirement 6: ActualizaciÃ³n de Estado y Prioridad

**User Story:** Como Support_Agent, quiero actualizar el estado y prioridad de tickets, para que reflejen el progreso y urgencia actual.

#### Acceptance Criteria

1. WHEN a Support_Agent updates ticket status, THE Ticket_System SHALL validate the status transition is allowed (Nuevo â†’ Asignado â†’ En Progreso â†’ Resuelto â†’ Cerrado)
2. WHEN a Support_Agent changes ticket priority, THE Ticket_System SHALL record the change with timestamp and reason
3. WHEN a ticket status changes to "Esperando Cliente", THE Ticket_System SHALL send a notification to the Client
4. WHEN a ticket status changes to "Resuelto", THE Ticket_System SHALL record the resolution time
5. IF a ticket in "Esperando Cliente" status receives no response within 72 hours, THEN THE Ticket_System SHALL send a reminder notification to the Client
6. WHEN a ticket status changes to "Cerrado", THE Ticket_System SHALL prevent further modifications except by Admin

### Requirement 7: Sistema de MensajerÃ­a Bidireccional

**User Story:** Como Client o Support_Agent, quiero enviar y recibir mensajes dentro de un ticket, para que pueda comunicarme efectivamente sobre la incidencia.

#### Acceptance Criteria

1. WHEN a Client or Support_Agent submits a message, THE Ticket_System SHALL add the message to the ticket with timestamp and author
2. WHEN a new message is added, THE Ticket_System SHALL send a notification to all participants except the author
3. WHEN a Client adds a message to a ticket in "Esperando Cliente" status, THE Ticket_System SHALL change the status to "En Progreso"
4. THE Ticket_System SHALL support message attachments with the same validation as ticket attachments
5. THE Ticket_System SHALL display messages in chronological order with clear visual distinction between Client and Support_Agent messages
6. WHEN a Support_Agent adds an internal note, THE Ticket_System SHALL mark it as internal and hide it from the Client

### Requirement 8: Notificaciones por Email

**User Story:** Como usuario del sistema, quiero recibir notificaciones por email de actualizaciones importantes, para que estÃ© informado sin necesidad de revisar constantemente el sistema.

#### Acceptance Criteria

1. WHEN a ticket is created, THE Ticket_System SHALL send an email notification to the Client with ticket details and tracking link
2. WHEN a ticket is assigned, THE Ticket_System SHALL send an email notification to the assigned Support_Agent
3. WHEN a new message is added to a ticket, THE Ticket_System SHALL send an email notification to all participants except the author
4. WHEN a ticket status changes, THE Ticket_System SHALL send an email notification to the Client and assigned Support_Agent
5. WHERE a user has configured notification preferences, THE Ticket_System SHALL respect those preferences for email frequency and types
6. THE Ticket_System SHALL include a direct link to the ticket in all email notifications

### Requirement 9: Notificaciones en Sistema

**User Story:** Como usuario del sistema, quiero ver notificaciones en tiempo real dentro de la aplicaciÃ³n, para que pueda responder rÃ¡pidamente a actualizaciones importantes.

#### Acceptance Criteria

1. WHEN a notification event occurs, THE Ticket_System SHALL create an in-app notification for the relevant user
2. WHEN a user accesses the system, THE Ticket_System SHALL display unread notification count in the navigation
3. WHEN a user views the notification panel, THE Ticket_System SHALL display notifications ordered by most recent first
4. WHEN a user clicks a notification, THE Ticket_System SHALL mark it as read and navigate to the relevant ticket
5. THE Ticket_System SHALL retain notifications for 30 days
6. WHEN a user marks all notifications as read, THE Ticket_System SHALL update all unread notifications to read status

### Requirement 10: Seguimiento de SLA

**User Story:** Como Admin, quiero definir y hacer seguimiento de SLAs por prioridad, para que el equipo cumpla con los tiempos de respuesta y resoluciÃ³n comprometidos.

#### Acceptance Criteria

1. THE Ticket_System SHALL allow Admin to configure response time and resolution time targets for each priority level
2. WHEN a ticket is created, THE Ticket_System SHALL calculate SLA deadlines based on priority and configured targets
3. WHILE a ticket is open, THE Ticket_System SHALL track elapsed time against SLA targets
4. WHEN a ticket exceeds 75% of SLA response time without a response, THE Ticket_System SHALL send a warning notification to assigned Support_Agent and their supervisor
5. WHEN a ticket exceeds SLA response time, THE Ticket_System SHALL mark it as "SLA Breached" and send escalation notification
6. THE Ticket_System SHALL exclude non-business hours from SLA time calculations based on configured business hours
7. WHEN a ticket status is "Esperando Cliente", THE Ticket_System SHALL pause SLA time tracking

### Requirement 11: Base de Conocimientos

**User Story:** Como Client, quiero buscar y consultar artÃ­culos de ayuda, para que pueda resolver problemas comunes sin crear un ticket.

#### Acceptance Criteria

1. WHEN a Client accesses the Knowledge_Base, THE Ticket_System SHALL display published articles organized by category
2. WHEN a Client searches the Knowledge_Base, THE Ticket_System SHALL return relevant articles ranked by relevance
3. WHEN a Client views an article, THE Ticket_System SHALL display the article content with formatting, images, and related articles
4. THE Ticket_System SHALL track article view count and helpful/not helpful ratings
5. WHEN a Client creates a ticket, THE Ticket_System SHALL suggest relevant Knowledge_Base articles based on the ticket title and description
6. THE Ticket_System SHALL display the most viewed and highest rated articles on the Knowledge_Base home page

### Requirement 12: GestiÃ³n de Base de Conocimientos

**User Story:** Como Support_Agent o Admin, quiero crear y gestionar artÃ­culos de la base de conocimientos, para que los clientes tengan acceso a informaciÃ³n de autoservicio actualizada.

#### Acceptance Criteria

1. WHEN a Support_Agent creates an article, THE Ticket_System SHALL save it as draft status until published
2. WHEN a Support_Agent publishes an article, THE Ticket_System SHALL make it visible to Clients in the Knowledge_Base
3. THE Ticket_System SHALL support rich text formatting, images, and code blocks in articles
4. WHEN a Support_Agent edits a published article, THE Ticket_System SHALL maintain version history
5. THE Ticket_System SHALL allow Admin to organize articles into categories and subcategories
6. WHEN a Support_Agent archives an article, THE Ticket_System SHALL hide it from Client view but retain it for reference

### Requirement 13: Reportes de DesempeÃ±o

**User Story:** Como Admin, quiero ver reportes y mÃ©tricas del equipo de soporte, para que pueda evaluar el desempeÃ±o y identificar Ã¡reas de mejora.

#### Acceptance Criteria

1. THE Ticket_System SHALL display total tickets created, resolved, and closed for a selected date range
2. THE Ticket_System SHALL calculate and display average response time and resolution time by priority
3. THE Ticket_System SHALL display SLA compliance rate (percentage of tickets meeting SLA targets)
4. THE Ticket_System SHALL show ticket distribution by category, priority, and status
5. THE Ticket_System SHALL display individual Support_Agent metrics including tickets resolved, average resolution time, and customer satisfaction rating
6. THE Ticket_System SHALL allow exporting reports to CSV format
7. THE Ticket_System SHALL display trend charts showing ticket volume and resolution metrics over time

### Requirement 14: CategorizaciÃ³n de Tickets

**User Story:** Como Support_Agent, quiero categorizar tickets, para que puedan ser enrutados y reportados adecuadamente.

#### Acceptance Criteria

1. THE Ticket_System SHALL support predefined categories configurable by Admin
2. WHEN a Client creates a ticket, THE Ticket_System SHALL require category selection from available options
3. WHEN a Support_Agent changes ticket category, THE Ticket_System SHALL record the change in ticket history
4. WHERE auto-categorization is enabled, WHEN a ticket is created, THE Ticket_System SHALL suggest a category based on title and description content
5. THE Ticket_System SHALL allow Admin to create, edit, and archive categories

### Requirement 15: IntegraciÃ³n con Customer Portal

**User Story:** Como Client, quiero acceder al sistema de tickets desde el customer-portal existente, para que tenga una experiencia unificada.

#### Acceptance Criteria

1. THE Ticket_System SHALL integrate with Customer_Portal authentication system
2. WHEN a Client logs into Customer_Portal, THE Ticket_System SHALL use the same session for ticket access
3. THE Ticket_System SHALL display ticket summary and recent tickets in the Customer_Portal dashboard
4. THE Ticket_System SHALL maintain consistent navigation and styling with Customer_Portal
5. WHEN a Client clicks on a ticket notification in Customer_Portal, THE Ticket_System SHALL navigate to the ticket detail view

### Requirement 16: Soporte Multi-Canal

**User Story:** Como Admin, quiero que el sistema capture tickets de mÃºltiples canales, para que todas las incidencias sean gestionadas centralmente.

#### Acceptance Criteria

1. THE Ticket_System SHALL support ticket creation via web interface
2. THE Ticket_System SHALL support ticket creation via email to a designated support address
3. WHEN an email is received at the support address, THE Ticket_System SHALL create a ticket with email subject as title and body as description
4. WHEN a Client replies to a ticket notification email, THE Ticket_System SHALL add the reply as a message to the ticket
5. THE Ticket_System SHALL record the channel source for each ticket (web, email)
6. WHEN processing email tickets, THE Ticket_System SHALL extract and attach any email attachments to the ticket

### Requirement 17: Historial y AuditorÃ­a

**User Story:** Como Admin o Support_Agent, quiero ver el historial completo de cambios en un ticket, para que pueda auditar acciones y entender la evoluciÃ³n de la incidencia.

#### Acceptance Criteria

1. THE Ticket_System SHALL record all changes to ticket fields including status, priority, assignment, and category
2. THE Ticket_System SHALL record timestamp, user, and previous/new values for each change
3. WHEN a user views ticket history, THE Ticket_System SHALL display changes in chronological order
4. THE Ticket_System SHALL record ticket creation, first response, and resolution timestamps
5. THE Ticket_System SHALL maintain complete message history including deleted messages (marked as deleted but not removed)

### Requirement 18: GestiÃ³n de Adjuntos

**User Story:** Como usuario del sistema, quiero adjuntar archivos a tickets y mensajes, para que pueda proporcionar evidencia visual o documentaciÃ³n relevante.

#### Acceptance Criteria

1. WHEN a user uploads an attachment, THE Ticket_System SHALL validate file type against allowed extensions (images, PDFs, documents, logs)
2. WHEN a user uploads an attachment, THE Ticket_System SHALL validate file size does not exceed 10MB
3. THE Ticket_System SHALL store attachments securely with access restricted to ticket participants
4. WHEN a user views a ticket, THE Ticket_System SHALL display all attachments with filename, size, and upload date
5. WHEN a user clicks an attachment, THE Ticket_System SHALL allow download or preview based on file type
6. THE Ticket_System SHALL scan uploaded files for malware before accepting them

### Requirement 19: BÃºsqueda Avanzada

**User Story:** Como Support_Agent, quiero realizar bÃºsquedas avanzadas de tickets, para que pueda encontrar rÃ¡pidamente tickets relacionados o patrones de problemas.

#### Acceptance Criteria

1. THE Ticket_System SHALL support search by ticket ID, title, description, client name, and message content
2. THE Ticket_System SHALL support filtering search results by status, priority, category, date range, and assigned agent
3. THE Ticket_System SHALL support boolean operators (AND, OR, NOT) in search queries
4. WHEN a Support_Agent performs a search, THE Ticket_System SHALL return results within 2 seconds for datasets up to 100,000 tickets
5. THE Ticket_System SHALL highlight search terms in results
6. THE Ticket_System SHALL save recent searches for quick access

### Requirement 20: ConfiguraciÃ³n de Permisos

**User Story:** Como Admin, quiero configurar roles y permisos, para que pueda controlar quÃ© usuarios pueden realizar quÃ© acciones en el sistema.

#### Acceptance Criteria

1. THE Ticket_System SHALL support predefined roles: Client, Support_Agent, Supervisor, and Admin
2. THE Ticket_System SHALL allow Admin to assign roles to users
3. THE Ticket_System SHALL enforce role-based permissions for all operations (create, read, update, delete, assign)
4. THE Ticket_System SHALL allow Clients to view and update only their own tickets
5. THE Ticket_System SHALL allow Support_Agents to view and update all tickets
6. THE Ticket_System SHALL allow Supervisors to view all reports and reassign tickets
7. THE Ticket_System SHALL allow Admin to configure system settings, manage users, and access all features

### Requirement 21: SatisfacciÃ³n del Cliente

**User Story:** Como Admin, quiero recopilar feedback de satisfacciÃ³n de clientes, para que pueda medir la calidad del servicio de soporte.

#### Acceptance Criteria

1. WHEN a ticket status changes to "Resuelto", THE Ticket_System SHALL send a satisfaction survey to the Client
2. THE Ticket_System SHALL allow Clients to rate their experience on a scale of 1-5 stars
3. THE Ticket_System SHALL allow Clients to provide optional written feedback
4. THE Ticket_System SHALL calculate average satisfaction rating per Support_Agent
5. THE Ticket_System SHALL display satisfaction metrics in the performance reports
6. WHEN a Client provides a rating of 2 stars or lower, THE Ticket_System SHALL send a notification to the Supervisor

### Requirement 22: EscalaciÃ³n AutomÃ¡tica

**User Story:** Como Supervisor, quiero que tickets crÃ­ticos o con SLA vencido se escalen automÃ¡ticamente, para que reciban atenciÃ³n prioritaria.

#### Acceptance Criteria

1. WHEN a ticket with priority "CrÃ­tica" is created, THE Ticket_System SHALL send immediate notification to all available Support_Agents and Supervisors
2. WHEN a ticket exceeds SLA response time, THE Ticket_System SHALL escalate to Supervisor
3. WHEN a ticket exceeds SLA resolution time, THE Ticket_System SHALL escalate to Admin
4. WHEN a ticket is escalated, THE Ticket_System SHALL add an escalation flag visible in the ticket list
5. THE Ticket_System SHALL allow Admin to configure custom escalation rules based on priority, category, and time thresholds

### Requirement 23: Plantillas de Respuesta

**User Story:** Como Support_Agent, quiero usar plantillas de respuesta predefinidas, para que pueda responder mÃ¡s rÃ¡pidamente a consultas comunes.

#### Acceptance Criteria

1. THE Ticket_System SHALL allow Support_Agents to create and save response templates
2. WHEN a Support_Agent composes a message, THE Ticket_System SHALL provide access to saved templates
3. WHEN a Support_Agent selects a template, THE Ticket_System SHALL insert the template content into the message editor
4. THE Ticket_System SHALL support template variables (e.g., {client_name}, {ticket_id}) that are automatically replaced
5. THE Ticket_System SHALL allow Admin to create organization-wide templates accessible to all Support_Agents
6. THE Ticket_System SHALL allow Support_Agents to edit template content before sending

### Requirement 24: Cierre AutomÃ¡tico de Tickets

**User Story:** Como Admin, quiero que tickets resueltos se cierren automÃ¡ticamente despuÃ©s de un perÃ­odo, para que el sistema mantenga un estado actualizado.

#### Acceptance Criteria

1. WHERE auto-close is enabled, WHEN a ticket remains in "Resuelto" status for the configured period (default 7 days), THE Ticket_System SHALL automatically change status to "Cerrado"
2. WHEN a ticket is auto-closed, THE Ticket_System SHALL send a notification to the Client
3. IF a Client responds to a closed ticket, THEN THE Ticket_System SHALL reopen the ticket with status "En Progreso"
4. THE Ticket_System SHALL allow Admin to configure the auto-close period per category
5. THE Ticket_System SHALL allow Support_Agents to exclude specific tickets from auto-close

### Requirement 25: API para Integraciones

**User Story:** Como desarrollador, quiero acceder al sistema de tickets mediante API REST, para que pueda integrar el sistema con otras herramientas y automatizaciones.

#### Acceptance Criteria

1. THE Ticket_System SHALL provide a REST API with endpoints for ticket CRUD operations
2. THE Ticket_System SHALL require API authentication using API keys or OAuth tokens
3. THE Ticket_System SHALL enforce the same role-based permissions for API access as for web interface
4. THE Ticket_System SHALL return responses in JSON format
5. THE Ticket_System SHALL provide API documentation with endpoint descriptions, parameters, and example requests/responses
6. THE Ticket_System SHALL implement rate limiting to prevent API abuse (100 requests per minute per API key)
7. WHEN an API request fails validation, THE Ticket_System SHALL return descriptive error messages with HTTP status codes

---

## Architecture & Design

### High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          Customer Portal                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  Ticket Client UI (React + Framer-Motion)                    â”‚  â”‚
â”‚  â”‚  - Create/View Tickets, Messages, File Upload                â”‚  â”‚
â”‚  â”‚  - Real-time Notifications & SLA Tracking                    â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                       â”‚
                       â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        API Gateway & Auth                            â”‚
â”‚  - JWT/OAuth2 Authentication                                         â”‚
â”‚  - Role-Based Access Control (RBAC)                                  â”‚
â”‚  - Rate Limiting (100 req/min per API key)                           â”‚
â”‚  - Request Validation & Error Handling                               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                       â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â†“              â†“              â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Ticket     â”‚ â”‚  Support     â”‚ â”‚  Knowledge   â”‚
â”‚   Service    â”‚ â”‚  Service     â”‚ â”‚  Base        â”‚
â”‚              â”‚ â”‚              â”‚ â”‚  Service     â”‚
â”‚ - CRUD       â”‚ â”‚ - Assignment â”‚ â”‚              â”‚
â”‚ - Status     â”‚ â”‚ - Escalation â”‚ â”‚ - Articles   â”‚
â”‚ - Priority   â”‚ â”‚ - SLA Track  â”‚ â”‚ - Versioning â”‚
â”‚ - Messages   â”‚ â”‚              â”‚ â”‚              â”‚
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                â”‚                â”‚
       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â†“
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚  Notification Service         â”‚
        â”‚  - Email (SMTP)               â”‚
        â”‚  - In-App (WebSocket)         â”‚
        â”‚  - Escalation Rules           â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â†“               â†“               â†“
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚ Email  â”‚    â”‚ In-App   â”‚    â”‚ Externalâ”‚
    â”‚ Queue  â”‚    â”‚ Notif DB â”‚    â”‚Services â”‚
    â”‚(RabbitQ)   â”‚          â”‚    â”‚(Webhooks)
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚
                        â†“
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚   PostgreSQL Database          â”‚
        â”‚                                â”‚
        â”‚ - Tickets & Messages           â”‚
        â”‚ - Users & Assignments          â”‚
        â”‚ - Notifications & History      â”‚
        â”‚ - Knowledge Base Articles      â”‚
        â”‚ - Audit Logs                   â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Data Model (Core Entities)

#### Ticket
- `id` (UUID)
- `clientId` (UUID) â†’ References Client
- `createdBy` (UUID) â†’ References Support_Agent | Client
- `title` (string)
- `description` (text)
- `status` (enum: Nuevo, Asignado, En Progreso, Esperando Cliente, Resuelto, Cerrado)
- `priority` (enum: Baja, Media, Alta, CrÃ­tica)
- `category` (UUID) â†’ References Category
- `assignedTo` (UUID) â†’ References Support_Agent (nullable)
- `slaDeadlineResponse` (datetime)
- `slaDeadlineResolution` (datetime)
- `slaStatus` (enum: On Track, Warning, Breached)
- `createdAt` (datetime)
- `updatedAt` (datetime)
- `resolvedAt` (datetime, nullable)
- `closedAt` (datetime, nullable)
- `satisfactionRating` (int 1-5, nullable)

#### Message
- `id` (UUID)
- `ticketId` (UUID) â†’ References Ticket
- `authorId` (UUID) â†’ References User
- `content` (text)
- `isInternal` (boolean) - hidden from Client
- `createdAt` (datetime)
- `attachments` (Attachment[])

#### Notification
- `id` (UUID)
- `userId` (UUID) â†’ References User
- `ticketId` (UUID) â†’ References Ticket (nullable)
- `type` (enum: ticket_created, assigned, status_changed, message_added, sla_warning, escalated, survey_requested)
- `channel` (enum: email, in_app, both)
- `isRead` (boolean)
- `sentAt` (datetime)
- `expiresAt` (datetime) - 30 days

#### User
- `id` (UUID)
- `email` (string, unique)
- `name` (string)
- `role` (enum: Client, Support_Agent, Supervisor, Admin)
- `category` (UUID, nullable) â†’ For Support_Agents, category specialization
- `workload` (int) â†’ Current open assigned tickets
- `createdAt` (datetime)

#### KnowledgeBase Article
- `id` (UUID)
- `title` (string)
- `content` (text, rich HTML)
- `category` (UUID) â†’ References Category
- `status` (enum: draft, published, archived)
- `author` (UUID) â†’ References Support_Agent
- `viewCount` (int)
- `helpfulCount` (int)
- `notHelpfulCount` (int)
- `createdAt` (datetime)
- `publishedAt` (datetime, nullable)
- `version` (int)

#### TicketHistory
- `id` (UUID)
- `ticketId` (UUID)
- `fieldName` (string)
- `oldValue` (string)
- `newValue` (string)
- `changedBy` (UUID) â†’ References User
- `changedAt` (datetime)

### Technology Stack

**Frontend:**
- React 18+ (TSX)
- Framer-motion (animations)
- TanStack Query (data fetching)
- Zustand (state management)
- Tailwind CSS (styling)
- Zod (form validation)

**Backend:**
- Next.js 16+ (App Router)
- TypeScript
- PostgreSQL (primary database)
- Pino (structured logging)
- Vitest (unit testing)
- Playwright (E2E testing)

**Services & Integrations:**
- SMTP (email notifications)
- WebSocket (real-time notifications)
- Redis (caching, rate limiting)
- SendGrid or Postmark (optional, email service)
- AWS S3 or local storage (file attachments)

### API Endpoints

**Ticket Management:**
- `POST /api/v1/tickets` - Create ticket
- `GET /api/v1/tickets` - List tickets (paginated, filtered)
- `GET /api/v1/tickets/:id` - Get ticket details
- `PATCH /api/v1/tickets/:id` - Update ticket (status, priority, assignment)
- `DELETE /api/v1/tickets/:id` - Delete ticket (admin only)

**Messages:**
- `POST /api/v1/tickets/:id/messages` - Add message
- `GET /api/v1/tickets/:id/messages` - Get messages
- `PATCH /api/v1/messages/:id` - Update message (internal note)
- `DELETE /api/v1/messages/:id` - Soft delete message

**Knowledge Base:**
- `GET /api/v1/articles` - List published articles
- `GET /api/v1/articles/:id` - Get article
- `POST /api/v1/articles` - Create article (agent/admin)
- `PATCH /api/v1/articles/:id` - Update article
- `POST /api/v1/articles/:id/publish` - Publish article
- `POST /api/v1/articles/:id/rate` - Rate article (helpful/not helpful)

**Notifications:**
- `GET /api/v1/notifications` - Get user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read

**Admin (Configuration):**
- `GET/POST /api/v1/admin/sla-config` - SLA configuration
- `GET/POST /api/v1/admin/categories` - Manage categories
- `GET/POST /api/v1/admin/users` - Manage users & roles
- `GET /api/v1/admin/reports` - Performance reports

**Health & Metrics:**
- `GET /health` - Health check
- `GET /metrics` - System metrics (admin only)

---

## Implementation Plan

### Phase 1: Core Ticket Management (Weeks 1-3)

**Epic 1.1: Database Schema & ORM Setup**
- [ ] Design and create PostgreSQL schema (Tickets, Users, Messages, History, Attachments)
- [ ] Setup Prisma or TypeORM migrations
- [ ] Create database seed scripts for test data

**Epic 1.2: Ticket CRUD Operations**
- [ ] Implement Ticket creation (client & support agent)
- [ ] Implement Ticket retrieval (list & detail views)
- [ ] Implement Ticket updates (status, priority, assignment)
- [ ] Add request validation and error handling
- [ ] Create unit tests (>80% coverage)

**Epic 1.3: API Foundation**
- [ ] Setup API routes structure
- [ ] Implement authentication middleware (JWT/OAuth)
- [ ] Implement RBAC middleware
- [ ] Add rate limiting
- [ ] Create API documentation (OpenAPI/Swagger)

**Tasks:**
1. Create database schema migrations file
2. Setup ORM configuration
3. Implement Ticket model & repository
4. Create API route handlers for /api/v1/tickets
5. Add input validation using Zod
6. Write unit tests for Ticket service
7. Setup API documentation

---

### Phase 2: Messaging & Communication (Weeks 4-5)

**Epic 2.1: Bidirectional Messaging**
- [ ] Implement Message model and CRUD
- [ ] Support message attachments
- [ ] Internal notes (hidden from clients)
- [ ] Auto-status change when client replies in "Esperando Cliente" state

**Epic 2.2: Email Notifications**
- [ ] Setup email service (SMTP or SendGrid)
- [ ] Create notification templates
- [ ] Implement event-driven email sending
- [ ] Test email delivery

**Epic 2.3: In-App Notifications**
- [ ] Implement Notification model
- [ ] Create WebSocket server for real-time updates
- [ ] Build notification UI components
- [ ] Implement notification preferences

**Tasks:**
1. Create Message model & API endpoints
2. Design email notification templates
3. Implement Email Service with queue
4. Setup WebSocket server
5. Create Notification UI components
6. Add notification preference storage
7. Write integration tests for messaging

---

### Phase 3: Support Operations (Weeks 6-7)

**Epic 3.1: Ticket Assignment & Routing**
- [ ] Implement assignment logic
- [ ] Support auto-assignment with workload balancing
- [ ] Track assignment history
- [ ] Assignment notifications

**Epic 3.2: Status & Priority Management**
- [ ] Validate status transitions
- [ ] Implement priority changes with audit logging
- [ ] Auto-closure after resolution period
- [ ] Reopen logic for client responses

**Epic 3.3: Advanced Search & Filtering**
- [ ] Full-text search in ticket title, description, messages
- [ ] Filter by status, priority, category, date range, assignee
- [ ] Boolean search operators (AND, OR, NOT)
- [ ] Search performance optimization (< 2 sec for 100k tickets)

**Tasks:**
1. Implement assignment service with workload calculation
2. Add status transition validation
3. Create search service with PostgreSQL full-text search
4. Build advanced filter UI
5. Create filtering API endpoints
6. Write tests for search performance
7. Add search query history

---

### Phase 4: SLA & Escalation (Weeks 8-9)

**Epic 4.1: SLA Configuration & Tracking**
- [ ] Admin SLA configuration by priority
- [ ] SLA deadline calculation
- [ ] Time tracking (pause during "Esperando Cliente")
- [ ] SLA breach detection
- [ ] Automated escalation on breach

**Epic 4.2: Escalation Logic**
- [ ] Auto-escalate critical tickets
- [ ] SLA violation escalation
- [ ] Manual escalation support
- [ ] Supervisor notifications

**Tasks:**
1. Create SLA Config model
2. Implement SLA calculation service
3. Add background job for SLA monitoring
4. Create escalation rule engine
5. Implement escalation notification logic
6. Add SLA display to ticket UI
7. Create SLA reports

---

### Phase 5: Knowledge Base (Weeks 10-11)

**Epic 5.1: Knowledge Base Articles**
- [ ] CRUD operations for articles
- [ ] Draft/Publish workflow
- [ ] Version history
- [ ] Category organization

**Epic 5.2: Article Search & Suggestions**
- [ ] Full-text search in articles
- [ ] Ranking by relevance and ratings
- [ ] Automatic suggestions on ticket creation
- [ ] View/rating tracking

**Tasks:**
1. Create Article model & ORM
2. Implement Article API endpoints
3. Add article search and filtering
4. Create article management UI
5. Implement suggestion engine
6. Add rating system UI
7. Write article integration tests

---

### Phase 6: Admin & Reporting (Weeks 12-13)

**Epic 6.1: Admin Configuration**
- [ ] Category management
- [ ] User & role management
- [ ] SLA settings
- [ ] Notification preferences

**Epic 6.2: Performance Reports**
- [ ] Dashboard with key metrics
- [ ] Ticket volume trends
- [ ] Response/Resolution times
- [ ] SLA compliance rates
- [ ] Agent performance metrics
- [ ] Customer satisfaction tracking
- [ ] CSV export

**Tasks:**
1. Create admin configuration pages
2. Implement category management
3. Implement user role assignment
4. Create reporting service
5. Build dashboard with charts
6. Implement CSV export
7. Add report scheduling (email delivery)

---

### Phase 7: Advanced Features (Weeks 14-15)

**Epic 7.1: Customer Satisfaction**
- [ ] Survey on resolution
- [ ] 1-5 star rating
- [ ] Written feedback
- [ ] Agent satisfaction metrics

**Epic 7.2: Response Templates**
- [ ] Template CRUD
- [ ] Template variables
- [ ] Organization-wide templates
- [ ] Suggested templates in message composer

**Epic 7.3: Multi-Channel Support**
- [ ] Email-to-ticket conversion
- [ ] Email reply integration
- [ ] Channel source tracking

**Tasks:**
1. Create satisfaction survey UI
2. Implement survey submission API
3. Create response template service
4. Add template variable substitution
5. Setup email ingestion service
6. Implement email forwarding logic
7. Add multi-channel tests

---

### Phase 8: Integrations & Deployment (Weeks 16-17)

**Epic 8.1: Customer Portal Integration**
- [ ] Embed ticket system in portal
- [ ] Shared authentication
- [ ] Consistent styling
- [ ] Deep linking

**Epic 8.2: API & External Integrations**
- [ ] Complete REST API
- [ ] API key management
- [ ] OAuth2 support
- [ ] Webhook support
- [ ] Rate limiting enforcement

**Epic 8.3: Deployment & Monitoring**
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Monitoring & alerting
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (DataDog)

**Tasks:**
1. Create API key management system
2. Implement webhook system
3. Write API client SDKs (Node.js, Python)
4. Create deployment documentation
5. Setup CI/CD pipeline
6. Configure monitoring
7. Conduct load testing

---

### Phase 9: Testing & QA (Weeks 18-20)

**Epic 9.1: Automated Testing**
- [ ] Unit tests (>85% coverage)
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Performance tests
- [ ] Load testing

**Epic 9.2: Manual QA & UAT**
- [ ] Cross-browser testing
- [ ] Accessibility testing (WCAG 2.1)
- [ ] Security testing (OWASP)
- [ ] User acceptance testing

**Tasks:**
1. Expand unit test coverage
2. Create integration test suites
3. Write E2E test scenarios
4. Setup load testing environment
5. Create QA test plan
6. Conduct security audit
7. Accessibility audit

---

### Phase 10: Production Rollout (Weeks 21-22)

**Epic 10.1: Pre-Production Preparation**
- [ ] Database backup strategy
- [ ] Disaster recovery plan
- [ ] Performance baselines
- [ ] Runbooks for incident response

**Epic 10.2: Staged Rollout**
- [ ] Internal team access
- [ ] Beta customer group
- [ ] General availability
- [ ] Post-launch monitoring

**Tasks:**
1. Create database backup procedures
2. Write runbook documentation
3. Setup monitoring dashboards
4. Create incident response plan
5. Conduct training for support team
6. Launch beta program
7. Monitor and optimize post-launch

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Database performance degradation | Medium | High | Implement indexing strategy, query optimization, archiving old tickets |
| Email delivery failures | Low | Medium | Setup retry mechanism, fallback email provider, logging |
| Real-time notification lag | Medium | Medium | Use WebSocket with fallback to polling, Redis for caching |
| File upload security | High | High | Implement virus scanning, file type validation, secure storage |
| SLA calculation errors | Medium | High | Comprehensive unit tests, audit logging, manual verification |
| High API usage/rate limiting | Low | Medium | Monitor usage, implement tiered rate limits, customer communication |
| Data privacy/GDPR compliance | High | Critical | Data encryption, access logs, right to deletion, data export |

---

## Success Metrics

- **Performance:** API response time < 200ms (p95), Search < 2 sec for 100k tickets
- **Reliability:** 99.9% uptime, <1% error rate
- **User Adoption:** >80% of support team using system within 1 month
- **Customer Satisfaction:** >4.0 avg rating on 5-star scale
- **SLA Compliance:** >95% of tickets meet SLA targets
- **Code Quality:** >85% test coverage, 0 critical security vulnerabilities


