import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, serverError } from '../../../auth-utils';
import {
  DashboardSettings,
  DashboardSettingsAuditEntry,
  getDashboardSettingsAuditFromStore,
} from '@/server/admin/settings';

const ALLOWED_SORTS = ['newest', 'oldest', 'user_asc', 'user_desc'] as const;
const EXCLUDED_DIFF_FIELDS = new Set(['updatedAt', 'updatedBy']);

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/D';
  if (typeof value === 'boolean') return value ? 'Si' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value.length > 0 ? value : 'N/D';
  return JSON.stringify(value);
}

function buildDiff(current: DashboardSettings, previous?: DashboardSettings) {
  const keys = new Set<string>([
    ...Object.keys(current ?? {}),
    ...Object.keys(previous ?? {}),
  ]);

  const changes: Array<{ field: string; previousValue: string; nextValue: string }> = [];

  for (const key of keys) {
    if (EXCLUDED_DIFF_FIELDS.has(key)) continue;

    const next = (current as any)[key];
    const prev = previous ? (previous as any)[key] : undefined;

    if (JSON.stringify(next) !== JSON.stringify(prev)) {
      changes.push({
        field: key,
        previousValue: normalizeValue(prev),
        nextValue: normalizeValue(next),
      });
    }
  }

  return changes;
}

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const changedBy = searchParams.get('changedBy') ?? '';
    const from = searchParams.get('from') ?? '';
    const to = searchParams.get('to') ?? '';
    const sortByParam = searchParams.get('sortBy') ?? 'newest';
    const sortBy = ALLOWED_SORTS.includes(sortByParam as any) ? sortByParam : 'newest';

    // Fetch all filtered pages in chunks.
    let page = 1;
    let totalPages = 1;
    const pageSize = 100;
    const allEntries: DashboardSettingsAuditEntry[] = [];

    while (page <= totalPages) {
      const chunk = await getDashboardSettingsAuditFromStore({
        page,
        pageSize,
        changedBy,
        from,
        to,
        sortBy,
      });

      allEntries.push(...chunk.entries);
      totalPages = Math.max(1, chunk.totalPages || 1);
      page += 1;
    }

    const header = ['entryId', 'changedAt', 'changedBy', 'field', 'before', 'after'];
    const rows: string[] = [header.map(csvEscape).join(',')];

    for (let i = 0; i < allEntries.length; i += 1) {
      const entry = allEntries[i];
      const previous = allEntries[i + 1]?.payload;
      const diffs = buildDiff(entry.payload, previous);

      if (diffs.length === 0) {
        rows.push([
          csvEscape(String(entry.id)),
          csvEscape(entry.changedAt),
          csvEscape(entry.changedBy ?? 'N/D'),
          csvEscape('__no_changes__'),
          csvEscape('N/D'),
          csvEscape('N/D'),
        ].join(','));
        continue;
      }

      for (const diff of diffs) {
        rows.push([
          csvEscape(String(entry.id)),
          csvEscape(entry.changedAt),
          csvEscape(entry.changedBy ?? 'N/D'),
          csvEscape(diff.field),
          csvEscape(diff.previousValue),
          csvEscape(diff.nextValue),
        ].join(','));
      }
    }

    const csv = rows.join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="settings-audit-${Date.now()}.csv"`,
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    return serverError(error, 'Failed to export settings audit history');
  }
}
