import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, Wallet, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, getLoanStatusColor } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function LoansPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? '';
  const status = params.status ?? '';
  const page = parseInt(params.page ?? '1');
  const pageSize = 20;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  let query = supabase
    .from('loans')
    .select(`
      id, loan_number, loan_amount, interest_rate, loan_date, due_date, status,
      customers(id, full_name, mobile_number, photo_url),
      gold_items(ornament_type, net_weight, purity)
    `, { count: 'exact' })
    .eq('shop_id', profile.shop_id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) query = query.ilike('loan_number', `%${search}%`);
  if (status) query = query.eq('status', status);

  const { data: loans, count } = await query;

  // Summary stats
  const { data: allLoans } = await supabase
    .from('loans')
    .select('loan_amount, status')
    .eq('shop_id', profile.shop_id);

  const outstanding = (allLoans ?? [])
    .filter((l: any) => ['Active', 'Overdue'].includes(l.status))
    .reduce((s: number, l: any) => s + l.loan_amount, 0);
  const overdueCount = (allLoans ?? []).filter((l: any) => l.status === 'Overdue').length;

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gold Loans</h1>
          <p className="page-subtitle">{count ?? 0} loans · Outstanding: {formatCurrency(outstanding, { compact: true })}</p>
        </div>
        <Link href="/dashboard/loans/new" className="btn btn-gold" id="add-loan-btn">
          <Plus size={18} /> <span>New Loan</span>
        </Link>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={16} />
          <span>
            <strong>{overdueCount} loan{overdueCount > 1 ? 's' : ''}</strong> overdue.{' '}
            <Link href="/dashboard/loans?status=Overdue" style={{ color: 'inherit', textDecoration: 'underline' }}>
              Review
            </Link>
          </span>
        </div>
      )}

      {/* Status Quick Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['', 'Active', 'Overdue', 'Closed'].map((s) => (
          <Link
            key={s}
            href={`/dashboard/loans?status=${s}`}
            className={`btn btn-sm ${status === s ? 'btn-gold' : 'btn-outline'}`}
            id={`filter-${s || 'all'}`}
          >
            {s || 'All'}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <form method="GET" style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="hidden" name="status" value={status} />
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              id="loan-search"
              name="search"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by loan number…"
              defaultValue={search}
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm" id="loan-search-btn">
            <Filter size={16} /> Search
          </button>
          {search && (
            <Link href={`/dashboard/loans?status=${status}`} className="btn btn-ghost btn-sm">Clear</Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="table-container">
        {!loans || loans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Wallet size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', opacity: 0.4 }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No loans found</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              {search ? 'Try a different loan number.' : 'Create your first gold loan.'}
            </p>
            <Link href="/dashboard/loans/new" className="btn btn-gold">
              <Plus size={16} /> <span>New Loan</span>
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Loan #</th>
                <th>Customer</th>
                <th>Gold Item</th>
                <th>Amount</th>
                <th>Interest</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(loans as unknown as Array<{
                id: string;
                loan_number: string;
                loan_amount: number;
                interest_rate: number;
                loan_date: string;
                status: string;
                customers: { id: string; full_name: string; mobile_number: string } | null;
                gold_items: { ornament_type: string; net_weight: number; purity: string } | null;
              }>).map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                      {loan.loan_number}
                    </span>
                  </td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {loan.customers?.full_name ?? '—'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {loan.customers?.mobile_number}
                      </p>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {loan.gold_items
                      ? `${loan.gold_items.ornament_type} · ${loan.gold_items.net_weight}g · ${loan.gold_items.purity}`
                      : '—'}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-primary)' }}>
                      {formatCurrency(loan.loan_amount)}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                    {loan.interest_rate}% / mo
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {formatDate(loan.loan_date)}
                  </td>
                  <td>
                    <span className={`badge ${getLoanStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/dashboard/loans/${loan.id}`}
                      className="btn btn-ghost btn-sm"
                      id={`view-loan-${loan.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/loans?page=${p}&search=${search}&status=${status}`}
              className={`btn btn-sm ${p === page ? 'btn-gold' : 'btn-outline'}`}
              id={`loan-page-${p}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
