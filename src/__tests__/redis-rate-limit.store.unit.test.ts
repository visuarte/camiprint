import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisRateLimitStore } from '@/server/http/redis-rate-limit.store';

const buildMockRedis = () => ({
  get: vi.fn<[string], Promise<string | null>>(),
  setex: vi.fn<[string, number, string], Promise<'OK'>>().mockResolvedValue('OK' as const),
});

describe('RedisRateLimitStore', () => {
  let mockRedis: ReturnType<typeof buildMockRedis>;
  let store: RedisRateLimitStore;

  beforeEach(() => {
    mockRedis = buildMockRedis();
    // RedisRateLimitStore acepta cualquier objeto con get/setex (duck typing)
    store = new RedisRateLimitStore(mockRedis as never);
  });

  it('get devuelve null cuando la clave no existe en Redis', async () => {
    mockRedis.get.mockResolvedValue(null);

    const result = await store.get('203.0.113.1');

    expect(mockRedis.get).toHaveBeenCalledWith('rl:203.0.113.1');
    expect(result).toBeNull();
  });

  it('get devuelve el bucket deserializado', async () => {
    const bucket = { timestamps: [1000, 2000, 3000] };
    mockRedis.get.mockResolvedValue(JSON.stringify(bucket));

    const result = await store.get('10.0.0.1');

    expect(result).toEqual(bucket);
  });

  it('get devuelve null si el JSON almacenado es invalido', async () => {
    mockRedis.get.mockResolvedValue('{{not-valid-json');

    const result = await store.get('10.0.0.1');

    expect(result).toBeNull();
  });

  it('set llama setex con prefijo rl:, TTL en segundos y bucket serializado', async () => {
    const bucket = { timestamps: [5000, 6000] };

    await store.set('1.2.3.4', bucket, 60_000);

    expect(mockRedis.setex).toHaveBeenCalledWith(
      'rl:1.2.3.4',
      60,
      JSON.stringify(bucket)
    );
  });

  it('set redondea el TTL hacia arriba al segundo completo', async () => {
    await store.set('1.2.3.4', { timestamps: [] }, 61_500);

    expect(mockRedis.setex).toHaveBeenCalledWith(
      'rl:1.2.3.4',
      62,
      expect.any(String)
    );
  });

  it('set asegura TTL minimo de 1 segundo incluso para ventanas muy cortas', async () => {
    await store.set('1.2.3.4', { timestamps: [] }, 100);

    expect(mockRedis.setex).toHaveBeenCalledWith(
      'rl:1.2.3.4',
      1,
      expect.any(String)
    );
  });
});
