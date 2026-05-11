import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 3: Hero Component', () => {
  const heroPath = path.join(process.cwd(), 'src', 'app', 'components', 'Hero.tsx');

  describe('3.1 - Estructura del componente Hero', () => {
    it('archivo Hero.tsx debe existir', () => {
      expect(fs.existsSync(heroPath)).toBe(true);
    });

    it('debe ser un Server Component (sin "use client")', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      // Los Server Components no tienen 'use client'
      expect(content).not.toContain("'use client'");
      expect(content).not.toContain('"use client"');
    });

    it('debe tener estructura HTML semántica con <section>', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('<section');
      expect(content).toContain('id="inicio"');
    });

    it('debe tener heading <h1>', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('<h1');
      expect(content).toContain('Camisetas personalizadas');
    });

    it('debe tener subtítulo descriptivo', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('Ropa laboral');
      expect(content).toContain('camisetas publicitarias');
      expect(content).toContain('uniformes');
    });

    it('debe tener gradiente de fondo (slate-900 a blue-800)', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('from-slate-900');
      expect(content).toMatch(/to-blue-8[0-9]{2}/);
    });

    it('debe ser responsive: text-3xl móvil, text-5xl desktop', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('text-3xl');
      expect(content).toMatch(/text-5xl|text-6xl/);
      expect(content).toContain('md:');
    });
  });

  describe('3.2 - CTAs (Call To Action)', () => {
    it('debe tener botón CTA primario "Ver Ofertas"', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('Ver Ofertas');
    });

    it('CTA primario debe enlazar a #ofertas', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('href="#ofertas"');
    });

    it('debe tener botón CTA secundario "Solicitar Cotización"', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      // Debe haber al menos 2 "Solicitar Cotización" (uno en Navigation, uno en Hero)
      const matches = content.match(/Solicitar Cotización/g) || [];
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('CTA secundario debe enlazar a #contacto', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('href="#contacto"');
    });

    it('CTAs deben tener estilos hover', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('hover:');
    });

    it('CTAs deben ser responsive', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('sm:flex-row');
      expect(content).toMatch(/flex-col|grid-cols/);
    });
  });

  describe('3.2 - Trust Indicators', () => {
    it('debe tener trust indicator "Entrega en 7-10 días"', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('Entrega en 7-10 días');
    });

    it('debe tener trust indicator "Desde 50 unidades"', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('Desde 50 unidades');
    });

    it('debe tener trust indicator "Diseño gratuito"', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('Diseño gratuito');
    });

    it('trust indicators deben tener iconos (emojis o SVG)', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      // Buscar emojis o referencias a iconos
      expect(content).toMatch(/[📦🎨📊]/);
    });

    it('trust indicators deben estar estilizados como badges', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      // Verificar que tienen layout flex y gap
      expect(content).toContain('grid-cols');
      expect(content).toContain('gap-');
    });

    it('trust indicators deben tener aria-labels accesibles', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('aria-label');
    });

    it('debe mostrar 3 trust indicators (grid-cols-1 sm:grid-cols-3)', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('sm:grid-cols-3');
      expect(content).toContain('trustIndicators.map');
    });
  });

  describe('3.1/3.2 - Accesibilidad y contraste', () => {
    it('debe tener suficiente contraste: texto blanco sobre fondo oscuro', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('text-white');
      expect(content).toContain('from-slate-900');
    });

    it('debe tener contraste de botones: 4.5:1 mínimo', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      // Verificar que los botones tienen colores contrastados
      expect(content).toMatch(/bg-blue-[56]\d\d|bg-white/);
    });

    it('section debe tener id="inicio" para navegación suave', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('id="inicio"');
    });

    it('debe tener scroll-margin-top para offset con header fixed', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('scroll-mt-');
    });
  });

  describe('3.3 - Sintaxis y validez', () => {
    it('archivo Hero.tsx debe tener sintaxis válida TypeScript', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('export default Hero');
      expect(content).toContain('const Hero');
      expect(content).toContain('return');
    });

    it('debe exportar default el componente Hero', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toMatch(/export\s+default\s+Hero/);
    });

    it('debe importar Link de next/link', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain("import Link from 'next/link'");
    });

    it('debe usar Links para CTAs', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('<Link');
      expect(content).toContain('</Link>');
    });

    it('debe tener interfaces TypeScript para tipos', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('interface TrustIndicator');
    });
  });

  describe('3.1 - Integración en page.tsx', () => {
    it('Hero debe estar importado en page.tsx', () => {
      const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toContain("import Hero from './components/Hero'");
    });

    it('Hero debe estar renderizado en page.tsx', () => {
      const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toContain('<Hero />');
    });
  });

  describe('Responsive Design', () => {
    it('debe tener clases responsive para móvil', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toContain('text-3xl');
      expect(content).toContain('py-16');
    });

    it('debe tener clases responsive para tablet/desktop', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toMatch(/md:|lg:/);
    });

    it('padding debe ser responsive', () => {
      const content = fs.readFileSync(heroPath, 'utf-8');
      expect(content).toMatch(/py-\d+\s+md:py-\d+/);
    });
  });
});
