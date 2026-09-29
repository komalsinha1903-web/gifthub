'use client';

import { Product } from '../../app/lib/types';
import { useBagStore } from '../../app/lib/store/useBagStore';
import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const addToBag = useBagStore((state) => state.addToBag);
  const getEffectivePrice = useBagStore((state) => state.getEffectivePrice);
  const finalPrice = getEffectivePrice(product);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToBag(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group relative bg-[#0d0f14] border border-zinc-800/80 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(212,175,55,0.08)]">
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-transparent to-transparent opacity-60" />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-black/70 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
          {product.category.replace(/_/g, ' ')}
        </span>

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-black shadow-lg">
            -{product.discount_percentage}%
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add Action */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              ${finalPrice.toLocaleString()}
            </div>
            {product.discount_percentage > 0 && (
              <span className="text-xs font-mono text-zinc-500 line-through">
                ${product.price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              added
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-800 hover:bg-amber-400 text-zinc-200 hover:text-black border border-zinc-700 hover:border-amber-400'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}