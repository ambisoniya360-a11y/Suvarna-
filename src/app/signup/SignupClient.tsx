'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  Loader2,
  Shield,
  Gem,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useSignupStore } from '@/lib/signup-store';

const PLANS = [
  {
    id: 'Professional' as const,
    icon: Gem,
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
    id: 'Enterprise' as const,
    icon: Crown,
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

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, setFormData } = useSignupStore();

  const [step, setStep] = useState<'plan' | 'details'>('plan');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    formData.billingCycle || 'monthly'
  );

  // Pre-select plan from URL query
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      const matched = PLANS.find(
        (p) => p.id.toLowerCase() === planParam.toLowerCase()
      );
      if (matched) {
        setFormData({ plan: matched.id });
        setStep('details');
      }
    }
  }, [searchParams, setFormData]);

  const selectedPlan = PLANS.find((p) => p.id === formData.plan) || PLANS[0];

  const handlePlanSelect = (planId: 'Professional' | 'Enterprise') => {
    setFormData({ plan: planId, billingCycle });
    setStep('details');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.shopName.trim())
      newErrors.shopName = 'Shop name is required';
    if (!formData.ownerName.trim())
      newErrors.ownerName = 'Owner name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormData({ billingCycle });
    router.push('/signup/payment');
  };

  return (
    <div className="signup-page">
      {/* Background effects */}
      <div className="signup-bg">
        <div className="signup-bg-orb signup-bg-orb-1" />
        <div className="signup-bg-orb signup-bg-orb-2" />
        <div className="signup-bg-grid" />
      </div>

      {/* Header */}
      <header className="signup-header">
        <Link href="/" className="signup-brand">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <polygon
              points="18,2 34,10 34,26 18,34 2,26 2,10"
              stroke="#D4AF37"
              strokeWidth="1.5"
              fill="rgba(212,175,55,0.08)"
            />
            <circle cx="18" cy="18" r="4" fill="#D4AF37" />
          </svg>
          <span className="signup-brand-text">
            Suvarna<span style={{ color: 'var(--gold-primary)' }}>Loan</span>
          </span>
        </Link>
        <Link href="/login" className="btn btn-outline btn-sm">
          Already have an account? Sign In
        </Link>
      </header>

      {/* Step Indicator */}
      <div className="signup-steps">
        <div className={`signup-step ${step === 'plan' ? 'active' : 'done'}`}>
          <div className="signup-step-dot">
            {step === 'details' ? <CheckCircle size={14} /> : '1'}
          </div>
          <span>Choose Plan</span>
        </div>
        <div className="signup-step-line" />
        <div className={`signup-step ${step === 'details' ? 'active' : ''}`}>
          <div className="signup-step-dot">2</div>
          <span>Business Details</span>
        </div>
        <div className="signup-step-line" />
        <div className="signup-step">
          <div className="signup-step-dot">3</div>
          <span>Payment</span>
        </div>
      </div>

      {/* ─── STEP 1: Plan Selection ──────────────────── */}
      {step === 'plan' && (
        <div className="signup-plan-container animate-fade-in-up">
          <div className="signup-section-header">
            <Sparkles
              size={20}
              style={{ color: 'var(--gold-primary)' }}
            />
            <h1>Choose Your Plan</h1>
            <p>Select the plan that fits your business. Upgrade or downgrade anytime.</p>
          </div>

          {/* Billing Toggle */}
          <div className="billing-toggle">
            <button
              className={`billing-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`billing-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="billing-badge">Save 17%</span>
            </button>
          </div>

          <div className="signup-plans-grid">
            {PLANS.map((plan) => {
              const PlanIcon = plan.icon;
              const price =
                billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
              const perLabel = billingCycle === 'yearly' ? '/year' : '/month';

              return (
                <div
                  key={plan.id}
                  className={`signup-plan-card ${plan.isPopular ? 'featured' : ''} ${formData.plan === plan.id ? 'selected' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="signup-plan-badge">Most Popular</div>
                  )}

                  <div className="signup-plan-icon">
                    <PlanIcon size={28} />
                  </div>

                  <h3>{plan.name}</h3>
                  <p className="signup-plan-desc">{plan.description}</p>

                  <div className="signup-plan-price">
                    <span className="signup-plan-currency">₹</span>
                    <span className="signup-plan-amount">
                      {price.toLocaleString('en-IN')}
                    </span>
                    <span className="signup-plan-period">{perLabel}</span>
                  </div>

                  {billingCycle === 'yearly' && (
                    <p className="signup-plan-savings">
                      ₹{(plan.price * 12 - plan.yearlyPrice).toLocaleString('en-IN')} saved per year
                    </p>
                  )}

                  <ul className="signup-plan-features">
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <CheckCircle size={14} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`btn ${plan.isPopular ? 'btn-gold' : 'btn-outline'} btn-lg`}
                    style={{ width: '100%' }}
                    onClick={() => handlePlanSelect(plan.id)}
                    id={`select-${plan.id.toLowerCase()}-btn`}
                  >
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── STEP 2: Business Details Form ───────────── */}
      {step === 'details' && (
        <div className="signup-details-container animate-fade-in-up">
          <div className="signup-section-header">
            <Shield size={20} style={{ color: 'var(--gold-primary)' }} />
            <h1>Create Your Account</h1>
            <p>
              Setting up <strong style={{ color: 'var(--gold-primary)' }}>{selectedPlan.name}</strong> plan
              {' · '}
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '0.875rem', color: 'var(--gold-primary)', textDecoration: 'underline' }}
                onClick={() => setStep('plan')}
              >
                Change plan
              </button>
            </p>
          </div>

          {/* Selected Plan Summary */}
          <div className="signup-selected-summary">
            <div className="signup-summary-plan">
              <selectedPlan.icon size={20} style={{ color: 'var(--gold-primary)' }} />
              <div>
                <strong>{selectedPlan.name}</strong>
                <span>
                  ₹{(billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price).toLocaleString('en-IN')}
                  {billingCycle === 'yearly' ? '/year' : '/month'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Shop Name */}
            <div className="form-group">
              <label htmlFor="shopName" className="form-label">
                Shop / Company Name
              </label>
              <div className="input-icon-wrapper">
                <Building2 size={16} className="input-icon" />
                <input
                  id="shopName"
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ shopName: e.target.value })}
                  className={`form-input input-with-icon ${errors.shopName ? 'input-error' : ''}`}
                  placeholder="e.g. Rajesh Gold Finance"
                />
              </div>
              {errors.shopName && (
                <span className="form-error">{errors.shopName}</span>
              )}
            </div>

            {/* Owner Name */}
            <div className="form-group">
              <label htmlFor="ownerName" className="form-label">
                Owner Full Name
              </label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="ownerName"
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ownerName: e.target.value })}
                  className={`form-input input-with-icon ${errors.ownerName ? 'input-error' : ''}`}
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
              {errors.ownerName && (
                <span className="form-error">{errors.ownerName}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="signupEmail" className="form-label">
                Email Address
              </label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="signupEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ email: e.target.value })}
                  className={`form-input input-with-icon ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@yourbusiness.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="signupPassword" className="form-label">
                Create Password
              </label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ password: e.target.value })}
                  className={`form-input input-with-icon input-with-action ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-action-btn"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`form-input input-with-icon input-with-action ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="input-action-btn"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Mobile */}
            <div className="form-group">
              <label htmlFor="mobile" className="form-label">
                Mobile Number
              </label>
              <div className="input-icon-wrapper">
                <Phone size={16} className="input-icon" />
                <input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ mobile: e.target.value })}
                  className={`form-input input-with-icon ${errors.mobile ? 'input-error' : ''}`}
                  placeholder="9876543210"
                  autoComplete="tel"
                />
              </div>
              {errors.mobile && (
                <span className="form-error">{errors.mobile}</span>
              )}
            </div>

            {/* Actions */}
            <div className="signup-form-actions">
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => setStep('plan')}
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="btn btn-gold btn-lg"
                id="proceed-to-payment-btn"
              >
                <span>Proceed to Payment</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textAlign: 'center',
                marginTop: '0.5rem',
              }}
            >
              🔒 Your data is encrypted and secured with bank-grade security.
              <br />
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      )}

      <style jsx>{`
        .signup-page {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          position: relative;
          overflow-x: hidden;
          padding-bottom: 4rem;
        }

        .signup-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .signup-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.4;
        }

        .signup-bg-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.12), transparent);
          top: -200px;
          right: -200px;
        }

        .signup-bg-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.08), transparent);
          bottom: -150px;
          left: -150px;
        }

        .signup-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(212, 175, 55, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .signup-header {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .signup-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
        }

        .signup-brand-text {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        /* Steps indicator */
        .signup-steps {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.5rem 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .signup-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .signup-step.active {
          color: var(--gold-primary);
        }

        .signup-step.done {
          color: var(--color-success);
        }

        .signup-step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .signup-step.active .signup-step-dot {
          border-color: var(--gold-primary);
          background: var(--gold-subtle);
          color: var(--gold-primary);
        }

        .signup-step.done .signup-step-dot {
          border-color: var(--color-success);
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }

        .signup-step-line {
          flex: 1;
          max-width: 60px;
          height: 2px;
          background: var(--border-subtle);
          border-radius: 1px;
        }

        /* Section headers */
        .signup-section-header {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 10;
        }

        .signup-section-header h1 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0.75rem 0 0.5rem;
        }

        .signup-section-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        /* Billing toggle */
        .billing-toggle {
          display: flex;
          justify-content: center;
          gap: 0.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 0.25rem;
          max-width: 320px;
          margin: 0 auto 2.5rem;
          position: relative;
          z-index: 10;
        }

        .billing-btn {
          flex: 1;
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--text-tertiary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .billing-btn.active {
          background: var(--gold-subtle);
          color: var(--gold-primary);
          border: 1px solid var(--gold-border);
        }

        .billing-badge {
          font-size: 0.625rem;
          background: var(--gold-primary);
          color: #050505;
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Plans grid */
        .signup-plan-container {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .signup-plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .signup-plan-card {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 2rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .signup-plan-card:hover {
          border-color: var(--gold-border);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.08);
        }

        .signup-plan-card.featured {
          border-color: var(--gold-border);
          background: linear-gradient(
            135deg,
            rgba(212, 175, 55, 0.04),
            var(--bg-card)
          );
        }

        .signup-plan-card.selected {
          border-color: var(--gold-primary);
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }

        .signup-plan-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gold-primary);
          color: #050505;
          padding: 0.25rem 1.25rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .signup-plan-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--gold-subtle);
          border: 1px solid var(--gold-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold-primary);
          margin-bottom: 1.25rem;
        }

        .signup-plan-card h3 {
          font-size: 1.375rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .signup-plan-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .signup-plan-price {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .signup-plan-currency {
          font-size: 1rem;
          color: var(--gold-primary);
          font-weight: 600;
        }

        .signup-plan-amount {
          font-size: 2.75rem;
          font-weight: 900;
          color: var(--gold-primary);
          font-family: var(--font-mono);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .signup-plan-period {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .signup-plan-savings {
          font-size: 0.8125rem;
          color: var(--color-success);
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .signup-plan-features {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .signup-plan-features li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .signup-plan-features li :global(svg) {
          color: var(--gold-primary);
          flex-shrink: 0;
        }

        /* Details form */
        .signup-details-container {
          position: relative;
          z-index: 10;
          max-width: 540px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .signup-selected-summary {
          background: var(--bg-card);
          border: 1px solid var(--gold-border);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
        }

        .signup-summary-plan {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .signup-summary-plan div {
          display: flex;
          flex-direction: column;
        }

        .signup-summary-plan strong {
          font-weight: 700;
          font-size: 0.9375rem;
        }

        .signup-summary-plan span {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-error {
          font-size: 0.75rem;
          color: var(--color-error);
          margin-top: 0.25rem;
          display: block;
        }

        .input-error {
          border-color: var(--color-error) !important;
        }

        .signup-form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .signup-form-actions .btn {
          flex: 1;
        }

        .input-icon-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .input-with-icon {
          padding-left: 2.5rem !important;
        }

        .input-with-action {
          padding-right: 2.75rem !important;
        }

        .input-action-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .input-action-btn:hover {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .signup-header {
            padding: 1rem;
          }

          .signup-plans-grid {
            grid-template-columns: 1fr;
          }

          .signup-form-actions {
            flex-direction: column-reverse;
          }
        }
      `}</style>
    </div>
  );
}
