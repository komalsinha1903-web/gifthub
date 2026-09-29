'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ProductStockManagerProps {
  productId: string;
  currentStatus: 'in_stock' | 'out_of_stock' | 'sold_out';
  onStatusChange?: (newStatus: string) => void;
}

export function ProductStockSelector({ 
  productId, 
  currentStatus = 'in_stock',
  onStatusChange 
}: ProductStockManagerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpdate = async (newStatus: 'in_stock' | 'out_of_stock' | 'sold_out') => {
    try {
      setUpdating(true);
      setStatus(newStatus);

      const { error } = await supabase
        .from('products')
        .update({ stock_status: newStatus })
        .eq('id', productId);

      if (error) throw error;
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err: any) {
      console.error('Stock status update failed:', err.message);
      setStatus(currentStatus); // Revert on failure
      alert('Failed to update stock status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono">
      {/* In Stock */}
      <button
        type="button"
        disabled={updating}
        onClick={() => handleUpdate('in_stock')}
        className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
          status === 'in_stock'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <CheckCircle className="w-3 h-3" />
        <span>In Stock</span>
      </button>

      {/* Out of Stock */}
      <button
        type="button"
        disabled={updating}
        onClick={() => handleUpdate('out_of_stock')}
        className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
          status === 'out_of_stock'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <AlertCircle className="w-3 h-3" />
        <span>Out of Stock</span>
      </button>

      {/* Sold Out */}
      <button
        type="button"
        disabled={updating}
        onClick={() => handleUpdate('sold_out')}
        className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
          status === 'sold_out'
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <XCircle className="w-3 h-3" />
        <span>Sold Out</span>
      </button>
    </div>
  );
}