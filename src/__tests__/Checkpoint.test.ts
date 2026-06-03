import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 5 - Checkpoint', () => {
  const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
  const navPath = path.join(process.cwd(), 'src', 'app', 'components', 'Navigation.tsx');
  const heroPath = path.join(process.cwd(), 'src', 'app', 'components', 'Hero.tsx');
  const pricingPath = path.join(process.cwd(), 'src', 'app', 'components', 'Pricing.tsx');
  const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');

  it('renderiza Navigation, Hero y Pricing en la home', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');
    expect(page).toContain('<Navigation />');
    expect(page).toContain('<Hero />');
    expect(page).toContain('<Pricing />');
  });

  it('la navegación tiene targets existentes para todas las secciones', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');
    const hero = fs.readFileSync(heroPath, 'utf-8');
    const pricing = fs.readFileSync(pricingPath, 'utf-8');

    expect(hero).toContain('id="inicio"');
    expect(pricing).toContain('id="ofertas"');
    expect(page).toContain('id="proceso"');
    expect(page).toContain('id="testimonios"');
    expect(page).toContain('id="faq"');
    expect(page).toContain('id="contacto"');
  });

  it('smooth scroll está activo en CSS global y en navegación', () => {
    const globals = fs.readFileSync(globalsPath, 'utf-8');
    const nav = fs.readFileSync(navPath, 'utf-8');

    expect(globals).toContain('scroll-behavior: smooth');
    expect(nav).toContain("behavior: 'smooth'");
    expect(nav).toContain('scrollIntoView');
  });

  it('componentes principales incluyen utilidades responsive', () => {
    const nav = fs.readFileSync(navPath, 'utf-8');
    const hero = fs.readFileSync(heroPath, 'utf-8');
    const pricing = fs.readFileSync(pricingPath, 'utf-8');

    expect(nav).toContain('lg:hidden');
    expect(nav).toContain('hidden lg:flex');
    expect(hero).toContain('text-3xl');
    expect(hero).toContain('md:text-5xl');
    expect(pricing).toContain('grid-cols-1 md:grid-cols-3');
  });
});
