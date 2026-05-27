#!/usr/bin/env node
/**
 * check-vercel-env-build.mjs
 * Validación de env vars durante el BUILD de Vercel (process.env disponible).
 * No requiere VERCEL_TOKEN — las variables ya están inyectadas por Vercel.
 * Sale con código 1 si falta alguna variable crítica para abortar el build.
 */

const REQUIRED = [
  'DATABASE_URL',
  'ADMIN_AUTH_TOKEN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
];

const missing = REQUIRED.filter((k) => !process.env[k]?.trim());

if (missing.length > 0) {
  console.error('\n❌ BUILD ABORTADO — Faltan variables de entorno críticas:');
  missing.forEach((k) => console.error(`   • ${k}`));
  console.error('\nAñádelas en Vercel Dashboard → Settings → Environment Variables.\n');
  process.exit(1);
}

console.log('✅ Todas las variables críticas están presentes — continuando build...');
