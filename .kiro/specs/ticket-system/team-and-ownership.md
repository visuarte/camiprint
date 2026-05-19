# Ticket System - Team & Ownership

**Version:** 1.0  
**Last Updated:** 19 May 2026

---

## Team Structure

### Core Team (Estimated: 5-7 people)

#### Product & Project Management
- **Product Owner**: [TBD]
  - Responsibilities: Requirements clarification, roadmap, stakeholder communication
  - Time: 100% (throughout project)
  - Start: Phase 1

- **Project Manager/Scrum Master**: [TBD]
  - Responsibilities: Sprint planning, tracking, team coordination, blockers resolution
  - Time: 100% (throughout project)
  - Start: Phase 1

#### Backend Development (2-3 developers)
- **Backend Lead**: [TBD]
  - Responsibilities: Architecture oversight, API design, database schema, critical features
  - Epics: 1.1, 1.2, 1.3, 3.1, 4.1 (primary)
  - Time: 100%
  - Start: Phase 1

- **Backend Developer #1**: [TBD]
  - Responsibilities: API implementation, business logic, integrations
  - Epics: 2.2, 3.2, 3.3, 4.2, 7.3 (primary)
  - Time: 100%
  - Start: Phase 1

- **Backend Developer #2** (optional for acceleration): [TBD]
  - Responsibilities: Testing automation, supporting features
  - Epics: 9.1, 9.2, supporting roles
  - Time: 100%
  - Start: Phase 6 (or Phase 1 if acceleration needed)

#### Frontend Development (1-2 developers)
- **Frontend Lead**: [TBD]
  - Responsibilities: UI architecture, component library, design system integration
  - Epics: Client UI components, dashboard, responsive design
  - Time: 100%
  - Start: Phase 2

- **Frontend Developer #1** (optional): [TBD]
  - Responsibilities: Feature implementation, optimization
  - Epics: Supporting frontend features
  - Time: 100%
  - Start: Phase 2 (or Phase 1 if acceleration needed)

#### QA & Testing
- **QA Engineer**: [TBD]
  - Responsibilities: Test planning, manual testing, QA automation
  - Epics: 9.2, 9.1 (testing only)
  - Time: 100% (starting Phase 6, 50% from Phase 1)
  - Start: Phase 1 (50%), Phase 6 (100%)

#### DevOps & Infrastructure
- **DevOps/SRE Engineer** (shared): [TBD]
  - Responsibilities: Deployment, monitoring, infrastructure, CI/CD
  - Epics: 8.3, 10.1, 10.2
  - Time: 30-50% (increasing in Phase 8+)
  - Start: Phase 3 (30%), Phase 8 (100%)

---

## Epic Ownership & Assignments

### Phase 1: Core Ticket Management (Weeks 1-3)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 1.1 Database Schema & ORM | Backend Lead | Backend Dev #1 | 40 | Low |
| 1.2 Ticket CRUD Operations | Backend Lead, Backend Dev #1 | QA | 60 | Medium |
| 1.3 API Foundation | Backend Lead | Backend Dev #1 | 50 | Low |

**Total Phase 1: 150 hours** (distributed across team)

### Phase 2: Messaging & Communication (Weeks 4-5)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 2.1 Bidirectional Messaging | Backend Dev #1 | Backend Lead | 50 | Low |
| 2.2 Email Notifications | Backend Dev #1 | Backend Lead | 45 | Medium |
| 2.3 In-App Notifications | Frontend Lead + Backend Dev #1 | Backend Lead | 60 | Medium |

**Total Phase 2: 155 hours**

### Phase 3: Support Operations (Weeks 6-7)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 3.1 Ticket Assignment & Routing | Backend Dev #1 | Backend Lead | 55 | Medium |
| 3.2 Status & Priority Management | Backend Lead | Backend Dev #1 | 50 | Low |
| 3.3 Advanced Search & Filtering | Backend Lead, Backend Dev #1 | QA | 65 | High |

**Total Phase 3: 170 hours**

### Phase 4: SLA & Escalation (Weeks 8-9)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 4.1 SLA Configuration & Tracking | Backend Lead | Backend Dev #1, DevOps | 70 | High |
| 4.2 Escalation Logic | Backend Dev #1 | Backend Lead | 55 | Medium |

**Total Phase 4: 125 hours**

### Phase 5: Knowledge Base (Weeks 10-11)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 5.1 Knowledge Base Articles | Backend Dev #1 + Frontend Lead | QA | 55 | Low |
| 5.2 Article Search & Suggestions | Backend Lead, Frontend Lead | Backend Dev #1 | 60 | Medium |

**Total Phase 5: 115 hours**

### Phase 6: Admin & Reporting (Weeks 12-13)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 6.1 Admin Configuration | Frontend Lead | Backend Dev #1 | 50 | Low |
| 6.2 Performance Reports | Backend Lead + Frontend Lead | QA | 75 | Medium |

**Total Phase 6: 125 hours** + QA (100% commitment starts)

### Phase 7: Advanced Features (Weeks 14-15)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 7.1 Customer Satisfaction | Frontend Lead | Backend Dev #1 | 40 | Low |
| 7.2 Response Templates | Backend Dev #1 + Frontend Lead | Backend Lead | 50 | Low |
| 7.3 Multi-Channel Support | Backend Lead | Backend Dev #1, DevOps | 60 | High |

**Total Phase 7: 150 hours**

