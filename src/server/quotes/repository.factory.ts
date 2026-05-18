import type { QuoteRepository } from '@/server/quotes/contracts';
import { getPlatformConfig } from '@/server/platform/config';
import { PostgresQuotesRepository } from '@/server/quotes/postgres.repository';
import { QuotesRepository } from '@/server/quotes/repository';

const GLOBAL_REPOSITORY_FACTORY_KEY = '__camiart_quote_repository_factory__';

export type QuoteRepositoryFactory = () => QuoteRepository;

const createDefaultQuoteRepositoryFactory = (): QuoteRepositoryFactory => {
  const { quoteRepositoryDriver } = getPlatformConfig();

  if (quoteRepositoryDriver === 'postgres') {
    return () => new PostgresQuotesRepository();
  }

  return () => new QuotesRepository();
};

export const getQuoteRepositoryFactory = (): QuoteRepositoryFactory => {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_REPOSITORY_FACTORY_KEY]?: QuoteRepositoryFactory;
  };

  return globalScope[GLOBAL_REPOSITORY_FACTORY_KEY] ?? createDefaultQuoteRepositoryFactory();
};

export const createQuoteRepository = (): QuoteRepository => getQuoteRepositoryFactory()();

export const __setQuoteRepositoryFactoryForTests = (factory: QuoteRepositoryFactory) => {
  if (process.env.NODE_ENV !== 'test') return;

  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_REPOSITORY_FACTORY_KEY]?: QuoteRepositoryFactory;
  };

  globalScope[GLOBAL_REPOSITORY_FACTORY_KEY] = factory;
};

export const __resetQuoteRepositoryFactoryForTests = () => {
  if (process.env.NODE_ENV !== 'test') return;

  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_REPOSITORY_FACTORY_KEY]?: QuoteRepositoryFactory;
  };

  delete globalScope[GLOBAL_REPOSITORY_FACTORY_KEY];
};