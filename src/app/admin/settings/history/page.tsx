'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../../auth-client';

type AuditSort = 'newest' | 'oldest' | 'user_asc' | 'user_desc';

interface SettingsSnapshot {
  showMetrics: boolean;
  refreshIntervalSeconds: number;
  analyticsEnabled: boolean;
  metricsWindowDays: number;
  language: string;
  currency: string;
  timezone: string;
  adminEmail: string | null;
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
}

interface AuditEntry {
  id: number;
  changedAt: string;
  changedBy: string | null;
  payload: SettingsSnapshot;
}

interface AuditPageResponse {
  entries: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface DiffItem {
  field: string;
  previousValue: string;
  nextValue: string;
}

const EXCLUDED_DIFF_FIELDS = new Set(['updatedAt', 'updatedBy']);

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/D';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value.length > 0 ? value : 'N/D';
  return JSON.stringify(value);
}

function buildDiff(current: SettingsSnapshot, previous?: SettingsSnapshot): DiffItem[] {
  const keys = new Set<string>([
    ...Object.keys(current ?? {}),
    ...Object.keys(previous ?? {}),
  ]);

  const changes: DiffItem[] = [];

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

export default function AdminSettingsHistoryPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  const [changedByDraft, setChangedByDraft] = useState('');
  const [fromDraft, setFromDraft] = useState('');
  const [toDraft, setToDraft] = useState('');

  const [changedBy, setChangedBy] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortByDraft, setSortByDraft] = useState<AuditSort>('newest');
  const [sortBy, setSortBy] = useState<AuditSort>('newest');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        params.set('sortBy', sortBy);
        if (changedBy) params.set('changedBy', changedBy);
        if (from) params.set('from', from);
        if (to) params.set('to', to);

        const res = await adminFetch(`/api/admin/settings/audit?${params.toString()}`);
        if (!res.ok) throw new Error(String(res.status));
        const data: AuditPageResponse = await res.json();
        setEntries(data.entries ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
      } catch (e) {
        console.error(e);
        setError('No se pudo cargar el historial de cambios.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, pageSize, changedBy, from, to, sortBy]);

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('sortBy', sortBy);
    if (changedBy) params.set('changedBy', changedBy);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return `/api/admin/settings/audit/export?${params.toString()}`;
  }, [changedBy, from, to, sortBy]);

  const timeline = useMemo(() => {
    return entries.map((entry, index) => ({
      entry,
      diff: buildDiff(entry.payload, entries[index + 1]?.payload),
    }));
  }, [entries]);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Historial de Ajustes</h1>
          <p className="text-sm text-neutral-400 mt-1">Timeline de cambios con usuario, fecha y diff por campo.</p>
        </div>
        <Link href="/admin/settings" className="px-4 py-2 bg-neutral-700 text-white rounded">
          Volver a Ajustes
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 md:grid-cols-5 gap-3 border border-neutral-800 rounded p-3 bg-neutral-900/40">
        <label className="text-sm">
          <span className="block text-xs text-neutral-400 mb-1">Usuario</span>
          <input
            type="text"
            value={changedByDraft}
            onChange={(e) => setChangedByDraft(e.target.value)}
            placeholder="ej: diego-admin"
            className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5"
          />
        </label>

        <label className="text-sm">
          <span className="block text-xs text-neutral-400 mb-1">Desde</span>
          <input
            type="datetime-local"
            value={fromDraft}
            onChange={(e) => setFromDraft(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5"
          />
        </label>

        <label className="text-sm">
          <span className="block text-xs text-neutral-400 mb-1">Hasta</span>
          <input
            type="datetime-local"
            value={toDraft}
            onChange={(e) => setToDraft(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5"
          />
        </label>

        <label className="text-sm">
          <span className="block text-xs text-neutral-400 mb-1">Ordenación</span>
          <select
            value={sortByDraft}
            onChange={(e) => setSortByDraft(e.target.value as AuditSort)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5"
          >
            <option value="newest">Más reciente primero</option>
            <option value="oldest">Más antiguo primero</option>
            <option value="user_asc">Usuario A-Z</option>
            <option value="user_desc">Usuario Z-A</option>
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            onClick={() => {
              setPage(1);
              setChangedBy(changedByDraft.trim());
              setFrom(fromDraft);
              setTo(toDraft);
              setSortBy(sortByDraft);
            }}
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
          >
            Aplicar
          </button>
          <button
            onClick={() => {
              setChangedByDraft('');
              setFromDraft('');
              setToDraft('');
              setPage(1);
              setChangedBy('');
              setFrom('');
              setTo('');
              setSortByDraft('newest');
              setSortBy('newest');
            }}
            className="px-3 py-1.5 rounded bg-neutral-700 text-white text-sm"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-neutral-400">
        <div>
          Total registros: <span className="text-neutral-200 font-semibold">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={exportHref} className="px-3 py-1.5 rounded bg-emerald-700 text-white text-sm" download>
            Exportar CSV
          </a>
          <span>Por página</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-sm text-neutral-400">Cargando historial...</div>}
      {!loading && error && <div className="text-sm text-red-400">{error}</div>}

      {!loading && !error && timeline.length === 0 && (
        <div className="border border-neutral-800 rounded p-4 text-sm text-neutral-400">
          Aún no hay cambios registrados.
        </div>
      )}

      {!loading && !error && timeline.length > 0 && (
        <>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-neutral-800" />
            <div className="space-y-5">
            {timeline.map(({ entry, diff }) => (
              <article key={entry.id} className="relative border border-neutral-800 rounded p-4 bg-neutral-900/40">
                <div className="absolute -left-[18px] top-4 h-3 w-3 rounded-full bg-blue-500" />

                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-sm text-neutral-300">
                    <span className="font-semibold">Usuario:</span> {entry.changedBy ?? 'N/D'}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {new Date(entry.changedAt).toLocaleString('es-ES')}
                  </div>
                </div>

                {diff.length === 0 ? (
                  <div className="text-xs text-neutral-500">Sin cambios funcionales detectados.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="text-left text-neutral-400 border-b border-neutral-800">
                          <th className="py-2 pr-2">Campo</th>
                          <th className="py-2 pr-2">Antes</th>
                          <th className="py-2 pr-2">Después</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diff.map((item) => (
                          <tr key={`${entry.id}-${item.field}`} className="border-b border-neutral-900/80 align-top">
                            <td className="py-2 pr-2 font-mono text-neutral-300">{item.field}</td>
                            <td className="py-2 pr-2 text-neutral-400">{item.previousValue}</td>
                            <td className="py-2 pr-2 text-neutral-100">{item.nextValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded bg-neutral-700 text-white text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <div className="text-sm text-neutral-400">
              Página <span className="text-neutral-200 font-semibold">{page}</span> de{' '}
              <span className="text-neutral-200 font-semibold">{Math.max(1, totalPages)}</span>
            </div>
            <button
              onClick={() => setPage((p) => (totalPages > 0 ? Math.min(totalPages, p + 1) : p + 1))}
              disabled={totalPages > 0 ? page >= totalPages : entries.length < pageSize}
              className="px-3 py-1.5 rounded bg-neutral-700 text-white text-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
