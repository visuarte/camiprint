import { describe, expect, it, vi } from 'vitest';
import { brandConfig } from '@/config/brand';
import { PostgresQuotesRepository } from '@/server/quotes/postgres.repository';
import type { QuoteRequestInput } from '@/server/quotes/types';

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
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: 'q_postgres_1',
          source: 'landing-contact-form',
          status: 'received',
          name: quoteInput.name,
          email: quoteInput.email,
          phone: quoteInput.phone,
          company_name: quoteInput.companyName,
          quantity: quoteInput.quantity,
          message: quoteInput.message,
          created_at: '2026-05-18T10:00:00.000Z',
          updated_at: '2026-05-18T10:00:00.000Z',
        },
      ],
    });

    const repository = new PostgresQuotesRepository({ query });
    const created = await repository.create(quoteInput);

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('INSERT INTO quotes');
    expect(query.mock.calls[0][1]).toEqual([
      expect.stringMatching(/^q_/),
      'landing-contact-form',
      'received',
      quoteInput.name,
      quoteInput.email,
      quoteInput.phone,
      quoteInput.companyName,
      quoteInput.quantity,
      quoteInput.message,
      expect.any(String),
      expect.any(String),
      null,
    ]);
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
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: 'q_postgres_2',
          source: 'landing-contact-form',
          status: 'received',
          name: quoteInput.name,
          email: quoteInput.email,
          phone: quoteInput.phone,
          company_name: quoteInput.companyName,
          quantity: quoteInput.quantity,
          message: null,
          created_at: '2026-05-18T10:05:00.000Z',
          updated_at: '2026-05-18T10:05:00.000Z',
        },
      ],
    });

    const repository = new PostgresQuotesRepository({ query });
    const records = await repository.list();

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('SELECT id, source, status');
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
    const query = vi.fn().mockRejectedValue(new Error('db down'));
    const repository = new PostgresQuotesRepository({ query });

    await expect(repository.isHealthy()).resolves.toBe(false);
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });
});