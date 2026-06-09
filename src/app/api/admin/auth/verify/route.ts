import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
          });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email !== adminEmail) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({ authenticated: true }, { status: 200 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
