import { createQuoteRepository } from '@/server/quotes/repository.factory';
import { appendQuoteCommunicationEvent, hasQuoteCommunicationEvent } from '@/server/quotes/communication-timeline';
import { emailService } from '@/server/emails/service';
import { logOperationalEvent } from '@/server/observability/logger';
import type { QuoteLeadRecord } from '@/server/quotes/types';

const SLA_EVENT_TYPE = 'quote.sla_breached.first_response';
const SLA_TEMPLATE_KEY = 'internal.sla.first_response.breach';

const getSlaMinutes = (): number => {
  const value = Number(process.env.QUOTE_FIRST_RESPONSE_SLA_MINUTES ?? '60');
  if (!Number.isFinite(value) || value <= 0) return 60;
  return Math.floor(value);
};

const isFirstResponseBreached = (quote: QuoteLeadRecord, nowMs: number, slaMinutes: number): boolean => {
  const createdAtMs = new Date(quote.createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return false;
  if (quote.status !== 'received') return false;

  return nowMs - createdAtMs >= slaMinutes * 60_000;
};

const buildInternalAlertHtml = (quote: QuoteLeadRecord, ageMinutes: number, slaMinutes: number): string => `
  <h2>Alerta SLA: respuesta inicial vencida</h2>
  <p><strong>Quote ID:</strong> ${quote.id}</p>
  <p><strong>Empresa:</strong> ${quote.companyName}</p>
  <p><strong>Contacto:</strong> ${quote.name} (${quote.email})</p>
  <p><strong>Cantidad:</strong> ${quote.quantity}</p>
  <p><strong>Antiguedad:</strong> ${ageMinutes} min</p>
  <p><strong>SLA objetivo:</strong> ${slaMinutes} min</p>
  ${quote.message ? `<p><strong>Mensaje:</strong> ${quote.message}</p>` : ''}
`;

export interface SlaBreachRunResult {
  scanned: number;
  breached: number;
  alerted: number;
  errors: number;
  slaMinutes: number;
}

export const runQuoteFirstResponseSlaCheck = async (): Promise<SlaBreachRunResult> => {
  const repository = createQuoteRepository();
  const quotes = await repository.list();
  const nowMs = Date.now();
  const slaMinutes = getSlaMinutes();

  let breached = 0;
  let alerted = 0;
  let errors = 0;

  for (const quote of quotes) {
    if (!isFirstResponseBreached(quote, nowMs, slaMinutes)) continue;
    breached += 1;

    const alreadyAlerted = await hasQuoteCommunicationEvent(quote.id, SLA_EVENT_TYPE);
    if (alreadyAlerted) continue;

    const ageMinutes = Math.floor((nowMs - new Date(quote.createdAt).getTime()) / 60_000);

    try {
      const recipient =
        process.env.QUOTES_NOTIFICATION_EMAIL ||
        process.env.CONTACT_TO_EMAIL ||
        process.env.RESEND_TO_EMAIL ||
        'hola@camiart.com';

      const mailResult = await emailService.sendEmail({
        to: recipient,
        subject: `SLA breach cotizacion ${quote.id} (${ageMinutes} min)`,
        html: buildInternalAlertHtml(quote, ageMinutes, slaMinutes),
        replyTo: quote.email,
      });

      await appendQuoteCommunicationEvent({
        quoteId: quote.id,
        eventType: SLA_EVENT_TYPE,
        channel: 'internal',
        status: mailResult.success ? 'sent' : 'failed',
        templateKey: SLA_TEMPLATE_KEY,
        message: mailResult.success
          ? `Alerta SLA enviada para quote ${quote.id} (${ageMinutes} min)`
          : `Fallo al enviar alerta SLA para quote ${quote.id}: ${mailResult.error ?? 'unknown-error'}`,
      });

      if (mailResult.success) alerted += 1;
      else errors += 1;
    } catch (error) {
      errors += 1;
      await appendQuoteCommunicationEvent({
        quoteId: quote.id,
        eventType: SLA_EVENT_TYPE,
        channel: 'internal',
        status: 'failed',
        templateKey: SLA_TEMPLATE_KEY,
        message: `Excepcion al generar alerta SLA para quote ${quote.id}: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  logOperationalEvent('info', 'quote.sla_check.completed', {
    scanned: quotes.length,
    breached,
    alerted,
    errors,
    slaMinutes,
  });

  return {
    scanned: quotes.length,
    breached,
    alerted,
    errors,
    slaMinutes,
  };
};
