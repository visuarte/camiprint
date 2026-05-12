import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 4: Pricing Component', () => {
  const pricingPath = path.join(process.cwd(), 'src', 'app', 'components', 'Pricing.tsx');

  describe('4.1 - Estructura del componente Pricing', () => {
    it('archivo Pricing.tsx debe existir', () => {
      expect(fs.existsSync(pricingPath)).toBe(true);
    });

    it('debe ser un Server Component (sin "use client")', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).not.toContain("'use client'");
    });

    it('debe tener estructura HTML semántica con <section>', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('<section');
      expect(content).toContain('id="ofertas"');
    });

    it('debe tener heading <h2>', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('<h2');
      expect(content).toContain('Ofertas por cantidad');
    });

    it('debe tener subtitle descriptivo', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('Cuantas más camisetas, mayor descuento');
    });

    it('debe tener grid responsive (grid-cols-1 md:grid-cols-3)', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('grid-cols-1');
      expect(content).toContain('md:grid-cols-3');
    });

    it('debe tener interface PricingTier con campos requeridos', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('interface PricingTier');
      expect(content).toContain('quantity:');
      expect(content).toContain('pricePerUnit:');
      expect(content).toContain('savings:');
      expect(content).toContain('isPopular:');
    });

    it('debe tener 3 pricing tiers: 10+, 25+, 50+', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('10+ camisetas');
      expect(content).toContain('25+ camisetas');
      expect(content).toContain('50+ camisetas');
    });

    it('tiers deben tener precios: 12.9, 10.9, 8.9', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('12.9');
      expect(content).toContain('10.9');
      expect(content).toContain('8.9');
    });

    it('tiers deben tener ahorros: 8%, 18%, 30%', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('8');
      expect(content).toContain('18');
      expect(content).toContain('30');
    });
  });

  describe('4.2 - Destacado y CTAs por tier', () => {
    it('tier 25+ debe ser marcado como "Más Popular"', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('Más Popular');
      expect(content).toContain('isPopular: true');
    });

    it('tier popular debe tener badge visual distintivo', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('⭐');
    });

    it('tier popular debe tener borde destacado (ring-2 ring-blue-500)', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('ring-2');
      expect(content).toContain('ring-blue-500');
    });

    it('tier popular debe tener escala aumentada (md:scale-105)', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('md:scale-105');
    });

    it('cada tier debe tener CTA "Solicitar Cotización"', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('Solicitar Cotización');
      expect(content).toContain('pricingTiers.map');
    });

    it('CTAs deben enlazar a #contacto con parámetro quantity', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('#contacto?quantity=${tier.id}');
      expect(content).toContain("id: 'tier-10'");
      expect(content).toContain("id: 'tier-25'");
      expect(content).toContain("id: 'tier-50'");
    });

    it('CTA del tier popular debe tener color azul (bg-blue-600)', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('bg-blue-600');
    });

    it('debe tener disclaimer de precios', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('Precios orientativos');
      expect(content).toContain('cotización final');
      expect(content).toContain('diseño');
    });

    it('disclaimer debe incluir información sobre especificaciones', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('técnica de impresión');
      expect(content).toContain('tejido');
    });
  });

  describe('4.1/4.2 - Características y features', () => {
    it('cada tier debe tener lista de features', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('features:');
      expect(content).toContain('Impresión');
      expect(content).toContain('Plazo:');
    });

    it('tier 10 debe tener impresión 1 color', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('Impresión 1 color');
    });

    it('tier 25 debe tener impresión 2 colores y diseño gratuito', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('Impresión 2 colores');
      expect(content).toContain('Diseño gratuito');
    });

    it('tier 50 debe tener impresión multicolor y muestras gratis', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('Impresión multicolor');
      expect(content).toContain('Muestras gratis');
    });

    it('features deben estar marcadas con checkmark (✓)', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('✓');
    });
  });

  describe('Estilos y hover effects', () => {
    it('cards deben tener shadow y hover:shadow', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('shadow-');
      expect(content).toContain('hover:shadow');
    });

    it('cards deben tener hover scale effect', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('hover:scale');
    });

    it('debe tener badge de ahorro con fondo verde (emerald-100)', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('emerald-100');
      expect(content).toContain('emerald-700');
    });

    it('debe tener colores contrastados para accesibilidad', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('text-gray-900');
      expect(content).toContain('text-blue-600');
    });
  });

  describe('Responsive Design', () => {
    it('debe ser responsive en móvil y desktop', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('md:');
      expect(content).toContain('lg:');
    });

    it('grid debe ser 1 columna en móvil, 3 en desktop', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('grid-cols-1 md:grid-cols-3');
    });

    it('padding debe ser responsive', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toMatch(/py-\d+\s+md:py-\d+/);
    });

    it('texto debe ser responsive (text-3xl md:text-4xl lg:text-5xl)', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('text-3xl');
      expect(content).toContain('md:text-');
      expect(content).toContain('lg:text-');
    });
  });

  describe('Accesibilidad', () => {
    it('section debe tener id="ofertas" para navegación suave', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('id="ofertas"');
    });

    it('debe tener scroll-margin-top para offset con header fixed', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('scroll-mt-');
    });

    it('heading deben ser semánticos: h2', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('<h2');
      expect(content).toContain('</h2>');
    });

    it('subheading deben ser h3', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('<h3');
    });
  });

  describe('Sintaxis y validez TypeScript', () => {
    it('archivo Pricing.tsx debe tener sintaxis válida', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('export default Pricing');
      expect(content).toContain('const Pricing');
    });

    it('debe importar Link de next/link', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain("import Link from 'next/link'");
    });

    it('debe usar Links para CTAs', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('<Link');
      expect(content).toContain('href=');
    });

    it('debe tener tipo de retorno válido para componente React', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('const Pricing = () =>');
    });

    it('debe mapear correctamente el array pricingTiers', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain('pricingTiers.map');
      expect(content).toContain('key={tier.id}');
    });
  });

  describe('4.1 - Integración en page.tsx', () => {
    it('Pricing debe estar importado en page.tsx', () => {
      const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toContain("import Pricing from './components/Pricing'");
    });

    it('Pricing debe estar renderizado en page.tsx', () => {
      const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toContain('<Pricing />');
    });
  });

  describe('Datos y estructura', () => {
    it('pricingTiers debe ser un array con 3 elementos', () => {
      const content = fs.readFileSync(pricingPath, 'utf-8');
      expect(content).toContain("const pricingTiers: PricingTier[] = [");
      expect(content).toMatch(/\{[\s\S]*id:.*tier-10[\s\S]*\}/);
      expect(content).toMatch(/\{[\s\S]*id:.*tier-25[\s\S]*\}/);
      expect(content).toMatch(/\{[\s\S]*id:.*tier-50[\s\S]*\}/);
    });
  });
});
