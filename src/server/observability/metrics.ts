export interface DurationMetric {
  sum: number;
  count: number;
}

export interface DurationPercentiles {
  p50: number;
  p95: number;
  p99: number;
}

export interface QuotesMetricsSnapshot {
  createdCount: number;
  validationErrorCount: number;
  rateLimitedCount: number;
  internalErrorCount: number;
  circuitOpenCount: number;
  inFlightRequests: number;
  requestDurationMs: DurationMetric;
  requestDurationValues: number[];
  requestDurationPercentiles: DurationPercentiles;
  requestsByStatus: Record<string, number>;
  requestsByIp: Record<string, number>;
}

const GLOBAL_METRICS_KEY = '__camiprint_quotes_metrics_store__';

const getMetricsStore = (): QuotesMetricsSnapshot => {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_METRICS_KEY]?: QuotesMetricsSnapshot;
  };

  if (!globalScope[GLOBAL_METRICS_KEY]) {
    globalScope[GLOBAL_METRICS_KEY] = {
      createdCount: 0,
      validationErrorCount: 0,
      rateLimitedCount: 0,
      internalErrorCount: 0,
      circuitOpenCount: 0,
      inFlightRequests: 0,
      requestDurationMs: {
        sum: 0,
        count: 0,
      },
      requestDurationValues: [],
      requestDurationPercentiles: {
        p50: 0,
        p95: 0,
        p99: 0,
      },
      requestsByStatus: {},
      requestsByIp: {},
    };
  }

  return globalScope[GLOBAL_METRICS_KEY];
};

export const incrementCreatedCount = () => {
  getMetricsStore().createdCount += 1;
};

export const incrementValidationErrorCount = () => {
  getMetricsStore().validationErrorCount += 1;
};

export const incrementRateLimitedCount = () => {
  getMetricsStore().rateLimitedCount += 1;
};

export const incrementInternalErrorCount = () => {
  getMetricsStore().internalErrorCount += 1;
};

export const incrementCircuitOpenCount = () => {
  getMetricsStore().circuitOpenCount += 1;
};

export const incrementInFlightRequests = () => {
  getMetricsStore().inFlightRequests += 1;
};

export const decrementInFlightRequests = () => {
  const store = getMetricsStore();
  store.inFlightRequests = Math.max(0, store.inFlightRequests - 1);
};

export const recordRequestDuration = (durationMs: number) => {
  const store = getMetricsStore();
  store.requestDurationMs.sum += durationMs;
  store.requestDurationMs.count += 1;
  store.requestDurationValues.push(durationMs);
};

const percentile = (values: number[], percentileValue: number): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((percentileValue / 100) * sorted.length);
  const index = Math.min(Math.max(rank - 1, 0), sorted.length - 1);
  return sorted[index];
};

const maskIpForLabel = (ip: string): string => {
  if (!ip) return 'unknown';
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }

  if (ip.includes(':')) {
    const segments = ip.split(':').filter(Boolean);
    return `${segments.slice(0, 3).join(':') || 'ipv6'}::`;
  }

  return ip;
};

export const incrementRequestsByStatus = (statusCode: number) => {
  const store = getMetricsStore();
  const key = String(statusCode);
  store.requestsByStatus[key] = (store.requestsByStatus[key] ?? 0) + 1;
};

export const incrementRequestsByIp = (ip: string) => {
  const store = getMetricsStore();
  const key = maskIpForLabel(ip);
  store.requestsByIp[key] = (store.requestsByIp[key] ?? 0) + 1;
};

export const getMetricsSnapshot = (): QuotesMetricsSnapshot => {
  const store = getMetricsStore();
  return {
    ...store,
    requestDurationMs: {
      ...store.requestDurationMs,
    },
    requestDurationValues: [...store.requestDurationValues],
    requestDurationPercentiles: {
      p50: percentile(store.requestDurationValues, 50),
      p95: percentile(store.requestDurationValues, 95),
      p99: percentile(store.requestDurationValues, 99),
    },
    requestsByStatus: { ...store.requestsByStatus },
    requestsByIp: { ...store.requestsByIp },
  };
};

