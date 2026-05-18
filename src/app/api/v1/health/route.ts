import { jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { runHealthChecks } from '@/server/observability/health';

const DENY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
} as const;

export async function GET(request: Request) {
  const requestId = getOrCreateRequestId(request);

  try {
    const report = await runHealthChecks();
    const statusCode = report.status === 'ok' ? 200 : 503;

    const body = {
      ...report,
      meta: { requestId },
    };

    if (statusCode === 200) {
      return jsonSuccess(200, requestId, {
        status: report.status,
        timestamp: report.timestamp,
        checks: report.checks,
      });
    }

    return Response.json(
      { ok: false, ...body },
      {
        status: statusCode,
        headers: { 'x-request-id': requestId, ...DENY_HEADERS },
      }
    );
  } catch {
    return Response.json(
      {
        ok: false,
        status: 'down' as const,
        timestamp: new Date().toISOString(),
        checks: [{ name: 'health-runner', status: 'down' as const, durationMs: 0 }],
        meta: { requestId },
      },
      {
        status: 503,
        headers: { 'x-request-id': requestId, ...DENY_HEADERS },
      }
    );
  }
}

