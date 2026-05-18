import type Redis from 'ioredis';
import type { IRateLimitStore, RateBucket } from './rate-limit.store';

/**
 * Store Redis para sliding-window rate limiting.
 *
 * Persiste el bucket como JSON con TTL ajustado a la ventana de tiempo.
 * El algoritmo de sliding window reside en rate-limit.ts.
 *
 * Nota: entre get y set existe una carrera teórica en multi-réplica. En la
 * práctica, para ventanas de 60 s y límite de 5 req, el impacto es 1-2
 * solicitudes extra como máximo. Fase D puede endurecer esto con Lua si
 * se requiere atomicidad estricta.
 */
export class RedisRateLimitStore implements IRateLimitStore {
  constructor(private readonly redis: Redis) {}

  async get(key: string): Promise<RateBucket | null> {
    const raw = await this.redis.get(`rl:${key}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RateBucket;
    } catch {
      return null;
    }
  }

  async set(key: string, bucket: RateBucket, ttlMs: number): Promise<void> {
    const ttlSeconds = Math.max(Math.ceil(ttlMs / 1_000), 1);
    await this.redis.setex(`rl:${key}`, ttlSeconds, JSON.stringify(bucket));
  }
}
