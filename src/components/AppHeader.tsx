'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Manrope, Montserrat, Space_Grotesk } from 'next/font/google';
import CartSummary from './CartSummary';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800', '900'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] });

interface NavItem {
  label: string;
  href: string;
  isAction?: boolean;
}

interface AppHeaderProps {
  variant?: 'dark' | 'light';
}

const landingNav: NavItem[] = [
  { label: 'INICIO', href: '/' },
  { label: 'PRODUCTOS', href: '/catalog' },
  { label: 'DISEÑADOR', href: '/designer' },
  { label: 'PROCESO', href: '/#proceso' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'CONTACTO', href: '/#contacto', isAction: true },
];

const ecommerceNav: NavItem[] = [
  { label: 'INICIO', href: '/' },
  { label: 'CATÁLOGO', href: '/catalog' },
  { label: 'DISEÑADOR', href: '/designer' },
];

export default function AppHeader({ variant = 'dark' }: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === '/' || pathname.startsWith('/template');
  const navItems = isLanding ? landingNav : ecommerceNav;
  const isLight = variant === 'light';

  return (
    <>
      <header className={`fixed left-0 right-0 top-0 z-50 backdrop-blur-xl ${isLight
        ? 'border-b border-gray-200 bg-white/95 text-[#1a1a1a]'
        : 'border-b border-[#ff4f00]/35 bg-[#131313]/92 shadow-[0_6px_26px_rgba(255,79,0,0.18)] text-white'
      }`}>
        <nav className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 md:px-16">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/textures/camiart-logo.png"
              alt="CamiArt Logo"
              className="h-10 w-10 object-contain"
            />
            <span className={`${montserrat.className} text-xl font-extrabold tracking-tight text-[#ff4f00]`}>CAMIART</span>
          </Link>

          <div className={`${spaceGrotesk.className} hidden items-center gap-8 text-sm tracking-[0.1em] md:flex`}>
            {navItems.map((item) => (
              item.isAction ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-[#ff4f00] px-6 py-2 font-bold text-[#0A0A0A] transition hover:scale-105"
                >
                  {item.label}
                </Link>
              ) : (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={`font-bold transition-colors ${
                        pathname === item.href
                          ? 'text-[#ff4f00]'
                          : isLight
                            ? 'text-gray-600 hover:text-[#ff4f00]'
                            : 'text-[#e2e2e2]/70 hover:text-[#e2e2e2]'
                      }`}
                    >
                      {item.label}
                    </Link>
              )
            ))}
            {!isLanding && <CartSummary />}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-md border border-[#ff4f00]/45 bg-[#ff4f00]/10 p-1.5 text-[#ff4f00] md:hidden"
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </nav>

        {isMenuOpen && (
          <div
            className={`${spaceGrotesk.className} fixed inset-0 z-[120] bg-[#0b0b0b] px-5 pb-8 pt-24 md:hidden`}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-center justify-between border-b border-[#ff4f00]/35 pb-4">
              <p className="text-xs font-bold tracking-[0.14em] text-[#ff4f00]">NAVEGACION</p>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md border border-[#ff4f00]/45 bg-[#ff4f00]/10 px-4 py-2 text-xs font-bold tracking-[0.1em] text-[#ff4f00]"
              >
                CERRAR
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm tracking-[0.1em]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-md border px-4 py-4 ${
                    item.isAction
                      ? 'border-transparent bg-[#ff4f00] font-bold text-[#0A0A0A] text-center'
                      : 'border-[#ff4f00]/30 bg-[#1a1a1a] text-[#e2e2e2]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <div className="h-20" />
    </>
  );
}
