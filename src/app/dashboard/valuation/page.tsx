'use client';

import { useState } from 'react';
import { calculateGoldValue, calculateMaxLoanAmount, getPurityPercentage, formatCurrency } from '@/lib/utils';
import { Scale, Calculator, TrendingUp } from 'lucide-react';

const PURITY_OPTIONS = ['24K', '22K', '916', '18K', '750', '14K', '585'];

export default function ValuationPage() {
  const [weight, setWeight] = useState('');
  const [purity, setPurity] = useState('22K');
  const [rate, setRate] = useState('');
  const [ltvPercent, setLtvPercent] = useState('75');

  const netWeight = parseFloat(weight) || 0;
  const goldRate = parseFloat(rate) || 0;
  const ltv = parseFloat(ltvPercent) || 75;
  const purityPct = getPurityPercentage(purity);

  const goldValue = calculateGoldValue(netWeight, purityPct, goldRate);
  const maxLoan = calculateMaxLoanAmount(goldValue, ltv);
  const purityGrams = (netWeight * purityPct) / 100;

  const isValid = netWeight > 0 && goldRate > 0;

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gold Valuation</h1>
          <p className="page-subtitle">Calculate gold value and maximum loan amount</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Calculator Input */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} style={{ color: 'var(--gold-primary)' }} />
            </div>
            <h3 style={{ fontWeight: 600 }}>Valuation Calculator</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Net Gold Weight (grams)</label>
              <input
                id="gold-weight"
                type="number"
                className="form-input"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 10.500"
                step="0.001"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gold Purity</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {PURITY_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPurity(p)}
                    id={`purity-${p}`}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${purity === p ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                      background: purity === p ? 'var(--gold-subtle)' : 'var(--bg-card)',
                      color: purity === p ? 'var(--gold-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
                {purityPct}% pure gold
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Gold Market Rate (₹ per gram)</label>
              <input
                id="gold-rate"
                type="number"
                className="form-input"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g., 6500"
                step="1"
                min="0"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
                Current 22K gold rate: ~₹5,800–6,500/g (update manually)
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">LTV (Loan-to-Value) %</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['60', '70', '75', '80'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setLtvPercent(v)}
                    id={`ltv-${v}`}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${ltvPercent === v ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                      background: ltvPercent === v ? 'var(--gold-subtle)' : 'var(--bg-card)',
                      color: ltvPercent === v ? 'var(--gold-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Gold Value */}
          <div className={`card ${isValid ? 'card-gold' : ''}`} style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Scale size={20} style={{ color: 'var(--gold-primary)' }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pure Gold Weight</p>
            </div>
            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
              {isValid ? `${purityGrams.toFixed(3)}g` : '—'}
            </p>
            <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: '0.375rem' }}>
              {netWeight}g × {purityPct}% purity
            </p>
          </div>

          <div className={`card ${isValid ? 'card-gold' : ''}`} style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--gold-primary)' }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Estimated Gold Value</p>
            </div>
            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
              {isValid ? formatCurrency(goldValue) : '—'}
            </p>
            <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: '0.375rem' }}>
              {purityGrams.toFixed(3)}g × ₹{goldRate}/g
            </p>
          </div>

          {/* Max Loan */}
          <div style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-xl)',
            background: isValid ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(200,155,60,0.06) 100%)' : 'var(--bg-card)',
            border: isValid ? '1px solid var(--gold-border-strong)' : '1px solid var(--border-subtle)',
            boxShadow: isValid ? 'var(--shadow-gold)' : 'none',
            transition: 'all 0.3s ease',
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.75rem' }}>
              Maximum Loan Amount ({ltv}% LTV)
            </p>
            <p style={{
              fontSize: '2.75rem', fontWeight: 800,
              color: isValid ? 'var(--gold-primary)' : 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.03em',
            }}>
              {isValid ? formatCurrency(maxLoan) : '₹ —'}
            </p>
            {isValid && (
              <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                {formatCurrency(goldValue)} × {ltv}% LTV
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
