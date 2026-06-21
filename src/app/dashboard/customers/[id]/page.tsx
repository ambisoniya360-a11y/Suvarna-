import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  MapPin,
  FileText,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  formatDate,
  getInitials,
  getCustomerStatusColor,
  formatCurrency,
  getLoanStatusColor
} from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('shop_id')
    .eq('id', user.id)
    .single();

  if (!profile?.shop_id) redirect('/dashboard');

  // Fetch customer details along with their loans
  const { data: customer, error } = await supabase
    .from('customers')
    .select(`
      *,
      loans(
        id,
        loan_number,
        loan_amount,
        loan_date,
        status,
        due_date,
        gold_items(ornament_type, net_weight, purity)
      )
    `)
    .eq('id', id)
    .eq('shop_id', profile.shop_id)
    .single();

  if (error || !customer) notFound();

  const loans = customer.loans || [];
  const activeLoans = loans.filter((l: any) => l.status === 'Active');
  const totalBorrowed = loans.reduce((sum: number, l: any) => sum + Number(l.loan_amount || 0), 0);
  const activeBorrowed = activeLoans.reduce((sum: number, l: any) => sum + Number(l.loan_amount || 0), 0);

  return (
    <div className="dashboard-content">
      {/* Back Button */}
      <Link
        href="/dashboard/customers"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '1rem' }}
        id="back-customers-btn"
      >
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {customer.photo_url ? (
            <img
              src={customer.photo_url}
              alt={customer.full_name}
              className="avatar avatar-lg"
              style={{ width: 64, height: 64 }}
            />
          ) : (
            <div className="avatar-placeholder" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
              {getInitials(customer.full_name)}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 className="page-title">{customer.full_name}</h1>
              <span className={`badge ${getCustomerStatusColor(customer.status)}`}>
                {customer.status}
              </span>
            </div>
            <p className="page-subtitle">Customer since {formatDate(customer.created_at)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            href={`/dashboard/loans/new?customerId=${customer.id}`}
            className="btn btn-gold"
            id="create-loan-btn"
          >
            <Plus size={16} /> <span>New Loan</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card">
          <div className="stat-icon">
            <Award size={20} />
          </div>
          <div>
            <p className="stat-label">Credit Rating</p>
            <p className="stat-value">{customer.credit_score ?? 'N/A'}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Layers size={20} />
          </div>
          <div>
            <p className="stat-label">Active Loans</p>
            <p className="stat-value">{activeLoans.length} / {loans.length}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="stat-label">Active Borrowing</p>
            <p className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(activeBorrowed)}
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="stat-label">Total Volume</p>
            <p className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalBorrowed)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Profile Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--gold-primary)' }}>
              Profile Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Full Name', value: customer.full_name, icon: User },
                { label: 'Mobile Number', value: customer.mobile_number, icon: Phone },
                { label: 'Alternate Mobile', value: customer.alternate_mobile || '—', icon: Phone },
                { label: 'Email Address', value: customer.email || '—', icon: Mail },
                { label: 'Date of Birth', value: customer.date_of_birth ? formatDate(customer.date_of_birth) : '—', icon: Calendar },
                { label: 'Gender', value: customer.gender || '—', icon: User },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={14} style={{ opacity: 0.6 }} />
                    {label}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Address Info */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--gold-primary)' }}>
              Address Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <MapPin size={16} style={{ color: 'var(--gold-primary)', marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {customer.address || 'No address specified.'}
                  </p>
                </div>
              </div>
              {[
                { label: 'City', value: customer.city || '—' },
                { label: 'State', value: customer.state || '—' },
                { label: 'Pincode', value: customer.pincode || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Identity & KYC Verification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--gold-primary)' }}>
              Identity & Documents
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Aadhaar Card', num: customer.aadhaar_number, url: customer.aadhaar_url },
                { label: 'PAN Card', num: customer.pan_number, url: customer.pan_url }
              ].map((doc) => (
                <div
                  key={doc.label}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{doc.label}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {doc.num ? doc.num.replace(/.(?=.{4})/g, 'X') : 'Not Provided'}
                    </span>
                  </div>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <FileText size={14} /> View KYC Document <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '0.25rem 0' }}>
                      No document file uploaded.
                    </div>
                  )}
                </div>
              ))}

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nominee Details</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                    {customer.nominee_name ? `${customer.nominee_name} (${customer.nominee_relation})` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Loans */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gold-primary)', margin: 0 }}>
                Loans Taken ({loans.length})
              </h3>
            </div>

            {loans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  No loans recorded for this customer.
                </p>
                <Link
                  href={`/dashboard/loans/new?customerId=${customer.id}`}
                  className="btn btn-outline btn-sm"
                  style={{ margin: '0 auto' }}
                >
                  <Plus size={14} /> Add First Loan
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loans.map((loan: any) => {
                  const item = loan.gold_items as { ornament_type: string; net_weight: number; purity: string } | null;
                  return (
                    <div
                      key={loan.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            {loan.loan_number}
                          </span>
                          <span className={`badge ${getLoanStatusColor(loan.status)}`} style={{ fontSize: '0.6875rem', padding: '0.125rem 0.375rem' }}>
                            {loan.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {item ? `${item.ornament_type} (${item.net_weight}g, ${item.purity})` : '—'} · {formatDate(loan.loan_date)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                          {formatCurrency(loan.loan_amount)}
                        </span>
                        <Link
                          href={`/dashboard/loans/${loan.id}`}
                          className="btn btn-ghost btn-xs"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
