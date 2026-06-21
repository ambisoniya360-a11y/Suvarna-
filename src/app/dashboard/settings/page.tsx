'use client';

import { useState } from 'react';
import { Settings, Bell, Shield, Building, Palette } from 'lucide-react';
import { toast } from 'sonner';

const tabs = [
  { id: 'shop', label: 'Shop Profile', icon: Building },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('shop');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Settings saved successfully');
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
    </div>
  );
}
