'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  X, 
  Image as ImageIcon, 
  QrCode, 
  AlertCircle 
} from 'lucide-react';

interface Wallet {
  id: string;
  coin: string;
  network: string;
  wallet_address: string;
  qr_code_url?: string;
  is_active?: boolean;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [coin, setCoin] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [walletAddress, setWalletAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchWallets = async () => {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .order('coin');

    if (!error && data) {
      setWallets(data);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setCoin('USDT');
    setNetwork('TRC20');
    setWalletAddress('');
    setQrCodeUrl('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setCoin(w.coin);
    setNetwork(w.network);
    setWalletAddress(w.wallet_address);
    setQrCodeUrl(w.qr_code_url || '');
    setErrorMsg('');
    setShowModal(true);
  };

  // Image File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `qr-codes/${fileName}`;

      // Upload to Supabase Storage bucket 'wallets'
      const { error: uploadError } = await supabase.storage
        .from('wallets')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback: Agar bucket nahi bani ho toh local data URL use kar sakte hain
        const reader = new FileReader();
        reader.onloadend = () => {
          setQrCodeUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('wallets')
          .getPublicUrl(filePath);

        setQrCodeUrl(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading QR image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) {
      setErrorMsg('Wallet Address is required');
      return;
    }

    const payload = {
      coin: coin.toUpperCase().trim(),
      network: network.trim(),
      wallet_address: walletAddress.trim(),
      qr_code_url: qrCodeUrl.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editingWallet) {
      const { error } = await supabase
        .from('crypto_wallets')
        .update(payload)
        .eq('id', editingWallet.id);

      if (error) {
        setErrorMsg(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('crypto_wallets')
        .insert(payload);

      if (error) {
        setErrorMsg(error.message);
        return;
      }
    }

    setShowModal(false);
    fetchWallets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) return;
    await supabase.from('crypto_wallets').delete().eq('id', id);
    fetchWallets();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Crypto Wallets &amp; QR Codes
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure receiving addresses and QR codes used on the customer checkout page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Wallet</span>
        </button>
      </div>

      {/* Wallets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono text-xs flex items-center justify-center">
                  {w.coin === 'BTC' ? '₿' : w.coin === 'ETH' ? 'Ξ' : '₮'}
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">{w.coin}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">{w.network}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                Active
              </span>
            </div>

            {/* Display QR: Custom Uploaded Image ya Auto-SVG */}
            <div className="bg-white p-3 rounded-xl flex items-center justify-center w-40 h-40 mx-auto shadow-inner overflow-hidden">
              {w.qr_code_url ? (
                <img
                  src={w.qr_code_url}
                  alt={`${w.coin} QR`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <QRCodeSVG
                  value={`${w.coin.toLowerCase()}:${w.wallet_address}`}
                  size={135}
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-zinc-500">
                Deposit Address
              </label>
              <p className="font-mono text-xs text-zinc-200 bg-black/60 p-2.5 rounded-lg border border-zinc-800 truncate select-all">
                {w.wallet_address}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => handleOpenEdit(w)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(w.id)}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-xs text-red-400 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT WALLET WITH QR UPLOAD & PREVIEW */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141d] border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl text-xs font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="font-bold text-white text-base">
                {editingWallet ? 'Edit Wallet' : 'Add Wallet'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Coin Input */}
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-medium">
                  Coin (e.g. BTC, ETH, USDT)
                </label>
                <input
                  required
                  type="text"
                  value={coin}
                  onChange={(e) => setCoin(e.target.value.toUpperCase())}
                  placeholder="USDT"
                  className="w-full p-3 bg-black/60 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Network Input */}
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-medium">
                  Network (e.g. TRC20, ERC20, Native)
                </label>
                <input
                  required
                  type="text"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  placeholder="TRC20"
                  className="w-full p-3 bg-black/60 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Wallet Address Input */}
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-medium">
                  Wallet Address *
                </label>
                <input
                  required
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter crypto address..."
                  className="w-full p-3 bg-black/60 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* QR CODE UPLOAD & PREVIEW SECTION */}
              <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider text-[11px] font-mono">
                  QR Code Image &amp; Live Preview
                </label>

                <div className="flex items-center gap-4 bg-black/40 border border-zinc-800/80 p-3.5 rounded-2xl">
                  
                  {/* Square Box for Live Preview */}
                  <div className="w-24 h-24 rounded-xl bg-white p-2 shrink-0 flex items-center justify-center overflow-hidden border border-zinc-300 shadow-sm">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Uploaded QR Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : walletAddress ? (
                      <QRCodeSVG
                        value={`${coin.toLowerCase()}:${walletAddress}`}
                        size={80}
                      />
                    ) : (
                      <div className="text-center text-zinc-400 flex flex-col items-center">
                        <QrCode className="w-6 h-6 text-zinc-400" />
                        <span className="text-[9px] text-zinc-500 mt-1 font-mono leading-none">No QR</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl font-mono text-[11px] flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{uploading ? 'Uploading...' : 'Upload QR Image'}</span>
                    </button>

                    {qrCodeUrl ? (
                      <button
                        type="button"
                        onClick={() => setQrCodeUrl('')}
                        className="w-full text-center text-[10px] text-red-400 hover:underline font-mono"
                      >
                        Reset to Auto-generated QR
                      </button>
                    ) : (
                      <p className="text-[10px] text-zinc-500 font-mono leading-tight">
                        PNG/JPG QR image upload karein ya direct address se auto generate hoga.
                      </p>
                    )}
                  </div>

                </div>

                {/* Optional direct URL field */}
                <input
                  type="url"
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                  placeholder="Or paste QR Image direct URL (https://...)"
                  className="w-full p-2.5 bg-black/60 border border-zinc-800 rounded-xl text-white font-mono text-[11px] placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#f5a600] hover:bg-[#d99200] text-black font-extrabold rounded-xl transition shadow-md cursor-pointer"
                >
                  Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}