import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const adminToken = process.env.ADMIN_AUTH_TOKEN || '';
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin auth no configurado' }, { status: 500 });
    }

    const { email, password } = await req.json();

    if (email === 'admin@camiart.com' && password === adminToken) {
      const response = NextResponse.json({ success: true, token_login: true });

      response.cookies.set('admin_token', adminToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // Fallback a Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

    if (supabaseUrl && supabaseKey) {
      const { createServerClient } = await import('@supabase/ssr');
      const response = NextResponse.json({ success: true });

      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
      }

      return response;
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
