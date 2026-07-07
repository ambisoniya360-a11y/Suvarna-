'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Scale, 
  FileText, 
  Percent, 
  CreditCard, 
  Lock, 
  Shield, 
  Clock, 
  Award, 
  GitBranch, 
  Cloud, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  FolderDown,
  Building2,
  Database,
  Headphones,
  Check
} from 'lucide-react';

// Steps data matching the new horizontal image
const STEPS = [
  {
    idx: 0,
    step: '01',
    title: 'Customer Onboarding',
    subText: 'KYC verification • Document upload • Customer profile creation',
    desc: 'Record customer details, upload KYC (Aadhaar/PAN), and construct the customer ledger profile instantly.',
    icon: Users,
    glowColor: 'rgba(168, 85, 247, 0.5)',
    accentColor: '#c084fc'
  },
  {
    idx: 1,
    step: '02',
    title: 'Gold Valuation',
    subText: 'Weight calculation • Purity assessment • Hallmark verification',
    desc: 'Calculate exact ornament weights, evaluate karat purity (18K to 24K), scan HUID hallmarks, and fetch live market rates.',
    icon: Scale,
    glowColor: 'rgba(6, 182, 212, 0.5)',
    accentColor: '#22d3ee'
  },
  {
    idx: 2,
    step: '03',
    title: 'Loan Approval',
    subText: 'Loan sanction • Interest setup • Agreement generation',
    desc: 'Sanction principal limits based on LTV compliance, configure interest parameters, and digitally generate legally-compliant loan agreements.',
    icon: FileText,
    glowColor: 'rgba(34, 197, 94, 0.5)',
    accentColor: '#4ade80'
  },
  {
    idx: 3,
    step: '04',
    title: 'Interest Management',
    subText: 'Automatic interest calculation • Due reminders • Penalty tracking',
    desc: 'Calculate interest automatically (daily/monthly/compound models), track dues, and automate payment reminders via SMS & WhatsApp.',
    icon: Percent,
    glowColor: 'rgba(234, 179, 8, 0.5)',
    accentColor: '#facc15'
  },
  {
    idx: 4,
    step: '05',
    title: 'Payment Collection',
    subText: 'EMI tracking • Receipt generation • Collection logs',
    desc: 'Process partial/full payments, record transaction logs across cash, UPI, or bank channels, and instantly compile tax-ready receipts.',
    icon: CreditCard,
    glowColor: 'rgba(59, 130, 246, 0.5)',
    accentColor: '#60a5fa'
  },
  {
    idx: 5,
    step: '06',
    title: 'Loan Closure',
    subText: 'Settlement verification • Gold release • Closure certificate',
    desc: 'Verify zero outstanding balances, authorize safe vault releases, return physical gold to customers, and issue official closure certificates.',
    icon: Lock,
    glowColor: 'rgba(236, 72, 153, 0.5)',
    accentColor: '#f472b6'
  }
];

// Trust badges row matching the horizontal image
const TRUST_BADGES = [
  { label: '100% Secure', desc: 'Bank-grade encryption', icon: Shield },
  { label: 'Audit Ready', desc: 'Complete audit trail', icon: Clock },
  { label: 'RBI Compliant', desc: 'Regulatory compliant', icon: Award },
  { label: 'Multi-Branch', desc: 'Centralized control', icon: GitBranch },
  { label: 'Cloud Based', desc: 'Secure cloud storage', icon: Cloud },
  { label: '24/7 Support', desc: 'Always here to help', icon: Sparkles }
];

