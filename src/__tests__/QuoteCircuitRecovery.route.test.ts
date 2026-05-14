import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetQuotesServiceFactoryForTests,
  __setQuotesServiceFactoryForTests,
  POST,
} from '@/app/api/v1/quotes/route';
import { __resetQuoteRateLimitForTests } from '@/server/http/rate-limit';
import { __resetMetricsForTests } from '@/server/observability/metrics';
import { __resetQuotesCircuitBreakerForTests, QuotesService } from '@/server/quotes/service';

const validPayload = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: 'Camiprint SL',
  quantity: '50-99',
  message: 'Necesitamos camisetas para evento corporativo',
} as const;

const buildRequest = () =>
  new Request('http://localhost/api/v1/quotes', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.55',
    },
    body: JSON.stringify(validPayload),
  });

describe('POST /api/v1/quotes circuit breaker recovery', () => {
  beforeEach(() => {
    __resetQuoteRateLimitForTests();
    __resetMetricsForTests();
    __resetQuotesCircuitBreakerForTests();
    __resetQuotesServiceFactoryForTests();
  });

  it('reabre y se recupera con half-open usando reloj controlado a nivel endpoint', async () => {
    let nowMs = 1_000;
    const repository = {
      create: vi
        .fn()
        .mockRejectedValueOnce(new Error('disk down'))
        .mockResolvedValueOnce({
          id: 'q_recovered',
          source: 'landing-contact-form',
          status: 'received',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...validPayload,
        }),
    };

    __setQuotesServiceFactoryForTests(
      () =>
        new QuotesService(repository as never, {
          failureThreshold: 1,
          openWindowMs: 100,
          timeoutMs: 50,
          now: () => nowMs,
        })
    );

    const first = await POST(buildRequest());
    expect(first.status).toBe(503);
    expect(repository.create).toHaveBeenCalledTimes(1);

    const second = await POST(buildRequest());
    expect(second.status).toBe(503);
    expect(repository.create).toHaveBeenCalledTimes(1);

    nowMs = 1_200;
    const third = await POST(buildRequest());
    const body = (await third.json()) as {
      ok: boolean;
      data: { id: string };
      meta: { requestId: string };
    };

    expect(third.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.id).toBe('q_recovered');
    expect(repository.create).toHaveBeenCalledTimes(2);
  });
});
