import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, serverError, successResponse } from '../../auth-utils';
import { getDashboardSettingsAuditFromStore } from '@/server/admin/settings';

const ALLOWED_SORTS = ['newest', 'oldest', 'user_asc', 'user_desc'] as const;
type AuditSort = (typeof ALLOWED_SORTS)[number];

function isAuditSort(value: string): value is AuditSort {
  return (ALLOWED_SORTS as readonly string[]).includes(value);
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '20');
    const changedBy = searchParams.get('changedBy') ?? '';
    const from = searchParams.get('from') ?? '';
    const to = searchParams.get('to') ?? '';
    const sortByParam = searchParams.get('sortBy') ?? 'newest';
    const sortBy: AuditSort = isAuditSort(sortByParam) ? sortByParam : 'newest';
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
