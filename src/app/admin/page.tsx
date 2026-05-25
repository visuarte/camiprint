'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { adminFetch, getAdminToken } from './auth-client';

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

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [settings, setSettings] = useState<Settings>({
    showMetrics: true,
    refreshIntervalSeconds: 30,
    analyticsEnabled: false,
    metricsWindowDays: 30,
  });
  const [quotes, setQuotes] = useState<QuoteLead[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMetrics = async (days: number) => {
    try {
      const token = getAdminToken();
      if (!token) {
        setError('No autorizado. Por favor inicia sesión.');
        return;
      }
      const response = await adminFetch(`/api/admin/metrics?days=${days}`);
      if (!response.ok) throw new Error(`${response.status}`);
      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError('Error al cargar métricas');
      console.error(err);
    }
  };

  const fetchQuotes = async () => {
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
  };

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.refreshIntervalSeconds, settings.metricsWindowDays]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">{error}</div>
      </div>
    );
  }

  const statCards = metrics
    ? [
        {
          label: `Total Órdenes (últimos ${settings.metricsWindowDays} días)`,
          value: metrics.totalOrders,
          icon: '📦',
          color: 'bg-blue-900 border-blue-700',
        },
        {
          label: 'Órdenes Pagadas',
          value: metrics.paidOrders,
          icon: '✓',
          color: 'bg-green-900 border-green-700',
        },
        {
          label: 'Órdenes Pendientes',
          value: metrics.pendingOrders,
          icon: '⏳',
          color: 'bg-yellow-900 border-yellow-700',
        },
        {
          label: 'Ingresos Totales',
          value: `$${metrics.totalRevenue.toFixed(2)}`,
          icon: '💰',
          color: 'bg-emerald-900 border-emerald-700',
        },
      ]
    : [];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => fetchMetrics(settings.metricsWindowDays)}
          className="text-xs text-neutral-400 hover:text-white transition px-3 py-1 border border-neutral-700 rounded-lg"
        >
          ↻ Actualizar
        </button>
      </div>
      <p className="text-neutral-400 mb-1">Resumen de órdenes y métricas clave</p>
      <p className="text-xs text-neutral-600 mb-8">
        Ventana: {settings.metricsWindowDays} días · Refresco cada {settings.refreshIntervalSeconds}s
        {lastUpdated && ` · Actualizado ${lastUpdated.toLocaleTimeString()}`}
      </p>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-3 text-sm text-red-100 mb-6">{error}</div>
      )}

      {/* Stat Cards — respeta settings.showMetrics */}
      {settings.showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`${card.color} border rounded-lg p-6 transition hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-300 mb-2">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className="text-3xl opacity-30">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/admin/orders"
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition">
                Ver Todas las Órdenes
              </h3>
              <p className="text-sm text-neutral-400">Gestiona y filtra todas tus órdenes</p>
            </div>
            <span className="text-3xl">→</span>
          </div>
        </Link>

        {metrics && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Información Útil</h3>
            <ul className="text-sm text-neutral-400 space-y-2">
              <li>• Promedio por orden: ${metrics.averageOrderValue.toFixed(2)}</li>
              <li>
                • Tasa de conversión:{' '}
                {metrics.totalOrders > 0
                  ? ((metrics.paidOrders / metrics.totalOrders) * 100).toFixed(1)
                  : 0}
                %
              </li>
              <li>• Últimos {settings.metricsWindowDays} días</li>
            </ul>
          </div>
        )}
      </div>

      {/* Solicitudes de Cotización */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold">Solicitudes de Cotización</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {quotesLoading ? 'Cargando…' : `${quotes.length} solicitud${quotes.length !== 1 ? 'es' : ''} recibida${quotes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={fetchQuotes}
            className="text-xs text-neutral-400 hover:text-white transition px-3 py-1 border border-neutral-700 rounded-lg"
          >
            ↻ Recargar
          </button>
        </div>

        {quotesLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-neutral-800 rounded animate-pulse" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No hay solicitudes de cotización aún. Cuando alguien complete el formulario aparecerán aquí.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500 border-b border-neutral-800">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Mensaje</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-neutral-800/50 transition">
                    <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">
                      {new Date(q.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">{q.name}</td>
                    <td className="px-4 py-3 text-neutral-300">
                      <a href={`mailto:${q.email}`} className="hover:text-blue-400 transition">
                        {q.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{q.companyName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-xs font-medium border border-blue-700/40">
                        {q.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 max-w-xs truncate" title={q.message}>
                      {q.message || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-green-900/60 text-green-300 text-xs font-medium border border-green-700/40">
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
