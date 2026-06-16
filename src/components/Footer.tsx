'use client';

import { Manrope, Montserrat, Space_Grotesk } from 'next/font/google';
import { brandConfig } from '@/config/brand';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800', '900'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] });

interface FooterProps {
  variant?: 'dark' | 'light';
}

export default function Footer({ variant = 'dark' }: FooterProps) {
  const isLight = variant === 'light';
  return (
    <footer className={`relative w-full border-t-4 border-[#ff4f00] py-12 ${isLight ? 'bg-gray-50 text-[#1a1a1a]' : 'bg-[#0e0e0e] text-white'}`}>
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 px-5 md:grid-cols-2 md:px-16">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#ff4f00]">precision_manufacturing</span>
            <span className={`${montserrat.className} text-lg font-extrabold ${isLight ? 'text-gray-800' : 'text-[#e2e2e2]'}`}>CAMIART</span>
          </div>
          <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`}>© 2026 CAMIART — Alicante, España</p>
          <div className={`mt-3 flex flex-col gap-1 text-xs ${isLight ? 'text-gray-400' : 'text-[#CBD5E1]/70'}`}>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#ff4f00]">call</span> {brandConfig.phoneDisplay}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#ff4f00]">mail</span> {brandConfig.supportEmail}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <div className={`${spaceGrotesk.className} flex flex-wrap gap-x-8 gap-y-4 text-xs tracking-[0.1em] md:justify-end`}>
            <a className={`transition-colors hover:text-[#ff4f00] ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`} href="/aviso-legal">AVISO LEGAL</a>
            <a className={`transition-colors hover:text-[#ff4f00] ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`} href="/terminos-y-condiciones">TÉRMINOS</a>
            <a className={`transition-colors hover:text-[#ff4f00] ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`} href="/politica-privacidad">PRIVACIDAD</a>
            <a className={`transition-colors hover:text-[#ff4f00] ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`} href="/politica-de-cookies">COOKIES</a>
            <a className={`transition-colors hover:text-[#ff4f00] ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`} href="/politica-de-envios">ENVÍOS</a>
          </div>
          <div className="flex gap-4">
            <a href={brandConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={`transition-colors hover:text-[#ff4f00] ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`} aria-label="Instagram">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href={brandConfig.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={`transition-colors hover:text-[#ff4f00] ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`} aria-label="Facebook">
              <span className="material-symbols-outlined">groups</span>
            </a>
            <a href={brandConfig.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={`transition-colors hover:text-[#ff4f00] ${isLight ? 'text-gray-500' : 'text-[#CBD5E1]'}`} aria-label="LinkedIn">
              <span className="material-symbols-outlined">business</span>
            </a>
          </div>
        </div>
      </div>
      <div className="hazard-pattern mt-12 h-2 w-full opacity-30" />
      <style>{`
        .hazard-pattern {
          background-image: repeating-linear-gradient(-45deg, #ff4f00, #ff4f00 10px, transparent 10px, transparent 20px);
        }
      `}</style>
    </footer>
  );
}
