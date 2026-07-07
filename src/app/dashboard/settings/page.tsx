'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Building, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getBillingStatus, createRenewalOrder, confirmRenewalPayment } from '@/actions/billing-actions';

const tabs = [
  { id: 'shop', label: 'Shop Profile', icon: Building },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('shop');
  const [saving, setSaving] = useState(false);

  // Billing state
  const [billingData, setBillingData] = useState<{
    shop: any;
    history: any[];
    role: string;
  } | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [renewForm, setRenewForm] = useState({
    plan: 'Professional',
    billingCycle: 'yearly',
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load billing details
  const fetchBilling = async () => {
    setLoadingBilling(true);
    setBillingError(null);
    try {
      const res = await getBillingStatus();
      if (res.error) {
        setBillingError(res.error);
      } else if (res.data) {
        setBillingData(res.data);
      }
    } catch (err: any) {
      setBillingError(err.message || 'Failed to load billing details.');
    } finally {
      setLoadingBilling(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  // Detect URL parameter for tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'billing' || tabParam === 'shop' || tabParam === 'notifications' || tabParam === 'security') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  // Load Razorpay Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRenew = async () => {
    setProcessingPayment(true);
    try {
      // 1. Create order
      const orderRes = await createRenewalOrder(renewForm.plan, renewForm.billingCycle);
      if (orderRes.error || !orderRes.data) {
        toast.error(orderRes.error || 'Failed to create renewal order.');
        return;
      }

      const orderData = orderRes.data;

      // 2. Handle mock mode or real mode
      if (orderData.mockMode) {
        toast.loading('Processing Mock Payment...');
        await new Promise((r) => setTimeout(r, 1500));

        const confirmRes = await confirmRenewalPayment({
          paymentId: 'mock_renew_pay_' + Math.random().toString(36).substr(2, 9),
          orderId: orderData.orderId,
          signature: 'mock_renew_sig_' + Math.random().toString(36).substr(2, 9),
          plan: renewForm.plan,
          billingCycle: renewForm.billingCycle,
          mockMode: true,
        });

        toast.dismiss();
        if (confirmRes.error) {
          toast.error(confirmRes.error);
        } else {
          toast.success(confirmRes.message || 'Subscription successfully renewed!');
          fetchBilling();
        }
      } else {
        // Real Razorpay integration
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load. Please check your internet connection.');
          return;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'SuvarnaLoan ERP',
          description: `${renewForm.plan} Plan Renewal - ${renewForm.billingCycle}`,
          image: '/favicon.ico',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              setProcessingPayment(true);
              const confirmRes = await confirmRenewalPayment({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                plan: renewForm.plan,
                billingCycle: renewForm.billingCycle,
                mockMode: false,
              });

              if (confirmRes.error) {
                toast.error(confirmRes.error);
              } else {
                toast.success(confirmRes.message || 'Subscription successfully renewed!');
                fetchBilling();
              }
            } catch (err: any) {
              toast.error(err.message || 'An error occurred during account confirmation.');
            } finally {
              setProcessingPayment(false);
            }
          },
          prefill: {
            name: billingData?.shop?.owner_name || '',
            email: billingData?.shop?.email || '',
            contact: billingData?.shop?.mobile || '',
          },
          theme: {
            color: '#D4AF37',
          },
          modal: {
            ondismiss: function () {
              setProcessingPayment(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment execution failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="dashboard-content" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your shop profile and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            id={`settings-tab-${id}`}
          >
            <Icon size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />
            {label}
          </button>
        ))}
      </div>

      {/* Shop Profile */}
      {activeTab === 'shop' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gold-primary)' }}>Shop Profile</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input id="shop-name" className="form-input" placeholder="Your Jewellers" />
            </div>
            <div className="form-group">
              <label className="form-label">Owner Name</label>
              <input id="owner-name" className="form-input" placeholder="Full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Mobile</label>
              <input id="shop-mobile" className="form-input" type="tel" placeholder="10-digit mobile" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input id="shop-email" className="form-input" type="email" placeholder="email@shop.com" />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input id="shop-gstin" className="form-input" placeholder="22AAAAA0000A1Z5" />
            </div>
            <div className="form-group">
              <label className="form-label">License Number</label>
              <input id="shop-license" className="form-input" placeholder="Pawnbroker license" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Address</label>
              <textarea id="shop-address" className="form-textarea" placeholder="Shop address" rows={2} />
            </div>
          </div>

          <div className="divider-gold" />

          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gold-primary)' }}>Loan Defaults</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Default Interest Rate (%/mo)</label>
              <input id="default-interest" className="form-input" type="number" placeholder="3.00" step="0.25" />
            </div>
            <div className="form-group">
              <label className="form-label">Default LTV (%)</label>
              <input id="default-ltv" className="form-input" type="number" placeholder="75" />
            </div>
            <div className="form-group">
              <label className="form-label">Loan Tenure (months)</label>
              <input id="default-tenure" className="form-input" type="number" placeholder="12" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
            <button
              className="btn btn-gold"
              onClick={handleSave}
              disabled={saving}
              id="save-shop-settings-btn"
            >
              {saving ? 'Saving…' : <span>Save Changes</span>}
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gold-primary)' }}>Notification Settings</h3>

          {[
            { id: 'whatsapp', label: 'WhatsApp Alerts', desc: 'Send payment reminders via WhatsApp' },
            { id: 'sms', label: 'SMS Alerts', desc: 'Send payment reminders via SMS' },
            { id: 'email', label: 'Email Notifications', desc: 'Send loan statements via email' },
            { id: 'overdue', label: 'Overdue Alerts', desc: 'Automatic alerts for overdue loans' },
          ].map(({ id, label, desc }) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{label}</p>
                <p className="text-muted" style={{ fontSize: '0.8125rem' }}>{desc}</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }} id={`toggle-${id}`}>
                <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                <div style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: 'var(--gold-primary)',
                  position: 'relative', transition: 'background 0.2s',
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: 23,
                    width: 18, height: 18, borderRadius: 9,
                    background: 'white', transition: 'left 0.2s',
                  }} />
                </div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gold-primary)' }}>Security Settings</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input id="current-password" className="form-input" type="password" placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input id="new-password" className="form-input" type="password" placeholder="Min. 8 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input id="confirm-password" className="form-input" type="password" placeholder="Re-enter new password" />
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Two-Factor Authentication</p>
                <p className="text-muted" style={{ fontSize: '0.8125rem' }}>Add extra security to your account</p>
              </div>
              <button className="btn btn-outline btn-sm" id="enable-2fa-btn">Enable 2FA</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-gold" onClick={handleSave} disabled={saving} id="save-security-btn">
              {saving ? 'Updating…' : <span>Update Password</span>}
            </button>
          </div>
        </div>
      )}

      {/* Billing & Subscription */}
      {activeTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Info Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gold-primary)', marginBottom: '1.25rem' }}>
              Subscription Details
            </h3>

            {loadingBilling ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.5rem' }}>
                <Loader2 size={20} className="spin" />
                <span>Loading subscription info...</span>
              </div>
            ) : billingError ? (
              <div className="alert alert-error">
                <span>{billingError}</span>
              </div>
            ) : billingData?.shop ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Current Plan</span>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 700, fontSize: '1.125rem', color: 'var(--gold-primary)' }}>
                      {billingData.shop.plan}
                    </p>
                  </div>
                  <div style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Status</span>
                    <p style={{
                      margin: '4px 0 0 0', fontWeight: 700, fontSize: '1.125rem',
                      color: billingData.shop.status === 'Active' && new Date(billingData.shop.subscription_end) > new Date()
                        ? 'var(--color-success)'
                        : '#ef4444'
                    }}>
                      {billingData.shop.status === 'Active' && new Date(billingData.shop.subscription_end) > new Date() ? 'Active' : 'Expired'}
                    </p>
                  </div>
                  <div style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Expiry Date</span>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 700, fontSize: '1.125rem' }}>
                      {billingData.shop.subscription_end ? new Date(billingData.shop.subscription_end).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Expiry Warning Indicator inside Settings */}
                {(() => {
                  const subEnd = billingData?.shop?.subscription_end;
                  const daysLeft = subEnd ? Math.ceil((new Date(subEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                  
                  if (daysLeft <= 0) {
                    return (
                      <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                        <span>Your store subscription has expired. Please choose a plan below to renew and unlock all dashboard services.</span>
                      </div>
                    );
                  } else if (daysLeft <= 7) {
                    return (
                      <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                        <span>Your store subscription expires in <strong>{daysLeft} days</strong>. Renew early to prevent layout locks.</span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Renew checkout panel (Only for Shop Owners) */}
                {billingData.role === 'Shop Owner' ? (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Renew or Upgrade Plan
                    </h4>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                        <label className="form-label">Choose Plan</label>
                        <select
                          className="form-select"
                          value={renewForm.plan}
                          onChange={(e) => setRenewForm((f) => ({ ...f, plan: e.target.value }))}
                        >
                          <option value="Professional">Professional (₹999/mo)</option>
                          <option value="Enterprise">Enterprise (₹2,499/mo)</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                        <label className="form-label">Billing Cycle</label>
                        <select
                          className="form-select"
                          value={renewForm.billingCycle}
                          onChange={(e) => setRenewForm((f) => ({ ...f, billingCycle: e.target.value }))}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">
                            Yearly (Save 17% - {renewForm.plan === 'Enterprise' ? '₹24,999/yr' : '₹9,999/yr'})
                          </option>
                        </select>
                      </div>

                      <button
                        className="btn btn-gold"
                        style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleRenew}
                        disabled={processingPayment}
                        id="renew-checkout-btn"
                      >
                        {processingPayment ? (
                          <><Loader2 size={16} className="spin" /> Processing...</>
                        ) : (
                          <span>Pay &amp; Activate</span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    ℹ Only the <strong>Shop Owner</strong> can upgrade or renew subscription plans.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Payments Transaction History */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Billing Transactions History
            </h3>

            {!billingData?.history || billingData.history.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem', padding: '1rem 0' }}>
                No past transactions found.
              </p>
            ) : (
              <div className="table-container">
                <table className="table" style={{ fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Payment ID</th>
                      <th>Plan</th>
                      <th>Billing Cycle</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingData.history.map((h) => (
                      <tr key={h.id}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{h.razorpay_order_id}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{h.razorpay_payment_id}</td>
                        <td style={{ fontWeight: 600 }}>{h.plan}</td>
                        <td>{h.amount > 30000 ? 'Yearly' : 'Monthly'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹{h.amount.toLocaleString('en-IN')}</td>
                        <td>{new Date(h.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className="badge badge-active" style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', borderColor: 'rgba(16,185,129,0.2)' }}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

<style jsx>{`
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`}</style>
