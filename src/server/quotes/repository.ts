import type { QuoteLeadRecord, QuoteRequestInput } from '@/server/quotes/types';

interface QuotesStore {
  records: QuoteLeadRecord[];
}

const GLOBAL_STORE_KEY = '__camiprint_quotes_store__';

const getStore = (): QuotesStore => {
  const globalScope = globalThis as typeof globalThis & { [GLOBAL_STORE_KEY]?: QuotesStore };
  if (!globalScope[GLOBAL_STORE_KEY]) {
    globalScope[GLOBAL_STORE_KEY] = { records: [] };
  }
  return globalScope[GLOBAL_STORE_KEY];
};

const createQuoteId = () => `q_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export class QuotesRepository {
  create(input: QuoteRequestInput): QuoteLeadRecord {
    const nowIso = new Date().toISOString();
    const record: QuoteLeadRecord = {
      id: createQuoteId(),
      source: 'landing-contact-form',
      status: 'received',
      createdAt: nowIso,
      updatedAt: nowIso,
      ...input,
    };

    getStore().records.push(record);
    return record;
  }

  list(): QuoteLeadRecord[] {
    return [...getStore().records];
  }
}
