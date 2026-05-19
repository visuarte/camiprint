# Phase 1 Week 1: Core Database Design & ORM Setup

**Phase:** 1 (Core Ticket Management)  
**Week:** 1 of 3  
**Sprint:** Sprint 1 (Days 1-5 of project)  
**Owner:** Backend Lead  
**Support:** Backend Dev #1  
**Status:** ⚪ Ready to start (after Milestone 0)

---

## Week 1 Objectives

✅ Database schema fully designed & validated  
✅ Prisma ORM configured & generating types  
✅ Initial migrations created & tested  
✅ Database seeding script working  
✅ Performance baselines established  
✅ API foundation ready for Week 2

---

## Daily Breakdown

### Day 1 (Monday): Database Schema Design

#### Morning (4 hours)

**Task 1.1.1: Database Schema Design** ⭐ START HERE
- [ ] **Objective:** Finalize PostgreSQL schema for all entities
- [ ] **Deliverable:** `schema.md` with complete entity definitions
- [ ] **Subtasks:**

  1. **1.1.1.1 Core Entities (1 hour)**
     - [ ] Design `users` table:
       ```sql
       users (
         id UUID PRIMARY KEY,
         email VARCHAR(255) UNIQUE NOT NULL,
         name VARCHAR(255) NOT NULL,
         role ENUM(Client, Support_Agent, Supervisor, Admin) NOT NULL,
         password_hash VARCHAR(255) NOT NULL,
         is_active BOOLEAN DEFAULT true,
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
       )
       ```
     - [ ] Design `tickets` table:
       ```sql
       tickets (
         id UUID PRIMARY KEY,
         client_id UUID REFERENCES users(id) NOT NULL,
         created_by UUID REFERENCES users(id) NOT NULL,
         title VARCHAR(500) NOT NULL,
         description TEXT NOT NULL,
         status ENUM(...) NOT NULL DEFAULT 'Nuevo',
         priority ENUM(...) NOT NULL DEFAULT 'Media',
         category_id UUID REFERENCES categories(id),
         assigned_to UUID REFERENCES users(id) NULL,
         sla_deadline_response TIMESTAMP,
         sla_deadline_resolution TIMESTAMP,
         sla_status ENUM(...) DEFAULT 'On Track',
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW(),
         resolved_at TIMESTAMP NULL,
         closed_at TIMESTAMP NULL
       )
       ```
     - [ ] Design `messages` table
     - [ ] Design `categories` table
     - [ ] Design `ticket_history` table
     - [ ] **Owner:** Backend Lead
     - [ ] **Validation:** Run through team review

  2. **1.1.1.2 Relationships & Constraints (1 hour)**
     - [ ] Define foreign key relationships
     - [ ] Add NOT NULL constraints where appropriate
     - [ ] Add UNIQUE constraints (email, etc.)
     - [ ] Add CHECK constraints (status transitions, priority values)
     - [ ] Document cascade delete/update behavior
     - [ ] **Deliverable:** Updated schema.md with constraint definitions

  3. **1.1.1.3 Indexes & Performance (1 hour)**
     - [ ] Index on `tickets.client_id` (for client queries)
     - [ ] Index on `tickets.assigned_to` (for agent dashboard)
     - [ ] Index on `tickets.status` (for filtering)
     - [ ] Index on `tickets.created_at` (for ordering)
     - [ ] Index on `tickets.sla_status` (for SLA queries)
     - [ ] Full-text search index on `tickets(title, description, messages.content)`
     - [ ] Composite index on `(status, priority, created_at)`
     - [ ] **Owner:** Backend Lead
     - [ ] **Validation:** Explain performance implications for each

  4. **1.1.1.4 Schema Documentation (1 hour)**
     - [ ] Create `schema.md` with:
       - ERD diagram (text or Mermaid)
       - Table definitions with comments
       - Relationships & cardinalities
       - Index definitions
       - Migration strategy notes
     - [ ] Add constraints documentation
     - [ ] **Deliverable:** `schema.md` in project root

#### Afternoon (4 hours)

