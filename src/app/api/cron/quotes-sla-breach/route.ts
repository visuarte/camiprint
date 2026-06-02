import { NextRequest, NextResponse } from 'next/server';
import { runQuoteFirstResponseSlaCheck } from '@/server/quotes/sla-monitor';

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
    const result = await runQuoteFirstResponseSlaCheck();
    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to run quote SLA breach job',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
