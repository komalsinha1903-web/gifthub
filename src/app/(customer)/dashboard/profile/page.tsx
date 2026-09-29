'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ShoppingBag,
  Coins
} from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userAuth, setUserAuth] = useState<any>(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalSettled: 0 });

  // Form states
  const [fullName, setFullName] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserAuth(user);

        // Fetch profile table row
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
        }

        // Fetch user orders summary for account stats
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, status')
          .eq('user_id', user.id);

        if (orders) {
          const totalOrders = orders.length;
          const totalSettled = orders
            .filter((o) => o.status === 'completed')
            .reduce((sum, curr) => sum + Number(curr.total_amount || 0), 0);
          setStats({ totalOrders, totalSettled });
        }
      }
      setLoading(false);
    }

    loadUserData();
  }, [supabase]);

  // Handle Full Name / Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAuth) return;

    setUpdatingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', userAuth.id);

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSuccess(true);
      setProfile((prev: any) => ({ ...prev, full_name: fullName.trim() }));
      setTimeout(() => setProfileSuccess(false), 3000);
    }
    setUpdatingProfile(false);
  };

  // Handle Security Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setUpdatingPassword(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm">Loading private vault credentials...</p>
      </div>
    );
  }

  const joinDate = userAuth?.created_at ? userAuth.created_at.split('T')[0] : 'N/A';

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
          Account Credential Ledger
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          My Profile &amp; Security
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
          Manage your verified credentials, security passphrase, and on-chain tier status.
        </p>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-wider">Membership Rank</span>
          </div>
          <div className="text-lg font-bold text-white uppercase tracking-wider">
            {profile?.role || 'Customer'} Tier
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono uppercase tracking-wider">Acquisitions</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.totalOrders} Orders
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider">Total Value Settled</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${stats.totalSettled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Profile Form & Security Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. General Profile Info */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Personal Information</h2>
              <p className="text-xs text-zinc-400">Update your account name on verified invoices</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Profile information updated successfully!
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-white text-sm focus:outline-none focus:border-amber-400 transition"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                Registered Email (Primary Identity)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={userAuth?.email || ''}
                  className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-xl px-4 py-3 pl-11 text-zinc-500 text-sm cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Primary email addresses cannot be modified directly for on-chain security audit.
              </span>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                Registration Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={joinDate}
                  className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-xl px-4 py-3 pl-11 text-zinc-500 text-sm font-mono cursor-not-allowed"
                />
                <Calendar className="w-4 h-4 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </form>
        </div>

        {/* 2. Security Passphrase Update */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Security &amp; Passphrase</h2>
              <p className="text-xs text-zinc-400">Keep your vault account safe with strong encryption</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Passphrase updated successfully!
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {passwordError}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                New Passphrase
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-white text-sm focus:outline-none focus:border-amber-400 transition"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Security Recommendations</span>
              </div>
              <ul className="text-[11px] text-zinc-500 space-y-1 list-disc list-inside">
                <li>Use a combination of uppercase letters, numbers, and symbols.</li>
                <li>Never share your credentials with anyone.</li>
                <li>Sessions automatically expire if suspicious activity is detected.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={updatingPassword || !newPassword}
              className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating Passphrase...
                </>
              ) : (
                'Update Passphrase'
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}