# Requirements Document

## Introduction

El Customer Portal de CAMIART es una plataforma web integral que proporciona a los clientes un punto de acceso centralizado para gestionar su relaciÃ³n con CAMIART. El portal permite a los clientes visualizar su actividad, gestionar pedidos, solicitar cotizaciones, acceder a tickets de soporte, administrar su perfil y preferencias, y acceder a documentos importantes. El sistema se integra con backend-cotizaciones-v1 y ticket-system existentes, proporcionando una experiencia unificada, segura y personalizada en dispositivos mÃ³viles y de escritorio.

## Glossary

- **Customer_Portal**: El portal completo de cliente de CAMIART
- **Client**: Usuario externo de CAMIART con cuenta en el portal
- **Dashboard**: Vista principal personalizada con resumen de actividad del cliente
- **Order**: Pedido de productos realizado por el cliente
- **Quote**: Solicitud de cotizaciÃ³n enviada por el cliente
- **Ticket**: Incidencia de soporte gestionada a travÃ©s del ticket-system
- **Profile**: InformaciÃ³n personal y de contacto del cliente
- **Document**: Archivo como factura, comprobante o contrato asociado al cliente
- **Favorite**: DiseÃ±o o configuraciÃ³n de producto guardado por el cliente
- **Session**: SesiÃ³n autenticada del cliente en el portal
- **JWT**: JSON Web Token usado para autenticaciÃ³n segura
- **Notification_Preferences**: ConfiguraciÃ³n de cÃ³mo el cliente desea recibir notificaciones
- **Privacy_Settings**: ConfiguraciÃ³n de privacidad y uso de datos del cliente
- **Backend_Cotizaciones**: Sistema backend existente para gestiÃ³n de cotizaciones
- **Ticket_System**: Sistema existente de gestiÃ³n de tickets de soporte
- **Activity_Summary**: Resumen de acciones recientes del cliente en el portal
- **Tracking_Info**: InformaciÃ³n de seguimiento de pedidos en trÃ¡nsito
- **Invoice**: Factura generada para un pedido completado
- **Receipt**: Comprobante de pago de un pedido
- **Contract**: Documento contractual asociado al cliente

## Requirements

### Requirement 1: AutenticaciÃ³n Segura

**User Story:** Como cliente, quiero iniciar sesiÃ³n de forma segura en el portal, para que pueda acceder a mi informaciÃ³n personal y transacciones.

#### Acceptance Criteria

1. THE Customer_Portal SHALL implement authentication using JWT tokens
2. WHEN a Client submits valid credentials, THE Customer_Portal SHALL generate a JWT token with expiration time of 24 hours
3. WHEN a Client submits invalid credentials, THE Customer_Portal SHALL return an error message without revealing whether username or password is incorrect
4. THE Customer_Portal SHALL hash passwords using bcrypt with minimum 12 rounds
5. THE Customer_Portal SHALL implement rate limiting of 5 login attempts per IP per 15 minutes
6. WHEN a Client exceeds login attempts, THE Customer_Portal SHALL lock the account for 15 minutes and send notification email
7. THE Customer_Portal SHALL support "Remember Me" functionality extending session to 30 days with secure cookie
8. THE Customer_Portal SHALL invalidate JWT tokens on logout
9. THE Customer_Portal SHALL refresh JWT tokens automatically 5 minutes before expiration if Client is active

### Requirement 2: Registro de Nuevos Clientes

**User Story:** Como nuevo cliente, quiero registrarme en el portal, para que pueda acceder a los servicios de CAMIART.

#### Acceptance Criteria

