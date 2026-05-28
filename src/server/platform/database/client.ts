import type { Pool } from 'pg';
import { getPlatformConfig } from '@/server/platform/config';

const GLOBAL_PG_POOL_KEY = '__camiart_pg_pool__';

/**
 * Builds the SSL config for pg Pool.
 * See src/server/db.ts for full documentation.
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

const loadPgPoolConstructor = async (): Promise<typeof import('pg').Pool> => {
  // pg está en serverExternalPackages — ambos bundlers (webpack y Turbopack) lo tratan como externo
  const pgModule = await import('pg');
  return pgModule.Pool;
};

export const getPostgresPool = async (): Promise<Pool> => {
  const { databaseUrl } = getPlatformConfig();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL no configurado para PostgreSQL');
  }

  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_PG_POOL_KEY]?: Pool;
  };

  if (!globalScope[GLOBAL_PG_POOL_KEY]) {
    const Pool = await loadPgPoolConstructor();

    globalScope[GLOBAL_PG_POOL_KEY] = new Pool({
      connectionString: sanitizeConnectionString(databaseUrl),
      max: 10,
      ssl: buildSslConfig(),
    });
  }

  return globalScope[GLOBAL_PG_POOL_KEY];
};