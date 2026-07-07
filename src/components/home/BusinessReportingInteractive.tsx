'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, FileSpreadsheet, Download, CheckCircle2, Loader2, ArrowUpRight, Shield, ShieldCheck, RefreshCw } from 'lucide-react';

type TabType = 'portfolio' | 'revenue' | 'vault';

export default function BusinessReportingInteractive() {
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Auto-rotate tabs slowly to make the page feel alive if the user doesn't interact,
  // but pause if they interact.
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  useEffect(() => {
    if (isUserInteracted) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'portfolio') return 'revenue';
        if (prev === 'revenue') return 'vault';
        return 'portfolio';
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isUserInteracted]);

  const handleTabChange = (tab: TabType) => {
    setIsUserInteracted(true);
    setActiveTab(tab);
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    setIsUserInteracted(true);
    setIsExporting(true);
    setExportType(type);
    setExportSuccess(false);

    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setSuccessMessage(
        type === 'pdf'
          ? 'Successfully generated PDF: suvarna_portfolio_report_jun2026.pdf'
          : 'Successfully generated Excel: suvarna_ledger_jun2026.xlsx'
      );

      // Auto-hide success toast after 4 seconds
      setTimeout(() => {
        setExportSuccess(false);
      }, 4000);
    }, 1500);
  };

  return (
    <div className="workflow-step-card workflow-step-card-special" style={{ padding: 0, overflow: 'visible' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Step Header */}
        <div style={{ display: 'flex', gap: '2rem', padding: '2rem 2rem 1.5rem 2rem' }}>
          <div className="workflow-step-badge workflow-step-badge-special">
            07
          </div>
          <div className="workflow-step-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>Business Reporting & Analytics</h3>
              <span style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--gold-primary)',
                fontSize: '0.7rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '100px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Interactive Demo
              </span>
            </div>
            <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              Consolidate all loan logs, track interest margins, monitor branch health, and export audited statements instantly.
            </p>
          </div>
        </div>

        {/* Dashboard Simulation Console */}
        <div style={{
          margin: '0 2rem 2rem 2rem',
          background: 'rgba(10, 10, 10, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                SUVARA-ERP // REPORTING_ENGINE_V3
              </span>
            </div>
            
            {/* Tabs Trigger */}
            <div style={{ display: 'flex', gap: '0.375rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={() => handleTabChange('portfolio')}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'portfolio' ? 'var(--gold-primary)' : 'transparent',
                  color: activeTab === 'portfolio' ? '#000000' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Portfolio
              </button>
              <button 
                onClick={() => handleTabChange('revenue')}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'revenue' ? 'var(--gold-primary)' : 'transparent',
                  color: activeTab === 'revenue' ? '#000000' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Revenue
              </button>
              <button 
                onClick={() => handleTabChange('vault')}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'vault' ? 'var(--gold-primary)' : 'transparent',
                  color: activeTab === 'vault' ? '#000000' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Gold Vault
              </button>
            </div>
          </div>

          {/* Tab Content 1: Portfolio */}
          {activeTab === 'portfolio' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Active AUM</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>₹8.47 Cr</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem' }}>
                    <ArrowUpRight size={14} /> <span>+12.4% MoM</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Accounts</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>1,482</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem' }}>
                    <ArrowUpRight size={14} /> <span>+48 new customers</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Avg. Loan Value</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>₹57,150</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Pledged jewelry backing</div>
                </div>
              </div>

              {/* LTV Safety Index */}
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#10B981' }}>Portfolio Risk Status: Safe</span>
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-mono)' }}>68.5% LTV</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: '68.5%', height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: 100 }} />
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Average Loan-to-Value (LTV) is well below the RBI regulatory ceiling of 75.0%.
                </p>
              </div>
            </div>
          )}

          {/* Tab Content 2: Revenue */}
          {activeTab === 'revenue' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Interest Accrued</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>₹18.42 L</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>For current cycle</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Collection Rate</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>86.2%</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem' }}>
                    <ArrowUpRight size={14} /> <span>+3.1% this month</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Interest Collected</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>₹15.89 L</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>₹2.53 L pending collection</div>
                </div>
              </div>

              {/* Chart Mockup */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Interest Yield Growth (Past 5 Months)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '90px', padding: '0 0.5rem', position: 'relative' }}>
                  
                  {/* Grid Lines */}
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: '30px', height: '1px', background: 'rgba(255,255,255,0.03)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: '60px', height: '1px', background: 'rgba(255,255,255,0.03)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: '90px', height: '1px', background: 'rgba(255,255,255,0.03)' }} />

                  {/* Bars */}
                  {[
                    { month: 'Jan', val: '₹9.4L', pct: 40 },
                    { month: 'Feb', val: '₹11.8L', pct: 52 },
                    { month: 'Mar', val: '₹13.2L', pct: 60 },
                    { month: 'Apr', val: '₹15.1L', pct: 72 },
                    { month: 'May', val: '₹18.4L', pct: 90 },
                  ].map((bar, i) => (
                    <div key={bar.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '15%' }}>
                      <span className="bar-val-label" style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: 'var(--gold-primary)',
                        fontFamily: 'var(--font-mono)',
                        marginBottom: '0.25rem',
                        transition: 'transform 0.2s ease',
                      }}>
                        {bar.val}
                      </span>
                      <div 
                        style={{
                          width: '100%',
                          height: `${bar.pct}px`,
                          background: 'linear-gradient(to top, var(--gold-accent), var(--gold-primary))',
                          borderRadius: '4px 4px 0 0',
                          boxShadow: '0 0 10px rgba(212,175,55,0.15)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        title={bar.val}
                      />
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Vault */}
          {activeTab === 'vault' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Gold Pledged</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>38.45 kg</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Securely vaulted in branch safes</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Live Collateral Value</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>₹28.06 Cr</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem' }}>
                    <ArrowUpRight size={14} /> <span>₹7,300/g rate basis</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Items Count</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>5,912 pcs</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Ornaments and bars audited</div>
                </div>
              </div>

              {/* Collateral Breakdown */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1rem'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>Vault Quality Composition</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  
                  {/* 22K Row */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>22 Karat (Standard Jewelry)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>26.80 kg (70%)</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 100 }}>
                      <div style={{ width: '70%', height: '100%', background: 'var(--gold-primary)', borderRadius: 100 }} />
                    </div>
                  </div>

                  {/* 24K Row */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>24 Karat (Bullion/Coins)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>8.20 kg (21%)</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 100 }}>
                      <div style={{ width: '21%', height: '100%', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', borderRadius: 100 }} />
                    </div>
                  </div>

                  {/* 18K Row */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>18 Karat (Stone-set/Design Jewelry)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>3.45 kg (9%)</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 100 }}>
                      <div style={{ width: '9%', height: '100%', background: '#B45309', borderRadius: 100 }} />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Footer Actions Panel */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              *Data reflects fully audited and simulated balance ledger cycles.
            </span>

            {/* Export Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="btn btn-outline"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  gap: '0.375rem',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  height: '32px'
                }}
              >
                {isExporting && exportType === 'pdf' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileText size={14} />
                )}
                <span>Export PDF Summary</span>
              </button>
              
              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className="btn btn-outline"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  gap: '0.375rem',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  height: '32px'
                }}
              >
                {isExporting && exportType === 'excel' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileSpreadsheet size={14} />
                )}
                <span>Export Excel Ledger</span>
              </button>
            </div>
          </div>

          {/* Export Success Toast banner within the card */}
          {exportSuccess && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              background: 'rgba(16, 185, 129, 0.95)',
              color: '#ffffff',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 10
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{successMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
