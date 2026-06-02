import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuoteLeadRecord } from '@/server/quotes/types';

const createQuoteRepository = vi.fn();
const hasQuoteCommunicationEvent = vi.fn();
const appendQuoteCommunicationEvent = vi.fn();
const sendEmail = vi.fn();
const logOperationalEvent = vi.fn();

vi.mock('@/server/quotes/repository.factory', () => ({
  createQuoteRepository,
}));

vi.mock('@/server/quotes/communication-timeline', () => ({
  hasQuoteCommunicationEvent,
  appendQuoteCommunicationEvent,
}));

vi.mock('@/server/emails/service', () => ({
  emailService: {
    sendEmail,
  },
}));

vi.mock('@/server/observability/logger', () => ({
  logOperationalEvent,
}));

import { runQuoteFirstResponseSlaCheck } from '@/server/quotes/sla-monitor';

const makeQuote = (overrides: Partial<QuoteLeadRecord> = {}): QuoteLeadRecord => ({
  id: 'q_sla_1',
  source: 'landing-contact-form',
  status: 'received',
  name: 'Ana Lopez',
  email: 'ana@empresa.com',
  phone: '+34 600 000 000',
  companyName: 'Empresa Demo',
  quantity: '25-49',
  message: 'Necesito precios',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('runQuoteFirstResponseSlaCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.QUOTE_FIRST_RESPONSE_SLA_MINUTES = '60';
  });

  it('genera alerta y evento interno cuando hay breach sin alerta previa', async () => {
    createQuoteRepository.mockReturnValue({
      list: vi.fn().mockResolvedValue([makeQuote()]),
    });
    hasQuoteCommunicationEvent.mockResolvedValue(false);
    sendEmail.mockResolvedValue({ success: true, id: 'msg_1' });

    const result = await runQuoteFirstResponseSlaCheck();

    expect(result.scanned).toBe(1);
    expect(result.breached).toBe(1);
    expect(result.alerted).toBe(1);
    expect(result.errors).toBe(0);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(appendQuoteCommunicationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'quote.sla_breached.first_response',
        channel: 'internal',
        status: 'sent',
      })
    );
  });

  it('omite envio si ya existe evento previo de breach para la quote', async () => {
    createQuoteRepository.mockReturnValue({
      list: vi.fn().mockResolvedValue([makeQuote({ id: 'q_sla_2' })]),
    });
    hasQuoteCommunicationEvent.mockResolvedValue(true);

    const result = await runQuoteFirstResponseSlaCheck();

    expect(result.scanned).toBe(1);
    expect(result.breached).toBe(1);
    expect(result.alerted).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(appendQuoteCommunicationEvent).not.toHaveBeenCalled();
  });
});
