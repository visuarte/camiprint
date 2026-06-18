'use client';

import { useEffect, useState } from 'react';

type Consent = 'accepted' | 'rejected' | null;

const STORAGE_KEY = 'camiart_cookie_consent';

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent | 'loading'>('loading');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
      setConsent(stored);
    } catch {
      setConsent(null);
    }
  }, []);

  const save = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage not available
    }
    setConsent(value);
  };

  // Don't flash during SSR or once user has already chosen
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200/10 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur-md md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:rounded-xl md:border md:border-gray-200/10"
    >
      <p className="mb-1 text-sm font-semibold text-gray-900">Este sitio usa cookies</p>
      <p className="mb-4 text-xs leading-relaxed text-cami-300">
        Usamos cookies técnicas (necesarias) y de analítica (Vercel Analytics) para mejorar tu experiencia.
        Consulta nuestra{' '}
        <a
          href="/politica-de-cookies"
          className="text-cami-200 underline underline-offset-2 hover:text-gray-900"
        >
          Política de Cookies
        </a>{' '}
        para más información.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => save('accepted')}
          className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90"
        >
          Aceptar todas
        </button>
        <button
          onClick={() => save('rejected')}
          className="flex-1 rounded-lg border border-gray-200/20 px-3 py-2 text-xs font-semibold text-cami-200 transition-colors hover:border-gray-200/40 hover:text-gray-900"
        >
          Solo necesarias
        </button>
      </div>
    </div>
  );
}
