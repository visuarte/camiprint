import type { QuoteRequestInput } from '@/server/quotes/types';
import { QuotesRepository } from '@/server/quotes/repository';

export interface CreateQuoteResult {
  id: string;
  status: 'received';
  createdAt: string;
}

export class QuotesService {
  constructor(private readonly repository: QuotesRepository = new QuotesRepository()) {}

  createQuote(input: QuoteRequestInput): CreateQuoteResult {
    const record = this.repository.create(input);

    return {
      id: record.id,
      status: record.status,
      createdAt: record.createdAt,
    };
  }
}