**Task 1.1.2: Prisma Schema File Creation** 
- [ ] **Objective:** Convert SQL schema to Prisma schema
- [ ] **Deliverable:** `prisma/schema.prisma` complete & validated
- [ ] **Subtasks:**

  1. **1.1.2.1 Setup Prisma Configuration (1 hour)**
     - [ ] Install Prisma:
       ```bash
       npm install @prisma/client
       npm install -D prisma
       ```
     - [ ] Initialize Prisma:
       ```bash
       npx prisma init
       ```
     - [ ] Configure `.env.local`:
       ```
       DATABASE_URL="postgresql://user:password@localhost:5432/camiprint_tickets"
       ```
     - [ ] Configure `prisma.schema`:
       ```
       datasource db {
         provider = "postgresql"
         url      = env("DATABASE_URL")
       }
       
       generator client {
         provider = "prisma-client-js"
       }
       ```

  2. **1.1.2.2 Define Prisma Models (2 hours)**
     - [ ] Create User model with enums (Role)
     - [ ] Create Ticket model with enums (Status, Priority, SLAStatus)
     - [ ] Create Message model
     - [ ] Create Category model
     - [ ] Create TicketHistory model
     - [ ] Create Notification model
     - [ ] Create KnowledgeBase article model
     - [ ] Add relations between all models
     - [ ] Example:
       ```prisma
       model Ticket {
         id                    String    @id @default(cuid())
         clientId              String
         client                User      @relation("TicketClient", fields: [clientId], references: [id])
         createdBy             String
         creator               User      @relation("TicketCreator", fields: [createdBy], references: [id])
         title                 String
         description           String
         status                Status    @default(NUEVO)
         priority              Priority  @default(MEDIA)
         categoryId            String?
         category              Category? @relation(fields: [categoryId], references: [id])
         messages              Message[]
         history               TicketHistory[]
         
         @@index([clientId])
         @@index([status])
         @@index([priority])
         @@fulltext([title, description])
       }
       ```

  3. **1.1.2.3 Add Indexes & Constraints (1 hour)**
     - [ ] Add all indexes defined in schema.md
     - [ ] Add constraints (unique, check, etc.)
     - [ ] Validate relationships
     - [ ] **Owner:** Backend Lead
     - [ ] **Validation:** Prisma syntax check

- [ ] **Owner:** Backend Lead + Backend Dev #1
- [ ] **Duration:** 4 hours

---

### Day 2 (Tuesday): Database Migrations & Testing

#### Morning (4 hours)

**Task 1.1.3: Initial Migration & Database Creation**
- [ ] **Objective:** Create & test initial database schema
- [ ] **Deliverable:** Working PostgreSQL database with schema
- [ ] **Subtasks:**

  1. **1.1.3.1 Create Migration (1 hour)**
     - [ ] Run:
       ```bash
       npx prisma migrate dev --name init
       ```
     - [ ] Review generated migration file in `prisma/migrations/`
     - [ ] Validate migration SQL syntax
     - [ ] Commit migration to git

  2. **1.1.3.2 Verify Schema in Database (1 hour)**
     - [ ] Connect to PostgreSQL:
       ```bash
       psql -U user -d camiprint_tickets
       ```
     - [ ] Verify all tables created:
       ```sql
       SELECT table_name FROM information_schema.tables 
       WHERE table_schema='public';
       ```
     - [ ] Verify indexes:
       ```sql
       SELECT indexname FROM pg_indexes WHERE schemaname='public';
       ```
     - [ ] Verify relationships (foreign keys)
     - [ ] **Owner:** Backend Lead

  3. **1.1.3.3 Test Prisma Client Generation (1 hour)**
     - [ ] Verify `node_modules/.prisma/client` generated
     - [ ] Test in Node.js REPL:
       ```javascript
       const { PrismaClient } = require('@prisma/client');
       const prisma = new PrismaClient();
       // Test connection
       await prisma.$queryRaw('SELECT 1');
       ```
     - [ ] Verify TypeScript types available
     - [ ] Create & test basic type imports

  4. **1.1.3.4 Create Migration Documentation (1 hour)**
     - [ ] Document migration strategy
     - [ ] Document rollback procedures
     - [ ] Document migration testing approach
     - [ ] **Deliverable:** `MIGRATION_STRATEGY.md`

