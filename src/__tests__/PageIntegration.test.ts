import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 12: Integracion pagina principal', () => {
  const pagePath = path.join(process.cwd(), 'src', 'app', 'template-nuevo', 'page.tsx');
  const navigationPath = path.join(process.cwd(), 'src', 'app', 'components', 'Navigation.tsx');
  const pricingPath = path.join(process.cwd(), 'src', 'app', 'components', 'Pricing.tsx');

  it('template-nuevo incluye todas las secciones en orden', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');

    expect(page).toContain("import ContactSection from '@/app/components/ContactSection'");

    const expectedSections = [
      'id="inicio"',
      'id="proceso"',
      'id="testimonios"',
      'id="faq"',
      '<ContactSection',
      '<footer',
    ];

    let lastIndex = -1;
    for (const fragment of expectedSections) {
      const index = page.indexOf(fragment);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
  });

  it('navigation enlaza a todas las secciones con IDs esperados', () => {
    const navigation = fs.readFileSync(navigationPath, 'utf-8');

    expect(navigation).toContain("{ href: '#inicio', label: 'Inicio' }");
    expect(navigation).toContain("{ href: '#ofertas', label: 'Ofertas' }");
    expect(navigation).toContain("{ href: '#proceso', label: 'Proceso' }");
    expect(navigation).toContain("{ href: '#testimonios', label: 'Testimonios' }");
    expect(navigation).toContain("{ href: '#faq', label: 'FAQ' }");
    expect(navigation).toContain("{ href: '#contacto', label: 'Contacto' }");
  });

  it('cta de pricing pasa parametro quantity via history API', () => {
    const pricing = fs.readFileSync(pricingPath, 'utf-8');

    expect(pricing).toContain('?quantity=${tierId}');
  });
});
