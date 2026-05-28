#!/usr/bin/env node
/**
 * check-vercel-env-build.mjs
 * Validación de env vars durante el BUILD de Vercel (process.env disponible).
 * No requiere VERCEL_TOKEN — las variables ya están inyectadas por Vercel.
 * Sale con código 1 si falta alguna variable crítica para abortar el build.
 */

const REQUIRED_BY_ENV = {
  production: [
    'DATABASE_URL',
    'ADMIN_AUTH_TOKEN',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
  ],
  preview: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ],
};

const vercelEnv = (process.env.VERCEL_ENV || '').toLowerCase();
const isProductionBuild = vercelEnv === 'production';
const required = isProductionBuild
  ? REQUIRED_BY_ENV.production
  : REQUIRED_BY_ENV.preview;

const missing = required.filter((k) => !process.env[k]?.trim());

if (missing.length > 0) {
  const envLabel = isProductionBuild ? 'production' : (vercelEnv || 'preview/dev');
  console.error(`\n❌ BUILD ABORTADO (${envLabel}) — Faltan variables de entorno críticas:`);
  missing.forEach((k) => console.error(`   • ${k}`));
  console.error('\nAñádelas en Vercel Dashboard → Settings → Environment Variables.\n');
  process.exit(1);
}

const envLabel = isProductionBuild ? 'production' : (vercelEnv || 'preview/dev');
console.log(`✅ Todas las variables críticas para ${envLabel} están presentes — continuando build...`);
