import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, BarChart3, Users, Gem, Scale, CreditCard, Phone, FileText, GitBranch, UserCheck, Bell, Star } from 'lucide-react';
import HeroScrollytelling from '@/components/home/HeroScrollytelling';
import { HomeNavbar, HomeFooter } from '@/components/home/HomeNav';

export const metadata: Metadata = {
  title: 'SuvarnaLoan ERP — Transforming Gold Into Trust',
  description: 'Premium gold loan ERP software for jewelers, pawnbrokers, and NBFCs. Manage customers, loans, gold valuations, payments, and reports — all in one platform.',
};

const FEATURES = [
  { icon: Users, title: 'Customer Management', desc: 'Full KYC, photo upload, Aadhaar/PAN verification with document storage.' },
  { icon: Gem, title: 'Gold Loan Management', desc: 'End-to-end loan lifecycle from creation to closure with full audit trail.' },
  { icon: Scale, title: 'Gold Valuation', desc: 'Real-time calculator with live market rates, purity detection, and hallmark verification.' },
  { icon: BarChart3, title: 'Interest Calculation', desc: 'Automated monthly interest with EMI schedules and due date tracking.' },
  { icon: CreditCard, title: 'Payment Tracking', desc: 'Record payments, generate receipts, and track payment history per loan.' },
  { icon: Bell, title: 'WhatsApp & SMS Alerts', desc: 'Automated reminders for overdue loans and payment due dates.' },
  { icon: FileText, title: 'Reports & Analytics', desc: 'Portfolio analytics with PDF/Excel export for loan, payment, and customer reports.' },
  { icon: GitBranch, title: 'Branch Management', desc: 'Multi-branch support with branch-wise performance tracking.' },
  { icon: UserCheck, title: 'Staff Roles', desc: 'Role-based access: Super Admin, Branch Admin, Staff, and Viewer.' },
  { icon: Shield, title: 'Document Storage', desc: 'Secure cloud storage for all KYC documents with encrypted access.' },
  { icon: Phone, title: 'Mobile Responsive', desc: 'Access from any device — desktop, tablet, or smartphone.' },
  { icon: CheckCircle, title: 'Auction Workflow', desc: 'Manage overdue loans through an end-to-end auction workflow.' },
];

const WORKFLOW = [
  { step: 1, title: 'Customer Arrives', desc: 'Record customer details, complete KYC, and upload documents.' },
  { step: 2, title: 'Gold Valuation', desc: 'Weigh jewelry, assess purity, scan hallmarks, and calculate value.' },
  { step: 3, title: 'Loan Sanction', desc: 'Generate loan agreement, decide interest rate, and disburse amount.' },
  { step: 4, title: 'Interest Tracking', desc: 'Automated monthly interest calculation and payment reminders.' },
  { step: 5, title: 'Payment Collection', desc: 'Record payments, generate receipts, and update loan status.' },
  { step: 6, title: 'Loan Closure', desc: 'Return gold on full settlement and close the loan automatically.' },
  { step: 7, title: 'Business Reporting', desc: 'Generate portfolio reports, analytics, and export data.' },
];

const TESTIMONIALS = [
  {
    name: 'Rajan Patel',
    company: 'Patel Gold Finance, Surat',
    role: 'Owner',
    rating: 5,
    text: 'SuvarnaLoan ERP transformed how we manage 500+ active loans. The gold valuation tool alone saves us 2 hours daily. Absolutely worth every rupee.',
  },
  {
    name: 'Priya Krishnamurthy',
    company: 'Lakshmi Gold Loans, Chennai',
    role: 'Branch Manager',
    rating: 5,
    text: 'Managing 3 branches was a nightmare before SuvarnaLoan. Now everything is in one place — customers, loans, payments. Outstanding platform.',
  },
  {
    name: 'Amit Sharma',
    company: 'Sharma Jewellers & Finance, Jaipur',
    role: 'Director',
    rating: 5,
    text: 'The WhatsApp reminders and automatic interest calculation have reduced our overdue loans by 60%. This is the ERP every gold lender needs.',
  },
];

const PRICING = [
  {
    name: 'Professional',
    price: 9999,
    yearlyPrice: 99990,
    description: 'For growing and established gold loan businesses',
    features: [
      'Up to 2,000 customers',
      'Up to 15 staff members',
      'Up to 5 branches',
      'Full gold loan lifecycle management',
      'Automated WhatsApp & SMS alerts',
      'Advanced ledger & reports',
      'Excel/PDF export & data backups',
      'Priority 24/7 support',
    ],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 24999,
    yearlyPrice: 249990,
    description: 'For NBFCs and multi-branch operations',
    features: [
      'Unlimited customers',
      'Unlimited staff members',
      'Unlimited branches',
      'Full premium ERP suite',
      'Custom integrations & API access',
      'Dedicated account manager',
      'White-label portal branding',
      '99.9% SLA & custom terms',
    ],
    isPopular: false,
  },
];

