import { jsonError, jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { QuotesService } from '@/server/quotes/service';
import { validateQuotePayload } from '@/server/quotes/validation';

const MAX_BODY_SIZE_BYTES = 32_000;

const parseBody = async (request: Request): Promise<unknown> => {
  const rawText = await request.text();

  if (rawText.length > MAX_BODY_SIZE_BYTES) {
    const error = new Error('PAYLOAD_TOO_LARGE');
    error.name = 'PAYLOAD_TOO_LARGE';
    throw error;
  }

  if (!rawText.trim()) return {};
  return JSON.parse(rawText) as unknown;
};

export async function POST(request: Request) {
  const requestId = getOrCreateRequestId(request);
  const service = new QuotesService();

  try {
    const payload = await parseBody(request);
    const { data, issues } = validateQuotePayload(payload);

    if (!data) {
      return jsonError(422, requestId, 'VALIDATION_ERROR', 'Payload invalido', issues);
    }

    const created = service.createQuote(data);
    return jsonSuccess(201, requestId, created);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError(422, requestId, 'VALIDATION_ERROR', 'JSON invalido', [
        { field: 'body', issue: 'No se pudo parsear el cuerpo JSON.' },
      ]);
    }

    if (error instanceof Error && error.name === 'PAYLOAD_TOO_LARGE') {
      return jsonError(413, requestId, 'PAYLOAD_TOO_LARGE', 'El payload supera el limite permitido.');
    }

    return jsonError(500, requestId, 'INTERNAL_ERROR', 'Error interno. Intenta de nuevo.');
  }
}
