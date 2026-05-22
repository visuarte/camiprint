import { expect, type Page, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { HomePage } from './pages/home-page';
import {
  mockQuoteRateLimit429,
  mockQuoteSuccess,
  mockQuoteValidationError422,
} from './support/quote-api-mocks';

const evidenceRoot = join(process.cwd(), 'qa-evidence', '18.3');
const mobileProjects = new Set(['mobile-safari-ios', 'mobile-chrome-android']);

const validPayload = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: 'Camiart SL',
  quantity: '50-99',
  message: 'Necesitamos camisetas para un evento corporativo.',
};

const screenshot = async (page: Page, projectName: string, fileName: string) => {
  const directory = join(evidenceRoot, projectName);
  mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: join(directory, fileName), fullPage: true });
};

test.describe('Task 18.3 QA manual multibrowser evidence', () => {
  test('C1 smoke home render', async ({ page }, testInfo) => {
    const home = new HomePage(page);

    await home.goto();
    await home.expectLoaded();
    await expect(page.getByRole('heading', { name: /ofertas por cantidad/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /tu pedido en 4 pasos/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /preguntas frecuentes/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /hablemos de tu pedido/i })).toBeVisible();

    await screenshot(page, testInfo.project.name, 'C1-home-render.png');
  });

  test('C2 flujo cotizacion feliz', async ({ page }, testInfo) => {
    const home = new HomePage(page);

    await mockQuoteSuccess(page);
    await home.goto();
    await home.openContactSection();
    await home.fillQuoteForm(validPayload);
    await home.submitQuoteForm();

    await expect(page.getByText('Solicitud enviada. Te contactaremos en breve.')).toBeVisible();
    await screenshot(page, testInfo.project.name, 'C2-cotizacion-feliz.png');
  });

  test('C3 error 422 visible en UI', async ({ page }, testInfo) => {
    const home = new HomePage(page);

    await mockQuoteValidationError422(page);
    await home.goto();
    await home.openContactSection();
    await home.fillQuoteForm(validPayload);
    await home.submitQuoteForm();

    await expect(page.getByText('Email invalido')).toBeVisible();
    await expect(page.getByText('Telefono invalido')).toBeVisible();
    await expect(page.getByText('Payload invalido')).toBeVisible();
    await screenshot(page, testInfo.project.name, 'C3-error-422-visible.png');
  });

  test('C4 error 429 visible en UI', async ({ page }, testInfo) => {
    const home = new HomePage(page);

    await mockQuoteRateLimit429(page);
    await home.goto();
    await home.openContactSection();
    await home.fillQuoteForm(validPayload);
    await home.submitQuoteForm();

    await expect(page.getByText(/Hay alta demanda en este momento/i)).toBeVisible();
    await screenshot(page, testInfo.project.name, 'C4-error-429-visible.png');
  });

  test('C5 menu movil abre y cierra', async ({ page }, testInfo) => {
    test.skip(!mobileProjects.has(testInfo.project.name), 'Caso C5 aplica solo a perfiles moviles.');

    const home = new HomePage(page);
    await home.goto();

    await screenshot(page, testInfo.project.name, 'C5-menu-cerrado.png');
    await home.mobileMenuButton().click();
    await expect(page.locator('#mobile-main-menu')).toBeVisible();
    await expect(home.mobileLink(/inicio/i)).toBeVisible();
    await expect(home.mobileLink(/ofertas/i)).toBeVisible();
    await screenshot(page, testInfo.project.name, 'C5-menu-abierto.png');

    await home.mobileLink(/contacto/i).click();
    await expect(page.locator('#mobile-main-menu')).toBeHidden();
  });

  test('C6 health y metrics locales', async ({ page }, testInfo) => {
    const healthResponse = await page.goto('/api/v1/health');
    expect(healthResponse?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('"ok":true');
    await screenshot(page, testInfo.project.name, 'C6-health.png');

    const metricsResponse = await page.goto('/api/v1/metrics');
    expect(metricsResponse?.status()).toBe(200);
    expect(metricsResponse?.headers()['content-type']).toContain('text/plain');
    await expect(page.locator('body')).toContainText('quotes_requests_total');
    await screenshot(page, testInfo.project.name, 'C6-metrics.png');
  });
});
