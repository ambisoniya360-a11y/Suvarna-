'use client';

import { useState, useTransition } from 'react';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  Search,
  Loader2,
  GitBranch,
  Phone,
  Mail,
  IndianRupee,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { createEmployee, updateEmployee, deleteEmployee } from '@/actions/employee-actions';
import { getInitials, formatDate } from '@/lib/utils';

interface Branch {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  salary?: number;
  joined_at?: string;
  is_active: boolean;
  created_at: string;
  branch_id?: string | null;
  branches?: { name: string } | null;
}

interface EmployeesClientProps {
  initialEmployees: Employee[];
  branches: Branch[];
  shopPlan: string;
}

export default function EmployeesClient({ initialEmployees, branches, shopPlan }: EmployeesClientProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    role: 'Staff',
    phone: '',
    email: '',
    salary: '',
    joined_at: new Date().toISOString().split('T')[0],
    branch_id: '',
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const roleColors: Record<string, string> = {
    'Shop Owner': 'badge-gold',
    'Branch Admin': 'badge-active',
    'Staff': 'badge-warning',
    'Viewer': 'badge-closed',
  };

  // Conditionally block screen if Professional plan
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
            <Briefcase size={28} />
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Staff Management Locked
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your active <strong>Professional</strong> plan does not support staff member accounts. Upgrade to the <strong>Enterprise Plan</strong> to onboard up to 10 staff members and assign roles.
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

  // Filter employees based on search
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    if (employees.length >= 10) {
      toast.error('Staff limit reached. Upgrade your subscription to add more than 10 members.');
      return;
    }
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: 'Staff',
      phone: '',
      email: '',
      salary: '',
      joined_at: new Date().toISOString().split('T')[0],
      branch_id: branches[0]?.id || '',
      is_active: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      phone: emp.phone,
      email: emp.email || '',
      salary: emp.salary ? String(emp.salary) : '',
      joined_at: emp.joined_at ? emp.joined_at.split('T')[0] : '',
      branch_id: emp.branch_id || '',
      is_active: emp.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (formData.salary && isNaN(Number(formData.salary))) {
      errors.salary = 'Salary must be a valid number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    startTransition(async () => {
      if (editingEmployee) {
        // Edit Action
        const res = await updateEmployee(editingEmployee.id, {
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          email: formData.email || undefined,
          salary: formData.salary ? Number(formData.salary) : undefined,
          joined_at: formData.joined_at || undefined,
          branch_id: formData.branch_id || null,
          is_active: formData.is_active,
        });

        if (res.error) {
          toast.error(res.error);
        } else if (res.data) {
          toast.success('Employee updated successfully');
          const branchName = branches.find((b) => b.id === formData.branch_id)?.name;
          setEmployees((prev) =>
            prev.map((emp) =>
              emp.id === editingEmployee.id
                ? {
                    ...emp,
                    name: formData.name,
                    role: formData.role,
                    phone: formData.phone,
                    email: formData.email || undefined,
                    salary: formData.salary ? Number(formData.salary) : undefined,
                    joined_at: formData.joined_at || undefined,
                    branch_id: formData.branch_id || null,
                    is_active: formData.is_active,
                    branches: formData.branch_id ? { name: branchName || '' } : null,
                  }
                : emp
            )
          );
          setIsModalOpen(false);
        }
      } else {
        // Create Action
        if (employees.length >= 10) {
          toast.error('Limit reached. Max 10 employees.');
          return;
        }

        const res = await createEmployee({
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          email: formData.email || undefined,
          salary: formData.salary ? Number(formData.salary) : undefined,
          joined_at: formData.joined_at || undefined,
          branch_id: formData.branch_id || null,
          is_active: formData.is_active,
        });

        if (res.error) {
          toast.error(res.error);
        } else if (res.data) {
          toast.success('Employee added successfully');
          const branchName = branches.find((b) => b.id === formData.branch_id)?.name;
          const newEmp: Employee = {
            id: res.data.id,
            name: res.data.name,
            role: res.data.role,
            phone: res.data.phone,
            email: res.data.email,
            salary: res.data.salary,
            joined_at: res.data.joined_at,
            is_active: res.data.is_active,
            created_at: res.data.created_at,
            branch_id: res.data.branch_id,
            branches: res.data.branch_id ? { name: branchName || '' } : null,
          };
          setEmployees((prev) => [...prev, newEmp]);
          setIsModalOpen(false);
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove employee ${name}?`)) return;

    startTransition(async () => {
      const res = await deleteEmployee(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Employee removed successfully');
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      }
    });
  };

  // Limit status calculations
  const limitPercent = Math.min(100, (employees.length / 10) * 100);
  const isLimitReached = employees.length >= 10;

  return (
    <div className="dashboard-content animate-fade-in">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage system access roles for your branches</p>
        </div>

        <button 
          className="btn btn-gold btn-md" 
          onClick={openAddModal}
          disabled={isLimitReached}
          id="add-employee-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Limit Progress Tracker Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} style={{ color: 'var(--gold-primary)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Plan Capacity: Staff Members</span>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isLimitReached ? 'var(--gold-primary)' : 'var(--text-primary)' }}>
            {employees.length} / 10 employees
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${limitPercent}%`, 
              background: isLimitReached ? 'var(--gold-primary)' : 'var(--gold-primary)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} 
          />
        </div>

        {isLimitReached ? (
          <p style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
            <AlertTriangle size={14} /> You have reached the employee limit (10 members). Remove staff or contact support to increase limits.
          </p>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            You can add up to {10 - employees.length} more staff members under your active plan limits.
          </p>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="input-icon-wrapper" style={{ flex: 1, minWidth: '240px' }}>
          <Search size={16} className="input-icon" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input input-with-icon"
            placeholder="Search by name, email, phone, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="employee-search-input"
          />
        </div>
      </div>

      {/* Employees Grid/Table */}
      {filteredEmployees.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Briefcase size={40} style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No staff members found</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            {searchTerm ? 'Try adjusting your search filters' : 'Get started by clicking the "Add Employee" button above.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee Profile</th>
                <th>Access Role</th>
                <th>Branch Assignment</th>
                <th>Salary details</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar-placeholder avatar-sm">{getInitials(emp.name)}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.name}</p>
                        {emp.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            <Mail size={12} />
                            <span style={{ wordBreak: 'break-all' }}>{emp.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${roleColors[emp.role] ?? 'badge-gold'}`}>{emp.role}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <GitBranch size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{emp.branches?.name ?? 'Head Office / Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      {emp.salary ? (
                        <>
                          <IndianRupee size={13} style={{ color: 'var(--text-tertiary)' }} />
                          <span>{emp.salary.toLocaleString('en-IN')} / mo</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${emp.is_active ? 'badge-active' : 'badge-warning'}`}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {emp.joined_at ? formatDate(emp.joined_at) : formatDate(emp.created_at)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.375rem' }}
                        onClick={() => openEditModal(emp)}
                        title="Edit Employee"
                        id={`edit-emp-${emp.id}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn btn-outline btn-sm btn-danger-hover"
                        style={{ padding: '0.375rem', color: 'var(--color-error)' }}
                        onClick={() => handleDelete(emp.id, emp.name)}
                        title="Delete Employee"
                        id={`delete-emp-${emp.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── ADD / EDIT DIALOG MODAL ────────────────── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '1.5rem'
        }}>
          <div className="card animate-scale-up" style={{
            maxWidth: '520px', width: '100%', padding: '2rem',
            position: 'relative', border: '1px solid var(--gold-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: 'var(--bg-card)'
          }}>
            {/* Close Button */}
            <button 
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'transparent', border: 'none', color: 'var(--text-tertiary)',
                cursor: 'pointer', transition: 'color 0.2s'
              }}
              onClick={() => setIsModalOpen(false)}
              className="close-modal-btn"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} style={{ color: 'var(--gold-primary)' }} />
              <span>{editingEmployee ? 'Edit Staff Member' : 'Add New Employee'}</span>
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Employee Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Amit Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Role selection */}
                <div className="form-group">
                  <label className="form-label">Access Role *</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Staff">Staff</option>
                    <option value="Branch Admin">Branch Admin</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Shop Owner">Shop Owner</option>
                  </select>
                </div>

                {/* Branch assignment */}
                <div className="form-group">
                  <label className="form-label">Assign Branch</label>
                  <select
                    className="form-select"
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  >
                    <option value="">Head Office / Unassigned</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Mobile / Phone */}
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                  {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                </div>

                {/* Salary */}
                <div className="form-group">
                  <label className="form-label">Monthly Salary (₹)</label>
                  <div className="input-icon-wrapper">
                    <IndianRupee size={14} className="input-icon" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                      type="number"
                      className={`form-input input-with-icon ${formErrors.salary ? 'input-error' : ''}`}
                      placeholder="e.g. 25000"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                  {formErrors.salary && <span className="form-error">{formErrors.salary}</span>}
                </div>
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                  placeholder="name@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </div>

              {/* Date Joined & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                <div className="form-group">
                  <label className="form-label">Joined Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.joined_at}
                    onChange={(e) => setFormData({ ...formData, joined_at: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      style={{
                        width: '18px', height: '18px', accentColor: 'var(--gold-primary)',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Active Status</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-gold"
                  disabled={isPending}
                  id="save-employee-submit-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isPending && <Loader2 size={16} className="spin" />}
                  <span>{editingEmployee ? 'Update Details' : 'Add Employee'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CSS Helper overrides for modal styling */}
      <style jsx>{`
        .btn-danger-hover:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          border-color: #ef4444 !important;
          color: #ef4444 !important;
        }
        .close-modal-btn:hover {
          color: var(--text-primary) !important;
        }
      `}</style>

    </div>
  );
}
