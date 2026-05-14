import { expect, test } from '@playwright/test';
import { HomePage } from './pages/home-page';
import {
  mockQuoteRateLimit429,
  mockQuoteSuccess,
  mockQuoteValidationError422,
} from './support/quote-api-mocks';

const validPayload = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: 'Camiprint SL',
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
