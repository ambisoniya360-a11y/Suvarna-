import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// ── Tailwind class merger ─────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Currency Formatting ───────────────────────────────────
export function formatCurrency(
  amount: number,
  options?: { compact?: boolean; showSymbol?: boolean }
): string {
  const { compact = false, showSymbol = true } = options ?? {};

  if (compact) {
    if (amount >= 10000000) return `${showSymbol ? '₹' : ''}${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `${showSymbol ? '₹' : ''}${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `${showSymbol ? '₹' : ''}${(amount / 1000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ── Date Formatting ───────────────────────────────────────
export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  if (!date) return '—';
  return format(new Date(date), fmt);
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
}

export function timeAgo(date: string | Date): string {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ── Weight Formatting ─────────────────────────────────────
export function formatWeight(grams: number): string {
  return `${grams.toFixed(3)}g`;
}

// ── Loan Number Generator ─────────────────────────────────
export function generateLoanNumber(branchCode = 'HO'): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `SL-${branchCode}-${year}${month}-${random}`;
}

// ── Receipt Number Generator ──────────────────────────────
export function generateReceiptNumber(): string {
  const now = new Date();
  const ts = now.getTime().toString().slice(-6);
  return `RCP-${ts}`;
}

// ── Gold Value Calculator ─────────────────────────────────
export function calculateGoldValue(
  netWeight: number,
  purityPercentage: number,
  ratePerGram: number
): number {
  return (netWeight * purityPercentage * ratePerGram) / 100;
}

export function getPurityPercentage(purity: string): number {
  const map: Record<string, number> = {
    '24K': 99.9,
    '22K': 91.6,
    '918': 91.6,
    '916': 91.6,
    '18K': 75.0,
    '750': 75.0,
    '16K': 66.7,
    '14K': 58.5,
    '585': 58.5,
  };
  return map[purity] ?? 91.6;
}

export function calculateMaxLoanAmount(
  goldValue: number,
  ltvPercentage = 75
): number {
  return (goldValue * ltvPercentage) / 100;
}

// ── Interest Calculator ───────────────────────────────────
export function calculateMonthlyInterest(
  principal: number,
  monthlyRatePercent: number
): number {
  return (principal * monthlyRatePercent) / 100;
}

export function calculateTotalInterest(
  principal: number,
  monthlyRatePercent: number,
  months: number
): number {
  return calculateMonthlyInterest(principal, monthlyRatePercent) * months;
}

// ── Truncate Text ─────────────────────────────────────────
export function truncate(text: string, maxLength = 30): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

// ── Get Initials ──────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ── Status Color ──────────────────────────────────────────
export function getLoanStatusColor(status: string): string {
  const map: Record<string, string> = {
    Active: 'badge-active',
    Closed: 'badge-closed',
    Overdue: 'badge-overdue',
    Auctioned: 'badge-warning',
  };
  return map[status] ?? 'badge-gold';
}

export function getCustomerStatusColor(status: string): string {
  const map: Record<string, string> = {
    Active: 'badge-active',
    Inactive: 'badge-warning',
    Blacklisted: 'badge-overdue',
  };
  return map[status] ?? 'badge-gold';
}

// ── Debounce ──────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