1. WHEN a new Client accesses registration, THE Customer_Portal SHALL display form with fields: name, email, phone, company name, password, password confirmation
2. THE Customer_Portal SHALL validate email format using regex `/^\S+@\S+\.\S+$/`
3. THE Customer_Portal SHALL validate password strength requiring minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character
4. THE Customer_Portal SHALL validate phone format using regex `/^[+0-9\s()-]{7,}$/`
5. WHEN a Client submits valid registration, THE Customer_Portal SHALL create account with status "pending_verification"
6. WHEN account is created, THE Customer_Portal SHALL send verification email with unique token valid for 24 hours
7. WHEN a Client clicks verification link, THE Customer_Portal SHALL activate account and change status to "active"
8. IF email already exists, THEN THE Customer_Portal SHALL return error message "Email ya registrado"

### Requirement 3: RecuperaciÃ³n de ContraseÃ±a

**User Story:** Como cliente, quiero recuperar mi contraseÃ±a si la olvido, para que pueda volver a acceder a mi cuenta.

#### Acceptance Criteria

1. WHEN a Client requests password reset, THE Customer_Portal SHALL send reset email with unique token valid for 1 hour
2. THE Customer_Portal SHALL not reveal whether email exists in system
3. WHEN a Client clicks reset link, THE Customer_Portal SHALL display password reset form
4. WHEN a Client submits new password, THE Customer_Portal SHALL validate password strength with same rules as registration
5. THE Customer_Portal SHALL invalidate all existing JWT tokens for that account after password reset
6. THE Customer_Portal SHALL send confirmation email after successful password reset

### Requirement 4: Dashboard Personalizado

**User Story:** Como cliente, quiero ver un dashboard con resumen de mi actividad, para que pueda tener una vista general de mi relaciÃ³n con CAMIART.

#### Acceptance Criteria

1. WHEN a Client accesses the dashboard, THE Customer_Portal SHALL display Activity_Summary with last 5 actions
2. THE Customer_Portal SHALL display count of open Orders, pending Quotes, and active Tickets
3. THE Customer_Portal SHALL display most recent 3 Orders with status and date
4. THE Customer_Portal SHALL display most recent 3 Tickets with status and priority
5. THE Customer_Portal SHALL display quick action buttons for "Nueva CotizaciÃ³n", "Nuevo Ticket", "Ver Pedidos"
6. THE Customer_Portal SHALL display personalized greeting with Client name
7. THE Customer_Portal SHALL load dashboard data within 2 seconds (p95)

### Requirement 5: GestiÃ³n de Perfil Personal

**User Story:** Como cliente, quiero editar mi informaciÃ³n personal, para que pueda mantener mis datos actualizados.

#### Acceptance Criteria

1. WHEN a Client accesses profile settings, THE Customer_Portal SHALL display current values for name, email, phone, company name
2. WHEN a Client updates profile fields, THE Customer_Portal SHALL validate using same rules as registration
3. WHEN a Client changes email, THE Customer_Portal SHALL send verification email to new address before updating
4. THE Customer_Portal SHALL require current password confirmation for email changes
5. THE Customer_Portal SHALL display profile update success message
6. THE Customer_Portal SHALL log profile changes with timestamp for audit trail

### Requirement 6: Cambio de ContraseÃ±a

**User Story:** Como cliente, quiero cambiar mi contraseÃ±a, para que pueda mantener mi cuenta segura.

#### Acceptance Criteria

1. WHEN a Client accesses password change, THE Customer_Portal SHALL require current password, new password, and password confirmation
2. THE Customer_Portal SHALL validate current password is correct
3. THE Customer_Portal SHALL validate new password meets strength requirements
4. THE Customer_Portal SHALL validate new password is different from current password
5. WHEN password is changed, THE Customer_Portal SHALL invalidate all existing JWT tokens except current session
6. THE Customer_Portal SHALL send confirmation email to registered email address

### Requirement 7: Historial de Pedidos

**User Story:** Como cliente, quiero ver mi historial de pedidos, para que pueda revisar mis compras pasadas y su estado actual.

#### Acceptance Criteria

