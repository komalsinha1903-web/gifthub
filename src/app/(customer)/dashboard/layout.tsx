import { createServerSupabaseClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import CustomerSidebar from '@/components/dashboard/CustomerSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100 selection:bg-amber-500 selection:text-black">
      {/* Global Navbar */}
      <Navbar />

      <div className="flex flex-row min-h-[calc(100vh-5rem)]">
        {/* Pinned Single Sidebar for all dashboard routes */}
        <CustomerSidebar
          userEmail={profile?.email || user.email || 'Client'}
          role={profile?.role || 'customer'}
        />

        {/* Dynamic page content */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}