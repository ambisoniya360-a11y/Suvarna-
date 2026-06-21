'use client';

import { useState } from 'react';
import { recordPayment } from '@/actions/payment-actions';
import { toast } from 'sonner';
import { CreditCard, Loader2 } from 'lucide-react';
import type { PaymentType, PaymentMethod } from '@/types';

interface Props {
  loanId: string;
  loanNumber: string;
}

const PAYMENT_TYPES: PaymentType[] = ['Interest Payment', 'Partial Payment', 'Full Settlement'];
const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'UPI', 'NEFT', 'RTGS', 'Cheque', 'Card'];

export default function RecordPaymentModal({ loanId, loanNumber }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    payment_type: 'Interest Payment' as PaymentType,
    payment_method: 'Cash' as PaymentMethod,
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const result = await recordPayment({
        loan_id: loanId,
        amount: parseFloat(form.amount),
        payment_type: form.payment_type,
        payment_method: form.payment_method,
        payment_date: form.payment_date,
        notes: form.notes || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message ?? 'Payment recorded!');
        setOpen(false);
        setForm({ amount: '', payment_type: 'Interest Payment', payment_method: 'Cash', payment_date: new Date().toISOString().split('T')[0], notes: '' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-gold"
        onClick={() => setOpen(true)}
        id="record-payment-btn"
      >
        <CreditCard size={18} /> <span>Record Payment</span>
      </button>

      {open && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3 style={{ fontWeight: 700 }}>Record Payment</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Loan {loanNumber}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="btn btn-ghost btn-sm"
                id="close-payment-modal"
                style={{ fontSize: '1.25rem', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input
                    id="payment-amount"
                    type="number"
                    className="form-input"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="Enter amount"
                    step="0.01"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Type *</label>
                  <select
                    id="payment-type"
                    className="form-select"
                    value={form.payment_type}
                    onChange={(e) => setForm((f) => ({ ...f, payment_type: e.target.value as PaymentType }))}
                  >
                    {PAYMENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        id={`method-${m.toLowerCase()}`}
                        onClick={() => setForm((f) => ({ ...f, payment_method: m }))}
                        style={{
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${form.payment_method === m ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                          background: form.payment_method === m ? 'var(--gold-subtle)' : 'var(--bg-card)',
                          color: form.payment_method === m ? 'var(--gold-primary)' : 'var(--text-secondary)',
                          fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input
                    id="payment-date"
                    type="date"
                    className="form-input"
                    value={form.payment_date}
                    onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    id="payment-notes"
                    className="form-textarea"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional notes"
                    rows={2}
                  />
                </div>

                {form.payment_type === 'Full Settlement' && (
                  <div className="alert alert-warning">
                    ⚠ Full Settlement will automatically close this loan.
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setOpen(false)}
                  id="cancel-payment-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={loading}
                  id="submit-payment-btn"
                >
                  {loading ? (
                    <><Loader2 size={16} className="spin" /> Recording…</>
                  ) : (
                    <span>Record Payment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