1. WHEN a Client accesses order history, THE Customer_Portal SHALL display all Orders ordered by most recent first
2. THE Customer_Portal SHALL display for each Order: order ID, date, status, total amount, and product summary
3. WHEN a Client clicks an Order, THE Customer_Portal SHALL display detailed view with items, quantities, prices, shipping address, and Tracking_Info
4. THE Customer_Portal SHALL support filtering Orders by status (Pending, Processing, Shipped, Delivered, Cancelled)
5. THE Customer_Portal SHALL support filtering Orders by date range
6. THE Customer_Portal SHALL support searching Orders by order ID or product name
7. THE Customer_Portal SHALL paginate order list with 20 orders per page

### Requirement 8: Tracking de Pedidos

**User Story:** Como cliente, quiero ver el estado de seguimiento de mis pedidos en trÃ¡nsito, para que sepa cuÃ¡ndo llegarÃ¡n.

#### Acceptance Criteria

1. WHEN an Order has status "Shipped", THE Customer_Portal SHALL display Tracking_Info with carrier name and tracking number
2. THE Customer_Portal SHALL display tracking timeline with checkpoints (Order Placed, Processing, Shipped, In Transit, Out for Delivery, Delivered)
3. THE Customer_Portal SHALL display estimated delivery date
4. WHERE tracking integration is available, THE Customer_Portal SHALL display real-time tracking updates from carrier
5. THE Customer_Portal SHALL provide direct link to carrier tracking page

### Requirement 9: GestiÃ³n de Cotizaciones

**User Story:** Como cliente, quiero ver mis cotizaciones solicitadas y sus respuestas, para que pueda hacer seguimiento de mis solicitudes de presupuesto.

#### Acceptance Criteria

1. WHEN a Client accesses quotes section, THE Customer_Portal SHALL display all Quotes ordered by most recent first
2. THE Customer_Portal SHALL integrate with Backend_Cotizaciones to retrieve Quote data
3. THE Customer_Portal SHALL display for each Quote: quote ID, date, status (Received, In Review, Quoted, Accepted, Rejected), and product summary
4. WHEN a Client clicks a Quote, THE Customer_Portal SHALL display detailed view with original request, response (if available), quoted price, and validity period
5. THE Customer_Portal SHALL allow Client to accept or reject quoted prices
6. WHEN a Client accepts a Quote, THE Customer_Portal SHALL update status to "Accepted" and send notification to sales team
7. THE Customer_Portal SHALL support filtering Quotes by status

### Requirement 10: CreaciÃ³n de Nueva CotizaciÃ³n

**User Story:** Como cliente, quiero solicitar nuevas cotizaciones desde el portal, para que pueda obtener presupuestos sin salir del sistema.

#### Acceptance Criteria

1. WHEN a Client accesses new quote form, THE Customer_Portal SHALL display same fields as landing page quote form
2. THE Customer_Portal SHALL pre-fill Client contact information from profile
3. WHEN a Client submits quote request, THE Customer_Portal SHALL send to Backend_Cotizaciones using existing API
4. WHEN quote is submitted successfully, THE Customer_Portal SHALL display confirmation message and quote ID
5. THE Customer_Portal SHALL add new Quote to Client's quote list immediately

### Requirement 11: Acceso a Tickets de Soporte

**User Story:** Como cliente, quiero ver y gestionar mis tickets de soporte, para que pueda hacer seguimiento de mis incidencias.

#### Acceptance Criteria

1. WHEN a Client accesses tickets section, THE Customer_Portal SHALL integrate with Ticket_System to retrieve Client's tickets
2. THE Customer_Portal SHALL display tickets ordered by most recent activity first
3. THE Customer_Portal SHALL display for each Ticket: ticket ID, title, status, priority, creation date, and last update
4. WHEN a Client clicks a Ticket, THE Customer_Portal SHALL display full ticket details including all messages
5. THE Customer_Portal SHALL allow Client to add messages to open tickets
6. THE Customer_Portal SHALL allow Client to attach files to ticket messages
7. THE Customer_Portal SHALL display unread ticket count badge in navigation

### Requirement 12: CreaciÃ³n de Nuevo Ticket

