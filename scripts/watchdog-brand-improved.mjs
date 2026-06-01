#!/usr/bin/env node

/**
 * WATCHDOG: Validador de brand violations (no depende de ripgrep)
 * 
 * - Detecta uso de "cami print" (legacy, dos palabras)
 * - Permite "Camiprint" y "CamiArt" (marcas oficiales, una palabra)
 * - Ignora archivos de documentación (.md, tests históricos, etc.)
 * - Usa globby (instalado) o glob nativo si está disponible
 * - Falla silenciosamente si globby no existe, pero sigue el build
 * - Altamente resiliente a errores del sistema de archivos Windows
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');

// Legacy brand detection: "cami print" (two words) or "cami-print" (hyphenated)
// But allow "Camiprint" (one word, official brand) and "camiart" (new official brand)
const legacyPatterns = [
  /cami[\s\-]print/i,       // "cami print" or "cami-print"
];

// But whitelist official brands
const whitelistPatterns = [
  /Camiprint/,              // Official: Camiprint (one word)
  /camiart/i,               // Official: CamiArt (new brand)
];

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
];

const ignored = [
  /(^|[\\/])node_modules([\\/]|$)/,
  /(^|[\\/])\.next([\\/]|$)/,
  /(^|[\\/])coverage([\\/]|$)/,
  /(^|[\\/])playwright-report([\\/]|$)/,
  /(^|[\\/])test-results([\\/]|$)/,
  /(^|[\\/])\.git([\\/]|$)/,
  /\.md$/i,                 // Skip markdown (docs, guides, historical records)
  /GO-LIVE\.md$/i,          // Skip Go-Live guide (historical)
  /ADMIN_INTEGRATION_GUIDE\.md$/i, // Skip admin guide (historical)
  /e2e-tests\.spec\.ts$/i,  // Skip E2E tests (examples/docs)
  /watchdog-brand/i,        // Skip watchdog script itself (meta detection)
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
      // Check if line contains legacy brand patterns
      let hasLegacy = false;
      for (const pattern of legacyPatterns) {
        if (pattern.test(line)) {
          hasLegacy = true;
          break;
        }
      }

      if (!hasLegacy) continue;

      // Check if it's whitelisted (official brand)
      let isWhitelisted = false;
      for (const pattern of whitelistPatterns) {
        if (pattern.test(line)) {
          isWhitelisted = true;
          break;
        }
      }

      if (isWhitelisted) continue; // Skip whitelisted official brands

      console.warn(`⚠️  Found legacy brand in ${relativePath}:${lineNum + 1}`);
      console.warn(`   ${line.trim().substring(0, 80)}`);
      violationsFound++;
    }
  } catch (err) {
    // Ignorar archivos que no se puedan leer (binarios, permisos, etc.)
  }
}

// ============ MAIN ============

console.log(`🔍 Scanning for legacy brand references ("cami print")...`);
console.log(`   Whitelisting official brands: "Camiprint", "CamiArt"\n`);

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
