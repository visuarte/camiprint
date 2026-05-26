 'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { brandConfig } from '@/config/brand';

const MOBILE_HEADER_HEIGHT = 73;

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigationLinks = [
    { href: '#inicio', label: 'Inicio' },
    { href: '#ofertas', label: 'Ofertas' },
    { href: '#proceso', label: 'Proceso' },
    { href: '#testimonios', label: 'Testimonios' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contacto', label: 'Contacto' },
  ];

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isMobileMenuOpen]);

  // Evitar scroll de fondo y cerrar menú al pasar a desktop.
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  // Cerrar menú al hacer click en un enlace
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Scroll suave con offset para navegación
  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only intercept hash navigation (in-page). External links and full paths should follow the default behavior.
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-cami-950/70 shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/70 to-transparent" aria-hidden="true" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="#inicio" className="inline-flex items-center gap-3 text-white transition-colors hover:text-cami-100">
            <Image src="/icons/logo.svg" alt={brandConfig.displayName} width={44} height={44} className="rounded-2xl bg-white/6 p-1" />
            <span>
              <span className="block font-display text-xl font-bold uppercase tracking-[0.18em] text-white">{brandConfig.displayName}</span>
              <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cami-300">Uniformidad textil B2B</span>
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 shadow-glow md:flex md:space-x-1">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavigate(e, link.href)}
              className="rounded-full px-4 py-2 text-sm font-semibold tracking-[0.08em] text-cami-200 transition-all hover:bg-white/8 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex">
          <a
            href="#contacto"
            onClick={(e) => handleNavigate(e, '#contacto')}
            className="rounded-full border border-accent-300/30 bg-metal-button px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 shadow-metal transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            Solicitar Cotización
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-2xl border border-white/15 bg-white/5 p-2 text-cami-100 transition-colors hover:bg-white/10 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-main-menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 top-[73px] bg-black/55 backdrop-blur-[1px]" aria-hidden="true" />

          <div
            id="mobile-main-menu"
            ref={menuRef}
            className="mobile-nav-panel animate-slideDown fixed left-0 right-0 top-[73px] border-b border-white/10 bg-cami-950/96 shadow-glow"
            style={{ '--mobile-header-height': `${MOBILE_HEADER_HEIGHT}px` } as React.CSSProperties}
          >
            <div className="space-y-3 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    handleNavigate(e, link.href);
                    handleLinkClick();
                  }}
                  className="touch-target block rounded-2xl border border-transparent bg-white/[0.03] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={(e) => {
                  handleNavigate(e, '#contacto');
                  handleLinkClick();
                }}
                className="touch-target block w-full rounded-2xl border border-accent-300/30 bg-metal-button px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 shadow-metal transition-all hover:brightness-110"
              >
                Solicitar Cotización
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
