'use client'

import { useEffect, useState, useCallback } from 'react'

interface PricingItem {
  id: string
  sku: string
  source: string
  productName: string | null
  costPrice: number
  printingCost: number
  marginMarkup: number
  fixedMargin: number | null
  publicPrice: number | null
  baseCost: number
  calculatedPrice: number
  profit: number
  profitMargin: number
}

export default function PricingManager() {
  const [items, setItems] = useState<PricingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editSku, setEditSku] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [bulkDialog, setBulkDialog] = useState(false)
  const [bulkMargin, setBulkMargin] = useState('0.6')
  const [simulator, setSimulator] = useState<{ sku: string; cost: number; printing: number; margin: number } | null>(null)

  const fetchPricing = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pricing?limit=200')
      const data = await res.json()
      if (data.ok) setItems(data.items)
    } catch {
      console.error('Error fetching pricing')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPricing() }, [fetchPricing])

  const handleSave = async (sku: string) => {
    try {
      await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, ...editForm }),
      })
      setEditSku(null)
      fetchPricing()
    } catch {
      console.error('Save failed')
    }
  }

  const handleBulkApply = async () => {
    try {
      const margin = parseFloat(bulkMargin)
      for (const item of items) {
        await fetch('/api/admin/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sku: item.sku, marginMarkup: margin }),
        })
      }
      setBulkDialog(false)
      fetchPricing()
    } catch {
      console.error('Bulk apply failed')
    }
  }

  const openEdit = (item: PricingItem) => {
    setEditSku(item.sku)
    setEditForm({
      costPrice: item.costPrice,
      printingCost: item.printingCost,
      marginMarkup: item.marginMarkup,
      fixedMargin: item.fixedMargin,
      publicPrice: item.publicPrice,
      productName: item.productName || '',
    })
  }

  const sim = simulator
  const simResult = sim
    ? sim.margin > 0
      ? { base: sim.cost + sim.printing, price: (sim.cost + sim.printing) * (1 + sim.margin), margin: sim.margin }
      : { base: sim.cost + sim.printing, price: sim.cost + sim.printing + Math.abs(sim.margin), margin: sim.margin }
    : null

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Cargando precios...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} productos con precio</p>
        <button onClick={() => setBulkDialog(true)}
          className="rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-gray-800">
          Aplicar Margen Masivo
        </button>
      </div>

      {/* Simulador en tiempo real */}
      {simulator && (
        <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Simulador de Beneficio</p>
              <p className="mt-1 text-sm text-gray-600">SKU: {simulator.sku}</p>
            </div>
            <button onClick={() => setSimulator(null)} className="text-blue-400 hover:text-blue-600">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {simResult && (
            <div className="mt-3 grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-white p-3 text-center">
                <p className="text-[10px] font-bold uppercase text-gray-500">Costo Base</p>
                <p className="text-lg font-black text-gray-800">{simResult.base.toFixed(2)}€</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center">
                <p className="text-[10px] font-bold uppercase text-gray-500">Margen</p>
                <p className="text-lg font-black text-blue-600">{simResult.margin > 0 ? `${Math.round(simResult.margin * 100)}%` : `${Math.abs(simResult.margin).toFixed(2)}€ fijo`}</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center">
                <p className="text-[10px] font-bold uppercase text-gray-500">Precio Público</p>
                <p className="text-lg font-black text-gray-800">{simResult.price.toFixed(2)}€</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center">
                <p className="text-[10px] font-bold uppercase text-gray-500">Beneficio Neto</p>
                <p className="text-lg font-black text-green-600">{(simResult.price - simResult.base).toFixed(2)}€</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk dialog */}
      {bulkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Margen Masivo</h3>
            <p className="mt-1 text-sm text-gray-500">Aplica un margen a todos los productos</p>
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Margen (%)</label>
              <input type="number" step="0.01" min="0" max="10" value={bulkMargin}
                onChange={(e) => setBulkMargin(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setBulkDialog(false)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600">Cancelar</button>
              <button onClick={handleBulkApply}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white">Aplicar</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">SKU</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Origen</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Costo Base</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Estampación</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Margen</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Precio Público</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Beneficio</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                {editSku === item.sku ? (
                  <>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                    <td className="px-4 py-3">
                      <input value={editForm.productName} onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                        className="w-32 rounded border border-gray-200 px-2 py-1 text-xs" placeholder="Nombre Camiart" />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{item.source}</td>
                    <td className="px-4 py-3">
                      <input type="number" step="0.01" value={editForm.costPrice} onChange={(e) => setEditForm({ ...editForm, costPrice: parseFloat(e.target.value) || 0 })}
                        className="w-20 rounded border border-gray-200 px-2 py-1 text-xs" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" step="0.01" value={editForm.printingCost} onChange={(e) => setEditForm({ ...editForm, printingCost: parseFloat(e.target.value) || 0 })}
                        className="w-20 rounded border border-gray-200 px-2 py-1 text-xs" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 items-center">
                        <input type="number" step="0.01" value={editForm.marginMarkup} onChange={(e) => setEditForm({ ...editForm, marginMarkup: parseFloat(e.target.value) || 0 })}
                          className="w-16 rounded border border-gray-200 px-2 py-1 text-xs" />
                        <span className="text-[10px] text-gray-400">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" step="0.01" value={editForm.publicPrice || ''} onChange={(e) => setEditForm({ ...editForm, publicPrice: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-20 rounded border border-gray-200 px-2 py-1 text-xs" placeholder="Auto" />
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleSave(item.sku)} className="rounded bg-green-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-green-600">Guardar</button>
                        <button onClick={() => setEditSku(null)} className="rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500">Cancelar</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.productName || item.sku}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        item.source === 'gor' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.source === 'gor' ? 'GOR' : 'Local'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.costPrice.toFixed(2)}€</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.printingCost.toFixed(2)}€</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-bold text-blue-600">
                        {item.fixedMargin != null ? `${item.fixedMargin.toFixed(2)}€` : `${Math.round(item.marginMarkup * 100)}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-bold text-gray-900">{item.calculatedPrice.toFixed(2)}€</span>
                      {item.publicPrice != null && <span className="ml-1 text-[9px] text-amber-500">manual</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-bold text-green-600">{item.profit.toFixed(2)}€</span>
                      <span className="ml-1 text-[10px] text-green-400">({item.profitMargin}%)</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)}
                          className="rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-100">Editar</button>
                        <button onClick={() => setSimulator({ sku: item.sku, cost: item.costPrice, printing: item.printingCost, margin: item.marginMarkup })}
                          className="rounded border border-blue-200 px-2 py-1 text-[10px] text-blue-500 hover:bg-blue-50">Simular</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
