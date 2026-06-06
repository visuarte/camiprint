import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 16: Optimizaciones de conversion', () => {
  const heroPath = path.join(process.cwd(), 'src', 'app', 'components', 'Hero.tsx');
  const pricingPath = path.join(process.cwd(), 'src', 'app', 'components', 'Pricing.tsx');
  const testimonialsPath = path.join(process.cwd(), 'src', 'app', 'components', 'TestimonialsSection.tsx');
  const contactPath = path.join(process.cwd(), 'src', 'app', 'components', 'ContactSection.tsx');

  it('hero contiene CTAs de accion y trust signals visibles', () => {
    const hero = fs.readFileSync(heroPath, 'utf-8');

    expect(hero).toContain('Recibir propuesta en minutos');
    expect(hero).toContain('Solicitar Cotización');
    expect(hero).toContain('trustSignals');
    expect(hero).toContain('1200+');
    expect(hero).toContain('pedidos entregados');
  });

  it('pricing incluye señales de confianza y garantias', () => {
    const pricing = fs.readFileSync(pricingPath, 'utf-8');

    expect(pricing).toContain('+300 empresas');
    expect(pricing).toContain('98%');
    expect(pricing).toContain('Garant');
    expect(pricing).toContain('Solicitar Cotización');
  });

  it('social proof adicional esta presente en testimonios', () => {
    const testimonials = fs.readFileSync(testimonialsPath, 'utf-8');

    expect(testimonials).toContain('4,9/5');
    expect(testimonials).toContain('1200 pedidos entregados');
  });

  it('formulario tiene 5 campos obligatorios con labels', () => {
    const contact = fs.readFileSync(contactPath, 'utf-8');

    expect(contact).toContain('Nombre *');
    expect(contact).toContain('Email *');
    expect(contact).toContain('Telefono *');
    expect(contact).toContain('Empresa *');
    expect(contact).toContain('Cantidad *');
  });
});
