import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 14: Responsive y accesibilidad', () => {
  const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  const navPath = path.join(process.cwd(), 'src', 'app', 'components', 'Navigation.tsx');

  it('incluye skip link y main identificable para teclado/lectores', () => {
    const layout = fs.readFileSync(layoutPath, 'utf-8');

    expect(layout).toContain('href="#main-content"');
    expect(layout).toContain('Saltar al contenido principal');
    expect(layout).toContain('id="main-content"');
  });

  it('define focus visible y reglas para reduced motion', () => {
    const globals = fs.readFileSync(globalsPath, 'utf-8');

    expect(globals).toContain(':focus-visible');
    expect(globals).toContain('@media (prefers-reduced-motion: reduce)');
    expect(globals).toContain('scroll-behavior: auto');
  });

  it('refuerza touch targets moviles y previene overflow horizontal', () => {
    const globals = fs.readFileSync(globalsPath, 'utf-8');
    const layout = fs.readFileSync(layoutPath, 'utf-8');

    expect(globals).toContain('@media (max-width: 768px)');
    expect(globals).toContain('min-height: 44px');
    expect(layout).toContain('overflow-x-hidden');
  });

  it('menu movil mejora accesibilidad de control y teclado', () => {
    const nav = fs.readFileSync(navPath, 'utf-8');

    expect(nav).toContain('aria-controls="mobile-main-menu"');
    expect(nav).toContain('id="mobile-main-menu"');
    expect(nav).toContain("event.key === 'Escape'");
  });

  it('imagenes tienen atributo alt en componentes de la app', () => {
    const appDir = path.join(process.cwd(), 'src', 'app');
    const files = fs.readdirSync(path.join(appDir, 'components'));
    const combined = files
      .filter((name) => name.endsWith('.tsx') || name.endsWith('.ts'))
      .map((name) => fs.readFileSync(path.join(appDir, 'components', name), 'utf-8'))
      .join('\n');

    expect(combined).toContain('alt=');
  });
});
