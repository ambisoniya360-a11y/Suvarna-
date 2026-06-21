import type { Metadata } from 'next';
import PaymentClient from './PaymentClient';

export const metadata: Metadata = {
  title: 'Payment & Checkout — SuvarnaLoan ERP',
  description: 'Complete your registration. Secure subscription payment via Razorpay.',
  robots: { index: false, follow: false },
};

export default function PaymentPage() {
  return <PaymentClient />;
}
