import { jsonError, jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { getQuoteStatusById } from '@/server/quotes/status.service';

const normalizeQuoteId = async (
  context?: { params?: { id?: string } | Promise<{ id?: string }> }
): Promise<string | null> => {
  const rawParams = context?.params;
  const resolved = rawParams instanceof Promise ? await rawParams : rawParams;
  const id = resolved?.id?.trim();
  return id && id.length > 0 ? id : null;
};

export async function GET(
  request: Request,
  context?: { params?: { id?: string } | Promise<{ id?: string }> }
) {
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
