import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to SuvarnaLoan ERP — your premium gold loan management platform.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="login-page">
      {/* Background effects */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-grid" />
      </div>

      {/* Login Container */}
      <div className="login-container animate-fade-in-up">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <polygon
                points="18,2 34,10 34,26 18,34 2,26 2,10"
                stroke="#D4AF37"
                strokeWidth="1.5"
                fill="rgba(212,175,55,0.08)"
              />
              <polygon
                points="18,8 28,13 28,23 18,28 8,23 8,13"
                fill="rgba(212,175,55,0.15)"
                stroke="#D4AF37"
                strokeWidth="1"
              />
              <circle cx="18" cy="18" r="4" fill="#D4AF37" />
            </svg>
          </div>
          <div>
            <h1 className="login-brand">
              Suvarna<span className="text-gradient-gold">Loan</span>
            </h1>
            <p className="login-tagline">Transforming Gold Into Trust.</p>
          </div>
        </div>

        {/* Card */}
        <div className="login-card glass-panel">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p className="text-muted">Sign in to your ERP dashboard</p>
          </div>

          <LoginForm />

          <div className="login-card-footer">
            <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
              🔒 Secured with 256-bit AES encryption &amp; Supabase RLS
            </p>
          </div>
        </div>

        <p className="login-help" style={{ textAlign: 'center', lineHeight: 1.6 }}>
          New to SuvarnaLoan?{' '}
          <Link href="/signup" style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
            Sign Up Now
          </Link>
          <br />
          Need help?{' '}
          <a href="mailto:support@suvarnaloan.com" style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
            Contact Support
          </a>
        </p>
      </div>


    </div>
  );
}
