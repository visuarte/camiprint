import { getOrCreateRequestId } from '@/server/http/request-id';
import { getPlatformConfig } from '@/server/platform/config';
import { formatMetricsAsPrometheus } from '@/server/observability/metrics';

const DENY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
} as const;

export async function GET(request: Request) {
  const requestId = getOrCreateRequestId(request);
  const config = getPlatformConfig();

  if (config.metricsToken) {
    const authHeader = request.headers.get('authorization') ?? '';
    const provided = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : (request.headers.get('x-metrics-token') ?? '').trim();

    if (!provided || provided !== config.metricsToken) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'www-authenticate': 'Bearer realm="metrics"',
          'x-request-id': requestId,
          ...DENY_HEADERS,
        },
      });
    }
  }

  const headers = new Headers({
    'content-type': 'text/plain; charset=utf-8',
    'x-request-id': requestId,
    ...DENY_HEADERS,
  });

  if (process.env.NODE_ENV === 'production') {
    headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  }

  return new Response(formatMetricsAsPrometheus(), { status: 200, headers });
}
