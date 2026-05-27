import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock next/server before importing the module under test
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

describe('proxy middleware', () => {
  let originalEnv: any

  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env.ADMIN_AUTH_TOKEN = 'test-secret'
  })
  afterEach(() => {
    process.env = originalEnv
    vi.resetModules()
  })

  it('allows authorized API requests with Bearer header', async () => {
    const { proxy } = await import('../src/proxy')
    const req: any = {
      nextUrl: { pathname: '/api/admin/foo' },
      headers: { get: (k: string) => (k.toLowerCase() === 'authorization' ? 'Bearer test-secret' : null) },
      cookies: { get: () => undefined },
      url: 'http://localhost/api/admin/foo',
    }
    const res = proxy(req)
    expect(res).toEqual({ __type: 'next' })
  })

  it('rejects unauthorized API requests with 401', async () => {
    const { proxy } = await import('../src/proxy')
    const req: any = {
      nextUrl: { pathname: '/api/admin/foo' },
      headers: { get: () => '' },
      cookies: { get: () => undefined },
      url: 'http://localhost/api/admin/foo',
    }
    const res = proxy(req)
    // unauthorized path returns an instance with status 401
    expect(res.status).toBe(401)
    expect(res.body).toContain('Unauthorized')
  })

  it('allows UI pages with admin_token cookie', async () => {
    const { proxy } = await import('../src/proxy')
    const req: any = {
      nextUrl: { pathname: '/admin/settings', clone: () => new URL('http://localhost/admin/login') },
      headers: { get: () => '' },
      cookies: { get: (k: string) => ({ value: 'cookie-val' }) },
      url: 'http://localhost/admin/settings',
    }
    const res = proxy(req)
    expect(res).toEqual({ __type: 'next' })
  })

  it('allows UI pages with Authorization header', async () => {
    const { proxy } = await import('../src/proxy')
    const req: any = {
      nextUrl: { pathname: '/admin/settings', clone: () => new URL('http://localhost/admin/login') },
      headers: { get: (k: string) => (k.toLowerCase() === 'authorization' ? 'Bearer test-secret' : null) },
      cookies: { get: () => undefined },
      url: 'http://localhost/admin/settings',
    }
    const res = proxy(req)
    expect(res).toEqual({ __type: 'next' })
  })

  it('redirects UI pages without auth to /admin/login', async () => {
    const { proxy } = await import('../src/proxy')
    const req: any = {
      nextUrl: { pathname: '/admin/settings', clone: () => new URL('http://localhost/admin/login') },
      headers: { get: () => '' },
      cookies: { get: () => undefined },
      url: 'http://localhost/admin/settings',
    }
    const res = proxy(req)
    expect(res.__type).toBe('redirect')
    expect(res.location).toContain('/admin/login')
  })
})
