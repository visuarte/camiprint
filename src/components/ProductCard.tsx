'use client';

import { useState, useMemo } from 'react';
import { useCart } from '@/lib/store';
import Image from 'next/image';

const COLOR_MAP: Record<string, string> = {
  BLANCO: '#ffffff', NEGRO: '#111111', GRIS: '#888888',
  'GRIS OSCURO': '#444444', 'GRIS CLARO': '#cccccc',
  AZUL: '#2563eb', 'AZUL MARINO': '#1e3a5f', 'AZUL OSCURO': '#1e3a5f',
  'AZUL CIELO': '#87ceeb', 'AZUL CLARO': '#93c5fd',
  ROJO: '#dc2626', 'ROJO OSCURO': '#991b1b',
  VERDE: '#16a34a', 'VERDE OSCURO': '#166534', 'VERDE CLARO': '#86efac',
  AMARILLO: '#eab308', NARANJA: '#ea580c', ROSA: '#ec4899', MORADO: '#9333ea',
  MARRON: '#78350f', BEIGE: '#f5e6d3', CAQUI: '#8b7355', KHAKI: '#8b7355',
  ORO: '#d4af37', PLATA: '#c0c0c0', BURDEOS: '#800020', VINO: '#722f37',
  PETROLEO: '#005f6a', TURQUESA: '#14b8a6', CORAL: '#ff6b6b',
  DENIM: '#1565c0', CAMOFLADO: '#4a5d23', CAMUFLAJE: '#4a5d23',
};
const DEFAULT_COLOR = '#888888';

function colorHex(name: string): string {
  const key = name.toUpperCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  const match = Object.entries(COLOR_MAP)
    .filter(([k]) => key.includes(k))
    .sort(([a], [b]) => b.length - a.length)[0];
  return match ? match[1] : DEFAULT_COLOR;
}

export interface GorModel {
  modelcode: string;
  modelname: string;
  description: string;
  brand: string;
  family: string;
  composition: string;
  imageUrl: string;
  sizes: { code: string; name: string; measures?: string }[];
  colors: { code: string; name: string; image: string }[];
  priceMin?: number;
  priceMax?: number;
}

interface ProductCardProps {
  product: GorModel;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeQty, setSizeQty] = useState<Record<string, number>>({});
  const [isAdding, setIsAdding] = useState(false);

  const currentColor = product.colors.find((c) => c.name === selectedColor);
  const displayImage = currentColor?.image || product.imageUrl;

  const totalUnits = useMemo(
    () => Object.values(sizeQty).reduce((sum, q) => sum + q, 0),
    [sizeQty],
  );

  const updateSize = (sizeName: string, val: number) => {
    setSizeQty((prev) => {
      const next = { ...prev };
      if (val <= 0) delete next[sizeName];
      else next[sizeName] = val;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert('Selecciona un color antes de añadir el producto.');
      return;
    }
    if (totalUnits < 10) {
      alert('Mínimo 10 unidades en total entre todas las tallas.');
      return;
    }

    setIsAdding(true);
    const entries = Object.entries(sizeQty).filter(([, q]) => q > 0);
    for (const [size, qty] of entries) {
      const fullName = `${product.modelname} - ${selectedColor}`;
      addToCart(
        { id: `${product.modelcode}-${size}`, name: fullName, price: 0 },
        size,
        qty,
      );
    }

    setTimeout(() => {
      setSizeQty({});
      setIsAdding(false);
    }, 300);
  };

  const hasMeasures = product.sizes.some((s) => s.measures);

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-[#5c4037]/35 bg-[#1f1f1f] transition-all hover:border-[#ff4f00] hover:-translate-y-1">
      {/* Image */}
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_#ffffff_0%,_#e5e5e5_100%)]">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.modelname}
            fill
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="material-symbols-outlined text-6xl text-[#e2e2e2]/20">image</span>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full border border-[#ff4f00]/30 bg-[#ff4f00]/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#ff4f00]">
            {product.family || product.brand}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-white">{product.modelname}</h3>

        {product.description && (
          <p className="mb-3 mt-1 line-clamp-2 text-sm leading-6 text-[#e2e2e2]/60">{product.description}</p>
        )}

        {product.composition && (
          <p className="mb-4 text-xs text-[#e2e2e2]/40">{product.composition}</p>
        )}

        {product.priceMin != null && (
          <p className="mb-4 text-lg font-bold text-white">
            {product.priceMax == null || product.priceMin === product.priceMax
              ? `${product.priceMin.toFixed(2)} €`
              : `${product.priceMin.toFixed(2)} € – ${product.priceMax.toFixed(2)} €`}
            <span className="ml-1 text-xs font-normal text-[#e2e2e2]/40">/ud</span>
          </p>
        )}

        {/* Color */}
        {product.colors.length > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#e2e2e2]/50">
              Color <span className="text-[#ff4f00]">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  className={`group/color relative rounded-md border p-1 transition-all ${
                    selectedColor === c.name
                      ? 'border-[#ff4f00] ring-1 ring-[#ff4f00]'
                      : 'border-[#e2e2e2]/10 hover:border-[#e2e2e2]/30'
                  }`}
                >
                  <span
                    className="block h-5 w-5 rounded-sm border border-black/10"
                    style={{ backgroundColor: colorHex(c.name) }}
                  />
                  <span className="absolute -bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-[#0A0A0A] px-2 py-0.5 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover/color:opacity-100 pointer-events-none">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size distribution matrix */}
        {product.sizes.length > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-[#e2e2e2]/50">
                Tallas — distribuye las unidades
              </label>
              {hasMeasures && (
                <a
                  href={`/guia-tallas/${product.modelcode}`}
                  className="text-[10px] text-[#ff4f00] underline hover:no-underline"
                >
                  Guía de tallas
                </a>
              )}
            </div>
            <div className="space-y-1.5">
              {product.sizes.map((s) => (
                <div key={s.code} className="grid grid-cols-[auto_1fr] items-center gap-2 lg:grid-cols-[auto_1fr_auto]">
                  <span className="text-xs font-bold text-[#e2e2e2]/70">{s.name}</span>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={sizeQty[s.name] || ''}
                    onChange={(e) => updateSize(s.name, Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full min-w-0 rounded-lg border border-[#e2e2e2]/10 bg-[#131313] px-3 py-1.5 text-sm text-white placeholder:text-[#e2e2e2]/20 focus:border-[#ff4f00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff4f00]/30"
                  />
                  {s.measures && (
                    <span className="hidden self-center text-[10px] text-[#e2e2e2]/30 lg:block" title="Medidas del producto">
                      {s.measures}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#e2e2e2]/10 pt-2">
              <span className="text-xs text-[#e2e2e2]/50">
                Mín. <span className="text-[#ff4f00] font-bold">10</span> unidades
              </span>
              <span className={`text-sm font-bold ${totalUnits >= 10 ? 'text-emerald-400' : totalUnits > 0 ? 'text-[#ff4f00]' : 'text-[#e2e2e2]/40'}`}>
                Total: {totalUnits} uds
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-[#ff4f00] py-3 text-sm font-bold text-[#0A0A0A] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAdding ? 'AÑADIDO AL PEDIDO' : totalUnits > 0 ? `AÑADIR (${totalUnits} uds)` : 'AÑADIR AL PEDIDO'}
        </button>
      </div>
    </article>
  );
}
