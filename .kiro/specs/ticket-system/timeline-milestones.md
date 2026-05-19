# Ticket System - Timeline & Milestones

**Baseline Timeline:** 22 weeks (5-person core team)  
**Accelerated Timeline:** 18-20 weeks (7-person team)  
**Start Date:** TBD (Week 1)  
**Planned Completion:** Week 22

---

## High-Level Timeline (Gantt View)

```
Week  1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22
──────────────────────────────────────────────────────────────
Phase1 ████████   Core Ticket Management
Phase2      ████████   Messaging & Communication
Phase3          ████████   Support Operations
Phase4              ████████   SLA & Escalation
Phase5                  ████████   Knowledge Base
Phase6                      ████████   Admin & Reporting
Phase7                          ████████   Advanced Features
Phase8                              ████████   Integrations
Phase9                                  ██████████   Testing & QA
Phase10                                         ████████   Production
```

---

## Detailed Phase Timeline

### Milestone 0: Project Kickoff & Setup (Week 0.5 - 3 days)
**Status:** ⚪ Planning (before Phase 1 starts)

**Objective:** Foundation & team alignment

**Deliverables:**
- [ ] Team onboarded & workstations configured
- [ ] Development environment running (Docker, PostgreSQL, Node.js)
- [ ] Git repository cloned & branching strategy defined
- [ ] CI/CD pipeline basic setup
- [ ] Project tracking (Jira/GitHub Projects) configured
- [ ] Architecture review completed & approved
- [ ] Risk register created

**Owner:** PM + Backend Lead  
**Duration:** 3 days (1.5 weeks equivalent)  
**Effort:** ~30 hours

---

### Phase 1: Core Ticket Management (Weeks 1-3)
**Status:** ⚪ Scheduled

**Goal:** Database & API foundation ready for Phase 2

**Key Milestones:**
- **Week 1 End:** Database schema finalized & migrations created
- **Week 2 End:** Ticket CRUD API endpoints complete & tested
- **Week 3 End:** API documentation published, authentication working

**Deliverables by Epic:**

**Epic 1.1: Database Schema & ORM** (Week 1)
- [ ] PostgreSQL schema designed (11 core entities)
- [ ] Prisma schema file created & validated
- [ ] Initial migrations committed
- [ ] Database seed script working
- [ ] Performance baselines established

**Epic 1.2: Ticket CRUD Operations** (Weeks 1-3)
- [ ] Ticket model fully functional (create, read, update, delete)
- [ ] Validation schemas (Zod) for all inputs
- [ ] Unit tests >80% coverage
- [ ] Integration tests for core flows
- [ ] Error handling & status codes correct

**Epic 1.3: API Foundation** (Weeks 2-3)
- [ ] API routes structure defined
- [ ] JWT authentication middleware working
- [ ] RBAC middleware implemented
- [ ] Rate limiting configured
- [ ] OpenAPI documentation generated
- [ ] Health check endpoint live

**Owner:** Backend Lead (primary), Backend Dev #1 (support)  
**Effort:** 150 hours total (36 hours/week for 3-4 weeks)  
**Team Capacity:** 
- Backend Lead: 50 hours
- Backend Dev #1: 60 hours
- QA: 20 hours (test setup)
- DevOps: 5 hours (CI/CD)

**Dependencies:** None  
**Risks:**
- Database schema design mistakes (→ review early with team)
- Missing validation (→ comprehensive Zod schemas)

---

### Phase 2: Messaging & Communication (Weeks 4-5)
**Status:** ⚪ Scheduled

**Goal:** Ticket-to-message communication working, notifications configured

**Key Milestones:**
- **Week 4 End:** Message CRUD & email templates ready
- **Week 5 End:** WebSocket notifications live, preferences stored

**Deliverables by Epic:**

**Epic 2.1: Bidirectional Messaging** (Week 4)
- [ ] Message model & CRUD operations
- [ ] Message attachments (file upload/storage)
- [ ] Internal notes feature (hidden from clients)
- [ ] Auto-status transitions (Esperando Cliente → En Progreso)
- [ ] 80% test coverage

**Epic 2.2: Email Notifications** (Week 4-5)
- [ ] Email service configured (SMTP/SendGrid)
- [ ] 5 email templates created
- [ ] Email queue system working
- [ ] Retry logic (exponential backoff)
- [ ] Email logging & monitoring

