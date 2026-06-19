import { NextResponse } from 'next/server';
import pino from 'pino';

const cronLog = pino({ name: 'sync-gor-stock', level: process.env.LOG_LEVEL || 'info' });

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    cronLog.info('Starting GOR Factory stock sync...');

    const gorFactory = await import('@/server/integrations/gor-factory/factory').then((m) =>
      m.createGorFactory()
    );

    const syncEngine = await import('@/server/integrations/gor-factory/sync-engine').then(
      (m) => new m.GorSyncEngine(gorFactory)
    );

    const result = await syncEngine.syncAll('01');

    cronLog.info({ result }, 'GOR Factory stock sync completed');

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      synced: result,
    });
  } catch (error) {
    const err = error as Error;
    cronLog.error({ error: err.message }, 'GOR Factory stock sync failed');
    return NextResponse.json(
      { ok: false, error: 'Sync failed', details: err.message },
      { status: 500 }
    );
  }
}
