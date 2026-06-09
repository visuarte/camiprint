import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const adminEmail = process.env.ADMIN_EMAIL || null;

  return NextResponse.json({
    authMode: 'supabase-ssr',
    supabaseConfigured: hasSupabase,
    adminEmailConfigured: !!adminEmail,
    adminEmail,
  });
}
