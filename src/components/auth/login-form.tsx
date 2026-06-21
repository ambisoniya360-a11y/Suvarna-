'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthMode = 'password' | 'otp';

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard/overview');
    router.refresh();
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
      setSuccess(`Magic link sent to ${email}. Check your inbox.`);
    }
    setLoading(false);
  };

  return (
    <div className="login-form-wrapper">
      {/* Mode Toggle */}
      <div className="auth-mode-toggle">
        <button
          type="button"
          className={cn('mode-btn', mode === 'password' && 'active')}
          onClick={() => { setMode('password'); setError(null); setSuccess(null); }}
        >
          Password
        </button>
        <button
          type="button"
          className={cn('mode-btn', mode === 'otp' && 'active')}
          onClick={() => { setMode('otp'); setError(null); setSuccess(null); setOtpSent(false); }}
        >
          Magic Link
        </button>
      </div>

      {/* Error / Success Alerts */}
      {error && (
        <div className="alert alert-error animate-fade-in" role="alert">
          <span>⚠</span> {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success animate-fade-in" role="alert">
          <span>✓</span> {success}
        </div>
      )}

      {/* Password Login Form */}
      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input input-with-icon"
                placeholder="you@yourbusiness.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" className="form-label">Password</label>
              <button type="button" className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.125rem 0.25rem' }}>
                Forgot password?
              </button>
            </div>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input input-with-icon input-with-action"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-action-btn"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Signing in…</>
            ) : (
              <><span>Sign In</span><ArrowRight size={18} /></>
            )}
          </button>
        </form>
      )}

      {/* OTP / Magic Link Form */}
      {mode === 'otp' && (
        <form onSubmit={handleOtpRequest} className="auth-form">
          {!otpSent ? (
            <>
              <div className="form-group">
                <label htmlFor="otp-email" className="form-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="otp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input input-with-icon"
                    placeholder="you@yourbusiness.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-gold btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading}
                id="otp-request-btn"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending…</>
                ) : (
                  <><span>Send Magic Link</span><ArrowRight size={18} /></>
                )}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Check <strong style={{ color: 'var(--gold-primary)' }}>{email}</strong> for your magic link.
                It expires in 10 minutes.
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setOtpSent(false); setSuccess(null); }}
                style={{ marginTop: '1rem' }}
              >
                Use a different email
              </button>
            </div>
          )}
        </form>
      )}

      <style jsx>{`
        .login-form-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-mode-toggle {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.25rem;
          gap: 0.25rem;
        }

        .mode-btn {
          flex: 1;
          padding: 0.5rem;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-btn.active {
          background: var(--gold-subtle);
          color: var(--gold-primary);
          border: 1px solid var(--gold-border);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
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

        .input-action-btn:hover { color: var(--text-primary); }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
