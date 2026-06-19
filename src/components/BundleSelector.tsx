'use client'

import { useState } from 'react'
import { useCart } from '@/lib/store'
import type { GorModel } from '@/components/ProductCard'

interface BundleItem {
  product: GorModel
  color: string
  size: string
}

interface BundleSelectorProps {
  models: GorModel[]
  onClose: () => void
}

const BUNDLE_DISCOUNT = 0.15 // 15% discount

export default function BundleSelector({ models, onClose }: BundleSelectorProps) {
  const { addToCart } = useCart()
  const [items, setItems] = useState<BundleItem[]>(Array(3).fill(null).map(() => ({ product: null as any, color: '', size: '' })))
  const [step, setStep] = useState(0)

  const topModels = models.slice(0, 12)

  const selectProduct = (product: GorModel) => {
    const newItems = [...items]
    newItems[step] = { product, color: product.colors[0]?.name || '', size: product.sizes[0]?.name || '' }
    setItems(newItems)
    if (step < 2) setStep(step + 1)
  }

  const changeItem = (index: number, field: keyof BundleItem, value: string) => {
    const newItems = [...items]
    if (field === 'product') {
      const product = topModels.find((m) => m.modelcode === value)
      if (product) newItems[index] = { product, color: product.colors[0]?.name || '', size: product.sizes[0]?.name || '' }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    setItems(newItems)
  }

  const totalWithoutDiscount = items.reduce((sum, item) => sum + (item.product?.priceMin || 0), 0)
  const totalWithDiscount = totalWithoutDiscount * (1 - BUNDLE_DISCOUNT)
  const savings = totalWithoutDiscount - totalWithDiscount

  const handleAddBundle = () => {
    items.forEach((item) => {
      if (item.product && item.size) {
        addToCart(
          { id: `${item.product.modelcode}-${item.size}-bundle`, name: `${item.product.modelname}`, price: item.product.priceMin || 0 },
          item.size,
          1,
        )
      }
    })
    onClose()
  }

  const allSelected = items.every((item) => item.product)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pack de 3 camisetas</h2>
            <p className="text-sm text-gray-500">Ahorra {Math.round(BUNDLE_DISCOUNT * 100)}% en tu pack</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selección interactiva paso a paso */}
          {step < 3 && (
            <div>
              <h3 className="mb-1 text-sm font-bold text-gray-800">Camiseta {step + 1}</h3>
              <p className="mb-4 text-xs text-gray-400">Elige un modelo para tu pack</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {topModels.map((m) => (
                  <button key={m.modelcode} onClick={() => selectProduct(m)}
                    className={`rounded-xl border p-3 text-left transition-all hover:border-gray-300 hover:shadow-sm ${
                      items.some((i) => i.product?.modelcode === m.modelcode) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="h-16 w-full overflow-hidden rounded-lg bg-gray-50">
                      {m.imageUrl && <img src={m.imageUrl} alt={m.modelname} className="h-full w-full object-contain p-2" />}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-gray-800 truncate">{m.modelname}</p>
                    <p className="text-[10px] text-gray-400">{m.family}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items seleccionados (personalizables) */}
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-400">
                  {i + 1}
                </div>
                {item.product ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.product.modelname}</p>
                      <div className="mt-1 flex gap-2">
                        <select value={item.product.modelcode}
                          onChange={(e) => changeItem(i, 'product', e.target.value)}
                          className="max-w-[120px] rounded-lg border border-gray-200 px-2 py-1 text-[10px]"
                        >
                          {topModels.map((m) => (
                            <option key={m.modelcode} value={m.modelcode}>{m.modelname}</option>
                          ))}
                        </select>
                        <select value={item.color}
                          onChange={(e) => changeItem(i, 'color', e.target.value)}
                          className="max-w-[100px] rounded-lg border border-gray-200 px-2 py-1 text-[10px]"
                        >
                          {item.product.colors.map((c) => (
                            <option key={c.code} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <select value={item.size}
                          onChange={(e) => changeItem(i, 'size', e.target.value)}
                          className="max-w-[80px] rounded-lg border border-gray-200 px-2 py-1 text-[10px]"
                        >
                          {item.product.sizes.map((s) => (
                            <option key={s.code} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-gray-800">{(item.product.priceMin || 0).toFixed(2)}€</span>
                  </>
                ) : (
                  <p className="flex-1 text-sm text-gray-400">Selecciona un modelo...</p>
                )}
              </div>
            ))}
          </div>

          {/* Pricing */}
          {allSelected && (
            <div className="rounded-xl border-2 border-green-100 bg-green-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Precio sin pack</span>
                <span className="text-gray-800">{totalWithoutDiscount.toFixed(2)}€</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-green-600">Descuento pack ({Math.round(BUNDLE_DISCOUNT * 100)}%)</span>
                <span className="text-green-600">-{savings.toFixed(2)}€</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-green-200 pt-3">
                <span className="text-base font-bold text-gray-900">Total pack</span>
                <span className="text-xl font-black text-green-700">{totalWithDiscount.toFixed(2)}€</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={handleAddBundle}
              disabled={!allSelected}
              className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Añadir pack al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
