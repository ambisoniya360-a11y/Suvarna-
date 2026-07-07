import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, BarChart3, Users, Gem, Scale, CreditCard, Phone, FileText, GitBranch, UserCheck, Bell, Star } from 'lucide-react';
import HeroScrollytelling from '@/components/home/HeroScrollytelling';
import { HomeNavbar, HomeFooter } from '@/components/home/HomeNav';
import DiaryVsDigital from '@/components/home/DiaryVsDigital';
import SecurityVaultIntelligence from '@/components/home/SecurityVaultIntelligence';
import GoldToGrowthWorkflow from '@/components/home/GoldToGrowthWorkflow';

export const metadata: Metadata = {
  title: 'SuvarnaLoan ERP — Transforming Gold Into Trust',
  description: 'Premium gold loan ERP software for jewelers, pawnbrokers, and NBFCs. Manage customers, loans, gold valuations, payments, and reports — all in one platform.',
};

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
    price: 999,
    yearlyPrice: 9999,
    description: 'For growing and established gold loan businesses',
    features: [
      'Up to 2,000 customers',
      'Single user login (No staff accounts)',
      'Single branch store only',
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
    price: 2499,
    yearlyPrice: 24999,
    description: 'For NBFCs and multi-branch operations',
    features: [
      'Unlimited customers',
      'Up to 10 staff members',
      'Up to 10 branches',
      'Full premium ERP suite',
      'Custom integrations & API access',
      'Dedicated account manager',
      'White-label portal branding',
      '99.9% SLA & custom terms',
    ],
    isPopular: false,
  },
];



export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ─── NAVBAR ──────────────────────────────────── */}
      <HomeNavbar />


      {/* ─── HERO SCROLLYTELLING ──────────────────── */}
      <HeroScrollytelling />

      {/* ─── TRADITIONAL VS DIGITAL CONVERSION SECTION ─── */}
      <DiaryVsDigital />



      {/* ─── SECURITY & VAULT INTELLIGENCE ──────── */}
      <SecurityVaultIntelligence />

      {/* ─── SCROLLYTELLING WORKFLOW ─────────────── */}
      <GoldToGrowthWorkflow />

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
