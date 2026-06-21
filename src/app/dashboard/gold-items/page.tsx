import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Gem, Plus } from 'lucide-react';
import { formatDate, formatWeight } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function GoldItemsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');
  const pageSize = 20;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  const { data: items, count } = await supabase
    .from('gold_items')
    .select('*, customers(full_name, mobile_number)', { count: 'exact' })
    .eq('shop_id', profile.shop_id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Stats
  const { data: allItems } = await supabase
    .from('gold_items').select('net_weight, estimated_value').eq('shop_id', profile.shop_id);

  const totalWeight = (allItems ?? []).reduce((s: number, i: any) => s + (i.net_weight ?? 0), 0);
  const totalValue = (allItems ?? []).reduce((s: number, i: any) => s + (i.estimated_value ?? 0), 0);

  const purityColors: Record<string, string> = {
    '24K': '#FFD700',
    '22K': '#D4AF37',
    '918': '#D4AF37',
    '916': '#D4AF37',
    '18K': '#C89B3C',
    '750': '#C89B3C',
    '14K': '#8B6914',
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gold Inventory</h1>
          <p className="page-subtitle">
            {count ?? 0} items · Total: {formatWeight(totalWeight)}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Items', value: (count ?? 0).toString() },
          { label: 'Total Net Weight', value: formatWeight(totalWeight) },
          { label: 'Est. Total Value', value: totalValue > 0 ? `₹${(totalValue / 100000).toFixed(2)}L` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.375rem' }}>{label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        {!items || items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Gem size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', opacity: 0.4 }} />
            <h3>No gold items yet</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Gold items are added when creating loans.
            </p>
            <Link href="/dashboard/loans/new" className="btn btn-gold">
              <Plus size={16} /> <span>Create Loan</span>
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Customer</th>
                <th>Gross Weight</th>
                <th>Net Weight</th>
                <th>Purity</th>
                <th>Hallmark</th>
                <th>Est. Value</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {(items as unknown as Array<{
                id: string;
                ornament_type: string;
                description?: string;
                gross_weight: number;
                net_weight: number;
                purity: string;
                hallmark_number?: string;
                estimated_value?: number;
                front_image_url?: string;
                created_at: string;
                customers: { full_name: string; mobile_number: string } | null;
              }>).map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.front_image_url ? (
                        <img
                          src={item.front_image_url}
                          alt={item.ornament_type}
                          style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: 'var(--radius-md)',
                          background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Gem size={18} style={{ color: 'var(--gold-primary)' }} />
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.ornament_type}</p>
                        {item.description && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.customers?.full_name ?? '—'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {item.customers?.mobile_number}
                    </p>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                    {formatWeight(item.gross_weight)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gold-primary)' }}>
                    {formatWeight(item.net_weight)}
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: purityColors[item.purity] ?? 'var(--gold-primary)',
                    }}>
                      {item.purity}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {item.hallmark_number ?? '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {item.estimated_value ? `₹${item.estimated_value.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
