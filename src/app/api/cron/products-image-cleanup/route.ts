import { NextRequest, NextResponse } from 'next/server';
import { runProductImageSoftDeleteCleanup } from '@/server/products/image-utils';

function isAuthorizedCronRequest(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;

  const auth = req.headers.get('authorization') || '';
  return auth === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 });
  }

  try {
    const result = await runProductImageSoftDeleteCleanup({
      dryRun: false,
      limit: 500,
    });

    return NextResponse.json({ ok: true, cleanup: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to run scheduled product image cleanup',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}