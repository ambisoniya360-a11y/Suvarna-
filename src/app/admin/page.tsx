'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, Building, Users, Calendar, Coins, Plus, 
  Search, Sliders, RefreshCw, CheckCircle2, AlertTriangle, 
  XCircle, Edit, ExternalLink, ChevronDown, CheckCircle, 
  Clock, CreditCard, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { 
  fetchActiveShops, 
  fetchPendingRequests, 
  approveRequestAction, 
  rejectRequestAction,
  extendSubscriptionAction,
  changePlanAction,
  toggleShopStatusAction
} from './actions';

export default function SuperAdminConsole() {
  const [shops, setShops] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'active' | 'pending'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | 'Professional' | 'Enterprise'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newPlan, setNewPlan] = useState<'Professional' | 'Enterprise'>('Professional');
  const [newDays, setNewDays] = useState(365);
  const [generatedCreds, setGeneratedCreds] = useState<{username: string, pass: string} | null>(null);

  // Load live data from database on mount
  useEffect(() => {
    async function loadData() {
      try {
        const active = await fetchActiveShops();
        const pending = await fetchPendingRequests();
        setShops(active);
        setRequests(pending);
      } catch (err) {
        console.error('Failed to load database data:', err);
        toast.error('Failed to retrieve live data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Approve Request Handler (Live)
  const handleApproveRequest = async (reqId: string) => {
    toast.loading('Processing approval & creating tenant auth account...');
    try {
      const res = await approveRequestAction(reqId);
      toast.dismiss();
      if (res.success && res.credentials) {
        // Refresh list from live DB
        const active = await fetchActiveShops();
        const pending = await fetchPendingRequests();
        setShops(active);
        setRequests(pending);
        
        // Show generated credentials modal
        setGeneratedCreds(res.credentials);
        setShowAddModal(true);
        toast.success(`Access approved!`);
      } else {
        toast.error(res.error || 'Failed to approve request.');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'An error occurred during approval.');
    }
  };

  // Reject Request Handler (Live)
  const handleRejectRequest = async (reqId: string) => {
    toast.loading('Rejecting request...');
    try {
      const res = await rejectRequestAction(reqId);
      toast.dismiss();
      if (res.success) {
        // Refresh list from live DB
        const pending = await fetchPendingRequests();
        setRequests(pending);
        toast.info('Access request denied.');
      } else {
        toast.error(res.error || 'Failed to reject request.');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'An error occurred during rejection.');
    }
  };

  // Extend Subscription Modal / Action (Live)
  const handleExtendSubscription = async (shopId: string, days: number) => {
    toast.loading('Extending subscription...');
    try {
      const res = await extendSubscriptionAction(shopId, days);
      toast.dismiss();
      if (res.success) {
        setShops(prev => prev.map(shop => {
          if (shop.id === shopId) {
            const nextDays = Math.max(0, shop.daysLeft) + days;
            toast.success(`Subscription extended. ${shop.shopName} now has ${nextDays} days remaining.`);
            return { ...shop, daysLeft: nextDays };
          }
          return shop;
        }));
      } else {
        toast.error('Failed to extend subscription.');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error extending subscription.');
    }
  };

  // Change Plan Action (Live)
  const handleUpgradeDowngrade = async (shopId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'Professional' ? 'Enterprise' : 'Professional';
    toast.loading('Updating plan...');
    try {
      const res = await changePlanAction(shopId, newPlan);
      toast.dismiss();
      if (res.success) {
        setShops(prev => prev.map(shop => {
          if (shop.id === shopId) {
            const nextLimit = newPlan === 'Enterprise' ? 'Unlimited' : 2000;
            toast.success(`Plan for ${shop.shopName} changed to ${newPlan}`);
            return { ...shop, plan: newPlan, customersLimit: nextLimit };
          }
          return shop;
        }));
      } else {
        toast.error('Failed to update plan.');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error updating plan.');
    }
  };

  // Toggle Shop Active/Suspend (Live)
  const handleToggleStatus = async (shopId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    toast.loading('Updating status...');
    try {
      const res = await toggleShopStatusAction(shopId, nextStatus);
      toast.dismiss();
      if (res.success) {
        setShops(prev => prev.map(shop => {
          if (shop.id === shopId) {
            toast.info(`${shop.shopName} has been ${nextStatus.toLowerCase()}`);
            return { ...shop, status: nextStatus };
          }
          return shop;
        }));
      } else {
        toast.error('Failed to update status.');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error updating status.');
    }
  };

  // Handle Register Form Submission (Manual onboarding - Live)
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName || !newOwnerName || !newEmail || !newMobile) {
      toast.error('All fields are required');
      return;
    }

    toast.loading('Creating onboarding request...');
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('registration_requests')
        .insert({
          shop_name: newShopName,
          owner_name: newOwnerName,
          email: newEmail,
          mobile: newMobile,
          plan: newPlan,
          days: newDays,
          status: 'Pending'
        })
        .select()
        .single();

      toast.dismiss();
      if (error || !data) {
        toast.error(error?.message || 'Failed to submit registration request.');
        return;
      }

      toast.success('Registration request added! Running automatic approval...');
      await handleApproveRequest(data.id);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error occurred during manual onboarding.');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewShopName('');
    setNewOwnerName('');
    setNewEmail('');
    setNewMobile('');
    setNewPlan('Professional');
    setNewDays(365);
    setGeneratedCreds(null);
  };

  // Filter Logic
  const filteredShops = shops.filter(shop => {
    const matchesSearch = 
      shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = planFilter === 'All' || shop.plan === planFilter;
    const matchesStatus = statusFilter === 'All' || shop.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="dashboard-content">
      
      {/* ─── TITLE & ONBOARD BUTTON ──────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', borderRadius: '100px', padding: '0.25rem 0.75rem', marginBottom: '0.75rem' }}>
            <Shield size={12} style={{ color: 'var(--gold-primary)' }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--gold-primary)', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}>
              System Controller Page
            </span>
          </div>
          <h1 className="page-title">SuperAdmin Tenant Monitor</h1>
          <p className="page-subtitle">Inspect registered shop owners, monitor customer database quotas, and configure plan terms</p>
        </div>

        <button className="btn btn-gold btn-lg" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Register New Shop Owner</span>
        </button>
      </div>

      {/* ─── TOP LEVEL METRICS ───────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        
        {/* Card 1 */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted" style={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Total Shop Owners</span>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--gold-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={16} color="var(--gold-primary)" />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{shops.length}</span>
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>businesses</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <CheckCircle size={10} /> Active instances synced
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted" style={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>System Customers Stored</span>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="var(--color-info)" />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {shops.reduce((sum, s) => sum + s.customersCount, 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Stored securely across multi-tenant database
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted" style={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Sub-Limit Alerts</span>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="var(--color-warning)" />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {shops.filter(s => s.daysLeft <= 14 && s.daysLeft > 0).length}
              </span>
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>near expiration</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              Requires billing renewal
            </p>
          </div>
        </div>

      </div>

      {/* ─── SEGMENTED SUB-TAB CONTROL ────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button 
          className={`tab ${subTab === 'active' ? 'active' : ''}`}
          onClick={() => setSubTab('active')}
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <Building size={16} />
          <span>Active Shop Owners ({shops.length})</span>
        </button>
        
        <button 
          className={`tab ${subTab === 'pending' ? 'active' : ''}`}
          onClick={() => setSubTab('pending')}
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <Clock size={16} />
          <span>Pending Access Requests ({requests.length})</span>
          {requests.length > 0 && (
            <span style={{ 
              background: 'var(--gold-primary)', 
              color: '#050505', 
              borderRadius: 'var(--radius-full)', 
              padding: '0.125rem 0.5rem', 
              fontSize: '0.6875rem', 
              fontWeight: 800 
            }}>
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: ACTIVE DIRECTORY ───────────────────── */}
      {subTab === 'active' && (
        <>
          {/* Filters & Search */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-primary)' }}>
              <Filter size={16} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter & Search Shop Directory</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Search by shop name, owner, or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="form-group">
                <select className="form-select" value={planFilter} onChange={e => setPlanFilter(e.target.value as any)}>
                  <option value="All">All Plans</option>
                  <option value="Professional">Professional Plan (₹9,999/yr)</option>
                  <option value="Enterprise">Enterprise Plan (₹24,999/yr)</option>
                </select>
              </div>

              <div className="form-group">
                <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Tenants</option>
                  <option value="Suspended">Suspended Tenants</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shop Owners List Table */}
          <div className="table-container card" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Shop Profile</th>
                  <th>Owner Details</th>
                  <th>Plan Purchased</th>
                  <th>Days Left</th>
                  <th>Stored Customers</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Management Options</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop) => {
                  const isLowSubscription = shop.daysLeft <= 14 && shop.status === 'Active';
                  const isExpired = shop.daysLeft === 0;
                  const isUnlimited = shop.customersLimit === 'Unlimited';
                  const custPercent = isUnlimited 
                    ? 0 
                    : Math.min(100, Math.round((shop.customersCount / (shop.customersLimit as number)) * 100));

                  return (
                    <tr key={shop.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{shop.shopName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Joined: {shop.joinedDate}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{shop.ownerName}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{shop.email}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{shop.mobile}</div>
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ fontWeight: 700 }}>
                          {shop.plan}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                          {shop.plan === 'Enterprise' ? '₹24,999 / year' : '₹9,999 / year'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {isExpired ? (
                            <span style={{ color: 'var(--color-error)', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <XCircle size={14} /> Expired (0 Days)
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <Clock size={14} style={{ color: isLowSubscription ? 'var(--color-warning)' : 'var(--color-success)' }} />
                              <span style={{ fontWeight: 700, color: isLowSubscription ? 'var(--color-warning)' : 'var(--text-primary)' }}>
                                {shop.daysLeft} Days remaining
                              </span>
                            </div>
                          )}
                          <div className="progress" style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${Math.min(100, (shop.daysLeft / 365) * 100)}%`,
                                background: isExpired ? 'var(--color-error)' : isLowSubscription ? 'var(--color-warning)' : 'var(--color-success)' 
                              }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                            {shop.customersCount.toLocaleString('en-IN')} 
                            <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}> / {shop.customersLimit}</span>
                          </div>
                          {!isUnlimited && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="progress" style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ 
                                    width: `${custPercent}%`,
                                    background: custPercent >= 90 ? 'var(--color-error)' : 'var(--gold-primary)' 
                                  }} 
                                />
                              </div>
                              <span style={{ fontSize: '0.75rem', color: custPercent >= 90 ? 'var(--color-error)' : 'var(--text-tertiary)', fontWeight: 600 }}>{custPercent}%</span>
                            </div>
                          )}
                          {isUnlimited && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>No quota cap</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${shop.status === 'Active' ? 'badge-active' : 'badge-overdue'}`}>
                          {shop.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleExtendSubscription(shop.id, 30)}>+30 Days</button>
                          <button className="btn btn-outline btn-sm" style={{ border: '1px solid var(--gold-border)' }} onClick={() => handleUpgradeDowngrade(shop.id, shop.plan)}>Change Plan</button>
                          <button className={`btn btn-sm ${shop.status === 'Active' ? 'btn-danger' : 'btn-gold'}`} onClick={() => handleToggleStatus(shop.id, shop.status)}>
                            {shop.status === 'Active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── TAB 2: PENDING APPROVAL REQUESTS ─────────── */}
      {subTab === 'pending' && (
        <div className="table-container card" style={{ padding: 0 }}>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <CheckCircle2 size={40} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>All Requests Evaluated</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>No pending shop owner onboarding requests found.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Requested Shop</th>
                  <th>Shop Owner Name</th>
                  <th>Contact Info</th>
                  <th>Requested Plan</th>
                  <th>Prepaid Term</th>
                  <th>Request Date</th>
                  <th style={{ textAlign: 'right' }}>Review Controls</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{req.shopName}</div>
                      <span className="badge badge-gold" style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>Awaiting Approval</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{req.ownerName}</td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{req.email}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{req.mobile}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>{req.plan}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{req.plan === 'Enterprise' ? '₹24,999/yr' : '₹9,999/yr'}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{req.days} Days</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{req.requestedDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRejectRequest(req.id)}>Deny</button>
                        <button className="btn btn-gold btn-sm" onClick={() => handleApproveRequest(req.id)}>
                          <span>Approve & Grant Login</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── ONBOARDING MODAL ───────────────────────── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)' }}>Onboard New Shop Owner</h3>
              <button className="btn btn-ghost btn-sm" onClick={handleCloseModal} style={{ padding: 4 }}>×</button>
            </div>
            
            <form onSubmit={handleCreateTenant}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {generatedCreds ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <CheckCircle2 size={36} color="var(--gold-primary)" style={{ alignSelf: 'center' }} />
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>Tenant Credentials Generated!</h4>
                      <p className="text-muted" style={{ fontSize: '0.8125rem' }}>Share these credentials with the shop owner to allow dashboard login</p>
                    </div>
                    <div className="divider-gold" style={{ margin: '0.5rem 0' }} />
                    <div style={{ textAlign: 'left', background: 'rgba(5,5,5,0.4)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated Admin Username:</span>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)', marginTop: '0.125rem' }}>{generatedCreds.username}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temporary Password:</span>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)', marginTop: '0.125rem' }}>{generatedCreds.pass}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>⚠️ Shop Owner will be prompted to update this temporary password upon first login.</span>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Shop / Company Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Kalyan Gold Syndicate"
                        value={newShopName}
                        onChange={e => setNewShopName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Shop Owner Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Rajesh Kalyan"
                        value={newOwnerName}
                        onChange={e => setNewOwnerName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        placeholder="owner@company.com"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mobile Contact Number</label>
                      <input 
                        type="tel" 
                        className="form-input" 
                        placeholder="+91 99999 99999"
                        value={newMobile}
                        onChange={e => setNewMobile(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Initial Subscription</label>
                        <select className="form-select" value={newPlan} onChange={e => setNewPlan(e.target.value as any)}>
                          <option value="Professional">Professional (₹9,999/yr)</option>
                          <option value="Enterprise">Enterprise (₹24,999/yr)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Subscription Terms</label>
                        <select className="form-select" value={newDays} onChange={e => setNewDays(Number(e.target.value))}>
                          <option value={30}>1 Month Trial (30 Days)</option>
                          <option value={365}>1 Year Prepaid (365 Days)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

              </div>
              <div className="modal-footer">
                {generatedCreds ? (
                  <button type="button" className="btn btn-gold" onClick={handleCloseModal}>
                    <span>Complete Registration</span>
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className="btn btn-gold">
                      <span>Generate Tenant Account</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
