import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ExternalLink,
  Coins,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const filterStatus = resolvedParams?.status;

  const supabase = await createServerSupabaseClient();

  // 1. Logged-in user check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?redirect=/dashboard/orders');
  }

  // 2. Fetch Orders
  let ordersQuery = supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Status Filter Sync
  if (filterStatus && filterStatus !== 'all') {
    if (filterStatus === 'pending_payment') {
      ordersQuery = ordersQuery.in('status', [
        'pending_payment',
        'pending_crypto_payment',
        'pending',
      ]);
    } else {
      ordersQuery = ordersQuery.eq('status', filterStatus);
    }
  }

  const { data: orders, error: ordersError } = await ordersQuery;

  if (ordersError) {
    console.error('ORDERS FETCH ERROR:', ordersError.message || ordersError);
  }

  // 3. Fetch Items & Products Safely
  let ordersWithItems: any[] = [];

  if (orders && orders.length > 0) {
    const orderIds = orders.map((order) => order.id);

    // Fetch order_items bina broken foreign join ke
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, quantity, unit_price')
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('ORDER ITEMS FETCH ERROR:', itemsError.message || itemsError);
    }

    const items = orderItems || [];

    // Saare distinct product_ids nikalo
    const productIds = Array.from(
      new Set(items.map((it) => it.product_id).filter(Boolean))
    );

    // Products table se details fetch karo
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

    // Orders aur unke Items ko map karein
    ordersWithItems = orders.map((order) => ({
      ...order,
      order_items: items
        .filter((item) => item.order_id === order.id)
        .map((item) => ({
          ...item,
          products: productsMap[item.product_id] || null,
        })),
    }));
  }

  const tabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending Payment', value: 'pending_payment' },
    { label: 'Verifying', value: 'payment_verifying' },
    { label: 'Processing', value: 'processing' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="space-y-6" suppressHydrationWarning>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            Order Ledger &amp; Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            My Orders
          </h1>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive =
            (!filterStatus && tab.value === 'all') ||
            filterStatus === tab.value;

          const href =
            tab.value === 'all'
              ? '/dashboard/orders'
              : `/dashboard/orders?status=${tab.value}`;

          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Orders Table */}
      {ordersWithItems.length > 0 ? (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-5 font-semibold">Order ID &amp; Date</th>
                  <th className="py-4 px-5 font-semibold">Items</th>
                  <th className="py-4 px-5 font-semibold">Payment</th>
                  <th className="py-4 px-5 font-semibold">Total</th>
                  <th className="py-4 px-5 font-semibold">Status</th>
                  <th className="py-4 px-5 font-semibold text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/60">
                {ordersWithItems.map((order) => {
                  const isCompleted = order.status === 'completed';
                  const isVerifying = order.status === 'payment_verifying';
                  const isProcessing = order.status === 'processing';

                  const formattedDate = order.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : '';

                  const shortId = `ORD-${String(order.id).slice(0, 8).toUpperCase()}`;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-800/20 transition-colors"
                    >
                      {/* Order ID & Date */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-white text-xs block">
                            #{shortId}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono block">
                            {formattedDate}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-2 max-w-xs">
                          {order.order_items?.length > 0 ? (
                            order.order_items.map((item: any) => {
                              const product = item.products;

                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-2.5"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                    {product?.image_url ? (
                                      <img
                                        src={product.image_url}
                                        alt={product.title || 'Product'}
                                        className="max-h-full max-w-full object-contain"
                                      />
                                    ) : (
                                      <Package className="w-4 h-4 text-zinc-500" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-semibold text-zinc-200 truncate">
                                      {product?.title || 'Product Item'}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 font-mono">
                                      Qty: {item.quantity} • $
                                      {Number(item.unit_price).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-zinc-500 italic">
                              No item details
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1 font-mono text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {order.payment_method?.toUpperCase() || 'CRYPTO'}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block truncate max-w-[140px]">
                            {order.crypto_tx_hash
                              ? `TX: ${order.crypto_tx_hash.slice(0, 10)}...`
                              : order.tx_hash
                              ? `TX: ${order.tx_hash.slice(0, 10)}...`
                              : 'TX: Pending'}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-5 align-top">
                        <span className="font-mono font-bold text-sm text-amber-400">
                          $
                          {Number(order.total_amount || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isVerifying || isProcessing
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>
                            {String(order.status || 'pending').replace(
                              /_/g,
                              ' '
                            )}
                          </span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 align-top text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-amber-500/30 hover:border-amber-400 text-xs font-semibold text-amber-300 hover:text-white transition"
                        >
                          <span>Invoice</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-zinc-800/80 rounded-3xl bg-zinc-900/20">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            No Orders Found
          </h3>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-6">
            No records matched your current selection.
          </p>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold transition"
          >
            Clear Filter
          </Link>
        </div>
      )}

    </div>
  );
}