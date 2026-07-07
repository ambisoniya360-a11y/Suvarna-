import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function DashboardLayout({
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

  // Fetch user profile and shop subscription details
  const { data: profile } = await supabase
    .from('users')
    .select('name, role, shop_id, shops(*)')
    .eq('id', user.id)
    .single();

  const shop = profile?.shops && !Array.isArray(profile.shops) ? profile.shops : null;
  const shopName = shop?.shop_name || 'SuvarnaLoan';

  // Get current pathname from headers
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Determine subscription active status
  const isExpired = shop && (shop.status === 'Expired' || (shop.subscription_end && new Date(shop.subscription_end) < new Date()));
  const isSuspended = shop && shop.status === 'Suspended';
  const isBlocked = (isExpired || isSuspended) && !pathname.startsWith('/dashboard/settings');

  // Expiry warnings for active plans (<= 7 days remaining)
  let daysRemaining = 0;
  let showExpiryWarning = false;
  if (shop && shop.status === 'Active' && shop.subscription_end) {
    const msRemaining = new Date(shop.subscription_end).getTime() - Date.now();
    daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    showExpiryWarning = daysRemaining > 0 && daysRemaining <= 7;
  }

  return (
    <div className="dashboard-layout">
      {/* Premium ambient background elements */}
      <div className="dashboard-bg">
        <div className="dashboard-bg-orb dashboard-bg-orb-1" />
        <div className="dashboard-bg-orb dashboard-bg-orb-2" />
        <div className="dashboard-grid" />
      </div>

      <Sidebar
        userRole={profile?.role}
        userName={profile?.name ?? user.email ?? 'User'}
        shopName={shopName}
      />

      <main className="dashboard-main">
        {showExpiryWarning && (
          <div className="alert alert-warning no-print" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212, 175, 55, 0.3)', background: 'rgba(212, 175, 55, 0.08)', color: 'var(--gold-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>
                <strong>Subscription Warning:</strong> Your SuvarnaLoan subscription expires in <strong>{daysRemaining} day{daysRemaining > 1 ? 's' : ''}</strong> ({shop.subscription_end ? new Date(shop.subscription_end).toLocaleDateString('en-IN') : ''}). Please renew to prevent service disruption.
              </span>
            </div>
            <Link href="/dashboard/settings?tab=billing" className="btn btn-gold btn-sm" style={{ textDecoration: 'none', padding: '0.35rem 0.75rem', fontSize: '0.75rem', height: 'auto' }} id="warn-renew-btn">
              Renew Now
            </Link>
          </div>
        )}

        {isBlocked ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            minHeight: '80vh',
          }}>
            <div className="card animate-fade-in-up" style={{
              maxWidth: '500px',
              width: '100%',
              padding: '2.5rem',
              textAlign: 'center',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              background: 'rgba(24, 24, 27, 0.8)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isSuspended ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                border: isSuspended ? '2px solid #ef4444' : '2px solid var(--gold-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSuspended ? '#ef4444' : 'var(--gold-primary)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>

              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  {isSuspended ? 'Account Suspended' : 'Subscription Expired'}
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {isSuspended 
                    ? `Access to your store "${shopName}" has been suspended by the administrator. Please reach out to support for resolution.`
                    : `Your subscription to SuvarnaLoan ERP for "${shopName}" expired on ${shop?.subscription_end ? new Date(shop.subscription_end).toLocaleDateString('en-IN') : 'N/A'}. Please renew your plan to continue using the software.`
                  }
                </p>
              </div>

              {isExpired && (
                <Link
                  href="/dashboard/settings?tab=billing"
                  className="btn btn-gold btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                  id="expired-renew-btn"
                >
                  <span>Renew Subscription</span>
                </Link>
              )}
              
              {isSuspended && (
                <a
                  href="mailto:support@suvarnaloan.com"
                  className="btn btn-outline btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                  id="suspended-support-btn"
                >
                  <span>Contact Support</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          children
        )}
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
