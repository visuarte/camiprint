'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Manrope, Montserrat, Space_Grotesk } from 'next/font/google';
import ProductCard from '@/components/ProductCard';
import type { GorModel } from '@/components/ProductCard';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800', '900'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] });

const PER_PAGE = 24;

export default function CatalogPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [models, setModels] = useState<GorModel[]>([]);
  const [allFamilies, setAllFamilies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const family = searchParams.get('family') || 'TODAS';
  const search = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const setParam = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (value) p.set(key, value);
      else p.delete(key);
      if (key !== 'page') p.set('page', '1');
      router.push(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/v1/gor-catalog?brand=roly&prices=true');
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${response.status}`);
        }
        const data = await response.json();
        setModels(data.models || []);
        setAllFamilies(data.families || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar catálogo');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filtered = useMemo(() => {
    let result = models;
    if (family !== 'TODAS') {
      result = result.filter((m) => m.family === family);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.modelname.toLowerCase().includes(q) ||
          m.modelcode.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [models, family, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (safePage !== page) {
      const p = new URLSearchParams(searchParams.toString());
      p.set('page', String(safePage));
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }
  }, [safePage, page, searchParams, router, pathname]);

  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <main className={`${manrope.className} min-h-screen overflow-x-hidden bg-white text-gray-900 pt-24 pb-16`}>
      {/* Hero */}
      {/* HERO - sales oriented */}
      <section className="relative overflow-hidden bg-gray-50 py-16">
        <div className="hazard-pattern absolute inset-0 opacity-5" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-16">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 rounded-full border border-[#ff4f00]/30 bg-[#ff4f00]/10 px-4 py-1 text-xs tracking-[0.1em] text-[#ff4f00]`}>
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4f00]" />
                PERSONALIZACIÓN SIN MÍNIMOS
              </div>
              <h1 className={`${montserrat.className} mt-6 text-4xl font-black leading-tight md:text-6xl`}>
                Tu logo, tu equipo,{' '}
                <span className="text-[#ff4f00]">tu uniforme</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700/70">
                Camisetas, polos y sudaderas corporativas con tu marca. DTF, bordado o serigrafía. Presupuesto gratis en 24h. Desde 10 unidades.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/#presupuesto" className={`${spaceGrotesk.className} bg-[#ff4f00] px-8 py-3 text-sm font-bold text-[#0A0A0A] transition hover:scale-105`}>
                  PEDIR PRESUPUESTO
                </Link>
                <a href="#productos" className={`${spaceGrotesk.className} border border-gray-300 px-8 py-3 text-sm font-bold text-gray-700 transition hover:border-[#ff4f00] hover:text-[#ff4f00]`}>
                  VER CATÁLOGO
                </a>
              </div>
            </div>
            <div className="grid gap-3 self-end">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
                <p className={`${spaceGrotesk.className} text-[0.65rem] uppercase tracking-[0.18em] text-[#ff4f00]`}>Desde</p>
                <p className={`${montserrat.className} mt-1 text-3xl font-black text-gray-900`}>10 uds</p>
                <p className="text-xs text-gray-400">sin mínimo abusivo</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
                <p className={`${spaceGrotesk.className} text-[0.65rem] uppercase tracking-[0.18em] text-[#ff4f00]`}>Presupuesto</p>
                <p className={`${montserrat.className} mt-1 text-3xl font-black text-gray-900`}>24h</p>
                <p className="text-xs text-gray-400">respuesta gratis</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
                <p className={`${spaceGrotesk.className} text-[0.65rem] uppercase tracking-[0.18em] text-[#ff4f00]`}>Envío</p>
                <p className={`${montserrat.className} mt-1 text-3xl font-black text-gray-900`}>3-7 días</p>
                <p className="text-xs text-gray-400">a toda España</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters bar */}
      <section className="sticky top-20 z-30 border-b border-gray-200 bg-gray-50/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 md:px-16">
          <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
            <div className="flex flex-nowrap gap-2 w-max md:flex-wrap md:w-auto">
              <button
                onClick={() => setParam('family', 'TODAS')}
                className={`${spaceGrotesk.className} shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  family === 'TODAS'
                    ? 'bg-[#ff4f00] text-[#0A0A0A] shadow-[0_0_12px_rgba(255,79,0,0.4)]'
                    : 'border border-[#e2e2e2]/15 text-gray-700/60 hover:border-[#ff4f00] hover:text-gray-700'
                }`}
              >
                TODAS
              </button>
              {allFamilies.map((f) => (
                <button
                  key={f}
                  onClick={() => setParam('family', f)}
                  className={`${spaceGrotesk.className} shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    family === f
                      ? 'bg-[#ff4f00] text-[#0A0A0A] shadow-[0_0_12px_rgba(255,79,0,0.4)]'
                      : 'border border-[#e2e2e2]/15 text-gray-700/60 hover:border-[#ff4f00] hover:text-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-700/40">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder="Buscar modelo..."
                className="w-full rounded-xl border border-[#e2e2e2]/12 bg-[#1f1f1f] py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-700/40 focus:border-[#ff4f00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff4f00]/30"
              />
            </div>
            {!loading && !error && (
              <span className={`${spaceGrotesk.className} shrink-0 text-xs tracking-[0.1em] text-gray-700/40`}>
                {filtered.length} modelos
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section id="productos" className="mx-auto mt-8 max-w-7xl px-5 pb-8 md:px-16">
        {loading ? (
          <div>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4f00]" />
                Cargando catálogo Roly...
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-[1.5rem] border border-[#5c4037]/35 bg-[#1f1f1f]">
                {/* Image skeleton */}
                <div className="relative flex h-72 items-center justify-center bg-[radial-gradient(ellipse_at_center,_#2a2a2a_0%,_#1a1a1a_100%)]">
                  <div className="absolute left-3 top-3 h-5 w-24 rounded-full bg-[#2a2a2a]" />
                </div>
                {/* Body skeleton */}
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-[#2a2a2a]" />
                  <div className="h-3 w-full rounded bg-[#2a2a2a]" />
                  <div className="h-3 w-2/3 rounded bg-[#2a2a2a]" />
                  <div className="h-3 w-1/3 rounded bg-[#2a2a2a]" />
                  <div className="h-5 w-1/4 rounded bg-[#2a2a2a]" />
                  {/* Color swatches */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-7 w-7 rounded-md bg-[#2a2a2a]" />
                    ))}
                  </div>
                  {/* Size inputs */}
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="grid grid-cols-[auto_1fr] items-center gap-2">
                      <div className="h-3 w-8 rounded bg-[#2a2a2a]" />
                      <div className="h-8 w-full rounded-lg bg-[#2a2a2a]" />
                    </div>
                  ))}
                  {/* Add to cart button */}
                  <div className="h-11 w-full rounded-xl bg-[#2a2a2a]" />
                </div>
              </div>
            ))}
          </div>
          </div>
        ) : error ? (
          <div className="rounded-[1.5rem] border border-red-400/20 bg-red-950/30 p-8 text-center">
            <h2 className={`${montserrat.className} mb-2 text-lg font-bold text-red-200`}>Error al cargar catálogo</h2>
            <p className="text-sm text-red-100/80">{error}</p>
            <button onClick={() => window.location.reload()} className={`${montserrat.className} mt-4 bg-[#ff4f00] px-6 py-2 text-sm font-bold text-[#0A0A0A]`}>
              REINTENTAR
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[1.5rem] border border-[#5c4037]/25 bg-[#1f1f1f] py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-700/20">search_off</span>
            <p className={`${montserrat.className} mt-4 text-lg font-bold text-gray-700/60`}>No hay modelos en esta categoría.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginated.map((model) => (
                <ProductCard key={model.modelcode} product={model} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setParam('page', String(safePage - 1))}
                  disabled={safePage <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2e2e2]/15 text-sm text-gray-700/60 transition hover:border-[#ff4f00] hover:text-[#ff4f00] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setParam('page', String(p))}
                    className={`${spaceGrotesk.className} flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      p === safePage
                        ? 'bg-[#ff4f00] text-[#0A0A0A]'
                        : 'border border-[#e2e2e2]/15 text-gray-700/60 hover:border-[#ff4f00] hover:text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setParam('page', String(safePage + 1))}
                  disabled={safePage >= totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2e2e2]/15 text-sm text-gray-700/60 transition hover:border-[#ff4f00] hover:text-[#ff4f00] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <style>{`
        .hazard-pattern {
          background-image: repeating-linear-gradient(-45deg, #ff4f00, #ff4f00 10px, transparent 10px, transparent 20px);
        }
      `}</style>
    </main>
  );
}