**Epic 2.3: In-App Notifications** (Week 5)
- [ ] Notification model & database
- [ ] WebSocket server running (Socket.io)
- [ ] Notification UI components (React)
- [ ] Notification preferences UI
- [ ] Polling fallback working

**Owner:** Backend Dev #1 (primary), Frontend Lead (start Week 5, in-app UI)  
**Effort:** 155 hours
- Backend Dev #1: 80 hours
- Backend Lead: 30 hours (support)
- Frontend Lead: 30 hours (notification UI)
- QA: 15 hours

**Dependencies:** Phase 1 complete  
**Risks:**
- Email delivery failures (→ extensive testing, fallback providers)
- WebSocket connection stability (→ polling fallback)

---

### Phase 3: Support Operations (Weeks 6-7)
**Status:** ⚪ Scheduled

**Goal:** Agent dashboard & advanced search operational

**Key Milestones:**
- **Week 6 End:** Assignment & status management working
- **Week 7 End:** Full-text search & advanced filters live

**Deliverables by Epic:**

**Epic 3.1: Ticket Assignment & Routing** (Week 6)
- [ ] Assignment service with workload calculation
- [ ] Auto-assignment logic by category
- [ ] Assignment history tracking
- [ ] Reassignment notifications
- [ ] 80% test coverage

**Epic 3.2: Status & Priority Management** (Week 6-7)
- [ ] Status transition validation (state machine)
- [ ] Priority change audit logging
- [ ] Auto-closure after 7 days in "Resuelto"
- [ ] Ticket reopen logic
- [ ] Closed ticket protection

**Epic 3.3: Advanced Search & Filtering** (Week 7)
- [ ] PostgreSQL FTS indexing implemented
- [ ] Search service (ticket ID, title, description, messages)
- [ ] Filter service (status, priority, category, date, assignee)
- [ ] Boolean operators (AND, OR, NOT)
- [ ] <2 sec response time for 100k tickets
- [ ] Search UI component (React)

**Owner:** Backend Lead + Backend Dev #1  
**Effort:** 170 hours
- Backend Lead: 70 hours
- Backend Dev #1: 65 hours
- Frontend Lead: 20 hours (search UI)
- QA: 15 hours

**Dependencies:** Phase 1 complete  
**Risks:**
- Search performance degradation (→ query optimization, indexing strategy)
- State machine bugs (→ comprehensive unit tests)

---

### Phase 4: SLA & Escalation (Weeks 8-9)
**Status:** ⚪ Scheduled

**Goal:** SLA tracking & escalation automation active

**Key Milestones:**
- **Week 8 End:** SLA calculations & breach detection working
- **Week 9 End:** Escalation rules engine & notifications live

**Deliverables by Epic:**

**Epic 4.1: SLA Configuration & Tracking** (Week 8)
- [ ] SLA Config model (Admin panel to configure)
- [ ] SLA deadline calculation on ticket creation
- [ ] SLA time tracking service
- [ ] Pause/resume logic (Esperando Cliente status)
- [ ] Background job for monitoring (every 5 min)
- [ ] SLA breach detection & marking
- [ ] Warning notifications (75% of deadline)

**Epic 4.2: Escalation Logic** (Week 9)
- [ ] Critical ticket auto-escalation
- [ ] SLA violation escalation (to Supervisor)
- [ ] Resolution SLA escalation (to Admin)
- [ ] Manual escalation support
- [ ] Escalation flag in ticket list
- [ ] Customizable escalation rules (Admin)
- [ ] Supervisor notifications

**Owner:** Backend Lead (primary), Backend Dev #1 (support)  
**Effort:** 125 hours
- Backend Lead: 65 hours
- Backend Dev #1: 40 hours
- Frontend Lead: 10 hours (SLA display)
- QA: 10 hours

**Dependencies:** Phase 1 complete, Phase 4 requires background job infrastructure  
**Risks:**
- SLA calculation edge cases (→ extensive unit tests, audit logging)
- Background job reliability (→ monitoring & alerting)

---

### Phase 5: Knowledge Base (Weeks 10-11)
**Status:** ⚪ Scheduled

**Goal:** Self-service knowledge base operational

