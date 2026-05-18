import { jsonError, jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { checkQuoteRateLimit, getQuoteClientIp } from '@/server/http/rate-limit';
import {
  decrementInFlightRequests,
  incrementCreatedCount,
  incrementInFlightRequests,
  incrementInternalErrorCount,
  incrementRequestsByIp,
  incrementRequestsByStatus,
  incrementRateLimitedCount,
  incrementValidationErrorCount,
  recordRequestDuration,
} from '@/server/observability/metrics';
import { logRequestError,
  logRequestInfo,
  logRequestWarn,
  sanitizeQuotePayloadForLogs,
} from '@/server/observability/logger';
import { validateQuotePayload } from '@/server/quotes/validation';
import { getQuotesServiceFactory } from './_service-factory';

const MAX_BODY_SIZE_BYTES = 32_000;

const parseBody = async (request: Request): Promise<unknown> => {
  const rawText = await request.text();
  const bodySizeBytes = new TextEncoder().encode(rawText).length;

  if (bodySizeBytes > MAX_BODY_SIZE_BYTES) {
    const error = new Error('PAYLOAD_TOO_LARGE');
    error.name = 'PAYLOAD_TOO_LARGE';
    throw error;
  }

  if (!rawText.trim()) return {};
  return JSON.parse(rawText) as unknown;
};

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = getOrCreateRequestId(request);
  const service = getQuotesServiceFactory()();
  const method = request.method;
  const path = new URL(request.url).pathname;
  const clientIp = getQuoteClientIp(request);

  const recordOutcome = (statusCode: number) => {
    const durationMs = Date.now() - startedAt;
    recordRequestDuration(durationMs);
    incrementRequestsByStatus(statusCode);
    incrementRequestsByIp(clientIp);
    return durationMs;
  };

  incrementInFlightRequests();

  try {
    const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('application/json')) {
      incrementValidationErrorCount();
      const durationMs = recordOutcome(415);
      logRequestWarn('Unsupported media type on quotes endpoint', {
        requestId,
        method,
        path,
        statusCode: 415,
        durationMs,
      });

      return jsonError(
        415,
        requestId,
        'UNSUPPORTED_MEDIA_TYPE',
        'El Content-Type debe ser application/json.'
      );
    }

    const rateLimit = await checkQuoteRateLimit(request);
    if (!rateLimit.allowed) {
      incrementRateLimitedCount();
      const durationMs = recordOutcome(429);
      logRequestWarn('Rate limited quotes request', {
        requestId,
        method,
        path,
        statusCode: 429,
        durationMs,
      });

      return jsonError(
        429,
        requestId,
        'RATE_LIMITED',
        'Hay alta demanda en este momento. Intentalo nuevamente en unos minutos.',
        undefined,
        { 'retry-after': String(rateLimit.retryAfterSeconds) }
      );
    }

    const payload = await parseBody(request);
    const { data, issues } = validateQuotePayload(payload);

    if (!data) {
      incrementValidationErrorCount();
      const durationMs = recordOutcome(422);
      logRequestWarn('Quote payload validation failed', {
        requestId,
        method,
        path,
        statusCode: 422,
        durationMs,
      }, {
        validationIssues: issues.map((issue) => issue.field),
      });

      return jsonError(422, requestId, 'VALIDATION_ERROR', 'Payload invalido', issues);
    }

    const created = await service.createQuote(data);
    incrementCreatedCount();
    const durationMs = recordOutcome(201);
    logRequestInfo('Quote created', {
      requestId,
      method,
      path,
      statusCode: 201,
      durationMs,
    });

    return jsonSuccess(201, requestId, created);
  } catch (error) {
    if (error instanceof SyntaxError) {
      incrementValidationErrorCount();
      const durationMs = recordOutcome(422);
      logRequestWarn('Invalid JSON body for quote request', {
        requestId,
        method,
        path,
        statusCode: 422,
        durationMs,
      });

      return jsonError(422, requestId, 'VALIDATION_ERROR', 'JSON invalido', [
        { field: 'body', issue: 'No se pudo parsear el cuerpo JSON.' },
      ]);
    }

    if (error instanceof Error && error.name === 'PAYLOAD_TOO_LARGE') {
      incrementValidationErrorCount();
      const durationMs = recordOutcome(413);
      logRequestWarn('Payload too large for quote request', {
        requestId,
        method,
        path,
        statusCode: 413,
        durationMs,
      });

      return jsonError(413, requestId, 'PAYLOAD_TOO_LARGE', 'El payload supera el limite permitido.');
    }

    if (error instanceof Error && error.name === 'SERVICE_UNAVAILABLE') {
      incrementInternalErrorCount();
      const durationMs = recordOutcome(503);
      logRequestError('Quote service unavailable', {
        requestId,
        method,
        path,
        statusCode: 503,
        durationMs,
        errorCode: 'SERVICE_UNAVAILABLE',
        errorMessage: error.message,
        errorStack: error.stack,
      });

      return jsonError(
        503,
        requestId,
        'SERVICE_UNAVAILABLE',
        'No pudimos procesar tu solicitud. Intentalo de nuevo.',
        undefined,
        { 'retry-after': '30' }
      );
    }

    incrementInternalErrorCount();
    const durationMs = recordOutcome(500);
    logRequestError('Unexpected error in quote request', {
      requestId,
      method,
      path,
      statusCode: 500,
      durationMs,
      errorCode: 'INTERNAL_ERROR',
      errorMessage: error instanceof Error ? error.message : 'unknown',
      errorStack: error instanceof Error ? error.stack : undefined,
    }, {
      sanitizedPayload: sanitizeQuotePayloadForLogs({
        body: 'unavailable',
      }),
    });

    return jsonError(500, requestId, 'INTERNAL_ERROR', 'Error interno. Intenta de nuevo.');
  } finally {
    decrementInFlightRequests();
  }
}
