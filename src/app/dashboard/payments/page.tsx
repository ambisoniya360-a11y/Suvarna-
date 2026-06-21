import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ page?: string; type?: string; date_from?: string; date_to?: string }>;
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');
  const pageSize = 25;
  const paymentType = params.type ?? '';
  const dateFrom = params.date_from ?? '';
  const dateTo = params.date_to ?? '';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  let query = supabase
    .from('payments')
    .select(`
      id, amount, payment_type, payment_method, payment_date, receipt_number, notes,
      loans(loan_number, customers(full_name, mobile_number))
    `, { count: 'exact' })
    .eq('shop_id', profile.shop_id)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (paymentType) query = query.eq('payment_type', paymentType);
  if (dateFrom) query = query.gte('payment_date', dateFrom);
  if (dateTo) query = query.lte('payment_date', dateTo);

  const { data: payments, count } = await query;

  // Today's total
  const today = new Date().toISOString().split('T')[0];
  const { data: todayPayments } = await supabase
    .from('payments').select('amount').eq('shop_id', profile.shop_id).eq('payment_date', today);
  const todayTotal = (todayPayments ?? []).reduce((s: number, p: any) => s + p.amount, 0);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const paymentTypeColors: Record<string, string> = {
    'Interest Payment': 'badge-warning',
    'Partial Payment': 'badge-active',
    'Full Settlement': 'badge-closed',
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">
            {count ?? 0} records · Today&apos;s total:{' '}
            <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
              {formatCurrency(todayTotal)}
            </span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <form method="GET" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', flex: 1 }}>
          <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label">Payment Type</label>
            <select id="payment-type-filter" name="type" className="form-select" defaultValue={paymentType}>
              <option value="">All Types</option>
              <option>Interest Payment</option>
              <option>Partial Payment</option>
              <option>Full Settlement</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">From</label>
            <input id="date-from" name="date_from" type="date" className="form-input" defaultValue={dateFrom} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">To</label>
            <input id="date-to" name="date_to" type="date" className="form-input" defaultValue={dateTo} />
          </div>
          <button type="submit" className="btn btn-gold btn-sm" id="filter-payments-btn">Filter</button>
          {(paymentType || dateFrom || dateTo) && (
            <Link href="/dashboard/payments" className="btn btn-ghost btn-sm">Clear</Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="table-container">
        {!payments || payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <CreditCard size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', opacity: 0.4 }} />
            <h3>No payments found</h3>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Customer</th>
                <th>Loan #</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(payments as unknown as Array<{
                id: string;
                amount: number;
                payment_type: string;
                payment_method: string;
                payment_date: string;
                receipt_number?: string;
                loans: {
                  loan_number: string;
                  customers: { full_name: string; mobile_number: string } | null;
                } | null;
              }>).map((payment) => {
                const customer = payment.loans?.customers;
                return (
                  <tr key={payment.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                        {payment.receipt_number ?? '—'}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{customer?.full_name ?? '—'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {customer?.mobile_number}
                      </p>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--gold-primary)' }}>
                        {payment.loans?.loan_number ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                        +{formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${paymentTypeColors[payment.payment_type] ?? 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                        {payment.payment_type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {payment.payment_method}
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {formatDate(payment.payment_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/payments?page=${p}&type=${paymentType}&date_from=${dateFrom}&date_to=${dateTo}`}
              className={`btn btn-sm ${p === page ? 'btn-gold' : 'btn-outline'}`}
              id={`payment-page-${p}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
