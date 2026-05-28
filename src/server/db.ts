import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getDatabaseUrlFromEnv } from '@/server/platform/config';

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Builds the SSL config for pg Pool.
 *
 * Priority order:
 * 1. SUPABASE_CA_CERT env var (base64-encoded PEM) — used in production (Vercel).
 * 2. NODE_ENV !== 'production' — disable cert verification for local dev only.
 * 3. Default: strict verification (safest fallback).
 *
 * To obtain the Supabase CA cert:
 *   Dashboard → Project Settings → Database → SSL Certificate → Download
 * Then encode it: `base64 -w0 prod-ca-2021.crt`
 * Set SUPABASE_CA_CERT in Vercel Dashboard and remove NODE_TLS_REJECT_UNAUTHORIZED.
 */
function buildSslConfig(): { rejectUnauthorized: boolean; ca?: string } {
  const caCertB64 = process.env.SUPABASE_CA_CERT?.trim();
  if (caCertB64) {
    return {
      rejectUnauthorized: true,
      ca: Buffer.from(caCertB64, 'base64').toString('utf8'),
    };
  }
  if (process.env.NODE_ENV !== 'production') {
    return { rejectUnauthorized: false };
  }
  return { rejectUnauthorized: true };
}

function sanitizeConnectionString(connectionString: string): string {
  return connectionString
    .replace(/[?&]sslmode=[^&]*/g, '')
    .replace(/[?&]pgbouncer=[^&]*/g, '')
    .replace(/[?&]application_name=[^&]*/g, '');
}

let cachedPrisma: PrismaClient | undefined;

const getPrismaClient = (): PrismaClient => {
  if (cachedPrisma) return cachedPrisma;

  const databaseUrl = getDatabaseUrlFromEnv();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString: sanitizeConnectionString(databaseUrl), ssl: buildSslConfig() });
  const adapter = new PrismaPg(pool);

  cachedPrisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = cachedPrisma;
  }

  return cachedPrisma;
};

// Lazy proxy - PrismaClient is only instantiated when accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
});
