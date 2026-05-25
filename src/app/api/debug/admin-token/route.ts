import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const token = process.env.ADMIN_AUTH_TOKEN;
  const configured = !!token;
  const length = configured ? String(token).trim().length : 0;

  return NextResponse.json({ configured, length });
}
