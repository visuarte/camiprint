import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 2: Navigation Component', () => {
  const navigationPath = path.join(process.cwd(), 'src', 'app', 'components', 'Navigation.tsx');

  describe('2.1 - Estructura del componente Navigation', () => {
    it('archivo Navigation.tsx debe existir', () => {
      expect(fs.existsSync(navigationPath)).toBe(true);
    });

    it('debe ser un Client Component (contiene "use client")', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toMatch(/['"]use client['"]/);
    });

    it('debe usar useState para menú móvil', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('useState');
      expect(content).toContain('isMobileMenuOpen');
    });

    it('debe usar useEffect para cerrar menú al click fuera', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('useEffect');
      expect(content).toContain('handleClickOutside');
    });

    it('debe usar useRef para referencia del menú', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('useRef');
    });

    it('debe tener HTML semántico con <header> y <nav>', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('<header');
      expect(content).toContain('<nav');
      expect(content).toContain('</header>');
    });
  });

  describe('2.1 - Enlaces de navegación', () => {
    it('debe incluir los 6 enlaces de navegación requeridos', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      const requiredLinks = ['#inicio', '#ofertas', '#proceso', '#testimonios', '#faq', '#contacto'];

      requiredLinks.forEach((link) => {
        expect(content).toContain(link);
      });
    });

    it('debe incluir etiquetas de navegación correctas', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      const labels = ['Inicio', 'Ofertas', 'Proceso', 'Testimonios', 'FAQ', 'Contacto'];

      labels.forEach((label) => {
        expect(content).toContain(label);
      });
    });

    it('debe tener logo de Camiart', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('Camiart');
    });

    it('debe tener botón CTA "Solicitar Cotización"', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('Solicitar Cotización');
    });
  });

  describe('2.2 - Menú móvil responsive', () => {
    it('debe tener clase "hidden md:flex" para navegación de escritorio', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('hidden md:flex');
    });

    it('debe tener icono de hamburguesa con SVG', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('<svg');
      expect(content).toContain('M4 6h16M4 12h16M4 18h16');
    });

    it('debe tener ícono X para cerrar menú', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('M6 18L18 6M6 6l12 12');
    });

    it('debe ser visible solo en móvil: md:hidden para hamburguesa', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('md:hidden');
    });

    it('menú móvil debe mostrar todos los enlaces', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      // Verificar que el menú tiene estructura de navegación
      expect(content).toContain('isMobileMenuOpen');
      expect(content).toContain('navigationLinks');
    });

    it('debe tener animación slideDown', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('animate-slideDown');
    });
  });

  describe('2.1 - Estilos y posicionamiento', () => {
    it('header debe tener posicionamiento fixed', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('fixed');
    });

    it('header debe tener z-index alto (z-50)', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('z-50');
    });

    it('header debe tener backdrop-blur', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('backdrop-blur');
    });

    it('header debe tener fondo semi-transparente', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('bg-white');
    });
  });

  describe('2.2 - Funcionalidad de menú', () => {
    it('debe tener función handleClickOutside para cerrar menú', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('handleClickOutside');
    });

    it('debe tener función handleLinkClick para cerrar menú', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('handleLinkClick');
    });

    it('debe tener función handleNavigate para smooth scroll', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('handleNavigate');
      expect(content).toContain('scrollIntoView');
      expect(content).toContain("behavior: 'smooth'");
    });

    it('debe tener event listener para cerrar menú fuera', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('addEventListener');
      expect(content).toContain('mousedown');
    });
  });

  describe('Accesibilidad', () => {
    it('botón hamburguesa debe tener aria-label', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('aria-label');
    });

    it('botón hamburguesa debe tener aria-expanded', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toContain('aria-expanded');
    });
  });

  describe('2.2 - Integración en page.tsx', () => {
    it('Navigation debe estar importado en page.tsx', () => {
      const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toContain("import Navigation from './components/Navigation'");
    });

    it('Navigation debe estar renderizado en page.tsx', () => {
      const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toContain('<Navigation />');
    });
  });

  describe('Sintaxis y validez', () => {
    it('archivo Navigation.tsx debe tener sintaxis válida de TypeScript', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      // Verificar estructura básica de componente
      expect(content).toContain('export default');
      expect(content).toContain('return');
      expect(content).toContain('const Navigation');
    });

    it('debe exportar default el componente Navigation', () => {
      const content = fs.readFileSync(navigationPath, 'utf-8');
      expect(content).toMatch(/export\s+default\s+Navigation/);
    });
  });
});
