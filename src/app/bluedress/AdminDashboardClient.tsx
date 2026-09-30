'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Filter,
  Search
} from 'lucide-react';

export default function AdminDashboardClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert('Failed to update: ' + error.message);
    }
    setUpdatingId(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter((order) => {
    const status = (order.status || '').toLowerCase();
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'pending'
        ? status.includes('pending') || status.includes('verif')
        : status.includes('completed');

    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      (order.customer_email || '').toLowerCase().includes(search.toLowerCase());

    return matchesFilter && (search ? matchesSearch : true);
  });

  return (
    <div className="space-y-6">
      
      {/* Table Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition ${
                filter === tab
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Orders' : tab === 'pending' ? 'Needs Review' : 'Completed'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>

      </div>

      {/* Orders Management Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-4 px-5 font-semibold">Order ID</th>
                <th className="py-4 px-5 font-semibold">Client Details</th>
                <th className="py-4 px-5 font-semibold">Total &amp; Payment</th>
                <th className="py-4 px-5 font-semibold">Current Status</th>
                <th className="py-4 px-5 font-semibold text-right">Quick Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const shortId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
                  const isPending =
                    order.status === 'pending_crypto_payment' ||
                    order.status === 'payment_verifying';
                  const isCompleted = order.status === 'completed';

                  return (
                    <tr key={order.id} className="hover:bg-zinc-800/20 transition-colors">
                      
                      {/* 1. Order ID */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                            <span>#{shortId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(order.id)}
                              className="text-zinc-500 hover:text-zinc-300"
                            >
                              {copiedId === order.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono block">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </td>

                      {/* 2. Customer */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-zinc-200">
                            {order.customer_name || 'Client'}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {order.customer_email || 'No email registered'}
                          </p>
                        </div>
                      </td>

                      {/* 3. Total & Payment */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-amber-400 block text-sm">
                            ${Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono block">
                            Method: {order.payment_method?.toUpperCase() || 'CRYPTO'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Status Badge */}
                      <td className="py-4 px-5 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold border ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{order.status?.replace(/_/g, ' ')}</span>
                        </span>
                      </td>

                      {/* 5. Quick Actions */}
                      <td className="py-4 px-5 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <button
                              type="button"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold transition disabled:opacity-50"
                            >
                              Approve &amp; Complete
                            </button>
                          )}

                          {!isCompleted && !isPending && (
                            <button
                              type="button"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-[11px] font-bold transition disabled:opacity-50"
                            >
                              Mark Completed
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[11px] transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-500 font-mono text-xs">
                    No orders matching this filter.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}