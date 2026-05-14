import { test } from '@playwright/test';
import { HomePage } from './pages/home-page';

test('Smoke: home renderiza correctamente', async ({ page }) => {
  const home = new HomePage(page);

  await home.goto();
  await home.expectLoaded();
  await home.openContactSection();
});
