import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 7: Testimonials Section', () => {
  const componentPath = path.join(process.cwd(), 'src', 'app', 'components', 'TestimonialsSection.tsx');
  const dataPath = path.join(process.cwd(), 'src', 'app', 'data', 'testimonials.ts');
  const templatePath = path.join(process.cwd(), 'src', 'app', 'template-nuevo', 'page.tsx');

  it('renderiza al menos 3 testimonios en datos', () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    const ids = data.match(/id:\s*'t-/g) || [];
    expect(ids.length).toBeGreaterThanOrEqual(3);
  });

  it('muestra rating visual en estrellas', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain('Valoración 5 de 5');
    expect(component).toContain('★');
  });

  it('muestra nombres de clientes y empresas', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    const data = fs.readFileSync(dataPath, 'utf-8');
    expect(component).toContain('customerName');
    expect(component).toContain('companyName');
    expect(data).toContain('Marina Gómez');
    expect(data).toContain('Nexo Logistics');
  });

  it('testimonials estan en el template activo', () => {
    const page = fs.readFileSync(templatePath, 'utf-8');
    expect(page).toContain('id="testimonios"');
    expect(page).toContain('testimonials.map');
  });
});
