import type { IRateLimitStore, RateBucket } from './rate-limit.store';

const GLOBAL_KEY = '__camiart_rate_limit_store__';

const getMap = (): Map<string, RateBucket> => {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Map<string, RateBucket>;
  };

  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map();
  }

  return g[GLOBAL_KEY];
};

export class InMemoryRateLimitStore implements IRateLimitStore {
  async get(key: string): Promise<RateBucket | null> {
    return getMap().get(key) ?? null;
  }

  async set(key: string, bucket: RateBucket, _ttlMs: number): Promise<void> {
    getMap().set(key, bucket);
  }

  reset(): void {
    const g = globalThis as typeof globalThis & {
      [GLOBAL_KEY]?: Map<string, RateBucket>;
    };
    g[GLOBAL_KEY] = new Map();
  }
}

let instance: InMemoryRateLimitStore | null = null;

export const getInMemoryRateLimitStore = (): InMemoryRateLimitStore => {
  if (!instance) {
    instance = new InMemoryRateLimitStore();
  }
  return instance;
};
