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
      const fuera: Array<Record<string, unknown>> = [];
      const anchos: Array<Record<string, unknown>> = [];
      document.querySelectorAll('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        const datos = {
          tag: el.tagName.toLowerCase(),
          clase: String((el as HTMLElement).className || '').slice(0, 50),
          ancho: Math.round(r.width),
          izq: Math.round(r.left),
          der: Math.round(r.right),
          texto: (el.textContent || '').trim().slice(0, 30),
        };
        // El culpable puede no ser "más ancho" sino estar desplazado a la
        // derecha (negative margins, transforms, position fixed...).
        if (r.right > vw + 1 || r.left < -1) fuera.push(datos);
        anchos.push(datos);
      });
      anchos.sort((a: any, b: any) => b.ancho - a.ancho);
      return {
        viewport: vw,
        scrollWidth: doc.scrollWidth,
        overflow: doc.scrollWidth - doc.clientWidth,
        fuera: fuera.slice(0, 6),
        masAnchos: anchos.slice(0, 5),
      };
    });

    expect(
      info.overflow <= 1,
      `Overflow de ${info.overflow}px (viewport ${info.viewport}, scrollWidth ${info.scrollWidth}). ` +
        `Fuera de pantalla: ${JSON.stringify(info.fuera)} · ` +
        `Más anchos: ${JSON.stringify(info.masAnchos)}`
    ).toBe(true);
  });

  // PENDIENTE DE PRODUCTO (21 oct 2026): el formulario de contacto ya no está
  // alcanzable. Vive en ContactSection, que solo pinta /template-nuevo, y esa
  // ruta redirige 308 a / (next.config.ts). Se deja marcado como fixme —no se
  // finge que pasa— hasta que el formulario vuelva a una página viva.
  test.fixme('es visible y clicable', async ({ page }) => {

    const home = new HomePage(page);
    await page.goto('/');
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