**Key Milestones:**
- **Week 10 End:** Article CRUD & publishing working
- **Week 11 End:** Article search & suggestions live

**Deliverables by Epic:**

**Epic 5.1: Knowledge Base Articles** (Week 10)
- [ ] Article model in Prisma
- [ ] CRUD operations (create, read, update, delete)
- [ ] Draft/Publish workflow
- [ ] Version history tracking
- [ ] Category hierarchy
- [ ] Rich text editor (markdown or WYSIWYG)
- [ ] Article archiving

**Epic 5.2: Article Search & Suggestions** (Week 11)
- [ ] Full-text search in articles
- [ ] Article ranking by relevance
- [ ] Helpful/not helpful rating system
- [ ] View count tracking
- [ ] Auto-suggestions on ticket creation
- [ ] "Most viewed" & "highest rated" sections
- [ ] Article search UI

**Owner:** Backend Dev #1 + Frontend Lead  
**Effort:** 115 hours
- Backend Dev #1: 50 hours
- Frontend Lead: 45 hours
- Backend Lead: 10 hours (support)
- QA: 10 hours

**Dependencies:** Phase 1, Phase 2 (messaging)  
**Risks:**
- Article search relevance (→ tuning algorithm)
- Rich text editor complexity (→ use battle-tested library)

---

### Phase 6: Admin & Reporting (Weeks 12-13)
**Status:** ⚪ Scheduled

**Goal:** Admin panel & performance dashboards ready

**Key Milestones:**
- **Week 12 End:** Admin configuration panel live
- **Week 13 End:** Reports & metrics dashboard operational

**Deliverables by Epic:**

**Epic 6.1: Admin Configuration** (Week 12)
- [ ] Category management (CRUD)
- [ ] User role assignment
- [ ] SLA configuration UI
- [ ] Business hours configuration
- [ ] Notification preferences admin view
- [ ] Dashboard layout & navigation

**Epic 6.2: Performance Reports** (Week 12-13)
- [ ] Report aggregation service
- [ ] Ticket volume metrics
- [ ] Response/resolution time metrics
- [ ] SLA compliance reporting
- [ ] Ticket distribution reports
- [ ] Agent performance metrics
- [ ] Customer satisfaction metrics
- [ ] Trend charts (volume, metrics over time)
- [ ] CSV export
- [ ] Report scheduling & email delivery

**Owner:** Backend Lead + Frontend Lead  
**Effort:** 125 hours
- Frontend Lead: 60 hours (admin UI, dashboards)
- Backend Lead: 40 hours (reporting service)
- Backend Dev #1: 10 hours (support)
- QA: 15 hours (100% starts here)

**Dependencies:** Phase 1-5 complete  
**Risks:**
- Report performance at scale (→ query optimization, caching)
- Dashboard complexity (→ component library reuse)

---

### Phase 7: Advanced Features (Weeks 14-15)
**Status:** ⚪ Scheduled

**Goal:** Customer satisfaction, templates, multi-channel working

**Key Milestones:**
- **Week 14 End:** Satisfaction surveys & templates live
- **Week 15 End:** Email-to-ticket conversion working

**Deliverables by Epic:**

**Epic 7.1: Customer Satisfaction** (Week 14)
- [ ] Satisfaction survey model
- [ ] Survey sending on ticket resolution
- [ ] 1-5 star rating UI
- [ ] Written feedback collection
- [ ] Satisfaction metrics calculation
- [ ] Low rating alerts to Supervisor

**Epic 7.2: Response Templates** (Week 14-15)
- [ ] Template model & CRUD
- [ ] Template variable substitution
- [ ] Organization-wide templates
- [ ] Template UI in message composer
- [ ] Template editing before sending

**Epic 7.3: Multi-Channel Support** (Week 15)
- [ ] Email ingestion service (support@camiprint.com)
- [ ] Email parsing & ticket creation
- [ ] Email reply detection & message addition
- [ ] Channel source tracking
- [ ] File attachment extraction

**Owner:** Multiple (see team-and-ownership.md)  
**Effort:** 150 hours
- Backend Lead: 45 hours
- Backend Dev #1: 45 hours
- Frontend Lead: 40 hours
- DevOps: 10 hours (email service)
- QA: 10 hours

**Dependencies:** Phase 1-6 complete  
**Risks:**
- Email parsing complexity (→ use email-parser library, test extensively)
- Multi-tenant email handling (→ webhook signature validation)

