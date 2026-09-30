import { createServerSupabaseClient } from '../../lib/supabase/server';

export default async function AdminCustomersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: customers } = await supabase
    .from('profiles')
    .select('*, orders(id, total_amount)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Registered Customers</h1>
      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Total Orders</th>
              <th className="p-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {customers?.map((c: any) => (
              <tr key={c.id} className="hover:bg-zinc-900/40">
                <td className="p-4 font-bold text-white">{c.full_name || 'N/A'}</td>
                <td className="p-4 text-zinc-400">{c.email}</td>
                <td className="p-4">
                  <span className="text-xs uppercase bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                    {c.role}
                  </span>
                </td>
                <td className="p-4 font-mono">{c.orders?.length || 0}</td>
                <td className="p-4 text-zinc-500 text-xs">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}