### Phase 8: Integrations & Deployment (Weeks 16-17)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 8.1 Customer Portal Integration | Frontend Lead | Backend Lead | 50 | Medium |
| 8.2 API & External Integrations | Backend Lead | Backend Dev #1 | 65 | Medium |
| 8.3 Deployment & Monitoring | DevOps Engineer | Backend Lead, Backend Dev #1 | 80 | Medium |

**Total Phase 8: 195 hours** (DevOps 100% commitment)

### Phase 9: Testing & QA (Weeks 18-20)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 9.1 Automated Testing | QA Engineer | Backend Lead, Frontend Lead | 120 | Low |
| 9.2 Manual QA & UAT | QA Engineer | All | 100 | Low |

**Total Phase 9: 220 hours** (QA 100%)

### Phase 10: Production Rollout (Weeks 21-22)

| Epic | Owner | Support | Estimated Hours | Risk |
|------|-------|---------|-----------------|------|
| 10.1 Pre-Production Preparation | DevOps Engineer, Backend Lead | All | 60 | Medium |
| 10.2 Staged Rollout & Launch | DevOps Engineer, PM | All | 80 | High |

**Total Phase 10: 140 hours**

---

## Team Capacity Analysis

### Baseline Assumptions (5-person core team, non-negotiable)

**Setup:**
- Backend Lead: 100% (Weeks 1-22)
- Backend Dev #1: 100% (Weeks 1-22)
- Frontend Lead: 0% (Weeks 1), 50% (Weeks 2-5), 100% (Weeks 6-22)
- QA Engineer: 50% (Weeks 1-5), 100% (Weeks 6-22)
- DevOps Engineer: 30% (Weeks 1-7), 50% (Weeks 8-20), 100% (Weeks 21-22)

**Workload per week (in hours):**
- Week 1-5: 36 hours/week (3 backend, 2.5 QA)
- Week 6-7: 42 hours/week (3 backend, 2 frontend, 2.5 QA, 0.5 DevOps)
- Week 8-9: 45 hours/week (3 backend, 2 frontend, 2.5 QA, 1 DevOps)
- Week 10-17: 45 hours/week (3 backend, 2 frontend, 2.5 QA, 1.5 DevOps)
- Week 18-22: 42 hours/week (3 backend, 1.5 frontend, 2.5 QA, 2 DevOps)

**Total effort: ~1,850 hours across 22 weeks**

### Acceleration Path (7-person team - optional)

**Additional roles (Weeks 1+):**
- Backend Developer #2: 100% (Weeks 1-22)
- Frontend Developer #1: 100% (Weeks 2-22)

**Impact:**
- Reduces timeline to ~18-20 weeks
- Adds 260 hours/week capacity
- Enables parallel Epic execution

---

## Decision Gates & Approval

### Milestone Reviews (Bi-weekly)

1. **Phase Kickoff Review** (Monday of Week 1, 4, 6, etc.)
   - Approve scope & team assignments
   - Confirm blockers & dependencies
   - PO & PM sign-off

2. **Mid-Phase Check-In** (Wednesday mid-week)
   - Progress tracking
   - Risk assessment
   - Blocker resolution

3. **Phase Completion Review** (Friday of Week 3, 5, etc.)
   - Demo completed work
   - QA sign-off
   - Go/No-go decision for next phase

### Escalation Path

- **Daily Standups**: 10 min (Team)
- **Weekly Retrospectives**: 30 min (Team + PM)
- **Bi-weekly Sprint Planning**: 60 min (Team + PO)
- **Blockers**: Escalate to PM immediately

---

## Team Onboarding Checklist

- [ ] Development environment setup (repo access, Docker, DB)
- [ ] Architecture walkthrough (20 min)
- [ ] Codebase tour (30 min)
- [ ] Deployment process walkthrough (15 min)
- [ ] Testing & QA standards (20 min)
- [ ] Communication channels setup (Slack, JIRA, etc.)
- [ ] First task assignment & estimation review

**Onboarding Time: 2-3 days per team member**

---

## Contingency & Risk Mitigation

### If Backend Dev #1 Unavailable
→ Split workload to Backend Lead + hire contractor

### If Frontend Lead Delayed (starts Week 4 instead of Week 2)
→ Delay Phase 2.3 (In-App Notifications) to Week 5-6
→ Reduce Phase 1 scope (move some tasks to Phase 2)

### If QA Resources Limited
→ Increase manual testing contractor hours in Phase 9
→ Shift E2E tests to Phase 10

### If DevOps Bandwidth Insufficient
→ Hire DevOps contractor for Phase 8-10
→ Use managed deployment services (Vercel) to reduce overhead

---

## Communication Plan

### Daily
- 10 min standup (9:00 AM)
- Async status updates in Slack #ticket-system-builds

### Weekly
- Monday: Sprint planning & kickoff (1 hour)
- Wednesday: Mid-week check-in (30 min)
- Friday: Demo + retrospective (1.5 hours)

### Bi-Weekly
- Stakeholder update (30 min, Tuesday)
- Architecture review (1 hour, as needed)

### Monthly
- Executive summary to leadership

---

## Success Criteria for Team

✅ **Phase 1 Success:**
- Database schema reviewed & approved by Backend Lead
- API structure validated (no breaking changes post-Phase 1)
- >80% test coverage for core services
- Zero critical security vulnerabilities
- Team velocity established (velocity points/week)

✅ **Overall Project Success:**
- All 147 tasks completed on schedule
- >85% code coverage maintained
- 0 critical bugs in production
- Team satisfaction >4.0/5.0
- Stakeholder satisfaction >4.5/5.0

