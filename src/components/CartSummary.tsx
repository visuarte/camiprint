'use client';

import { useCart } from '@/lib/store';
import { formatEUR } from '@/lib/format';
import Link from 'next/link';

export default function CartSummary() {
  const { getTotal, getItemCount } = useCart();
  const itemCount = getItemCount();
  const total = getTotal();

  return (
    <Link href="/cart">
      <div className="flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 shadow-glow transition-all hover:bg-white/[0.1]">
        <svg
          className="h-5 w-5 text-cami-200"
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
        
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {itemCount} {itemCount === 1 ? 'prenda' : 'prendas'}
          </span>
          <span className="text-xs text-orange-300">
            {formatEUR(total)}
          </span>
        </div>
      </div>
    </Link>
  );
}
