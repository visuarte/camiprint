import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 1: Configuración Inicial', () => {
  const rootPath = path.join(process.cwd());

  // Test 1: Estructura de directorios
  describe('Estructura de directorios', () => {
    it('debe existir el directorio src/app/components', () => {
      const componentPath = path.join(rootPath, 'src', 'app', 'components');
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('debe existir el directorio src/app', () => {
      const appPath = path.join(rootPath, 'src', 'app');
      expect(fs.existsSync(appPath)).toBe(true);
    });
  });

  // Test 2: Configuración de globals.css
  describe('globals.css - Estilos base', () => {
    it('debe tener importación de Tailwind CSS', () => {
      const globalsPath = path.join(rootPath, 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      expect(content).toContain('@import "tailwindcss"');
    });

    it('debe tener scroll-behavior: smooth en html', () => {
      const globalsPath = path.join(rootPath, 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      expect(content).toMatch(/html\s*{[\s\S]*scroll-behavior:\s*smooth/);
    });

    it('debe definir estilos para headings', () => {
      const globalsPath = path.join(rootPath, 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      expect(content).toMatch(/h[1-6]/);
    });

    it('debe tener transiciones suave para buttons y links', () => {
      const globalsPath = path.join(rootPath, 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      expect(content).toMatch(/button,\s*a\s*{[\s\S]*transition/);
    });
  });

  // Test 3: Configuración de layout.tsx
  describe('layout.tsx - SEO Metadata', () => {
    it('debe exportar metadata de tipo Metadata', () => {
      const layoutPath = path.join(rootPath, 'src', 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('export const metadata: Metadata');
    });

    it('debe tener título SEO en metadata', () => {
      const layoutPath = path.join(rootPath, 'src', 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('title:');
      expect(content).toContain("import { brandConfig } from '@/config/brand'");
      expect(content).toContain('brandConfig.seo.defaultTitle');
    });

    it('debe tener descripción en metadata', () => {
      const layoutPath = path.join(rootPath, 'src', 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('description:');
    });

    it('debe tener keywords en metadata', () => {
      const layoutPath = path.join(rootPath, 'src', 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('keywords:');
    });

    it('debe tener configuración de Open Graph', () => {
      const layoutPath = path.join(rootPath, 'src', 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('openGraph');
    });

    it('debe tener link canónico', () => {
      const layoutPath = path.join(rootPath, 'src', 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('rel="canonical"');
    });

    it('debe tener lang="es" en html', () => {
      const layoutPath = path.join(rootPath, 'src', 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('lang="es"');
    });
  });

  // Test 4: Versiones de dependencias
  describe('Versiones de dependencias en package.json', () => {
    it('debe tener Next.js 16.2.6', () => {
      const packagePath = path.join(rootPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      expect(packageJson.dependencies.next || packageJson.devDependencies.next).toBe('16.2.6');
    });

    it('debe tener React 19.2.4 o superior', () => {
      const packagePath = path.join(rootPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      const reactVersion = packageJson.dependencies.react;
      expect(reactVersion).toMatch(/19\./);
    });

    it('debe tener Tailwind CSS 4', () => {
      const packagePath = path.join(rootPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      const tailwindVersion = packageJson.devDependencies.tailwindcss;
      expect(tailwindVersion).toMatch(/\^4/);
    });

    it('debe tener TypeScript instalado', () => {
      const packagePath = path.join(rootPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      expect(packageJson.devDependencies.typescript).toBeDefined();
    });
  });

  // Test 5: Configuración de Tailwind CSS
  describe('Configuración de Tailwind CSS y PostCSS', () => {
    it('debe existir postcss.config.mjs', () => {
      const postcssPath = path.join(rootPath, 'postcss.config.mjs');
      expect(fs.existsSync(postcssPath)).toBe(true);
    });

    it('debe existir tailwind.config.ts o tailwind.config.js', () => {
      const tailwindTsPath = path.join(rootPath, 'tailwind.config.ts');
      const tailwindJsPath = path.join(rootPath, 'tailwind.config.js');
      const exists = fs.existsSync(tailwindTsPath) || fs.existsSync(tailwindJsPath);
      expect(exists).toBe(true);
    });
  });

  // Test 6: tsconfig.json válido
  describe('Configuración de TypeScript', () => {
    it('debe tener tsconfig.json válido', () => {
      const tsconfigPath = path.join(rootPath, 'tsconfig.json');
      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('debe tener compilerOptions.jsx configurado', () => {
      const tsconfigPath = path.join(rootPath, 'tsconfig.json');
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(tsconfig.compilerOptions.jsx).toBeDefined();
    });
  });

  // Test 7: Sintaxis válida de archivos críticos
  describe('Sintaxis de archivos críticos', () => {
    it('layout.tsx debe ser válido TypeScript', () => {
      const layoutPath = path.join(rootPath, 'src', 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      // Verificar que tiene export default function
      expect(content).toContain('export default function');
      // Verificar que no tiene console.log de debug
      expect(content).not.toMatch(/console\.log\(/);
    });

    it('globals.css debe tener sintaxis válida de CSS', () => {
      const globalsPath = path.join(rootPath, 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      // Verificar que todos los selectores tienen llaves de cierre
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);
    });
  });

  // Test 8: Integridad de componentes
  describe('Estructura de componentes', () => {
    it('debe existir el directorio src/app/components para futuros componentes', () => {
      const componentPath = path.join(rootPath, 'src', 'app', 'components');
      expect(fs.existsSync(componentPath)).toBe(true);
      expect(fs.statSync(componentPath).isDirectory()).toBe(true);
    });
  });
});
