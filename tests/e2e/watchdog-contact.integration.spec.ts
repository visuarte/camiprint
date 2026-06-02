import { expect, test } from '@playwright/test';

test.describe('Watchdog endpoint: contacto', () => {
  test('acepta reporte y devuelve contrato estable', async ({ request }) => {
    const response = await request.post('/api/v1/watchdog/contact-form', {
      data: {
        type: 'contact_form_invisible',
        path: '/',
        width: 0,
        height: 0,
        display: 'none',
        visibility: 'hidden',
        opacity: '0',
        userAgent: 'Playwright iPhone smoke',
      },
    });

    expect(response.status()).toBe(202);
    expect(response.headers()['x-request-id']).toBeTruthy();

    const body = (await response.json()) as {
      ok: boolean;
      data?: { received?: boolean };
      meta?: { requestId?: string };
    };

    expect(body.ok).toBe(true);
    expect(body.data?.received).toBe(true);
    expect(body.meta?.requestId).toBeTruthy();
  });

  test('tolera body vacio', async ({ request }) => {
    const response = await request.post('/api/v1/watchdog/contact-form', {
      data: {},
    });

    expect(response.status()).toBe(202);

    const body = (await response.json()) as {
      ok: boolean;
      data?: { received?: boolean };
    };

    expect(body.ok).toBe(true);
    expect(body.data?.received).toBe(true);
  });
});
