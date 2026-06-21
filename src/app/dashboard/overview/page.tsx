import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Wallet, CreditCard, TrendingUp, AlertTriangle,
  Scale, ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils';

async function getDashboardData(shopId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [
    { count: totalCustomers },
    { data: loans },
    { data: payments },
    { data: recentPayments },
    { data: goldItems },
    { data: recentLoans },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('shop_id', shopId),
    supabase.from('loans').select('id, loan_amount, status, loan_date').eq('shop_id', shopId),
    supabase.from('payments').select('amount, payment_date').eq('shop_id', shopId).gte('payment_date', thirtyDaysAgo),
    supabase.from('payments')
      .select('amount, payment_date, payment_type, loans(loan_number, customers(full_name))')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('gold_items').select('net_weight').eq('shop_id', shopId),
    supabase.from('loans')
      .select('id, loan_number, loan_amount, status, loan_date, customers(full_name)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const loansArr = loans ?? [];
  const paymentsArr = payments ?? [];
  const goldArr = goldItems ?? [];

  const activeLoans = loansArr.filter((l: any) => l.status === 'Active');
  const overdueLoans = loansArr.filter((l: any) => l.status === 'Overdue');
  const outstanding = [...activeLoans, ...overdueLoans].reduce((s: number, l: any) => s + l.loan_amount, 0);
  const todayCollections = paymentsArr
    .filter((p: any) => p.payment_date === today)
    .reduce((s: number, p: any) => s + p.amount, 0);
  const goldWeight = goldArr.reduce((s: number, g: any) => s + (g.net_weight ?? 0), 0);

  // Monthly disbursements for chart
  const byMonth: Record<string, number> = {};
  for (const l of loansArr) {
    const m = l.loan_date?.slice(0, 7);
    if (m) byMonth[m] = (byMonth[m] ?? 0) + l.loan_amount;
  }
  const chartData = Object.entries(byMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, amount]) => ({ month, amount }));

  return {
    totalCustomers: totalCustomers ?? 0,
    activeLoans: activeLoans.length,
    outstanding,
    todayCollections,
    overdueLoans: overdueLoans.length,
    goldWeight,
    chartData,
    recentPayments: recentPayments ?? [],
    recentLoans: recentLoans ?? [],
  };
}

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('shop_id, name')
    .eq('id', user.id)
    .single();

  console.log('--- OverviewPage debug ---');
  console.log('User ID:', user?.id);
  console.log('User Email:', user?.email);
  console.log('Profile Data:', profile);

  if (!profile?.shop_id) {
    return (
      <div className="dashboard-content">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>Setup Required</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            Your account is not linked to a shop. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const data = await getDashboardData(profile.shop_id);

  const stats = [
    {
      id: 'stat-customers',
      label: 'Total Customers',
      value: data.totalCustomers.toLocaleString('en-IN'),
      icon: Users,
      color: '#3B82F6',
      href: '/dashboard/customers',
    },
    {
      id: 'stat-loans',
      label: 'Active Loans',
      value: data.activeLoans.toLocaleString('en-IN'),
      icon: Wallet,
      color: '#D4AF37',
      href: '/dashboard/loans?status=Active',
    },
    {
      id: 'stat-outstanding',
      label: 'Outstanding Balance',
      value: formatCurrency(data.outstanding, { compact: true }),
      icon: TrendingUp,
      color: '#8B5CF6',
      href: '/dashboard/loans',
    },
    {
      id: 'stat-today',
      label: "Today's Collections",
      value: formatCurrency(data.todayCollections, { compact: true }),
      icon: CreditCard,
      color: '#00D26A',
      href: '/dashboard/payments',
    },
    {
      id: 'stat-overdue',
      label: 'Overdue Loans',
      value: data.overdueLoans.toLocaleString('en-IN'),
      icon: AlertTriangle,
      color: '#FF4D4F',
      href: '/dashboard/loans?status=Overdue',
    },
    {
      id: 'stat-gold',
      label: 'Gold Weight Held',
      value: `${data.goldWeight.toFixed(1)}g`,
      icon: Scale,
      color: '#F59E0B',
      href: '/dashboard/gold-items',
    },
  ];

  return (
    <div className="dashboard-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back, {profile.name}. Here&apos;s your business summary.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard/customers/new" className="btn btn-outline btn-sm" id="quick-new-customer">
            <Plus size={16} /> Customer
          </Link>
          <Link href="/dashboard/loans/new" className="btn btn-gold btn-sm" id="quick-new-loan">
            <Plus size={16} /> <span>New Loan</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {stats.map((stat) => (
          <Link key={stat.id} href={stat.href} id={stat.id} style={{ textDecoration: 'none' }}>
            <div className="stat-card card-hover" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: `${stat.color}14`,
                    border: `1px solid ${stat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <ArrowUpRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.375rem' }}>
                  {stat.label}
                </p>
                <p style={{
                  fontSize: '1.625rem', fontWeight: 700,
                  color: stat.id === 'stat-overdue' && data.overdueLoans > 0
                    ? 'var(--color-error)'
                    : 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '-0.02em',
                }}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Recent Loans */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Recent Loans</h3>
            <Link href="/dashboard/loans" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              View all
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.recentLoans.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>
                No loans yet. <Link href="/dashboard/loans/new" style={{ color: 'var(--gold-primary)' }}>Create one</Link>
              </p>
            ) : (
              data.recentLoans.map((loan: {
                id: string; loan_number: string; loan_amount: number;
                status: string; loan_date: string;
                customers: { full_name: string } | { full_name: string }[] | null;
              }) => {
                const customer = Array.isArray(loan.customers) ? loan.customers[0] : loan.customers;
                return (
                  <Link
                    key={loan.id}
                    href={`/dashboard/loans/${loan.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                      transition: 'all 0.15s', textDecoration: 'none',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {(customer as { full_name: string })?.full_name ?? 'Unknown'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {loan.loan_number} · {formatDate(loan.loan_date)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(loan.loan_amount)}
                      </p>
                      <span className={`badge badge-${loan.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                        {loan.status}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Recent Collections</h3>
            <Link href="/dashboard/payments" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              View all
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {data.recentPayments.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>
                No payments recorded yet.
              </p>
            ) : (
              (data.recentPayments as unknown as Array<{
                amount: number; payment_date: string; payment_type: string;
                loans: { loan_number: string; customers: { full_name: string } | { full_name: string }[] | null } | null;
              }>).map((payment, idx) => {
                const loan = payment.loans;
                const customer = loan
                  ? (Array.isArray(loan.customers) ? loan.customers[0] : loan.customers)
                  : null;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.625rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--color-success-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ArrowDownRight size={16} style={{ color: 'var(--color-success)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {(customer as { full_name: string })?.full_name ?? 'Unknown'}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                          {payment.payment_type} · {payment.payment_date}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                      +{formatCurrency(payment.amount)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Loan Status Distribution */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Loan Portfolio Status</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Active', key: 'Active', color: 'var(--color-success)' },
              { label: 'Overdue', key: 'Overdue', color: 'var(--color-error)' },
              { label: 'Closed', key: 'Closed', color: 'var(--color-info)' },
            ].map(({ label, key, color }) => {
              const count = data.recentLoans.filter(() => true).length;
              return (
                <div key={key} style={{
                  padding: '1rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>{label}</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
                    {key === 'Active' ? data.activeLoans :
                      key === 'Overdue' ? data.overdueLoans : '—'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Overdue alert */}
          {data.overdueLoans > 0 && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              <AlertTriangle size={16} />
              <span>
                <strong>{data.overdueLoans} loans</strong> are overdue.{' '}
                <Link href="/dashboard/loans?status=Overdue" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Review now
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
