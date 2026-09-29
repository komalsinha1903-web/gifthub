'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Clock, CheckCircle2, Copy, Check } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
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

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time verification of on-chain cryptocurrency transactions and customer purchases.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white"
        >
          Refresh Ledger
        </button>
      </div>

      {/* Orders Table - Screenshot Match */}
      <div className="rounded-xl border border-zinc-800/80 bg-black/40 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800/80 text-zinc-500 font-mono text-[11px] uppercase tracking-wider bg-zinc-950/50">
              <th className="py-4 px-6 font-semibold">ORDER ID</th>
              <th className="py-4 px-6 font-semibold">CUSTOMER</th>
              <th className="py-4 px-6 font-semibold">TOTAL</th>
              <th className="py-4 px-6 font-semibold">CRYPTO HASH</th>
              <th className="py-4 px-6 font-semibold">STATUS</th>
              <th className="py-4 px-6 font-semibold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {orders.map((order) => {
              const shortId = order.id.slice(0, 8) + '...';
              const isUpdating = updatingId === order.id;

              return (
                <tr key={order.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <span>{shortId}</span>
                      <button
                        onClick={() => copyId(order.id)}
                        className="text-zinc-600 hover:text-zinc-400"
                        title="Copy Full UUID"
                      >
                        {copiedId === order.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-white">{order.customer_name || 'sonam'}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{order.customer_email || 'perac33398@kingdais.com'}</p>
                    </div>
                  </td>

                  <td className="py-4 px-6 font-mono font-bold text-white text-sm">
                    ${Number(order.total_amount).toLocaleString()}
                  </td>

                  <td className="py-4 px-6 font-mono text-zinc-400">
                    {order.crypto_tx_hash ? order.crypto_tx_hash.slice(0, 10) + '...' : 'Pending'}
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold border border-amber-500/40 bg-amber-500/10 text-[#f5a600]">
                      {order.status || 'pending_crypto_payment'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <select
                      disabled={isUpdating}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-black border border-zinc-800 text-[#f5a600] font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="pending_crypto_payment">Manage: Pending</option>
                      <option value="payment_verifying">Manage: Verifying</option>
                      <option value="processing">Manage: Processing</option>
                      <option value="completed">Manage: Completed</option>
                      <option value="cancelled">Manage: Cancelled</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}