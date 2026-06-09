import { describe, expect, it, vi } from 'vitest';
import { brandConfig } from '@/config/brand';
import { PostgresQuotesRepository } from '@/server/quotes/postgres.repository';
import type { QuoteRequestInput } from '@/server/quotes/types';
import { prisma } from '@/server/db';

vi.mock('@/server/db', () => ({
  prisma: {
    quote: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

const quoteInput: QuoteRequestInput = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: brandConfig.companyExample,
  quantity: '50-99',
  message: 'Necesitamos 100 camisetas',
};

describe('PostgresQuotesRepository', () => {
  it('inserta un registro y devuelve el mapeo de la fila', async () => {
    vi.mocked(prisma.quote.create).mockResolvedValue({
      id: 'q_postgres_1',
      source: 'landing-contact-form',
      status: 'received',
      name: quoteInput.name,
      email: quoteInput.email,
      phone: quoteInput.phone,
      companyName: quoteInput.companyName,
      quantity: quoteInput.quantity,
      message: quoteInput.message,
      createdAt: new Date('2026-05-18T10:00:00.000Z'),
      updatedAt: new Date('2026-05-18T10:00:00.000Z'),
    } as never);

    const repository = new PostgresQuotesRepository();
    const created = await repository.create(quoteInput);

    expect(prisma.quote.create).toHaveBeenCalledTimes(1);
    expect(vi.mocked(prisma.quote.create).mock.calls[0][0].data).toMatchObject({
      name: quoteInput.name,
      email: quoteInput.email,
      phone: quoteInput.phone,
      companyName: quoteInput.companyName,
      quantity: quoteInput.quantity,
      message: quoteInput.message,
      status: 'received',
    });
    expect(created).toEqual({
      id: 'q_postgres_1',
      source: 'landing-contact-form',
      status: 'received',
      name: quoteInput.name,
      email: quoteInput.email,
      phone: quoteInput.phone,
      companyName: quoteInput.companyName,
      quantity: quoteInput.quantity,
      message: quoteInput.message,
      createdAt: '2026-05-18T10:00:00.000Z',
      updatedAt: '2026-05-18T10:00:00.000Z',
    });
  });

  it('lista registros y mapea company_name y message null', async () => {
    vi.mocked(prisma.quote.findMany).mockResolvedValue([
      {
        id: 'q_postgres_2',
        source: 'landing-contact-form',
        status: 'received',
        name: quoteInput.name,
        email: quoteInput.email,
        phone: quoteInput.phone,
        companyName: quoteInput.companyName,
        quantity: quoteInput.quantity,
        message: null,
        createdAt: new Date('2026-05-18T10:05:00.000Z'),
        updatedAt: new Date('2026-05-18T10:05:00.000Z'),
      },
    ] as never);

    const repository = new PostgresQuotesRepository();
    const records = await repository.list();

    expect(prisma.quote.findMany).toHaveBeenCalledTimes(1);
    expect(records).toEqual([
      {
        id: 'q_postgres_2',
        source: 'landing-contact-form',
        status: 'received',
        name: quoteInput.name,
        email: quoteInput.email,
        phone: quoteInput.phone,
        companyName: quoteInput.companyName,
        quantity: quoteInput.quantity,
        createdAt: '2026-05-18T10:05:00.000Z',
        updatedAt: '2026-05-18T10:05:00.000Z',
      },
    ]);
  });

  it('reporta unhealthy cuando el ping a postgres falla', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('db down'));
    const repository = new PostgresQuotesRepository();

    await expect(repository.isHealthy()).resolves.toBe(false);
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});