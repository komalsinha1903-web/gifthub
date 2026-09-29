'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBagStore } from '../../lib/store/useBagStore';
import { createBrowserClient } from '@supabase/ssr';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Lock, 
  Trash2, 
  ShieldCheck, 
  Headphones, 
  Clock, 
  Copy, 
  Check, 
  Gift, 
  Truck,
  ArrowRight,
  User,
  MapPin,
  Pencil
} from 'lucide-react';

interface CryptoWallet {
  id: string;
  coin?: string;
  symbol?: string;
  network?: string;
  wallet_address?: string;
  address?: string;
  qr_code_url?: string;
  qr_image?: string;
  qr_code?: string;
  image_url?: string;
  is_active?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, clearBag } = useBagStore();
  
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [timeLeft, setTimeLeft] = useState(888);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Wallets state
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  // Success Modal states
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<{ id: string; amount: string; coin: string } | null>(null);
  const [countdown, setCountdown] = useState(4);

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'New York',
    zipCode: '',
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Auth Gate & Dynamic Wallets Fetching
  useEffect(() => {
    setMounted(true);

    async function initCheckout() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/login?redirect=/checkout');
        return;
      }
      setUser(session.user);
      setFormData((prev) => ({
        ...prev,
        email: session.user.email || '',
        fullName: session.user.user_metadata?.full_name || '',
      }));

      const { data: dbWallets, error: walletError } = await supabase
        .from('crypto_wallets')
        .select('*');

      if (walletError) {
        console.error('Wallet fetch error:', walletError.message);
      }

      if (dbWallets && dbWallets.length > 0) {
        setWallets(dbWallets);
        setSelectedWalletId(dbWallets[0].id);
      }

      setLoading(false);
    }

    initCheckout();
  }, [router, supabase]);

  // 2. Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0 || currentStep !== 2) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentStep]);

  // 3. Modal Redirect Countdown (Stuck 0s Fix)
  useEffect(() => {
    if (!orderSuccessModal) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Hard navigation backup taaki router freeze na ho
          window.location.href = '/dashboard/orders';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [orderSuccessModal]);

  const handleReturnHome = () => {
    window.location.href = '/dashboard/orders';
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0.00;
  const tax = 0.00;
  const total = subtotal + shipping + tax;

  // Selected Active Wallet Details
  const activeWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0] || null;
  const activeCoin = (activeWallet?.coin || activeWallet?.symbol || 'USDT').toUpperCase();
  const activeNetwork = activeWallet?.network || 'TRC20';

  const currentAddress = activeWallet 
    ? (activeWallet.wallet_address || activeWallet.address || '')
    : '';

  const currentQrImage = activeWallet
    ? (activeWallet.qr_code_url || activeWallet.qr_image || activeWallet.qr_code || activeWallet.image_url || '')
    : '';

  const cryptoRates: Record<string, number> = { BTC: 96500, ETH: 3250, USDT: 1, SOL: 195 };
  const rate = cryptoRates[activeCoin] || 1;
  const cryptoAmount = (total / rate).toFixed(activeCoin === 'USDT' ? 2 : 4);

  const handleCopy = () => {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.addressLine1 || !formData.city || !formData.zipCode) {
      alert('Please fill in all required fields.');
      return;
    }
    setCurrentStep(2);
  };

  // Supabase Order Placement Handler
  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }

    if (!activeWallet || !currentAddress.trim()) {
      alert('Payment wallet address is missing. Please check your admin configuration.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending_crypto_payment',
          payment_method: `${activeCoin} (${activeNetwork})`,
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          billing_address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            zip: formData.zipCode,
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (order) {
        const orderItemsPayload = items.map((item: any) => {
          let cleanProductId = item.productId || item.id;
          if (typeof cleanProductId === 'string' && cleanProductId.length > 36) {
            cleanProductId = cleanProductId.slice(0, 36);
          }

          return {
            order_id: order.id,
            product_id: cleanProductId,
            quantity: item.quantity,
            unit_price: item.price,
          };
        });

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsPayload);

        if (itemsError) throw itemsError;

        setPlacedOrderDetails({
          id: order.id.slice(0, 8).toUpperCase(),
          amount: cryptoAmount,
          coin: activeCoin,
        });

        clearBag();
        setOrderSuccessModal(true);
      }
    } catch (err: any) {
      console.error('Order placement error:', err);
      alert('Failed to place order: ' + (err.message || 'Database error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-zinc-900 font-sans selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      
      {/* 1. TOP HEADER */}
      <header className="bg-[#0b101b] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5a600] flex items-center justify-center text-black shadow-md">
              <Gift className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-sans font-black text-xl tracking-tight text-white block leading-none">
                GiftHub
              </span>
              <span className="text-[10px] text-zinc-400 font-sans block mt-0.5 tracking-wider">
                Gift More. Live More.
              </span>
            </div>
          </Link>

          {/* Stepper with Circles */}
          <div className="hidden md:flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2 text-white font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 1 ? 'bg-[#f5a600] text-black' : 'bg-[#10b981] text-white'
              }`}>
                {currentStep === 2 ? '✓' : '1'}
              </span>
              <span>Shipping Information</span>
            </div>
            <div className="w-10 h-[1px] bg-zinc-700" />
            <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-white font-bold' : 'text-zinc-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 2 ? 'bg-[#f5a600] text-black' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
              }`}>
                2
              </span>
              <span>Payment Method</span>
            </div>
            <div className="w-10 h-[1px] bg-zinc-700" />
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Review &amp; Confirm</span>
            </div>
            <div className="w-10 h-[1px] bg-zinc-700" />
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Complete</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Lock className="w-4 h-4 text-[#f5a600]" />
            <span className="font-semibold text-xs">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 w-full">
        
        <div className="mb-6">
          <h1 className="text-3xl font-sans font-bold text-zinc-950 tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete your details to receive your gift card(s) or luxury items instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form or Crypto Payment */}
          <div className="lg:col-span-7 space-y-6">

            {currentStep === 1 ? (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* 1. Contact Information */}
                <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                    <User className="w-4 h-4 text-zinc-700" />
                    <h2 className="font-bold text-sm text-zinc-950">1. Contact Information</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 234 567 8900"
                          className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Billing Address */}
                <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                    <MapPin className="w-4 h-4 text-zinc-700" />
                    <h2 className="font-bold text-sm text-zinc-950">2. Billing Address</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.addressLine1}
                          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                          placeholder="123 Main St"
                          className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.addressLine2}
                          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          placeholder="Apartment, suite, etc."
                          className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 block mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="New York"
                          className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 block mb-1">State *</label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition font-medium"
                        >
                          <option value="New York">New York</option>
                          <option value="California">California</option>
                          <option value="Texas">Texas</option>
                          <option value="Florida">Florida</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 block mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          required
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          placeholder="10001"
                          className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-[#f5a600] hover:bg-[#d99200] text-black font-extrabold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Payment Method &rarr;</span>
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                
                {/* Form summary pill */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between">
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-zinc-950">{formData.fullName} &bull; {formData.email}</p>
                    <p className="text-zinc-500">{formData.addressLine1}, {formData.city}, {formData.state} {formData.zipCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1 text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Cryptocurrency Box */}
                <div className="bg-white border-2 border-[#f5a600] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#f5a600] flex items-center justify-center bg-white">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#f5a600]" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#f5a600] text-black flex items-center justify-center font-bold font-mono text-xs">
                        &curren;
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-zinc-950">Cryptocurrency Payment</h3>
                        <p className="text-xs text-zinc-400">
                          {activeWallet ? `Pay via ${activeCoin} (${activeNetwork})` : 'Select your cryptocurrency'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500 font-mono px-2.5 py-1 border border-zinc-200 rounded-full bg-zinc-50">
                        {wallets.length} active wallet{wallets.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Tabs */}
                  {wallets.length === 0 ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      No crypto wallet addresses configured in Admin panel yet. Please add one in Admin &gt; Crypto Wallets.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {wallets.map((wallet) => {
                        const isSelected = wallet.id === selectedWalletId;
                        const coinLabel = wallet.coin || wallet.symbol || 'USDT';
                        return (
                          <button
                            key={wallet.id}
                            type="button"
                            onClick={() => setSelectedWalletId(wallet.id)}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                                : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-white hover:border-zinc-300'
                            }`}
                          >
                            <span>{coinLabel}</span>
                            {wallet.network && (
                              <span className={`text-[10px] font-normal ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                ({wallet.network})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Dynamic QR Code & Address Display */}
                  {activeWallet && (
                    <div className="border border-zinc-200/90 rounded-2xl p-6 bg-[#fcfcfd]">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        
                        {/* QR Code */}
                        <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                          <div className="p-2 bg-white rounded-lg flex items-center justify-center relative">
                            {currentQrImage ? (
                              <img 
                                src={currentQrImage} 
                                alt={`${activeCoin} QR Code`} 
                                className="w-[400px] h-[200px] object-contain rounded-md"
                              />
                            ) : (
                              <QRCodeSVG
                                value={currentAddress ? `${activeCoin.toLowerCase()}:${currentAddress}?amount=${cryptoAmount}` : ''}
                                size={135}
                                level="H"
                                includeMargin={false}
                              />
                            )}
                          </div>
                        </div>

                        {/* Amount & Time */}
                        <div className="sm:col-span-7 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">
                              Send exactly
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-mono font-extrabold text-zinc-950">
                                {cryptoAmount} {activeCoin}
                              </span>
                              <span className="text-xs text-zinc-400 font-mono">
                                (= ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD)
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md mt-1.5 inline-flex">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Time remaining: <strong>{formatTimer(timeLeft)}</strong></span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-zinc-200/80 space-y-1.5 text-xs text-zinc-600">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                              <span>Fast on-chain confirmation ({activeNetwork})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                              <span>Secure cryptographic escrow</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address Field */}
                      <div className="mt-6 pt-4 border-t border-zinc-200/80 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-semibold uppercase text-zinc-500 block">
                            Send to this {activeCoin} address ({activeNetwork}):
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={currentAddress}
                            placeholder="Wallet address loading..."
                            className="w-full bg-white border border-zinc-200 text-zinc-900 text-xs font-mono font-medium rounded-xl px-3 py-2.5 select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="p-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl transition shrink-0 cursor-pointer"
                            title="Copy Address"
                          >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting || !activeWallet || !currentAddress}
                    onClick={handleConfirmOrder}
                    className="w-full py-4 px-6 rounded-full bg-[#0a0f1d] hover:bg-black text-white font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-zinc-400" />
                    <span>{isSubmitting ? 'Placing Order...' : 'Confirm Crypto Payment & Place Order →'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: ORDER SUMMARY */}
          <div className="lg:col-span-5 space-y-6 sticky top-28">
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
              
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h2 className="font-sans font-bold text-lg text-zinc-950">Order Summary</h2>
                <span className="text-xs font-semibold text-sky-600">{items.length} Items &gt;</span>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-950 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-zinc-400">
                          {item.card_value ? `$${item.card_value} Card Value` : `$${item.price} Value`}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">Qty: {item.quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-zinc-950">
                        ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-300 hover:text-red-500 transition p-1 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-zinc-950">
                    ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-emerald-600 font-bold uppercase text-[11px]">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (if applicable)</span>
                  <span className="font-mono font-semibold text-zinc-950">$0.00</span>
                </div>
              </div>

              {/* Total Due */}
              <div className="pt-4 border-t border-zinc-200 flex items-baseline justify-between">
                <span className="text-base font-bold text-zinc-950">Total</span>
                <span className="text-3xl font-mono font-black text-zinc-950">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Security & Guarantees */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 text-xs">
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">Your information is secure</p>
                    <p className="text-[11px] text-emerald-700">We use industry-standard encryption to protect your data.</p>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-zinc-900" />
                    <div>
                      <p className="font-bold text-xs">Need Help?</p>
                      <p className="text-[11px] text-zinc-400">Our support team is available 24/7</p>
                    </div>
                  </div>
                  <Link href="/contact" className="text-xs text-sky-600 hover:underline font-semibold">
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 text-center text-[10px] text-zinc-500">
                <div>
                  <p className="font-bold text-zinc-800">100% Authentic</p>
                  <p>Gift Cards &amp; Watches</p>
                </div>
                <div>
                  <p className="font-bold text-zinc-800">Instant Delivery</p>
                  <p>Via Email</p>
                </div>
                <div>
                  <p className="font-bold text-zinc-800">Free Shipping</p>
                  <p>On Orders Over $50</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* 3. ORDER SUCCESSFUL POPUP MODAL */}
      {orderSuccessModal && placedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-600 font-bold block">
                Payment Authorized
              </span>
              <h2 className="text-2xl font-sans font-extrabold text-zinc-950 tracking-tight">
                Order Placed Successfully!
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Transaction registered for{' '}
                <strong className="text-zinc-900 font-mono">
                  {placedOrderDetails.amount} {placedOrderDetails.coin}
                </strong>
                . Cryptographic escrow is now securely holding the allocation.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Order Reference</span>
              <span className="font-bold text-zinc-900">#{placedOrderDetails.id}</span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleReturnHome}
                className="w-full py-3.5 px-6 rounded-xl bg-[#f5a600] hover:bg-[#d99200] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Orders</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-zinc-400 font-mono">
                Redirecting automatically in {countdown}s...
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 4. FOOTER */}
      <footer className="bg-[#0b101b] text-white border-t border-zinc-800 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f5a600] flex items-center justify-center text-black">
              <Gift className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">GiftHub</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span><strong>Secure Payments</strong> — Your data is protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-white" />
              <span><strong>Fast &amp; Reliable Delivery</strong> — Get your gift instantly</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-white" />
              <span><strong>24/7 Support</strong> — We&apos;re here to help</span>
            </div>
          </div>

          <div className="font-serif italic text-amber-400 text-sm">
            The Perfect Gift Awaits &hearts;
          </div>

        </div>
      </footer>

    </div>
  );
}