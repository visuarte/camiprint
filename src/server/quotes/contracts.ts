import type { QuoteLeadRecord, QuoteRequestInput } from '@/server/quotes/types';

export interface QuoteRepository {
  create(input: QuoteRequestInput): Promise<QuoteLeadRecord>;
  list(): Promise<QuoteLeadRecord[]>;
  isHealthy(): Promise<boolean>;
}