- [ ] **Owner:** Backend Lead
- [ ] **Duration:** 4 hours

#### Afternoon (4 hours)

**Task 1.1.4: Database Seeding Script**
- [ ] **Objective:** Create seed data for testing & development
- [ ] **Deliverable:** `prisma/seed.ts` & working seed script
- [ ] **Subtasks:**

  1. **1.1.4.1 Setup Seeding Infrastructure (1 hour)**
     - [ ] Create `prisma/seed.ts`:
       ```typescript
       import { PrismaClient } from '@prisma/client';
       const prisma = new PrismaClient();
       
       async function main() {
         // Seed logic here
       }
       
       main()
         .catch(e => {
           console.error(e);
           process.exit(1);
         })
         .finally(async () => {
           await prisma.$disconnect();
         });
       ```
     - [ ] Update `package.json`:
       ```json
       {
         "prisma": {
           "seed": "ts-node --transpile-only prisma/seed.ts"
         }
       }
       ```

  2. **1.1.4.2 Create Test Users & Categories (1 hour)**
     - [ ] Create 5 test Clients:
       ```typescript
       const clients = await Promise.all([
         prisma.user.create({ data: {
           email: 'client1@example.com',
           name: 'Client One',
           role: 'Client',
           passwordHash: 'hashed_pwd'
         }}),
         // ... 4 more
       ]);
       ```
     - [ ] Create 3 test Support Agents
     - [ ] Create 1 Admin user
     - [ ] Create 5 test Categories (Técnico, Facturación, etc.)

  3. **1.1.4.3 Create Sample Tickets (1 hour)**
     - [ ] Create 20 sample tickets with varying:
       - Status (Nuevo, Asignado, En Progreso, etc.)
       - Priority (Baja, Media, Alta, Crítica)
       - Category
       - Assignment
     - [ ] Create timestamps spanning last 30 days
     - [ ] **Owner:** Backend Lead

  4. **1.1.4.4 Test Seeding (1 hour)**
     - [ ] Run seed script:
       ```bash
       npx prisma db seed
       ```
     - [ ] Verify data in database
     - [ ] Count tables for validation:
       ```bash
       psql -c "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM tickets;"
       ```
     - [ ] Document expected data counts

- [ ] **Owner:** Backend Dev #1 (lead), Backend Lead (review)
- [ ] **Duration:** 4 hours

---

### Day 3 (Wednesday): Performance Baselines & Testing

#### Morning (4 hours)

**Task 1.1.5: Performance Baseline Establishment**
- [ ] **Objective:** Establish baseline metrics for future optimization
- [ ] **Deliverable:** `PERFORMANCE_BASELINE.md` with metrics
- [ ] **Subtasks:**

  1. **1.1.5.1 Query Performance Testing (2 hours)**
     - [ ] Create test queries (using pgAdmin or psql):
       - List all tickets (no filter): target <100ms for 1000 rows
       - List tickets for specific client: target <50ms
       - Search tickets by title: target <200ms for 10k rows
       - Get ticket with all messages: target <50ms
     - [ ] Measure execution time for each query
     - [ ] Record query execution plans (EXPLAIN ANALYZE)
     - [ ] Identify any full table scans
     - [ ] **Owner:** Backend Lead

  2. **1.1.5.2 Index Effectiveness Validation (1 hour)**
     - [ ] Verify indexes are being used (EXPLAIN ANALYZE output)
     - [ ] Test queries with/without indexes
     - [ ] Document index effectiveness
     - [ ] Identify missing indexes (if needed)

  3. **1.1.5.3 Connection Pool Testing (1 hour)**
     - [ ] Test PostgreSQL connection limits
     - [ ] Test connection pooling behavior
     - [ ] Document optimal pool size
     - [ ] Record baseline connection metrics

- [ ] **Owner:** Backend Lead
- [ ] **Duration:** 4 hours

