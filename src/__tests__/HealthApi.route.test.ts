import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/v1/health/route';

describe('GET /api/v1/health', () => {
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
});
