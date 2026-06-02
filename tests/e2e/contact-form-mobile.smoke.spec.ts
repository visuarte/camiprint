import { expect, test } from '@playwright/test';
import { HomePage } from './pages/home-page';

test.describe('Smoke multi-device: formulario de contacto', () => {
  test('no hay overflow horizontal en la home', async ({ page }) => {
    await page.goto('/');

    const hasHorizontalOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth > 1;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test('es visible y clicable', async ({ page }) => {

    const home = new HomePage(page);
    await home.goto();
    await home.openContactSection();

    const contactSection = page.locator('#contacto');
    await expect(contactSection).toBeVisible();

    const form = contactSection.locator('form').first();
    await expect(form).toBeVisible();

    const formBox = await form.boundingBox();
    expect(formBox).toBeTruthy();
    expect((formBox?.width ?? 0) > 260).toBeTruthy();
    expect((formBox?.height ?? 0) > 220).toBeTruthy();

    const submitButton = page.getByRole('button', { name: /solicitar propuesta/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox).toBeTruthy();
    expect((buttonBox?.height ?? 0) >= 40).toBeTruthy();

    // trial=true valida accionabilidad sin mutar estado de la app.
    await submitButton.click({ trial: true });
  });
});
