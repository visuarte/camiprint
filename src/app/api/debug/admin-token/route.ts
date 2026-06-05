import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const configured = !!process.env.ADMIN_AUTH_TOKEN;

  return NextResponse.json({ configured });
}
