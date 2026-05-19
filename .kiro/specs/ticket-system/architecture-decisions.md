# Ticket System - Architecture Decision Records (ADR)

---

## ADR 1: Technology Stack Selection

**Decision:** Use Next.js 16+ (App Router), React 18+, TypeScript, PostgreSQL, and Prisma ORM.

**Context:**
- Existing project uses Next.js 16.2.6 with App Router
- Team is familiar with TypeScript and React
- PostgreSQL is proven database for similar systems
- Need to maintain consistency with customer-portal architecture

**Rationale:**
- **Next.js:** Full-stack framework with excellent DX, built-in API routes, middleware support
- **React:** Mature ecosystem, component-based UI, TanStack Query for data management
- **TypeScript:** Type safety reduces bugs, improves documentation and refactoring
- **PostgreSQL:** ACID compliance, full-text search, JSON support, proven at scale
- **Prisma:** Type-safe ORM with migrations, excellent DX, auto-generated types

**Consequences:**
- ✅ Consistent with existing codebase
- ✅ Strong type safety across full stack
- ⚠️ Need to manage Node.js runtime (serverless vs. traditional server)
- ⚠️ Must handle connection pooling for database

**Status:** APPROVED

---

## ADR 2: Database Connection Strategy

**Decision:** Use Prisma with connection pooling (PgBouncer or Prisma Data Proxy) for serverless environments.

**Context:**
- Next.js can run on serverless (Vercel) or traditional servers
- Database connections are expensive resource
- Need to handle variable traffic patterns

**Rationale:**
- **Prisma Data Proxy:** Managed connection pooling, built-in scaling
- **PgBouncer:** Open-source, low overhead, integrates with any database
- **Benefits:** Handles connection limits, prevents connection pool exhaustion

**Consequences:**
- ✅ Can scale horizontally without connection issues
- ⚠️ Adds latency (minimal with Data Proxy)
- ⚠️ Additional cost for managed service (Data Proxy)

**Status:** APPROVED (use Prisma Data Proxy for managed simplicity)

---

## ADR 3: Authentication Strategy

**Decision:** Use JWT tokens for API authentication, OAuth2 for third-party integrations, and session-based auth for web UI.

**Context:**
- Need to support web UI and API clients
- Must integrate with customer-portal authentication
- Support for third-party API integrations

**Rationale:**
- **JWT tokens:** Stateless, scalable, standard for APIs
- **Session-based:** Better for web UI (CSRF protection, cookie security)
- **OAuth2:** Industry standard for third-party integrations

**Consequences:**
- ✅ Flexible authentication for different clients
- ⚠️ Must manage token refresh and expiration
- ⚠️ Need token blacklisting for logout

**Status:** APPROVED

---

## ADR 4: Real-Time Notifications Strategy

**Decision:** Use WebSocket (Socket.io) for real-time in-app notifications with polling fallback.

**Context:**
- Users expect instant notifications of ticket updates
- Not all clients support WebSocket (proxies, firewalls)
- Need graceful degradation

**Rationale:**
- **WebSocket:** Low-latency, bidirectional communication
- **Socket.io:** Handles fallbacks (HTTP long-polling, SSE)
- **Benefits:** Works across different network conditions

**Consequences:**
- ✅ Fast real-time updates for supported clients
- ✅ Automatic fallback to polling if needed
- ⚠️ WebSocket connection management complexity
- ⚠️ Requires sticky sessions in load-balanced environment

**Status:** APPROVED (with polling fallback)

---

## ADR 5: Email Service Strategy

**Decision:** Use background job queue (database-backed queue) for email delivery with retry logic.

**Context:**
- Email delivery can be slow and fail
- Must not block request/response cycle
- Need guaranteed delivery with retries

**Rationale:**
- **Database queue:** No external dependency, works anywhere
- **Background job:** Send emails asynchronously
- **Retry logic:** Exponential backoff (1s, 2s, 4s, 8s, 16s)

