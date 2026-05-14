import { expect, test } from '@playwright/test';

test('Health local: responde 200 con contrato esperado y request id', async ({ request }) => {
  const response = await request.get('/api/v1/health');

  expect(response.status()).toBe(200);
  expect(response.headers()['x-request-id']).toBeTruthy();

  const body = (await response.json()) as {
    ok: boolean;
    data?: {
      status: string;
      timestamp: string;
      checks: Array<{ name: string; status: string; durationMs: number }>;
    };
    meta?: { requestId?: string };
  };

  expect(body.ok).toBe(true);
  expect(body.meta?.requestId).toBeTruthy();
  expect(body.data?.status).toBe('ok');
  expect(Array.isArray(body.data?.checks)).toBe(true);
  expect(body.data?.checks[0]?.name).toBe('quotes-persistence');
});
