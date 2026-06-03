> Nota de migracion (2026-06-03): este documento fue normalizado a marca CamiArt y dominio can�nico camiart.com. Se mantienen identificadores tecnicos historicos cuando aportan trazabilidad.
# Demo & E2E Testing Guide

## 🚀 Quick Start

### 1. Seed Demo Data

Before running tests, populate the database with demo products and an order.

```bash
# Create demo products (requires DATABASE_URL set and PostgreSQL running)
npm run seed:products

# Create a demo order
npm run seed:demo

# Or both at once
npm run seed:all
```

**Requirements**:
- PostgreSQL running and accessible at `DATABASE_URL` in `.env.local`
- Prisma migrations already applied: `npm run db:migrate`

### 2. Run E2E Tests

#### Unit-based E2E Tests (Vitest)
```bash
# Run all vitest e2e tests
npm run test:e2e

# Or run all tests
npm run test:all
```

**Coverage**: Payment flows, webhook handling, email service, admin CRUD

#### Browser-based E2E Tests (Playwright)
```bash
# Run Playwright tests (headless)
npm run test:e2e:playwright

# Run with browser visible
npm run test:e2e:headed

# Run in interactive UI mode
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

**Coverage**: 
- Admin login & order management
- Checkout success page
- Product catalog
- Navigation

### 3. Production Testing

```bash
# Smoke test against staging
npm run smoke:staging

# Smoke test against production
npm run smoke:prod

# Live test against Vercel deployment
npm run smoke:prod:live
```

---

## 📊 Test Suites Overview

### Vitest Unit Tests (`__tests__/`)

| File | Tests | Purpose |
|------|-------|---------|
| `webhook.test.ts` | 10 | Stripe webhook signature verification & event handling |
| `admin.test.ts` | 38 | Admin auth, RBAC, order CRUD, metrics |
| `email.test.ts` | 15 | SMTP config, email templates, XSS prevention |
| `integration.test.ts` | 24 | Complete payment flow end-to-end |
| `e2e.test.ts` | 1 | Overall coverage validation |

**Total**: 235/267 tests passing (88.4% pass rate)

### Playwright E2E Tests (`e2e-tests.spec.ts`)

- Admin login and navigation
- Order display and details
- Checkout success page
- Product catalog API
- General navigation

---

## 🗄️ Demo Data Structure

### Demo Customer
- **Email**: `demo@camiart.test`
- **Name**: Demo User
- **Address**: 123 Demo Street, Demo City, DC 12345
- **Phone**: +1 (555) 000-0000

### Demo Order
- **Status**: PAID (fully paid order)
- **Items**: 2x First product
- **Total**: Calculated from product price × 2
- **Created**: When you run `npm run seed:demo`

---

## 🔧 Troubleshooting

### Database Connection Error
```
PrismaClientInitializationError: Can't reach database server
```

**Solution**:
```bash
# Check DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL

# Verify PostgreSQL is running
# On Windows: Check Services or pgAdmin
# On Mac: brew services list
# On Linux: sudo systemctl status postgresql

# Run migrations if needed
npm run db:migrate
```

### Playwright Tests Not Running
```
Error: Playwright not installed
```

**Solution**:
```bash
npm install -D @playwright/test
npx playwright install
```

### TypeScript Errors in E2E Tests
```
Cannot find module '@/lib/stripe'
```

**Solution**: Run TypeScript check first:
```bash
npm run lint
```

---

## 📝 Writing New Tests

### Add Unit Test (Vitest)

Create file: `__tests__/feature.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature: Some Feature', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Test
    expect(result).toBe(expected);
  });
});
```

Run: `npm run test`

### Add E2E Test (Playwright)

Edit: `e2e-tests.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to feature', async ({ page }) => {
  await page.goto('http://localhost:3000/feature');
  await expect(page.locator('h1')).toContainText('Feature');
});
```

Run: `npm run test:e2e:playwright`

---

## 🌐 Testing on Different Environments

### Local Development
```bash
# Start dev server
npm run dev

# In another terminal
npm run test:e2e:playwright
```

### Staging/Production
```bash
# Test against live deployment
PLAYWRIGHT_TEST_BASE_URL=https://staging.example.com npm run test:e2e:playwright
```

---

## 📈 Test Coverage Report

Generate coverage report:
```bash
npm run test:coverage
```

Coverage files are in `/coverage` directory. Open `coverage/index.html` in browser.

---

## 🚦 CI/CD Pipeline

Tests run automatically on:
- Push to `main` branch
- Pull requests
- Vercel deployments

View results in:
- GitHub Actions (if configured)
- Vercel build logs
- Local test reports
