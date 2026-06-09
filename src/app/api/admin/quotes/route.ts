import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized } from '@/app/api/admin/auth-utils';
import { createQuoteRepository } from '@/server/quotes/repository.factory';

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return unauthorized();
  }

  try {
    const repository = createQuoteRepository();
    const records = await repository.list();

    // Newest first
    const sorted = [...records].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return Response.json({ ok: true, data: sorted, total: sorted.length });
  } catch (err) {
    console.error('[admin/quotes] DB error, returning empty dataset:', err);
    return Response.json({ ok: true, data: [], total: 0, _error: 'db_unavailable' });
  }
}
