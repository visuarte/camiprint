import { expect, test } from '@playwright/test';
import { HomePage } from './pages/home-page';
import {
  mockQuoteRateLimit429,
  mockQuoteServerError500,
  mockQuoteSuccess,
  mockQuoteValidationError422,
} from './support/quote-api-mocks';

const validPayload = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: 'Camiart SL',
  quantity: '50-99',
  message: 'Necesitamos camisetas para un evento corporativo.',
};

test('Flujo feliz: muestra confirmacion al enviar cotizacion', async ({ page }) => {
  const home = new HomePage(page);

  await mockQuoteSuccess(page);
  await home.goto();
  await home.openContactSection();
  await home.fillQuoteForm(validPayload);
  await home.submitQuoteForm();

  await expect(page.getByText('Solicitud enviada. Te contactaremos en breve.')).toBeVisible();
  await expect(page.getByText('Codigo de seguimiento: req_e2e_success')).toBeVisible();
});

test('Error 422: muestra errores de validacion visibles', async ({ page }) => {
  const home = new HomePage(page);

  await mockQuoteValidationError422(page);
  await home.goto();
  await home.openContactSection();
  await home.fillQuoteForm(validPayload);
  await home.submitQuoteForm();

  await expect(page.getByText('Email invalido')).toBeVisible();
  await expect(page.getByText('Telefono invalido')).toBeVisible();
  await expect(page.getByText('Payload invalido')).toBeVisible();
});

test('Error 429: muestra mensaje de alta demanda', async ({ page }) => {
  const home = new HomePage(page);

  await mockQuoteRateLimit429(page);
  await home.goto();
  await home.openContactSection();
  await home.fillQuoteForm(validPayload);
  await home.submitQuoteForm();

  await expect(
    page.getByText('Hay alta demanda en este momento. Intentalo nuevamente en unos minutos.')
  ).toBeVisible();
});

test('Error 500: muestra fallback y habilita reintento', async ({ page }) => {
  const home = new HomePage(page);

  await mockQuoteServerError500(page);
  await home.goto();
  await home.openContactSection();
  await home.fillQuoteForm(validPayload);
  await home.submitQuoteForm();

  await expect(page.getByText('No pudimos procesar tu solicitud. Intentalo de nuevo.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
});

test('Estado de cotizacion: endpoint status devuelve estado para una quote creada', async ({ request }) => {
  const createResponse = await request.post('/api/v1/quotes', {
    data: validPayload,
  });

  expect(createResponse.status()).toBe(201);
  const createBody = (await createResponse.json()) as {
    data: { id: string; status: string };
  };

  const quoteId = createBody.data.id;
  const statusResponse = await request.get(`/api/v1/quotes/${quoteId}/status`);
  expect(statusResponse.status()).toBe(200);

  const statusBody = (await statusResponse.json()) as {
    ok: boolean;
    data: { quoteId: string; status: string };
  };

  expect(statusBody.ok).toBe(true);
  expect(statusBody.data.quoteId).toBe(quoteId);
  expect(statusBody.data.status).toBe('received');
});
