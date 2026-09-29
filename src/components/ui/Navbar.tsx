'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBagStore } from '../../app/lib/store/useBagStore';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  ChevronDown, 
  CheckCircle2, 
  LayoutDashboard, 
  Package, 
  CreditCard 
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { items } = useBagStore();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setMounted(true);

    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    }
    getUser();

    // Auth state changes listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowDropdown(false);
    router.refresh();
  };

  const totalItemsCount = mounted
    ? items.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const userInitial = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <header 
      suppressHydrationWarning 
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200/80"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-sans font-black text-2xl tracking-tight text-zinc-950">
            Gift<span className="text-[#f5a600]">HUB</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-amber-500">
            HOME
          </Link>
          <Link href="/products?category=gift_cards" className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black transition">
            GIFT CARDS
          </Link>
          <Link href="/products?category=luxury_watches" className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black transition">
            LUXURY WATCHES
          </Link>
          <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black transition">
            ALL PRODUCTS
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4" suppressHydrationWarning>
          
          {/* USER PROFILE ICON LOGIC (Hydration Safe) */}
          {!mounted ? (
            // SSR Placeholder taaki layout shift ya mismatch na ho
            <div suppressHydrationWarning className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 animate-pulse" />
          ) : user ? (
            /* AFTER LOGIN: Avatar with Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-white transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#f5a600] text-black font-bold font-sans text-xs flex items-center justify-center shadow-sm">
                  {userInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 mr-1" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200/90 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-zinc-100">
                    <p className="font-bold text-zinc-950 truncate">
                      {user.user_metadata?.full_name || 'Customer'}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Client</span>
                    </div>
                  </div>

                  <div className="py-1 border-b border-zinc-100 space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 rounded-xl transition font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/orders"
                      onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 rounded-xl transition font-medium"
                    >
                      <Package className="w-4 h-4 text-zinc-500" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/dashboard/payment-methods"
                      onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 rounded-xl transition font-medium"
                    >
                      <CreditCard className="w-4 h-4 text-zinc-500" />
                      <span>Payment Methods</span>
                    </Link>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* BEFORE LOGIN: Sign In link */
            <Link
              href="/login"
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-full border border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-white text-zinc-800 transition text-xs font-semibold"
              title="Sign In"
            >
              <User className="w-4 h-4 text-zinc-600" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* Shopping Bag Icon with Badge */}
          <Link
            href="/bag"
            className="relative p-2.5 rounded-full border border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-white text-zinc-800 transition flex items-center justify-center"
            title="View Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#f5a600] text-black font-mono font-bold text-[10px] flex items-center justify-center shadow-sm">
                {totalItemsCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}