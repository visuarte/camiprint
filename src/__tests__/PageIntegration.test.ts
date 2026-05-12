import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 12: Integracion pagina principal', () => {
  const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
  const navigationPath = path.join(process.cwd(), 'src', 'app', 'components', 'Navigation.tsx');
  const pricingPath = path.join(process.cwd(), 'src', 'app', 'components', 'Pricing.tsx');

  it('page.tsx importa y renderiza todos los componentes principales en orden', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');

    expect(page).toContain("import Navigation from './components/Navigation'");
    expect(page).toContain("import Hero from './components/Hero'");
    expect(page).toContain("import Pricing from './components/Pricing'");
    expect(page).toContain("import Process from './components/Process'");
    expect(page).toContain("import TestimonialsSection from './components/TestimonialsSection'");
    expect(page).toContain("import FAQSection from './components/FAQSection'");
    expect(page).toContain("import ContactSection from './components/ContactSection'");
    expect(page).toContain("import Footer from './components/Footer'");

    const expectedOrder = [
      '<Navigation />',
      '<Hero />',
      '<Pricing />',
      '<Process />',
      '<TestimonialsSection />',
      '<FAQSection />',
      '<ContactSection />',
      '<Footer />',
    ];

    let lastIndex = -1;
    for (const fragment of expectedOrder) {
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

  it('cta de pricing enlaza al formulario con parametro quantity', () => {
    const pricing = fs.readFileSync(pricingPath, 'utf-8');

    expect(pricing).toContain('href={`#contacto?quantity=${tier.id}`}');
  });
});
