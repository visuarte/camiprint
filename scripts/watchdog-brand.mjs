#!/usr/bin/env node

import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

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
];

const rg = spawnSync('rg', ['--files', ...roots], {
  cwd: process.cwd(),
  encoding: 'utf8',
});

if (rg.status !== 0 && !rg.stdout) {
  console.error(rg.stderr || 'Unable to list files for brand watchdog.');
  process.exit(1);
}

const matches = [];
for (const relativePath of rg.stdout.split(/\r?\n/).filter(Boolean)) {
  if (ignored.some((pattern) => pattern.test(relativePath))) continue;

  const absolutePath = join(process.cwd(), relativePath);
  let stats;
  try {
    stats = statSync(absolutePath);
  } catch {
    continue;
  }
  if (!stats.isFile() || stats.size > 2_000_000) continue;

  const content = readFileSync(absolutePath, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (forbidden.test(line)) {
      matches.push(`${relativePath}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (matches.length > 0) {
  console.error('Brand watchdog failed: forbidden legacy brand references remain in active surfaces.');
  for (const match of matches.slice(0, 80)) {
    console.error(`- ${match}`);
  }
  if (matches.length > 80) {
    console.error(`...and ${matches.length - 80} more`);
  }
  process.exit(1);
}

console.log('Brand watchdog passed: active surfaces use Camiart.');