**Consequences:**
- ✅ Non-blocking email delivery
- ✅ Guaranteed retry on failure
- ⚠️ Must manage background job processing (cron or worker)
- ⚠️ Need to handle stuck jobs

**Status:** APPROVED (with monitoring)

---

## ADR 6: File Storage Strategy

**Decision:** Use local filesystem initially, with migration path to AWS S3 or similar cloud storage.

**Context:**
- File upload is required feature
- Attachments include images, PDFs, documents
- Security and privacy concerns

**Rationale:**
- **Local filesystem:** Simple to implement, no external dependencies initially
- **Migration path:** Can migrate to S3 later without changing API
- **Benefits:** Faster iteration during initial release

**Consequences:**
- ✅ Fast implementation
- ⚠️ Scaling challenges with local storage
- ⚠️ Backup complexity
- ➡️ **Migration:** Move to S3/Cloud Storage in Phase 3 of production

**Status:** APPROVED (with migration planned)

---

## ADR 7: Search Implementation

**Decision:** Use PostgreSQL full-text search (FTS) for initial implementation with migration path to Elasticsearch/OpenSearch.

**Context:**
- Need to search 100,000+ tickets
- Response time target: < 2 seconds
- Complex boolean operators required

**Rationale:**
- **PostgreSQL FTS:** Built-in, no external dependency
- **Performance:** Good for 100k documents, excellent for 1M documents
- **Migration path:** Can switch to Elasticsearch if needed

**Consequences:**
- ✅ No external search infrastructure needed initially
- ⚠️ Query optimization required for performance
- ➡️ **Migration:** Consider Elasticsearch for scaling beyond 10M documents

**Status:** APPROVED (with indexing strategy)

---

## ADR 8: SLA Time Tracking Strategy

**Decision:** Store SLA deadlines as calculated timestamps in database, with background job to check violations.

**Context:**
- SLA times vary by priority
- Business hours configuration affects calculation
- Must handle paused SLA during "Esperando Cliente" status

**Rationale:**
- **Stored timestamps:** Fast queries, no calculation at read time
- **Background job:** Periodic check (every 5 minutes) for violations
- **Benefits:** Simple, performant, easy to understand

**Consequences:**
- ✅ Fast SLA queries
- ✅ Decoupled SLA calculation from requests
- ⚠️ Must handle business hours configuration
- ⚠️ Background job must run reliably

**Status:** APPROVED

---

## ADR 9: Notification Preferences Storage

**Decision:** Store notification preferences per user (email frequency, notification types, quiet hours).

**Context:**
- Users have different preferences for notifications
- Reduce notification fatigue
- Respect user control

**Rationale:**
- **Granular preferences:** Users control what they receive
- **Database storage:** Survives app restarts, queryable
- **Defaults:** Sensible defaults for all users

**Consequences:**
- ✅ Better user experience
- ✅ Reduced notification fatigue
- ⚠️ More complex notification logic
- ⚠️ Need UI for preference management

**Status:** APPROVED

---

## ADR 10: Audit Logging Strategy

**Decision:** Create TicketHistory records for all field changes, separate table for detailed audit logs.

**Context:**
- Must track who changed what and when
- Compliance requirements
- Dispute resolution

**Rationale:**
- **TicketHistory:** Lightweight, fast queries on ticket changes
- **AuditLog:** Detailed logs of all system actions
- **Benefits:** Both performance-optimized and comprehensive

**Consequences:**
- ✅ Complete audit trail
- ✅ Fast access to ticket changes
- ⚠️ Must maintain consistency between tables
- ⚠️ Storage overhead for detailed logs

**Status:** APPROVED

---

## ADR 11: Rate Limiting Strategy

**Decision:** Implement rate limiting at API gateway level and per-user in middleware.

**Context:**
- Prevent API abuse
- Protect system from overload
- Different limits for different user types

**Rationale:**
- **API gateway level:** Global limit, prevents DDoS
- **Per-user:** 100 requests per minute for API clients
- **Different limits:** Support agents may need higher limits

