import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('name, role, shop_id, shops(shop_name)')
    .eq('id', user.id)
    .single();

  // Route protection: Only allow Super Admin to access the admin panel
  if (!profile || profile.role !== 'Super Admin') {
    redirect('/dashboard/overview');
  }

  const shopName = 'SuvarnaLoan System';

  return (
    <div className="dashboard-layout">
      {/* Premium ambient background elements */}
      <div className="dashboard-bg">
        <div className="dashboard-bg-orb dashboard-bg-orb-1" />
        <div className="dashboard-bg-orb dashboard-bg-orb-2" />
        <div className="dashboard-grid" />
      </div>

      <Sidebar
        userRole={profile.role}
        userName={profile.name ?? user.email ?? 'Super Admin'}
        shopName={shopName}
      />

      <main className="dashboard-main">
        {children}
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
          },
        }}
      />
    </div>
  );
}
