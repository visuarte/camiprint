import { beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/v1/quotes/route';
import { __resetQuoteRateLimitForTests } from '@/server/http/rate-limit';
import { __resetMetricsForTests } from '@/server/observability/metrics';
import { __resetQuotesStorageForTests } from '@/server/quotes/repository';
import { __resetQuotesCircuitBreakerForTests } from '@/server/quotes/service';

const validPayload = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: 'Camiart SL',
  quantity: '50-99',
  message: 'Necesitamos camisetas para evento corporativo',
};

describe('POST /api/v1/quotes', () => {
  beforeEach(async () => {
    __resetQuoteRateLimitForTests();
    __resetMetricsForTests();
    __resetQuotesCircuitBreakerForTests();
    await __resetQuotesStorageForTests();
  });

  it('responde 201 con contrato de exito cuando el payload es valido', async () => {
    const request = new Request('http://localhost/api/v1/quotes', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'req_test_ok',
      },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      ok: boolean;
      data: { id: string; status: string; createdAt: string };
      meta: { requestId: string };
    };

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.id).toMatch(/^q_/);
    expect(body.data.status).toBe('received');
    expect(body.data.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(body.meta.requestId).toBe('req_test_ok');
  });

  it('responde 422 con details por campo cuando hay validacion fallida', async () => {
    const request = new Request('http://localhost/api/v1/quotes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...validPayload,
        email: 'correo_invalido',
        quantity: '999',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      ok: boolean;
      error: {
        code: string;
        message: string;
        details: Array<{ field: string; issue: string }>;
      };
      meta: { requestId: string };
    };

    expect(response.status).toBe(422);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details.some((d) => d.field === 'email')).toBe(true);
    expect(body.error.details.some((d) => d.field === 'quantity')).toBe(true);
    expect(body.meta.requestId).toMatch(/^req_/);
  });

  it('responde 415 cuando el Content-Type no es application/json', async () => {
    const request = new Request('http://localhost/api/v1/quotes', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      ok: boolean;
      error: { code: string; message: string };
      meta: { requestId: string };
    };

    expect(response.status).toBe(415);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('responde 429 cuando se supera el rate limit por IP', async () => {
    const buildRequest = () =>
      new Request('http://localhost/api/v1/quotes', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.10',
        },
        body: JSON.stringify(validPayload),
      });

    for (let i = 0; i < 5; i += 1) {
      const response = await POST(buildRequest());
      expect(response.status).toBe(201);
    }

    const limitedResponse = await POST(buildRequest());
    const body = (await limitedResponse.json()) as {
      ok: boolean;
      error: { code: string; message: string };
      meta: { requestId: string };
    };

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers.get('retry-after')).toBeTruthy();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('RATE_LIMITED');
  });
});
