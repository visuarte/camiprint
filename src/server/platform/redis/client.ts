import Redis from 'ioredis';

const GLOBAL_KEY = '__camiprint_redis_client__';

export const getRedisClient = (redisUrl: string): Redis => {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Redis;
  };

  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  return g[GLOBAL_KEY];
};
