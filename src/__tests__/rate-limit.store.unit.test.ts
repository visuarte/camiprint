import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRateLimitStore, getInMemoryRateLimitStore } from '@/server/http/in-memory-rate-limit.store';

describe('InMemoryRateLimitStore', () => {
  let store: InMemoryRateLimitStore;

  beforeEach(() => {
    store = new InMemoryRateLimitStore();
    store.reset();
  });

  it('devuelve null para una clave que no existe', async () => {
    const result = await store.get('unknown-ip');
    expect(result).toBeNull();
  });

  it('almacena y recupera un bucket', async () => {
    const bucket = { timestamps: [1000, 2000, 3000] };
    await store.set('127.0.0.1', bucket, 60_000);
    const result = await store.get('127.0.0.1');
    expect(result).toEqual(bucket);
  });

  it('sobrescribe el bucket existente', async () => {
    await store.set('10.0.0.1', { timestamps: [1000] }, 60_000);
    await store.set('10.0.0.1', { timestamps: [2000, 3000] }, 60_000);
    const result = await store.get('10.0.0.1');
    expect(result?.timestamps).toEqual([2000, 3000]);
  });

  it('reset limpia todos los buckets', async () => {
    await store.set('1.1.1.1', { timestamps: [100] }, 60_000);
    await store.set('2.2.2.2', { timestamps: [200] }, 60_000);
    store.reset();
    expect(await store.get('1.1.1.1')).toBeNull();
    expect(await store.get('2.2.2.2')).toBeNull();
  });

  it('getInMemoryRateLimitStore devuelve el singleton global', () => {
    const a = getInMemoryRateLimitStore();
    const b = getInMemoryRateLimitStore();
    expect(a).toBe(b);
  });
});
