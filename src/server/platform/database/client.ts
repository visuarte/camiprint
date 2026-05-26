import type { Pool } from 'pg';
import { getPlatformConfig } from '@/server/platform/config';

const GLOBAL_PG_POOL_KEY = '__camiart_pg_pool__';

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
      connectionString: databaseUrl,
      max: 10,
      ssl: { rejectUnauthorized: false },
    });
  }

  return globalScope[GLOBAL_PG_POOL_KEY];
};