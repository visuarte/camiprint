import type { IRateLimitStore, RateBucket } from './rate-limit.store';

const GLOBAL_KEY = '__camiart_rate_limit_store__';
const CLEANUP_INTERVAL_MS = 60_000;

const getMap = (): Map<string, RateBucket> => {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Map<string, RateBucket>;
  };

  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map();
  }

  return g[GLOBAL_KEY];
};

const startCleanupInterval = (): void => {
  const g = globalThis as typeof globalThis & {
    __camiart_rate_limit_cleanup_timer__?: ReturnType<typeof setInterval>;
  };

  if (!g.__camiart_rate_limit_cleanup_timer__) {
    g.__camiart_rate_limit_cleanup_timer__ = setInterval(() => {
      const now = Date.now();
      const map = getMap();
      for (const [key, bucket] of map) {
        const valid = bucket.timestamps.filter((ts) => now - ts < CLEANUP_INTERVAL_MS);
        if (valid.length === 0) {
          map.delete(key);
        } else {
          map.set(key, { timestamps: valid });
        }
      }
    }, CLEANUP_INTERVAL_MS);

    if (g.__camiart_rate_limit_cleanup_timer__ && typeof g.__camiart_rate_limit_cleanup_timer__.unref === 'function') {
      g.__camiart_rate_limit_cleanup_timer__.unref();
    }
  }
};

export class InMemoryRateLimitStore implements IRateLimitStore {
  async get(key: string): Promise<RateBucket | null> {
    return getMap().get(key) ?? null;
  }

  async set(key: string, bucket: RateBucket, _ttlMs: number): Promise<void> {
    getMap().set(key, bucket);
    startCleanupInterval();
  }

  reset(): void {
    const g = globalThis as typeof globalThis & {
      [GLOBAL_KEY]?: Map<string, RateBucket>;
      __camiart_rate_limit_cleanup_timer__?: ReturnType<typeof setInterval>;
    };
    if (g.__camiart_rate_limit_cleanup_timer__) {
      clearInterval(g.__camiart_rate_limit_cleanup_timer__);
      g.__camiart_rate_limit_cleanup_timer__ = undefined;
    }
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
