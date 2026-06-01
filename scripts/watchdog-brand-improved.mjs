#!/usr/bin/env node

/**
 * WATCHDOG: Validador de brand violations (no depende de ripgrep)
 * 
 * - Detecta uso de "cami" + "print" juntos (legacy branding)
 * - Usa globby (instalado) o glob nativo si está disponible
 * - Falla silenciosamente si globby no existe, pero sigue el build
 * - Altamente resiliente a errores del sistema de archivos Windows
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');

const legacyBrand = 'cami' + 'print';
const forbidden = new RegExp(legacyBrand, 'i');

const roots = [
  'src',
  'public',
  'scripts',
  '__tests__',
  'tests',
  '.env.example',
  'vercel.json',
  'package.json',
  'README.md',
  'RESEND_SETUP.md',
  'GO-LIVE.md',
  'docs/ADMIN_INTEGRATION_GUIDE.md',
  'e2e-tests.spec.ts',
];

const ignored = [
  /(^|[\\/])node_modules([\\/]|$)/,
  /(^|[\\/])\.next([\\/]|$)/,
  /(^|[\\/])coverage([\\/]|$)/,
  /(^|[\\/])playwright-report([\\/]|$)/,
  /(^|[\\/])test-results([\\/]|$)/,
  /(^|[\\/])\.git([\\/]|$)/,
  /\.md$/i, // Skip markdown files (docs, guides, etc.)
];

let filesChecked = 0;
let violationsFound = 0;

/**
 * Camina recursivamente el árbol de directorios usando Node.js nativo
 */
function walkDirectory(dir, callback) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(projectRoot, fullPath);

      // Skip ignored patterns
      if (ignored.some((pattern) => pattern.test(relativePath))) {
        continue;
      }

      if (entry.isDirectory()) {
        walkDirectory(fullPath, callback);
      } else if (entry.isFile()) {
        callback(fullPath, relativePath);
      }
    }
  } catch (err) {
    // Silenciosamente ignorar errores de permisos o acceso
    // (ej: archivos de sistema, permisos restringidos, etc.)
  }
}

/**
 * Verifica un archivo por violaciones de brand
 */
function checkFile(absolutePath, relativePath) {
  filesChecked++;

  try {
    // Limitar lectura a archivos pequeños (< 5MB)
    const stats = statSync(absolutePath);
    if (stats.size > 5 * 1024 * 1024) {
      return;
    }

    const content = readFileSync(absolutePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const [lineNum, line] of lines.entries()) {
      if (forbidden.test(line)) {
        console.warn(`⚠️  Found legacy brand in ${relativePath}:${lineNum + 1}`);
        console.warn(`   ${line.trim().substring(0, 80)}`);
        violationsFound++;
      }
    }
  } catch (err) {
    // Ignorar archivos que no se puedan leer (binarios, permisos, etc.)
  }
}

/**
 * Main
 */
console.log(`🔍 Scanning for legacy brand violations ("${legacyBrand}")...`);

for (const root of roots) {
  const fullPath = join(projectRoot, root);
  try {
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkDirectory(fullPath, checkFile);
    } else if (stat.isFile()) {
      const relativePath = relative(projectRoot, fullPath);
      checkFile(fullPath, relativePath);
    }
  } catch (err) {
    // File/dir no existe, ignorar
  }
}

console.log(`✅ Scanned ${filesChecked} files`);

if (violationsFound > 0) {
  console.error(`❌ Found ${violationsFound} violation(s)! Please remove legacy brand references.`);
  process.exit(1);
}

console.log(`✅ No legacy brand violations found!`);
process.exit(0);
