'use client'

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type QueueApiItem = {
  queueItemId: string;
  jobTicketId: string;
  department: 'PREPRESS' | 'PRINTING' | 'QA' | 'SHIPPING';
  queueStatus: 'WAITING' | 'ACTIVE' | 'BLOCKED' | 'DONE';
  position: number;
};

type QueueApiResponse = {
  ok: boolean;
  data?: {
    items: QueueApiItem[];
    nextCursor: string | null;
  };
};

const DEPARTMENTS: Array<{ key: string; label: string }> = [
  { key: 'PREPRESS', label: 'Preimpresión' },
  { key: 'PRINTING', label: 'Impresión' },
  { key: 'QA', label: 'Control Calidad' },
  { key: 'SHIPPING', label: 'Envío' },
];

const STATUS_BADGE: Record<string, string> = {
  WAITING: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  DONE: 'bg-green-100 text-green-700',
};

async function fetchQueue(): Promise<Record<string, QueueApiItem[]>> {
  const result: Record<string, QueueApiItem[]> = {};
  for (const dept of DEPARTMENTS) {
    try {
      const res = await fetch(`/api/v1/production/queues?department=${dept.key}&limit=100`);
      const data: QueueApiResponse = await res.json();
      result[dept.key] = data.data?.items || [];
    } catch {
      result[dept.key] = [];
    }
  }
  return result;
}

export default function LegacyQueueView() {
  const [queues, setQueues] = useState<Record<string, QueueApiItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue().then((data) => { setQueues(data); setLoading(false); });
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const [dept, items] of Object.entries(queues)) {
      c[dept] = items.filter(i => i.queueStatus !== 'DONE').length;
    }
    return c;
  }, [queues]);

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Cargando cola de producción...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {DEPARTMENTS.map((d) => (
          <div key={d.key} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{d.label}</p>
            <p className="mt-1 text-3xl font-black text-gray-900">{counts[d.key] || 0}</p>
            <p className="text-[10px] text-gray-400">pendientes</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {DEPARTMENTS.map((dept) => {
          const items = queues[dept.key] || [];
          return (
            <div key={dept.key} className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="text-sm font-bold text-gray-800">{dept.label}</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {items.length === 0 && (
                  <p className="px-4 py-8 text-center text-xs text-gray-400">Sin tickets</p>
                )}
                {items.map((item) => (
                  <div key={item.queueItemId} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-gray-500">#{item.jobTicketId.slice(-6)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[item.queueStatus] || ''}`}>
                        {item.queueStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">Posición {item.position}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link href="/admin/orders" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          Ver todos los pedidos →
        </Link>
      </div>
    </div>
  );
}
