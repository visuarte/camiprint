'use client'

import { useEffect, useState, useCallback } from 'react'

interface OrderItem {
  id: string
  orderId: string
  customerName: string
  email: string
  totalAmount: number
  productionSource: 'local' | 'gor_factory' | 'hybrid'
  status: string
  totalQuantity: number
  gorOrderRef: string | null
  trackingNumber: string | null
  trackingCarrier: string | null
  shippedAt: string | null
  createdAt: string
  designPreviewUrl: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_REVIEW: { label: 'Pendiente Revisión', color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300' },
  IN_PRODUCTION: { label: 'En Producción', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300' },
  QUALITY_CHECK: { label: 'Control Calidad', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-300' },
  READY_TO_SHIP: { label: 'Listo para Envío', color: 'text-green-700', bg: 'bg-green-100 border-green-300' },
  INCIDENT: { label: 'Incidencia', color: 'text-red-700', bg: 'bg-red-100 border-red-300' },
  COMPLETED: { label: 'Completado', color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200' },
}

const SOURCE_BADGE: Record<string, { label: string; icon: string; style: string }> = {
  local: { label: 'Taller', icon: '🏠', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  gor_factory: { label: 'Gor Factory', icon: '🏭', style: 'bg-sky-50 text-sky-700 border-sky-200' },
  hybrid: { label: 'Híbrido', icon: '🔀', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

export default function ProductionDashboard() {
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSource, setFilterSource] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [stats, setStats] = useState({ total: 0, local: 0, gor: 0, incidents: 0 })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterSource) params.set('source', filterSource)
      if (filterStatus) params.set('status', filterStatus)
      params.set('limit', '100')

      const res = await fetch(`/api/v1/admin/production?${params}`)
      const data = await res.json()
      if (data.ok) {
        setItems(data.items)
        setStats({
          total: data.total,
          local: data.items.filter((i: OrderItem) => i.productionSource === 'local').length,
          gor: data.items.filter((i: OrderItem) => i.productionSource === 'gor_factory').length,
          incidents: data.items.filter((i: OrderItem) => i.status === 'INCIDENT').length,
        })
      }
    } catch {
      console.error('Error fetching production orders')
    } finally {
      setLoading(false)
    }
  }, [filterSource, filterStatus])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSync = async (orderId: string) => {
    try {
      await fetch(`/api/admin/production/sync-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      fetchOrders()
    } catch {
      console.error('Sync failed')
    }
  }

  const statusKeys = ['PENDING_REVIEW', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY_TO_SHIP', 'INCIDENT']

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-900' },
          { label: 'Taller', value: stats.local, color: 'bg-amber-500' },
          { label: 'Gor Factory', value: stats.gor, color: 'bg-sky-500' },
          { label: 'Incidencias', value: stats.incidents, color: 'bg-red-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{s.label}</p>
            <p className={`mt-1 text-2xl font-black ${s.color === 'bg-gray-900' ? 'text-gray-900' : 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <button onClick={() => { setFilterSource(''); setFilterStatus('') }}
          className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
            !filterSource && !filterStatus ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>Ver Todo</button>
        {['local', 'gor_factory'].map((s) => (
          <button key={s} onClick={() => setFilterSource(filterSource === s ? '' : s)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              filterSource === s ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {SOURCE_BADGE[s]?.icon} {SOURCE_BADGE[s]?.label}
          </button>
        ))}
        <button onClick={() => setFilterStatus(filterStatus === 'INCIDENT' ? '' : 'INCIDENT')}
          className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
            filterStatus === 'INCIDENT' ? 'bg-red-600 text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>🔴 Incidencias</button>
        <div className="ml-auto text-xs text-gray-400">{items.length} pedidos</div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statusKeys.map((statusKey) => {
          const cfg = STATUS_CONFIG[statusKey]
          const columnItems = items.filter((i) => i.status === statusKey)

          return (
            <div key={statusKey} className="rounded-xl border border-gray-200 bg-gray-50">
              <div className={`flex items-center justify-between rounded-t-xl border-b px-4 py-3 ${cfg?.bg || 'bg-gray-100'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">{cfg?.label || statusKey}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg?.color || 'text-gray-500'} bg-white/80`}>
                  {columnItems.length}
                </span>
              </div>
              <div className="space-y-2 p-3 max-h-[600px] overflow-y-auto">
                {columnItems.length === 0 && (
                  <p className="py-8 text-center text-xs text-gray-400">Sin pedidos</p>
                )}
                {columnItems.map((item) => {
                  const sb = SOURCE_BADGE[item.productionSource] || SOURCE_BADGE.local
                  return (
                    <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-gray-400">{item.orderId}</span>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${sb.style}`}>
                          {sb.icon} {sb.label}
                        </span>
                      </div>

                      {/* Customer */}
                      <p className="mt-1.5 text-sm font-semibold text-gray-900 truncate">{item.customerName}</p>
                      <p className="text-[11px] text-gray-400">{item.totalQuantity} unidades · {(item.totalAmount || 0).toFixed(2)}€</p>

                      {/* Design preview */}
                      {item.designPreviewUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <img src={item.designPreviewUrl} alt="Diseño" className="h-10 w-10 rounded-lg border border-gray-200 object-cover" />
                          <span className="text-[10px] text-gray-400">Ver diseño</span>
                        </div>
                      )}

                      {/* Tracking */}
                      {item.trackingNumber && (
                        <div className="mt-2 rounded-md bg-gray-50 px-2 py-1.5 text-[10px]">
                          <span className="font-medium text-gray-600">{item.trackingCarrier || 'Transporte'}:</span>
                          <span className="ml-1 font-mono text-gray-500">{item.trackingNumber}</span>
                        </div>
                      )}

                      {/* GOR reference */}
                      {item.gorOrderRef && (
                        <p className="mt-1 text-[10px] text-sky-600 font-mono">Ref: {item.gorOrderRef}</p>
                      )}

                      {/* Actions */}
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => handleSync(item.id)}
                          className="flex-1 rounded-md border border-gray-200 py-1.5 text-[10px] font-medium text-gray-600 transition hover:bg-gray-50">
                          ⟳ Sincronizar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
