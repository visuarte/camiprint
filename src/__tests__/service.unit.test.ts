import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QuotesService, __resetQuotesCircuitBreakerForTests } from '@/server/quotes/service';
import type { QuoteLeadRecord, QuoteRequestInput } from '@/server/quotes/types';

const quoteInput: QuoteRequestInput = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: 'Camiart SL',
  quantity: '50-99',
  message: 'Necesitamos 100 camisetas',
};

const buildRecord = (): QuoteLeadRecord => ({
  id: 'q_test',
  source: 'landing-contact-form',
  status: 'received',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...quoteInput,
});

describe('QuotesService', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetQuotesCircuitBreakerForTests();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it('retorna resultado cuando repository.create resuelve', async () => {
    const repository = {
      create: vi.fn(async () => buildRecord()),
    };

    const service = new QuotesService(repository as never);
    const result = await service.createQuote(quoteInput);

    expect(result.id).toBe('q_test');
    expect(result.status).toBe('received');
    expect(repository.create).toHaveBeenCalledOnce();
  });

  it('traduce timeout de persistencia a SERVICE_UNAVAILABLE', async () => {
    const repository = {
      create: vi.fn(() => new Promise<QuoteLeadRecord>(() => {})),
    };

    const service = new QuotesService(repository as never, { timeoutMs: 20 });

    await expect(service.createQuote(quoteInput)).rejects.toMatchObject({
      name: 'SERVICE_UNAVAILABLE',
    });
  });

  it('abre circuito tras fallos consecutivos y bloquea intentos inmediatos', async () => {
    const repository = {
      create: vi.fn(async () => {
        throw new Error('disk down');
      }),
    };

    const service = new QuotesService(repository as never, {
      failureThreshold: 2,
      openWindowMs: 2_000,
      timeoutMs: 50,
      now: () => 1_000,
    });

    await expect(service.createQuote(quoteInput)).rejects.toMatchObject({ name: 'SERVICE_UNAVAILABLE' });
    await expect(service.createQuote(quoteInput)).rejects.toMatchObject({ name: 'SERVICE_UNAVAILABLE' });
    await expect(service.createQuote(quoteInput)).rejects.toMatchObject({ name: 'SERVICE_UNAVAILABLE' });

    expect(repository.create).toHaveBeenCalledTimes(2);
  });

  it('permite recuperacion half-open y cierra circuito al exito', async () => {
    let nowMs = 1_000;
    const repository = {
      create: vi
        .fn()
        .mockRejectedValueOnce(new Error('disk down'))
        .mockResolvedValueOnce(buildRecord())
        .mockResolvedValueOnce(buildRecord()),
    };

    const service = new QuotesService(repository as never, {
      failureThreshold: 1,
      openWindowMs: 100,
      timeoutMs: 50,
      now: () => nowMs,
    });

    await expect(service.createQuote(quoteInput)).rejects.toMatchObject({ name: 'SERVICE_UNAVAILABLE' });

    nowMs = 1_150;
    const recovered = await service.createQuote(quoteInput);
    expect(recovered.id).toBe('q_test');

    const next = await service.createQuote(quoteInput);
    expect(next.status).toBe('received');
    expect(repository.create).toHaveBeenCalledTimes(3);

    const warnMessages = warnSpy.mock.calls.flat().map((value) => String(value));
    const infoMessages = infoSpy.mock.calls.flat().map((value) => String(value));

    expect(warnMessages.some((line) => line.includes('Circuit breaker opened for quotes persistence'))).toBe(true);
    expect(
      infoMessages.some((line) => line.includes('Circuit breaker moved to half-open for quotes persistence'))
    ).toBe(true);
    expect(infoMessages.some((line) => line.includes('Circuit breaker closed for quotes persistence'))).toBe(
      true
    );
  });
});
