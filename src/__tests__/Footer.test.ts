import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Tests del Footer — reescritos 21 oct 2026.
 *
 * Los anteriores comprobaban cadenas literales de la plantilla monolítica
 * ('2026', 'Alicante, España', markup con ids...). Con el rediseño el footer
 * pasó a leer de `brandConfig` y el año a ser dinámico, así que esas
 * comprobaciones no podían pasar nunca: describían un diseño que ya no existe.
 *
 * Estos comprueban el CONTRATO, no el texto: que use la fuente única de marca,
 * que no escriba el año a mano, y que estén los enlaces legales obligatorios.
 */
describe('Footer — contrato de contenido', () => {
  const footer = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'Footer.tsx'),
    'utf-8'
  );

  it('toma los datos de marca de brandConfig (fuente única)', () => {
    expect(footer).toContain("import { brandConfig } from '@/config/brand'");
    expect(footer).toContain('brandConfig.displayName');
    expect(footer).toContain('brandConfig.supportEmail');
  });

  it('el año del copyright es dinámico, no un literal', () => {
    expect(footer).toContain('getFullYear()');
    expect(footer).not.toMatch(/©\s*202\d/);
  });

  it('lleva los cinco enlaces legales obligatorios', () => {
    for (const ruta of [
      '/aviso-legal',
      '/terminos-y-condiciones',
      '/politica-privacidad',
      '/politica-de-cookies',
      '/politica-de-envios',
    ]) {
      expect(footer).toContain(`href="${ruta}"`);
    }
  });

  it('los enlaces sociales salen de brandConfig y abren en pestaña nueva con rel seguro', () => {
    expect(footer).toContain('brandConfig.socialLinks');
    expect(footer).toContain('rel="noopener noreferrer"');
  });
});
