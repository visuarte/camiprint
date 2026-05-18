import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/v1/metrics/route';
import {
  __resetMetricsForTests,
  decrementInFlightRequests,
  formatMetricsAsPrometheus,
  incrementCreatedCount,
  incrementInFlightRequests,
  incrementInternalErrorCount,
  incrementRequestsByIp,
  incrementRequestsByStatus,
  incrementRateLimitedCount,
  incrementValidationErrorCount,
  recordRequestDuration,
} from '@/server/observability/metrics';

describe('GET /api/v1/metrics', () => {
  it('responde text/plain con metricas operativas', async () => {
    __resetMetricsForTests();

    incrementCreatedCount();
    incrementValidationErrorCount();
    incrementRateLimitedCount();
    incrementInternalErrorCount();
    incrementInFlightRequests();
    recordRequestDuration(125);
    recordRequestDuration(200);
    recordRequestDuration(400);
    incrementRequestsByStatus(201);
    incrementRequestsByStatus(429);
    incrementRequestsByIp('203.0.113.10');
    decrementInFlightRequests();

    const request = new Request('http://localhost/api/v1/metrics', {
      method: 'GET',
      headers: {
        'x-request-id': 'req_metrics_test',
      },
    });

    const response = await GET(request);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(response.headers.get('x-request-id')).toBe('req_metrics_test');
    expect(body).toContain('quotes_created_count 1');
    expect(body).toContain('quotes_validation_error_count 1');
    expect(body).toContain('quotes_rate_limited_count 1');
    expect(body).toContain('quotes_internal_error_count 1');
    expect(body).toContain('quotes_in_flight_requests 0');
    expect(body).toContain('quotes_request_duration_ms_sum 725');
    expect(body).toContain('quotes_request_duration_ms_count 3');
    expect(body).toContain('quotes_request_duration_ms_p50 200');
    expect(body).toContain('quotes_request_duration_ms_p95 400');
    expect(body).toContain('quotes_request_duration_ms_p99 400');
    expect(body).toContain('quotes_requests_total{status="201"} 1');
    expect(body).toContain('quotes_requests_total{status="429"} 1');
    expect(body).toContain('quotes_requests_by_ip_total{ip="203.0.113.xxx"} 1');
  });

  it('mantiene formato prometheus consistente', () => {
    const metricsText = formatMetricsAsPrometheus();

    expect(metricsText).toContain('# TYPE quotes_created_count counter');
    expect(metricsText).toContain('# TYPE quotes_in_flight_requests gauge');
    expect(metricsText).toContain('# TYPE quotes_request_duration_ms_p95 gauge');
  });

  it('responde 401 cuando METRICS_TOKEN está configurado y no se envía token', async () => {
    const originalToken = process.env.METRICS_TOKEN;
    process.env.METRICS_TOKEN = 'secret123';
    try {
      const response = await GET(
        new Request('http://localhost/api/v1/metrics', { method: 'GET' })
      );
      expect(response.status).toBe(401);
      expect(response.headers.get('www-authenticate')).toContain('Bearer');
    } finally {
      if (originalToken === undefined) {
        delete process.env.METRICS_TOKEN;
      } else {
        process.env.METRICS_TOKEN = originalToken;
      }
    }
  });

  it('responde 401 cuando el Bearer token es incorrecto', async () => {
    const originalToken = process.env.METRICS_TOKEN;
    process.env.METRICS_TOKEN = 'secret123';
    try {
      const response = await GET(
        new Request('http://localhost/api/v1/metrics', {
          method: 'GET',
          headers: { authorization: 'Bearer wrongtoken' },
        })
      );
      expect(response.status).toBe(401);
    } finally {
      if (originalToken === undefined) {
        delete process.env.METRICS_TOKEN;
      } else {
        process.env.METRICS_TOKEN = originalToken;
      }
    }
  });

  it('responde 200 cuando el Bearer token es correcto', async () => {
    const originalToken = process.env.METRICS_TOKEN;
    process.env.METRICS_TOKEN = 'secret123';
    try {
      __resetMetricsForTests();
      const response = await GET(
        new Request('http://localhost/api/v1/metrics', {
          method: 'GET',
          headers: { authorization: 'Bearer secret123' },
        })
      );
      expect(response.status).toBe(200);
    } finally {
      if (originalToken === undefined) {
        delete process.env.METRICS_TOKEN;
      } else {
        process.env.METRICS_TOKEN = originalToken;
      }
    }
  });
});
