import Navbar from '@/components/ui/Navbar';
import FooterPromoBanner from '@/components/home/FooterPromoBanner';
import ProductCard from '@/components/home/ProductCard';
import Link from 'next/link';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}

// 60-second Incremental Static Regeneration (ISR). User ke liye page 0ms (Instant) load hoga!
export const revalidate = 60;

export default async function ProductsCatalogPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams?.category;
  const searchQuery = resolvedParams?.search;
  const activeSort = resolvedParams?.sort || 'newest';

  // Public Catalog ke liye lightweight stateless client (Zero Auth latency overhead)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  // Sirf required columns mangwayein (select('*') se 4x fast)
  let query = supabase
    .from('products')
    .select('id, title, description, price, discount_percentage, image_url, category, badge, stock_status');

  if (activeCategory) {
    if (activeCategory === 'gift_cards') {
      query = query.ilike('category', '%gift%');
    } else {
      query = query.eq('category', activeCategory);
    }
  }

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }

  if (activeSort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (activeSort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: products } = await query;

  const categories = [
    { label: 'All Items', value: undefined, href: '/products' },
    { label: 'Gift Cards', value: 'gift_cards', href: '/products?category=gift_cards' },
    { label: 'Luxury Watches', value: 'luxury_watches', href: '/products?category=luxury_watches' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-zinc-900 flex flex-col justify-between" suppressHydrationWarning>
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
          {/* Header Section */}
          <div className="border-b border-zinc-200/90 pb-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-600 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Catalog
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-950 tracking-tight">
                  {activeCategory
                    ? activeCategory.replace(/_/g, ' ').toUpperCase()
                    : 'Explore All Products'}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-light max-w-xl">
                  Browse authentic luxury timepieces and instant digital gift cards backed by escrow protection.
                </p>
              </div>

              <div className="text-xs font-mono text-zinc-500 bg-white border border-zinc-200/90 px-3.5 py-1.5 rounded-full self-start md:self-auto shadow-xs">
                Showing <span className="font-bold text-zinc-900">{products?.length || 0}</span> items
              </div>
            </div>
          </div>

          {/* Category Pills & Filters */}
          <div className="py-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isActive =
                  cat.value === activeCategory ||
                  (!activeCategory && cat.value === undefined);

                return (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {/* Quick Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">Sort:</span>
              <Link
                href={`/products?${activeCategory ? `category=${activeCategory}&` : ''}sort=newest`}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  activeSort === 'newest'
                    ? 'border-zinc-900 bg-zinc-100 font-semibold text-zinc-900'
                    : 'border-zinc-200 text-zinc-500 hover:text-zinc-900 bg-white'
                }`}
              >
                Newest
              </Link>
              <Link
                href={`/products?${activeCategory ? `category=${activeCategory}&` : ''}sort=price_asc`}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  activeSort === 'price_asc'
                    ? 'border-zinc-900 bg-zinc-100 font-semibold text-zinc-900'
                    : 'border-zinc-200 text-zinc-500 hover:text-zinc-900 bg-white'
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/products?${activeCategory ? `category=${activeCategory}&` : ''}sort=price_desc`}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  activeSort === 'price_desc'
                    ? 'border-zinc-900 bg-zinc-100 font-semibold text-zinc-900'
                    : 'border-zinc-200 text-zinc-500 hover:text-zinc-900 bg-white'
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>

          {/* Products Grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white border border-zinc-200/80 rounded-3xl space-y-3 mt-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">No products found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No items match this category or search filter. Try choosing another category.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-block px-5 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition"
                >
                  View All Items
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <FooterPromoBanner />
    </div>
  );
}