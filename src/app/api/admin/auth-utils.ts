import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify admin authentication from request headers
 * Expects: Authorization: Bearer <ADMIN_AUTH_TOKEN>
 */
export function verifyAdminToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const adminToken = process.env.ADMIN_AUTH_TOKEN || 'default-test-token';

  return token === adminToken;
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
