/**
 * Next.js instrumentation hook — se ejecuta una sola vez al arrancar el servidor.
 * Valida que las variables de entorno críticas existan; registra warnings/errors
 * en logs de Vercel sin exponer valores.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const REQUIRED: string[] = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
  ];

  const WARN_IF_MISSING: string[] = [
    'STRIPE_PUBLIC_KEY',
    'RESEND_FROM_NAME',
  ];

  const missing = REQUIRED.filter((k) => !process.env[k]?.trim());
  const warned  = WARN_IF_MISSING.filter((k) => !process.env[k]?.trim());

  if (missing.length > 0) {
    console.error(
      `[startup] ❌ VARIABLES CRÍTICAS FALTANTES: ${missing.join(', ')}` +
      ' — La app puede fallar en producción. Añádelas en Vercel Dashboard.'
    );
  }

  if (warned.length > 0) {
    console.warn(
      `[startup] ⚠️  Variables opcionales no definidas: ${warned.join(', ')}`
    );
  }

  if (missing.length === 0 && warned.length === 0) {
    console.info('[startup] ✅ Todas las variables de entorno requeridas están presentes.');
  }
}
