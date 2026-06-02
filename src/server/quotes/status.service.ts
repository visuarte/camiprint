import { createQuoteRepository } from '@/server/quotes/repository.factory';
import { getLatestQuoteCommunicationForQuote } from '@/server/quotes/communication-timeline';

export interface QuoteStatusView {
  quoteId: string;
  status: string;
  eta: string | null;
  lastUpdateAt: string;
  lastCommunicationAt: string | null;
  lastCommunicationStatus: string | null;
}

const estimateEtaFromStatus = (status: string, createdAt: string): string | null => {
  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return null;

  if (status === 'received') return new Date(createdAtMs + 60 * 60 * 1000).toISOString();
  if (status === 'reviewed') return new Date(createdAtMs + 6 * 60 * 60 * 1000).toISOString();
  if (status === 'quoted') return null;
  return new Date(createdAtMs + 24 * 60 * 60 * 1000).toISOString();
};

export const getQuoteStatusById = async (quoteId: string): Promise<QuoteStatusView | null> => {
  const repository = createQuoteRepository();
  const records = await repository.list();
  const quote = records.find((record) => record.id === quoteId);
  if (!quote) return null;

  const lastCommunication = await getLatestQuoteCommunicationForQuote(quoteId);
  const normalizedStatus = (quote as { status?: string }).status ?? 'received';

  return {
    quoteId,
    status: normalizedStatus,
    eta: estimateEtaFromStatus(normalizedStatus, quote.createdAt),
    lastUpdateAt: quote.updatedAt,
    lastCommunicationAt: lastCommunication?.createdAt ?? null,
    lastCommunicationStatus: lastCommunication?.status ?? null,
  };
};
