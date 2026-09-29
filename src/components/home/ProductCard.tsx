'use client';

import Link from 'next/link';
import { ArrowRight, Ban, Clock } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description?: string;
    price: number;
    discount_percentage?: number;
    image_url: string;
    category: string;
    badge?: string | null;
    stock_status?: 'in_stock' | 'out_of_stock' | 'sold_out' | string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const finalPrice = product.discount_percentage && product.discount_percentage > 0
    ? Number((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
    : product.price;

  // Stock status checks
  const isSoldOut = product.stock_status === 'sold_out';
  const isOutOfStock = product.stock_status === 'out_of_stock';
  const isUnavailable = isSoldOut || isOutOfStock;

  // Admin badge config
  const badgeConfig: Record<string, { label: string; style: string }> = {
    luxury: {
      label: '👑 Luxury',
      style: 'bg-[#0f172a] text-[#f5a600] border border-amber-500/30',
    },
    bestseller: {
      label: '🔥 Best Seller',
      style: 'bg-[#182346] text-[#60a5fa] border border-blue-500/30',
    },
    most_popular: {
      label: '⭐ Most Popular',
      style: 'bg-[#ffeedb] text-[#d97706] border border-amber-200',
    },
  };

  const currentBadge = product.badge ? badgeConfig[product.badge.toLowerCase()] : null;

  return (
    <div 
      suppressHydrationWarning
      className={`group bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 shadow-sm relative ${
        isUnavailable 
          ? 'border-zinc-200/60 opacity-90' 
          : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Badges Row: Stock Status ya Category Badge */}
        <div className="flex items-center justify-between mb-4 min-h-[26px]">
          {isUnavailable ? (
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
          ) : currentBadge ? (
            <span className={`text-[11px] font-semibold font-mono uppercase tracking-wider px-3 py-1 rounded-full ${currentBadge.style}`}>
              {currentBadge.label}
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Thumbnail Clickable Link */}
        <Link 
          href={`/products/${product.id}`}
          className={`relative aspect-video w-full flex items-center justify-center p-4 bg-zinc-50 rounded-xl mb-6 overflow-hidden block ${
            isUnavailable ? 'cursor-not-allowed' : ''
          }`}
        >
          <img
            src={product.image_url}
            alt={product.title}
            className={`max-h-36 object-contain transition-all duration-500 ${
              isUnavailable 
                ? 'grayscale contrast-75 opacity-75' 
                : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80';
            }}
          />

          {/* Sold out overlay tag across thumbnail */}
          {isUnavailable && (
            <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[0.5px] flex items-center justify-center">
              <span className="bg-zinc-950/85 text-white font-mono uppercase text-[10px] tracking-widest font-extrabold px-3 py-1 rounded-md border border-white/10 shadow-lg">
                {isSoldOut ? 'Unavailable' : 'Back Soon'}
              </span>
            </div>
          )}
        </Link>

        {/* Clickable Product Title */}
        <h3 className={`text-base font-bold line-clamp-1 transition-colors ${
          isUnavailable ? 'text-zinc-600' : 'text-zinc-900 group-hover:text-amber-600'
        }`}>
          <Link href={`/products/${product.id}`}>
            {product.title}
          </Link>
        </h3>

        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
          {product.description || 'Verified stock & instant authentication.'}
        </p>

        <div className="mt-4">
          <span className="text-xs text-zinc-500 block font-medium">From</span>
          <span className={`text-xl font-bold font-mono ${isUnavailable ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
            ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Action Button: Disabled when sold out/out of stock */}
      <div className="mt-6 pt-4 border-t border-zinc-100">
        {isUnavailable ? (
          <button
            type="button"
            disabled
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed select-none"
          >
            <span>{isSoldOut ? 'Sold Out' : 'Out of Stock'}</span>
            <Ban className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            href={`/products/${product.id}`}
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