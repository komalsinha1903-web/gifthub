import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '../../lib/supabase/server';
import Navbar from '@/components/ui/Navbar';
import FooterPromoBanner from '@/components/home/FooterPromoBanner';
import ProductView from '@/components/products/ProductView';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  // 1. Check if product is a watch
  const isWatch = product.category === 'luxury_watches';

  // 2. Denominations sirf gift cards ke liye banegi, watches ke liye hamesha empty rahegi
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

    // Fallback sirf tab chalega jab product watch NA ho
    if (
      parsedDenominations.length === 0 &&
      Array.isArray(product.variants?.sizes) &&
      product.variants.sizes.length > 0
    ) {
      const discount = Number(product.discount_percentage) || 0;
      parsedDenominations = product.variants.sizes.map((s: string) => {
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