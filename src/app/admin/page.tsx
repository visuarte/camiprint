'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Metrics {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/metrics', {
          headers: {
            'Authorization': `Bearer ${getCookie('admin_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError('Error al cargar métricas');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

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

  if (error || !metrics) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
          {error || 'Error al cargar el dashboard'}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Órdenes (últimos 30 días)',
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
  ];

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-neutral-400 mb-8">Resumen de órdenes y métricas clave</p>

      {/* Stat Cards */}
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

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/orders"
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition">
                Ver Todas las Órdenes
              </h3>
              <p className="text-sm text-neutral-400">
                Gestiona y filtra todas tus órdenes
              </p>
            </div>
            <span className="text-3xl">→</span>
          </div>
        </Link>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Información Útil</h3>
          <ul className="text-sm text-neutral-400 space-y-2">
            <li>• Promedio por orden: ${metrics.averageOrderValue.toFixed(2)}</li>
            <li>• Tasa de conversión: {metrics.totalOrders > 0 ? ((metrics.paidOrders / metrics.totalOrders) * 100).toFixed(1) : 0}%</li>
            <li>• Últimos 30 días</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}
