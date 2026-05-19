'use client';

import { useCart } from '@/lib/store';
import Link from 'next/link';

export default function CartSummary() {
  const { items, getTotal, getItemCount } = useCart();
  const itemCount = getItemCount();
  const total = getTotal();

  return (
    <Link href="/cart">
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
        <svg
          className="w-5 h-5 text-gray-700"
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
          <span className="text-sm font-semibold text-gray-900">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-xs text-gray-600">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
