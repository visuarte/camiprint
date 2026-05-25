import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ===== RUTAS PÚBLICAS (sin protección) =====
  // Webhooks de Stripe
  if (pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  // POST de órdenes (crear órdenes nuevas es público)
  if (pathname === '/api/orders' && request.method === 'POST') {
    return NextResponse.next();
  }

  // API pública
  if (pathname.startsWith('/api/v1') || pathname.startsWith('/api/products')) {
    return NextResponse.next();
  }

  // Rutas públicas del frontend
  if (
    pathname === '/' ||
    pathname.startsWith('/catalog') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout')
  ) {
    return NextResponse.next();
  }

  // ===== RUTAS PROTEGIDAS =====
  // Admin UI routes (excepto login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;
    const adminToken = process.env.ADMIN_AUTH_TOKEN;

    if (!token || token !== adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Admin API routes
  // Admin API routes
  if (pathname.startsWith('/api/admin')) {
    // Allow the login endpoint to be called without Authorization header
    if (pathname === '/api/admin/auth/login' && request.method === 'POST') {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_AUTH_TOKEN;

    if (!token || token !== adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/webhook/:path*',
    '/api/v1/:path*',
    '/api/products/:path*',
    '/api/orders/:path*'
  ],
};
