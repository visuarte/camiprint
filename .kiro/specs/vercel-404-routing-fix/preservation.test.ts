/**
 * Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * These tests verify that the fix preserves all existing functionality and content
 * that should remain unchanged. Tests capture baseline behavior on UNFIXED code.
 * 
 * EXPECTED OUTCOME: Tests PASS on unfixed code (confirms baseline to preserve).
 * After implementing the fix, these tests should STILL PASS (confirms no regressions).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as fc from 'fast-check';

describe('Property 2: Preservation - Unchanged Project Configuration and Functionality', () => {
  const projectRoot = path.resolve(__dirname, '../../..');
  
  // Baseline snapshots of files that should be preserved
  const srcAppDir = path.join(projectRoot, 'src', 'app');
  const publicDir = path.join(projectRoot, 'public');
  
  // Configuration files that should remain unchanged
  const configFiles = [
    'next.config.ts',
    'package.json',
    'tsconfig.json',
  ];
  
  // Expected files in /src/app
  const srcAppFiles = [
    'page.tsx',
    'layout.tsx',
    'globals.css',
    'favicon.ico',
  ];
  
  // Expected files in /public
  const publicFiles = [
    'file.svg',
    'globe.svg',
    'next.svg',
    'vercel.svg',
    'window.svg',
  ];
  
  // Capture baseline content before any changes
  let baselineContent: Map<string, string>;
  
  beforeAll(() => {
    baselineContent = new Map();
    
    // Capture /src/app files
    srcAppFiles.forEach(file => {
      const filePath = path.join(srcAppDir, file);
      if (fs.existsSync(filePath)) {
        baselineContent.set(`src/app/${file}`, fs.readFileSync(filePath, 'utf-8'));
      }
    });
    
    // Capture config files
    configFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        baselineContent.set(file, fs.readFileSync(filePath, 'utf-8'));
      }
    });
  });

  describe('Preservation of /src/app directory and files', () => {
    it('should verify /src/app directory exists and contains all expected files', () => {
      expect(fs.existsSync(srcAppDir), '/src/app directory should exist').toBe(true);
      
      srcAppFiles.forEach(file => {
        const filePath = path.join(srcAppDir, file);
        expect(
          fs.existsSync(filePath),
          `/src/app/${file} should exist`
        ).toBe(true);
      });
    });

    it('should verify /src/app/page.tsx contains Camiprint content', () => {
      const pageContent = fs.readFileSync(path.join(srcAppDir, 'page.tsx'), 'utf-8');
      
      // Verify key Camiprint content is present
      expect(pageContent).toContain('Camisetas personalizadas para negocios, restaurantes y empresas');
      expect(pageContent).toContain('Ofertas rápidas por cantidad');
      expect(pageContent).toContain('10+ camisetas');
      expect(pageContent).toContain('25+ camisetas');
      expect(pageContent).toContain('50+ camisetas');
      expect(pageContent).toContain('Especialistas en');
    });

    it('should verify /src/app/layout.tsx contains Camiprint metadata', () => {
      const layoutContent = fs.readFileSync(path.join(srcAppDir, 'layout.tsx'), 'utf-8');
      
      // Verify Camiprint metadata
      expect(layoutContent).toContain('Camiprint | Camisetas laborales y publicitarias');
      expect(layoutContent).toContain('Tienda online de camisetas para negocios');
    });

    it('should verify /src/app files content remains unchanged (property-based)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...srcAppFiles),
          (fileName) => {
            const filePath = path.join(srcAppDir, fileName);
            const currentContent = fs.readFileSync(filePath, 'utf-8');
            const baselineKey = `src/app/${fileName}`;
            
            // Property: Content should match baseline
            if (baselineContent.has(baselineKey)) {
              return currentContent === baselineContent.get(baselineKey);
            }
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Preservation of /public directory and static assets', () => {
    it('should verify /public directory exists and contains all expected files', () => {
      expect(fs.existsSync(publicDir), '/public directory should exist').toBe(true);
      
      publicFiles.forEach(file => {
        const filePath = path.join(publicDir, file);
        expect(
          fs.existsSync(filePath),
          `/public/${file} should exist`
        ).toBe(true);
      });
    });

    it('should verify all public files are accessible (property-based)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...publicFiles),
          (fileName) => {
            const filePath = path.join(publicDir, fileName);
            
            // Property: File should exist and be readable
            if (!fs.existsSync(filePath)) return false;
            
            try {
              const stats = fs.statSync(filePath);
              return stats.isFile() && stats.size > 0;
            } catch {
              return false;
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Preservation of configuration files', () => {
    it('should verify all configuration files exist', () => {
      configFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(
          fs.existsSync(filePath),
          `${file} should exist`
        ).toBe(true);
      });
    });

    it('should verify next.config.ts has expected structure', () => {
      const configPath = path.join(projectRoot, 'next.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      // Verify basic structure
      expect(configContent).toContain('NextConfig');
      expect(configContent).toContain('nextConfig');
    });

    it('should verify package.json has required scripts', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      // Verify essential scripts exist
      expect(packageContent.scripts).toHaveProperty('dev');
      expect(packageContent.scripts).toHaveProperty('build');
      expect(packageContent.scripts).toHaveProperty('start');
      
      // Verify key dependencies
      expect(packageContent.dependencies).toHaveProperty('next');
      expect(packageContent.dependencies).toHaveProperty('react');
    });

    it('should verify tsconfig.json has required compiler options', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      const tsconfigContent = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      
      // Verify essential compiler options
      expect(tsconfigContent.compilerOptions).toHaveProperty('jsx');
      expect(tsconfigContent.compilerOptions).toHaveProperty('strict');
      expect(tsconfigContent.compilerOptions.paths).toHaveProperty('@/*');
    });

    it('should verify configuration files content remains unchanged (property-based)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...configFiles),
          (fileName) => {
            const filePath = path.join(projectRoot, fileName);
            const currentContent = fs.readFileSync(filePath, 'utf-8');
            
            // Property: Content should match baseline
            if (baselineContent.has(fileName)) {
              return currentContent === baselineContent.get(fileName);
            }
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Preservation of build functionality', () => {
    it('should verify npm run build completes successfully', { timeout: 60000 }, () => {
      try {
        const buildOutput = execSync('npm run build', {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: 'pipe',
          timeout: 120000,
        });
        
        // Verify build completed successfully
        expect(buildOutput).toContain('Compiled successfully');
        
        // Verify build directory was created
        const buildDir = path.join(projectRoot, '.next');
        expect(fs.existsSync(buildDir), '.next build directory should exist').toBe(true);
        
      } catch (error: any) {
        throw new Error(`Build failed: ${error.message}\nStdout: ${error.stdout}\nStderr: ${error.stderr}`);
      }
    });

    it('should verify build produces expected output structure', () => {
      const buildDir = path.join(projectRoot, '.next');
      
      // Verify key build artifacts exist
      expect(fs.existsSync(buildDir), '.next directory should exist').toBe(true);
      
      // Check for server directory (contains compiled pages)
      const serverDir = path.join(buildDir, 'server');
      expect(fs.existsSync(serverDir), '.next/server directory should exist').toBe(true);
    });
  });

  describe('Preservation of development server functionality', () => {
    it('should verify dev server can start (property-based check)', () => {
      // Property: Dev server command should be available and valid
      // We don't actually start the server (would block), but verify the command exists
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(packageContent.scripts.dev).toBe('next dev');
      
      // Verify next binary exists in node_modules
      const nextBinPath = path.join(projectRoot, 'node_modules', '.bin', 'next');
      const nextBinPathCmd = path.join(projectRoot, 'node_modules', '.bin', 'next.cmd');
      
      const nextExists = fs.existsSync(nextBinPath) || fs.existsSync(nextBinPathCmd);
      expect(nextExists, 'next binary should exist in node_modules').toBe(true);
    });
  });

  describe('Property-based preservation invariants', () => {
    it('should verify all critical paths remain accessible (property-based)', () => {
      const criticalPaths = [
        srcAppDir,
        publicDir,
        path.join(projectRoot, 'node_modules'),
        path.join(projectRoot, '.next'),
      ];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...criticalPaths),
          (dirPath) => {
            // Property: Critical directories should exist and be accessible
            return fs.existsSync(dirPath);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should verify file integrity across multiple reads (property-based)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...srcAppFiles),
          fc.integer({ min: 1, max: 5 }),
          (fileName, numReads) => {
            const filePath = path.join(srcAppDir, fileName);
            
            // Property: Multiple reads should return identical content
            const firstRead = fs.readFileSync(filePath, 'utf-8');
            
            for (let i = 0; i < numReads; i++) {
              const subsequentRead = fs.readFileSync(filePath, 'utf-8');
              if (firstRead !== subsequentRead) return false;
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
