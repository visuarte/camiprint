export type QuoteRepositoryDriver = 'json' | 'postgres';

export interface PlatformConfig {
  quoteRepositoryDriver: QuoteRepositoryDriver;
  databaseUrl: string | null;
}

const normalizeQuoteRepositoryDriver = (value: string | undefined): QuoteRepositoryDriver => {
  if (!value) return 'json';

  if (value === 'json' || value === 'postgres') {
    return value;
  }

  throw new Error(`QUOTES_REPOSITORY_DRIVER invalido: ${value}`);
};

export const getPlatformConfig = (): PlatformConfig => {
  const quoteRepositoryDriver = normalizeQuoteRepositoryDriver(process.env.QUOTES_REPOSITORY_DRIVER);
  const databaseUrl = process.env.DATABASE_URL?.trim() || null;

  if (quoteRepositoryDriver === 'postgres' && !databaseUrl) {
    throw new Error('DATABASE_URL es obligatorio cuando QUOTES_REPOSITORY_DRIVER=postgres');
  }

  return {
    quoteRepositoryDriver,
    databaseUrl,
  };
};