import { createServerSupabaseClient } from './lib/supabase/server';
import Navbar from '@/components/ui/Navbar';
import ProductCard from '@/components/home/ProductCard';
import HeroBanner from '@/components/home/HeroBanner';
import BrandTrustBar from '@/components/home/BrandTrustBar';
import FooterPromoBanner from '@/components/home/FooterPromoBanner';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams?.category;
  const searchQuery = resolvedParams?.search;

  const supabase = await createServerSupabaseClient();

  // 1. Fetch dynamic products query
  let query = supabase.from('products').select('*');

  if (activeCategory) {
    query = query.eq('category', activeCategory);
  }
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }

  const { data: products } = await query.order('created_at', { ascending: false });

  // Popular Picks
  const popularPicks = products && products.length > 0 ? products.slice(0, 6) : [];

  // Match items for category shortcuts
  const appleProduct = products?.find((p) => p.category === 'apple_gift_cards');
  const amazonProduct = products?.find((p) => p.category === 'amazon_gift_cards');
  const watchProduct = products?.find((p) => p.category === 'luxury_watches');

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-amber-400 selection:text-black flex flex-col justify-between m-0 p-0 overflow-x-hidden">
      
      <div>
        <Navbar />

        <main className="space-y-16 pb-16">
          {/* 1. HERO SECTION */}
          <HeroBanner />

          {/* 2. SHOP BY CATEGORY SECTION */}
          <section id="categories" className="max-w-7xl mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Header Box */}
              <div className="lg:col-span-3 flex flex-col justify-center space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400 font-semibold block">
                  Shop By Category
                </span>
                <h2 className="text-3xl font-serif font-bold text-zinc-900 leading-tight">
                  Find the Perfect Gift
                </h2>
                <p className="text-xs text-zinc-500 leading-relaxed font-light">
                  Choose from our top categories and discover premium gift cards and timeless watches.
                </p>
                <div>
                  <Link
                  href="/products"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#13161c] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 1: Apple Gift Card */}
              <div className="lg:col-span-3 rounded-2xl bg-gradient-to-br from-[#8ba3e8] via-[#a890d3] to-[#e4a4b8] p-6 text-white flex flex-col justify-between shadow-sm min-h-[300px]">
                <Link
                  href='/products'
                  className="w-full aspect-[4/3] rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src="/images/applecard.jpg"
                    alt="Apple Gift Card"
                    className="h-36 w-auto object-contain"
                  />
                </Link>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Apple Gift Cards</h3>
                  <p className="text-[11px] text-white/90 font-light">Apps • Music • iCloud • Hardware</p>
                  <Link
                     href='/products'
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-full font-bold text-xs transition"
                  >
                    <span>Shop Apple</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Amazon Gift Card */}
              <div className="lg:col-span-3 rounded-2xl bg-gradient-to-br from-[#0c1829] to-[#08101a] p-6 text-white flex flex-col justify-between shadow-sm min-h-[300px]">
                <Link
                    href='/products'
                  className="w-full aspect-[4/3] rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-6 cursor-pointer hover:scale-105 transition-transform"
                >
                   <img
                    src="/images/amazoncard.jpg"
                    alt="Amazon Gift Card"
                    className="h-36 w-auto object-contain"
                  />
                </Link>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Amazon Gift Cards</h3>
                  <p className="text-[11px] text-zinc-400 font-light">Millions of items storewide</p>
                  <Link
                     href='/products'
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-full font-bold text-xs transition"
                  >
                    <span>Shop Amazon</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Luxury Watches */}
              <div className="lg:col-span-3 rounded-2xl bg-[#090b10] border border-zinc-800 p-6 text-white flex flex-col justify-between shadow-sm min-h-[300px]">
                <Link
                  href='/products'
                  className="w-full aspect-[4/3] rounded-xl bg-zinc-950 flex items-center justify-center mb-6 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src="/images/luxury-watch.png"
                    alt="Luxury Watch"
                    className="h-36 w-auto object-contain"
                  />
                </Link>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Luxury Watches</h3>
                  <p className="text-[11px] text-zinc-400 font-light">Rolex • Omega • Certified</p>
                  <Link
                  href='/products'
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-full font-bold text-xs transition"
                  >
                    <span>Shop Watches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>


            </div>
          </section>

          {/* 3. LOCAL TRUSTED BRAND LOGOS */}
          <BrandTrustBar />

          {/* 4. FEATURED PRODUCTS & POPULAR PICKS */}
          <section className="max-w-7xl mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Promo: Timeless Elegance (FULL-HEIGHT BACKGROUND WATCH IMAGE) */}
              <div className="lg:col-span-4 rounded-3xl bg-[#090b10] border border-zinc-800 text-white relative overflow-hidden flex flex-col justify-between min-h-[540px] p-8 shadow-2xl group">
                
                {/* 1. Full-Height Image with Dark Gradient Layer */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <img
                    src="/images/luxury-watch.jpg"
                    alt="Rolex Submariner Milestone Collection"
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle dark gradient overlay to ensure perfect text & button contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/45 to-[#090b10]/85" />
                </div>

                {/* 2. Headline Content */}
                <div className="space-y-3 relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 block font-bold">
                    LUXURY WATCHES
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight drop-shadow-md">
                    Timeless <br />
                    Elegance
                  </h3>
                  <p className="text-xs text-zinc-300 font-light max-w-xs leading-relaxed drop-shadow-sm">
                    Iconic brands. Authentic quality. For every milestone.
                  </p>
                </div>

                {/* 3. Shop Watches CTA Button */}
                <div className="relative z-10 pt-8">
                  <Link
                    href={watchProduct ? `/products/${watchProduct.id}` : '/?category=luxury_watches'}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-black/80 transform hover:-translate-y-0.5"
                  >
                    <span>Shop Watches</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>

              </div>

              {/* Right: Dynamic Product Catalog Grid */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 block font-bold">
                    Featured Products
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mt-1">
                    Popular Picks
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {popularPicks && popularPicks.length > 0 ? (
                    popularPicks.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-20 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-500">
                      No products found.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </section>

        </main>
      </div>

      {/* 5. FULL WIDTH FOOTER BANNER */}
      <FooterPromoBanner />

    </div>
  );
}