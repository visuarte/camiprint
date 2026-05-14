import type { Page } from '@playwright/test';

const QUOTES_ENDPOINT_PATTERN = '**/api/v1/quotes';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'x-request-id': 'req_e2e_mock',
};

export const mockQuoteSuccess = async (page: Page): Promise<void> => {
  await page.route(QUOTES_ENDPOINT_PATTERN, async (route) => {
    await route.fulfill({
      status: 201,
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: true,
        data: {
          id: 'q_e2e_happy_path',
          status: 'received',
          createdAt: new Date().toISOString(),
        },
        meta: { requestId: 'req_e2e_success' },
      }),
    });
  });
};

export const mockQuoteValidationError422 = async (page: Page): Promise<void> => {
  await page.route(QUOTES_ENDPOINT_PATTERN, async (route) => {
    await route.fulfill({
      status: 422,
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payload invalido',
          details: [
            { field: 'email', issue: 'Email invalido' },
            { field: 'phone', issue: 'Telefono invalido' },
          ],
        },
        meta: { requestId: 'req_e2e_422' },
      }),
    });
  });
};

export const mockQuoteRateLimit429 = async (page: Page): Promise<void> => {
  await page.route(QUOTES_ENDPOINT_PATTERN, async (route) => {
    await route.fulfill({
      status: 429,
      headers: {
        ...jsonHeaders,
        'retry-after': '60',
      },
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Hay alta demanda en este momento. Intentalo nuevamente en unos minutos.',
        },
        meta: { requestId: 'req_e2e_429' },
      }),
    });
  });
};
