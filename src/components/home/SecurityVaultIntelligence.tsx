'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Shield, 
  Clock, 
  Fingerprint, 
  Gavel, 
  LineChart, 
  Lock, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  Network, 
  GitBranch, 
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap,
  Check,
  RefreshCw,
  FileText
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// 7 Interactive Steps data
const STEPS = [
  {
    id: '01',
    title: 'Gold Vault Monitoring',
    desc: 'Track every pledged ornament with unique vault IDs, storage location mapping, and real-time inventory visibility across branches.',
    icon: Database,
    color: '#D4AF37'
  },
  {
    id: '02',
    title: 'Digital Audit Trail',
    desc: 'Every action is recorded automatically — from valuation updates to payment collections — creating a complete audit-ready history.',
    icon: Clock,
    color: '#D4AF37'
  },
  {
    id: '03',
    title: 'Multi-Branch Control',
    desc: 'Monitor loans, collections, pledged gold, and staff activity across all branches from a single dashboard.',
    icon: GitBranch,
    color: '#D4AF37'
  },
  {
    id: '04',
    title: 'Fraud Prevention Engine',
    desc: 'Detect unusual transactions, duplicate pledges, unauthorized edits, and suspicious account activity instantly.',
    icon: Fingerprint,
    color: '#EF4444' // red/alert
  },
  {
    id: '05',
    title: 'Document & KYC Vault',
    desc: 'Securely store customer KYC documents, loan agreements, photographs, and valuation reports with encrypted cloud backup.',
    icon: Lock,
    color: '#D4AF37'
  },
  {
    id: '06',
    title: 'Regulatory Compliance',
    desc: 'Generate RBI-ready reports, audit statements, customer ledgers, and branch compliance records in one click.',
    icon: Gavel,
    color: '#D4AF37'
  },
  {
    id: '07',
    title: 'Executive Command Center',
    desc: 'Get a real-time overview of total portfolio value, pledged gold weight, active loans, overdue accounts, interest revenue, and branch performance.',
    icon: LineChart,
    color: '#3B82F6' // blue/executive
  }
];

// Interactive India branches mapping data
const BRANCHES = [
  { name: 'Mumbai HQ', x: '35%', y: '60%', gold: '210.5 Kg', loans: '1,420 Active', status: 'Secure' },
  { name: 'Pune Branch', x: '37%', y: '64%', gold: '94.2 Kg', loans: '610 Active', status: 'Secure' },
  { name: 'Nagpur Office', x: '48%', y: '58%', gold: '62.8 Kg', loans: '412 Active', status: 'Secure' },
  { name: 'Kolhapur Branch', x: '38%', y: '69%', gold: '48.1 Kg', loans: '310 Active', status: 'Secure' },
  { name: 'Surat Office', x: '31%', y: '52%', gold: '84.2 Kg', loans: '580 Active', status: 'Secure' },
  { name: 'Nashik Hub', x: '34%', y: '58%', gold: '51.3 Kg', loans: '340 Active', status: 'Secure' },
  { name: 'Aurangabad Center', x: '40%', y: '60%', gold: '42.9 Kg', loans: '280 Active', status: 'Secure' }
];

// Portfolio health chart timeline data
const CHART_DATA = [
  { month: 'Jan', val: 5, display: '₹5.2 Cr' },
  { month: 'Feb', val: 9, display: '₹9.4 Cr' },
  { month: 'Mar', val: 11, display: '₹11.1 Cr' },
  { month: 'Apr', val: 15, display: '₹15.3 Cr' },
  { month: 'May', val: 18.42, display: '₹18.42 Cr' }
];