**User Story:** Como cliente, quiero crear tickets de soporte desde el portal, para que pueda reportar problemas o hacer consultas.

#### Acceptance Criteria

1. WHEN a Client accesses new ticket form, THE Customer_Portal SHALL display fields for title, description, category, and attachments
2. THE Customer_Portal SHALL integrate with Ticket_System API to create tickets
3. WHEN a Client submits ticket, THE Customer_Portal SHALL validate required fields
4. WHEN ticket is created successfully, THE Customer_Portal SHALL display confirmation message and ticket ID
5. THE Customer_Portal SHALL add new Ticket to Client's ticket list immediately

### Requirement 13: Notificaciones en Tiempo Real

**User Story:** Como cliente, quiero recibir notificaciones en tiempo real de actualizaciones importantes, para que estÃ© informado sin necesidad de revisar constantemente.

#### Acceptance Criteria

1. WHEN a Quote status changes, THE Customer_Portal SHALL display in-app notification
2. WHEN a Ticket receives a new message, THE Customer_Portal SHALL display in-app notification
3. WHEN an Order status changes, THE Customer_Portal SHALL display in-app notification
4. THE Customer_Portal SHALL display notification count badge in navigation
5. WHEN a Client clicks notification, THE Customer_Portal SHALL navigate to relevant item and mark notification as read
6. THE Customer_Portal SHALL retain notifications for 30 days
7. THE Customer_Portal SHALL support real-time updates using WebSocket or Server-Sent Events

### Requirement 14: Preferencias de Notificaciones

**User Story:** Como cliente, quiero configurar cÃ³mo recibo notificaciones, para que pueda controlar la frecuencia y tipo de comunicaciones.

#### Acceptance Criteria

1. WHEN a Client accesses notification preferences, THE Customer_Portal SHALL display toggles for email notifications by type (Orders, Quotes, Tickets, Marketing)
2. THE Customer_Portal SHALL display toggles for in-app notifications by type
3. THE Customer_Portal SHALL allow Client to set email frequency (Immediate, Daily Digest, Weekly Digest)
4. WHEN a Client updates preferences, THE Customer_Portal SHALL save changes and display confirmation
5. THE Customer_Portal SHALL respect notification preferences for all communications

### Requirement 15: Acceso a Documentos

**User Story:** Como cliente, quiero acceder a mis facturas, comprobantes y contratos, para que pueda descargar documentos importantes cuando los necesite.

#### Acceptance Criteria

1. WHEN a Client accesses documents section, THE Customer_Portal SHALL display all Documents organized by type (Invoices, Receipts, Contracts)
2. THE Customer_Portal SHALL display for each Document: document type, date, associated order/quote, and file size
3. WHEN a Client clicks a Document, THE Customer_Portal SHALL allow preview or download
4. THE Customer_Portal SHALL support filtering Documents by type and date range
5. THE Customer_Portal SHALL support searching Documents by order ID or document number
6. THE Customer_Portal SHALL generate secure temporary download links valid for 1 hour

### Requirement 16: GestiÃ³n de Favoritos

**User Story:** Como cliente, quiero guardar diseÃ±os o configuraciones de productos favoritos, para que pueda reutilizarlos fÃ¡cilmente en futuras Ã³rdenes.

#### Acceptance Criteria

1. WHEN a Client views a product configuration, THE Customer_Portal SHALL display "Guardar como Favorito" button
2. WHEN a Client saves a Favorite, THE Customer_Portal SHALL store product configuration with custom name
3. WHEN a Client accesses favorites section, THE Customer_Portal SHALL display all saved Favorites with thumbnail and name
4. WHEN a Client clicks a Favorite, THE Customer_Portal SHALL load product configuration for new order or quote
5. THE Customer_Portal SHALL allow Client to edit Favorite name
6. THE Customer_Portal SHALL allow Client to delete Favorites
7. THE Customer_Portal SHALL limit maximum 50 Favorites per Client

