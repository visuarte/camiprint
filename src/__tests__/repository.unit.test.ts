import { beforeEach, describe, expect, it } from 'vitest';
import { QuotesRepository, __resetQuotesStorageForTests } from '@/server/quotes/repository';
import type { QuoteRequestInput } from '@/server/quotes/types';

const quoteInput: QuoteRequestInput = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: 'Camiart SL',
  quantity: '50-99',
  message: 'Necesitamos 100 camisetas',
};

describe('QuotesRepository', () => {
  beforeEach(async () => {
    await __resetQuotesStorageForTests();
  });

  it('persiste un registro durable y lo lista', async () => {
    const repository = new QuotesRepository();

    const created = await repository.create(quoteInput);
    const records = await repository.list();

    expect(created.id).toMatch(/^q_/);
    expect(created.status).toBe('received');
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(created.id);
  });

  it('mantiene datos entre instancias del repositorio', async () => {
    const repositoryA = new QuotesRepository();
    const repositoryB = new QuotesRepository();

    await repositoryA.create(quoteInput);
    const records = await repositoryB.list();

    expect(records).toHaveLength(1);
    expect(records[0].companyName).toBe('Camiart SL');
  });

  it('reporta healthy cuando storage es valido', async () => {
    const repository = new QuotesRepository();

    expect(await repository.isHealthy()).toBe(true);
  });
});
