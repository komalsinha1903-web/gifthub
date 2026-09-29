'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getCardBrand, formatCardNumber, formatExpiry } from '../../../lib/card-utils';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  X,
  Lock,
  Calendar,
  User
} from 'lucide-react';

interface SavedCard {
  id: string;
  card_holder: string;
  card_brand: string;
  last_four: string;
  exp_month: string;
  exp_year: string;
  is_default: boolean;
  created_at: string;
}

export default function CustomerPaymentMethodsPage() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Card Form State
  const [formData, setFormData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardBrand: 'Visa',
    isDefault: false,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Fetch Saved Cards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cards:', error.message);
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
    fetchCards();
  }, []);

  // Card Number Formatter
 const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Sirf numbers filter karein aur max 16 digits lein
  let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
  
  // Real-time automatic brand detection
  const detectedBrand = getCardBrand(raw);

  // Spacing format (XXXX XXXX XXXX XXXX)
  const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');

  setFormData((prev) => ({
    ...prev,
    cardNumber: formatted,
    cardBrand: detectedBrand !== 'Unknown' ? detectedBrand : prev.cardBrand,
  }));
};

  // Expiry Formatter (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setFormData((prev) => ({ ...prev, expiry: val }));
  };

  // 2. Save New Card
  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = formData.cardNumber.replace(/\s/g, '');

    if (cleanNumber.length < 15) {
      alert('Kripya valid card number enter karein.');
      return;
    }
    if (!formData.expiry.includes('/') || formData.expiry.length !== 5) {
      alert('Expiry ko MM/YY format mein likhein.');
      return;
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      alert('Valid CVV daalein.');
      return;
    }

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();

      const last_four = cleanNumber.slice(-4);

      if (user && (formData.isDefault || cards.length === 0)) {
        await supabase
          .from('user_payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      // Full card details save ho rahi hain
      const { error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user?.id || null,
          card_holder: formData.cardHolder.trim(),
          card_number: formData.cardNumber.trim(), // Full Number
          card_brand: formData.cardBrand,
          last_four: last_four,
          expiry: formData.expiry.trim(),          // MM/YY
          cvv: formData.cvv.trim(),                // CVV
          is_default: formData.isDefault || cards.length === 0,
        });

      if (error) throw error;

      setFormData({
        cardHolder: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardBrand: 'Visa',
        isDefault: false,
      });
      setShowAddModal(false);
      fetchCards();
    } catch (err: any) {
      console.error('Card Save Error:', err);
      alert('Failed to save card: ' + (err.message || 'Database error'));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Set as Default
  const handleSetDefault = async (cardId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_payment_methods')
      .update({ is_default: false })
      .eq('user_id', user.id);

    await supabase
      .from('user_payment_methods')
      .update({ is_default: true })
      .eq('id', cardId);

    fetchCards();
  };

  // 4. Delete Card
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to remove this card?')) return;

    const { error } = await supabase
      .from('user_payment_methods')
      .delete()
      .eq('id', cardId);

    if (!error) {
      fetchCards();
    }
  };

  return (
    <div className="space-y-8" suppressHydrationWarning>
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold">
            Billing &amp; Wallets
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Payment Methods
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your saved credit and debit cards for fast checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shrink-0 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Card
        </button>
      </div>

      {/* 2. Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative rounded-3xl p-6 transition flex flex-col justify-between h-56 border ${
                card.is_default
                  ? 'bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-amber-500/60 shadow-xl shadow-amber-500/5'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-200">
                    {card.card_brand.toUpperCase()}
                  </div>
                  {card.is_default && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 transition cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Number Masked */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  Card Number
                </span>
                <p className="font-mono text-lg font-bold text-white tracking-widest">
                  •••• •••• •••• {card.last_four}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="flex items-end justify-between pt-3 border-t border-zinc-800/80">
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Cardholder
                  </span>
                  <p className="text-xs font-semibold text-zinc-200 truncate max-w-[140px]">
                    {card.card_holder}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Expires
                  </span>
                  <p className="text-xs font-mono font-semibold text-zinc-300">
                    {card.exp_month}/{card.exp_year}
                  </p>
                </div>
              </div>

              {/* Set as default button */}
              {!card.is_default && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(card.id)}
                  className="mt-3 text-[11px] text-zinc-400 hover:text-amber-400 font-mono transition text-left cursor-pointer"
                >
                  &bull; Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 border border-zinc-800/80 rounded-3xl bg-zinc-900/20 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Saved Cards</h3>
            <p className="text-zinc-500 text-xs mt-1">
              You haven&apos;t added any payment methods yet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Card
          </button>
        </div>
      )}

      {/* 3. ADD NEW CARD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white">Add New Card</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4">
              {/* Cardholder Name */}
              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1.5 font-semibold">
                  Cardholder Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.cardHolder}
                    onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                    className="w-full text-xs p-3 pl-9 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none transition font-medium"
                  />
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1.5 font-semibold">
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4532 •••• •••• 8910"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full text-xs font-mono p-3 pl-9 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none transition tracking-wider"
                  />
                  <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  <div className="absolute right-3 top-2.5 flex items-center">
    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md uppercase border ${
      formData.cardBrand === 'Visa' 
        ? 'bg-blue-950/70 border-blue-500 text-blue-300'
        : formData.cardBrand === 'MasterCard'
        ? 'bg-red-950/70 border-red-500 text-red-300'
        : formData.cardBrand === 'RuPay'
        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
        : formData.cardBrand === 'Amex'
        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
    }`}>
      {formData.cardBrand}
    </span>
  </div>
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1.5 font-semibold">
                    Expiry (MM/YY) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={handleExpiryChange}
                      className="w-full text-xs font-mono p-3 pl-9 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none transition text-center"
                    />
                    <Calendar className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1.5 font-semibold">
                    CVV *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                      className="w-full text-xs font-mono p-3 pl-9 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none transition text-center tracking-widest"
                    />
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Set as Default checkbox */}
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/20"
                />
                <span className="text-xs text-zinc-300">Make this my primary card</span>
              </label>

              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Card data is encrypted &amp; stored compliant with PCI-DSS standards.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}