import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GitBranch, Plus, MapPin, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function BranchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  const { data: shop } = await supabase.from('shops').select('plan').eq('id', profile.shop_id).single();
  const shopPlan = shop?.plan || 'Professional';

  if (shopPlan === 'Professional') {
    return (
      <div className="dashboard-content animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 240px)' }}>
        <div className="card" style={{
          maxWidth: '500px', width: '100%', padding: '3.5rem 2.5rem', textAlign: 'center',
          border: '1px solid var(--gold-border)', boxShadow: '0 12px 48px rgba(212, 175, 55, 0.08)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.03), transparent)'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--gold-subtle)',
            border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--gold-primary)'
          }}>
            <GitBranch size={28} />
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Multi-Branch Management Locked
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your active <strong>Professional</strong> plan does not support multiple branch locations. Upgrade to the <strong>Enterprise Plan</strong> to manage up to 10 branch channels and coordinate inventory.
          </p>

          <a 
            href="/dashboard/settings?tab=billing" 
            className="btn btn-gold btn-lg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', justifyContent: 'center', width: '100%' }}
          >
            <span>Upgrade Subscription</span>
          </a>
        </div>
      </div>
    );
  }

  const { data: branches, count } = await supabase
    .from('branches')
    .select('*', { count: 'exact' })
    .eq('shop_id', profile.shop_id)
    .order('created_at', { ascending: true });

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Branches</h1>
          <p className="page-subtitle">{count ?? 0} branches</p>
        </div>
      </div>

      {!branches || branches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <GitBranch size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', opacity: 0.4 }} />
          <h3>No branches configured</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            Contact your administrator to add branch data to Supabase.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {branches.map((branch: {
            id: string; name: string; address: string; phone?: string;
            is_active: boolean; created_at: string;
          }) => (
            <div key={branch.id} className="card card-hover">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GitBranch size={20} style={{ color: 'var(--gold-primary)' }} />
                </div>
                <span className={`badge ${branch.is_active ? 'badge-active' : 'badge-warning'}`}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{branch.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{branch.address}</span>
                </div>
                {branch.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    <Phone size={14} />
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{branch.phone}</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1rem' }}>
                Added {formatDate(branch.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
