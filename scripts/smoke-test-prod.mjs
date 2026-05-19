#!/usr/bin/env node

/**
 * Camiprint Production Smoke Tests
 * 
 * Verifies critical endpoints and functionality in production
 * Usage: PROD_URL=https://camiprint.vercel.app ADMIN_TOKEN=xxx node scripts/smoke-test-prod.mjs
 */

const BASE_URL = process.env.PROD_URL || process.env.BASE_URL || 'https://camiprint.vercel.app';
const ADMIN_TOKEN = process.env.ADMIN_AUTH_TOKEN || process.env.ADMIN_TOKEN || '';

const tests = [
  {
    name: '🏠 Homepage',
    method: 'GET',
    path: '/',
    expectedStatus: [200],
    checkContent: 'Camiprint',
  },
  {
    name: '📦 Catalog Page',
    method: 'GET',
    path: '/catalog',
    expectedStatus: [200],
  },
  {
    name: '🛒 Checkout Page',
    method: 'GET',
    path: '/checkout',
    expectedStatus: [200, 307], // 307 = redirect if not authed
  },
  {
    name: '👤 Admin Dashboard',
    method: 'GET',
    path: '/admin',
    expectedStatus: [200, 307], // 307 = redirect if not authed
  },
  {
    name: '📊 Products API',
    method: 'GET',
    path: '/api/products',
    expectedStatus: [200],
    checkType: 'json',
    checkArray: true,
    minItems: 1,
  },
  {
    name: '💚 Health Check',
    method: 'GET',
    path: '/api/v1/health',
    expectedStatus: [200, 404], // 404 if endpoint doesn't exist
  },
  {
    name: '📋 Orders API (No Auth)',
    method: 'GET',
    path: '/api/admin/orders',
    expectedStatus: [401],
  },
  {
    name: '📋 Orders API (With Auth)',
    method: 'GET',
    path: '/api/admin/orders',
    headers: ADMIN_TOKEN ? { 'Authorization': `Bearer ${ADMIN_TOKEN}` } : {},
    expectedStatus: [200, 401],
  },
  {
    name: '🔐 Webhook Signature Validation',
    method: 'POST',
    path: '/api/webhook/stripe',
    headers: {
      'stripe-signature': 'invalid-signature',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ type: 'payment_intent.succeeded' }),
    expectedStatus: [400],
  },
  {
    name: '✉️ Metrics API',
    method: 'GET',
    path: '/api/admin/metrics',
    headers: ADMIN_TOKEN ? { 'Authorization': `Bearer ${ADMIN_TOKEN}` } : {},
    expectedStatus: [200, 401],
  },
];

// ============================================================
// EXECUTION
// ============================================================

async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     🚀 Camiprint Production Smoke Tests                    ║
║        URL: ${BASE_URL.padEnd(45)} ║
╚════════════════════════════════════════════════════════════╝
  `);

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of tests) {
    try {
      const response = await fetch(`${BASE_URL}${test.path}`, {
        method: test.method,
        headers: test.headers || {},
        ...(test.body && { body: test.body }),
      });

      const expected = Array.isArray(test.expectedStatus)
        ? test.expectedStatus
        : [test.expectedStatus];

      const statusOk = expected.includes(response.status);
      let contentOk = true;
      let arrayOk = true;

      // Check content if required
      if (test.checkContent) {
        const text = await response.text();
        contentOk = text.includes(test.checkContent);
      }

      // Check JSON array if required
      if (test.checkArray) {
        try {
          const json = await response.json();
          arrayOk = Array.isArray(json) &&
                   (test.minItems ? json.length >= test.minItems : true);
        } catch {
          arrayOk = false;
        }
      }

      const success = statusOk && contentOk && arrayOk;

      if (success) {
        console.log(`✅ ${test.name.padEnd(35)} - Status: ${response.status}`);
        passed++;
        results.push({ test: test.name, status: 'PASS' });
      } else {
        const reasons = [];
        if (!statusOk) reasons.push(`Expected ${expected.join('|')}, got ${response.status}`);
        if (!contentOk) reasons.push(`Content missing "${test.checkContent}"`);
        if (!arrayOk) reasons.push('Invalid JSON array or insufficient items');

        console.log(`❌ ${test.name.padEnd(35)} - ${reasons.join('; ')}`);
        failed++;
        results.push({ test: test.name, status: 'FAIL', reason: reasons.join('; ') });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${test.name.padEnd(35)} - Error: ${errorMsg}`);
      failed++;
      results.push({ test: test.name, status: 'ERROR', reason: errorMsg });
    }
  }

  // ============================================================
  // SUMMARY
  // ============================================================

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                   📊 TEST RESULTS                          ║
╠════════════════════════════════════════════════════════════╣
║ Total:    ${String(passed + failed).padStart(2, ' ')}                                            ║
║ Passed:   ${String(passed).padStart(2, ' ')} ✅                                          ║
║ Failed:   ${String(failed).padStart(2, ' ')} ❌                                          ║
║ Success:  ${(((passed / (passed + failed)) * 100).toFixed(1) + '%').padStart(5, ' ')}                                         ║
╚════════════════════════════════════════════════════════════╝
  `);

  if (failed > 0) {
    console.log('\n🔍 Failed Tests Details:');
    results
      .filter((r) => r.status !== 'PASS')
      .forEach((r) => {
        console.log(`  • ${r.test}: ${r.reason || r.status}`);
      });
  }

  // Environment check
  if (!ADMIN_TOKEN) {
    console.log('\n⚠️  Warning: ADMIN_TOKEN not set - admin tests may fail');
  }

  // Exit with appropriate code
  const exitCode = failed > 0 ? 1 : 0;
  console.log(`\n${exitCode === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed'}`);
  process.exit(exitCode);
}

// ============================================================
// START TESTS
// ============================================================

runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
