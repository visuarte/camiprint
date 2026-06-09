import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export async function verifyAdminToken(req: NextRequest): Promise<boolean> {
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const adminEmail = process.env.ADMIN_EMAIL;
        return !adminEmail || user.email === adminEmail;
      }
    } catch {
      // fall through to legacy check
    }
  }

  // Legacy fallback: ADMIN_AUTH_TOKEN
  const adminToken = process.env.ADMIN_AUTH_TOKEN?.trim();
  if (!adminToken) return false;

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const headerToken = authHeader.replace('Bearer ', '').trim();
    if (headerToken === adminToken) return true;
  }

  const cookieToken = req.cookies.get('admin_token')?.value?.trim();
  if (cookieToken === adminToken) return true;

  return false;
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized: Missing or invalid authorization' },
    { status: 401 }
  );
}

export function serverError(error: unknown, message: string = 'Internal server error') {
  console.error(`[API Error] ${message}:`, error);
  return NextResponse.json(
    { error: message, details: error instanceof Error ? error.message : String(error) },
    { status: 500 }
  );
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}
