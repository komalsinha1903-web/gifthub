'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { OrderStatus } from '../../../lib/types';
import { useRouter } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetails({ params }: Props) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<OrderStatus>('pending_payment');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(*),
          crypto_payment_methods(*),
          order_items(*, product:products(*))
        `)
        .eq('id', orderId)
        .single();
      if (data) {
        setOrder(data);
        setStatus(data.status);
      }
    }
    load();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setSaving(false);
    router.refresh();
  };

  if (!order) return <div className="text-white">Loading order details...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Review Order #{order.id}</h1>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <div>
          <span className="text-xs uppercase text-zinc-500">Customer Info</span>
          <p className="text-white font-bold">{order.profiles?.full_name}</p>
          <p className="text-zinc-400 text-sm">{order.profiles?.email}</p>
        </div>

        <div>
          <span className="text-xs uppercase text-zinc-500">Reported Tx Hash</span>
          <p className="font-mono text-amber-400 break-all text-sm">{order.crypto_tx_hash || 'No hash provided yet'}</p>
        </div>

        <div>
          <span className="text-xs uppercase text-zinc-500">Delivery Information</span>
          <p className="text-zinc-300 text-sm">{order.shipping_address?.address || 'No shipping details provided'}</p>
        </div>

        <div className="border-t border-zinc-800 pt-4 flex items-center gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="bg-zinc-950 border border-zinc-700 text-white rounded p-2"
          >
            <option value="pending_payment">pending_payment</option>
            <option value="payment_verifying">payment_verifying</option>
            <option value="processing">processing</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={saving}
            className="bg-amber-500 text-black px-4 py-2 font-bold rounded"
          >
            {saving ? 'Updating...' : 'Update Order Status'}
          </button>
        </div>
      </div>
    </div>
  );
}