'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '../auth-client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  size: string;
  quantity: number;
  createdAt: string;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Product[];
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el inventario');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStock = products.filter((product) => product.quantity <= 100).length;
    const outOfStock = products.filter((product) => product.quantity === 0).length;

    return { totalProducts, totalUnits, lowStock, outOfStock };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.description ?? '', product.size].join(' ').toLowerCase().includes(query),
    );
  }, [products, search]);

  const priorityProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  }, [products]);

  const criticalProducts = useMemo(() => products.filter((product) => product.quantity <= 25), [products]);

  const stockTone = (quantity: number) => {
    if (quantity === 0) return 'text-red-400 border-red-500/40 bg-red-500/10';
    if (quantity <= 25) return 'text-red-300 border-red-500/50 bg-red-500/10';
    if (quantity <= 100) return 'text-hazard-orange border-hazard-orange/40 bg-hazard-orange/10';
    return 'text-green-400 border-green-500/40 bg-green-500/10';
  };

  const stockLabel = (quantity: number) => {
    if (quantity === 0) return 'OUT OF STOCK';
    if (quantity <= 25) return 'CRITICAL RESTOCK';
    if (quantity <= 100) return 'LOW STOCK';
    return 'IN STOCK';
  };

  const saveQuantity = async (productId: string, nextQuantity: number) => {
    setSavingId(productId);
    setError('');
    try {
      const res = await adminFetch(`/api/admin/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: nextQuantity }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const updated: Product = data.product;
      setProducts((current) => current.map((product) => (product.id === updated.id ? updated : product)));
      setSelectedProduct((current) => (current?.id === updated.id ? updated : current));
      setQuantityInput(String(updated.quantity));
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el stock');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-8 md:p-14 flex flex-col gap-10">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        <div className="md:col-span-2 border border-hazard-orange/30 bg-surface-charcoal p-6 md:p-7">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">INVENTORY</p>
          <h1 className="font-headline-md text-[28px] md:text-[34px] text-white leading-none mb-4">
            PRODUCT STOCK CONTROL
          </h1>
          <p className="max-w-2xl text-[#D8DEE8] text-[15px] leading-6">
            Vista de stock real de los productos creados en la base de datos. Aquí puedes detectar rápido qué líneas necesitan reposición.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/admin/orders" className="h-9 inline-flex items-center px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] leading-none hover:bg-surface-container-high transition-colors">
              VIEW ORDERS →
            </Link>
            <Link href="/admin/production" className="h-9 inline-flex items-center px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] leading-none hover:bg-surface-container-high transition-colors">
              PRODUCTION →
            </Link>
          </div>
        </div>

        <div className="border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">TOTAL PRODUCTS</p>
          <p className="font-display-lg text-[36px] md:text-[42px] text-white leading-none font-black">
            {metrics.totalProducts}
          </p>
          <p className="mt-2 text-[#D8DEE8] text-[12px]">Productos registrados</p>
        </div>

        <div className="border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">TOTAL UNITS</p>
          <p className="font-display-lg text-[36px] md:text-[42px] text-white leading-none font-black">
            {metrics.totalUnits}
          </p>
          <p className="mt-2 text-[#D8DEE8] text-[12px]">Unidades en almacén</p>
        </div>

        <div className="border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">LOW STOCK</p>
          <p className="font-display-lg text-[36px] md:text-[42px] text-white leading-none font-black">
            {metrics.lowStock}
          </p>
          <p className="mt-2 text-[#D8DEE8] text-[12px]">Productos en reposición</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="font-headline-md text-[22px] md:text-[26px] leading-none text-white">
              STOCK LIST
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="h-10 w-full max-w-xs border border-muted-steel/20 bg-surface-container-lowest px-3 text-sm text-white placeholder:text-[#D8DEE8]/60 focus:outline-none focus:border-hazard-orange"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 bg-surface-container-lowest border border-muted-steel/10" />
              ))}
            </div>
          ) : error ? (
            <div className="border border-red-700/50 bg-red-900/20 p-4 text-red-200 text-sm">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="border border-muted-steel/10 bg-surface-container-lowest p-6 text-[#D8DEE8] text-sm">
              No hay productos que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="border border-muted-steel/10 bg-surface-container-lowest p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">
                        {product.size} · {product.id.slice(0, 8).toUpperCase()}
                      </p>
                      <h3 className="text-[15px] md:text-[16px] text-white font-semibold leading-snug truncate">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-[#D8DEE8] text-[12px] leading-5 line-clamp-2">
                        {product.description || 'Sin descripción'}
                      </p>
                      {product.quantity <= 25 && (
                        <p className="mt-2 text-[10px] font-label-caps tracking-[0.08em] text-red-300">
                          REPOSICIÓN CRÍTICA
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 border text-[10px] font-label-caps tracking-[0.08em] ${stockTone(product.quantity)}`}>
                        {stockLabel(product.quantity)}
                      </span>
                      <p className="font-display-lg text-[26px] text-white font-black leading-none">
                        {product.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex-1 h-2 bg-surface-bright border border-muted-steel/20 p-[2px]">
                      <div
                        className={`h-full ${product.quantity === 0 ? 'bg-red-500' : product.quantity <= 100 ? 'bg-hazard-orange' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(product.quantity / 5, 100)}%` }}
                      />
                    </div>
                    <p className="w-20 text-right font-label-caps text-[11px] text-[#D8DEE8]">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => saveQuantity(product.id, product.quantity + 10)}
                      disabled={savingId === product.id}
                      className="h-8 px-3 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[10px] tracking-[0.08em] hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => saveQuantity(product.id, Math.max(0, product.quantity - 10))}
                      disabled={savingId === product.id}
                      className="h-8 px-3 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[10px] tracking-[0.08em] hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setQuantityInput(String(product.quantity));
                      }}
                      className="h-8 px-3 border border-hazard-orange/40 text-hazard-orange font-label-caps text-[10px] tracking-[0.08em] hover:bg-hazard-orange hover:text-black transition-colors"
                    >
                      EDIT STOCK
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-4 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7 flex flex-col gap-4">
          <h2 className="font-headline-md text-[22px] md:text-[26px] leading-none text-white">
            INVENTORY SUMMARY
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-muted-steel/10 pb-2">
              <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">OUT OF STOCK</span>
              <span className="font-headline-md text-[18px] text-white font-bold">{metrics.outOfStock}</span>
            </div>
            <div className="flex items-center justify-between border-b border-muted-steel/10 pb-2">
              <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">LOW STOCK</span>
              <span className="font-headline-md text-[18px] text-white font-bold">{metrics.lowStock}</span>
            </div>
            <div className="flex items-center justify-between border-b border-muted-steel/10 pb-2">
              <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">REGISTERED</span>
              <span className="font-headline-md text-[18px] text-white font-bold">{metrics.totalProducts}</span>
            </div>
          </div>

          <div className="mt-2 border-t border-muted-steel/10 pt-4">
            <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">ACTION</p>
            <p className="text-[#D8DEE8] text-[13px] leading-5">
              Si quieres, el siguiente paso es permitir ajuste de stock desde aquí y enlazarlo con los movimientos de producción.
            </p>
          </div>

          <div className="border-t border-muted-steel/10 pt-4">
            <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-3">PRODUCTION CONSUMPTION ORDER</p>
            <div className="space-y-3">
              {priorityProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setQuantityInput(String(product.quantity));
                  }}
                  className="w-full text-left border border-muted-steel/10 bg-surface-container-lowest p-3 hover:border-hazard-orange/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em] mb-1">
                        #{index + 1} · {product.size}
                      </p>
                      <p className="text-[13px] text-white font-semibold truncate">{product.name}</p>
                    </div>
                    <span className="font-headline-md text-[18px] text-white font-bold">
                      {product.quantity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg border border-muted-steel/20 bg-surface-charcoal p-6 md:p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">EDIT STOCK</p>
                <h3 className="text-white text-[18px] md:text-[20px] font-semibold leading-snug">
                  {selectedProduct.name}
                </h3>
                <p className="text-[#D8DEE8] text-[12px] mt-1">Talla {selectedProduct.size} · stock actual {selectedProduct.quantity}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-[#D8DEE8] text-sm hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <label className="block">
              <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">NEW QUANTITY</span>
              <input
                type="number"
                min="0"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                className="mt-2 h-11 w-full border border-muted-steel/20 bg-surface-container-lowest px-3 text-white focus:outline-none focus:border-hazard-orange"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => saveQuantity(selectedProduct.id, Number(quantityInput))}
                disabled={savingId === selectedProduct.id}
                className="h-10 px-4 border border-hazard-orange bg-hazard-orange text-black font-label-caps text-[11px] tracking-[0.08em] hover:brightness-110 transition-colors disabled:opacity-50"
              >
                SAVE STOCK
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="h-10 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] tracking-[0.08em] hover:bg-surface-container-high transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}