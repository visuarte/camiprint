#!/usr/bin/env node
/**
 * check-vercel-env.mjs
 * Comprueba que las variables de entorno requeridas existen en Vercel
 * antes de desplegar. Sale con código 1 si falta alguna crítica.
 *
 * Uso:
 *   node scripts/check-vercel-env.mjs
 * Variables de entorno esperadas (en tu shell, NO en .env):
 *   VERCEL_TOKEN         — Token personal de Vercel
 *   VERCEL_PROJECT_ID    — ID del proyecto (prj_...)
 *   VERCEL_TEAM_ID       — (opcional) ID del equipo si aplica
 */

const REQUIRED = [
  'DATABASE_URL',
  'ADMIN_AUTH_TOKEN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'CRON_SECRET',
];

const token     = process.env.VERCEL_TOKEN;
const projectId = process.env.VERCEL_PROJECT_ID;
const teamId    = process.env.VERCEL_TEAM_ID ?? '';

if (!token || !projectId) {
  console.error('❌ Debes definir VERCEL_TOKEN y VERCEL_PROJECT_ID en tu shell.');
  process.exit(1);
}

const teamQuery = teamId ? `?teamId=${teamId}` : '';
const url = `https://api.vercel.com/v9/projects/${projectId}/env${teamQuery}`;

console.log(`🔍 Verificando env vars en Vercel para proyecto ${projectId}...`);

let envs;
try {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`❌ Error al obtener env vars: ${res.status} — ${body}`);
    process.exit(1);
  }
  const data = await res.json();
  envs = data.envs ?? [];
} catch (err) {
  console.error('❌ Error de red:', err.message);
  process.exit(1);
}

const prodKeys = new Set(
  envs
    .filter((e) => e.target?.includes('production'))
    .map((e) => e.key)
);

const missing = REQUIRED.filter((k) => !prodKeys.has(k));
const present = REQUIRED.filter((k) => prodKeys.has(k));

present.forEach((k) => console.log(`  ✅ ${k}`));
missing.forEach((k) => console.error(`  ❌ FALTA: ${k}`));

if (missing.length > 0) {
  console.error(`\n❌ Faltan ${missing.length} variable(s) crítica(s). Deploy abortado.`);
  process.exit(1);
}

console.log('\n✅ Todas las variables críticas existen en Vercel (production). Puedes desplegar.');