### Requirement 17: ConfiguraciÃ³n de Privacidad

**User Story:** Como cliente, quiero controlar la configuraciÃ³n de privacidad de mis datos, para que pueda decidir cÃ³mo se usa mi informaciÃ³n.

#### Acceptance Criteria

1. WHEN a Client accesses privacy settings, THE Customer_Portal SHALL display current privacy preferences
2. THE Customer_Portal SHALL allow Client to toggle marketing communications consent
3. THE Customer_Portal SHALL allow Client to toggle data sharing for analytics
4. THE Customer_Portal SHALL display link to privacy policy
5. THE Customer_Portal SHALL allow Client to request data export in JSON format
6. THE Customer_Portal SHALL allow Client to request account deletion with confirmation dialog
7. WHEN account deletion is requested, THE Customer_Portal SHALL send confirmation email and schedule deletion after 30 days

### Requirement 18: DiseÃ±o Responsive Mobile-First

**User Story:** Como cliente, quiero usar el portal desde mi mÃ³vil, para que pueda acceder a mi informaciÃ³n desde cualquier dispositivo.

#### Acceptance Criteria

1. THE Customer_Portal SHALL implement mobile-first responsive design
2. THE Customer_Portal SHALL display optimized navigation menu for mobile devices (hamburger menu)
3. THE Customer_Portal SHALL be fully functional on screen sizes from 320px to 2560px width
4. THE Customer_Portal SHALL use touch-friendly controls with minimum 44x44px tap targets
5. THE Customer_Portal SHALL optimize images and assets for mobile bandwidth
6. THE Customer_Portal SHALL achieve Lighthouse mobile score of minimum 90 for performance
7. THE Customer_Portal SHALL support both portrait and landscape orientations

### Requirement 19: Soporte Multi-Idioma

**User Story:** Como cliente, quiero usar el portal en mi idioma preferido, para que pueda entender toda la informaciÃ³n claramente.

#### Acceptance Criteria

1. THE Customer_Portal SHALL support Spanish and English languages
2. WHEN a Client accesses the portal, THE Customer_Portal SHALL detect browser language and set default accordingly
3. THE Customer_Portal SHALL display language selector in navigation
4. WHEN a Client changes language, THE Customer_Portal SHALL update all UI text immediately without page reload
5. THE Customer_Portal SHALL persist language preference in Client profile
6. THE Customer_Portal SHALL translate all static content including labels, buttons, messages, and help text
7. THE Customer_Portal SHALL display user-generated content (orders, tickets, messages) in original language

### Requirement 20: BÃºsqueda Global

**User Story:** Como cliente, quiero buscar en todo el portal, para que pueda encontrar rÃ¡pidamente pedidos, cotizaciones o tickets.

#### Acceptance Criteria

1. THE Customer_Portal SHALL display search bar in main navigation
2. WHEN a Client enters search query, THE Customer_Portal SHALL search across Orders, Quotes, Tickets, and Documents
3. THE Customer_Portal SHALL display search results grouped by type with relevance ranking
4. THE Customer_Portal SHALL highlight search terms in results
5. THE Customer_Portal SHALL return search results within 1 second
6. THE Customer_Portal SHALL support search by ID, date, status, or content keywords
7. WHEN no results are found, THE Customer_Portal SHALL display helpful message with search tips

### Requirement 21: Seguridad de SesiÃ³n

**User Story:** Como cliente, quiero que mi sesiÃ³n sea segura, para que mi informaciÃ³n estÃ© protegida contra accesos no autorizados.

#### Acceptance Criteria

1. THE Customer_Portal SHALL implement HTTPS for all connections
2. THE Customer_Portal SHALL set secure, httpOnly, and sameSite flags on session cookies
3. THE Customer_Portal SHALL implement CSRF protection using tokens
4. THE Customer_Portal SHALL log out Client after 30 minutes of inactivity
5. WHEN a Client is logged out due to inactivity, THE Customer_Portal SHALL display timeout message and preserve current page for redirect after re-login
6. THE Customer_Portal SHALL detect concurrent sessions and allow maximum 3 active sessions per account
7. THE Customer_Portal SHALL allow Client to view and revoke active sessions