---

### Phase 8: Integrations & Deployment (Weeks 16-17)
**Status:** ⚪ Scheduled

**Goal:** API ready for integrations, deployment infrastructure configured

**Key Milestones:**
- **Week 16 End:** Complete REST API, API keys working
- **Week 17 End:** Deployment pipelines & monitoring live

**Deliverables by Epic:**

**Epic 8.1: Customer Portal Integration** (Week 16)
- [ ] Ticket system embedded in customer portal
- [ ] Shared authentication (session reuse)
- [ ] Consistent styling & navigation
- [ ] Deep linking to specific tickets
- [ ] Ticket widget on portal dashboard

**Epic 8.2: API & External Integrations** (Week 16-17)
- [ ] REST API endpoints complete
- [ ] API key management system
- [ ] OAuth2 support
- [ ] Webhook system for integrations
- [ ] Node.js SDK
- [ ] Python SDK
- [ ] API documentation (interactive)
- [ ] Rate limiting enforcement

**Epic 8.3: Deployment & Monitoring** (Week 17)
- [ ] Docker configuration
- [ ] Kubernetes deployment manifests (optional)
- [ ] CI/CD pipeline (GitHub Actions/GitLab CI)
- [ ] Application monitoring (Prometheus/Datadog)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Alerting thresholds

**Owner:** DevOps Engineer (primary), Backend Lead (support)  
**Effort:** 195 hours
- DevOps Engineer: 100 hours (100% commitment)
- Backend Lead: 50 hours (API, integration)
- Backend Dev #1: 30 hours (API endpoints)
- Frontend Lead: 10 hours (portal embedding)
- QA: 5 hours

**Dependencies:** Phase 1-7 complete  
**Risks:**
- Deployment complexity (→ use managed services like Vercel)
- API compatibility issues (→ early SDK testing)

---

### Phase 9: Testing & QA (Weeks 18-20)
**Status:** ⚪ Scheduled

**Goal:** Production-ready code quality & security

**Key Milestones:**
- **Week 18 End:** Unit & integration tests >85% coverage
- **Week 19 End:** E2E tests complete & passing
- **Week 20 End:** Security audit passed, performance optimized

**Deliverables by Epic:**

**Epic 9.1: Automated Testing** (Weeks 18-19)
- [ ] Unit test coverage >85%
- [ ] Integration test suite (API + DB)
- [ ] E2E tests (critical user paths)
- [ ] Performance/load tests
- [ ] API rate limiting tests
- [ ] Database query optimization
- [ ] Email delivery tests
- [ ] WebSocket notification tests
- [ ] Mutation testing for critical paths
- [ ] Coverage reports & CI integration

**Epic 9.2: Manual QA & UAT** (Weeks 19-20)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Security testing (OWASP Top 10, SQL injection, XSS, CSRF)
- [ ] Performance testing (<200ms API response p95, <2s search)
- [ ] Data migration testing
- [ ] Backup & recovery testing
- [ ] QA test plan documentation
- [ ] User acceptance testing with stakeholders
- [ ] Known issues register

**Owner:** QA Engineer (primary, 100%)  
**Effort:** 220 hours
- QA Engineer: 160 hours
- Backend Lead: 30 hours (test support)
- Frontend Lead: 20 hours (UI testing)
- DevOps: 10 hours (performance testing)

**Dependencies:** Phase 1-8 complete  
**Risks:**
- Test coverage incomplete (→ continuous monitoring throughout project)
- Performance regression (→ baseline metrics in Phase 1)

---

### Phase 10: Production Rollout (Weeks 21-22)
**Status:** ⚪ Scheduled

**Goal:** Live in production with monitoring active

**Key Milestones:**
- **Week 21 End:** Pre-production checklist complete, beta users onboarded
- **Week 22 End:** General availability announced, monitoring active 24/7

**Deliverables by Epic:**

**Epic 10.1: Pre-Production Preparation** (Week 21)
- [ ] Database backup & recovery procedures documented
- [ ] Disaster recovery plan created
- [ ] Performance baselines established
- [ ] Incident response runbooks written
- [ ] Monitoring dashboards configured
- [ ] Alerting thresholds set
- [ ] Load capacity planning documented
- [ ] Rollback procedures tested

