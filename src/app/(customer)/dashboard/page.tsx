import { createServerSupabaseClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, 
  Package, 
  Truck, 
  Heart, 
  Gift, 
  ArrowRight, 
  ShoppingBag, 
  Flame,
  TicketPercent,
  Clock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerDashboard() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard');

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 2. Fetch all user orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(quantity, unit_price, product:products(title, category, image_url))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 3. Fetch wishlist items
  const { count: wishlistCount } = await supabase
    .from('wishlist')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 4. Fetch recommended catalog products
  const { data: recommendedProducts } = await supabase
    .from('products')
    .select('*')
    .limit(4)
    .order('created_at', { ascending: false });

  // Dynamic calculations
  const totalOrdersCount = orders?.length || 0;
  const activeOrders = orders?.filter(o => 
    o.status === 'pending_payment' || 
    o.status === 'payment_verifying' || 
    o.status === 'processing'
  ) || [];
  const activeOrdersCount = activeOrders.length;
  const rewardPoints = (orders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + Math.floor(Number(o.total_amount || 0) * 0.05), 0) || 0) + 150;

  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Member';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8">
      {/* 1. Header Bar: Greeting + Notifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            {greeting}, {firstName} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
            Here's what's happening with your account today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-sm shadow-amber-400/50" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Top Stats Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
          </div>
          <div className="text-3xl font-bold font-mono text-white">{totalOrdersCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium uppercase tracking-wider">Active Orders</span>
          </div>
          <div className="text-3xl font-bold font-mono text-blue-400">{activeOrdersCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-medium uppercase tracking-wider">Wishlist</span>
          </div>
          <div className="text-3xl font-bold font-mono text-white">{wishlistCount || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium uppercase tracking-wider">Reward Pts</span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">{rewardPoints}</div>
        </div>
      </div>

      {/* 3. Middle Split: Recent Orders vs Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white tracking-wide">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-amber-400 hover:underline">
              View All Orders &rarr;
            </Link>
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => {
                const firstItem = order.order_items?.[0];
                const isCompleted = order.status === 'completed';
                const isProcessing = order.status === 'processing' || order.status === 'payment_verifying';

                return (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-zinc-400 font-bold">
                          #ORD-{order.id.slice(0, 5).toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider font-semibold border ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isProcessing
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-white font-medium">
                        {firstItem?.product?.title || 'Allocated Order'}
                        {order.order_items && order.order_items.length > 1 && (
                          <span className="text-zinc-500 font-normal"> +{order.order_items.length - 1} more items</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <span className="text-sm font-mono font-bold text-white">
                        ${Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No orders placed yet. Start your first acquisition below.
            </div>
          )}
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide pb-3 border-b border-zinc-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              <Link
                href="/dashboard/orders"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-xs font-semibold text-zinc-200 hover:text-white transition"
              >
                <span>View Orders</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
              <Link
                href="/"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-xs font-semibold text-zinc-200 hover:text-white transition"
              >
                <span>Continue Shopping</span>
                <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
              <Link
                href="/bag"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-xs font-semibold text-zinc-200 hover:text-white transition"
              >
                <span>View Cart / Bag</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
              {orders && orders.length > 0 ? (
                <Link
                  href={`/dashboard/orders/${orders[0].id}`}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 border border-amber-500/30 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                >
                  <span>Track Latest Order</span>
                  <Truck className="w-3.5 h-3.5" />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>24/7 autonomous blockchain ledger status</span>
          </div>
        </div>
      </div>

      {/* 4. Recommended For You Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-bold text-white tracking-wide">Recommended For You</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendedProducts && recommendedProducts.length > 0 ? (
            recommendedProducts.map((p) => {
              const finalPrice = p.discount_percentage > 0
                ? Number((p.price * (1 - p.discount_percentage / 100)).toFixed(2))
                : p.price;

              return (
                <Link
                  key={p.id}
                  href="/"
                  className="group p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-amber-500/40 transition flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 mb-3">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.discount_percentage > 0 && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black">
                        -{p.discount_percentage}%
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-zinc-500 block truncate">
                      {p.category.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-xs font-bold text-white line-clamp-1 mt-0.5 group-hover:text-amber-300 transition">
                      {p.title}
                    </h3>
                    <p className="text-sm font-mono font-bold text-amber-400 mt-2">
                      ${finalPrice.toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-4 text-center py-8 text-xs text-zinc-500 border border-zinc-800 rounded-xl">
              Loading catalog items...
            </div>
          )}
        </div>
      </div>

      {/* 5. Special Offer Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-amber-400">
            <TicketPercent className="w-4 h-4" /> Special Privilege Offer
          </span>
          <h3 className="text-lg font-bold text-white">Get 10% OFF your next digital allocation</h3>
          <p className="text-xs text-zinc-400 font-light">
            Use code <span className="font-mono text-amber-400 font-bold">VIPCRYPTO</span> during checkout on all Apple, Amazon, and Luxury collections.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shrink-0"
        >
          Shop Now <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}