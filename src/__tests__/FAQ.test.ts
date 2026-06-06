import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 8: FAQ Section', () => {
  const componentPath = path.join(process.cwd(), 'src', 'app', 'components', 'FAQSection.tsx');
  const dataPath = path.join(process.cwd(), 'src', 'app', 'data', 'faqs.ts');
  const pagePath = path.join(process.cwd(), 'src', 'app', 'template-nuevo', 'page.tsx');

  it('renderiza las preguntas desde data', () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    const ids = data.match(/id:\s*'faq-/g) || [];
    expect(ids.length).toBeGreaterThanOrEqual(3);
  });

  it('usa estado expandedId y click para expandir/colapsar', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain('expandedId');
    expect(component).toContain('toggleItem');
    expect(component).toContain('onClick={() => toggleItem(item.id)}');
  });

  it('mantiene una sola respuesta expandida (patron accordion)', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain('setExpandedId((current) => (current === id ? null : id))');
  });

  it('chevron rota correctamente y hay atributos de accesibilidad', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain("rotate-180");
    expect(component).toContain('aria-expanded={isExpanded}');
    expect(component).toContain('aria-controls={`${item.id}-panel`}');
  });

  it('los datos de faq se usan en el template activo', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');
    expect(page).toContain('Consultas Tecnicas');
    expect(page).toContain('faqItems');
  });
});
