import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 11.3: Footer tests', () => {
  const footerPath = path.join(process.cwd(), 'src', 'components', 'Footer.tsx');
  const pagePath = path.join(process.cwd(), 'src', 'app', 'template-nuevo', 'page.tsx');

  it('renderiza secciones principales de footer', () => {
    const footer = fs.readFileSync(footerPath, 'utf-8');

    expect(footer).toContain("import { brandConfig } from '@/config/brand'");
    expect(footer).toContain('CAMIART');
    expect(footer).toContain('Alicante, España');
  });

  it('muestra copyright con ano dinamico', () => {
    const footer = fs.readFileSync(footerPath, 'utf-8');

    expect(footer).toContain('2026');
    expect(footer).toContain('CAMIART');
  });

  it('incluye enlaces principales y legales', () => {
    const footer = fs.readFileSync(footerPath, 'utf-8');

    expect(footer).toContain('/aviso-legal');
    expect(footer).toContain('/terminos-y-condiciones');
    expect(footer).toContain('/politica-privacidad');
    expect(footer).toContain('/politica-de-cookies');
    expect(footer).toContain('/politica-de-envios');
  });

  it('incluye contacto y redes sociales', () => {
    const footer = fs.readFileSync(footerPath, 'utf-8');

    expect(footer).toContain('brandConfig.phoneDisplay');
    expect(footer).toContain('brandConfig.supportEmail');
    expect(footer).toContain('brandConfig.socialLinks.instagram');
    expect(footer).toContain('brandConfig.socialLinks.facebook');
    expect(footer).toContain('brandConfig.socialLinks.linkedin');
  });

  it('footer esta presente en el template activo', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');

    expect(page).toContain('CAMIART');
    expect(page).toContain('footer');
  });
});
