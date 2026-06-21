import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserCheck } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  const { data: employees, count } = await supabase
    .from('employees')
    .select('*, branches(name)', { count: 'exact' })
    .eq('shop_id', profile.shop_id)
    .order('name', { ascending: true });

  const roleColors: Record<string, string> = {
    'Shop Owner': 'badge-gold',
    'Branch Admin': 'badge-active',
    'Staff': 'badge-warning',
    'Viewer': 'badge-closed',
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{count ?? 0} staff members</p>
        </div>
      </div>

      {!employees || employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <UserCheck size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', opacity: 0.4 }} />
          <h3>No employees added yet</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            Employees can be managed via Supabase or through your admin panel.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(employees as unknown as Array<{
                id: string;
                name: string;
                role: string;
                phone: string;
                email?: string;
                is_active: boolean;
                joined_at?: string;
                created_at: string;
                branches?: { name: string };
              }>).map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar-placeholder avatar-sm">{getInitials(emp.name)}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.name}</p>
                        {emp.email && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{emp.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${roleColors[emp.role] ?? 'badge-gold'}`}>{emp.role}</span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {emp.branches?.name ?? '—'}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{emp.phone}</span>
                  </td>
                  <td>
                    <span className={`badge ${emp.is_active ? 'badge-active' : 'badge-warning'}`}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {emp.joined_at ? formatDate(emp.joined_at) : formatDate(emp.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
