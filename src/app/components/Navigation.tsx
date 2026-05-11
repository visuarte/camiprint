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

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="#inicio" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
            Camiprint
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavigate(e, link.href)}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Solicitar Cotización
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="w-6 h-6 text-gray-700"
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
          ref={menuRef}
          className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-slideDown"
        >
          <div className="px-4 py-4 space-y-3">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNavigate(e, link.href);
                  handleLinkClick();
                }}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg hover:text-blue-600 font-medium transition-all"
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
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-center"
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
