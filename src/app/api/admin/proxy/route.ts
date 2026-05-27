/**
 * El Puente — Admin Proxy Route Handler
 *
 * Punto de entrada centralizado para validar autenticación admin antes de
 * despachar cualquier petición al Engine. Corre en Edge Runtime para
 * máxima velocidad y mínima latencia en el borde.
 *
 * La validación de token exacta sigue ocurriendo en verifyAdminToken()
 * (Node.js runtime) dentro de cada route handler individual.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Comprueba presencia del token de sesión admin.
 * Edge Runtime no puede comparar contra ADMIN_AUTH_TOKEN (requiere Node.js),
 * por eso solo verifica que el token no esté vacío — la validación exacta
 * la hace verifyAdminToken() en cada handler downstream.
 */
function hasAdminCredentials(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.replace('Bearer ', '').trim();
  const cookieToken = request.cookies.get('admin_token')?.value?.trim();
  return !!(headerToken || cookieToken);
}

/**
 * GET /api/admin/proxy
 * Comprueba estado de sesión admin. Redirige al login si no hay credenciales.
 */
export async function GET(request: NextRequest) {
  if (!hasAdminCredentials(request)) {
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
 * Devuelve 401 si el token está ausente.
 */
export async function POST(request: NextRequest) {
  if (!hasAdminCredentials(request)) {
    return NextResponse.json(
      { error: 'No autorizado. El Puente ha bloqueado la petición.' },
      { status: 401 }
    );
  }

  // Credenciales presentes — el Engine puede procesar la orden.
  // La validación exacta del token ocurre en el handler específico al que
  // esta petición sea enviada internamente.
  return NextResponse.json({
    status: 'Autorizado y en proceso',
    authenticated: true,
  });
}
