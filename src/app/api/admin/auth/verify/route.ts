// =============================================================================
// Verify admin session — comprueba si la cookie admin_token es válida
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const adminToken = process.env.ADMIN_AUTH_TOKEN?.trim();
  if (!adminToken) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const cookieToken = req.cookies.get('admin_token')?.value?.trim();
  if (!cookieToken) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const isAuthenticated = cookieToken === adminToken;

  return NextResponse.json({ authenticated: isAuthenticated }, { status: 200 });
}
