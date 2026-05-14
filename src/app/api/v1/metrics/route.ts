import { getOrCreateRequestId } from '@/server/http/request-id';
import { formatMetricsAsPrometheus } from '@/server/observability/metrics';

export async function GET(request: Request) {
  const requestId = getOrCreateRequestId(request);

  const headers = new Headers();
  headers.set('content-type', 'text/plain; charset=utf-8');
  headers.set('x-request-id', requestId);
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-frame-options', 'DENY');

  if (process.env.NODE_ENV === 'production') {
    headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  }

  return new Response(formatMetricsAsPrometheus(), {
    status: 200,
    headers,
  });
}
