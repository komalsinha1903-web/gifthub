import { createServerSupabaseClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminDashboardClient from './AdminDashboardClient';
import { 
  DollarSign, 
  Clock, 
  ShoppingBag, 
  Package, 
  ShieldCheck,
  Plus
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // 1. Fetch all orders with items and product details
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        quantity,
        unit_price,
        product:products(id, title, category, image_url)
      )
    `)
    .order('created_at', { ascending: false });

  // 2. Fetch all products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  // Calculate Metrics
  const totalRevenue = orders?.reduce((acc, order) => {
    if (order.status === 'completed' || order.status === 'paid') {
      return acc + Number(order.total_amount || 0);
    }
    return acc;
  }, 0) || 0;

  const pendingCryptoOrders = orders?.filter(
    (o) => o.status === 'pending_crypto_payment' || o.status === 'payment_verifying'
  ).length || 0;

  const totalOrdersCount = orders?.length || 0;
  const totalProductsCount = products?.length || 0;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      
  

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-10">

        {/* Header Title with Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-bold block">
              SYSTEM OVERVIEW &amp; SETTLEMENTS
            </span>
            <h1 className="text-3xl font-sans font-extrabold text-white tracking-tight mt-1">
              Admin Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5a600] hover:bg-[#d99200] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Settled Volume</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-mono font-extrabold text-white">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">Confirmed on-chain</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Pending Crypto</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-mono font-extrabold text-amber-400">
                {pendingCryptoOrders}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">Awaiting verification</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-sky-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-mono font-extrabold text-white">
                {totalOrdersCount}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">Lifetime customer orders</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Vault Inventory</span>
              <Package className="w-4 h-4 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-mono font-extrabold text-white">
                {totalProductsCount}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">Gift cards &amp; watches</p>
            </div>
          </div>

        </div>

        {/* Dynamic Orders Verification & Status Management Component */}
        <AdminDashboardClient initialOrders={orders || []} />

      </main>

    </div>
  );
}