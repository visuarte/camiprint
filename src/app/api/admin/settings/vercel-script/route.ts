import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, successResponse } from '../../auth-utils';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) return unauthorized();

  try {
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'setup-stripe-secrets.ps1');
    const content = readFileSync(scriptPath, { encoding: 'utf8' });
    return successResponse({ script: content });
  } catch (error) {
    return successResponse({ script: null });
  }
}
