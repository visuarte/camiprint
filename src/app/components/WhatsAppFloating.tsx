"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { brandConfig } from '@/config/brand';

export default function WhatsAppFloating() {
  const pathname = usePathname();
  // Hide WhatsApp floating button in admin area — only show on public site.
  if (pathname && pathname.startsWith('/admin')) return null;

  const raw = brandConfig.phoneDisplay || '+34 600 000 000';
  const digits = raw.replace(/[^0-9]/g, '');
  const defaultText = encodeURIComponent('Hola, quiero un presupuesto para camisetas corporativas. Nombre, empresa y cantidad:');
  const href = `https://wa.me/${digits}?text=${defaultText}`;

  return (
    <div aria-hidden="false">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-emerald-500/95 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:scale-105 focus:outline-none"
        title="Chatea con nosotros por WhatsApp"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M20.52 3.48A11.9 11.9 0 0 0 12 0C5.373 0 0 5.373 0 12c0 2.11.55 4.08 1.6 5.82L0 24l6.42-1.68A11.92 11.92 0 0 0 12 24c6.627 0 12-5.373 12-12 0-2.99-1.17-5.73-3.48-7.52z" fill="#fff" opacity="0.12"></path>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.668.149-.198.297-.767.967-.941 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.48-.885-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.52-.074-.149-.668-1.612-.916-2.206-.242-.579-.487-.5-.668-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.064 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487 0.71.306 1.263.489 1.695.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.411.248-.693.248-1.287.173-1.411-.074-.124-.272-.198-.57-.347z" fill="#fff"></path>
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}
