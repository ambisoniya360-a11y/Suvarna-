'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Building,
  Mail,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useSignupStore } from '@/lib/signup-store';

export default function SuccessClient() {
  const router = useRouter();
  const { formData, reset } = useSignupStore();

  // If store shows not provisioned, redirect back to signup
  useEffect(() => {
    if (!formData.provisioned) {
      router.push('/signup');
    }
  }, [formData, router]);

  // Clean up store state when leaving page
  const handleProceedToLogin = () => {
    reset();
    router.push('/login');
  };

  if (!formData.provisioned) {
    return null;
  }

  // Calculate subscription end date display
  const subEnd = new Date();
  if (formData.billingCycle === 'yearly') {
    subEnd.setFullYear(subEnd.getFullYear() + 1);
  } else {
    subEnd.setMonth(subEnd.getMonth() + 1);
  }
  const formattedEndDate = subEnd.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="signup-page">
      {/* Background effects */}
      <div className="signup-bg">
        <div className="signup-bg-orb signup-bg-orb-1" />
        <div className="signup-bg-orb signup-bg-orb-2" />
        <div className="signup-bg-grid" />
      </div>

      <div className="success-container animate-scale-up">
        {/* Celebration Header */}
        <div className="success-icon-wrapper">
          <div className="pulse-ring" />
          <CheckCircle size={64} className="success-check-icon" />
        </div>

        <div className="success-header">
          <span className="welcome-tag">
            <Award size={14} /> Welcome to the Elite
          </span>
          <h1>Registration Successful!</h1>
          <p>
            Your SuvarnaLoan ERP store is fully provisioned and ready for business.
          </p>
        </div>

        {/* Credentials and Plan info */}
        <div className="success-details-card">
          <h2>Store Details</h2>
          
          <div className="detail-rows">
            <div className="detail-row">
              <div className="detail-row-icon">
                <Building size={18} />
              </div>
              <div className="detail-row-text">
                <span>Shop / Company Name</span>
                <strong>{formData.shopName}</strong>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-row-icon">
                <Mail size={18} />
              </div>
              <div className="detail-row-text">
                <span>Login Username / Email</span>
                <strong>{formData.email}</strong>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-row-icon">
                <Calendar size={18} />
              </div>
              <div className="detail-row-text">
                <span>Subscription Active Until</span>
                <strong>{formattedEndDate}</strong>
              </div>
            </div>
          </div>

          <div className="notice-box">
            <ShieldCheck size={16} />
            <span>
              Use the email address above and the password you created to log in as <strong>Shop Owner</strong>.
            </span>
          </div>
        </div>

        <div className="success-actions">
          <button
            type="button"
            className="btn btn-gold btn-lg proceed-btn"
            onClick={handleProceedToLogin}
            id="go-to-login-btn"
          >
            <span>Proceed to Login</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .signup-page {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          position: relative;
          overflow-x: hidden;
          padding: 4rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
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

        /* Success Card Container */
        .success-container {
          position: relative;
          z-index: 10;
          max-width: 520px;
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--gold-border);
          border-radius: var(--radius-lg);
          padding: 3rem 2.5rem;
          text-align: center;
          box-shadow: 0 12px 48px rgba(212, 175, 55, 0.12);
        }

        /* Animated Success Icon */
        .success-icon-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-check-icon {
          color: var(--gold-primary);
          z-index: 2;
          filter: drop-shadow(0 4px 12px rgba(212, 175, 55, 0.3));
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid var(--gold-primary);
          border-radius: 50%;
          opacity: 0;
          animation: pulse 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
          z-index: 1;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        /* Success Header */
        .success-header h1 {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0.75rem 0 0.5rem;
        }

        .success-header p {
          color: var(--text-secondary);
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .welcome-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--gold-subtle);
          color: var(--gold-primary);
          border: 1px solid var(--gold-border);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
        }

        /* Success details card */
        .success-details-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1.5rem 1.75rem;
          margin: 2.5rem 0 2rem;
          text-align: left;
        }

        .success-details-card h2 {
          font-size: 0.875rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.5rem;
        }

        .detail-rows {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-row {
          display: flex;
          gap: 0.875rem;
          align-items: flex-start;
        }

        .detail-row-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .detail-row-text {
          display: flex;
          flex-direction: column;
        }

        .detail-row-text span {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .detail-row-text strong {
          font-size: 0.9375rem;
          color: var(--text-primary);
          font-weight: 600;
          word-break: break-all;
        }

        .notice-box {
          display: flex;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.04);
          border: 1px solid rgba(16, 185, 129, 0.12);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          margin-top: 1.25rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .notice-box :global(svg) {
          color: var(--color-success);
          flex-shrink: 0;
        }

        .notice-box strong {
          color: var(--color-success);
        }

        /* Actions */
        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .proceed-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .animate-scale-up {
          animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 576px) {
          .success-container {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
