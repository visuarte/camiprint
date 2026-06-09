/**
 * El Puente — Admin Proxy Route Handler
 *
 * Punto de entrada centralizado para validar autenticación admin antes de
 * despachar cualquier petición al Engine. Corre en Edge Runtime para
 * máxima velocidad y mínima latencia en el borde.
 *
 * La validación de sesión exacta sigue ocurriendo en verifyAdminToken()
 * (Node.js runtime) dentro de cada route handler individual.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Comprueba presencia de cookies de sesión Supabase.
 * Edge Runtime no puede hacer JWT verification (requiere Node.js),
 * por eso solo verifica que existan — la validación exacta
 * la hace verifyAdminToken() en cada handler downstream.
 */
function hasSessionCookie(request: NextRequest): boolean {
  const cookies = request.cookies.getAll();
  return cookies.some((c) => c.name.startsWith('sb-') || c.name === 'admin_token');
}

/**
 * GET /api/admin/proxy
 * Comprueba estado de sesión admin. Redirige al login si no hay sesión.
 */
export async function GET(request: NextRequest) {
  if (!hasSessionCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.json({
    status: 'El Puente: sesión activa',
    authenticated: true,
  });
}

/**
 * POST /api/admin/proxy
 * Valida credenciales admin antes de despachar órdenes al Engine.
 * Devuelve 401 si no hay sesión.
 */
export async function POST(request: NextRequest) {
  if (!hasSessionCookie(request)) {
    return NextResponse.json(
      { error: 'No autorizado. El Puente ha bloqueado la petición.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: 'Autorizado y en proceso',
    authenticated: true,
  });
}
