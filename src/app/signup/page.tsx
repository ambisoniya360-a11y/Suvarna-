import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: 'Sign Up — Choose Your Plan',
  description:
    'Create your SuvarnaLoan ERP account. Choose Professional or Enterprise plan and get started in minutes.',
  robots: { index: true, follow: true },
};

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
        Loading...
      </div>
    }>
      <SignupClient />
    </Suspense>
  );
}
