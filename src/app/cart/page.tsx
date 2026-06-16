'use client';

import { useCart } from '@/lib/store';
import { formatEUR } from '@/lib/format';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-transparent pt-24 pb-16 text-cami-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 font-display text-4xl font-bold text-gray-900">Tu seleccion corporativa</h1>
          
          <div className="rounded-[1.75rem] border border-gray-200/10 bg-cami-900/60 p-8 text-center shadow-glow">
            <svg className="mx-auto mb-4 h-16 w-16 text-cami-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Aun no has anadido prendas</h2>
            <p className="mb-6 text-cami-300">Selecciona modelos del catalogo para preparar tu pedido y pasar al checkout.</p>
            <Link
              href="/catalog"
              className="inline-flex rounded-full border border-accent-300/30 bg-metal-button px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 shadow-metal transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Ir al catalogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-16 text-cami-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cami-300">Revision del pedido</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-gray-900">Carrito de compra</h1>
          </div>
          <p className="max-w-xl text-sm leading-7 text-cami-300">
            Ajusta cantidades, revisa tallas y confirma el importe antes de pasar al checkout seguro.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-[1.5rem] border border-gray-200/10 bg-cami-900/60 shadow-glow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200/10 bg-cami-950/55">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-cami-300">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-cami-300">Talla</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-cami-300">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-cami-300">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-cami-300">Total</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/[0.03]">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.productName}</td>
                        <td className="px-6 py-4 text-sm text-cami-300">{item.size}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 rounded-xl border border-gray-200/12 bg-cami-950/60 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-cami-200">{formatEUR(item.price)}</td>
                        <td className="px-6 py-4 text-sm text-cami-200">
                          {formatEUR(item.price * item.quantity)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="font-medium text-red-300 transition-colors hover:text-red-200"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/catalog"
                className="inline-flex items-center font-medium text-cami-200 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al catalogo
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-[1.5rem] border border-gray-200/10 bg-cami-900/60 p-6 shadow-glow">
              <h2 className="mb-6 font-display text-2xl text-gray-900">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-cami-300">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} prendas)</span>
                  <span>{formatEUR(total)}</span>
                </div>
                <div className="flex justify-between text-cami-300">
                  <span>Envio</span>
                  <span className="font-medium text-emerald-300">Incluido</span>
                </div>
              </div>

              <div className="mb-6 border-t border-gray-200/10 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatEUR(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mb-3 block w-full rounded-full border border-accent-300/30 bg-metal-button py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 shadow-metal transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Ir al checkout
              </Link>

              <button
                onClick={clearCart}
                className="w-full rounded-full border border-gray-200/15 bg-gray-50/[0.05] py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 transition-all hover:bg-gray-50/[0.1]"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
