'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ArrowLeft, 
  Package, 
  Coins, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  User, 
  ExternalLink 
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  // Next.js 15/16: Unwrap Promise params safely
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;

      try {
        setLoading(true);

        // 1. Fetch Order Details (Clean select without broken joins)
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (orderErr) {
          console.error('Error fetching order:', orderErr.message || orderErr);
          setLoading(false);
          return;
        }

        if (!orderData) {
          console.warn('Order not found');
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // 2. Fetch Order Items
        const { data: itemsData, error: itemsErr } = await supabase
          .from('order_items')
          .select('id, order_id, product_id, quantity, unit_price')
          .eq('order_id', orderId);

        if (itemsErr) {
          console.error('Error fetching order items:', itemsErr.message || itemsErr);
        }

        const rawItems = itemsData || [];

        // 3. Fetch Product Metadata safely
        const productIds = Array.from(
          new Set(rawItems.map((item) => item.product_id).filter(Boolean))
        );

        let productsMap: Record<string, any> = {};
        if (productIds.length > 0) {
          const { data: productsData } = await supabase
            .from('products')
            .select('id, title, category, image_url')
            .in('id', productIds);

          if (productsData) {
            productsMap = productsData.reduce((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {} as Record<string, any>);
          }
        }

        // Map items with products
        const enrichedItems = rawItems.map((item) => ({
          ...item,
          products: productsMap[item.product_id] || null,
        }));

        setOrderItems(enrichedItems);
      } catch (err: any) {
        console.error('Unexpected error loading order:', err.message || err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId, supabase]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 border border-zinc-800 rounded-3xl bg-zinc-900/40 max-w-lg mx-auto p-8 space-y-4">
        <Package className="w-10 h-10 text-zinc-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-zinc-400">The invoice you requested does not exist or has expired.</p>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCompleted = order.status === 'completed';
  const isVerifying = order.status === 'payment_verifying';
  const isProcessing = order.status === 'processing';
  const shortId = `ORD-${String(order.id).slice(0, 8).toUpperCase()}`;
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString()
    : '';

  return (
    <div className="space-y-6 max-w-5xl mx-auto" suppressHydrationWarning>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/orders"
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-amber-400 font-bold tracking-widest uppercase">
                Invoice Details
              </span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-[11px] font-mono text-zinc-400">{formattedDate}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5">#{shortId}</h1>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase font-semibold border ${
            isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : isVerifying || isProcessing
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span>{String(order.status || 'pending').replace(/_/g, ' ')}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Items */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Ordered Items ({orderItems.length})
            </h2>

            <div className="divide-y divide-zinc-800/60">
              {orderItems.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products.title || 'Product'}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {item.products?.title || `Item #${item.id.slice(0, 6)}`}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono">
                        Qty: {item.quantity} &times; ${Number(item.unit_price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-amber-400 text-sm">
                    ${(Number(item.unit_price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Meta */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Payment Info */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Payment Summary
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Method</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {order.payment_method?.toUpperCase() || 'CRYPTO'}
                </span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>Transaction</span>
                <span className="text-zinc-300 truncate max-w-[120px]">
                  {order.crypto_tx_hash ? `${order.crypto_tx_hash.slice(0, 10)}...` : 'Pending'}
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex justify-between items-baseline">
                <span className="font-sans font-bold text-sm text-zinc-300">Total Paid</span>
                <span className="text-xl font-bold text-amber-400">
                  ${Number(order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Customer / Shipping Details */}
          {(order.customer_name || order.customer_email || order.billing_address) && (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-3 text-xs">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Customer Details
              </h3>
              {order.customer_name && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{order.customer_name}</span>
                </div>
              )}
              {order.customer_email && (
                <p className="text-zinc-500 font-mono pl-5">{order.customer_email}</p>
              )}
              {order.billing_address && (
                <div className="flex items-start gap-2 text-zinc-400 pt-2 border-t border-zinc-800/60">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>
                    {order.billing_address.line1 || ''}, {order.billing_address.city || ''} {order.billing_address.state || ''} {order.billing_address.zip || ''}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}