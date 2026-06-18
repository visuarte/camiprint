'use client';

import Link from 'next/link';
import { useCart } from '@/lib/store';
import { StripeWrapper } from '@/components/StripeWrapper';
import { CheckoutForm } from '@/components/CheckoutForm';
import { useSyncExternalStore } from 'react';

export default function CheckoutPage() {
  const { items, getTotal } = useCart();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-transparent pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-1/4 rounded bg-cami-800"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-[1.5rem] bg-cami-900/60 p-6">
                  <div className="mb-4 h-6 w-1/2 rounded bg-cami-800"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded bg-cami-800"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-64 rounded-[1.5rem] bg-cami-900/60 p-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si el carrito está vacío
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-transparent pt-24 pb-16 text-cami-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 font-display text-4xl font-bold text-gray-900">Checkout seguro</h1>

          <div className="rounded-[1.75rem] border border-gray-200/10 bg-cami-900/60 p-8 text-center shadow-glow">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-cami-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Tu carrito esta vacio</h2>
            <p className="mb-6 text-cami-300">Agrega prendas al pedido antes de pasar al pago seguro.</p>
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

  const total = getTotal();

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-16 text-cami-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header con navegación */}
        <div className="mb-12">
          <Link
            href="/cart"
            className="mb-8 inline-flex items-center font-medium text-cami-200 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Carrito
          </Link>

          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cami-300">Pago corporativo</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-gray-900">Checkout seguro</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-cami-300">Completa tu pedido con un flujo claro, pago protegido por Stripe y resumen detallado antes de confirmar.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Checkout */}
          <div className="lg:col-span-2">
            <StripeWrapper>
              <CheckoutForm />
            </StripeWrapper>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 h-fit rounded-[1.5rem] border border-gray-200/10 bg-cami-900/60 p-6 shadow-glow">
              <h2 className="mb-6 font-display text-2xl text-gray-900">Resumen del pedido</h2>

              {/* Items */}
              <div className="mb-6 max-h-64 space-y-4 overflow-y-auto border-b border-gray-200/10 pb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-cami-300">
                        {item.size} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Detalles de envío */}
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-cami-300">
                  <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} artículos)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cami-300">
                  <span>Envío</span>
                  <span className="font-medium text-emerald-300">Gratis</span>
                </div>
                <div className="flex justify-between text-cami-300">
                  <span>Impuesto estimado</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200/10 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${(total * 1.08).toFixed(2)}</span>
                </div>
              </div>

              {/* Garantía */}
              <div className="mt-6 space-y-3 border-t border-gray-200/10 pt-6 text-xs text-cami-300">
                <div className="flex items-start">
                  <svg className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Pago seguro con Stripe</span>
                </div>
                <div className="flex items-start">
                  <svg className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Encriptación SSL 256-bit</span>
                </div>
                <div className="flex items-start">
                  <svg className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Garantía de comprador protegida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
