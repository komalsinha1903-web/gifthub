'use client';

import Link from 'next/link';
import { Zap, ShieldCheck, Gift, ArrowRight } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0c] text-white min-h-[460px] lg:min-h-[500px] flex items-center border-b border-zinc-900 select-none">
      
      {/* 1. Background Image Container with Watermark Crop Mask */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full overflow-hidden">
          <img
            src="/images/hero-clean.png"
            alt="Luxury Watch and Gift Cards"
            /* scale-105 aur origin-top-left lagane se bottom-right ka watermark screen se cut ho jata hai */
            className="w-full h-full object-cover object-right scale-[1.04] origin-top-left transform"
          />
        </div>
        {/* Left dark shadow gradient ensuring text is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/85 to-transparent w-full lg:w-3/4" />
      </div>

      {/* 2. Text & Actions Layer */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-14 w-full z-10">
        <div className="max-w-xl space-y-6">
          
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-300 font-semibold block">
            PREMIUM GIFT CARDS &amp; LUXURY WATCHES
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-[1.12] tracking-tight text-white">
            Give the Perfect Gift, <br />
            <span className="text-[#f5c26b] font-serif font-bold">
              Every Time
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-md font-light leading-relaxed">
            Instant digital gift cards for your favorite brands and authentic luxury watches for life&apos;s biggest moments.
          </p>

          <div className="pt-1">
            <Link
              href="#categories"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#f3b747] hover:bg-[#e2a632] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-0.5"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Three Feature Badges */}
          <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-xs">Instant Delivery</span>
                <span className="text-[10px] text-zinc-400">Code in minutes</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-xs">100% Authentic</span>
                <span className="text-[10px] text-zinc-400">Trusted &amp; Verified</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-xs">Top Brands</span>
                <span className="text-[10px] text-zinc-400">Best Value Tiers</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}