const TRUSTED_BY = [
  'Tanishq Partner Stores', 'Malabar Gold', 'Kalyan Jewellers',
  'IIFL Gold Loans', 'Manappuram Finance', 'Rupeek Gold',
  'SBI Gold Loan DSA', 'IndusInd Gold Finance', 'Federal Bank Gold',
];

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ─── NAVBAR ──────────────────────────────────── */}
      <HomeNavbar />


      {/* ─── HERO SCROLLYTELLING ──────────────────── */}
      <HeroScrollytelling />

      {/* ─── TRUSTED BY ─────────────────────────── */}
      <section id="trusted" style={{ padding: '5rem 2rem', borderTop: '1px solid var(--border-subtle)' }}>
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '2.5rem',
        }}>
          Trusted by leading gold finance businesses across India
        </p>
        <div className="marquee-container">
          <div className="marquee-track">
            {[...TRUSTED_BY, ...TRUSTED_BY].map((company, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  padding: '0.75rem 2rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ──────────────────────── */}
      <section id="features" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', borderRadius: '100px', padding: '0.375rem 1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>
              All-in-one Platform
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
            Everything Your Gold Loan
            <br />
            <span className="text-gradient-gold">Business Needs.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '520px', margin: '0 auto' }}>
            12 powerful modules. One beautiful platform. Built for jewelers, pawnbrokers, and NBFCs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="feature-card">
              <div style={{
                width: 48, height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'var(--gold-subtle)',
                border: '1px solid var(--gold-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
                position: 'relative', zIndex: 1,
              }}>
                <Icon size={22} style={{ color: 'var(--gold-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.625rem', position: 'relative', zIndex: 1 }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WORKFLOW ────────────────────────────── */}
      <section id="workflow" style={{ padding: '6rem 2rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="workflow-grid-container">
          {/* Sticky side heading */}
          <div className="workflow-sticky-panel">
            <h2>
              From Gold to <span className="text-gradient-gold">Growth.</span>
            </h2>
            <p>
              The complete gold loan journey — digitized, automated, and tracked from start to finish.
            </p>
            <div className="workflow-sticky-accent" />
          </div>

          {/* Step cards */}
          <div className="workflow-timeline-list">
            {WORKFLOW.map((item) => (
              <div key={item.step} className="workflow-step-card">
                <div className="workflow-step-badge">
                  {String(item.step).padStart(2, '0')}
                </div>
                <div className="workflow-step-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────── */}
      <section id="testimonials" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
              Loved by Gold Finance <span className="text-gradient-gold">Professionals.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem' }}>
                  {Array.from({ length: t.rating }, (_, j) => (
                    <Star key={j} size={16} fill="var(--gold-primary)" color="var(--gold-primary)" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: '0.125rem' }}>{t.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────── */}
      <section id="pricing" style={{ padding: '6rem 2rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
              Transparent <span className="text-gradient-gold">Pricing.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              No hidden fees. Cancel anytime. 14-day free trial on all plans.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card ${plan.isPopular ? 'featured' : ''}`}
                style={{ position: 'relative' }}
              >
                {plan.isPopular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--gold-primary)', color: '#050505',
                    padding: '0.25rem 1.25rem', borderRadius: '100px',
                    fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{plan.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{plan.description}</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gold-primary)', fontWeight: 600 }}>₹</span>
                    <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {plan.price.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>/month</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
                    ₹{plan.yearlyPrice.toLocaleString('en-IN')}/year (2 months free)
                  </p>
                </div>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {plan.features.map((feature) => (
                    <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <CheckCircle size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/signup?plan=${plan.name.toLowerCase()}`}
                  className={`btn ${plan.isPopular ? 'btn-gold' : 'btn-outline'} btn-lg`}
                  style={{ width: '100%' }}
                  id={`pricing-${plan.name.toLowerCase()}-btn`}
                >
                  <span>Get Started</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────── */}
      <section style={{
        padding: '8rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: '1.5rem',
          }}>
            Ready to Modernize Your<br />
            <span className="text-gradient-gold-shimmer">Gold Loan Business?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '3rem', lineHeight: 1.6 }}>
            Join hundreds of gold finance businesses already using SuvarnaLoan ERP.
            Start your 14-day free trial today — no credit card required.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-gold btn-xl" id="final-cta-signup">
              <span>Get Started Now</span>
              <ArrowRight size={20} />
            </Link>
            <a href="tel:+919999999999" className="btn btn-outline btn-xl" id="final-cta-call">
              📞 Call Us
            </a>
          </div>
          <p style={{ marginTop: '2rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            🔒 Bank-grade security · 🇮🇳 Made in India · ₹0 setup cost
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────── */}
      <HomeFooter />


    </div>
  );
}
