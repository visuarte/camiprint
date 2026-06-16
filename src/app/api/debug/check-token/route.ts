import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const raw = process.env.ADMIN_AUTH_TOKEN || '';
  const expected = '4545bd896e1b1163de0561f33ac1bbb650d5fc8f730529bac054a4988fbf4d36';
  
  const urlToken = req.nextUrl.searchParams.get('token') || '';

  return NextResponse.json({
    env_length: raw.length,
    expected_length: expected.length,
    env_value_prefix: raw.substring(0, 10) + '...',
    env_equals_expected: raw === expected,
    url_token_matches_expected: urlToken === expected,
    url_token_matches_env: urlToken === raw,
    env_ends_with_newline: raw.charCodeAt(raw.length - 1),
    url_token: urlToken.substring(0, 10) + '...',
  });
}
