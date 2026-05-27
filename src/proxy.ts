import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Proxy: protección server-side de rutas de UI Admin y API admin.
 * - UI pages (/admin/*): exige cookie `admin_token` o redirect a /admin/login
 * - API routes (/api/admin/*): exige header `Authorization: Bearer <ADMIN_AUTH_TOKEN>`
 */
export async function proxy(req: NextRequest) {
  const sessionResponse = await updateSession(req)
  const { pathname } = req.nextUrl

  // No nos ocupamos de otras rutas
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return sessionResponse
  }

  // API admin: validar header Bearer
  if (pathname.startsWith('/api/admin')) {
    const authHeader = req.headers.get('authorization') || ''
    const expected = process.env.ADMIN_AUTH_TOKEN || ''
    if (authHeader === `Bearer ${expected}`) return sessionResponse
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  // UI admin pages (except login): permitir si existe cookie admin_token
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookieToken = req.cookies.get('admin_token')?.value?.trim()
    const expected = process.env.ADMIN_AUTH_TOKEN || ''
    const authHeader = req.headers.get('authorization') || ''
    // permitir si existe cookie válida o header Authorization válido
    if (cookieToken || authHeader === `Bearer ${expected}`) return sessionResponse

    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return sessionResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