### Requirement 22: Accesibilidad WCAG 2.1 AA

**User Story:** Como cliente con discapacidad, quiero usar el portal con tecnologÃ­as asistivas, para que pueda acceder a todos los servicios de forma independiente.

#### Acceptance Criteria

1. THE Customer_Portal SHALL implement semantic HTML with proper heading hierarchy
2. THE Customer_Portal SHALL provide alt text for all images
3. THE Customer_Portal SHALL ensure minimum color contrast ratio of 4.5:1 for normal text and 3:1 for large text
4. THE Customer_Portal SHALL support full keyboard navigation with visible focus indicators
5. THE Customer_Portal SHALL implement ARIA labels and roles for interactive components
6. THE Customer_Portal SHALL provide skip navigation links
7. THE Customer_Portal SHALL achieve WCAG 2.1 Level AA compliance verified by automated testing tools

### Requirement 23: Manejo de Errores y Estados de Carga

**User Story:** Como cliente, quiero ver feedback claro cuando el sistema estÃ¡ cargando o hay errores, para que entienda el estado del sistema.

#### Acceptance Criteria

1. WHEN data is loading, THE Customer_Portal SHALL display loading indicators (spinners or skeleton screens)
2. WHEN an error occurs, THE Customer_Portal SHALL display user-friendly error message in Spanish
3. WHEN API request fails, THE Customer_Portal SHALL display retry button
4. THE Customer_Portal SHALL implement exponential backoff for failed API requests (retry after 1s, 2s, 4s)
5. WHEN network is offline, THE Customer_Portal SHALL display offline indicator and queue actions for retry
6. THE Customer_Portal SHALL display success messages for completed actions with auto-dismiss after 5 seconds
7. THE Customer_Portal SHALL log client-side errors to monitoring service for debugging

### Requirement 24: IntegraciÃ³n con Backend Cotizaciones

**User Story:** Como sistema, quiero integrarme con Backend_Cotizaciones existente, para que los clientes puedan gestionar cotizaciones desde el portal.

#### Acceptance Criteria

1. THE Customer_Portal SHALL use Backend_Cotizaciones API endpoint `POST /api/v1/quotes` for creating quotes
2. THE Customer_Portal SHALL implement authentication for Backend_Cotizaciones API using JWT tokens
3. THE Customer_Portal SHALL handle all Backend_Cotizaciones response formats (201, 422, 429, 500, 503)
4. THE Customer_Portal SHALL display Backend_Cotizaciones validation errors mapped to form fields
5. THE Customer_Portal SHALL respect Backend_Cotizaciones rate limiting and display appropriate messages
6. THE Customer_Portal SHALL include requestId from Backend_Cotizaciones responses in error logs

### Requirement 25: IntegraciÃ³n con Ticket System

**User Story:** Como sistema, quiero integrarme con Ticket_System existente, para que los clientes puedan gestionar tickets desde el portal.

#### Acceptance Criteria

1. THE Customer_Portal SHALL use Ticket_System API for all ticket operations (create, read, update)
2. THE Customer_Portal SHALL authenticate with Ticket_System using same JWT token as Customer_Portal
3. THE Customer_Portal SHALL display tickets with same status, priority, and category values as Ticket_System
4. THE Customer_Portal SHALL support ticket attachments using Ticket_System file upload API
5. THE Customer_Portal SHALL poll Ticket_System API every 30 seconds for ticket updates when Client is viewing tickets
6. THE Customer_Portal SHALL handle Ticket_System API errors gracefully with retry logic

### Requirement 26: Rendimiento y OptimizaciÃ³n

**User Story:** Como cliente, quiero que el portal cargue rÃ¡pidamente, para que pueda acceder a mi informaciÃ³n sin esperas.

