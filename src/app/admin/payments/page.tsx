'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { CryptoPaymentMethod } from '../../lib/types';

export default function AdminPaymentsPage() {
  const [methods, setMethods] = useState<CryptoPaymentMethod[]>([]);
  const [cryptoName, setCryptoName] = useState('');
  const [network, setNetwork] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [qrFile, setQrFile] = useState<File | null >(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchMethods();
  }, []);

  async function fetchMethods() {
    const { data } = await supabase.from('crypto_payment_methods').select('*').order('created_at');
    if (data) setMethods(data);
  }

  const handleUploadMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrFile) return;
    setLoading(true);

    const ext = qrFile.name.split('.').pop();
    const filePath = `qr-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('payment_qrs').upload(filePath, qrFile);
    if (uploadError) {
      alert(uploadError.message);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('payment_qrs').getPublicUrl(filePath);

    await supabase.from('crypto_payment_methods').insert({
      crypto_name: cryptoName,
      network,
      wallet_address: walletAddress,
      qr_code_url: publicUrl,
    });

    setCryptoName('');
    setNetwork('');
    setWalletAddress('');
    setQrFile(null);
    setLoading(false);
    fetchMethods();
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Crypto Payment Gateway Settings</h1>

      {/* Add New Method */}
      <form onSubmit={handleUploadMethod} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-12 space-y-4">
        <h2 className="text-lg font-bold text-amber-500">Register Wallet & QR</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Coin Name (e.g. USDT, Bitcoin)"
            className="bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
            value={cryptoName}
            onChange={(e) => setCryptoName(e.target.value)}
          />
          <input
            required
            placeholder="Network (e.g. TRC20, ERC20)"
            className="bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
          />
        </div>
        <input
          required
          placeholder="Public Wallet Address"
          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <div>
          <label className="text-xs text-zinc-400 block mb-1">QR Code Image</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setQrFile(e.target.files?.[0] || null)}
            className="text-zinc-400 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 text-black px-4 py-2 font-bold rounded"
        >
          {loading ? 'Uploading...' : 'Save Crypto Endpoint'}
        </button>
      </form>

      {/* Existing Configs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m) => (
          <div key={m.id} className="border border-zinc-800 bg-zinc-900 p-4 rounded-xl flex gap-4">
            <img src={m.qr_code_url} alt="" className="w-24 h-24 object-contain rounded bg-zinc-950 p-1" />
            <div>
              <h3 className="font-bold text-white">{m.crypto_name}</h3>
              <p className="text-xs text-amber-500">{m.network}</p>
              <p className="text-xs font-mono text-zinc-400 break-all mt-1">{m.wallet_address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}