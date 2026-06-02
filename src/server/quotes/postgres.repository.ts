import type { QuoteRepository } from '@/server/quotes/contracts';
import type { QuoteLeadRecord, QuoteRequestInput } from '@/server/quotes/types';
import { prisma } from '@/server/db';

const mapPrismaQuoteToLeadRecord = (quote: any): QuoteLeadRecord => ({
  id: quote.id,
  source: 'landing-contact-form' as const,
  status: quote.status || 'received',
  name: quote.name,
  email: quote.email,
  phone: quote.phone,
  companyName: quote.companyName,
  quantity: quote.quantity,
  ...(quote.message ? { message: quote.message } : {}),
  createdAt: new Date(quote.createdAt).toISOString(),
  updatedAt: new Date(quote.updatedAt).toISOString(),
});

export class PostgresQuotesRepository implements QuoteRepository {
  async create(input: QuoteRequestInput): Promise<QuoteLeadRecord> {
    const quote = await prisma.quote.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        companyName: input.companyName,
        quantity: input.quantity,
        message: input.message || null,
        status: 'received',
      },
    });

    return mapPrismaQuoteToLeadRecord(quote);
  }

  async list(): Promise<QuoteLeadRecord[]> {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return quotes.map(mapPrismaQuoteToLeadRecord);
  }

  async isHealthy(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
