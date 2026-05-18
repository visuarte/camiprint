export interface RateBucket {
  timestamps: number[];
}

/**
 * Contrato de almacenamiento para el rate limiter de sliding window.
 * El algoritmo reside en rate-limit.ts; solo el almacenamiento varía.
 */
export interface IRateLimitStore {
  get(key: string): Promise<RateBucket | null>;
  set(key: string, bucket: RateBucket, ttlMs: number): Promise<void>;
}
