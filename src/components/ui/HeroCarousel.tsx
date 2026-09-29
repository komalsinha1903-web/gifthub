'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

const slides = [
  {
    tag: 'Haute Horlogerie & Rarities',
    title: 'Precision Mechanical Mastery',
    description: 'Certified Rolex, Audemars Piguet, and Patek Philippe collections. Authenticated, insured, and settled instantly over crypto rails.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=2000&q=90',
    link: '/?category=luxury_watches',
    cta: 'Explore Timepieces',
    accent: '#D4AF37',
  },
  {
    tag: 'Instant Digital Allocation',
    title: 'Apple Ecosystem Codes',
    description: 'Direct digital redemption codes for App Store, Apple Music, iCloud, and hardware. Instant issuance upon blockchain confirmation.',
    image: 'https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&w=2000&q=90',
    link: '/?category=apple_gift_cards',
    cta: 'Browse Apple Cards',
    accent: '#E5E7EB',
  },
  {
    tag: 'Global Balance Network',
    title: 'Amazon Instant Liquidity',
    description: 'Unrestricted worldwide gift cards delivered directly to your client vault with zero hidden exchange spreads.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=90',
    link: '/?category=amazon_gift_cards',
    cta: 'Acquire Amazon Vouchers',
    accent: '#F59E0B',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[620px] md:h-[720px] overflow-hidden bg-black select-none border-b border-zinc-800/80">
      {slides.map((slide, idx) => (
        <div
          key={slide.tag}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Edge-to-Edge Hero Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-[10000ms] ease-out scale-105"
            style={{ backgroundImage: `url(${slide.image})` }}
          />

          {/* Luxury Ambient Shading & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />

          {/* Slide Text Content */}
          <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-amber-500/30 backdrop-blur-md mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs uppercase tracking-widest font-mono text-amber-300 font-medium">
                  {slide.tag}
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
                {slide.title}
              </h1>

              <p className="text-zinc-300 text-sm sm:text-lg font-light leading-relaxed max-w-xl mb-10">
                {slide.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={slide.link}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm tracking-wide transition shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5"
                >
                  {slide.cta} <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="hidden sm:flex items-center gap-6 text-xs text-zinc-400 font-mono pl-4 border-l border-zinc-700">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-400" /> 100% Verified</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Instant Escrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Manual Slide Controls */}
      <button
        onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        aria-label="Previous Slide"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/80 border border-zinc-700/60 text-white transition backdrop-blur-md hover:scale-105"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
        aria-label="Next Slide"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/80 border border-zinc-700/60 text-white transition backdrop-blur-md hover:scale-105"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-6 sm:left-8 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-10 bg-amber-400' : 'w-3 bg-zinc-600 hover:bg-zinc-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}