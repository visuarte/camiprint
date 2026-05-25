import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const adminToken = process.env.ADMIN_AUTH_TOKEN;

    if (!adminToken) {
      console.error('ADMIN_AUTH_TOKEN not configured on the server');
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      );
    }

    const provided = typeof token === 'string' ? token.trim() : '';
    const expected = typeof adminToken === 'string' ? adminToken.trim() : '';

    // Debugging helper (safe): in dev, log only lengths to avoid leaking token
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.info(`ADMIN_AUTH_TOKEN length: ${expected.length}`);
        console.info(`Provided token length: ${provided.length}`);
      } catch (e) {
        // ignore
      }
    }

    if (provided !== expected) {
      console.warn('Admin login failed: invalid token provided');
      const body: any = { error: 'Invalid admin token' };
      if (process.env.NODE_ENV !== 'production') {
        body.providedLength = provided.length;
        body.expectedLength = expected.length;
      }
      return NextResponse.json(body, { status: 401 });
    }

    // Token válido, crear cookie de sesión
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
