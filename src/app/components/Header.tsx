/**
 * Landing page header — anchor links only, no Next.js routing.
 * Usado en la página de inicio (/) para navegar entre secciones de la landing.
 * No incluye carrito ni navegación de catálogo.
 */
'use client';

import { useState } from 'react';
import { brandConfig } from '@/config/brand';

const navItems = [
  { label: 'Haz tu pedido', href: '#contacto' },
  { label: 'Clientes', href: '#testimonios' },
  { label: 'Productos', href: '#ofertas' },
  { label: 'Sobre nosotros', href: '#proceso' },
  { label: 'Precios', href: '#ofertas' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-cami-950/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <a href="#inicio" className="text-2xl font-bold tracking-tight text-white">
          {brandConfig.displayName}
        </a>

        <nav className="hidden items-center gap-3 text-sm text-cami-200 md:flex">
          {navItems.map((item, index) => (
            <div key={item.label} className="flex items-center gap-3">
              <a href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </a>
              {index < navItems.length - 1 && <span className="text-cami-700">|</span>}
            </div>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white md:hidden"
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6l-12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-white/10 bg-cami-950/95 px-4 py-4 md:hidden">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-cami-100 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