**Consequences:**
- ✅ API protected from abuse
- ✅ Prevents resource exhaustion
- ⚠️ Must handle rate limit errors gracefully
- ⚠️ Need to communicate limits to API users

**Status:** APPROVED

---

## ADR 12: Testing Strategy

**Decision:** Target >85% code coverage with unit tests, add integration tests for critical paths, E2E tests for user workflows.

**Context:**
- Support system is critical (impacts customer satisfaction)
- Downtime costs money and damages reputation
- Need confidence in deployments

**Rationale:**
- **Unit tests (>85%):** Fast, comprehensive, catch regressions
- **Integration tests:** Verify API contracts, database interactions
- **E2E tests:** Verify complete user workflows

**Consequences:**
- ✅ High confidence in code quality
- ✅ Safe refactoring
- ⚠️ Test maintenance overhead
- ⚠️ Slower development cycle initially

**Status:** APPROVED

---

## ADR 13: Deployment Strategy

**Decision:** Deploy to Vercel (production), Docker containers with Kubernetes (alternative), with blue-green deployment for zero-downtime updates.

**Context:**
- Team uses Vercel for existing projects
- Need high availability
- Zero-downtime deployments important

**Rationale:**
- **Vercel:** Familiar, excellent Next.js support, auto-scaling
- **Docker/K8s:** Alternative for on-premise or multi-cloud
- **Blue-green:** Zero downtime, easy rollback

**Consequences:**
- ✅ Familiar deployment platform
- ✅ Auto-scaling built-in
- ⚠️ Vercel costs may increase with traffic
- ⚠️ Need to manage database migrations

**Status:** APPROVED (Vercel primary, Docker/K8s as alternative)

---

## ADR 14: Error Handling & Logging

**Decision:** Use Pino for structured logging with PII masking, Sentry for error tracking.

**Context:**
- Team uses Pino already
- Need to track errors in production
- Privacy compliance (PII masking)

**Rationale:**
- **Pino:** Structured JSON logging, excellent performance
- **PII masking:** Prevents sensitive data in logs
- **Sentry:** Production error tracking, alerting

**Consequences:**
- ✅ Consistent with existing codebase
- ✅ Good performance
- ✅ Production visibility
- ⚠️ Sentry adds external dependency
- ⚠️ Must configure PII patterns

**Status:** APPROVED

---

## ADR 15: API Versioning Strategy

**Decision:** Use URL versioning (/api/v1, /api/v2) with deprecation timeline for old versions.

**Context:**
- Need to evolve API over time
- Breaking changes inevitable
- Support multiple client versions

**Rationale:**
- **URL versioning:** Clear, explicit, easy to route
- **Deprecation timeline:** 6 months notice before removal
- **Benefits:** Allows for breaking changes without disrupting clients

**Consequences:**
- ✅ Clear API evolution path
- ✅ Support multiple client versions
- ⚠️ Must maintain multiple versions
- ⚠️ Documentation overhead

**Status:** APPROVED

---

## ADR 16: Knowledge Base Organization

**Decision:** Use category hierarchy (categories → subcategories) with tagging support.

**Context:**
- Articles need flexible organization
- Articles may belong to multiple categories
- Need fast article discovery

**Rationale:**
- **Hierarchy:** Intuitive organization
- **Tags:** Cross-cutting concerns
- **Benefits:** Flexible, doesn't force articles into single category

**Consequences:**
- ✅ Flexible article organization
- ✅ Better discoverability
- ⚠️ More complex categorization logic
- ⚠️ Need UI for managing tags

**Status:** APPROVED

---

## ADR 17: Notification Channels

**Decision:** Support email and in-app notifications, with user preference to choose channel per notification type.

**Context:**
- Users have different communication preferences
- Email good for permanent record, in-app good for urgency
- Some users prefer one over other

**Rationale:**
- **Multiple channels:** User choice
- **Per-notification-type:** Can prefer email for critical, in-app for routine
- **Benefits:** Better user experience

**Consequences:**
- ✅ Improved user experience
- ✅ Higher engagement with notifications
- ⚠️ Complex notification logic
- ⚠️ Need to manage multiple delivery systems

