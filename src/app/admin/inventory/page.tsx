'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
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

interface ProductsResponse {
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalProducts: number;
    totalUnits: number;
    lowStock: number;
    outOfStock: number;
  };
}

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  size: string;
  quantity: string;
};

const defaultFormState: ProductFormState = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  size: 'M',
  quantity: '0',
};

function toFormState(product?: Product | null): ProductFormState {
  if (!product) return { ...defaultFormState };
  return {
    name: product.name,
    description: product.description ?? '',
    price: String(product.price),
    imageUrl: product.imageUrl ?? '',
    size: product.size,
    quantity: String(product.quantity),
  };
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const pageSize = 12;

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
        });
        const query = search.trim();
        if (query) params.set('q', query);
        const res = await adminFetch(`/api/admin/products?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ProductsResponse;
        setProducts(Array.isArray(data.data) ? data.data : []);
        setTotalPages(Math.max(1, data.pagination?.totalPages ?? 1));
        setTotalProducts(data.pagination?.total ?? data.summary?.totalProducts ?? 0);
        setMetrics({
          totalProducts: data.summary?.totalProducts ?? data.pagination?.total ?? 0,
          totalUnits: data.summary?.totalUnits ?? 0,
          lowStock: data.summary?.lowStock ?? 0,
          outOfStock: data.summary?.outOfStock ?? 0,
        });
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el inventario admin');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [search, page]);

  const filteredProducts = useMemo(() => products, [products]);

  const priorityProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  }, [products]);

  const stockTone = (quantity: number) => {
    if (quantity === 0) return 'text-red-400 border-red-500/40 bg-red-500/10';
    if (quantity <= 25) return 'text-red-300 border-red-500/50 bg-red-500/10';
    if (quantity <= 100) return 'text-hazard-orange border-hazard-orange/40 bg-hazard-orange/10';
    return 'text-green-400 border-green-500/40 bg-green-500/10';
  };

  const stockLabel = (quantity: number) => {
    if (quantity === 0) return 'SIN STOCK';
    if (quantity <= 25) return 'REPOSICIÓN CRÍTICA';
    if (quantity <= 100) return 'STOCK BAJO';
    return 'EN STOCK';
  };

  const patchProduct = async (productId: string, payload: Record<string, unknown>) => {
    setSavingId(productId);
    setError('');
    try {
      const res = await adminFetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const updated: Product = data.product;
      setProducts((current) => current.map((product) => (product.id === updated.id ? updated : product)));
      setSelectedProduct((current) => (current?.id === updated.id ? updated : current));
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el producto');
    } finally {
      setSavingId(null);
    }
  };

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setFormState({ ...defaultFormState });
    setImageUploadError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormState(toFormState(product));
    setImageUploadError('');
    setIsFormOpen(true);
  };

  const handleImageFileChange = async (file: File | null) => {
    if (!file) return;
    setImageUploadError('');
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await adminFetch('/api/admin/products/upload', {
        method: 'POST',
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok || !payload?.image?.url) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }

      setFormState((current) => ({ ...current, imageUrl: payload.image.url }));
    } catch (err) {
      console.error(err);
      setImageUploadError('No se pudo subir la imagen. Formatos: jpg, png, webp, gif, avif. Max 6MB.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const payload = {
      name: formState.name.trim(),
      description: formState.description.trim() || null,
      price: Number(formState.price),
      imageUrl: formState.imageUrl.trim() || null,
      size: formState.size.trim() || 'M',
      quantity: Number(formState.quantity),
    };

    if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0 || !Number.isFinite(payload.quantity) || payload.quantity < 0) {
      setError('Valida nombre, precio y cantidad antes de guardar');
      return;
    }

    try {
      if (selectedProduct) {
        setSavingId(selectedProduct.id);
        const res = await adminFetch(`/api/admin/products/${selectedProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const updated: Product = data.product;
        setProducts((current) => current.map((product) => (product.id === updated.id ? updated : product)));
      } else {
        setIsCreating(true);
        const res = await adminFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const created: Product = data.product;
        setPage(1);
        setProducts((current) => [created, ...current]);
      }

      setIsFormOpen(false);
      setSelectedProduct(null);
      setFormState({ ...defaultFormState });
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el producto');
    } finally {
      setSavingId(null);
      setIsCreating(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Eliminar producto "${product.name}" (${product.size})?`);
    if (!confirmed) return;

    setIsDeletingId(product.id);
    setError('');
    try {
      const res = await adminFetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setTotalProducts((current) => Math.max(0, current - 1));
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
        setIsFormOpen(false);
      }
      if (products.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el producto');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="p-8 md:p-14 flex flex-col gap-10">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        <div className="md:col-span-2 border border-hazard-orange/30 bg-surface-charcoal p-6 md:p-7">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">INVENTARIO</p>
          <h1 className="font-headline-md text-[28px] md:text-[34px] text-white leading-none mb-4">
            CONTROL DE STOCK
          </h1>
          <p className="max-w-2xl text-[#D8DEE8] text-[15px] leading-6">
            Vista de stock real de los productos creados en la base de datos. Aquí puedes detectar rápido qué líneas necesitan reposición.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/admin/orders" className="h-9 inline-flex items-center px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] leading-none hover:bg-surface-container-high transition-colors">
              VER PEDIDOS →
            </Link>
            <Link href="/admin/production" className="h-9 inline-flex items-center px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] leading-none hover:bg-surface-container-high transition-colors">
              PRODUCCIÓN →
            </Link>
          </div>
        </div>

        <div className="border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">TOTAL PRODUCTOS</p>
          <p className="font-display-lg text-[36px] md:text-[42px] text-white leading-none font-black">
            {metrics.totalProducts}
          </p>
          <p className="mt-2 text-[#D8DEE8] text-[12px]">Productos registrados</p>
        </div>

        <div className="border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">TOTAL UNIDADES</p>
          <p className="font-display-lg text-[36px] md:text-[42px] text-white leading-none font-black">
            {metrics.totalUnits}
          </p>
          <p className="mt-2 text-[#D8DEE8] text-[12px]">Unidades en almacén</p>
        </div>

        <div className="border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">STOCK BAJO</p>
          <p className="font-display-lg text-[36px] md:text-[42px] text-white leading-none font-black">
            {metrics.lowStock}
          </p>
          <p className="mt-2 text-[#D8DEE8] text-[12px]">Productos en reposición</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="font-headline-md text-[22px] md:text-[26px] leading-none text-white">
                TABLA DE PRODUCTOS
              </h2>
              <p className="mt-2 text-xs text-[#D8DEE8]">{totalProducts} productos en total</p>
            </div>
            <div className="flex gap-2 w-full max-w-lg">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar producto..."
                className="h-10 w-full border border-muted-steel/20 bg-surface-container-lowest px-3 text-sm text-white placeholder:text-[#D8DEE8]/60 focus:outline-none focus:border-hazard-orange"
              />
              <button
                onClick={handleOpenCreate}
                className="h-10 px-4 border border-hazard-orange bg-hazard-orange text-black font-label-caps text-[11px] tracking-[0.08em] hover:brightness-110 transition-colors"
              >
                NUEVO PRODUCTO
              </button>
            </div>
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
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-3 items-start">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-14 h-14 object-cover border border-muted-steel/20 bg-surface-charcoal"
                          />
                        ) : (
                          <div className="w-14 h-14 border border-muted-steel/20 bg-surface-charcoal flex items-center justify-center text-[9px] text-[#D8DEE8]/70 font-label-caps tracking-[0.08em]">
                            SIN IMG
                          </div>
                        )}
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
                      </div>
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
                      onClick={() => patchProduct(product.id, { quantity: product.quantity + 10 })}
                      disabled={savingId === product.id}
                      className="h-8 px-3 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[10px] tracking-[0.08em] hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => patchProduct(product.id, { quantity: Math.max(0, product.quantity - 10) })}
                      disabled={savingId === product.id}
                      className="h-8 px-3 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[10px] tracking-[0.08em] hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="h-8 px-3 border border-hazard-orange/40 text-hazard-orange font-label-caps text-[10px] tracking-[0.08em] hover:bg-hazard-orange hover:text-black transition-colors"
                    >
                      EDITAR
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={isDeletingId === product.id}
                      className="h-8 px-3 border border-red-500/40 text-red-300 font-label-caps text-[10px] tracking-[0.08em] hover:bg-red-500 hover:text-black transition-colors disabled:opacity-50"
                    >
                      ELIMINAR
                    </button>
                  </div>
                </article>
              ))}

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border border-muted-steel/10 bg-surface-charcoal p-3">
                  <button
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || isLoading}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:cursor-not-allowed border border-neutral-700 rounded-lg transition text-sm"
                  >
                    ← Anterior
                  </button>
                  <p className="text-sm text-neutral-400">
                    Página {page} de {totalPages}
                  </p>
                  <button
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages || isLoading}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:cursor-not-allowed border border-neutral-700 rounded-lg transition text-sm"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="xl:col-span-4 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7 flex flex-col gap-4">
          <h2 className="font-headline-md text-[22px] md:text-[26px] leading-none text-white">
            RESUMEN DE INVENTARIO
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-muted-steel/10 pb-2">
              <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">SIN STOCK</span>
              <span className="font-headline-md text-[18px] text-white font-bold">{metrics.outOfStock}</span>
            </div>
            <div className="flex items-center justify-between border-b border-muted-steel/10 pb-2">
              <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">STOCK BAJO</span>
              <span className="font-headline-md text-[18px] text-white font-bold">{metrics.lowStock}</span>
            </div>
            <div className="flex items-center justify-between border-b border-muted-steel/10 pb-2">
              <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">REGISTRADOS</span>
              <span className="font-headline-md text-[18px] text-white font-bold">{metrics.totalProducts}</span>
            </div>
          </div>

          <div className="mt-2 border-t border-muted-steel/10 pt-4">
            <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">ACCIÓN</p>
            <p className="text-[#D8DEE8] text-[13px] leading-5">
              Gestiona catálogo completo desde esta pantalla: alta, edición y borrado, además de ajustes rápidos de stock.
            </p>
          </div>

          <div className="border-t border-muted-steel/10 pt-4">
            <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-3">ORDEN DE CONSUMO</p>
            <div className="space-y-3">
              {priorityProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleOpenEdit(product)}
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

      {isFormOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg border border-muted-steel/20 bg-surface-charcoal p-6 md:p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">
                  {selectedProduct ? 'EDITAR PRODUCTO' : 'CREAR PRODUCTO'}
                </p>
                <h3 className="text-white text-[18px] md:text-[20px] font-semibold leading-snug">
                  {selectedProduct ? selectedProduct.name : 'Nuevo producto'}
                </h3>
                <p className="text-[#D8DEE8] text-[12px] mt-1">
                  {selectedProduct
                    ? `Talla ${selectedProduct.size} · stock actual ${selectedProduct.quantity}`
                    : 'Completa los campos para publicar una nueva referencia'}
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-[#D8DEE8] text-sm hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
              <label className="block md:col-span-2">
                <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">NOMBRE</span>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState((current) => ({ ...current, name: e.target.value }))}
                  className="mt-2 h-11 w-full border border-muted-steel/20 bg-surface-container-lowest px-3 text-white focus:outline-none focus:border-hazard-orange"
                />
              </label>

              <label className="block">
                <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">PRECIO</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formState.price}
                  onChange={(e) => setFormState((current) => ({ ...current, price: e.target.value }))}
                  className="mt-2 h-11 w-full border border-muted-steel/20 bg-surface-container-lowest px-3 text-white focus:outline-none focus:border-hazard-orange"
                />
              </label>

              <label className="block">
                <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">CANTIDAD</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={formState.quantity}
                  onChange={(e) => setFormState((current) => ({ ...current, quantity: e.target.value }))}
                  className="mt-2 h-11 w-full border border-muted-steel/20 bg-surface-container-lowest px-3 text-white focus:outline-none focus:border-hazard-orange"
                />
              </label>

              <label className="block">
                <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">TALLA</span>
                <input
                  type="text"
                  value={formState.size}
                  onChange={(e) => setFormState((current) => ({ ...current, size: e.target.value }))}
                  className="mt-2 h-11 w-full border border-muted-steel/20 bg-surface-container-lowest px-3 text-white focus:outline-none focus:border-hazard-orange"
                />
              </label>

              <label className="block">
                <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">URL DE IMAGEN</span>
                <input
                  type="text"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState((current) => ({ ...current, imageUrl: e.target.value }))}
                  className="mt-2 h-11 w-full border border-muted-steel/20 bg-surface-container-lowest px-3 text-white focus:outline-none focus:border-hazard-orange"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">SUBIR ARCHIVO</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm text-[#D8DEE8] file:mr-4 file:py-2 file:px-4 file:border file:border-muted-steel/20 file:bg-surface-container-lowest file:text-[#D8DEE8] hover:file:bg-surface-container-high"
                />
                <p className="mt-2 text-[11px] text-[#D8DEE8]/75">JPG, PNG, WEBP, GIF o AVIF. Máximo 6MB.</p>
                {isUploadingImage && <p className="mt-1 text-[11px] text-hazard-orange">Subiendo imagen...</p>}
                {imageUploadError && <p className="mt-1 text-[11px] text-red-300">{imageUploadError}</p>}
                {formState.imageUrl && !imageUploadError && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={formState.imageUrl} alt="Preview" className="w-16 h-16 object-cover border border-muted-steel/20 bg-surface-container-lowest" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-[#D8DEE8]/80 break-all block">{formState.imageUrl}</span>
                      <span className="text-[10px] text-[#D8DEE8]/60">
                        {formState.imageUrl.startsWith('http') ? 'Persistida en Blob (producción)' : 'Guardada en public/uploads (local)'}
                      </span>
                    </div>
                  </div>
                )}
              </label>

              <label className="block md:col-span-2">
                <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">DESCRIPCIÓN</span>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState((current) => ({ ...current, description: e.target.value }))}
                  className="mt-2 w-full border border-muted-steel/20 bg-surface-container-lowest px-3 py-2 text-white focus:outline-none focus:border-hazard-orange"
                />
              </label>

              <div className="md:col-span-2 mt-2 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={Boolean(savingId) || isCreating || isUploadingImage}
                  className="h-10 px-4 border border-hazard-orange bg-hazard-orange text-black font-label-caps text-[11px] tracking-[0.08em] hover:brightness-110 transition-colors disabled:opacity-50"
                >
                  {selectedProduct ? 'GUARDAR PRODUCTO' : 'CREAR PRODUCTO'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="h-10 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] tracking-[0.08em] hover:bg-surface-container-high transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}