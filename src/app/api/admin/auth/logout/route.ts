import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.signOut();
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
  }
}
