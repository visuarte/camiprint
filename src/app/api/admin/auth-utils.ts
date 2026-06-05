import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const safeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

/**
 * Verify admin authentication from request headers or cookie.
 * Accepts: Authorization: Bearer <token>  OR  admin_token cookie (set by login route).
 */
export function verifyAdminToken(req: NextRequest): boolean {
  const adminToken = process.env.ADMIN_AUTH_TOKEN?.trim();

  if (!adminToken) {
    return false;
  }

  // 1. Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const headerToken = authHeader.replace('Bearer ', '').trim();
    if (safeCompare(headerToken, adminToken)) return true;
  }

  // 2. HttpOnly cookie (set after successful login)
  const cookieToken = req.cookies.get('admin_token')?.value?.trim();
  if (cookieToken && safeCompare(cookieToken, adminToken)) return true;

  return false;
}

/**
 * Send unauthorized response
 */
export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized: Missing or invalid authorization token' },
    { status: 401 }
  );
}

/**
 * Send server error response
 */
export function serverError(error: unknown, message: string = 'Internal server error') {
  console.error(`[API Error] ${message}:`, error);
  return NextResponse.json(
    { error: message, details: error instanceof Error ? error.message : String(error) },
    { status: 500 }
  );
}

/**
 * Success response wrapper
 */
export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}