export default function GoldToGrowthWorkflow() {
  const [activeStep, setActiveStep] = useState(5); // Default to Loan Closure (Stage 6) as in reference image
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section 
      id="workflow"
      style={{
        padding: '6rem 2rem',
        background: '#040406',
        borderTop: '1px solid rgba(212,175,55,0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Styles for horizontal layouts & dynamic glowing */}
      <style dangerouslySetInnerHTML={{__html: `
        .text-serif-gold {
          font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
          color: #f7e7c4;
          background: linear-gradient(135deg, #FFE8A3 0%, #d4af37 60%, #c5a880 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .text-serif-gold-sub {
          font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
          color: #d4af37;
        }
        .text-serif-title {
          font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
          letter-spacing: 0.02em;
        }
        .step-card-active {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.03) 0%, rgba(0, 0, 0, 0) 100%) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.05);
        }
        .step-card {
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.01) 0%, rgba(0, 0, 0, 0) 100%);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .step-card:hover {
          border: 1px solid rgba(212, 175, 55, 0.2);
          transform: translateY(-2px);
        }
        .badge-tab {
          font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
          transition: all 0.25s ease;
          border-bottom: 2px solid transparent;
        }
        .badge-tab-active {
          color: #d4af37 !important;
          border-bottom: 2px solid #d4af37 !important;
        }
        .pulse-gold-wreath {
          animation: wreathPulse 3s infinite ease-in-out;
        }
        @keyframes wreathPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(212,175,55,0.1)); }
          50% { transform: scale(1.02); filter: drop-shadow(0 0 15px rgba(212,175,55,0.25)); }
        }
      `}} />

      {/* Decorative Gradients */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '25%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* ─── TOP SECTION: BRAND LOGO ─── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#d4af37', marginBottom: '2rem' }}>
          {/* Crown Logo */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 18L3 9L8 13L12 6L16 13L21 9L19 18H5Z" fill="#d4af37" stroke="#d4af37" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="12" cy="4" r="1.5" fill="#d4af37"/>
            <circle cx="3" cy="7.5" r="1.2" fill="#d4af37"/>
            <circle cx="21" cy="7.5" r="1.2" fill="#d4af37"/>
          </svg>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', lineHeight: 1 }}>
            <span style={{ fontSize: '0.95rem', letterSpacing: '0.12em', fontWeight: 900, color: '#ffffff' }}>SUVARNA</span>
            <span style={{ fontSize: '0.95rem', letterSpacing: '0.12em', fontWeight: 900, color: '#d4af37' }}>ERP</span>
          </div>
        </div>

        {/* ─── HEADER GRID (TITLE & HEADER TABS + BANGLLES DISPLAY) ─── */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1.3fr 0.7fr', 
          gap: '3rem', 
          marginBottom: '3rem',
          alignItems: 'end'
        }}>
          <div>
            <h2 className="text-serif-gold" style={{ 
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', 
              fontWeight: 400, 
              letterSpacing: '0.02em', 
              marginBottom: '0.5rem',
              lineHeight: 1.15
            }}>
              THE GOLD LOAN JOURNEY
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span className="text-serif-gold-sub" style={{ fontSize: '1.35rem', fontStyle: 'italic' }}>
                From Gold to Growth.
              </span>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={{ height: '1px', background: 'rgba(212,175,55,0.4)', width: '60px' }} />
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d4af37', marginLeft: '-2px' }} />
              </div>
            </div>
            <p style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.95rem', 
              maxWidth: '540px',
              lineHeight: 1.55,
              margin: 0
            }}>
              The complete gold loan journey — digitized, automated, and tracked from start to finish.
            </p>
          </div>

          {/* Right Header Navigation & Bangles */}
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.25rem' }}>
              {/* Tab Navigation Row */}
              <div style={{ display: 'flex', gap: '1.25rem', paddingBottom: '0.25rem' }}>
                {[
                  { label: 'Customers', idx: 0 },
                  { label: 'Gold Vault', idx: 1 },
                  { label: 'Loans', idx: 2 },
                  { label: 'Interest', idx: 3 },
                  { label: 'Payments', idx: 4 },
                  { label: 'Closure', idx: 5 }
                ].map((tab) => {
                  const isActive = activeStep === tab.idx;
                  return (
                    <button
                      key={tab.idx}
                      onClick={() => setActiveStep(tab.idx)}
                      className={`badge-tab ${isActive ? 'badge-tab-active' : ''}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.75rem',
                        fontWeight: isActive ? 700 : 500,
                        paddingBottom: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Gold Bangles Display floating background */}
              <div style={{
                position: 'absolute',
                right: '2rem',
                top: '-40px',
                width: '320px',
                height: '180px',
                pointerEvents: 'none',
                opacity: 0.15,
                background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 80%)',
                zIndex: -1
              }} />
            </div>
          )}
        </div>

        {/* ─── MIDDLE SECTION: 6 HORIZONTAL STEP CARDS ─── */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(6, 280px)' : 'repeat(6, 1fr)',
            gap: '1rem',
            marginBottom: '3rem',
            overflowX: isMobile ? 'auto' : 'visible',
            paddingBottom: isMobile ? '1rem' : '0',
            scrollSnapType: isMobile ? 'x mandatory' : 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isSelected = activeStep === step.idx;
            return (
              <div
                key={step.idx}
                onClick={() => setActiveStep(step.idx)}
                className={`step-card ${isSelected ? 'step-card-active' : ''}`}
                style={{
                  borderRadius: '16px',
                  padding: '1.5rem 1.15rem',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  scrollSnapAlign: 'start'
                }}
              >
                {/* Arrow Connector indicator (Desktop Only) */}
                {!isMobile && step.idx < 5 && (
                  <div style={{
                    position: 'absolute',
                    right: '-0.75rem',
                    top: '2.5rem',
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    background: '#040406',
                    border: '1px solid rgba(212,175,55,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    color: '#d4af37'
                  }}>
                    <ChevronRight size={10} strokeWidth={3} />
                  </div>
                )}

                {/* Number */}
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: isSelected ? step.accentColor : 'rgba(255,255,255,0.3)',
                  marginBottom: '0.75rem',
                  display: 'block'
                }}>
                  {step.step}
                </span>

                {/* Circle Icon Badge */}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: isSelected ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? `2px solid ${step.accentColor}` : '1.5px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? step.accentColor : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: isSelected ? `0 0 25px ${step.glowColor}` : 'none',
                  marginBottom: '1.25rem',
                  transition: 'all 0.3s ease'
                }}>
                  <StepIcon size={18} />
                </div>

                {/* Card Title */}
                <h3 className="text-serif-title" style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '0.5rem',
                }}>
                  {step.title}
                </h3>

                {/* SubText Bullets */}
                <p style={{
                  fontSize: '0.65rem',
                  color: isSelected ? step.accentColor : 'rgba(255, 255, 255, 0.3)',
                  fontWeight: 600,
                  lineHeight: 1.35,
                  marginBottom: '0.75rem',
                  height: '32px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineBreak: 'anywhere',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2
                }}>
                  {step.subText}
                </p>

                {/* Description */}
                <p style={{
                  fontSize: '0.75rem',
                  color: isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
                  lineHeight: 1.45,
                  margin: 0,
                  opacity: isSelected ? 1 : 0.7
                }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ─── BOTTOM ROW: DYNAMIC DETAILS CARD & TRUST BADGES ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1.7fr',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          
          {/* LEFT COLUMN: ACTIVE STEP DETAILS BLOCK (40% width) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(6, 6, 8, 0.95) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem 1.75rem',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.02)',
            display: 'flex',
            alignItems: 'center',
            minHeight: '190px'
          }}>
            
            {/* Step 6 Closure (Exact Laurel Wreath Wreath from the image) */}
            {activeStep === 5 && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', width: '100%', alignItems: 'center' }}>
                <div className="pulse-gold-wreath" style={{ display: 'flex', justifyContent: 'center' }}>
                  {/* Custom Laurel Wreath Shield Wreath SVG */}
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 18L54 23V39C54 50 48 57 40 61C32 57 26 50 26 39V23L40 18Z" stroke="#d4af37" strokeWidth="2.5" fill="rgba(212,175,55,0.06)" strokeLinejoin="round"/>
                    <path d="M40 28V51M36 34C36 34 38.5 32 41 32C43.5 32 45 33.5 45 35.5C45 37.5 43.5 38.5 41 39C38.5 39.5 35 40.5 35 43C35 45.5 37.5 47 40 47C42.5 47 45 45 45 45" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M22 55C18 47 18 36 22 28M20 48C17 44 17 38 20 34M17 41C15 39 15 37 17 35" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M58 55C62 47 62 36 58 28M60 48C63 44 63 38 60 34M63 41C65 39 65 37 63 35" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                    Loan Closed Successfully
                  </h4>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    color: '#d4af37',
                    border: '1px solid rgba(212,175,55,0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(212,175,55,0.06)',
                    display: 'inline-block',
                    marginBottom: '0.75rem',
                    fontWeight: 700
                  }}>
                    REF-ID: CLOSE-CUST-125
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#00D26A' }} /> Principal Settled (₹3,25,000)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#00D26A' }} /> Accrued Interest Paid (₹8,125)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#00D26A' }} /> Physical Gold Released from Vault
                    </div>
                  </div>

                  <button style={{
                    background: 'transparent',
                    border: '1px solid rgba(212,175,55,0.4)',
                    borderRadius: '6px',
                    color: '#d4af37',
                    padding: '5px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>Release Cert</span>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1 Customer Details */}
            {activeStep === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 18L54 23V39C54 50 48 57 40 61C32 57 26 50 26 39V23L40 18Z" stroke="#c084fc" strokeWidth="2" fill="rgba(192,132,252,0.06)" strokeLinejoin="round"/>
                    <circle cx="40" cy="34" r="7" stroke="#c084fc" strokeWidth="2.2" />
                    <path d="M30 49C30 44 34.5 42 40 42C45.5 42 50 44 50 49" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M22 55C18 47 18 36 22 28" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M58 55C62 47 62 36 58 28" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                    Customer Ledger Profile
                  </h4>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    color: '#c084fc',
                    border: '1px solid rgba(192,132,252,0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(192,132,252,0.06)',
                    display: 'inline-block',
                    marginBottom: '0.75rem',
                    fontWeight: 700
                  }}>
                    REF-ID: CUST-2026-00125
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#c084fc' }} /> KYC Documents Uploaded & Verified
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#c084fc' }} /> Aadhaar & PAN Card Instantly Validated
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#c084fc' }} /> Permanent Digital Ledger Created
                    </div>
                  </div>

                  <button style={{
                    background: 'transparent',
                    border: '1px solid rgba(192,132,252,0.4)',
                    borderRadius: '6px',
                    color: '#c084fc',
                    padding: '5px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,132,252,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>View Ledger</span>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 Valuation Details */}
            {activeStep === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 18L54 23V39C54 50 48 57 40 61C32 57 26 50 26 39V23L40 18Z" stroke="#22d3ee" strokeWidth="2" fill="rgba(34,211,238,0.06)" strokeLinejoin="round"/>
                    <path d="M32 30H48L40 46L32 30Z" stroke="#22d3ee" strokeWidth="2.2" strokeLinejoin="round" />
                    <line x1="30" y1="46" x2="50" y2="46" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M22 55C18 47 18 36 22 28" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M58 55C62 47 62 36 58 28" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                    Gold Valuation Verified
                  </h4>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    color: '#22d3ee',
                    border: '1px solid rgba(34,211,238,0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(34,211,238,0.06)',
                    display: 'inline-block',
                    marginBottom: '0.75rem',
                    fontWeight: 700
                  }}>
                    REF-ID: VAL-2026-00125
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#22d3ee' }} /> Ornament Net Weight Measured (114.12 g)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#22d3ee' }} /> BIS HUID Hallmark Checked & Authenticated
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#22d3ee' }} /> Live Karat Rate Applied (22 Karat)
                    </div>
                  </div>

                  <button style={{
                    background: 'transparent',
                    border: '1px solid rgba(34,211,238,0.4)',
                    borderRadius: '6px',
                    color: '#22d3ee',
                    padding: '5px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,211,238,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>Valuation Sheet</span>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 Approval Details */}
            {activeStep === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 18L54 23V39C54 50 48 57 40 61C32 57 26 50 26 39V23L40 18Z" stroke="#4ade80" strokeWidth="2" fill="rgba(74,222,128,0.06)" strokeLinejoin="round"/>
                    <path d="M34 30H46M34 37H46M34 44H41" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" />
                    <circle cx="45" cy="45" r="2.5" fill="#4ade80" />
                    <path d="M22 55C18 47 18 36 22 28" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M58 55C62 47 62 36 58 28" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                    Loan Approved & Disbursed
                  </h4>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    color: '#4ade80',
                    border: '1px solid rgba(74,222,128,0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(74,222,128,0.06)',
                    display: 'inline-block',
                    marginBottom: '0.75rem',
                    fontWeight: 700
                  }}>
                    REF-ID: APR-2026-00125
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#4ade80' }} /> Sanctioned Limit Allocated (₹3,25,000)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#4ade80' }} /> LTV Compliance Validated
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#4ade80' }} /> Digitally Signed Agreement Generated
                    </div>
                  </div>

                  <button style={{
                    background: 'transparent',
                    border: '1px solid rgba(74,222,128,0.4)',
                    borderRadius: '6px',
                    color: '#4ade80',
                    padding: '5px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74,222,128,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>View Agreement</span>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 Interest Details */}
            {activeStep === 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 18L54 23V39C54 50 48 57 40 61C32 57 26 50 26 39V23L40 18Z" stroke="#facc15" strokeWidth="2" fill="rgba(250,204,21,0.06)" strokeLinejoin="round"/>
                    <circle cx="35" cy="34" r="2.5" fill="#facc15" />
                    <circle cx="45" cy="44" r="2.5" fill="#facc15" />
                    <line x1="33" y1="45" x2="47" y2="33" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M22 55C18 47 18 36 22 28" stroke="#facc15" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M58 55C62 47 62 36 58 28" stroke="#facc15" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                    Interest Ledger Active
                  </h4>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    color: '#facc15',
                    border: '1px solid rgba(250,204,21,0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(250,204,21,0.06)',
                    display: 'inline-block',
                    marginBottom: '0.75rem',
                    fontWeight: 700
                  }}>
                    REF-ID: INT-2026-00125
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#facc15' }} /> Accrued Simple Interest Calculated (₹8,125)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#facc15' }} /> WhatsApp & SMS Notifications Sent
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#facc15' }} /> Overdue Dues & Penalty Alarms Setup
                    </div>
                  </div>

                  <button style={{
                    background: 'transparent',
                    border: '1px solid rgba(250,204,21,0.4)',
                    borderRadius: '6px',
                    color: '#facc15',
                    padding: '5px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(250,204,21,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>View Ledger</span>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5 Payment Details */}
            {activeStep === 4 && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 18L54 23V39C54 50 48 57 40 61C32 57 26 50 26 39V23L40 18Z" stroke="#60a5fa" strokeWidth="2" fill="rgba(96,165,250,0.06)" strokeLinejoin="round"/>
                    <rect x="32" y="32" width="16" height="11" rx="1.5" stroke="#60a5fa" strokeWidth="2.2" />
                    <line x1="32" y1="36" x2="48" y2="36" stroke="#60a5fa" strokeWidth="1.5" />
                    <path d="M22 55C18 47 18 36 22 28" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M58 55C62 47 62 36 58 28" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                    Repayment Logs Updated
                  </h4>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    color: '#60a5fa',
                    border: '1px solid rgba(96,165,250,0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(96,165,250,0.06)',
                    display: 'inline-block',
                    marginBottom: '0.75rem',
                    fontWeight: 700
                  }}>
                    REF-ID: PAY-2026-00125
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#60a5fa' }} /> Payments Logged Instantly Across Channels
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#60a5fa' }} /> UPI, Cash & Bank Transfers Reconciled
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#60a5fa' }} /> Professional Digital Receipt Dispatched
                    </div>
                  </div>

                  <button style={{
                    background: 'transparent',
                    border: '1px solid rgba(96,165,250,0.4)',
                    borderRadius: '6px',
                    color: '#60a5fa',
                    padding: '5px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96,165,250,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>View Receipts</span>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: 6 PREMIUM TRUST BADGES (60% width) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}>
            {[
              { label: '100% Secure', desc: 'Bank-grade encryption', icon: Shield },
              { label: 'Audit Ready', desc: 'Complete audit trail', icon: Clock },
              { label: 'RBI Compliant', desc: 'Regulatory compliant', icon: Award },
              { label: 'Multi-Branch', desc: 'Centralized control', icon: GitBranch },
              { label: 'Cloud Based', desc: 'Secure cloud storage', icon: Cloud },
              { label: '24/7 Support', desc: 'Always here to help', icon: Sparkles }
            ].map((badge, idx) => {
              const BadgeIcon = badge.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '12px',
                    padding: '1.25rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(212,175,55,0.2)';
                    e.currentTarget.style.background = 'rgba(212,175,55,0.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.015)';
                  }}
                >
                  <div style={{ color: '#d4af37', marginBottom: '0.625rem' }}>
                    <BadgeIcon size={20} />
                  </div>
                  <h5 className="text-serif-title" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0' }}>
                    {badge.label}
                  </h5>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                    {badge.desc}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
