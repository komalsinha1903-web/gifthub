'use client';

import { useState } from 'react';
import { ShoppingBag, Star, Zap, ShieldCheck, Check } from 'lucide-react';
import { useBagStore } from '../../app/lib/store/useBagStore';

interface Denomination {
  card_value: number;
  selling_price: number;
}

interface ProductViewProps {
  product: {
    id: string;
    title: string;
    category?: string;
    badge?: string;
    sku?: string;
    price: number;
    discount_percentage?: number;
    stock_quantity?: number;
    description?: string;
    image_url: string;
    images?: string[];
    denominations?: Denomination[];
    variants?: {
      sizes?: string[];
      colors?: string[];
      others?: string[];
    };
  };
}

export default function ProductView({ product }: ProductViewProps) {
  
  const addItem = useBagStore((state) => state.addItem);

  // 1. Image Gallery Handling (Main + Array of 6 images)
  const allImages: string[] = Array.from(
    new Set([
      product.image_url,
      ...(Array.isArray(product.images) ? product.images : [])
    ].filter(Boolean))
  );

  const [selectedImage, setSelectedImage] = useState<string>(
    allImages[0] || product.image_url
  );

  const denominations: Denomination[] = Array.isArray(product.denominations)
    ? product.denominations
    : [];

  const [selectedTier, setSelectedTier] = useState<Denomination | null>(
    denominations.length > 0 ? denominations[0] : null
  );

  // Extract Variants
  const availableSizes = product.variants?.sizes || [];
  const availableColors = product.variants?.colors || [];
  const availableOthers = product.variants?.others || [];

  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes.length > 0 ? availableSizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors.length > 0 ? availableColors[0] : ''
  );

  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Calculation for prices
  const activeSellingPrice = selectedTier
    ? Number(selectedTier.selling_price)
    : product.discount_percentage && product.discount_percentage > 0
    ? Number((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
    : Number(product.price);

  const activeOriginalPrice = selectedTier
    ? Number(selectedTier.card_value)
    : Number(product.price);

  const inStock = (product.stock_quantity ?? 10) > 0;

  const handleAddToCart = () => {
    const uniqueItemId = `${product.id}-${selectedTier ? selectedTier.card_value : 'base'}-${selectedSize || 'nosize'}-${selectedColor || 'nocolor'}`;

    addItem({
      id: uniqueItemId,
      productId: product.id,
      title: product.title,
      price: activeSellingPrice,
      card_value: selectedTier ? selectedTier.card_value : null,
      image_url: selectedImage || product.image_url,
      quantity: quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    } as any);

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Fixed Width & Height Image + Reduced Box Padding */}
        <div className="space-y-3 flex flex-col items-center">
          
          {/* Main Image Box */}
          <div className="rounded-2xl p-2 sm:p-3 border border-zinc-200/80 flex items-center justify-center shadow-xs">
            <div className="w-[400px] h-[340px] sm:w-[400px] flex items-center justify-center overflow-hidden rounded-xl bg-white">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-contain p-2 transition-transform duration-200 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>
          </div>

          {/* 6 Images Thumbnail Selector */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto p-1 max-w-full scrollbar-thin">
              {allImages.map((imgUrl, idx) => {
                const isActive = selectedImage === imgUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden bg-white p-1 transition-all duration-150 shrink-0 cursor-pointer ${
                      isActive
                        ? 'border-zinc-950 shadow-sm scale-105'
                        : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="space-y-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400 font-bold block mb-1.5">
              LUXURY TIMEPIECES &amp; VOUCHERS
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-zinc-900 tracking-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1 text-[#f5a600]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#f5a600]" />
                ))}
                <span className="text-xs font-bold text-zinc-700 ml-1">5.0</span>
              </div>
              {product.sku && (
                <span className="text-xs font-mono text-zinc-400">
                  {product.sku}
                </span>
              )}
            </div>
          </div>

          {/* Pricing with RED highlighted strikethrough */}
          <div className="border-b border-zinc-100 pb-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-900">
                ${activeSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              {/* Red Color Highlighted Cut Price */}
              {activeOriginalPrice > activeSellingPrice && (
                <span className="text-lg sm:text-xl font-mono font-bold text-red-500 line-through decoration-red-500 decoration-2">
                  ${activeOriginalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}

              {/* Percentage Off Badge */}
              {product.discount_percentage && product.discount_percentage > 0 && (
                <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                  {product.discount_percentage}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Tax included.</p>
          </div>

          {/* Denominations (Gift Cards) */}
          {denominations.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold block">
                SELECT CARD VALUE
              </label>
              <div className="flex flex-wrap gap-2">
                {denominations.map((tier, index) => {
                  const isSelected = selectedTier?.card_value === tier.card_value;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={`px-5 py-2 rounded-xl font-mono text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white shadow-sm border-black scale-[1.02]'
                          : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-black'
                      }`}
                    >
                      ${tier.card_value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1. PRODUCT SIZES SELECTOR */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold block">
                AVAILABLE SIZES
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size, index) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white border border-black shadow-sm'
                          : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. PRODUCT COLORS SELECTOR */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold block">
                AVAILABLE COLORS
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color, index) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-black text-white border border-black shadow-sm'
                          : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-black'
                      }`}
                    >
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. OTHER SPECIFICATIONS / ATTRIBUTES (e.g. Case: Steel, Strap: Rubber) */}
          {availableOthers.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold block">
                SPECIFICATIONS & ATTRIBUTES
              </label>
              <div className="flex flex-wrap gap-2">
                {availableOthers.map((attr, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-mono font-medium"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 pt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                inStock ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span
              className={`text-xs font-mono font-medium ${
                inStock ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {inStock ? 'In Stock • Instant Delivery' : 'Currently backordered'}
            </span>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold block">
              QUANTITY
            </label>
            <div className="inline-flex items-center border border-zinc-200 rounded-xl bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg font-bold cursor-pointer"
              >
                -
              </button>
              <span className="w-10 text-center font-mono font-bold text-sm text-zinc-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-[#f5a600] hover:bg-[#d99200] active:scale-[0.99] text-black shadow-amber-500/20'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>ADDED TO BAG!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>ADD TO CART</span>
              </>
            )}
          </button>

          {/* Overview */}
          <div className="pt-4 border-t border-zinc-100 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
              OVERVIEW
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {product.description ||
                'Swiss mechanical luxury timepiece crafted with exceptional precision, timeless ergonomics, and certified authentic heritage.'}
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Immediate Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Genuine &amp; Verified</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}