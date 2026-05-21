export type QuoteRepositoryDriver = 'json' | 'postgres';
export type RateLimitStoreDriver = 'memory' | 'redis';

export interface PlatformConfig {
  quoteRepositoryDriver: QuoteRepositoryDriver;
  databaseUrl: string | null;
  rateLimitStoreDriver: RateLimitStoreDriver;
  redisUrl: string | null;
  /** Token para acceso al endpoint /metrics. Null = sin protección (solo dev). */
  metricsToken: string | null;
  /** Número de proxies de confianza delante de la aplicación. Default 1. */
  trustedProxyCount: number;
}

const normalizeQuoteRepositoryDriver = (value: string | undefined): QuoteRepositoryDriver => {
  if (!value) return 'json';

  if (value === 'json' || value === 'postgres') {
    return value;
  }

  throw new Error(`QUOTES_REPOSITORY_DRIVER invalido: ${value}`);
};

const normalizeRateLimitStoreDriver = (value: string | undefined): RateLimitStoreDriver => {
  if (!value) return 'memory';
  if (value === 'memory' || value === 'redis') return value;
  throw new Error(`RATE_LIMIT_STORE_DRIVER invalido: ${value}`);
};

export const getDatabaseUrlFromEnv = (): string | null => {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    null
  );
};

export const getPlatformConfig = (): PlatformConfig => {
  const quoteRepositoryDriver = normalizeQuoteRepositoryDriver(process.env.QUOTES_REPOSITORY_DRIVER);
  const databaseUrl = getDatabaseUrlFromEnv();
  const rateLimitStoreDriver = normalizeRateLimitStoreDriver(process.env.RATE_LIMIT_STORE_DRIVER);
  const redisUrl = process.env.REDIS_URL?.trim() || null;
  const metricsToken = process.env.METRICS_TOKEN?.trim() || null;
  const trustedProxyCount = Math.max(1, parseInt(process.env.TRUSTED_PROXY_COUNT ?? '1', 10) || 1);

  if (quoteRepositoryDriver === 'postgres' && !databaseUrl) {
    throw new Error('DATABASE_URL es obligatorio cuando QUOTES_REPOSITORY_DRIVER=postgres');
  }

  if (rateLimitStoreDriver === 'redis' && !redisUrl) {
    throw new Error('REDIS_URL es obligatorio cuando RATE_LIMIT_STORE_DRIVER=redis');
  }

  return {
    quoteRepositoryDriver,
    databaseUrl,
    rateLimitStoreDriver,
    redisUrl,
    metricsToken,
    trustedProxyCount,
  };
};
