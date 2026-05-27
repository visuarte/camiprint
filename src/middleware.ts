import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware: protección server-side de rutas de UI Admin.
 *
 * Las rutas /api/admin/* son protegidas de forma independiente por:
 *   1. verifyAdminToken() en cada route handler (validación exacta del token)
 *   2. El Puente (app/api/admin/proxy/route.ts) como punto de entrada centralizado
 *
 * Este middleware solo actúa como guardia server-side para páginas HTML admin,
 * garantizando el redirect antes de que cualquier JS cargue en el cliente.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin UI page protection (excepto /admin/login)
  // Edge Runtime: solo verifica presencia del cookie, no el valor exacto.
  // La validación real del token ocurre en verifyAdminToken() (Node.js runtime).
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookieToken = request.cookies.get('admin_token')?.value?.trim();
    if (!cookieToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Solo páginas admin — las rutas API se protegen en sus propios handlers
  matcher: ['/admin/:path*'],
};
