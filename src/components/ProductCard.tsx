'use client';

import { useState, useMemo, useCallback } from 'react';
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
  MARRON: '#78350f', BEIGE: '#f5e6d3', CAQUI: '#8b7355',
  ORO: '#d4af37', PLATA: '#c0c0c0', BURDEOS: '#800020',
  PETROLEO: '#005f6a', TURQUESA: '#14b8a6', CORAL: '#ff6b6b',
  DENIM: '#1565c0',
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
  const [quantity, setQuantity] = useState(10);
  const [selectedSize, setSelectedSize] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const currentColor = product.colors.find((c) => c.name === selectedColor);
  const displayImage = currentColor?.image || product.imageUrl;

  const handleAdd = useCallback(() => {
    if (!selectedColor) { alert('Selecciona un color'); return; }
    if (!selectedSize) { alert('Selecciona una talla'); return; }
    if (quantity < 10) { alert('Mínimo 10 unidades'); return; }

    setIsAdding(true);
    addToCart(
      { id: `${product.modelcode}-${selectedSize}`, name: `${product.modelname} - ${selectedColor}`, price: product.priceMin || product.priceMax || 0 },
      selectedSize,
      quantity,
    );
    setTimeout(() => { setQuantity(10); setIsAdding(false); }, 300);
  }, [selectedColor, selectedSize, quantity, addToCart, product]);

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-[#5c4037]/35 bg-[#1f1f1f] transition-all hover:border-[#ff4f00] hover:-translate-y-1">
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-b from-white/5 to-[#1f1f1f]">
        {displayImage ? (
          <Image src={displayImage} alt={product.modelname} fill
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="material-symbols-outlined text-6xl text-[#e2e2e2]/20">image</span>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-[#ff4f00]/30 bg-[#ff4f00]/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#ff4f00]">
          {product.family || product.brand}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white">{product.modelname}</h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-[#e2e2e2]/60">{product.description}</p>
          )}
        </div>

        {product.priceMin != null && (
          <p className="text-lg font-bold text-white">
            {product.priceMax == null || product.priceMin === product.priceMax
              ? `${product.priceMin.toFixed(2)} €`
              : `${product.priceMin.toFixed(2)} € – ${product.priceMax.toFixed(2)} €`}
            <span className="ml-1 text-xs font-normal text-[#e2e2e2]/40">/ud</span>
          </p>
        )}

        {/* Color selector - modern pills */}
        {product.colors.length > 0 && (
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#e2e2e2]/50">
              Color {selectedColor && <span className="text-[#ff4f00]">— {selectedColor}</span>}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.slice(0, 8).map((c) => (
                <button key={c.code} onClick={() => setSelectedColor(c.name)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    selectedColor === c.name
                      ? 'border-[#ff4f00] bg-[#ff4f00]/10 text-[#ff4f00]'
                      : 'border-[#e2e2e2]/10 text-[#e2e2e2]/60 hover:border-[#e2e2e2]/30'
                  }`}>
                  {c.name}
                </button>
              ))}
              {product.colors.length > 8 && (
                <span className="text-xs text-[#e2e2e2]/30 self-center">+{product.colors.length - 8}</span>
              )}
            </div>
          </div>
        )}

        {/* Size + Quantity - simplified */}
        {product.sizes.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#e2e2e2]/50">Talla</label>
              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full rounded-lg border border-[#e2e2e2]/10 bg-[#131313] px-3 py-2 text-sm text-white focus:border-[#ff4f00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff4f00]/30">
                <option value="">Seleccionar</option>
                {product.sizes.map((s) => (
                  <option key={s.code} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#e2e2e2]/50">Unidades</label>
              <input type="number" min={10} value={quantity}
                onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                className="w-full rounded-lg border border-[#e2e2e2]/10 bg-[#131313] px-3 py-2 text-sm text-white focus:border-[#ff4f00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff4f00]/30" />
              <p className="mt-1 text-[10px] text-[#e2e2e2]/30">Mín. 10 uds</p>
            </div>
          </div>
        )}

        <button onClick={handleAdd} disabled={isAdding}
          className="w-full bg-[#ff4f00] py-3 text-sm font-bold text-[#0A0A0A] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50">
          {isAdding ? '✓ AÑADIDO' : 'AÑADIR AL PEDIDO'}
        </button>
      </div>
    </article>
  );
}
