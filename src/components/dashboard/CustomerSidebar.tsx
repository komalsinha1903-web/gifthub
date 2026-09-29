'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, TicketPercent,
  User, MapPin, CreditCard, HelpCircle, LogOut, Sparkles
} from 'lucide-react';
import { createClient } from '../../app/lib/supabase/client';

export default function CustomerSidebar({ userEmail, role = 'customer' }: { userEmail: string; role?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navSections = [
    {
      group: 'Core Services',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'My Orders', icon: Package, href: '/dashboard/orders' },
        { name: 'Cart', icon: ShoppingBag, href: '/bag' },
        { name: 'Coupons & Offers', icon: TicketPercent, href: '/dashboard/coupons' },
      ],
    },
    {
      group: 'Account & Security',
      items: [
        { name: 'My Profile', icon: User, href: '/dashboard/profile' },
        { name: 'Addresses', icon: MapPin, href: '/dashboard/addresses' },
        { name: 'Payment Methods', icon: CreditCard, href: '/dashboard/payments' },
      ],
    },
    {
      group: 'Support',
      items: [
        { name: 'Help & Support', icon: HelpCircle, href: '/dashboard/support' },
      ],
    },
  ];

  return (
    <aside className="w-full md:w-72 bg-[#090b10] border-r border-zinc-800/80 p-5 flex flex-col justify-between shrink-0 min-h-[calc(100vh-5rem)]">
      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono text-amber-400 uppercase block">{role} Member</span>
              <p className="text-xs font-semibold text-white truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-6">
          {navSections.map((section) => (
            <div key={section.group}>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 px-3 mb-2 block">
                {section.group}
              </span>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  // Exact match for dashboard, partial match for sub-routes
                  const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="pt-6 border-t border-zinc-800/80">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}