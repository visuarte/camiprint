'use client';

import { useState } from 'react';
import { useCart } from '@/lib/store';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  size: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Selecciona una talla antes de anadir el producto.');
      return;
    }

    setIsAdding(true);
    addToCart({ id: product.id, name: product.name, price: product.price }, selectedSize, quantity);
    
    // Reset form
    setTimeout(() => {
      setSelectedSize(null);
      setQuantity(1);
      setIsAdding(false);
    }, 300);
  };

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-cami-900/60 shadow-glow transition-all hover:-translate-y-1 hover:border-accent-300/20">
      {/* Product Image */}
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-b from-cami-950 to-cami-900">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center text-cami-400">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full border border-white/12 bg-cami-950/75 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-cami-200 shadow-glow">
          Produccion B2B
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="mb-2 font-display text-2xl text-white">{product.name}</h3>
        
        {product.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-7 text-cami-300">{product.description}</p>
        )}

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cami-300">Precio base</p>
            <p className="font-display text-3xl text-white">${product.price.toFixed(2)}</p>
          </div>
          <p className="text-right text-xs leading-5 text-cami-300">Ideal para equipos, eventos y reposicion rapida.</p>
        </div>

        {/* Size Selector */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-cami-200">
            Talla
          </label>
          <select
            value={selectedSize || ''}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-cami-950/70 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-400"
          >
            <option value="">Selecciona talla</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Selector */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-cami-200">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-xl border border-white/12 bg-cami-950/70 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full rounded-full border border-accent-300/30 bg-metal-button px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 shadow-metal transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAdding ? 'Anadiendo...' : 'Anadir al carrito'}
        </button>
      </div>
    </div>
  );
}
