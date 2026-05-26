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
  // Nota: el Edge Runtime no tiene acceso garantizado a ADMIN_AUTH_TOKEN.
  // Solo comprobamos que la cookie exista (no vacía).
  // La validación real del token ocurre en los API handlers (Node.js runtime).
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookieToken = request.cookies.get('admin_token')?.value?.trim();

    if (!cookieToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Admin API routes
  if (pathname.startsWith('/api/admin')) {
    // Allow the login endpoint to be called without auth
    if (pathname === '/api/admin/auth/login' && request.method === 'POST') {
      return NextResponse.next();
    }

    // Solo comprobamos que el token (header o cookie) no esté vacío.
    // verifyAdminToken() en cada handler hace la comparación exacta.
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '').trim();
    const cookieToken = request.cookies.get('admin_token')?.value?.trim();
    const token = headerToken || cookieToken;

    if (!token) {
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
