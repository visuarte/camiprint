import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/v1/health/route';
import {
  __resetQuoteRepositoryFactoryForTests,
  __setQuoteRepositoryFactoryForTests,
} from '@/server/quotes/repository.factory';
describe('GET /api/v1/health', () => {
  beforeEach(() => {
    __resetQuoteRepositoryFactoryForTests();
  });

  it('responde 200 con estado ok y requestId', async () => {
    const request = new Request('http://localhost/api/v1/health', {
      method: 'GET',
      headers: { 'x-request-id': 'req_health_ok' },
    });

    const response = await GET(request);
    const body = (await response.json()) as {
      ok: boolean;
      data: {
        status: 'ok' | 'degraded';
        timestamp: string;
        checks: Array<{ name: string; status: string; durationMs: number }>;
      };
      meta: { requestId: string };
    };

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(body.data.checks[0].name).toBe('quotes-persistence');
    expect(body.meta.requestId).toBe('req_health_ok');
  });

  it('responde down cuando el repositorio reporta fallo', async () => {
    const isHealthy = vi.fn().mockResolvedValue(false);
    __setQuoteRepositoryFactoryForTests(() => ({
      create: vi.fn(),
      list: vi.fn(),
      isHealthy,
    }));

    const response = await GET(
      new Request('http://localhost/api/v1/health', {
        method: 'GET',
        headers: { 'x-request-id': 'req_health_down2' },
      })
    );

    const body = (await response.json()) as {
      ok: boolean;
      status: 'down';
      checks: Array<{ name: string; status: string; durationMs: number }>;
      meta: { requestId: string };
    };

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.status).toBe('down');
    expect(body.checks[0].status).toBe('down');
    expect(body.meta.requestId).toBe('req_health_down2');
    expect(isHealthy).toHaveBeenCalledTimes(1);
  });

  it('responde down si falla el wiring del repositorio', async () => {
    __setQuoteRepositoryFactoryForTests(() => {
      throw new Error('config missing');
    });

    const response = await GET(
      new Request('http://localhost/api/v1/health', {
        method: 'GET',
        headers: { 'x-request-id': 'req_health_down' },
      })
    );

    const body = (await response.json()) as {
      ok: boolean;
      status: 'down';
      checks: Array<{ name: string; status: string; durationMs: number }>;
      meta: { requestId: string };
    };

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.status).toBe('down');
    expect(body.checks[0].status).toBe('down');
    expect(body.meta.requestId).toBe('req_health_down');
  });

  it('responde 503 degraded cuando el check supera 2s', async () => {
    const isHealthy = vi.fn().mockResolvedValue(true);
    __setQuoteRepositoryFactoryForTests(() => ({
      create: vi.fn(),
      list: vi.fn(),
      isHealthy,
    }));

    // Simula que Date.now avanza 2001 ms entre inicio y fin del runCheck
    const dateSpy = vi.spyOn(Date, 'now')
      .mockImplementationOnce(() => 1_000)   // start del runCheck
      .mockImplementationOnce(() => 3_001);  // fin del runCheck → durationMs = 2001

    try {
      const response = await GET(
        new Request('http://localhost/api/v1/health', {
          method: 'GET',
          headers: { 'x-request-id': 'req_health_degraded' },
        })
      );

      const body = (await response.json()) as {
        ok: boolean;
        status: string;
        checks: Array<{ name: string; status: string; durationMs: number }>;
        meta: { requestId: string };
      };

      expect(response.status).toBe(503);
      expect(body.ok).toBe(false);
      expect(body.status).toBe('degraded');
      expect(body.checks[0].status).toBe('degraded');
      expect(body.checks[0].durationMs).toBeGreaterThan(2_000);
      expect(body.meta.requestId).toBe('req_health_degraded');
    } finally {
      dateSpy.mockRestore();
    }
  });
});
