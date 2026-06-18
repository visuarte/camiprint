"use client";

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

const departmentLabels: Record<QueueApiItem['department'], string> = {
  PREPRESS: 'PREIMPRESIÓN',
  PRINTING: 'IMPRESIÓN',
  QA: 'CALIDAD',
  SHIPPING: 'ENVÍO',
};

const departmentOrder: QueueApiItem['department'][] = ['PREPRESS', 'PRINTING', 'QA', 'SHIPPING'];

const statusLabels: Record<QueueApiItem['queueStatus'], string> = {
  WAITING: 'EN ESPERA',
  ACTIVE: 'ACTIVO',
  BLOCKED: 'BLOQUEADO',
  DONE: 'COMPLETADO',
};

export default function AdminProductionPage() {
  const [queueItems, setQueueItems] = useState<QueueApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadDepartmentQueue = async (department: QueueApiItem['department']) => {
      const response = await fetch(`/api/v1/production/queues?department=${department}&limit=100`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Failed to load ${department}: ${response.status}`);
      }
      const payload = (await response.json()) as QueueApiResponse;
      return payload.data?.items ?? [];
    };

    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const results = await Promise.all(departmentOrder.map((department) => loadDepartmentQueue(department)));
        const merged = results.flat().sort((a, b) => {
          const departmentDiff = departmentOrder.indexOf(a.department) - departmentOrder.indexOf(b.department);
          if (departmentDiff !== 0) return departmentDiff;
          return a.position - b.position;
        });

        if (!cancelled) {
          setQueueItems(merged);
        }
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) {
          setError('No se pudo cargar la cola de producción real');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const total = queueItems.length;
    const waiting = queueItems.filter((item) => item.queueStatus === 'WAITING').length;
    const active = queueItems.filter((item) => item.queueStatus === 'ACTIVE').length;
    const blocked = queueItems.filter((item) => item.queueStatus === 'BLOCKED').length;
    const done = queueItems.filter((item) => item.queueStatus === 'DONE').length;

    const byDepartment = departmentOrder.map((department) => ({
      department,
      count: queueItems.filter((item) => item.department === department).length,
    }));

    return {
      total,
      waiting,
      active,
      blocked,
      done,
      byDepartment,
    };
  }, [queueItems]);

  const topPriority = useMemo(() => {
    return [...queueItems]
      .filter((item) => item.queueStatus !== 'DONE')
      .sort((a, b) => {
        const statusRank = (status: QueueApiItem['queueStatus']) =>
          status === 'ACTIVE' ? 0 : status === 'BLOCKED' ? 2 : 1;
        const statusDiff = statusRank(a.queueStatus) - statusRank(b.queueStatus);
        if (statusDiff !== 0) return statusDiff;
        const departmentDiff = departmentOrder.indexOf(a.department) - departmentOrder.indexOf(b.department);
        if (departmentDiff !== 0) return departmentDiff;
        return a.position - b.position;
      })
      .slice(0, 5);
  }, [queueItems]);

  const queueTone = (status: QueueApiItem['queueStatus']) => {
    if (status === 'ACTIVE') return 'text-hazard-orange border-hazard-orange/40 bg-hazard-orange/10';
    if (status === 'BLOCKED') return 'text-red-300 border-red-500/50 bg-red-500/10';
    if (status === 'DONE') return 'text-green-400 border-green-500/40 bg-green-500/10';
    return 'text-gray-600 border-muted-steel/20 bg-surface-container-lowest';
  };

  return (
    <div className="p-8 md:p-14 flex flex-col gap-10">
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <div className="xl:col-span-8 border border-hazard-orange/30 bg-surface-charcoal p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-hazard-orange" />
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">LÍNEA DE PRODUCCIÓN</p>
              <h1 className="font-headline-md text-[28px] md:text-[34px] text-gray-900 leading-none">
                ESTADO DE LA COLA REAL
              </h1>
            </div>
            <Link
              href="/admin/orders"
              className="h-9 inline-flex items-center px-4 border border-muted-steel/20 text-gray-600 font-label-caps text-[11px] leading-none hover:bg-surface-container-high transition-colors"
            >
              VER PEDIDOS →
            </Link>
          </div>

          <p className="max-w-2xl text-gray-600 text-[15px] leading-6">
            Esta vista se alimenta de la cola real de producción. No hay cifras ni bloques inventados: todo proviene del estado actual de PREPRESS, PRINTING, QA y SHIPPING.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.byDepartment.map((stage) => (
              <div key={stage.department} className="border border-muted-steel/10 bg-surface-container-lowest p-4">
                <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">{departmentLabels[stage.department]}</p>
                <p className="font-display-lg text-[34px] leading-none font-black text-gray-900">
                  {String(stage.count).padStart(2, '0')}
                </p>
                <p className="mt-2 text-gray-600 text-[12px]">
                  {stage.count === 0 ? 'Sin tickets aún' : `${stage.count} ticket${stage.count === 1 ? '' : 's'} en cola`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="xl:col-span-4 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7 flex flex-col gap-4">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em]">SALUD DE LA COLA</p>
          <div className="space-y-3">
            {[
              { label: 'EN ESPERA', value: summary.waiting, percent: summary.total ? (summary.waiting / summary.total) * 100 : 0, tone: 'bg-surface-bright' },
              { label: 'ACTIVO', value: summary.active, percent: summary.total ? (summary.active / summary.total) * 100 : 0, tone: 'bg-hazard-orange' },
              { label: 'BLOQUEADO', value: summary.blocked, percent: summary.total ? (summary.blocked / summary.total) * 100 : 0, tone: 'bg-red-500' },
              { label: 'COMPLETADO', value: summary.done, percent: summary.total ? (summary.done / summary.total) * 100 : 0, tone: 'bg-green-500' },
            ].map((entry) => (
              <div key={entry.label}>
                <div className="flex justify-between items-center mb-2 text-gray-600 text-[11px] font-label-caps">
                  <span>{entry.label}</span>
                  <span>{entry.value}</span>
                </div>
                <div className="h-2 bg-surface-bright border border-muted-steel/20 p-[2px]">
                  <div className={`h-full ${entry.tone}`} style={{ width: `${Math.max(4, entry.percent)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 border-t border-muted-steel/10 pt-4">
            <p className="font-label-caps text-[10px] text-gray-600 tracking-[0.08em] mb-3">FUENTE REAL</p>
            <ul className="space-y-3 text-gray-600 text-[13px] leading-5">
              <li>• Departamentos leídos desde <span className="text-gray-900">/api/v1/production/queues</span>.</li>
              <li>• La prioridad se deriva del estado y la posición reales.</li>
              <li>• Si no hay cola, la UI muestra un vacío honesto.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="font-headline-md text-[22px] md:text-[26px] leading-none text-gray-900">
              COLA DE PRODUCCIÓN
            </h2>
            <span className="font-label-caps text-[10px] text-gray-600 tracking-[0.08em]">VISTA EN VIVO</span>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 bg-surface-container-lowest border border-muted-steel/10" />
              ))}
            </div>
          ) : error ? (
            <div className="border border-red-700/50 bg-red-900/20 p-4 text-red-200 text-sm">
              {error}
            </div>
          ) : queueItems.length === 0 ? (
            <div className="border border-muted-steel/10 bg-surface-container-lowest p-6 text-gray-600 text-sm">
              No hay tickets en cola ahora mismo.
            </div>
          ) : (
            <div className="space-y-4">
              {queueItems.map((item) => (
                <article key={item.queueItemId} className="border border-muted-steel/10 bg-surface-container-lowest p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">
                        {item.jobTicketId.slice(0, 8).toUpperCase()}
                      </p>
                      <h3 className="text-[15px] md:text-[16px] text-gray-900 font-semibold leading-snug">
                        Ticket #{item.position}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-label-caps text-[10px] text-gray-600 tracking-[0.08em]">{departmentLabels[item.department]}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 border text-[10px] font-label-caps tracking-[0.08em] ${queueTone(item.queueStatus)}`}>
                        {statusLabels[item.queueStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-surface-bright border border-muted-steel/20 p-[2px]">
                      <div
                        className={`h-full ${item.queueStatus === 'ACTIVE' ? 'bg-hazard-orange' : item.queueStatus === 'BLOCKED' ? 'bg-red-500' : item.queueStatus === 'DONE' ? 'bg-green-500' : 'bg-[#D8DEE8]'}`}
                        style={{ width: `${item.queueStatus === 'DONE' ? 100 : item.queueStatus === 'ACTIVE' ? 70 : item.queueStatus === 'BLOCKED' ? 40 : 25}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-label-caps text-[11px] text-gray-600">P{item.position}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-4 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <div className="flex items-end justify-between gap-4 mb-5">
              <h2 className="font-headline-md text-[22px] md:text-[26px] leading-none text-gray-900">
                ÓRDEN DE PRIORIDAD
              </h2>
          </div>

          <div className="space-y-3">
            {topPriority.length === 0 ? (
              <div className="border border-muted-steel/10 bg-surface-container-lowest p-4 text-gray-600 text-sm">
                Sin tickets prioritizados todavía.
              </div>
            ) : (
              topPriority.map((item, index) => (
                <div key={item.queueItemId} className="border border-muted-steel/10 bg-surface-container-lowest p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-1">
                        #{index + 1} · {departmentLabels[item.department]}
                      </p>
                      <p className="text-[13px] text-gray-900 font-semibold truncate">
                        Ticket {item.jobTicketId.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <span className="font-headline-md text-[18px] text-gray-900 font-bold">
                      P{item.position}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-muted-steel/10 pt-4">
            <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">ACCIONES REALES</p>
            <div className="space-y-2">
              <Link href="/admin/orders" className="block h-10 px-4 border border-muted-steel/20 text-gray-600 font-label-caps text-[11px] tracking-[0.08em] hover:bg-surface-container-high transition-colors leading-[40px]">
                REVISAR PEDIDOS →
              </Link>
              <Link href="/admin/inventory" className="block h-10 px-4 border border-muted-steel/20 text-gray-600 font-label-caps text-[11px] tracking-[0.08em] hover:bg-surface-container-high transition-colors leading-[40px]">
                VER INVENTARIO →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}