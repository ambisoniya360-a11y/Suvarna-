import type { Metadata } from 'next';
import SuccessClient from './SuccessClient';

export const metadata: Metadata = {
  title: 'Setup Successful — SuvarnaLoan ERP',
  description: 'Your shop has been successfully registered on SuvarnaLoan ERP.',
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return <SuccessClient />;
}
