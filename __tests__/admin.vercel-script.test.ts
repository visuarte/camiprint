import { describe, it, expect, beforeAll } from 'vitest';
import { GET } from '../src/app/api/admin/settings/vercel-script/route';

describe('Admin Vercel script endpoint', () => {
  beforeAll(() => {
    process.env.ADMIN_AUTH_TOKEN = 'test-token';
  });

  it('returns JSON with { script } when authenticated', async () => {
    const req: any = {
      headers: { get: (k: string) => (k.toLowerCase() === 'authorization' ? 'Bearer test-token' : null) },
      cookies: { get: (_: string) => undefined },
    };

    const res: any = await GET(req);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    const body = await res.json();
    // script should be present (string) or null if file missing; assert shape
    expect(body).toHaveProperty('script');
  });
});