**Status:** APPROVED

---

## ADR 18: Scalability Approach

**Decision:** Design for stateless services, horizontal scaling, and caching layers.

**Context:**
- System may grow significantly
- Traffic patterns unpredictable
- Team needs to scale without redesign

**Rationale:**
- **Stateless services:** Easy to scale horizontally
- **Caching:** Redis for performance, reduced database load
- **Database scaling:** Read replicas for reporting, connection pooling

**Consequences:**
- ✅ Can scale to handle growth
- ✅ Graceful degradation under load
- ⚠️ More complex infrastructure
- ⚠️ Cache invalidation challenges

**Status:** APPROVED (cache strategy TBD in Phase 8)

---

## ADR 19: Security Posture

**Decision:** Implement defense-in-depth: input validation, SQL injection prevention, XSS protection, CSRF tokens, rate limiting.

**Context:**
- System handles customer data
- Potential security threats
- Compliance requirements

**Rationale:**
- **Input validation:** Zod for schema validation
- **Parameterized queries:** Prisma handles SQL injection
- **XSS protection:** React escapes content, CSP headers
- **CSRF:** SameSite cookies, CSRF tokens for POST
- **Rate limiting:** Prevent brute force attacks

**Consequences:**
- ✅ Strong security posture
- ✅ Compliance-ready
- ⚠️ Security adds complexity
- ⚠️ Must stay updated on vulnerabilities

**Status:** APPROVED (with regular security audits)

---

## ADR 20: Data Retention & Privacy

**Decision:** Keep all ticket data indefinitely (archival), allow GDPR right-to-deletion with anonymization.

**Context:**
- Business needs to keep support history
- GDPR/privacy compliance required
- Balancing retention vs. privacy

**Rationale:**
- **Indefinite retention:** Support reference, trend analysis
- **Anonymization:** Delete PII, keep ticket structure for analytics
- **Archival:** Move old data to cold storage

**Consequences:**
- ✅ Support history available long-term
- ✅ GDPR compliant
- ⚠️ Complex data deletion logic
- ⚠️ Storage costs for archival

**Status:** APPROVED (with anonymization strategy in Phase 6)

---

## Decision Matrix Summary

| ADR | Decision | Status | Phase |
|-----|----------|--------|-------|
| 1 | Next.js + TypeScript + PostgreSQL | APPROVED | Phase 1 |
| 2 | Prisma + connection pooling | APPROVED | Phase 1 |
| 3 | JWT + OAuth2 + Session auth | APPROVED | Phase 1 |
| 4 | WebSocket + polling fallback | APPROVED | Phase 2 |
| 5 | Database queue + background jobs | APPROVED | Phase 2 |
| 6 | Local storage → S3 migration | APPROVED | Phase 1 (migrate Phase 3) |
| 7 | PostgreSQL FTS → Elasticsearch | APPROVED | Phase 3 (migrate Phase 8) |
| 8 | SLA stored timestamps + background job | APPROVED | Phase 4 |
| 9 | Per-user notification preferences | APPROVED | Phase 2 |
| 10 | TicketHistory + AuditLog tables | APPROVED | Phase 1 |
| 11 | API gateway + per-user rate limiting | APPROVED | Phase 1 |
| 12 | >85% coverage + integration + E2E | APPROVED | Phase 9 |
| 13 | Vercel + Docker/K8s alternative | APPROVED | Phase 8 |
| 14 | Pino + PII masking + Sentry | APPROVED | Phase 1 |
| 15 | URL versioning (/api/v1) | APPROVED | Phase 1 |
| 16 | Category hierarchy + tags | APPROVED | Phase 5 |
| 17 | Email + in-app notifications | APPROVED | Phase 2 |
| 18 | Stateless + horizontal scaling | APPROVED | Phase 8 |
| 19 | Defense-in-depth security | APPROVED | Phase 1 |
| 20 | Indefinite retention + GDPR anonymization | APPROVED | Phase 6 |

