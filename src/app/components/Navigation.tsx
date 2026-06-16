'use client';

import { useState, useEffect } from 'react';
import { brandConfig } from '@/config/brand';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { href: '#inicio', label: 'Inicio' },
    { href: '/portfolio', label: 'Portafolio' },
    { href: '#ofertas', label: 'Ofertas' },
    { href: '#proceso', label: 'Proceso' },
    { href: '#testimonios', label: 'Testimonios' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contacto', label: 'Contacto' },
  ];

  // Cerrar menú con tecla Escape.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isMobileMenuOpen]);

  // Cerrar menú al pasar a desktop.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Cerrar menú al hacer click en un enlace
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200/10 bg-white/75 shadow-[0_14px_48px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/70 to-transparent" aria-hidden="true" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="#inicio" aria-label={brandConfig.displayName} className="inline-flex items-center gap-3 text-gray-900 transition-colors hover:text-cami-100">
            <img src="/icons/logo.svg" alt={brandConfig.displayName} height={36} className="h-9 w-auto object-contain" />
            <span className="hidden text-[0.62rem] font-semibold tracking-[0.18em] text-cami-300 lg:inline" data-v2="microcopy">Textil corporativo premium</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center rounded-full border border-gray-200/12 bg-white/[0.06] px-4 py-2 shadow-glow lg:flex lg:space-x-1">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavigate(e, link.href)}
              className="rounded-full px-4 py-2 text-sm font-semibold tracking-[0.08em] text-cami-200 transition-all hover:bg-white/12 hover:text-gray-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden lg:flex">
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
          onClick={toggleMenu}
          className="relative z-[60] rounded-2xl border border-gray-200/15 bg-white/5 p-2 text-cami-100 transition-colors hover:bg-white/10 lg:hidden"
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
        <div
          className="fixed bottom-0 right-0 top-[73px] z-[90] w-[min(92vw,22rem)] border-l border-gray-200/12 bg-white/98 shadow-[0_0_50px_rgba(0,0,0,0.45)] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú móvil"
        >
          <div
            id="mobile-main-menu"
            className="mobile-nav-panel animate-slideDown h-full w-full overflow-y-auto"
          >
            <div className="space-y-3 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={closeMenu}
                className="touch-target mb-1 flex w-full items-center justify-center rounded-2xl border border-gray-200/20 bg-white/[0.04] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 transition-all hover:bg-white/12"
              >
                Cerrar
              </button>
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    handleNavigate(e, link.href);
                    handleLinkClick();
                  }}
                  className="touch-target block rounded-2xl border border-transparent bg-white/[0.04] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 transition-all hover:border-gray-200/20 hover:bg-white/12 hover:text-gray-900"
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
