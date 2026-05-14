const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

interface RateBucket {
  timestamps: number[];
}

const GLOBAL_RATE_LIMIT_STORE_KEY = '__camiprint_rate_limit_store__';

const getStore = (): Map<string, RateBucket> => {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_RATE_LIMIT_STORE_KEY]?: Map<string, RateBucket>;
  };

  if (!globalScope[GLOBAL_RATE_LIMIT_STORE_KEY]) {
    globalScope[GLOBAL_RATE_LIMIT_STORE_KEY] = new Map();
  }

  return globalScope[GLOBAL_RATE_LIMIT_STORE_KEY];
};

export const getQuoteClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwardedFor) return forwardedFor;

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return 'unknown';
};

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export const checkQuoteRateLimit = (request: Request): RateLimitResult => {
  const now = Date.now();
  const clientIp = getQuoteClientIp(request);
  const store = getStore();

  const bucket = store.get(clientIp) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    const oldestTimestamp = bucket.timestamps[0];
    const retryAfterMs = Math.max(WINDOW_MS - (now - oldestTimestamp), 1_000);
    store.set(clientIp, bucket);

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1_000),
    };
  }

  bucket.timestamps.push(now);
  store.set(clientIp, bucket);

  return { allowed: true, retryAfterSeconds: 0 };
};

export const __resetQuoteRateLimitForTests = (): void => {
  if (process.env.NODE_ENV !== 'test') return;

  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_RATE_LIMIT_STORE_KEY]?: Map<string, RateBucket>;
  };

  globalScope[GLOBAL_RATE_LIMIT_STORE_KEY] = new Map();
};
