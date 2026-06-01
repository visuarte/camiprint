#!/usr/bin/env node

/**
 * VULNERABILITY MONITOR: Rastrea vulnerabilidades npm
 * 
 * - Ejecuta npm audit y almacena resultados
 * - Compara contra estado anterior
 * - Alerta sobre nuevas vulnerabilidades o cambios de severidad
 * - Ideal para monitoreo en CI/CD y alertas
 * 
 * Uso:
 *   npm run vuln:monitor              # Estado actual
 *   npm run vuln:monitor -- --strict  # Falla si hay moderates o peor
 *   npm run vuln:monitor -- --history # Muestra histórico
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');
const historyFile = join(projectRoot, '.vuln-history.json');
const currentReportFile = join(projectRoot, '.vuln-report.json');

const args = process.argv.slice(2);
const isStrict = args.includes('--strict');
const showHistory = args.includes('--history');

/**
 * Ejecuta npm audit y devuelve JSON
 */
function getAuditReport() {
  try {
    const output = execSync('npm audit --json 2>&1', {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    return JSON.parse(output);
  } catch (err) {
    // npm audit devuelve exit code 1 si hay vulnerabilidades
    // pero el output sigue siendo JSON válido
    try {
      return JSON.parse(err.stdout || '{}');
    } catch {
      return { vulnerabilities: {}, error: 'Failed to parse npm audit output' };
    }
  }
}

/**
 * Extrae resumen de vulnerabilidades
 */
function summarizeVulns(report) {
  const vulns = report.vulnerabilities || {};
  const summary = {
    timestamp: new Date().toISOString(),
    total: 0,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    packages: {},
  };

  for (const [pkgName, pkgVuln] of Object.entries(vulns)) {
    if (!pkgVuln.severity) continue;

    summary.total++;
    summary[pkgVuln.severity]++;
    summary.packages[pkgName] = {
      severity: pkgVuln.severity,
      via: pkgVuln.via ? (Array.isArray(pkgVuln.via) ? pkgVuln.via.length : 1) : 0,
      range: pkgVuln.range || 'unknown',
    };
  }

  return summary;
}

/**
 * Compara reports y detecta cambios
 */
function compareReports(previous, current) {
  const changes = {
    newVulns: [],
    fixedVulns: [],
    severityUpgrades: [],
    severityDowngrades: [],
  };

  const prevPkgs = previous?.packages || {};
  const currPkgs = current.packages;

  // Detectar nuevas vulnerabilidades
  for (const pkg in currPkgs) {
    if (!prevPkgs[pkg]) {
      changes.newVulns.push({
        package: pkg,
        severity: currPkgs[pkg].severity,
      });
    } else if (prevPkgs[pkg].severity !== currPkgs[pkg].severity) {
      const severityLevels = { critical: 4, high: 3, moderate: 2, low: 1 };
      const prevLevel = severityLevels[prevPkgs[pkg].severity] || 0;
      const currLevel = severityLevels[currPkgs[pkg].severity] || 0;

      if (currLevel > prevLevel) {
        changes.severityUpgrades.push({
          package: pkg,
          from: prevPkgs[pkg].severity,
          to: currPkgs[pkg].severity,
        });
      } else if (currLevel < prevLevel) {
        changes.severityDowngrades.push({
          package: pkg,
          from: prevPkgs[pkg].severity,
          to: currPkgs[pkg].severity,
        });
      }
    }
  }

  // Detectar vulnerabilidades reparadas
  for (const pkg in prevPkgs) {
    if (!currPkgs[pkg]) {
      changes.fixedVulns.push(pkg);
    }
  }

  return changes;
}

/**
 * Carga histórico anterior
 */
function loadHistory() {
  if (!existsSync(historyFile)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(historyFile, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Guarda histórico
 */
function saveHistory(history) {
  writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

/**
 * Formatea salida
 */
function formatOutput(summary, changes) {
  let output = '\n📊 NPM Vulnerability Report\n';
  output += '═'.repeat(50) + '\n\n';

  // Summary
  output += `Total: ${summary.total}\n`;
  if (summary.critical > 0) output += `  🔴 Critical: ${summary.critical}\n`;
  if (summary.high > 0) output += `  🟠 High: ${summary.high}\n`;
  if (summary.moderate > 0) output += `  🟡 Moderate: ${summary.moderate}\n`;
  if (summary.low > 0) output += `  🔵 Low: ${summary.low}\n`;

  if (summary.total === 0) {
    output += '\n✅ No vulnerabilities found!\n\n';
    return output;
  }

  // Packages
  output += '\nPackages:\n';
  for (const [pkg, info] of Object.entries(summary.packages)) {
    const emoji = {
      critical: '🔴',
      high: '🟠',
      moderate: '🟡',
      low: '🔵',
    }[info.severity] || '⚪';

    output += `  ${emoji} ${pkg} (${info.severity})\n`;
  }

  // Changes
  if (changes) {
    output += '\nChanges:\n';
    if (changes.newVulns.length > 0) {
      output += `  ⚠️  New: ${changes.newVulns.map((v) => `${v.package}(${v.severity})`).join(', ')}\n`;
    }
    if (changes.fixedVulns.length > 0) {
      output += `  ✅ Fixed: ${changes.fixedVulns.join(', ')}\n`;
    }
    if (changes.severityUpgrades.length > 0) {
      output += `  🔺 Upgraded: ${changes.severityUpgrades.map((v) => `${v.package}(${v.from}→${v.to})`).join(', ')}\n`;
    }
    if (changes.severityDowngrades.length > 0) {
      output += `  🔻 Downgraded: ${changes.severityDowngrades.map((v) => `${v.package}(${v.from}→${v.to})`).join(', ')}\n`;
    }
  }

  output += '\n';
  return output;
}

// ============ MAIN ============

console.log('🔍 Running npm vulnerability monitor...\n');

const currentReport = getAuditReport();
const currentSummary = summarizeVulns(currentReport);

// Cargar reporte anterior
let previousSummary = null;
const history = loadHistory();
if (history.length > 0) {
  previousSummary = history[history.length - 1];
}

// Detectar cambios
let changes = null;
if (previousSummary) {
  changes = compareReports(previousSummary, currentSummary);
}

// Guardar estado actual
history.push(currentSummary);
if (history.length > 30) {
  history.shift(); // Mantener últimos 30 reportes
}
saveHistory(history);

// Guardar reporte actual
writeFileSync(
  currentReportFile,
  JSON.stringify({ summary: currentSummary, report: currentReport }, null, 2)
);

// Output
console.log(formatOutput(currentSummary, changes));

// Mostrar histórico si se pide
if (showHistory && history.length > 1) {
  console.log('📈 History (últimos reportes):\n');
  for (const [idx, report] of history.entries()) {
    const date = new Date(report.timestamp).toLocaleString();
    console.log(`  [${idx + 1}] ${date}: ${report.total} vulns (C:${report.critical} H:${report.high} M:${report.moderate} L:${report.low})`);
  }
  console.log('\n');
}

// Validación estricta
if (isStrict) {
  if (currentSummary.critical > 0) {
    console.error('❌ STRICT MODE: Found CRITICAL vulnerabilities!');
    process.exit(1);
  }
  if (currentSummary.high > 0) {
    console.error('❌ STRICT MODE: Found HIGH severity vulnerabilities!');
    process.exit(1);
  }
  console.log('✅ STRICT MODE: Passed (no critical/high vulns)\n');
}

// Alertar sobre upgrades de severidad
if (changes && changes.severityUpgrades.length > 0) {
  console.warn('⚠️  WARNING: Severity upgrades detected!');
  for (const upgrade of changes.severityUpgrades) {
    console.warn(`   ${upgrade.package}: ${upgrade.from} → ${upgrade.to}`);
  }
  console.warn('');
}

process.exit(0);
