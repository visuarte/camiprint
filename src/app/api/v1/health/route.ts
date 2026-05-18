import { jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { createQuoteRepository } from '@/server/quotes/repository.factory';

export async function GET(request: Request) {
  const requestId = getOrCreateRequestId(request);
  const startedAt = Date.now();

  try {
    const repository = createQuoteRepository();
    const persistenceHealthy = await repository.isHealthy();
    const durationMs = Date.now() - startedAt;

    if (!persistenceHealthy || durationMs > 2_000) {
      return Response.json(
        {
          ok: false,
          status: 'degraded',
          timestamp: new Date().toISOString(),
          checks: [
            {
              name: 'quotes-persistence',
              status: persistenceHealthy ? 'ok' : 'down',
              durationMs,
            },
          ],
          meta: { requestId },
        },
        {
          status: 503,
          headers: {
            'x-request-id': requestId,
            'x-content-type-options': 'nosniff',
            'x-frame-options': 'DENY',
          },
        }
      );
    }

    return jsonSuccess(200, requestId, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: [
        {
          name: 'quotes-persistence',
          status: 'ok',
          durationMs,
        },
      ],
    });
  } catch {
    return Response.json(
      {
        ok: false,
        status: 'down',
        timestamp: new Date().toISOString(),
        checks: [
          {
            name: 'quotes-persistence',
            status: 'down',
            durationMs: Date.now() - startedAt,
          },
        ],
        meta: { requestId },
      },
      {
        status: 503,
        headers: {
          'x-request-id': requestId,
          'x-content-type-options': 'nosniff',
          'x-frame-options': 'DENY',
        },
      }
    );
  }
}
