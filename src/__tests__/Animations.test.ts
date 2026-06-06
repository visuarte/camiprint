import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 13.4: Tests de animaciones', () => {
  const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
  const navPath = path.join(process.cwd(), 'src', 'app', 'components', 'Navigation.tsx');
  const pagePath = path.join(process.cwd(), 'src', 'app', 'template-nuevo', 'page.tsx');

  it('elementos se animan al entrar en viewport', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');
    const globals = fs.readFileSync(globalsPath, 'utf-8');

    expect(page).toContain('animate-float');
    expect(page).toContain('@keyframes float');
    expect(globals).toContain("[data-motion='enabled'] [data-reveal]");
    expect(globals).toContain("[data-motion='enabled'] [data-reveal].is-visible");
  });

  it('botones y enlaces tienen transiciones de hover/estado', () => {
    const globals = fs.readFileSync(globalsPath, 'utf-8');

    expect(globals).toContain('button,');
    expect(globals).toContain('a {');
    expect(globals).toContain('transition: all 0.3s ease-in-out');
  });

  it('menu movil usa animacion al abrir/cerrar', () => {
    const nav = fs.readFileSync(navPath, 'utf-8');
    const globals = fs.readFileSync(globalsPath, 'utf-8');

    expect(nav).toContain('animate-slideDown');
    expect(globals).toContain('@keyframes slideDown');
    expect(globals).toContain('.animate-slideDown');
  });
});
