import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { formatDate, getInitials, getCustomerStatusColor } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? '';
  const status = params.status ?? '';
  const page = parseInt(params.page ?? '1');
  const pageSize = 20;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('shop_id', profile.shop_id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,mobile_number.ilike.%${search}%,aadhaar_number.ilike.%${search}%`
    );
  }
  if (status) query = query.eq('status', status);

  const { data: customers, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{count ?? 0} total customers</p>
        </div>
        <Link href="/dashboard/customers/new" className="btn btn-gold" id="add-customer-btn">
          <Plus size={18} /> <span>Add Customer</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <form method="GET" style={{ display: 'flex', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              id="customer-search"
              name="search"
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search name, mobile, Aadhaar…"
              defaultValue={search}
            />
          </div>
          <select
            id="customer-status-filter"
            name="status"
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            defaultValue={status}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
          <button type="submit" className="btn btn-outline btn-sm" id="customer-filter-btn">
            <Filter size={16} /> Filter
          </button>
          {(search || status) && (
            <Link href="/dashboard/customers" className="btn btn-ghost btn-sm">Clear</Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="table-container">
        {!customers || customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Users size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', opacity: 0.4 }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No customers found</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              {search ? 'Try a different search term.' : 'Start by adding your first customer.'}
            </p>
            <Link href="/dashboard/customers/new" className="btn btn-gold">
              <Plus size={16} /> <span>Add First Customer</span>
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Aadhaar</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer: any) => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {customer.photo_url ? (
                        <img
                          src={customer.photo_url}
                          alt={customer.full_name}
                          className="avatar avatar-sm"
                        />
                      ) : (
                        <div className="avatar-placeholder avatar-sm">
                          {getInitials(customer.full_name)}
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{customer.full_name}</p>
                        {customer.email && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{customer.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                      {customer.mobile_number}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {customer.aadhaar_number
                        ? `XXXX-XXXX-${customer.aadhaar_number.slice(-4)}`
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getCustomerStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {formatDate(customer.created_at)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="btn btn-ghost btn-sm"
                        id={`view-customer-${customer.id}`}
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/loans/new?customerId=${customer.id}`}
                        className="btn btn-outline btn-sm"
                        id={`add-loan-${customer.id}`}
                      >
                        + Loan
                      </Link>
                    </div>
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
              href={`/dashboard/customers?page=${p}&search=${search}&status=${status}`}
              className={`btn btn-sm ${p === page ? 'btn-gold' : 'btn-outline'}`}
              id={`page-${p}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
