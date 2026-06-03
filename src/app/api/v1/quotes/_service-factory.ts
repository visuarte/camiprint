import { QuotesService } from '@/server/quotes/service';

const GLOBAL_KEY = '__camiart_quotes_service_factory__';

export type QuotesServiceFactory = () => QuotesService;

export const getQuotesServiceFactory = (): QuotesServiceFactory => {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: QuotesServiceFactory;
  };

  return g[GLOBAL_KEY] ?? (() => new QuotesService());
};

export const __setQuotesServiceFactoryForTests = (factory: QuotesServiceFactory): void => {
  if (process.env.NODE_ENV !== 'test') return;

  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: QuotesServiceFactory;
  };

  g[GLOBAL_KEY] = factory;
};

export const __resetQuotesServiceFactoryForTests = (): void => {
  if (process.env.NODE_ENV !== 'test') return;

  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: QuotesServiceFactory;
  };

  delete g[GLOBAL_KEY];
};
