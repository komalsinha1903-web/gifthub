'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBagStore } from '../../app/lib/store/useBagStore';
import Navbar from '@/components/ui/Navbar';
import FooterPromoBanner from '@/components/home/FooterPromoBanner';
import { 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Tag, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function ShoppingBagPage() {
  const { items, updateQuantity, removeFromBag, clearBag } = useBagStore();
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);

  // Price calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    if (voucherCode.toUpperCase() === 'LUXURY10' || voucherCode.toUpperCase() === 'VIP') {
      setDiscountPercent(10);
      setVoucherApplied(true);
    } else {
      alert('Invalid voucher code');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-zinc-900 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 sm:py-14">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-zinc-200/90 gap-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-600 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Bag & Allocation
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-950 tracking-tight">
                Your Shopping Bag
              </h1>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Continue Browsing Catalog</span>
            </Link>
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="py-24 text-center bg-white border border-zinc-200/80 rounded-3xl space-y-4 my-8 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Your shopping bag is empty</h2>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light">
                Discover our curated selection of luxury watches and digital gift cards backed by secure escrow.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Main Content: Left Items List + Right Summary Box */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-8 items-start">
              
              {/* Left Column: Allocated Products */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Column Headers */}
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-zinc-400 px-2">
                  <span>Allocated Items ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                  <span>Unit Price / Total</span>
                </div>

                {/* Items Container */}
                <div className="space-y-4">
                  {items.map((item) => {
                    const itemTotal = item.price * item.quantity;
                    const isWatch = item.category?.toLowerCase().includes('watch');

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm transition hover:border-zinc-300"
                      >
                        {/* Thumbnail & Title */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center p-2 shrink-0">
                            <img
                              src={item.image_url || '/watches/luxury-watch.png'}
                              alt={item.title}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-bold">
                                {isWatch ? 'Luxury Timepiece' : 'Gift Card'}
                              </span>
                              <span className="text-[9px] bg-zinc-100 text-zinc-600 font-mono px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            </div>

                            <Link
                              href={`/products/${item.id}`}
                              className="text-sm sm:text-base font-bold text-zinc-950 hover:text-amber-600 transition line-clamp-1"
                            >
                              {item.title}
                            </Link>

                            <p className="text-xs text-zinc-500 font-mono">
                              Unit: ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Counter & Total & Delete */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100">
                          
                          {/* Quantity Controls */}
                          <div className="inline-flex items-center border border-zinc-200 rounded-lg bg-zinc-50 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-white rounded transition text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-semibold text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-white rounded transition text-xs font-bold"
                            >
                              +
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-mono font-bold text-zinc-950 block">
                              ${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeFromBag(item.id)}
                            className="text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Escrow Guarantee Strip */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Complimentary armored shipping & cryptographic escrow locked</span>
                  </div>
                  <button
                    onClick={clearBag}
                    className="text-[11px] font-mono uppercase text-zinc-500 hover:text-red-600 transition"
                  >
                    Clear Bag
                  </button>
                </div>

              </div>

              {/* Right Column: Order Summary (Clean Light Card) */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400 font-bold block">
                      Autonomous Settlement
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-zinc-950">
                      Order Summary
                    </h2>
                  </div>

                  {/* Voucher Form */}
                  <form onSubmit={handleApplyVoucher} className="space-y-2 pt-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                      Privilege Voucher / Promo
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="ENTER CODE (e.g. VIP)"
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-mono uppercase bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-950"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase rounded-xl transition"
                      >
                        Apply
                      </button>
                    </div>
                    {voucherApplied && (
                      <span className="text-[11px] text-emerald-600 font-medium block">
                        ✓ 10% privilege discount applied
                      </span>
                    )}
                  </form>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold text-zinc-900">
                        ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Privilege Discount ({discountPercent}%)</span>
                        <span className="font-mono font-semibold">
                          -${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Authentication & Escrow</span>
                      <span className="text-emerald-600 font-bold uppercase text-[11px]">
                        Complimentary
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Payment Settlement</span>
                      <span className="font-mono text-zinc-900 font-medium">
                        Crypto & Card Verified
                      </span>
                    </div>
                  </div>

                  {/* Total Due */}
                  <div className="pt-4 border-t border-zinc-200/90 flex items-baseline justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                      TOTAL DUE
                    </span>
                    <span className="text-3xl font-mono font-extrabold text-zinc-950">
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Checkout CTA: Theme Orange / Gold */}
                  <Link
                    href="/checkout"
                    className="w-full py-4 px-6 rounded-xl bg-[#f5a600] hover:bg-[#d99200] active:scale-[0.99] text-black font-extrabold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25"
                  >
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-1">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Encrypted 256-bit SSL Escrow Protection</span>
                  </div>

                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      <FooterPromoBanner />
    </div>
  );
}