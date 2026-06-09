import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.mock('next/server', () => {
  class NextResponseMock {
    body: any
    status: number | undefined
    headers: any
    constructor(body?: any, init?: any) {
      this.body = body
      this.status = init?.status
      this.headers = init?.headers
    }
    static next() {
      return { __type: 'next' }
    }
    static redirect(url: any) {
      return { __type: 'redirect', location: String(url) }
    }
  }
  return { NextResponse: NextResponseMock }
})

vi.mock('@/utils/supabase/middleware', () => ({
  updateSession: async (req: any) => ({ __type: 'next' }),
}))

vi.mock('@supabase/ssr', () => {
  const createServerClient = (url: string, key: string, opts: any) => ({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
    },
  })
  return { createServerClient }
})

type MockHeaders = { get: (k: string) => string | null }
type MockCookie = { name: string; value: string }

function mockReq(overrides: {
  pathname?: string
  headers?: MockHeaders
  cookies?: MockCookie[]
} = {}) {
  const cookies = overrides.cookies || []
  return {
    nextUrl: {
      pathname: overrides.pathname || '/',
      clone: () => new URL('http://localhost/admin/login'),
    },
    headers: overrides.headers || { get: () => '' },
    cookies: { getAll: () => cookies },
    url: 'http://localhost',
  }
}

describe('proxy middleware', () => {
  let originalEnv: any

  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key'
    process.env.ADMIN_AUTH_TOKEN = 'test-secret'
  })
  afterEach(() => {
    process.env = originalEnv
    vi.resetModules()
  })

  it('rejects unauthorized API requests with 401', async () => {
    const { proxy } = await import('../src/proxy')
    const req = mockReq({ pathname: '/api/admin/foo' })
    const res = await proxy(req)
    expect(res.status).toBe(401)
    expect(res.body).toContain('Unauthorized')
  })

  it('allows authorized API requests with Bearer header (legacy)', async () => {
    const { proxy } = await import('../src/proxy')
    const req = mockReq({
      pathname: '/api/admin/foo',
      headers: {
        get: (k: string) => (k.toLowerCase() === 'authorization' ? 'Bearer test-secret' : null),
      },
    })
    const res = await proxy(req)
    expect(res).toEqual({ __type: 'next' })
  })

  it('redirects UI pages without auth to /admin/login', async () => {
    const { proxy } = await import('../src/proxy')
    const req = mockReq({ pathname: '/admin/settings' })
    const res = await proxy(req)
    expect(res.__type).toBe('redirect')
    expect(res.location).toContain('/admin/login')
  })

  it('allows UI pages with admin_token cookie (legacy)', async () => {
    const { proxy } = await import('../src/proxy')
    const req = mockReq({
      pathname: '/admin/settings',
      cookies: [{ name: 'admin_token', value: 'test-secret' }],
    })
    const res = await proxy(req)
    expect(res).toEqual({ __type: 'next' })
  })

  it('allows UI pages with Authorization header (legacy)', async () => {
    const { proxy } = await import('../src/proxy')
    const req = mockReq({
      pathname: '/admin/settings',
      headers: {
        get: (k: string) => (k.toLowerCase() === 'authorization' ? 'Bearer test-secret' : null),
      },
    })
    const res = await proxy(req)
    expect(res).toEqual({ __type: 'next' })
  })
})