#### Afternoon (4 hours)

**Task 1.1.6: Unit Tests for Database Layer**
- [ ] **Objective:** Establish test patterns & baseline coverage
- [ ] **Deliverable:** `src/__tests__/database.unit.test.ts` with >80% coverage
- [ ] **Subtasks:**

  1. **1.1.6.1 Setup Testing Framework (1 hour)**
     - [ ] Install test dependencies:
       ```bash
       npm install -D vitest @testing-library/jest-dom @faker-js/faker
       ```
     - [ ] Create `vitest.config.ts`
     - [ ] Configure test database (separate from dev)
     - [ ] Create test utilities (`testUtils/db.ts`)

  2. **1.1.6.2 Write Database Tests (2 hours)**
     - [ ] Test User creation & retrieval
     - [ ] Test Ticket creation with validation
     - [ ] Test relationships (user → tickets)
     - [ ] Test filters & queries
     - [ ] Test constraints (unique email, etc.)
     - [ ] Example:
       ```typescript
       describe('Ticket Database', () => {
         it('should create a ticket with valid data', async () => {
           const ticket = await prisma.ticket.create({
             data: {
               title: 'Test ticket',
               clientId: 'client-uuid',
               // ... other fields
             }
           });
           expect(ticket.id).toBeDefined();
           expect(ticket.status).toBe('NUEVO');
         });
       });
       ```

  3. **1.1.6.3 Test Coverage & CI Integration (1 hour)**
     - [ ] Run tests:
       ```bash
       npm run test:db
       ```
     - [ ] Generate coverage report
     - [ ] Verify >80% coverage
     - [ ] Add test script to `package.json`
     - [ ] Test in CI/CD pipeline

- [ ] **Owner:** Backend Dev #1 (lead), Backend Lead (review)
- [ ] **Duration:** 4 hours

---

### Day 4 (Thursday): Documentation & Code Review

#### Morning (4 hours)

**Task 1.1.7: Schema & Migration Documentation**
- [ ] **Objective:** Document schema for future developers
- [ ] **Deliverable:** Complete documentation package
- [ ] **Subtasks:**

  1. **1.1.7.1 Entity Documentation (2 hours)**
     - [ ] For each entity, document:
       - Purpose
       - Fields & types
       - Relationships
       - Constraints
       - Indexes
       - Example queries
     - [ ] Create in `docs/DATABASE.md`
     - [ ] Include ERD diagram (Mermaid or text)

  2. **1.1.7.2 Migration Procedures (1 hour)**
     - [ ] Document how to run migrations
     - [ ] Document how to rollback
     - [ ] Document data backup before migration
     - [ ] Document post-migration validation
     - [ ] **Deliverable:** `docs/MIGRATIONS.md`

  3. **1.1.7.3 Seeding & Test Data (1 hour)**
     - [ ] Document seed script
     - [ ] Document test data assumptions
     - [ ] Provide examples of expected data
     - [ ] Document seed idempotency
     - [ ] **Deliverable:** `docs/SEEDING.md`

- [ ] **Owner:** Backend Dev #1
- [ ] **Duration:** 4 hours

#### Afternoon (4 hours)

**Task 1.1.8: Code Review & Sign-Off**
- [ ] **Objective:** Ensure schema quality & team alignment
- [ ] **Deliverable:** Approved schema ready for Phase 1 Week 2
- [ ] **Subtasks:**

  1. **1.1.8.1 Self-Review & Testing (1 hour)**
     - [ ] Run all tests:
       ```bash
       npm run test
       ```
     - [ ] Verify migrations work clean:
       ```bash
       npx prisma migrate reset
       ```
     - [ ] Run seed script
     - [ ] Verify no console errors
     - [ ] **Owner:** Backend Dev #1

  2. **1.1.8.2 Team Code Review (1 hour)**
     - [ ] Schedule code review (30-60 min)
     - [ ] Reviewers: Backend Lead, QA Engineer
     - [ ] Review points:
       - Schema correctness & normalization
       - Index choices
       - Constraint definitions
       - Test coverage
       - Documentation completeness
     - [ ] Collect feedback

  3. **1.1.8.3 Incorporate Feedback (1 hour)**
     - [ ] Address review comments
     - [ ] Update schema if needed
     - [ ] Update tests if needed
     - [ ] Re-test if changes made

  4. **1.1.8.4 Final Sign-Off (1 hour)**
     - [ ] Backend Lead approval
     - [ ] Merge to `develop` branch
     - [ ] Tag release: `schema-v1.0.0`
     - [ ] Update project board: Task → Done
     - [ ] **Owner:** Backend Lead

