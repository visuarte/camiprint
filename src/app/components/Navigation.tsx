'use client';

import { useState, useEffect, useRef } from 'react';

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
    const handleClickOutside = (event: MouseEvent) => {
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
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isMobileMenuOpen]);

  // Cerrar menú al hacer click en un enlace
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Scroll suave con offset para navegación
  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-cami-950/78 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="#inicio" className="text-2xl font-bold tracking-tight text-white transition-colors hover:text-cami-200">
            Camiprint
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavigate(e, link.href)}
              className="font-medium text-cami-200 transition-colors hover:text-white"
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
            className="rounded-lg border border-white/25 bg-metal-button px-6 py-2 font-semibold text-cami-100 shadow-metal transition-all hover:brightness-110"
          >
            Solicitar Cotización
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg border border-white/15 bg-white/5 p-2 text-cami-100 transition-colors hover:bg-white/10 md:hidden"
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
          id="mobile-main-menu"
          ref={menuRef}
          className="absolute left-0 right-0 top-full animate-slideDown border-b border-white/10 bg-cami-950/95 shadow-glow md:hidden"
        >
          <div className="space-y-3 px-4 py-4">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNavigate(e, link.href);
                  handleLinkClick();
                }}
                className="touch-target block rounded-lg border border-transparent px-4 py-3 font-medium text-cami-100 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white"
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
              className="touch-target block w-full rounded-lg border border-white/25 bg-metal-button px-4 py-3 text-center font-semibold text-cami-100 shadow-metal transition-all hover:brightness-110"
            >
              Solicitar Cotización
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
