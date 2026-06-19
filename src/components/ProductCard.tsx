'use client';

import { useState, useCallback, useEffect } from 'react';
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

export default function ProductCard({ product }: { product: GorModel }) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [selectedSize, setSelectedSize] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [multiplier, setMultiplier] = useState(1.5);
  const [printingCost, setPrintingCost] = useState(2);

  useEffect(() => {
    fetch('/api/site-settings').then(r => r.json()).then(data => {
      if (data.priceMultiplier) setMultiplier(data.priceMultiplier);
      if (data.basePrintingCost != null) setPrintingCost(data.basePrintingCost);
    }).catch(() => {});
  }, []);

  const currentColor = product.colors.find((c) => c.name === selectedColor);
  const displayImage = currentColor?.image || product.imageUrl;

  const handleAdd = useCallback(() => {
    if (!selectedColor) { alert('Selecciona un color'); return; }
    if (!selectedSize) { alert('Selecciona una talla'); return; }
    if (quantity < 10) { alert('Mínimo 10 unidades'); return; }
    setIsAdding(true);
    addToCart(
      { id: `${product.modelcode}-${selectedSize}`, name: `${product.modelname} - ${selectedColor}`, price: product.priceMin || product.priceMax || 0 },
      selectedSize, quantity,
    );
    setTimeout(() => { setQuantity(10); setIsAdding(false); }, 300);
  }, [selectedColor, selectedSize, quantity, addToCart, product]);

  return (
    <article className="group overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 transition-all hover:shadow-lg hover:ring-gray-200">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f8f8f8]">
        {displayImage ? (
          <Image src={displayImage} alt={product.modelname} fill
            className="object-contain p-4 transition-all duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-200">—</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium text-gray-500 shadow-sm backdrop-blur">
          {product.family || product.brand}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold leading-snug text-gray-900">{product.modelname}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-400">{product.description}</p>
        )}

        {product.priceMin != null && (
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {(product.priceMin * multiplier + printingCost).toFixed(2)}€
            <span className="ml-1 text-[10px] font-normal text-gray-400">/ud</span>
          </p>
        )}

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.colors.slice(0, 6).map((c) => (
              <button key={c.code} onClick={() => setSelectedColor(c.name)}
                className="relative flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[9px] font-medium transition-all"
                style={{
                  borderColor: selectedColor === c.name ? '#111' : '#e5e7eb',
                  background: selectedColor === c.name ? '#f9fafb' : 'transparent',
                  color: selectedColor === c.name ? '#111' : '#6b7280',
                }}>
                <span className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-gray-200" style={{ background: colorHex(c.name) }} />
                {c.name}
              </button>
            ))}
            {product.colors.length > 6 && (
              <span className="flex items-center text-[9px] text-gray-300">+{product.colors.length - 6}</span>
            )}
          </div>
        )}

        {/* Size + Quantity */}
        {product.sizes.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-0">
              <option value="">Talla</option>
              {product.sizes.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
            <input type="number" min={10} value={quantity}
              onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-0" />
          </div>
        )}

        <button onClick={handleAdd} disabled={isAdding}
          className="mt-3 w-full rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40">
          {isAdding ? '✓ Añadido' : 'Añadir'}
        </button>
      </div>
    </article>
  );
}
