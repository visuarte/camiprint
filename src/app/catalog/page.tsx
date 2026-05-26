'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { brandConfig } from '@/config/brand';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  size: string;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: brandConfig.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catalogo',
        item: `${brandConfig.siteUrl}/catalog`,
      },
    ],
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-16 text-cami-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-cami-hero shadow-glow">
          <div className="grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-12 lg:py-14">
            <div>
              <span className="section-eyebrow">Catalogo corporativo</span>
              <h1 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                Prendas listas para activar tu imagen de marca.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-cami-200 sm:text-lg">
                Explora camisetas corporativas, polos con logo y referencias preparadas para equipos, eventos y campanas B2B.
              </p>
            </div>
            <div className="grid gap-3 self-end text-sm text-cami-200">
              <div className="rounded-2xl border border-white/10 bg-cami-900/60 p-4 shadow-glow">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-cami-300">Serie minima</p>
                <p className="mt-2 font-display text-3xl text-white">10 uds</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-cami-900/60 p-4 shadow-glow">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-cami-300">Entrega orientativa</p>
                <p className="mt-2 font-display text-3xl text-white">7-10 dias</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cami-300">Seleccion curada</p>
            <h2 className="mt-2 font-display text-3xl text-white">Modelos preparados para cotizar rapido</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-cami-300">
            Cada ficha esta pensada para acelerar la decision: talla, unidades y compra directa si ya tienes claro el pedido.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-[1.75rem] border border-white/10 bg-cami-900/55 shadow-glow">
            <div className="text-center">
              <div className="inline-block">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-400 border-t-transparent"></div>
              </div>
              <p className="mt-4 text-cami-300">Cargando referencias del catalogo...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[1.5rem] border border-red-400/20 bg-red-950/30 p-8 text-center shadow-glow">
            <h2 className="mb-2 text-lg font-semibold text-red-200">No pudimos cargar el catalogo</h2>
            <p className="text-red-100/80">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-cami-900/55 py-12 text-center shadow-glow">
            <p className="text-lg text-cami-300">Todavia no hay prendas publicadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
