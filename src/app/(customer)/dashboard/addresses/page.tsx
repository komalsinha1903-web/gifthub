'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Building,
  Phone,
  Home,
  Check
} from 'lucide-react';

interface Address {
  id: string;
  recipient_name: string;
  phone?: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [isDefault, setIsDefault] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
      } else if (data) {
        setAddresses(data);
      }
    }
    setLoading(false);
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // If setting as default, unset other defaults first
    if (isDefault) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert({
        user_id: user.id,
        recipient_name: recipientName.trim(),
        phone: phone.trim() || null,
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        postal_code: postalCode.trim(),
        country: country.trim(),
        is_default: addresses.length === 0 ? true : isDefault,
      })
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Delivery destination securely registered!');
      setShowAddForm(false);
      // Reset form
      setRecipientName('');
      setPhone('');
      setStreetAddress('');
      setCity('');
      setStateName('');
      setPostalCode('');
      setIsDefault(false);
      fetchAddresses();
      setTimeout(() => setSuccessMsg(null), 3500);
    }
    setSaving(false);
  };

  const handleSetDefault = async (addressId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Reset all addresses to is_default = false
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // 2. Set the selected address as default
    await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        is_default: addr.id === addressId,
      }))
    );
  };

  const handleDeleteAddress = async (addressId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this destination?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      alert(error.message);
    } else {
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    }
  };

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            Secure Logistics
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Delivery Addresses
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
            Manage certified physical destinations for luxury timepiece shipments.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 shrink-0"
        >
          {showAddForm ? 'Close Form' : (
            <>
              <Plus className="w-4 h-4" /> Add Destination
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Add Address Form Accordion */}
      {showAddForm && (
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-amber-500/30 backdrop-blur-xl shadow-2xl transition-all">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-zinc-800">
            <Home className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Register New Destination</h2>
          </div>

          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  Recipient Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord Alexander Sterling"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  Contact Phone (For Courier Dispatch)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                Street Address, Suite / Unit
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 740 Park Avenue, Penthouse B"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  required
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  State / Province
                </label>
                <input
                  type="text"
                  required
                  placeholder="NY"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="10021"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="defaultCheckbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="defaultCheckbox" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Set as primary delivery destination
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Destination...
                  </>
                ) : (
                  'Save Destination'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
          <p className="text-xs font-mono">Loading registered destinations...</p>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-6 rounded-2xl bg-zinc-900/40 border transition-all relative flex flex-col justify-between ${
                address.is_default
                  ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.08)] bg-zinc-900/60'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Destination
                    </span>
                  </div>

                  {address.is_default && (
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Primary
                    </span>
                  )}
                </div>

                {/* Details */}
                <h3 className="text-base font-bold text-white mb-1">
                  {address.recipient_name}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  {address.street_address}
                </p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {address.country}
                </p>

                {address.phone && (
                  <p className="text-xs text-zinc-400 flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/60">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="font-mono">{address.phone}</span>
                  </p>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-5 mt-5 border-t border-zinc-800/80 flex items-center justify-between">
                {!address.is_default ? (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs font-mono text-zinc-400 hover:text-amber-400 transition"
                  >
                    Set as Primary
                  </button>
                ) : (
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Default for Checkouts
                  </span>
                )}

                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-zinc-800/80 rounded-3xl bg-zinc-950/40">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-white mb-1">
            No Destinations Registered
          </h3>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-6">
            Register your physical delivery address to receive authenticated luxury timepieces.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition"
          >
            <Plus className="w-4 h-4" /> Add Destination
          </button>
        </div>
      )}

      {/* Security Advisory */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Addresses are encrypted and only decrypted upon multi-sig fulfillment confirmation.
        </span>
      </div>
    </div>
  );
}