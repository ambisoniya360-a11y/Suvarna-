'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Gem,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useSignupStore } from '@/lib/signup-store';

export default function PaymentClient() {
  const router = useRouter();
  const { formData, setFormData, getPlanPrice } = useSignupStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    mockMode: boolean;
  } | null>(null);

  // Redirect to signup step 1 if no user info has been input
  useEffect(() => {
    if (!formData.email || !formData.shopName || !formData.ownerName) {
      router.push('/signup');
    }
  }, [formData, router]);

  // Load Razorpay SDK Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Create Order when page loads
  useEffect(() => {
    if (!formData.email || !formData.shopName) return;

    let active = true;
    const createOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/signup/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: formData.plan,
            billingCycle: formData.billingCycle,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to create payment order. Please refresh and try again.');
        }

        const data = await res.json();
        if (active) {
          setOrderData(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'An error occurred while creating order.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    createOrder();

    return () => {
      active = false;
    };
  }, [formData.plan, formData.billingCycle, formData.email, formData.shopName]);

  const handlePayment = async () => {
    if (!orderData) return;

    setError(null);
    setLoading(true);

    try {
      if (orderData.mockMode) {
        // --- MOCK MODE PAYMENT ---
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Call the provision API with mock payment details
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            paymentId: 'mock_pay_' + Math.random().toString(36).substr(2, 9),
            orderId: orderData.orderId,
            signature: 'mock_sig_' + Math.random().toString(36).substr(2, 9),
            mockMode: true,
          }),
        });

        const signupResult = await res.json();

        if (!res.ok) {
          throw new Error(signupResult.error || 'Provisioning failed.');
        }

        // Save status to Zustand store and redirect to success page
        setFormData({ provisioned: true });
        router.push('/signup/success');
      } else {
        // --- REAL RAZORPAY INTEGRATION ---
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Razorpay SDK failed to load. Are you offline?');
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'SuvarnaLoan ERP',
          description: `${formData.plan} Plan - ${formData.billingCycle}`,
          image: '/favicon.ico', // or logo URL
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              setLoading(true);
              const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...formData,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  mockMode: false,
                }),
              });

              const signupResult = await res.json();
              if (!res.ok) {
                throw new Error(signupResult.error || 'Account setup failed after payment. Please contact support.');
              }

              setFormData({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                provisioned: true,
              });

              router.push('/signup/success');
            } catch (err: any) {
              setError(err.message || 'An error occurred during account provisioning.');
              setLoading(false);
            }
          },
          prefill: {
            name: formData.ownerName,
            email: formData.email,
            contact: formData.mobile,
          },
          notes: {
            shopName: formData.shopName,
          },
          theme: {
            color: '#D4AF37', // Gold color theme
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment.');
      setLoading(false);
    }
  };

  const pricing = getPlanPrice();
  const rawPrice = formData.plan === 'Enterprise' 
    ? (formData.billingCycle === 'yearly' ? 24999 : 2499)
    : (formData.billingCycle === 'yearly' ? 9999 : 999);
  
  // Tax breakdown (GST 18%)
  const subtotal = rawPrice;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const PlanIcon = formData.plan === 'Enterprise' ? Crown : Gem;

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
        <span className="secure-badge">
          <ShieldCheck size={16} /> Secure Checkout
        </span>
      </header>

      {/* Step Indicator */}
      <div className="signup-steps">
        <div className="signup-step done">
          <div className="signup-step-dot"><CheckCircle size={14} /></div>
          <span>Choose Plan</span>
        </div>
        <div className="signup-step-line done" />
        <div className="signup-step done">
          <div className="signup-step-dot"><CheckCircle size={14} /></div>
          <span>Business Details</span>
        </div>
        <div className="signup-step-line" />
        <div className="signup-step active">
          <div className="signup-step-dot">3</div>
          <span>Payment</span>
        </div>
      </div>

      {/* Payment Container */}
      <div className="payment-container animate-fade-in-up">
        <div className="signup-section-header">
          <CreditCard size={20} style={{ color: 'var(--gold-primary)' }} />
          <h1>Complete Your Payment</h1>
          <p>Review your order and proceed to secure checkout.</p>
        </div>

        {error && (
          <div className="payment-error-alert">
            <AlertCircle size={20} />
            <div>
              <strong>Payment Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="payment-grid">
          {/* Order Summary */}
          <div className="payment-summary-card">
            <h2>Order Summary</h2>
            
            <div className="plan-summary-box">
              <div className="plan-summary-icon">
                <PlanIcon size={24} />
              </div>
              <div className="plan-summary-details">
                <h3>{formData.plan} Plan</h3>
                <p>Billed {formData.billingCycle}</p>
              </div>
              <div className="plan-summary-price">
                ₹{subtotal.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Base Price</span>
                <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="price-row">
                <span>GST (18%)</span>
                <span>+ ₹{gst.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="price-row divider" />
              <div className="price-row total-row">
                <span>Total Due</span>
                <span>₹{total.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            <div className="business-summary">
              <h3>Shop Information</h3>
              <div className="summary-field">
                <span className="field-label">Shop Name</span>
                <span className="field-value">{formData.shopName}</span>
              </div>
              <div className="summary-field">
                <span className="field-label">Owner</span>
                <span className="field-value">{formData.ownerName}</span>
              </div>
              <div className="summary-field">
                <span className="field-label">Email</span>
                <span className="field-value">{formData.email}</span>
              </div>
              <div className="summary-field">
                <span className="field-label">Mobile</span>
                <span className="field-value">{formData.mobile}</span>
              </div>
            </div>
          </div>

          {/* Secure Payment Box */}
          <div className="payment-checkout-card">
            <h2>Payment Method</h2>
            <p className="payment-desc">
              All transactions are secured and encrypted. We support Cards, Netbanking, UPI, and Wallets via Razorpay.
            </p>

            {orderData?.mockMode && (
              <div className="mock-mode-banner">
                <Sparkles size={16} />
                <span>
                  <strong>Developer Mock Mode Active</strong> — No actual payment is required. Clicking pay will instantly provision your store for testing.
                </span>
              </div>
            )}

            <div className="secure-logos">
              <span>Razorpay Secure</span>
              <div className="badge-secured">PCI-DSS Compliant</div>
            </div>

            <div className="checkout-actions">
              <button
                type="button"
                className="btn btn-gold btn-lg checkout-btn"
                onClick={handlePayment}
                disabled={loading || !orderData}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>
                      {orderData?.mockMode ? 'Pay via Mock Payment' : `Pay ₹${total.toLocaleString('en-IN')}`}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => router.push('/signup')}
                disabled={loading}
              >
                <ArrowLeft size={18} />
                <span>Go Back</span>
              </button>
            </div>

            <div className="security-notice">
              <ShieldCheck size={16} />
              <span>
                128-bit SSL Encryption. Your payment details are never stored on our servers.
              </span>
            </div>
          </div>
        </div>
      </div>

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

        .secure-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--color-success);
          font-weight: 600;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-full);
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

        .signup-step-line.done {
          background: var(--color-success);
        }

        /* Payment container */
        .payment-container {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .signup-section-header {
          text-align: center;
          margin-bottom: 2.5rem;
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

        .payment-error-alert {
          display: flex;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
          color: #ef4444;
          font-size: 0.875rem;
        }

        .payment-error-alert strong {
          display: block;
          font-weight: 700;
          margin-bottom: 0.125rem;
        }

        .payment-error-alert p {
          margin: 0;
          color: var(--text-secondary);
        }

        .payment-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2rem;
          align-items: start;
        }

        .payment-summary-card,
        .payment-checkout-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 2.25rem;
        }

        .payment-summary-card h2,
        .payment-checkout-card h2 {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
        }

        .plan-summary-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }

        .plan-summary-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          background: var(--gold-subtle);
          border: 1px solid var(--gold-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold-primary);
          flex-shrink: 0;
        }

        .plan-summary-details h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
        }

        .plan-summary-details p {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin: 0.125rem 0 0;
          text-transform: capitalize;
        }

        .plan-summary-price {
          margin-left: auto;
          font-weight: 700;
          font-size: 1.125rem;
          font-family: var(--font-mono);
        }

        .price-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .price-row.divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 0.25rem 0;
        }

        .price-row.total-row {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .price-row.total-row span:last-child {
          color: var(--gold-primary);
          font-family: var(--font-mono);
          font-size: 1.25rem;
        }

        .business-summary {
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.5rem;
        }

        .business-summary h3 {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-field {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          margin-bottom: 0.5rem;
        }

        .field-label {
          color: var(--text-tertiary);
        }

        .field-value {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .payment-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .mock-mode-banner {
          display: flex;
          gap: 0.5rem;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: var(--radius-md);
          padding: 0.875rem 1rem;
          margin-bottom: 1.5rem;
          color: var(--gold-primary);
          font-size: 0.8125rem;
          line-height: 1.4;
        }

        .mock-mode-banner span {
          color: var(--text-secondary);
        }

        .mock-mode-banner strong {
          color: var(--gold-primary);
        }

        .secure-logos {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          margin-bottom: 2rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .badge-secured {
          font-size: 0.6875rem;
          background: rgba(16, 185, 129, 0.08);
          color: var(--color-success);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
          font-weight: 700;
          text-transform: uppercase;
        }

        .checkout-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .checkout-actions .btn-outline {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .security-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-top: 1.5rem;
          line-height: 1.4;
        }

        .security-notice :global(svg) {
          color: var(--color-success);
          flex-shrink: 0;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .payment-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .payment-summary-card,
          .payment-checkout-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
