import { NextRequest } from 'next/server';
import { unauthorized, verifyAdminToken, successResponse, serverError } from '../../auth-utils';
import { runProductImageSoftDeleteCleanup } from '@/server/products/image-utils';

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function parseBoolean(value: string | null, fallback = false): boolean {
  if (!value) return fallback;
  return value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
}

export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return unauthorized();
  }

  try {
    const { searchParams } = new URL(req.url);
    const dryRun = parseBoolean(searchParams.get('dryRun'));
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 200), 1000);

    const result = await runProductImageSoftDeleteCleanup({
      dryRun,
      limit,
    });

    return successResponse({
      ok: true,
      cleanup: result,
    });
  } catch (error) {
    return serverError(error, 'Failed to run product image cleanup job');
  }
}