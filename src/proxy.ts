import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

async function isAdminSession(req: NextRequest): Promise<boolean> {
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      })
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const adminEmail = process.env.ADMIN_EMAIL
        return !adminEmail || user.email === adminEmail
      }
    } catch {
      // fall through
    }
  }

  const adminToken = process.env.ADMIN_AUTH_TOKEN || ''
  if (!adminToken) return false

  const authHeader = req.headers.get('authorization') || ''
  if (authHeader === `Bearer ${adminToken}`) return true

  const cookies = req.cookies.getAll()
  const hasAdminCookie = cookies.some((c) => c.name === 'admin_token' && c.value === adminToken)
  if (hasAdminCookie) return true

  return false
}

export async function proxy(req: NextRequest) {
  const sessionResponse = await updateSession(req)
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return sessionResponse
  }

  if (pathname === '/api/admin/auth/login' || pathname === '/api/admin/auth/token-login') {
    return sessionResponse
  }

  if (pathname.startsWith('/api/admin')) {
    const authed = await isAdminSession(req)
    if (authed) return sessionResponse
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const authed = await isAdminSession(req)
    if (authed) return sessionResponse

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
