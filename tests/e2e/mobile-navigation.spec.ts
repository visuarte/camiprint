import { expect, test } from '@playwright/test';
import { HomePage } from './pages/home-page';

const MOBILE_PROJECTS = new Set(['iphone-13', 'pixel-7']);

test('Menu movil: abre y muestra enlaces clave', async ({ page }, testInfo) => {
  test.skip(!MOBILE_PROJECTS.has(testInfo.project.name), 'Caso solo para viewports moviles.');

  const home = new HomePage(page);
  await home.goto();

  await home.mobileMenuButton().click();

  await expect(home.mobileLink(/inicio/i)).toBeVisible();
  await expect(home.mobileLink(/ofertas/i)).toBeVisible();
  await expect(home.mobileLink(/solicitar cotizaci[oó]n/i)).toBeVisible();
});

test('Menu movil: cierra al seleccionar un enlace', async ({ page }, testInfo) => {
  test.skip(!MOBILE_PROJECTS.has(testInfo.project.name), 'Caso solo para viewports moviles.');

  const home = new HomePage(page);
  await home.goto();

  await home.mobileMenuButton().click();
  await expect(page.locator('#mobile-main-menu')).toBeVisible();

  await home.mobileLink(/contacto/i).click();
  await expect(page.locator('#mobile-main-menu')).toBeHidden();
});
