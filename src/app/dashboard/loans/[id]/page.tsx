import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gem, User, Calendar, TrendingUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, getLoanStatusColor, getInitials } from '@/lib/utils';
import RecordPaymentModal from './record-payment-modal';
import InvoiceButton from './invoice-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

function calculateMonthsElapsed(loanDate: string): number {
  return Math.floor(
    (Date.now() - new Date(loanDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
}

export default async function LoanDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  const [loanRes, shopRes] = await Promise.all([
    supabase
      .from('loans')
      .select(`
        *,
        customers(*),
        gold_items(*),
        payments(*)
      `)
      .eq('id', id)
      .eq('shop_id', profile.shop_id)
      .single(),
    supabase
      .from('shops')
      .select('*')
      .eq('id', profile.shop_id)
      .single()
  ]);

  const loan = loanRes.data;
  const shop = shopRes.data;

  if (loanRes.error || !loan) notFound();

  const customer = loan.customers as { full_name: string; mobile_number: string; photo_url?: string; address?: string } | null;
  const goldItem = loan.gold_items as { ornament_type: string; net_weight: number; purity: string; gross_weight: number; hallmark_number?: string; front_image_url?: string } | null;
  const payments = (loan.payments ?? []) as { id: string; amount: number; payment_type: string; payment_method: string; payment_date: string; receipt_number?: string }[];

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  
  // Calculate principal paid vs interest paid
  const principalPaid = payments
    .filter(p => p.payment_type === 'Partial Payment' || p.payment_type === 'Full Settlement')
    .reduce((s, p) => s + p.amount, 0);
  const interestPaid = payments
    .filter(p => p.payment_type === 'Interest Payment')
    .reduce((s, p) => s + p.amount, 0);

  const remainingPrincipal = Math.max(0, loan.loan_amount - principalPaid);
  const monthsElapsed = calculateMonthsElapsed(loan.loan_date);
  const totalInterestDue = (loan.loan_amount * loan.interest_rate * Math.max(monthsElapsed, 1)) / 100;
  const remainingInterest = Math.max(0, totalInterestDue - interestPaid);
  const totalBalanceDue = remainingPrincipal + remainingInterest;

  return (
    <div className="dashboard-content">
      {/* Back */}
      <Link href="/dashboard/loans" className="btn btn-ghost btn-sm no-print" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Loans
      </Link>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 className="page-title" style={{ fontFamily: 'var(--font-mono)' }}>{loan.loan_number}</h1>
            <span className={`badge ${getLoanStatusColor(loan.status)}`} style={{ fontSize: '0.875rem' }}>
              {loan.status}
            </span>
          </div>
          <p className="page-subtitle">Created {formatDate(loan.loan_date)}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <InvoiceButton loan={loan} shop={shop} />
          {loan.status === 'Active' && (
            <div className="no-print">
              <RecordPaymentModal loanId={loan.id} loanNumber={loan.loan_number} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="no-print">

        {/* Loan Summary */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--gold-primary)' }}>
            Loan Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Loan Amount', value: formatCurrency(loan.loan_amount), highlight: true },
              { label: 'Interest Rate', value: `${loan.interest_rate}% per month` },
              { label: 'Total Interest Due', value: formatCurrency(totalInterestDue) },
              { label: 'Total Paid', value: formatCurrency(totalPaid) },
              { label: 'Remaining Loan Amount', value: formatCurrency(remainingPrincipal), highlight: true },
              { label: 'Remaining Interest Due', value: formatCurrency(remainingInterest) },
              { label: 'Total Balance Due', value: formatCurrency(totalBalanceDue), highlight: true },
              { label: 'Loan Date', value: formatDate(loan.loan_date) },
              { label: 'Due Date', value: loan.due_date ? formatDate(loan.due_date) : '—' },
              { label: 'Scheme', value: loan.scheme_name ?? '—' },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{label}</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: highlight ? 700 : 500,
                  fontFamily: 'var(--font-mono)',
                  color: highlight ? 'var(--gold-primary)' : 'var(--text-primary)',
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Gold */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Customer */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gold-primary)' }}>
              Customer
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {customer?.photo_url ? (
                <img src={customer.photo_url} alt={customer.full_name} className="avatar avatar-lg" />
              ) : (
                <div className="avatar-placeholder" style={{ width: 56, height: 56, fontSize: '1.25rem' }}>
                  {customer ? getInitials(customer.full_name) : 'U'}
                </div>
              )}
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{customer?.full_name ?? '—'}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {customer?.mobile_number}
                </p>
                {customer?.address && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                    {customer.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gold Item */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gold-primary)' }}>
              Gold Item
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {goldItem?.front_image_url ? (
                <img src={goldItem.front_image_url} alt={goldItem.ornament_type} style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gem size={24} style={{ color: 'var(--gold-primary)' }} />
                </div>
              )}
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{goldItem?.ornament_type ?? '—'}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Net: {goldItem?.net_weight}g · Purity: {goldItem?.purity}
                </p>
                {goldItem?.hallmark_number && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    Hallmark: {goldItem.hallmark_number}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="card" style={{ gridColumn: 'span 2', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            Payment History ({payments.length})
          </h3>

          {payments.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>
              No payments recorded yet.
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                    .map((p) => (
                      <tr key={p.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                            {p.receipt_number ?? '—'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {formatDate(p.payment_date)}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                            +{formatCurrency(p.amount)}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                            {p.payment_type}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {p.payment_method}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
