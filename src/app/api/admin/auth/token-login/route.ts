import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const adminToken = process.env.ADMIN_AUTH_TOKEN || '';
  if (!adminToken) {
    return NextResponse.json({ error: 'ADMIN_AUTH_TOKEN not configured' }, { status: 500 });
  }

  const urlToken = req.nextUrl.searchParams.get('token') || '';

  if (urlToken !== adminToken) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  const redirect = req.nextUrl.searchParams.get('redirect') || '/admin';
  const dest = new URL(redirect, req.url);
  dest.searchParams.set('logged', 'token');

  const response = NextResponse.redirect(dest);

  response.cookies.set('admin_token', adminToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