const sanitizeLabel = (value: string): string => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const formatMetricsAsPrometheus = (): string => {
  const snapshot = getMetricsSnapshot();

  const statusLines = Object.keys(snapshot.requestsByStatus)
    .sort()
    .map(
      (statusCode) =>
        `quotes_requests_total{status="${sanitizeLabel(statusCode)}"} ${snapshot.requestsByStatus[statusCode]}`
    );

  const ipLines = Object.keys(snapshot.requestsByIp)
    .sort()
    .map((ip) => `quotes_requests_by_ip_total{ip="${sanitizeLabel(ip)}"} ${snapshot.requestsByIp[ip]}`);

  const lines = [
    '# HELP quotes_created_count Quotes successfully created',
    '# TYPE quotes_created_count counter',
    `quotes_created_count ${snapshot.createdCount}`,
    '# HELP quotes_validation_error_count Quotes validation errors',
    '# TYPE quotes_validation_error_count counter',
    `quotes_validation_error_count ${snapshot.validationErrorCount}`,
    '# HELP quotes_rate_limited_count Quotes requests rate limited',
    '# TYPE quotes_rate_limited_count counter',
    `quotes_rate_limited_count ${snapshot.rateLimitedCount}`,
    '# HELP quotes_internal_error_count Quotes internal errors',
    '# TYPE quotes_internal_error_count counter',
    `quotes_internal_error_count ${snapshot.internalErrorCount}`,
    '# HELP quotes_circuit_open_count Times circuit breaker opened',
    '# TYPE quotes_circuit_open_count counter',
    `quotes_circuit_open_count ${snapshot.circuitOpenCount}`,
    '# HELP quotes_in_flight_requests Quotes requests currently in flight',
    '# TYPE quotes_in_flight_requests gauge',
    `quotes_in_flight_requests ${snapshot.inFlightRequests}`,
    '# HELP quotes_request_duration_ms_sum Total quotes request duration (ms)',
    '# TYPE quotes_request_duration_ms_sum counter',
    `quotes_request_duration_ms_sum ${snapshot.requestDurationMs.sum}`,
    '# HELP quotes_request_duration_ms_count Number of measured quote requests',
    '# TYPE quotes_request_duration_ms_count counter',
    `quotes_request_duration_ms_count ${snapshot.requestDurationMs.count}`,
    '# HELP quotes_request_duration_ms_p50 Quotes request duration percentile 50',
    '# TYPE quotes_request_duration_ms_p50 gauge',
    `quotes_request_duration_ms_p50 ${snapshot.requestDurationPercentiles.p50}`,
    '# HELP quotes_request_duration_ms_p95 Quotes request duration percentile 95',
    '# TYPE quotes_request_duration_ms_p95 gauge',
    `quotes_request_duration_ms_p95 ${snapshot.requestDurationPercentiles.p95}`,
    '# HELP quotes_request_duration_ms_p99 Quotes request duration percentile 99',
    '# TYPE quotes_request_duration_ms_p99 gauge',
    `quotes_request_duration_ms_p99 ${snapshot.requestDurationPercentiles.p99}`,
    '# HELP quotes_requests_total Quotes requests grouped by HTTP status',
    '# TYPE quotes_requests_total counter',
    ...statusLines,
    '# HELP quotes_requests_by_ip_total Quotes requests grouped by client IP',
    '# TYPE quotes_requests_by_ip_total counter',
    ...ipLines,
  ];

  return lines.join('\n');
};

export const __resetMetricsForTests = () => {
  if (process.env.NODE_ENV !== 'test') return;

  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_METRICS_KEY]?: QuotesMetricsSnapshot;
  };

  globalScope[GLOBAL_METRICS_KEY] = {
    createdCount: 0,
    validationErrorCount: 0,
    rateLimitedCount: 0,
    internalErrorCount: 0,
    circuitOpenCount: 0,
    inFlightRequests: 0,
    requestDurationMs: {
      sum: 0,
      count: 0,
    },
    requestDurationValues: [],
    requestDurationPercentiles: {
      p50: 0,
      p95: 0,
      p99: 0,
    },
    requestsByStatus: {},
    requestsByIp: {},
  };
};
