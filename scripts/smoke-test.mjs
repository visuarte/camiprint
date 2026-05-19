#!/usr/bin/env node
/**
 * Smoke tests para validar un entorno desplegado de Camiprint.
 *
 * Uso:
 *   BASE_URL=https://camiprint.vercel.app node scripts/smoke-test.mjs
 *   BASE_URL=https://staging.camiprint.vercel.app METRICS_TOKEN=tk_xxx node scripts/smoke-test.mjs
 *
 * Salida:
 *   - PASS / FAIL por cada prueba
 *   - Exit code 0 si todos pasan, 1 si alguno falla
 */

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, '');
const METRICS_TOKEN = process.env.METRICS_TOKEN ?? '';

if (!BASE_URL) {
  console.error('❌  Falta BASE_URL. Ejemplo: BASE_URL=https://mi-app.vercel.app node scripts/smoke-test.mjs');
  process.exit(1);
}

console.log(`\n🔥  Smoke tests contra: ${BASE_URL}\n`);

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (/** @type {any} */ err) {
    console.error(`  ❌  ${name}`);
    console.error(`       ${err.message ?? String(err)}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const validPayload = {
  name: 'Smoke Test Usuario',
  email: 'smoke@test.camiprint.com',
  phone: '+34 600 000 001',
  companyName: 'Smoke Corp',
  quantity: '50-99',
  message: 'Smoke test automatico',
};

// ─── Health ───────────────────────────────────────────────────────────────────

await check('GET /api/v1/health → 200 con status ok', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/health`, {
    headers: { 'x-request-id': 'smoke_health' },
  });
  assert(res.status === 200, `status esperado 200, recibido ${res.status}`);
  const body = await res.json();
  assert(body.status === 'ok', `status esperado 'ok', recibido '${body.status}'`);
  assert(Array.isArray(body.checks), 'body.checks debe ser un array');
});

await check('GET /api/v1/health tiene X-Request-Id en respuesta', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/health`);
  assert(res.headers.has('x-request-id'), 'Header X-Request-Id ausente');
});

// ─── Metrics ──────────────────────────────────────────────────────────────────

await check('GET /api/v1/metrics → 200 (sin token) o 401 (con token configurado)', async () => {
  const headers = {};
  if (METRICS_TOKEN) headers['authorization'] = `Bearer ${METRICS_TOKEN}`;

  const res = await fetch(`${BASE_URL}/api/v1/metrics`, { headers });
  const validStatuses = [200, 401];
  assert(validStatuses.includes(res.status), `status inesperado ${res.status}`);
});

// ─── Quotes – Happy path ───────────────────────────────────────────────────────

await check('POST /api/v1/quotes payload válido → 201 con estructura correcta', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/quotes`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'smoke_201',
    },
    body: JSON.stringify(validPayload),
  });
  assert(res.status === 201, `status esperado 201, recibido ${res.status}`);
  const body = await res.json();
  assert(body.ok === true, 'body.ok debe ser true');
  assert(typeof body.data?.id === 'string', 'body.data.id debe ser string');
  assert(body.data.id.startsWith('q_'), `ID debe comenzar con q_, recibido: ${body.data.id}`);
  assert(body.data.status === 'received', `status debe ser 'received', recibido: ${body.data.status}`);
  assert(body.meta.requestId === 'smoke_201', 'meta.requestId debe coincidir con el enviado');
});

await check('POST /api/v1/quotes → respuesta contiene headers de seguridad', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/quotes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(validPayload),
  });
  assert(res.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff ausente');
  assert(res.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options: DENY ausente');
  assert(res.headers.has('x-request-id'), 'X-Request-Id ausente en respuesta');
});

// ─── Quotes – Error paths ─────────────────────────────────────────────────────

await check('POST /api/v1/quotes sin Content-Type → 415 UNSUPPORTED_MEDIA_TYPE', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/quotes`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: JSON.stringify(validPayload),
  });
  assert(res.status === 415, `status esperado 415, recibido ${res.status}`);
  const body = await res.json();
  assert(body.error?.code === 'UNSUPPORTED_MEDIA_TYPE', `code esperado UNSUPPORTED_MEDIA_TYPE, recibido ${body.error?.code}`);
});

await check('POST /api/v1/quotes con payload inválido → 422 VALIDATION_ERROR con details', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/quotes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'X' }),
  });
  assert(res.status === 422, `status esperado 422, recibido ${res.status}`);
  const body = await res.json();
  assert(body.error?.code === 'VALIDATION_ERROR', `code esperado VALIDATION_ERROR, recibido ${body.error?.code}`);
  assert(Array.isArray(body.error?.details), 'body.error.details debe ser array');
  assert(body.error.details.length > 0, 'details debe tener al menos un error');
});

await check('POST /api/v1/quotes con JSON malformado → 422 VALIDATION_ERROR', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/quotes`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'smoke_invalid_json',
    },
    body: '{campo: sin_comillas}',
  });
  assert(res.status === 422, `status esperado 422, recibido ${res.status}`);
  const body = await res.json();
  assert(body.error?.code === 'VALIDATION_ERROR', `code esperado VALIDATION_ERROR, recibido ${body.error?.code}`);
  assert(body.meta.requestId === 'smoke_invalid_json', 'requestId debe propagarse en errores');
});

// ─── CORS preflight ───────────────────────────────────────────────────────────

await check('OPTIONS /api/v1/quotes → 204 (CORS preflight)', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/quotes`, {
    method: 'OPTIONS',
    headers: {
      origin: BASE_URL,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'Content-Type',
    },
  });
  assert(res.status === 204, `status esperado 204, recibido ${res.status}`);
});

// ─── Rate limiting ────────────────────────────────────────────────────────────

await check('Rate limiting: 6 requests rápidos → alguno recibe 429', async () => {
  const requests = Array.from({ length: 6 }, (_, i) =>
    fetch(`${BASE_URL}/api/v1/quotes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': `smoke_rl_${i}`,
      },
      body: JSON.stringify({ ...validPayload, email: `rl${i}@smoke.test` }),
    })
  );

  const responses = await Promise.all(requests);
  const statuses = responses.map((r) => r.status);
  const has429 = statuses.includes(429);
  assert(has429, `Se esperaba al menos un 429, statuses recibidos: ${statuses.join(', ')}`);

  const rateLimitedResponse = responses.find((r) => r.status === 429);
  if (rateLimitedResponse) {
    const body = await rateLimitedResponse.json();
    assert(body.error?.code === 'RATE_LIMITED', `code esperado RATE_LIMITED, recibido ${body.error?.code}`);
    assert(rateLimitedResponse.headers.has('retry-after'), 'Header Retry-After ausente en 429');
  }
});

// ─── Resumen ──────────────────────────────────────────────────────────────────

console.log(`\n────────────────────────────────────────`);
console.log(`  Resultado: ${passed} pasaron, ${failed} fallaron`);
console.log(`────────────────────────────────────────\n`);

process.exit(failed > 0 ? 1 : 0);
