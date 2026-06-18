import { NextRequest, NextResponse } from 'next/server';
import { getAbandonedCarts, sendRecoveryEmails } from '@/server/abandoned-cart';

export async function GET() {
  const carts = getAbandonedCarts();
  return NextResponse.json({ carts, total: carts.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hours = body.hours || 1;
    const sent = await sendRecoveryEmails(hours);
    return NextResponse.json({ success: true, sent });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
