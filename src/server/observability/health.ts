import { getPlatformConfig } from '@/server/platform/config';
import { createQuoteRepository } from '@/server/quotes/repository.factory';

export type HealthStatus = 'ok' | 'degraded' | 'down';

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  durationMs: number;
  error?: string;
}

export interface HealthReport {
  status: HealthStatus;
  timestamp: string;
  checks: HealthCheckResult[];
}

const SLOW_CHECK_THRESHOLD_MS = 2_000;

const runCheck = async (
  name: string,
  fn: () => Promise<boolean>
): Promise<HealthCheckResult> => {
  const start = Date.now();

  try {
    const healthy = await fn();
    const durationMs = Date.now() - start;

    if (!healthy) {
      return { name, status: 'down', durationMs };
    }

    if (durationMs > SLOW_CHECK_THRESHOLD_MS) {
      return { name, status: 'degraded', durationMs };
    }

    return { name, status: 'ok', durationMs };
  } catch (err) {
    const durationMs = Date.now() - start;
    const error = err instanceof Error ? err.message : 'unknown error';
    return { name, status: 'down', durationMs, error };
  }
};

const deriveOverallStatus = (checks: HealthCheckResult[]): HealthStatus => {
  if (checks.some((c) => c.status === 'down')) return 'down';
  if (checks.some((c) => c.status === 'degraded')) return 'degraded';
  return 'ok';
};

export const runHealthChecks = async (): Promise<HealthReport> => {
  const config = getPlatformConfig();
  const checks: HealthCheckResult[] = [];

  // Persistence check
  checks.push(
    await runCheck('quotes-persistence', async () => {
      const repo = createQuoteRepository();
      return repo.isHealthy();
    })
  );

  // Redis check (solo si está habilitado)
  if (config.rateLimitStoreDriver === 'redis' && config.redisUrl) {
    checks.push(
      await runCheck('rate-limit-store', async () => {
        const { getRedisClient } = await import('@/server/platform/redis/client');
        const redis = getRedisClient(config.redisUrl!);
        const result = await redis.ping();
        return result === 'PONG';
      })
    );
  }

  return {
    status: deriveOverallStatus(checks),
    timestamp: new Date().toISOString(),
    checks,
  };
};
