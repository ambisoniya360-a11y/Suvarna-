'use client';

import { useState, useTransition } from 'react';
import { getReportData, type ReportData } from '@/actions/report-actions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportLoansToExcel } from '@/lib/excel-export';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { Download, FileText, RefreshCw, TrendingUp, Users, Wallet, Scale } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  initialData: ReportData | null;
  defaultFrom: string;
  defaultTo: string;
}

const GOLD_TOOLTIP_STYLE = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-light)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
};

export default function ReportsClient({ initialData, defaultFrom, defaultTo }: Props) {
  const [data, setData] = useState<ReportData | null>(initialData);
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(defaultTo);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const result = await getReportData(dateFrom, dateTo);
      if (result.error) {
        toast.error(result.error);
      } else {
        setData(result.data ?? null);
        toast.success('Report updated');
      }
    });
  };

  const handleExportExcel = () => {
    if (!data) return;
    toast.success('Exporting to Excel…');
    // Export overdue loans as sample
    exportLoansToExcel(
      data.overdue_loans.map((l) => ({
        loan_number: l.loan_number,
        customer_name: l.customer_name,
        mobile: '',
        loan_amount: l.loan_amount,
        interest_rate: 0,
        loan_date: l.loan_date,
        status: 'Overdue',
      }))
    );
  };

  const summaryStats = data
    ? [
        { label: 'Total Loans', value: data.loans.total, icon: Wallet, color: '#D4AF37' },
        { label: 'Active Loans', value: data.loans.active, icon: TrendingUp, color: '#00D26A' },
        { label: 'Overdue Loans', value: data.loans.overdue, icon: Wallet, color: '#FF4D4F' },
        { label: 'Total Disbursed', value: formatCurrency(data.loans.total_disbursed, { compact: true }), icon: TrendingUp, color: '#8B5CF6' },
        { label: 'Outstanding', value: formatCurrency(data.loans.total_outstanding, { compact: true }), icon: Scale, color: '#F59E0B' },
        { label: 'Collections', value: formatCurrency(data.payments.total_amount, { compact: true }), icon: Users, color: '#3B82F6' },
      ]
    : [];

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Business performance insights</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportExcel} disabled={!data} id="export-excel-btn">
            <Download size={16} /> Excel
          </button>
          <button className="btn btn-ghost btn-sm" disabled id="export-pdf-btn">
            <FileText size={16} /> PDF (coming soon)
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
          <label className="form-label">From Date</label>
          <input
            id="report-date-from"
            type="date"
            className="form-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
          <label className="form-label">To Date</label>
          <input
            id="report-date-to"
            type="date"
            className="form-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['This Month', 'Last Month', 'Last 3 Months'].map((label, i) => {
            const now = new Date();
            const setRange = () => {
              if (i === 0) {
                setDateFrom(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
                setDateTo(now.toISOString().split('T')[0]);
              } else if (i === 1) {
                const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                setDateFrom(last.toISOString().split('T')[0]);
                setDateTo(lastEnd.toISOString().split('T')[0]);
              } else {
                const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                setDateFrom(start.toISOString().split('T')[0]);
                setDateTo(now.toISOString().split('T')[0]);
              }
            };
            return (
              <button key={label} type="button" className="btn btn-outline btn-sm" onClick={setRange} id={`preset-${i}`}>
                {label}
              </button>
            );
          })}
        </div>
        <button
          className="btn btn-gold btn-sm"
          onClick={refresh}
          disabled={isPending}
          id="refresh-report-btn"
        >
          <RefreshCw size={16} className={isPending ? 'spin' : ''} />
          <span>Generate</span>
        </button>
      </div>

      {!data ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>
          Select a date range and click Generate to view reports.
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            {summaryStats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: `${stat.color}14`, border: `1px solid ${stat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Disbursements Chart */}
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                Monthly Disbursements
              </h3>
              {data.monthly_disbursements.length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>No data in range</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.monthly_disbursements}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={GOLD_TOOLTIP_STYLE}
                      formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Disbursed']}
                    />
                    <Bar dataKey="amount" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Collections Chart */}
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                Monthly Collections
              </h3>
              {data.monthly_collections.length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>No data in range</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.monthly_collections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={GOLD_TOOLTIP_STYLE}
                      formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Collected']}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#00D26A" strokeWidth={2} dot={{ fill: '#00D26A' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Collections by Payment Method
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {Object.entries(data.payments.by_method).length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>No payment data</p>
              ) : (
                Object.entries(data.payments.by_method).map(([method, amount]) => (
                  <div key={method} style={{
                    flex: 1, minWidth: '120px',
                    padding: '1rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.375rem' }}>{method}</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(amount as number, { compact: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue Loans Table */}
          {data.overdue_loans.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--color-error)' }}>
                ⚠ Overdue Loans ({data.overdue_loans.length})
              </h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Loan #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Loan Date</th>
                      <th>Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.overdue_loans.map((loan) => (
                      <tr key={loan.loan_number}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-error)' }}>
                            {loan.loan_number}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{loan.customer_name}</td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {formatCurrency(loan.loan_amount)}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {formatDate(loan.loan_date)}
                        </td>
                        <td>
                          <span className="badge badge-overdue">
                            {loan.days_overdue}d overdue
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
