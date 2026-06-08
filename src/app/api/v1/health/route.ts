import { jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { runHealthChecks } from '@/server/observability/health';
import { uptime, memoryUsage } from 'node:process';
import { cpus, freemem, totalmem, loadavg } from 'node:os';

const DENY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
} as const;

function getSystemMetrics() {
  const mem = memoryUsage();
  return {
    uptime_s: Math.floor(uptime()),
    memory: {
      rss_mb: Math.round(mem.rss / 1024 / 1024),
      heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
      heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
      free_mb: Math.round(freemem() / 1024 / 1024),
      total_mb: Math.round(totalmem() / 1024 / 1024),
    },
    cpu: {
      cores: cpus().length,
      load_1m: loadavg()[0] ?? 0,
      load_5m: loadavg()[1] ?? 0,
      load_15m: loadavg()[2] ?? 0,
    },
  };
}

export async function GET(request: Request) {
  const requestId = getOrCreateRequestId(request);

  try {
    const report = await runHealthChecks();
    const statusCode = report.status === 'ok' ? 200 : 503;

    const system = getSystemMetrics();

    const body = {
      ...report,
      system,
      meta: { requestId },
    };

    if (statusCode === 200) {
      return jsonSuccess(200, requestId, {
        status: report.status,
        timestamp: report.timestamp,
        checks: report.checks,
        system,
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
        system: getSystemMetrics(),
        meta: { requestId },
      },
      {
        status: 503,
        headers: { 'x-request-id': requestId, ...DENY_HEADERS },
      }
    );
  }
}

