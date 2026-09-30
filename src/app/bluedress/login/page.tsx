'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        // Successful login, direct to Admin Orders Dashboard
        router.push('//bluedress/orders');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-zinc-100 flex flex-col justify-center items-center px-4 sm:px-6 selection:bg-amber-500 selection:text-black font-sans">
      
      {/* Brand & Badge */}
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="inline-block group">
          <span className="font-serif font-black text-3xl tracking-tight text-white">
            VAULT<span className="text-[#f5a600]">.</span>
          </span>
        </Link>
        <span className="block text-[11px] font-mono uppercase tracking-[0.3em] text-amber-400 font-bold">
          ADMINISTRATOR ACCESS PORTAL
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
        
        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Admin Authentication
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in with authorized administrator credentials.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vault.com"
                className="w-full pl-10 pr-4 py-3 text-xs bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-sans transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
              Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-sans transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-extrabold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Enter Admin Vault'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

        </form>

        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 font-medium transition"
          >
            ← Return to Public Storefront
          </Link>
        </div>

      </div>

    </div>
  );
}