import { NextRequest, NextResponse } from 'next/server';
import { trackAbandonedCart } from '@/server/abandoned-cart';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    trackAbandonedCart({
      email: body.email,
      name: body.name,
      items: body.items || [],
      total: body.total || 0,
      checkoutUrl: body.checkoutUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
