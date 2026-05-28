import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, serverError, successResponse } from '../../auth-utils';
import { getDashboardSettingsAuditFromStore } from '@/server/admin/settings';

const ALLOWED_SORTS = ['newest', 'oldest', 'user_asc', 'user_desc'] as const;

export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '20');
    const changedBy = searchParams.get('changedBy') ?? '';
    const from = searchParams.get('from') ?? '';
    const to = searchParams.get('to') ?? '';
    const sortByParam = searchParams.get('sortBy') ?? 'newest';
    const sortBy = ALLOWED_SORTS.includes(sortByParam as any) ? sortByParam : 'newest';
    const result = await getDashboardSettingsAuditFromStore({
      page,
      pageSize,
      changedBy,
      from,
      to,
      sortBy,
    });

    return successResponse(result);
  } catch (error) {
    return serverError(error, 'Failed to read settings audit history');
  }
}
