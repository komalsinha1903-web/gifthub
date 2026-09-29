'use client';

import Link from 'next/link';
import { Gift, ArrowRight } from 'lucide-react';

export default function FooterPromoBanner() {
  return (
    <section className="relative w-full bg-[#0a0a0d] text-white overflow-hidden border-t border-zinc-900 select-none m-0 p-0 block">
      
      {/* Background: Pure Obsidian Black with Dark Gift Box & Gold Ribbon composition */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep ambient dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0d] via-[#0a0a0d]/90 to-transparent z-10" />

        {/* Golden satin light beam on right half */}
        <div className="absolute right-0 top-0 h-full w-full sm:w-3/5 lg:w-1/2 overflow-hidden">
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-gradient-to-br from-amber-500/15 via-amber-600/5 to-transparent rounded-full blur-[80px]" />
          
          {/* Subtle golden ribbon vector curves matching the reference */}
          <svg
            className="absolute right-0 top-0 h-full w-full opacity-40"
            viewBox="0 0 600 200"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M100 0 C 250 80, 350 20, 600 140"
              stroke="#f59e0b"
              strokeWidth="42"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />
            <path
              d="M180 0 C 300 120, 420 50, 600 180"
              stroke="#fbbf24"
              strokeWidth="18"
              strokeOpacity="0.5"
            />
            <path
              d="M280 200 C 350 110, 480 90, 600 60"
              stroke="#d97706"
              strokeWidth="28"
              strokeOpacity="0.3"
            />
          </svg>
        </div>
      </div>

      {/* Main Bar Content */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-9 flex flex-col md:flex-row items-center justify-between gap-6 z-20">
        
        {/* Left: Gift Icon in Box + Headline */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-black/80">
            <Gift className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-tight">
              Make Every Moment Special
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light">
              Gift cards for what they love. Watches for a lifetime.
            </p>
          </div>
        </div>

        {/* Right: Cursive Note + Yellow Pill CTA Button */}
        <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-10 w-full md:w-auto">
          
          <div className="text-[#f5c26b] font-serif italic text-sm sm:text-base tracking-wide select-none drop-shadow-sm whitespace-nowrap">
            A gift of endless possibilities ♡
          </div>

          <Link
            href="/#categories"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#f5b842] hover:bg-[#e0a42f] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 shrink-0 whitespace-nowrap"
          >
            <span>SHOP NOW</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

        </div>

      </div>
    </section>
  );
}