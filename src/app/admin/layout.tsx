'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Gift, 
  ShoppingBag, 
  Package, 
  QrCode, 
  LogOut, 
  ExternalLink,
  ShieldCheck, LayoutDashboard
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 👉 Agar /admin/login page par ho toh Sidebar aur Header render mat karo
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-[#070a12] text-zinc-100 flex items-center justify-center font-sans selection:bg-amber-500 selection:text-black">
        {children}
      </div>
    );
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Customer Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Products Management',
      href: '/admin/products',
      icon: Package,
    },
    {
      label: 'Crypto Wallets & QR',
      href: '/admin/wallets',
      icon: QrCode,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070a12] text-zinc-100 flex font-sans selection:bg-amber-500 selection:text-black">
      
      {/* 1. FIXED LEFT SIDEBAR */}
      <aside className="w-64 border-r border-zinc-800/80 bg-[#0a0f1d] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40">
        
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f5a600] flex items-center justify-center text-black shadow-md">
                <Gift className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-sans font-black text-lg tracking-tight text-white block leading-none">
                  GiftHub
                </span>
                <span className="text-[10px] text-amber-400 font-mono block mt-1 tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="px-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 font-bold px-3 block mb-2">
              Management
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Live</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/30 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* 2. MAIN WORKSPACE WITH LEFT MARGIN */}
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <header className="h-16 border-b border-zinc-800/80 bg-[#0a0f1d]/70 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Authorized Ledger Session
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-zinc-300">Escrow Network Connected</span>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>

    </div>
  );
}