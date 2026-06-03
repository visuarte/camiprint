import { getPlatformConfig } from '@/server/platform/config';
import { getInMemoryRateLimitStore } from './in-memory-rate-limit.store';
import type { IRateLimitStore } from './rate-limit.store';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const GLOBAL_STORE_KEY = '__camiart_rate_limit_store_instance__';

const getRateLimitStore = async (): Promise<IRateLimitStore> => {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_STORE_KEY]?: IRateLimitStore;
  };

  if (!g[GLOBAL_STORE_KEY]) {
    const config = getPlatformConfig();

    if (config.rateLimitStoreDriver === 'redis' && config.redisUrl) {
      const [{ getRedisClient }, { RedisRateLimitStore }] = await Promise.all([
        import('@/server/platform/redis/client'),
        import('./redis-rate-limit.store'),
      ]);
      g[GLOBAL_STORE_KEY] = new RedisRateLimitStore(getRedisClient(config.redisUrl));
    } else {
      g[GLOBAL_STORE_KEY] = getInMemoryRateLimitStore();
    }
  }

  return g[GLOBAL_STORE_KEY];
};

/**
 * Extrae la IP real del cliente respetando el número de proxies de confianza.
 * Con trustedProxyCount=1 (default), confía en el último hop del x-forwarded-for.
 * Con trustedProxyCount=0 o sin header, devuelve 'unknown'.
 */
export const getQuoteClientIp = (request: Request): string => {
  const config = getPlatformConfig();
  const count = config.trustedProxyCount;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor && count > 0) {
    const hops = forwardedFor.split(',').map((h) => h.trim());
    // El proxy más a la derecha que hemos insertado nosotros es el confiable;
    // el cliente real está count posiciones desde la derecha.
    const clientIndex = Math.max(hops.length - count, 0);
    const ip = hops[clientIndex];
    if (ip) return ip;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp && count > 0) return realIp;

  return 'unknown';
};

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export const checkQuoteRateLimit = async (request: Request): Promise<RateLimitResult> => {
  const now = Date.now();
  const clientIp = getQuoteClientIp(request);
  const store = await getRateLimitStore();

  const bucket = await store.get(clientIp) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    const oldestTimestamp = bucket.timestamps[0];
    const retryAfterMs = Math.max(WINDOW_MS - (now - oldestTimestamp), 1_000);
    await store.set(clientIp, bucket, WINDOW_MS);

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1_000),
    };
  }

  bucket.timestamps.push(now);
  await store.set(clientIp, bucket, WINDOW_MS);

  return { allowed: true, retryAfterSeconds: 0 };
};

export const __resetQuoteRateLimitForTests = (): void => {
  if (process.env.NODE_ENV !== 'test') return;

  getInMemoryRateLimitStore().reset();

  const g = globalThis as typeof globalThis & {
    [GLOBAL_STORE_KEY]?: IRateLimitStore;
  };
  g[GLOBAL_STORE_KEY] = undefined;
};

