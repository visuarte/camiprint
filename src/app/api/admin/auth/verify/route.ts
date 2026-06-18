import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    // Check admin_token cookie first
    const adminToken = process.env.ADMIN_AUTH_TOKEN || '';
    const cookies = req.cookies.getAll();
    const hasAdminCookie = cookies.some((c) => c.name === 'admin_token' && c.value === adminToken);
    if (hasAdminCookie) {
      return NextResponse.json({ authenticated: true, method: 'token' }, { status: 200 });
    }

    // Fallback to Supabase
    if (supabaseUrl && supabaseKey) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail || user.email === adminEmail) {
          return NextResponse.json({ authenticated: true, method: 'supabase' }, { status: 200 });
        }
      }
    }

    return NextResponse.json({ authenticated: false }, { status: 200 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
