/**
 * Ecommerce header — Next.js Link routing, CartSummary, catalog navigation.
 * Usado en las páginas de tienda (/catalog, /cart, /checkout, /products/*).
 * No usar en la landing page — ver src/app/components/Header.tsx.
 */
'use client';

import Link from 'next/link';
import CartSummary from './CartSummary';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-cami-950/78 shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/70 to-transparent" aria-hidden="true" />
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/" className="inline-flex items-center gap-3 text-white transition-colors hover:text-cami-100">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/6 text-sm font-semibold text-accent-200 shadow-glow">
              CA
            </span>
            <span>
              <span className="block font-display text-xl font-bold uppercase tracking-[0.18em] text-white">CamiArt</span>
              <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cami-300">Catalogo y checkout</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 shadow-glow sm:flex">
            <Link
              href="/"
              className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-cami-200 transition-all hover:bg-white/8 hover:text-white"
            >
              Inicio
            </Link>
            <Link
              href="/catalog"
              className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-cami-200 transition-all hover:bg-white/8 hover:text-white"
            >
              Catalogo
            </Link>
          </div>

          {/* Cart Summary */}
          <CartSummary />
        </div>

        {/* Mobile Navigation */}
        <div className="mt-4 flex justify-between gap-4 sm:hidden">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.12em] text-cami-200 hover:text-white transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/catalog"
            className="text-sm font-semibold uppercase tracking-[0.12em] text-cami-200 hover:text-white transition-colors"
          >
            Catalogo
          </Link>
        </div>
      </nav>
    </header>
  );
}