- [ ] **Owner:** Backend Lead (lead), Backend Dev #1 (support)
- [ ] **Duration:** 4 hours

---

### Day 5 (Friday): Retrospective & Week 1 Wrap-Up

#### Morning (2 hours)

**Task 1.1.9: Week 1 Demo & Retrospective**
- [ ] **Objective:** Demonstrate work & collect team feedback
- [ ] **Deliverable:** Completed retrospective notes
- [ ] **Format:**
  - 15 min: Demo (show database schema, tests passing)
  - 30 min: What went well?
  - 15 min: What could improve?
  - 15 min: Next week preview

- [ ] **Owner:** PM + Backend Lead
- [ ] **Attendees:** Full team
- [ ] **Duration:** 1.5 hours

#### Afternoon (2 hours)

**Task 1.1.10: Week 1 Completion Checklist & Planning for Week 2**
- [ ] **Objective:** Verify all Week 1 deliverables, plan Week 2 capacity
- [ ] **Subtasks:**

  1. **1.1.10.1 Completion Verification (1 hour)**
     - [ ] All schema tasks complete
     - [ ] All tests passing (>80% coverage)
     - [ ] All documentation complete
     - [ ] No blockers for Week 2
     - [ ] Database running & seeded
     - [ ] TypeScript types generated

  2. **1.1.10.2 Week 2 Planning (1 hour)**
     - [ ] Review Week 2 Epic 1.2 tasks (Ticket CRUD)
     - [ ] Estimate story points for API endpoints
     - [ ] Identify dependencies
     - [ ] Assign initial tasks
     - [ ] Update Jira board
     - [ ] **Owner:** PM + Backend Lead

- [ ] **Owner:** PM
- [ ] **Duration:** 2 hours

---

## Week 1 Summary

### Completed Deliverables
- ✅ Database schema finalized (schema.md)
- ✅ Prisma ORM configured
- ✅ Initial migrations created & tested
- ✅ Database seeding script working
- ✅ Performance baselines documented
- ✅ Unit tests (>80% coverage)
- ✅ Complete documentation package
- ✅ Team alignment & sign-off

### Success Metrics
- ✅ Database responsive (<200ms for queries)
- ✅ Schema normalized & optimized
- ✅ Zero critical blockers for Week 2
- ✅ Team confident in database design
- ✅ Tests passing CI/CD pipeline

### Effort Summary
- **Backend Lead:** 20 hours
- **Backend Dev #1:** 16 hours
- **QA Engineer:** 2 hours (test setup)
- **DevOps:** 2 hours (CI/CD)
- **Total:** ~40 hours (matches 3-day estimate + margin)

### Next Step
→ **Move to Week 2: Ticket CRUD Operations** (Task 1.2.1)

---

## Appendix: Key Files Created

```
project-root/
├── schema.md                          # Entity definitions
├── prisma/
│   ├── schema.prisma                 # Prisma model definitions
│   ├── seed.ts                       # Seeding script
│   └── migrations/
│       └── [timestamp]_init/         # Initial migration
├── src/
│   ├── __tests__/
│   │   └── database.unit.test.ts    # Database tests
│   └── lib/
│       └── prisma.ts                 # Prisma client singleton
├── docs/
│   ├── DATABASE.md                   # Entity documentation
│   ├── MIGRATIONS.md                 # Migration procedures
│   └── SEEDING.md                    # Seeding documentation
└── PERFORMANCE_BASELINE.md           # Baseline metrics
```

