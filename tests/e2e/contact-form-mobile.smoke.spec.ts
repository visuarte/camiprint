import { expect, test } from '@playwright/test';
import { HomePage } from './pages/home-page';

test.describe('Smoke multi-device: formulario de contacto', () => {
  test('no hay overflow horizontal en la home', async ({ page }) => {
    await page.goto('/');

    // Se listan los culpables para que el log del CI diga QUÉ elemento
    // desborda, no solo que desborda.
    const info = await page.evaluate(() => {
      const doc = document.documentElement;
      const vw = doc.clientWidth;
      const culpables: Array<Record<string, unknown>> = [];
      document.querySelectorAll('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > vw + 1) {
          culpables.push({
            tag: el.tagName.toLowerCase(),
            clase: String((el as HTMLElement).className || '').slice(0, 60),
            ancho: Math.round(r.width),
            izquierda: Math.round(r.left),
            texto: (el.textContent || '').trim().slice(0, 40),
          });
        }
      });
      return {
        viewport: vw,
        scrollWidth: doc.scrollWidth,
        overflow: doc.scrollWidth - doc.clientWidth,
        culpables: culpables.slice(0, 6),
      };
    });

    expect(
      info.overflow <= 1,
      `Overflow de ${info.overflow}px (viewport ${info.viewport}, scrollWidth ${info.scrollWidth}). ` +
        `Elementos más anchos que la pantalla: ${JSON.stringify(info.culpables)}`
    ).toBe(true);
  });

  test('es visible y clicable', async ({ page }) => {

    const home = new HomePage(page);
    // 21 oct 2026: el formulario de contacto ya NO está en la home (el rediseño
    // dejó la portada con CTAs a /catalog y /designer). Se comprueba en la
    // plantilla, que es donde vive ContactSection. Pendiente de decisión de
    // producto: si el formulario vuelve a la home, apuntar otra vez a '/'.
    await page.goto('/template-nuevo');
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