#### Acceptance Criteria

1. THE Customer_Portal SHALL achieve First Contentful Paint (FCP) under 1.5 seconds on 3G connection
2. THE Customer_Portal SHALL achieve Time to Interactive (TTI) under 3 seconds on 3G connection
3. THE Customer_Portal SHALL implement code splitting to load only required JavaScript per page
4. THE Customer_Portal SHALL implement lazy loading for images and non-critical components
5. THE Customer_Portal SHALL cache static assets with appropriate cache headers
6. THE Customer_Portal SHALL implement service worker for offline functionality of critical pages
7. THE Customer_Portal SHALL achieve Lighthouse performance score of minimum 90

### Requirement 27: Monitoreo y Logging

**User Story:** Como equipo tÃ©cnico, quiero monitorear el uso del portal y errores, para que pueda mantener la calidad del servicio.

#### Acceptance Criteria

1. THE Customer_Portal SHALL log all authentication events (login, logout, failed attempts)
2. THE Customer_Portal SHALL log all API errors with requestId, endpoint, status code, and error message
3. THE Customer_Portal SHALL track page views and user interactions for analytics
4. THE Customer_Portal SHALL send client-side errors to centralized logging service
5. THE Customer_Portal SHALL track performance metrics (page load time, API response time)
6. THE Customer_Portal SHALL implement health check endpoint `GET /api/health` returning system status
7. THE Customer_Portal SHALL mask PII in logs (show only first 3 characters of email)

### Requirement 28: ExportaciÃ³n de Datos

**User Story:** Como cliente, quiero exportar mis datos del portal, para que pueda tener una copia de mi informaciÃ³n.

#### Acceptance Criteria

1. WHEN a Client requests data export, THE Customer_Portal SHALL generate JSON file with all Client data
2. THE Customer_Portal SHALL include in export: profile information, order history, quote history, ticket history, and documents metadata
3. THE Customer_Portal SHALL send download link to Client email when export is ready
4. THE Customer_Portal SHALL generate export within 5 minutes for typical Client data volume
5. THE Customer_Portal SHALL secure export files with encryption and expire download links after 48 hours
6. THE Customer_Portal SHALL log all data export requests for audit trail

### Requirement 29: Onboarding de Nuevos Clientes

**User Story:** Como nuevo cliente, quiero recibir orientaciÃ³n al usar el portal por primera vez, para que pueda aprovechar todas las funcionalidades.

#### Acceptance Criteria

1. WHEN a Client logs in for the first time, THE Customer_Portal SHALL display welcome tour highlighting key features
2. THE Customer_Portal SHALL display tooltips for main navigation items during first session
3. THE Customer_Portal SHALL allow Client to skip or dismiss onboarding tour
4. THE Customer_Portal SHALL mark onboarding as completed after Client completes tour or dismisses it
5. THE Customer_Portal SHALL provide "Help" link in navigation to restart onboarding tour
6. THE Customer_Portal SHALL display contextual help hints for complex features

### Requirement 30: ValidaciÃ³n y SanitizaciÃ³n de Entradas

**User Story:** Como sistema, quiero validar y sanitizar todas las entradas de usuario, para que pueda prevenir inyecciones y datos corruptos.

#### Acceptance Criteria

1. THE Customer_Portal SHALL validate all form inputs on client-side before submission
2. THE Customer_Portal SHALL sanitize text inputs removing control characters and normalizing whitespace
3. THE Customer_Portal SHALL validate email format using regex `/^\S+@\S+\.\S+$/`
4. THE Customer_Portal SHALL validate phone format using regex `/^[+0-9\s()-]{7,}$/`
5. THE Customer_Portal SHALL validate string length limits for all text fields
6. THE Customer_Portal SHALL escape HTML in user-generated content to prevent XSS attacks
7. THE Customer_Portal SHALL validate file uploads for type, size, and malware before sending to server
