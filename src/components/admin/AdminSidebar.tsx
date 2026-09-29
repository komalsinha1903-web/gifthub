'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Users, DollarSign, ListOrdered, ArrowLeft } from 'lucide-react';

const links = [
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Customer Orders', href: '/admin/orders', icon: ListOrdered },
  { name: 'Crypto Wallets & QRs', href: '/admin/payments', icon: DollarSign },
  { name: 'Customers', href: '/admin/customers', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col justify-between hidden md:flex min-h-screen bg-zinc-950">
      <div>
        <div className="font-black text-xl tracking-wider text-amber-500 mb-8">
          ADMIN VAULT
        </div>
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <Link
        href="/"
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>
    </aside>
  );
}