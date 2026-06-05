'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from './auth-client';

interface Metrics {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface Settings {
  showMetrics: boolean;
  refreshIntervalSeconds: number;
  analyticsEnabled: boolean;
  metricsWindowDays: number;
  language: 'es-ES' | 'en-US';
  currency: 'EUR' | 'USD';
  timezone: string;
  adminEmail: string | null;
}

interface QuoteLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  quantity: string;
  message?: string;
  status: string;
  createdAt: string;
}

// ── Status badge helper ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === 'paid' || s === 'shipped' || s === 'completed')
    return (
      <span className="px-3 py-1 bg-green-500/10 border border-green-500 text-green-500 font-label-caps text-[10px]">
        SHIPPED
      </span>
    );
  if (s === 'pending' || s === 'new')
    return (
      <span className="px-3 py-1 bg-muted-steel/10 border border-muted-steel text-muted-steel font-label-caps text-[10px]">
        PENDING
      </span>
    );
  return (
    <span className="px-3 py-1 bg-hazard-orange/10 border border-hazard-orange text-hazard-orange font-label-caps text-[10px]">
      {status.toUpperCase()}
    </span>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [settings, setSettings] = useState<Settings>({
    showMetrics: true,
    refreshIntervalSeconds: 30,
    analyticsEnabled: false,
    metricsWindowDays: 30,
    language: 'es-ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    adminEmail: null,
  });
  const [quotes, setQuotes] = useState<QuoteLead[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMetrics = useCallback(async (days: number) => {
    try {
      const response = await adminFetch(`/api/admin/metrics?days=${days}`);
      if (response.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!response.ok) throw new Error(`${response.status}`);
      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError('Error al cargar métricas');
      console.error(err);
    }
  }, []);

  const fetchQuotes = useCallback(async () => {
    try {
      setQuotesLoading(true);
      const response = await adminFetch('/api/admin/quotes');
      if (!response.ok) throw new Error(`${response.status}`);
      const body = await response.json();
      setQuotes(body.data ?? []);
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  // Load settings first, then kick off metrics + auto-refresh
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = await adminFetch('/api/admin/settings');
        if (res.ok) {
          const s: Settings = await res.json();
          if (!cancelled) setSettings(s);
          await fetchMetrics(s.metricsWindowDays);
        } else {
          await fetchMetrics(30);
        }
      } catch {
        await fetchMetrics(30);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    fetchQuotes();
    return () => { cancelled = true; };
  }, [fetchMetrics, fetchQuotes]);

  // Auto-refresh whenever refreshIntervalSeconds changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (settings.refreshIntervalSeconds > 0) {
      timerRef.current = setInterval(
        () => fetchMetrics(settings.metricsWindowDays),
        settings.refreshIntervalSeconds * 1000
      );
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [settings.refreshIntervalSeconds, settings.metricsWindowDays, fetchMetrics]);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-surface-container-high rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-surface-container-high rounded" />)}
        </div>
        <div className="h-64 bg-surface-container-high rounded" />
      </div>
    );
  }

  // ── Hero metric cards ─────────────────────────────────────────────────────
  const totalOrders = metrics?.totalOrders ?? 0;
  const paidOrders  = metrics?.paidOrders  ?? 0;
  const revenue     = metrics?.totalRevenue ?? 0;
  const locale = settings.language || 'es-ES';
  const currency = settings.currency || 'EUR';
  const timeZone = settings.timezone || 'Europe/Madrid';

  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div className="p-8 md:p-14 flex flex-col gap-10">

      {error && (
        <div className="border border-red-700 bg-red-900/30 text-red-300 font-label-caps text-[12px] px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Hero Metric Cards ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

        {/* Total Active Orders */}
        <div className="min-h-[204px] p-5 border border-hazard-orange/30 bg-surface-charcoal relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-hazard-orange/5 blur-3xl rounded-full" />
          <p className="font-label-caps text-[10px] text-hazard-orange mb-2 tracking-[0.08em]">
            TOTAL ACTIVE ORDERS
          </p>
          <div className="flex items-end gap-3">
            <span
              className="font-display-lg text-[44px] md:text-[48px] font-black text-hazard-orange leading-none"
              style={{ textShadow: '0 0 10px rgba(255,79,0,0.6)' }}
            >
              {totalOrders.toLocaleString(locale)}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 h-1 bg-hazard-orange" />
            <div className="flex-1 h-1 bg-hazard-orange/30" />
            <div className="flex-1 h-1 bg-hazard-orange/30" />
          </div>
        </div>

        {/* Paid Orders */}
        <div className="min-h-[204px] p-5 border border-muted-steel/10 bg-surface-charcoal flex flex-col justify-between">
          <div>
            <p className="font-label-caps text-[10px] text-hazard-orange mb-2 tracking-[0.08em]">PAID ORDERS</p>
            <h3 className="font-headline-md text-[27px] md:text-[31px] text-white leading-none">
              {paidOrders.toLocaleString(locale)} / {totalOrders.toLocaleString(locale)}
            </h3>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center font-label-caps text-[10px] mb-2 gap-2">
              <span className="text-[#D8DEE8]">CONVERSION</span>
              <span className="text-hazard-orange">
                {totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="w-full bg-surface-bright h-3 border border-muted-steel/20 p-[2px]">
              <div
                className="h-full bg-hazard-orange relative overflow-hidden"
                style={{ width: totalOrders > 0 ? `${(paidOrders / totalOrders) * 100}%` : '0%' }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background:
                      'repeating-linear-gradient(45deg,#FF4F00,#FF4F00 10px,#000 10px,#000 20px)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="min-h-[204px] p-5 border border-muted-steel/10 bg-surface-charcoal flex flex-col justify-between">
          <p className="font-label-caps text-[10px] text-hazard-orange mb-2 tracking-[0.08em]">TOTAL REVENUE</p>
          <div>
            <p
              className="font-display-lg text-[35px] md:text-[39px] font-black text-white leading-none"
            >
              {formatCurrency(revenue)}
            </p>
            <p className="font-label-caps text-[10px] text-[#D8DEE8] mt-1.5">
              ÚLTIMOS {settings.metricsWindowDays} DÍAS
            </p>
          </div>
          {lastUpdated && (
            <p className="font-label-caps text-[10px] text-[#D8DEE8]/70 mt-3">
              ↻ {lastUpdated.toLocaleTimeString(locale, { timeZone })}
            </p>
          )}
          <button
            onClick={() => fetchMetrics(settings.metricsWindowDays)}
            className="mt-2 py-2 border border-hazard-orange text-hazard-orange font-label-caps text-[10px] tracking-widest hover:bg-hazard-orange hover:text-black transition-all duration-300"
          >
            REFRESH DATA
          </button>
        </div>
      </section>

      {/* ── Recent Quote Leads ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* Table */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          <div className="flex items-end justify-between gap-4">
            <h4 className="font-headline-md text-headline-md leading-none flex items-end gap-3">
              <span className="w-2 h-8 bg-hazard-orange inline-block" />
              RECENT QUOTE LEADS
            </h4>
            <div className="flex items-end gap-2">
              <button
                onClick={fetchQuotes}
                className="h-9 px-4 border border-muted-steel/20 hover:bg-surface-container-high transition-colors font-label-caps text-[11px] text-[#D8DEE8] leading-none"
              >
                ↻ RELOAD
              </button>
              <Link
                href="/admin/orders"
                className="h-9 px-4 inline-flex items-center border border-muted-steel/20 hover:bg-surface-container-high transition-colors font-label-caps text-[11px] text-[#D8DEE8] leading-none"
              >
                ALL ORDERS →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto border border-muted-steel/10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-muted-steel/10 text-left font-label-caps text-[#D8DEE8] text-[11px]">
                  <th className="py-4 px-4">ID</th>
                  <th className="py-4 px-4">CLIENT</th>
                  <th className="py-4 px-4">UNITS</th>
                  <th className="py-4 px-4">STATUS</th>
                  <th className="py-4 px-4 text-right">DATE</th>
                </tr>
              </thead>
              <tbody>
                {quotesLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#D8DEE8] font-label-caps text-[12px]">
                      LOADING…
                    </td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#D8DEE8]/70 font-label-caps text-[12px]">
                      NO QUOTE LEADS YET
                    </td>
                  </tr>
                ) : (
                  quotes.slice(0, 8).map((q) => (
                    <tr
                      key={q.id}
                      className="border-b border-muted-steel/5 hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="py-5 px-4 font-label-caps text-[11px] text-white">
                        #{q.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[14px]">{q.companyName || q.name}</span>
                          <span className="text-[11px] text-[#D8DEE8]">{q.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 font-label-caps text-[13px]">{q.quantity}</td>
                      <td className="py-5 px-4">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="py-5 px-4 text-right font-label-caps text-[11px] text-[#D8DEE8]">
                        {new Date(q.createdAt).toLocaleDateString(locale, {
                          timeZone,
                          day: '2-digit', month: 'short',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="xl:col-span-4 bg-surface-charcoal border border-muted-steel/10 flex flex-col p-5 relative overflow-hidden gap-3">
          <div
            className="absolute top-0 left-0 w-full h-1 opacity-40"
            style={{
              background:
                'repeating-linear-gradient(45deg,#FF4F00,#FF4F00 10px,#000 10px,#000 20px)',
            }}
          />
          <h4 className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em]">QUICK STATS</h4>

          {[
            { label: 'PAID ORDERS',    value: metrics?.paidOrders ?? '—',    icon: 'check_circle' },
            { label: 'PENDING',        value: metrics?.pendingOrders ?? '—', icon: 'hourglass_empty' },
            { label: 'CANCELLED',      value: metrics?.cancelledOrders ?? '—', icon: 'cancel' },
            { label: 'AVG ORDER',      value: metrics ? formatCurrency(metrics.averageOrderValue) : '—', icon: 'payments' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-2 border-b border-muted-steel/10 pb-1.5 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-hazard-orange text-[15px] leading-none">{s.icon}</span>
                <p className="font-label-caps text-[9px] text-[#D8DEE8] tracking-[0.06em] truncate">{s.label}</p>
              </div>
              <p className="font-headline-md text-[16px] text-white font-bold leading-none">{String(s.value)}</p>
            </div>
          ))}

          <Link
            href="/admin/settings"
            className="mt-1 w-full py-2.5 border border-muted-steel/20 text-muted-steel font-label-caps text-[10px] tracking-widest hover:border-hazard-orange hover:text-hazard-orange transition-all text-center"
          >
            SETTINGS →
          </Link>
        </div>
      </section>
    </div>
  );
}
