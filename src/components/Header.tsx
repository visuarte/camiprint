'use client';

import Link from 'next/link';
import CartSummary from './CartSummary';

export default function Header() {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">
              Camiprint
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden sm:flex gap-6 items-center">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/catalog"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Catalog
            </Link>
          </div>

          {/* Cart Summary */}
          <CartSummary />
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden flex gap-4 mt-4 justify-between">
          <Link
            href="/"
            className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/catalog"
            className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
          >
            Catalog
          </Link>
        </div>
      </nav>
    </header>
  );
}
