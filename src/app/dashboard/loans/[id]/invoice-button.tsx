'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, Printer, X, Shield, QrCode } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Loan, Shop } from '@/types';

interface InvoiceButtonProps {
  loan: Loan;
  shop: Shop | null;
}

export default function InvoiceButton({ loan, shop }: InvoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Automatically open modal if '?created=true' is in the query params
    if (searchParams.get('created') === 'true') {
      setIsOpen(true);
      // Remove query param to prevent modal from re-opening on manual refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  // Support both singular interface properties and database plural properties
  const customer = (loan as any).customers || loan.customer;
  const goldItem = (loan as any).gold_items || loan.gold_item;
  const payments = (loan as any).payments || [];
  
  const totalPaid = payments.reduce((s: number, p: any) => s + p.amount, 0);
  const principalPaid = payments
    .filter((p: any) => p.payment_type === 'Partial Payment' || p.payment_type === 'Full Settlement')
    .reduce((s: number, p: any) => s + p.amount, 0);
  const interestPaid = payments
    .filter((p: any) => p.payment_type === 'Interest Payment')
    .reduce((s: number, p: any) => s + p.amount, 0);

  const remainingPrincipal = Math.max(0, loan.loan_amount - principalPaid);
  
  const monthsElapsed = Math.floor(
    (Date.now() - new Date(loan.loan_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const totalInterestDue = (loan.loan_amount * loan.interest_rate * Math.max(monthsElapsed, 1)) / 100;
  const remainingInterest = Math.max(0, totalInterestDue - interestPaid);
  const totalBalanceDue = remainingPrincipal + remainingInterest;
  
  // Calculate LTV
  const ltv = goldItem?.estimated_value 
    ? ((loan.loan_amount / goldItem.estimated_value) * 100).toFixed(1) 
    : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-outline btn-sm"
        id="view-invoice-btn"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <FileText size={16} />
        <span>Invoice</span>
      </button>

      {isOpen && (
        <div 
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal-container"
            style={{
              maxWidth: '800px',
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} style={{ color: 'var(--gold-primary)' }} />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Pledge Invoice &amp; Loan Receipt</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost" 
                style={{ padding: '0.25rem', borderRadius: '50%' }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div style={{ overflowY: 'auto', padding: '2rem', flex: 1 }}>
              
              {/* PRINT AREA CONTAINER */}
              <div 
                id="invoice-print-area"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {/* Invoice Header */}
                <div className="invoice-header-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--gold-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>
                      {shop?.shop_name || 'SUVARNALOAN ERP'}
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Premium Gold Loan Management
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      Proprietor: {shop?.owner_name || 'Authorized Dealer'}<br />
                      Contact: {shop?.mobile || '—'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                      {loan.loan_number}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      PLEDGE MEMORANDUM
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                      Date: {formatDate(loan.loan_date)}
                    </p>
                  </div>
                </div>

                {/* Grid layout for Customer & Loan Metadata */}
                <div className="invoice-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  
                  {/* Pledger / Borrower Details */}
                  <div className="invoice-details-card" style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.01)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                      PLEDGER / BORROWER
                    </h4>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.9375rem' }}>
                      {customer?.full_name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Mobile: {customer?.mobile_number}<br />
                      Aadhaar: {customer?.aadhaar_number || 'N/A'}<br />
                      Address: {customer?.address || 'N/A'}
                    </p>
                  </div>

                  {/* Scheme & Terms Details */}
                  <div className="invoice-details-card" style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.01)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                      LOAN SCHEME &amp; INTEREST
                    </h4>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.9375rem' }}>
                      {loan.scheme_name || 'Standard Gold Scheme'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Interest Rate: <strong>{loan.interest_rate}% / month</strong><br />
                      Loan Term: 12 Months<br />
                      Maturity Date: {loan.due_date ? formatDate(loan.due_date) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Gold Specifications Table */}
                <div className="invoice-table-section" style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                    GOLD ORNAMENT SPECIFICATIONS
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)' }}>Ornament Type</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)' }}>Purity</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>Gross Wt (g)</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>Stone Wt (g)</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>Net Wt (g)</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)' }}>HUID / Hallmark</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{goldItem?.ornament_type}</td>
                        <td style={{ padding: '0.75rem' }}>{goldItem?.purity}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{(goldItem?.gross_weight ?? 0).toFixed(3)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{(goldItem?.stone_weight ?? 0).toFixed(3)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>{(goldItem?.net_weight ?? 0).toFixed(3)}</td>
                        <td style={{ padding: '0.75rem' }}>{goldItem?.hallmark_number || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                  {goldItem?.description && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      Description: {goldItem.description}
                    </p>
                  )}
                </div>

                {/* Financial Summary & Breakdown */}
                <div className="invoice-financials-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '1.5rem' }}>
                  
                  {/* Left Column: Security Seal & QR Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {/* Simulated gold seal */}
                    <div 
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '3px double var(--gold-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold-primary)',
                        background: 'rgba(212, 175, 55, 0.05)',
                        flexShrink: 0,
                        padding: '4px',
                        textAlign: 'center',
                      }}
                    >
                      <Shield size={24} />
                      <span style={{ fontSize: '0.5rem', fontWeight: 800, marginTop: '2px', lineHeight: 1.1 }}>OFFICIAL<br />SEAL</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
                      <QrCode size={40} style={{ color: 'var(--text-secondary)' }} />
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                        Scan to verify<br />
                        <strong>SuvarnaSecure</strong><br />
                        No: {loan.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Calculations Breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Gold Valuation</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{goldItem?.estimated_value ? formatCurrency(goldItem.estimated_value) : 'N/A'}</span>
                    </div>
                    {ltv && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>LTV Ratio</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: parseFloat(ltv) > 75 ? '#faad14' : 'var(--text-secondary)' }}>{ltv}%</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Interest Rate</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{loan.interest_rate}% / mo</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: totalPaid > 0 ? 600 : 800, color: totalPaid > 0 ? 'var(--text-primary)' : 'var(--gold-primary)', paddingTop: '0.25rem' }}>
                      <span>LOAN AMOUNT</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(loan.loan_amount)}</span>
                    </div>
                    {totalPaid > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--text-tertiary)' }}>Total Paid</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>-{formatCurrency(totalPaid)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--text-tertiary)' }}>Remaining Principal</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(remainingPrincipal)}</span>
                        </div>
                        {remainingInterest > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Remaining Interest</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(remainingInterest)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--gold-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem', marginTop: '0.25rem' }}>
                          <span>TOTAL BALANCE DUE</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalBalanceDue)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions declaration */}
                <div 
                  className="invoice-terms-box"
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-tertiary)',
                    lineHeight: 1.4,
                    padding: '0.75rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.005)',
                    marginBottom: '2.5rem',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>DECLARATION &amp; TERMS OF PLEDGE</strong>
                  1. The pledger hereby declares that they are the absolute owner of the ornaments listed above and possess valid ownership rights. 
                  2. Interest is payable monthly. If interest remains unpaid for over 12 consecutive months, the lender retains full legal right to auction the pledged ornaments without further notice.
                  3. In the event of redemption, the pledger must present this invoice receipt. A minimum processing window of 1 business day is required for gold item retrieval.
                </div>

                {/* Sign-off signatures */}
                <div className="invoice-signatures-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1rem' }}>
                  <div style={{ textAlign: 'center', width: '150px' }}>
                    <div style={{ borderBottom: '1px solid var(--text-tertiary)', height: '40px' }} />
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Signature of Pledger
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', width: '180px' }}>
                    <div style={{ borderBottom: '1px solid var(--text-tertiary)', height: '40px' }} />
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Authorized Signatory / Appraiser
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer (Screen-only Actions) */}
            <div 
              className="no-print"
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                background: 'rgba(0,0,0,0.1)',
              }}
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-outline"
                id="close-invoice-modal-btn"
              >
                Close
              </button>
              <button 
                onClick={handlePrint}
                className="btn btn-gold"
                id="print-invoice-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Printer size={16} />
                <span>Print / Save PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global CSS to handle printing cleanly */}
      <style jsx global>{`
        @media print {
          /* Configure standard A4 portrait layout and margins */
          @page {
            size: A4 portrait;
            margin: 8mm 10mm !important;
          }

          /* Scale root font size so that all rem units scale up proportionally */
          html {
            font-size: 22px !important;
          }

          /* Hide all non-printable layout elements explicitly */
          .dashboard-sidebar,
          .dashboard-topbar,
          .mobile-menu-btn,
          .mobile-overlay,
          .page-header > div:first-child,
          #view-invoice-btn,
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            opacity: 0 !important;
          }
          
          /* Reset root layout components and remove the sidebar margin offset */
          body, html, 
          #root, 
          #__next,
          .dashboard-layout, 
          .dashboard-main,
          .dashboard-content, 
          .page-header, 
          .page-header > div:last-child {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
          }
          
          /* Override modal backdrop layout to fit exactly on a printed sheet */
          .modal-backdrop {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            inset: auto !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }

          /* Override modal container layout */
          .modal-container {
            position: static !important;
            max-width: 100% !important;
            width: 100% !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
          }

          /* Format print area for high-contrast output spanning full page width */
          #invoice-print-area {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 0px !important;
            margin: 0 !important;
            color: #000000 !important;
            background: #ffffff !important;
            display: block !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            font-size: 0.95rem !important;
            line-height: 1.35 !important;
          }

          /* Force black text and solid lines on all print content */
          #invoice-print-area * {
            color: #000000 !important;
            border-color: #000000 !important;
          }
          
          /* Tighten spacing to fit strictly on a single A4 page */
          .invoice-header-row {
            padding-bottom: 0.3rem !important;
            margin-bottom: 0.4rem !important;
            border-bottom: 1.5px solid #000000 !important;
          }
          
          .invoice-details-grid {
            margin-bottom: 0.4rem !important;
            gap: 0.5rem !important;
          }
          
          .invoice-details-card {
            padding: 0.4rem 0.6rem !important;
            border: 1px solid #000000 !important;
          }
          
          .invoice-table-section {
            margin-bottom: 0.4rem !important;
          }
          
          .invoice-financials-grid {
            margin-bottom: 0.5rem !important;
            padding-top: 0.4rem !important;
            gap: 1.25rem !important;
          }
          
          .invoice-terms-box {
            margin-bottom: 0.6rem !important;
            padding: 0.4rem !important;
            font-size: 0.58rem !important;
            line-height: 1.25 !important;
            border: 1px solid #000000 !important;
          }
          
          .invoice-signatures-row {
            margin-top: 0.6rem !important;
          }

          .invoice-signatures-row > div > div {
            height: 25px !important;
          }
          
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 0.95rem !important;
          }
          
          table th {
            color: #000000 !important;
            border: 1px solid #000000 !important;
            background: #f5f5f5 !important;
            padding: 4px 6px !important;
            font-weight: bold !important;
          }
          
          table td {
            border: 1px solid #000000 !important;
            padding: 4px 6px !important;
          }
          
          #invoice-print-area strong, 
          #invoice-print-area h2, 
          #invoice-print-area h4 {
            color: #000000 !important;
          }
        }
      `}</style>
    </>
  );
}
