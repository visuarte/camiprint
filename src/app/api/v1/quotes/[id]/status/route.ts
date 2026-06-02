import { jsonError, jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { getQuoteStatusById } from '@/server/quotes/status.service';

type QuoteStatusRouteContext = {
  params: Promise<{ id?: string }>;
};

const normalizeQuoteId = async (context: QuoteStatusRouteContext): Promise<string | null> => {
  const resolved = await context.params;
  const id = resolved?.id?.trim();
  return id && id.length > 0 ? id : null;
};

export async function GET(request: Request, context: QuoteStatusRouteContext) {
  const requestId = getOrCreateRequestId(request);
  const quoteId = await normalizeQuoteId(context);

  if (!quoteId) {
    return jsonError(422, requestId, 'VALIDATION_ERROR', 'quoteId invalido', [
      { field: 'id', issue: 'El id de la cotizacion es obligatorio.' },
    ]);
  }

  const statusView = await getQuoteStatusById(quoteId);
  if (!statusView) {
    return jsonError(404, requestId, 'NOT_FOUND', 'No encontramos la solicitud indicada.');
  }

  return jsonSuccess(200, requestId, statusView);
}
