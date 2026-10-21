import { describe, it, expect, beforeAll } from 'vitest';
import { GET } from '../src/app/api/admin/settings/vercel-script/route';

describe('Admin Vercel script endpoint', () => {
  beforeAll(() => {
    process.env.ADMIN_AUTH_TOKEN = 'test-token';
  });

  it('returns JSON with { script } when authenticated', async () => {
    const req: any = {
      headers: { get: (k: string) => (k.toLowerCase() === 'authorization' ? 'Bearer test-token' : null) },
      // El cliente SSR de Supabase pide getAll()/setAll(); con solo get() lanzaba
      // "req.cookies.getAll is not a function" como rechazo no capturado y
      // tumbaba el proceso de test aunque las aserciones pasaran.
      cookies: {
        get: (_: string) => undefined,
        getAll: () => [],
        set: (_: string, __: string, ___: unknown) => undefined,
      },
    };

    const res: any = await GET(req);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    const body = await res.json();
    // script should be present (string) or null if file missing; assert shape
    expect(body).toHaveProperty('script');
  });
});
