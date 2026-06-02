import { describe, expect, it, vi } from 'vitest';

const getQuoteStatusById = vi.fn();

vi.mock('@/server/quotes/status.service', () => ({
  getQuoteStatusById,
}));

import { GET } from '@/app/api/v1/quotes/[id]/status/route';

describe('GET /api/v1/quotes/:id/status', () => {
  it('responde 200 cuando encuentra la quote', async () => {
    getQuoteStatusById.mockResolvedValueOnce({
      quoteId: 'q_123',
      status: 'received',
      eta: '2026-06-02T15:00:00.000Z',
      lastUpdateAt: '2026-06-02T14:00:00.000Z',
      lastCommunicationAt: '2026-06-02T14:01:00.000Z',
      lastCommunicationStatus: 'sent',
    });

    const request = new Request('http://localhost/api/v1/quotes/q_123/status', {
      method: 'GET',
      headers: { 'x-request-id': 'req_status_ok' },
    });

    const response = await GET(request, { params: Promise.resolve({ id: 'q_123' }) });
    const body = (await response.json()) as {
      ok: boolean;
      data: { quoteId: string; status: string };
      meta: { requestId: string };
    };

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.quoteId).toBe('q_123');
    expect(body.meta.requestId).toBe('req_status_ok');
  });

  it('responde 404 cuando no encuentra la quote', async () => {
    getQuoteStatusById.mockResolvedValueOnce(null);

    const request = new Request('http://localhost/api/v1/quotes/q_missing/status', {
      method: 'GET',
      headers: { 'x-request-id': 'req_status_missing' },
    });

    const response = await GET(request, { params: Promise.resolve({ id: 'q_missing' }) });
    const body = (await response.json()) as {
      ok: boolean;
      error: { code: string };
      meta: { requestId: string };
    };

    expect(response.status).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.meta.requestId).toBe('req_status_missing');
  });
});
