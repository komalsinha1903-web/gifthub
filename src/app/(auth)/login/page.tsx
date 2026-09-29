'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirectUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06070a] px-4 relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Golden Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-zinc-950/80 border border-amber-500/25 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        
        {/* Header Badge & Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            Vault Authentication
          </span>
          <h1 className="text-3xl font-serif font-bold text-white mt-1">
            Welcome Back
          </h1>
          <p className="text-zinc-400 text-xs mt-2 font-light">
            Access your private vault, allocations, and order history
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="client@Gifthub.com"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
              Passphrase
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-widest transition duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Enter <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-xs mt-8">
          Unregistered client?{' '}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}