export default function SecurityVaultIntelligence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  
  // Interactive states
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredBranch, setHoveredBranch] = useState<typeof BRANCHES[0] | null>(null);
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(4); // Default to last (May)
  
  // Counter states for live metrics
  const [assetsCount, setAssetsCount] = useState(0);
  const [goldCount, setGoldCount] = useState(0);
  const [complianceCount, setComplianceCount] = useState(0);
  const [recordsCount, setRecordsCount] = useState(0);
  const [activeCounters, setActiveCounters] = useState(false);

  // Quick Action loader simulator
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger quick action with simulation loading
  const triggerQuickAction = (actionName: string, fileName: string) => {
    if (activeAction) return;
    setActiveAction(actionName);
    
    setTimeout(() => {
      setActiveAction(null);
      setToastMessage(`✓ ${fileName} compiled and downloaded successfully.`);
      
      // Auto clear toast
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }, 1800);
  };

  // Setup GSAP scroll trigger for count-up
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Trigger counter start when metrics panel is visible
      ScrollTrigger.create({
        trigger: metricsRef.current,
        start: 'top 85%',
        onEnter: () => {
          setActiveCounters(true);
        }
      });
      
      // Scroll reveal trigger for the entire section elements
      gsap.fromTo('.reveal-item', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Simple numeric animation effect
  useEffect(() => {
    if (!activeCounters) return;

    let startTimestamp: number | null = null;
    const duration = 2000; // 2 seconds animation

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);

      setAssetsCount(parseFloat((easeProgress * 12.8).toFixed(1)));
      setGoldCount(parseFloat((easeProgress * 187.4).toFixed(1)));
      setComplianceCount(parseFloat((easeProgress * 99.8).toFixed(1)));
      setRecordsCount(Math.floor(easeProgress * 24891));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [activeCounters]);

  return (
    <section 
      ref={containerRef}
      id="security"
      style={{
        padding: '7rem 2rem 6rem',
        background: '#050505',
        borderTop: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Golden Background Glows */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60vw',
        height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'absolute',
        bottom: '5%',
        right: '2%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main Layout Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* SECTION HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }} className="reveal-item">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'var(--gold-subtle)', 
            border: '1px solid var(--gold-border)', 
            borderRadius: '100px', 
            padding: '0.375rem 1.25rem', 
            marginBottom: '1.5rem' 
          }}>
            <Shield size={12} style={{ color: 'var(--gold-primary)' }} />
            <span style={{ 
              fontSize: '0.75rem', 
              color: 'var(--gold-primary)', 
              letterSpacing: '0.12em', 
              fontWeight: 700, 
              textTransform: 'uppercase' 
            }}>
              SECURITY, COMPLIANCE & GOLD VAULT INTELLIGENCE
            </span>
          </div>
          <h2 style={{ 
            fontSize: 'clamp(2.25rem, 5vw, 3.8rem)', 
            fontWeight: 900, 
            letterSpacing: '-0.04em', 
            marginBottom: '1.25rem',
            lineHeight: 1.05
          }}>
            Secure Every Gram. <span className="text-gradient-gold">Protect Every Rupee.</span>
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.125rem', 
            maxWidth: '540px', 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            The intelligence layer behind modern gold lending.
          </p>
        </div>

        {/* 1. TOP STEP CARDS ROW (01 to 07) */}
        <div 
          className="reveal-item"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '0.75rem',
            marginBottom: '3rem',
            overflowX: 'auto',
            paddingBottom: '1rem'
          }}
          id="security-steps-grid"
        >
          {STEPS.map((step, idx) => {
            const IconComponent = step.icon;
            const isActive = activeStep === idx;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                style={{
                  background: isActive ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255,255,255,0.01)',
                  border: isActive ? '1px solid var(--gold-border-strong)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  boxShadow: isActive ? '0 0 25px rgba(212,175,55,0.08)' : 'none',
                  minWidth: '150px'
                }}
                className={`security-step-card ${isActive ? 'active' : ''}`}
              >
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700, 
                  color: isActive ? 'var(--gold-primary)' : 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.05em'
                }}>
                  {step.id}
                </div>
                <div style={{
                  width: 38, height: 38,
                  borderRadius: '50%',
                  background: isActive ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                  border: isActive ? '1px solid var(--gold-border)' : '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  color: isActive ? 'var(--gold-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.3s ease'
                }} className="security-step-icon">
                  <IconComponent size={18} />
                </div>
                <h3 style={{ 
                  fontSize: '0.8125rem', 
                  fontWeight: 800, 
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  marginBottom: '0.25rem',
                  lineHeight: 1.2
                }}>
                  {step.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Selected Step Detail Panel (Expands on click of cards above) */}
        <div 
          className="reveal-item"
          style={{
            background: 'linear-gradient(135deg, rgba(20,20,20,0.6) 0%, rgba(10,10,10,0.8) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)'
          }}
        >
          {/* Gold bars 3D CSS representation */}
          <div style={{
            position: 'absolute',
            right: '2.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.12,
            pointerEvents: 'none'
          }} className="gold-bars-decor-desktop">
            <svg width="220" height="150" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Stacked Gold Bars */}
              <polygon points="10,60 50,60 40,45 20,45" fill="var(--gold-accent)" opacity="0.8"/>
              <polygon points="50,60 60,60 50,45 40,45" fill="var(--gold-dark)" opacity="0.8"/>
              <polygon points="20,45 40,45 35,33 25,33" fill="var(--gold-light)" opacity="0.9"/>
              <polygon points="40,45 50,45 45,33 35,33" fill="var(--gold-primary)"/>
              
              <polygon points="60,60 100,60 90,45 70,45" fill="var(--gold-accent)" opacity="0.8"/>
              <polygon points="100,60 110,60 100,45 90,45" fill="var(--gold-dark)" opacity="0.8"/>
              
              {/* Top central bar */}
              <polygon points="35,45 75,45 65,30 45,30" fill="var(--gold-light)"/>
              <polygon points="75,45 85,45 75,30 65,30" fill="var(--gold-primary)"/>
              
              {/* Text on main bar */}
              <text x="50" y="38" fill="#000000" fontSize="3" fontWeight="900" opacity="0.5">999.9</text>
            </svg>
          </div>

          <div style={{
            width: 54, height: 54,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gold-subtle)',
            border: '1px solid var(--gold-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold-primary)'
          }}>
            {(() => {
              const Icon = STEPS[activeStep].icon;
              return <Icon size={26} />;
            })()}
          </div>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>
              {STEPS[activeStep].title}
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
              {STEPS[activeStep].desc}
            </p>
          </div>
        </div>

        {/* 2. THE INTEGRATED LIVE DASHBOARD VIEWPORT (SUVARA-ERP // SECURITY_CORE_V4) */}
        <div 
          className="reveal-item"
          style={{
            background: '#090909',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem 1.75rem 1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative'
          }}
        >
          {/* Dashboard Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: '1.25rem',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="terminal-dots" style={{ display: 'flex', gap: '0.375rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F56' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27C93F' }} />
              </div>
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.05em'
              }}>
                SUVARA-ERP // <span style={{ color: '#ffffff' }}>SECURITY_CORE_V4</span>
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pulse-green-dot" style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#00D26A',
                boxShadow: '0 0 10px #00D26A'
              }} />
              <span style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#00D26A',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                SYSTEM HEALTH: OPERATIONAL
              </span>
            </div>
          </div>

          {/* MAIN 6-METRICS GRID */}
          <div 
            ref={metricsRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            {/* Metric 1: Protected Assets */}
            <div className="dashboard-metric-tile" style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Protected Assets</span>
                <Shield size={14} style={{ color: 'var(--gold-primary)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                ₹{assetsCount.toFixed(1)} Cr
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#00D26A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem' }}>
                <span>▲ +8.6%</span>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>vs last cycle</span>
              </div>
            </div>

            {/* Metric 2: Pledged Gold Weight */}
            <div className="dashboard-metric-tile" style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pledged Gold Weight</span>
                <Scale size={14} style={{ color: 'var(--gold-primary)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {goldCount.toFixed(1)} Kg
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#00D26A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem' }}>
                <span>▲ +5.2%</span>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>vs last cycle</span>
              </div>
            </div>

            {/* Metric 3: Audit Compliance */}
            <div className="dashboard-metric-tile" style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Audit Compliance</span>
                <CheckCircle2 size={14} style={{ color: '#00D26A' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00D26A', fontFamily: 'var(--font-mono)' }}>
                {complianceCount.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#00D26A', fontWeight: 700, marginTop: '0.375rem' }}>
                Excellent Status
              </div>
            </div>

            {/* Metric 4: Fraud Alerts */}
            <div className="dashboard-metric-tile" style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Fraud Alerts</span>
                <AlertTriangle size={14} style={{ color: '#EF4444' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
                02 Active
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.375rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#EF4444', fontWeight: 600 }}>1 Critical</span>
                <span>•</span>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>1 High</span>
              </div>
            </div>

            {/* Metric 5: Vault Accuracy */}
            <div className="dashboard-metric-tile" style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Vault Stock Accuracy</span>
                <Sparkles size={14} style={{ color: 'var(--gold-primary)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#00D26A', fontWeight: 700, marginTop: '0.375rem' }}>
                Perfect Match
              </div>
            </div>

            {/* Metric 6: Encrypted Records */}
            <div className="dashboard-metric-tile" style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Encrypted Records</span>
                <Lock size={14} style={{ color: '#3B82F6' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3B82F6', fontFamily: 'var(--font-mono)' }}>
                {recordsCount.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#00D26A', fontWeight: 600, marginTop: '0.375rem' }}>
                All Securely Backed Up
              </div>
            </div>
          </div>

          {/* LOWER INTERACTIVE WORKSPACE: MAP | CHART & ACTIONS | SIDEBAR */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 0.9fr',
              gap: '1.5rem'
            }}
            id="security-workspace-grid"
          >
            {/* Column A: LIVE VAULT MAP WIDGET */}
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Live Vault Overview
                </h4>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block' }}>Total Vaults</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>128 <span style={{ fontSize: '0.6875rem', color: '#00D26A', fontWeight: 700 }}>● Live</span></span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block' }}>Total Ornaments</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>24,568</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block' }}>Branches</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>28 Connected</span>
                  </div>
                </div>
              </div>

              {/* STYLIZED CONNECTED MAP WIDGET (Representing Branches in India/Maharashtra Region) */}
              <div style={{ 
                height: '240px', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid rgba(255,255,255,0.03)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {/* Tech background grid overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.04) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  pointerEvents: 'none'
                }} />

                {/* Styled Regional/India SVG Path Blueprint Background */}
                <svg viewBox="0 0 100 100" style={{ width: '85%', height: '85%', opacity: 0.15, pointerEvents: 'none' }}>
                  <path d="M30 20 L45 15 L60 22 L75 18 L85 30 L80 50 L90 70 L75 85 L60 80 L40 90 L30 80 L20 65 L10 50 L15 35 Z" fill="none" stroke="var(--gold-primary)" strokeWidth="0.75" strokeDasharray="3 3"/>
                  <path d="M35 25 L45 20 L55 26 L65 24 L75 32 L72 45 L80 60 L70 72 L58 68 L42 75 L32 68 L25 58 L18 46 L22 36 Z" fill="rgba(212,175,55,0.1)" stroke="var(--gold-primary)" strokeWidth="0.5"/>
                </svg>

                {/* Laser Connector Vectors connecting branches to HQ */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {BRANCHES.slice(1).map((b, i) => (
                    <line 
                      key={i} 
                      x1="35%" y1="60%" // Mumbai HQ coordinates
                      x2={b.x} y2={b.y} 
                      stroke="rgba(212, 175, 55, 0.18)" 
                      strokeWidth="0.75"
                      strokeDasharray="2 4"
                    />
                  ))}
                </svg>

                {/* Branch Nodes (Interactive Beacons) */}
                {BRANCHES.map((branch, idx) => (
                  <div
                    key={branch.name}
                    style={{
                      position: 'absolute',
                      left: branch.x,
                      top: branch.y,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    onMouseEnter={() => setHoveredBranch(branch)}
                    onMouseLeave={() => setHoveredBranch(null)}
                  >
                    {/* Blinking wave ring */}
                    <div style={{
                      position: 'absolute',
                      width: branch.name === 'Mumbai HQ' ? '20px' : '14px',
                      height: branch.name === 'Mumbai HQ' ? '20px' : '14px',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      background: 'rgba(212, 175, 55, 0.2)',
                      animation: 'pulse-gold 2s infinite',
                      pointerEvents: 'none'
                    }} />
                    
                    {/* Solid node center */}
                    <div style={{
                      width: branch.name === 'Mumbai HQ' ? '10px' : '6px',
                      height: branch.name === 'Mumbai HQ' ? '10px' : '6px',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      background: branch.name === 'Mumbai HQ' ? 'var(--gold-premium)' : 'var(--gold-primary)',
                      border: '1px solid #000000',
                      boxShadow: '0 0 8px var(--gold-glow-strong)'
                    }} />
                  </div>
                ))}

                {/* Real-time map status overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '12px',
                  background: 'rgba(10,10,10,0.85)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '30px',
                  padding: '3px 10px',
                  fontSize: '0.625rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600
                }}>
                  <Network size={10} style={{ color: 'var(--gold-primary)' }} />
                  <span>All Branches Connected</span>
                </div>

                {/* Node Hover Tooltip Card */}
                {hoveredBranch && (
                  <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(15,15,15,0.95)',
                    border: '1px solid var(--gold-border-strong)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                    zIndex: 100,
                    width: '180px',
                    pointerEvents: 'none',
                    animation: 'scaleIn 0.15s ease'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
                      {hoveredBranch.name}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                      <span>Gold Weight:</span>
                      <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>{hoveredBranch.gold}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                      <span>Pledge Count:</span>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{hoveredBranch.loans}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                      <span>Audit Status:</span>
                      <span style={{ fontWeight: 700, color: '#00D26A' }}>{hoveredBranch.status}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Storage Utilization Footer widget inside column */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginTop: '1rem'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Global Storage Utilization
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Small Ring utilization visual */}
                  <div style={{ position: 'relative', width: 28, height: 28 }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--gold-primary)"
                        strokeDasharray="72, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.55rem', fontWeight: 900, color: 'var(--gold-primary)',
                      fontFamily: 'var(--font-mono)'
                    }}>72%</span>
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    Safe Storage Capacity
                  </span>
                </div>
              </div>
            </div>

            {/* Column B: PORTFOLIO HEALTH CHART & QUICK ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* UPPER HALF: INTERACTIVE PORTFOLIO HEALTH CHART */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Portfolio Health Overview
                  </h4>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: 0 }}>
                    Monthly pledged gold asset values (Jan - May)
                  </p>
                </div>

                {/* Dynamic SVG Line Chart */}
                <div style={{ height: '120px', width: '100%', position: 'relative', marginTop: '1rem', marginBottom: '0.75rem' }}>
                  <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {/* SVG Grid lines */}
                    <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.25"/>
                    <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.25"/>
                    <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.25"/>

                    {/* Gradient under curve */}
                    <defs>
                      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--gold-primary)" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="var(--gold-primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 5 32 Q 27.5 24 50 20 T 95 10 L 95 38 L 5 38 Z"
                      fill="url(#chart-area-grad)"
                      stroke="none"
                    />

                    {/* The main gold progress path */}
                    <path 
                      d="M 5 32 Q 27.5 24 50 20 T 95 10" 
                      fill="none" 
                      stroke="var(--gold-primary)" 
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />

                    {/* Vertical tracking line on active point */}
                    {activeChartPoint !== null && (
                      <line 
                        x1={5 + activeChartPoint * 22.5} 
                        y1="5" 
                        x2={5 + activeChartPoint * 22.5} 
                        y2="38" 
                        stroke="rgba(212,175,55,0.25)" 
                        strokeWidth="0.5" 
                        strokeDasharray="1 1"
                      />
                    )}

                    {/* Interactive Dot Nodes */}
                    {CHART_DATA.map((pt, idx) => {
                      // Approximate coordinates mapped on path points
                      const xCoords = [5, 27.5, 50, 72.5, 95];
                      const yCoords = [32, 24, 20, 15, 10]; // Approximate curve coordinates
                      const cx = xCoords[idx];
                      const cy = yCoords[idx];
                      const isHovered = activeChartPoint === idx;

                      return (
                        <g key={pt.month} style={{ cursor: 'pointer' }} onMouseEnter={() => setActiveChartPoint(idx)}>
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={isHovered ? 3.5 : 2.5} 
                            fill={isHovered ? 'var(--gold-light)' : '#090909'} 
                            stroke="var(--gold-primary)" 
                            strokeWidth={isHovered ? 1.5 : 1}
                            style={{ transition: 'all 0.1s ease' }}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Horizontal Labels */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 5px',
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-tertiary)',
                    marginTop: '0.25rem'
                  }}>
                    {CHART_DATA.map((pt) => (
                      <span key={pt.month}>{pt.month}</span>
                    ))}
                  </div>

                  {/* Chart Float Tooltip Overlay */}
                  {activeChartPoint !== null && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: `${15 + activeChartPoint * 18}%`,
                      transform: 'translateX(-50%)',
                      background: 'rgba(10,10,10,0.9)',
                      border: '1px solid var(--gold-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--gold-primary)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#ffffff', fontWeight: 800 }}>{CHART_DATA[activeChartPoint].display}</span>
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{CHART_DATA[activeChartPoint].month} 2026</span>
                    </div>
                  )}
                </div>
              </div>

              {/* LOWER HALF: QUICK ACTIONS MENUS */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                position: 'relative'
              }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
                  Quick Actions
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Generate Audit Report', file: 'Audit_Statement_Q2.pdf' },
                    { label: 'RBI Compliance Report', file: 'RBI_Compliance_Annexure_B.xlsx' },
                    { label: 'Customer Ledger Export', file: 'Customer_Ledger_Global.xlsx' },
                    { label: 'Vault Stock Statement', file: 'Vault_Inventory_Summary.pdf' },
                    { label: 'Overdue Accounts Report', file: 'Overdue_Gold_Loans_List.pdf' }
                  ].map((btn) => {
                    const isRunning = activeAction === btn.label;
                    return (
                      <button
                        key={btn.label}
                        disabled={activeAction !== null}
                        onClick={() => triggerQuickAction(btn.label, btn.file)}
                        style={{
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.625rem 0.875rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          color: isRunning ? 'var(--gold-primary)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: activeAction !== null ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          width: '100%'
                        }}
                        className="quick-action-row"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={12} style={{ color: isRunning ? 'var(--gold-primary)' : 'var(--text-tertiary)' }} />
                          <span>{btn.label}</span>
                        </div>
                        {isRunning ? (
                          <RefreshCw size={12} className="spin-slow" style={{ color: 'var(--gold-primary)' }} />
                        ) : (
                          <ChevronRight size={12} className="chevron-icon" style={{ color: 'var(--text-tertiary)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Status Toast Pop-up inside box */}
                {toastMessage && (
                  <div style={{
                    position: 'absolute',
                    inset: 'auto 1rem 1rem 1rem',
                    background: 'rgba(0, 46, 28, 0.95)',
                    border: '1px solid #10B981',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.6875rem',
                    color: '#A7F3D0',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.2s ease',
                    zIndex: 10
                  }}>
                    {toastMessage}
                  </div>
                )}
              </div>

            </div>

            {/* Column C: COMPLIANCE VERTICAL TRUST CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              
              {/* Stack Card 1: End-to-End Security */}
              <div 
                className="stacked-trust-card"
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(212,175,55,0.05)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--gold-primary)'
                }}>
                  <Shield size={14} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.125rem' }}>
                    End-to-End Security
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    Your data. Your gold. Always protected.
                  </p>
                </div>
              </div>

              {/* Stack Card 2: Zero Data Loss */}
              <div 
                className="stacked-trust-card"
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(212,175,55,0.05)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--gold-primary)'
                }}>
                  <Database size={14} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.125rem' }}>
                    Zero Data Loss
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    Encrypted backup every 6 minutes.
                  </p>
                </div>
              </div>

              {/* Stack Card 3: 100% Traceability */}
              <div 
                className="stacked-trust-card"
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(212,175,55,0.05)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--gold-primary)'
                }}>
                  <Fingerprint size={14} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.125rem' }}>
                    100% Traceability
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    Every action. Every record. Always traceable.
                  </p>
                </div>
              </div>

              {/* Stack Card 4: Trust That Grows Your Business */}
              <div 
                className="stacked-trust-card"
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(212,175,55,0.05)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--gold-primary)'
                }}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.125rem' }}>
                    Trust That Grows Your Business
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    Transparency builds trust. Trust builds loyalty.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER CALLOUT BRAND LINE */}
        <div 
          className="reveal-item"
          style={{
            textAlign: 'center',
            marginTop: '3.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: 'var(--text-tertiary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            flexWrap: 'wrap'
          }}
        >
          {/* Laurel Icon Left */}
          <span style={{ fontSize: '1rem', color: 'var(--gold-primary)' }}>🌿</span>
          <span>Built for modern gold finance businesses that demand complete control, transparency, and security.</span>
          {/* Laurel Icon Right */}
          <span style={{ fontSize: '1rem', color: 'var(--gold-primary)' }}>🌿</span>
        </div>

      </div>
    </section>
  );
}
