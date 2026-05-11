/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * This test verifies the bug condition: when both /app and /src/app exist,
 * Next.js serves content from the wrong directory (/app template instead of /src/app Camiprint).
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * The test encodes the expected behavior - it will validate the fix when it passes after implementation.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('Property 1: Bug Condition - Dual App Router Directory Conflict', () => {
  const projectRoot = path.resolve(__dirname, '../../..');
  const appDir = path.join(projectRoot, 'app');
  const srcAppDir = path.join(projectRoot, 'src', 'app');
  const appPagePath = path.join(appDir, 'page.tsx');
  const srcAppPagePath = path.join(srcAppDir, 'page.tsx');

  it('should verify both /app and /src/app directories exist (bug condition)', () => {
    // Verify the bug condition: both directories exist
    expect(fs.existsSync(appDir), '/app directory should exist (bug condition)').toBe(true);
    expect(fs.existsSync(srcAppDir), '/src/app directory should exist').toBe(true);
    
    // Verify both have page.tsx files
    expect(fs.existsSync(appPagePath), '/app/page.tsx should exist (template)').toBe(true);
    expect(fs.existsSync(srcAppPagePath), '/src/app/page.tsx should exist (Camiprint)').toBe(true);
  });

  it('should verify content is different between /app and /src/app', () => {
    const appContent = fs.readFileSync(appPagePath, 'utf-8');
    const srcAppContent = fs.readFileSync(srcAppPagePath, 'utf-8');
    
    // Verify /app contains template content
    expect(appContent).toContain('To get started, edit the page.tsx file');
    expect(appContent).toContain('Deploy Now');
    
    // Verify /src/app contains Camiprint content
    expect(srcAppContent).toContain('Camisetas personalizadas para negocios, restaurantes y empresas');
    expect(srcAppContent).toContain('Ofertas rápidas por cantidad');
    
    // Verify they are different
    expect(appContent).not.toBe(srcAppContent);
  });

  it('should verify Next.js serves content from /src/app only (EXPECTED BEHAVIOR)', () => {
    // This assertion encodes the EXPECTED behavior after the fix
    // On unfixed code, this will FAIL because /app directory exists
    // After fix (removing /app), this will PASS
    
    // Expected behavior: /app should NOT exist
    expect(
      fs.existsSync(appDir),
      'EXPECTED BEHAVIOR: /app directory should NOT exist - Next.js should only use /src/app'
    ).toBe(false);
    
    // Expected behavior: /src/app should exist
    expect(
      fs.existsSync(srcAppDir),
      'EXPECTED BEHAVIOR: /src/app directory should exist as the single source of truth'
    ).toBe(true);
  });

  it('should verify build compiles /src/app content (EXPECTED BEHAVIOR)', () => {
    // This test verifies the expected behavior: build should compile /src/app
    // On unfixed code, this will FAIL because Next.js compiles /app instead
    
    try {
      // Run build and capture output
      const buildOutput = execSync('npm run build', {
        cwd: projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      
      // Expected behavior: build should reference src/app, not just app
      // After fix, the build will compile content from /src/app
      const buildDir = path.join(projectRoot, '.next');
      expect(fs.existsSync(buildDir), 'Build directory should exist').toBe(true);
      
      // Verify the build completed successfully
      expect(buildOutput).toContain('Compiled successfully');
      
      // Expected behavior: /app should not exist (this will fail on unfixed code)
      expect(
        fs.existsSync(appDir),
        'EXPECTED BEHAVIOR: After fix, /app should not exist and build should use /src/app'
      ).toBe(false);
      
    } catch (error: any) {
      // If build fails, that's also a bug indicator
      throw new Error(`Build failed: ${error.message}\nStdout: ${error.stdout}\nStderr: ${error.stderr}`);
    }
  });
});
