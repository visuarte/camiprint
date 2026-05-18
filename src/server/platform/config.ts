export type QuoteRepositoryDriver = 'json' | 'postgres';
export type RateLimitStoreDriver = 'memory' | 'redis';

export interface PlatformConfig {
  quoteRepositoryDriver: QuoteRepositoryDriver;
  databaseUrl: string | null;
  rateLimitStoreDriver: RateLimitStoreDriver;
  redisUrl: string | null;
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

export const getPlatformConfig = (): PlatformConfig => {
  const quoteRepositoryDriver = normalizeQuoteRepositoryDriver(process.env.QUOTES_REPOSITORY_DRIVER);
  const databaseUrl = process.env.DATABASE_URL?.trim() || null;
  const rateLimitStoreDriver = normalizeRateLimitStoreDriver(process.env.RATE_LIMIT_STORE_DRIVER);
  const redisUrl = process.env.REDIS_URL?.trim() || null;

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
  };
};