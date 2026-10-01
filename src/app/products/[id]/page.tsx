import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '../../lib/supabase/server';
import Navbar from '@/components/ui/Navbar';
import FooterPromoBanner from '@/components/home/FooterPromoBanner';
import ProductView from '@/components/products/ProductView';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// 60-second ISR for fast loads
export const revalidate = 60;

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Check if param is a valid 36-character UUID format
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase
    .from('products')
    .select(
      'id, title, slug, price, discount_percentage, category, denominations, variants, images, image_url, description, stock'
    );

  // If it's a UUID, check id or slug; if it's text, ONLY query the slug column
  if (isUUID) {
    query = query.or(`id.eq.${id},slug.eq.${id}`);
  } else {
    query = query.eq('slug', id);
  }

  const { data: product, error } = await query.maybeSingle();

  if (error || !product) {
    notFound();
  }

  // 1. Check if product is a watch
  const isWatch = product.category === 'luxury_watches';

  // 2. Denominations parsing
  let parsedDenominations: { card_value: number; selling_price: number }[] = [];

  if (!isWatch) {
    if (Array.isArray(product.denominations) && product.denominations.length > 0) {
      parsedDenominations = product.denominations;
    } else if (typeof product.denominations === 'string') {
      try {
        parsedDenominations = JSON.parse(product.denominations);
      } catch {
        parsedDenominations = [];
      }
    }

    if (
      parsedDenominations.length === 0 &&
      Array.isArray((product.variants as any)?.sizes) &&
      (product.variants as any).sizes.length > 0
    ) {
      const discount = Number(product.discount_percentage) || 0;
      parsedDenominations = (product.variants as any).sizes.map((s: string) => {
        const val = parseFloat(s.replace(/[^0-9.]/g, '')) || Number(product.price);
        const sell = discount > 0 ? Number((val * (1 - discount / 100)).toFixed(2)) : val;
        return { card_value: val, selling_price: sell };
      });
    }
  }

  const enrichedProduct = {
    ...product,
    price: Number(product.price),
    denominations: parsedDenominations,
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <div>
        <Navbar />
        <main>
          <ProductView product={enrichedProduct} />
        </main>
      </div>
      <FooterPromoBanner />
    </div>
  );
}