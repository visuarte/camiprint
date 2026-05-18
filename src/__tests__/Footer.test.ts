import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 11.3: Footer tests', () => {
  const footerPath = path.join(process.cwd(), 'src', 'app', 'components', 'Footer.tsx');
  const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');

  it('renderiza secciones principales de footer', () => {
    const footer = fs.readFileSync(footerPath, 'utf-8');

    expect(footer).toContain("import { brandConfig } from '@/config/brand'");
    expect(footer).toContain('aria-label={brandConfig.displayName}');
    expect(footer).toContain('Enlaces rapidos');
    expect(footer).toContain('Contacto');
    expect(footer).toContain('Legal y social');
  });

  it('muestra copyright con ano dinamico', () => {
    const footer = fs.readFileSync(footerPath, 'utf-8');

    expect(footer).toContain('new Date().getFullYear()');
    expect(footer).toContain('Todos los derechos reservados');
  });

  it('incluye enlaces principales y legales', () => {
    const footer = fs.readFileSync(footerPath, 'utf-8');

    expect(footer).toContain("href: '#inicio'");
    expect(footer).toContain("href: '#ofertas'");
    expect(footer).toContain("href: '#proceso'");
    expect(footer).toContain("href: '#testimonios'");
    expect(footer).toContain("href: '#faq'");
    expect(footer).toContain("href: '#contacto'");

    expect(footer).toContain('/politica-privacidad');
    expect(footer).toContain('/terminos-y-condiciones');
    expect(footer).toContain('/politica-de-envios');
  });

  it('incluye contacto y redes sociales', () => {
    const footer = fs.readFileSync(footerPath, 'utf-8');

    expect(footer).toContain('brandConfig.supportEmail');
    expect(footer).toContain('brandConfig.phoneHref');
    expect(footer).toContain('brandConfig.postalAddress');

    expect(footer).toContain('aria-label={social.label}');
    expect(footer).toContain('Instagram');
    expect(footer).toContain('Facebook');
    expect(footer).toContain('LinkedIn');
  });

  it('esta integrado en page.tsx', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');

    expect(page).toContain("import Footer from './components/Footer'");
    expect(page).toContain('<Footer />');
  });
});
