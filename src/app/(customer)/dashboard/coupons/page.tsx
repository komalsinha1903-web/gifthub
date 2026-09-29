'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { useBagStore, Coupon } from '../../../lib/store/useBagStore';
import { useRouter } from 'next/navigation';
import { 
  TicketPercent, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Clock,
  ShieldCheck 
} from 'lucide-react';

interface DbCoupon {
  id: string;
  code: string;
  description: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<DbCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const { appliedCoupon, applyCoupon, removeCoupon } = useBagStore();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchCoupons() {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
      } else if (data) {
        setCoupons(data);
      }
      setLoading(false);
    }

    fetchCoupons();
  }, [supabase]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyCoupon = (coupon: DbCoupon) => {
    applyCoupon({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_percentage: Number(coupon.discount_percentage),
    });
    router.push('/bag');
  };

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
          Client Privileges
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Coupons &amp; Exclusive Offers
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
          Active vouchers can be applied directly to reduce your on-chain settlement total.
        </p>
      </div>

      {/* Active Coupon Banner if already applied */}
      {appliedCoupon && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs text-white font-semibold">
                Coupon <span className="font-mono text-amber-400 uppercase font-bold">{appliedCoupon.code}</span> is currently active!
              </p>
              <p className="text-[11px] text-zinc-400">
                You receive a {appliedCoupon.discount_percentage}% discount on checkout.
              </p>
            </div>
          </div>
          <button
            onClick={() => removeCoupon()}
            className="text-xs font-mono text-zinc-400 hover:text-red-400 transition underline underline-offset-4"
          >
            Remove Voucher
          </button>
        </div>
      )}

      {/* Dynamic Coupons Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
          <p className="text-xs font-mono">Fetching active database vouchers...</p>
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon) => {
            const isApplied = appliedCoupon?.code === coupon.code;

            return (
              <div
                key={coupon.id}
                className={`p-6 rounded-2xl bg-zinc-900/40 border transition-all duration-300 relative flex flex-col justify-between ${
                  isApplied
                    ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.15)] bg-zinc-900/70'
                    : 'border-zinc-800/80 hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      {coupon.discount_percentage}% OFF
                    </span>

                    {isApplied && (
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Applied
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-mono font-extrabold tracking-wide text-white mb-2">
                    {coupon.code}
                  </h3>
                  <p className="text-xs text-zinc-300 font-light leading-relaxed mb-4">
                    {coupon.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  {/* Apply & Go to Cart */}
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(coupon)}
                    disabled={isApplied}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isApplied
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    <span>{isApplied ? 'In Cart' : 'Apply to Bag'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 border border-zinc-800/80 rounded-3xl bg-zinc-950/40">
          <TicketPercent className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Active Offers</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Check back soon or join our VIP desk for custom allocation privileges.
          </p>
        </div>
      )}

      {/* Advisory */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Vouchers apply across gift card denominations and haute horlogerie orders.</span>
      </div>
    </div>
  );
}