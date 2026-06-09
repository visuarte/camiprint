import { describe, it, expect, vi, beforeEach } from 'vitest';

const logOperationalEvent = vi.hoisted(() => vi.fn());

vi.mock('@/server/observability/logger', () => ({
  logOperationalEvent,
}));

import { POST } from '@/app/api/v1/watchdog/contact-form/route';

describe('POST /api/v1/watchdog/contact-form', () => {
  beforeEach(() => {
    logOperationalEvent.mockReset();
  });

  it('acepta reporte y registra evento sanitizado', async () => {
    const request = new Request('http://localhost/api/v1/watchdog/contact-form', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'req_watchdog_1',
      },
      body: JSON.stringify({
        type: 'contact_form_invisible',
        path: '/#contacto',
        width: 0,
        height: 0,
        display: 'none',
        visibility: 'hidden',
        opacity: '0',
        userAgent: 'Mozilla/5.0 (iPhone)',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      ok: boolean;
      data: { received: boolean };
      meta: { requestId: string };
    };

    expect(response.status).toBe(202);
    expect(body.ok).toBe(true);
    expect(body.data.received).toBe(true);
    expect(body.meta.requestId).toBe('req_watchdog_1');
    expect(logOperationalEvent).toHaveBeenCalledWith(
      'warn',
      'Contact form watchdog reported rendering issue',
      expect.objectContaining({
        type: 'contact_form_invisible',
        path: '/#contacto',
        width: 0,
        height: 0,
      })
    );
  });

  it('tolera body invalido y aplica valores seguros', async () => {
    const request = new Request('http://localhost/api/v1/watchdog/contact-form', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'req_watchdog_2',
      },
      body: '{bad-json',
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      ok: boolean;
      data: { received: boolean };
      meta: { requestId: string };
    };

    expect(response.status).toBe(202);
    expect(body.ok).toBe(true);
    expect(body.meta.requestId).toBe('req_watchdog_2');
    expect(logOperationalEvent).toHaveBeenCalledWith(
      'warn',
      'Contact form watchdog reported rendering issue',
      expect.objectContaining({
        type: 'unknown_issue',
        path: 'unknown_path',
      })
    );
  });
});
