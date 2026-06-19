import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }
  const raw = process.env.ADMIN_AUTH_TOKEN || '';
  return NextResponse.json({
    env_length: raw.length,
    env_value_prefix: raw.substring(0, 10) + '...',
    env_ends_with_newline: raw.charCodeAt(raw.length - 1),
  });
}
