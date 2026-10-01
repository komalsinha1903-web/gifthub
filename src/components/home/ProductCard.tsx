'use client';

import Link from 'next/link';
import { ArrowRight, Ban, Clock } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    slug?: string | null;
    title: string;
    description?: string;
    price: number;
    discount_percentage?: number;
    image_url: string;
    category: string;
    badge?: string | null;
    stock_status?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const finalPrice =
    product.discount_percentage && product.discount_percentage > 0
      ? Number((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
      : product.price;

  const isDisabled =
    product.stock_status === 'out_of_stock' ||
    product.stock_status === 'sold_out';

  const isSoldOut = product.stock_status === 'sold_out';

  // Use slug if available, otherwise fallback to id
  const productPath = product.slug || product.id;

  return (
    <div
      suppressHydrationWarning
      className={`group bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 shadow-sm relative ${
        isDisabled
          ? 'border-zinc-200 opacity-60 pointer-events-none cursor-not-allowed select-none'
          : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Badge */}
        <div className="flex items-center justify-between mb-4 min-h-[26px]">
          {isDisabled ? (
            <span
              className={`text-[11px] font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs ${
                isSoldOut
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isSoldOut ? <Ban className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              <span>{isSoldOut ? 'Sold Out' : 'Out of Stock'}</span>
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Product Image */}
        <div className="relative aspect-video w-full flex items-center justify-center p-4 bg-zinc-50 rounded-xl mb-6 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.title}
            className={`max-h-36 object-contain ${
              isDisabled
                ? 'grayscale contrast-75'
                : 'group-hover:scale-105 transition-transform'
            }`}
          />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold line-clamp-1 text-zinc-900">
          {product.title}
        </h3>

        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
          {product.description || 'Verified stock & instant authentication.'}
        </p>

        {/* Price */}
        <div className="mt-4">
          <span className="text-xs text-zinc-500 block font-medium">From</span>
          <span
            className={`text-xl font-bold font-mono ${
              isDisabled ? 'text-zinc-400 line-through' : 'text-zinc-900'
            }`}
          >
            ${Number(finalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-zinc-100">
        {isDisabled ? (
          <button
            type="button"
            disabled
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed"
          >
            <span>{isSoldOut ? 'Sold Out' : 'Out of Stock'}</span>
            <Ban className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            href={`/products/${productPath}`}
            prefetch={false}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-[#f5a600] hover:bg-[#d99200] text-black shadow-md shadow-amber-500/20 transition-all duration-200"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}