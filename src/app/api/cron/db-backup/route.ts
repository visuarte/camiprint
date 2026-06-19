import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import pino from 'pino';

const backupLog = pino({ name: 'db-backup', level: process.env.LOG_LEVEL || 'info' });

const MODELS = ['order', 'orderItem', 'customer', 'product', 'customerAddress',
  'productionOrder', 'productionOrderLine', 'designAsset', 'jobTicket',
  'workQueueItem', 'productPricing', 'printingTechnique', 'productTechnique',
  'quote', 'supplierOrder', 'supplierOrderLine'] as const;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backup: Record<string, any> = {
      _meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        source: process.env.VERCEL_ENV || 'unknown',
      },
    };

    for (const model of MODELS) {
      try {
        const data = await (prisma as any)[model].findMany();
        backup[model] = data;
        backupLog.info({ model, count: data.length }, `Backed up ${model}`);
      } catch (err) {
        backupLog.warn({ model, error: (err as Error).message }, `Skipping ${model}`);
        backup[model] = { _error: (err as Error).message };
      }
    }

    const json = JSON.stringify(backup, null, 2);
    const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;

    // Upload to Vercel Blob
    let blobUrl = '';
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(`backups/${filename}`, json, {
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      blobUrl = blob.url;
      backupLog.info({ url: blobUrl, size: json.length }, 'Backup uploaded to Blob');
    } catch (blobErr) {
      backupLog.warn({ error: (blobErr as Error).message }, 'Blob upload failed, saving locally');
    }

    return NextResponse.json({
      ok: true,
      timestamp: backup._meta.timestamp,
      filename,
      blobUrl: blobUrl || null,
      sizeBytes: json.length,
      models: Object.keys(backup).filter(k => k !== '_meta').length,
    });
  } catch (error) {
    const err = error as Error;
    backupLog.error({ error: err.message }, 'Backup failed');
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
