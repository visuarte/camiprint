'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Inter, Space_Grotesk } from 'next/font/google';
import ProductCard from '@/components/ProductCard';
import BundleSelector from '@/components/BundleSelector';
import type { GorModel } from '@/components/ProductCard';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });
const space = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'] });

const PER_PAGE = 24;

export default function CatalogPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [models, setModels] = useState<GorModel[]>([]);
  const [allFamilies, setAllFamilies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bundleOpen, setBundleOpen] = useState(false);

  const family = searchParams.get('family') || 'TODAS';
  const search = searchParams.get('q') || '';
  const colorFilter = searchParams.get('color') || '';
  const compositionFilter = searchParams.get('material') || '';
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
    if (family !== 'TODAS') result = result.filter((m) => m.family === family);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) =>
        m.modelname.toLowerCase().includes(q) ||
        m.modelcode.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
      );
    }
    if (colorFilter) result = result.filter((m) => m.colors.some((c) => c.name.toLowerCase().includes(colorFilter.toLowerCase())));
    if (compositionFilter) result = result.filter((m) => m.composition.toLowerCase().includes(compositionFilter.toLowerCase()));
    return result;
  }, [models, family, search, colorFilter, compositionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (safePage !== page) {
      const p = new URLSearchParams(searchParams.toString());
      p.set('page', String(safePage));
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }
  }, [safePage, page, searchParams, router, pathname]);

  const allColors = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => m.colors.forEach((c) => set.add(c.name)));
    return Array.from(set).slice(0, 20);
  }, [models]);

  const allCompositions = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => { if (m.composition) set.add(m.composition); });
    return Array.from(set);
  }, [models]);

  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <main className={`${inter.className} min-h-screen bg-white pt-24`}>
      {/* HERO — minimal, premium */}
      <section className="border-b border-gray-100 bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className={`${space.className} inline-block rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500 shadow-sm`}>
              Catálogo profesional · Precios desde 3,83€/ud
            </span>
            <h1 className={`${space.className} mt-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl`}>
              Prendas para tu marca
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              Camisetas, polos y sudaderas corporativas. Presupuesto gratis en 24h.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <a href="#productos" className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800">
                Ver productos
              </a>
              <button onClick={() => setBundleOpen(true)}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:shadow-sm">
                Pack 3× −15%
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="sticky top-20 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-12">
          {/* Family pills */}
          <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
            <div className="flex w-max gap-1.5 md:w-auto md:flex-wrap">
              <button onClick={() => setParam('family', 'TODAS')}
                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                  family === 'TODAS' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}>Todas</button>
              {allFamilies.map((f) => (
                <button key={f} onClick={() => setParam('family', f)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                    family === f ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
          {/* Search + filters */}
          <div className="mt-3 flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input type="text" value={search} onChange={(e) => setParam('q', e.target.value)}
                placeholder="Buscar..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-0" />
            </div>
            <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`shrink-0 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${
                showAdvancedFilters || colorFilter || compositionFilter
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}>
              Filtros {colorFilter || compositionFilter ? '·' : ''}
            </button>
            {!loading && !error && (
              <span className="shrink-0 text-xs text-gray-300">{filtered.length} modelos</span>
            )}
          </div>
          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div className="mt-3 flex flex-wrap gap-4 border-t border-gray-50 pt-3">
              {allColors.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Color:</span>
                  <button onClick={() => setParam('color', '')}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${!colorFilter ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Todos</button>
                  {allColors.slice(0, 10).map((c) => (
                    <button key={c} onClick={() => setParam('color', c)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${colorFilter === c ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{c}</button>
                  ))}
                </div>
              )}
              {allCompositions.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Material:</span>
                  <button onClick={() => setParam('material', '')}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${!compositionFilter ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Todos</button>
                  {allCompositions.slice(0, 6).map((c) => (
                    <button key={c} onClick={() => setParam('material', c)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${compositionFilter === c ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{c}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="productos" className="mx-auto max-w-7xl px-6 py-10 md:px-12">
        {loading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
                <div className="aspect-[3/4] bg-gray-50" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-50" />
                  <div className="h-3 w-1/3 rounded bg-gray-50" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-600">Error al cargar el catálogo</p>
            <p className="mt-1 text-xs text-red-400">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white">Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-gray-500">No hay modelos en esta categoría.</p>
            <button onClick={() => { setParam('family', 'TODAS'); setParam('q', ''); setParam('color', ''); setParam('material', ''); }}
              className="mt-3 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">Limpiar filtros</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {paginated.map((model) => (
                <ProductCard key={model.modelcode} product={model} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button onClick={() => setParam('page', String(safePage - 1))} disabled={safePage <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setParam('page', String(p))}
                    className={`${space.className} flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                      p === safePage ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}>{p}</button>
                ))}
                <button onClick={() => setParam('page', String(safePage + 1))} disabled={safePage >= totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {bundleOpen && <BundleSelector models={models} onClose={() => setBundleOpen(false)} />}
    </main>
  );
}