**Epic 10.2: Staged Rollout** (Week 21-22)
- [ ] Internal team access & training
- [ ] Beta customer group access (10-20 customers)
- [ ] Feedback collection & issue tracking
- [ ] General availability launch
- [ ] Customer communication & announcements
- [ ] 24/7 monitoring & support standby
- [ ] Post-launch optimization

**Owner:** DevOps Engineer + PM  
**Effort:** 140 hours
- DevOps Engineer: 80 hours
- PM: 40 hours
- Backend Lead: 10 hours
- Frontend Lead: 10 hours

**Dependencies:** Phase 1-9 complete  
**Risks:**
- Production issues (→ comprehensive testing, monitoring, runbooks)
- Customer issues (→ support team training, communication plan)

---

## Timeline Adjustments & Contingencies

### Best Case (7-person team, no blockers)
- **Duration:** 18-20 weeks
- **Acceleration:** Parallel execution of epics
- **Start:** Week 0, End: Week 20

### Standard Case (5-person core team)
- **Duration:** 22 weeks
- **Risk:** Sequential phase execution
- **Start:** Week 0, End: Week 22

### Worst Case (4-person team, major blockers)
- **Duration:** 26+ weeks
- **Risk:** Scope reduction needed
- **Mitigation:** Hire contractors, reduce scope, delay Phase 7+

---

## Key Decision Points

| Week | Decision | Impact | Owner |
|------|----------|--------|-------|
| End of Week 3 | Phase 1 sign-off (API ready?) | Go/No-go Phase 2 | Backend Lead + PM |
| End of Week 5 | Notification system quality? | Scale? Rewrite? | Backend Dev #1 + PM |
| End of Week 7 | Search performance acceptable? | Use PostgreSQL or migrate to Elasticsearch? | Backend Lead |
| End of Week 9 | SLA logic validated? | Proceed to Phase 5 or fix? | Backend Lead + QA |
| End of Week 13 | Admin panel usable? | Ready for Phase 8? | Frontend Lead + PM |
| End of Week 15 | Email integration working? | Deploy to staging or iterate? | Backend Dev #1 |
| End of Week 17 | Infrastructure ready? | Go to Phase 9 or delay? | DevOps + PM |
| End of Week 20 | Security & performance audit passed? | Go/No-go production? | QA + Security |
| Week 21 | Production launch approved? | Launch with monitoring | All |

---

## Success Criteria by Phase

### Phase 1: Core Ticket Management
- ✅ Database schema finalized with 0 breaking changes needed
- ✅ API endpoints 100% functional
- ✅ Unit test coverage >80%
- ✅ Zero critical security vulnerabilities
- ✅ API response time <200ms (p95)

### Phase 2: Messaging & Communication
- ✅ Messages working reliably
- ✅ Email delivery >99% success rate
- ✅ WebSocket notifications <500ms latency
- ✅ 0 critical notification delivery issues

### Phase 3: Support Operations
- ✅ Assignment & status working reliably
- ✅ Search response time <2 sec for 100k tickets
- ✅ No false positives in auto-assignment

### Phase 4: SLA & Escalation
- ✅ SLA calculations verified (manual spot checks)
- ✅ Escalation logic working as defined
- ✅ Background jobs running reliably

### Phase 5: Knowledge Base
- ✅ Article search working with good relevance
- ✅ Suggestions helpful (manual review)

### Phase 6: Admin & Reporting
- ✅ Admin panel usable by non-technical users
- ✅ Reports accurate (verified against raw data)
- ✅ Dashboard loads <2 sec

### Phase 7: Advanced Features
- ✅ Satisfaction surveys high completion rate
- ✅ Templates reduce response time 30%+
- ✅ Email integration <5 errors/1000 emails

### Phase 8: Integrations & Deployment
- ✅ API SDKs tested with example apps
- ✅ Deployment to staging successful
- ✅ Monitoring alerts working

### Phase 9: Testing & QA
- ✅ Code coverage >85%
- ✅ 0 critical bugs in QA
- ✅ Performance targets met
- ✅ Security audit clean

### Phase 10: Production Rollout
- ✅ 0 critical issues in Week 1
- ✅ User adoption >50% of team in Week 1
- ✅ Satisfaction >4.0/5.0 after 2 weeks

