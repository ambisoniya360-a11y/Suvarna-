'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  User, Gem, Wallet, Search, ArrowLeft, Loader2, Plus, Info
} from 'lucide-react';
import { createGoldItem } from '@/actions/gold-actions';
import { createLoan } from '@/actions/loan-actions';
import { getCustomers } from '@/actions/customer-actions';
import type { Customer, OrnamentType, GoldPurity, LoanStatus } from '@/types';

const LOAN_STEPS = [
  { id: 'customer', label: 'Select Customer', icon: User },
  { id: 'gold', label: 'Gold Details', icon: Gem },
  { id: 'loan', label: 'Loan Terms', icon: Wallet },
];

export default function NewLoanPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);

  // Step 1: Customer Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Step 2: Gold Details
  const [ornamentType, setOrnamentType] = useState<OrnamentType>('Ring');
  const [goldDescription, setGoldDescription] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('');
  const [netWeight, setNetWeight] = useState(0);
  const [purity, setPurity] = useState<GoldPurity>('22K');
  const [hallmarkNumber, setHallmarkNumber] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');

  // Step 3: Loan Terms
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('2'); // default 2% per month
  const [loanDate, setLoanDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().split('T')[0];
  });
  const [schemeName, setSchemeName] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');

  // Auto calculate net weight
  useEffect(() => {
    const gross = parseFloat(grossWeight) || 0;
    const stone = parseFloat(stoneWeight) || 0;
    setNetWeight(Math.max(0, gross - stone));
  }, [grossWeight, stoneWeight]);

  // Real-time search for customers
  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setSearching(true);
      try {
        const res = await getCustomers({ search: val }, 1, 10);
        if (res.data) {
          setCustomers(res.data);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setSearching(false);
      }
    } else {
      setCustomers([]);
    }
  };

  const handleNextStep = () => {
    if (step === 0 && !selectedCustomer) {
      toast.error('Please select a customer to proceed');
      return;
    }
    if (step === 1) {
      if (!grossWeight || parseFloat(grossWeight) <= 0) {
        toast.error('Please enter a valid gross weight');
        return;
      }
      if (netWeight <= 0) {
        toast.error('Net weight must be greater than 0');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      setStep(0);
      return;
    }

    if (!grossWeight || parseFloat(grossWeight) <= 0 || netWeight <= 0) {
      toast.error('Please verify gold item weights');
      setStep(1);
      return;
    }

    const amount = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid loan amount');
      return;
    }

    if (isNaN(rate) || rate < 0) {
      toast.error('Please enter a valid interest rate');
      return;
    }

    if (!loanDate) {
      toast.error('Please enter a valid loan date');
      return;
    }

    startTransition(async () => {
      try {
        // Step 1: Create the Gold Item
        const goldRes = await createGoldItem({
          customer_id: selectedCustomer.id,
          ornament_type: ornamentType,
          description: goldDescription || undefined,
          gross_weight: parseFloat(grossWeight),
          stone_weight: parseFloat(stoneWeight) || undefined,
          net_weight: netWeight,
          purity: purity,
          hallmark_number: hallmarkNumber || undefined,
          estimated_value: estimatedValue ? parseFloat(estimatedValue) : undefined,
        });

        if (goldRes.error) {
          toast.error(`Gold Item Creation Failed: ${goldRes.error}`);
          return;
        }

        const goldItemId = goldRes.data?.id;
        if (!goldItemId) {
          toast.error('Failed to retrieve created gold item ID');
          return;
        }

        // Step 2: Create the Loan
        const loanRes = await createLoan({
          customer_id: selectedCustomer.id,
          gold_item_id: goldItemId,
          loan_amount: amount,
          interest_rate: rate,
          loan_date: loanDate,
          due_date: dueDate || undefined,
          scheme_name: schemeName || undefined,
          loan_purpose: loanPurpose || undefined,
          status: 'Active',
        });

        if (loanRes.error) {
          toast.error(`Loan Creation Failed: ${loanRes.error}`);
          return;
        }

        toast.success(loanRes.message || 'Gold loan created successfully!');
        
        // Redirect to newly created loan details or loans overview
        if (loanRes.data?.id) {
          router.push(`/dashboard/loans/${loanRes.data.id}?created=true`);
        } else {
          router.push('/dashboard/loans');
        }
      } catch (err: any) {
        toast.error(err.message || 'An unexpected error occurred during loan creation.');
      }
    });
  };

  return (
    <div className="dashboard-content" style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/dashboard/loans" className="btn btn-ghost btn-sm" style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Loans
          </Link>
          <h1 className="page-title">Add New Gold Loan</h1>
          <p className="page-subtitle">Disburse a new loan against gold ornaments</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {LOAN_STEPS.map((s, i) => (
          <div
            key={s.id}
            style={{ flex: 1, cursor: i <= step ? 'pointer' : 'default' }}
            onClick={() => i <= step && setStep(i)}
          >
            <div style={{
              height: '3px',
              borderRadius: '2px',
              background: i <= step ? 'var(--gold-primary)' : 'var(--border-subtle)',
              transition: 'background 0.3s',
              marginBottom: '0.5rem',
            }} />
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: i <= step ? 'var(--gold-primary)' : 'var(--text-tertiary)',
            }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {/* Step 0: Customer Selection */}
        {step === 0 && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--gold-primary)' }}>
              Select Customer Profile
            </h3>

            {/* Real-time search */}
            <div className="form-group">
              <label className="form-label" htmlFor="customer-search-input">Search Customer (Name, Mobile, or Aadhaar)</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  id="customer-search-input"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Type full name, mobile number, or Aadhaar..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {searching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Searching customer database...</span>
              </div>
            )}

            {/* Search Results */}
            {searchQuery.trim().length >= 2 && !searching && customers.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No customers found. Try a different query.</p>
            )}

            {customers.length > 0 && (
              <div className="card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="btn btn-ghost"
                    style={{ justifyContent: 'flex-start', padding: '0.75rem', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.125rem' }}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setSearchQuery('');
                      setCustomers([]);
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.full_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Mobile: {c.mobile_number} | Aadhaar: {c.aadhaar_number || '—'}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Customer Card */}
            {selectedCustomer && (
              <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--gold-border)', background: 'rgba(212, 175, 55, 0.05)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--gold-subtle)', color: 'var(--gold-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1.25rem', flexShrink: 0,
                  border: '1px solid var(--gold-border)'
                }}>
                  {selectedCustomer.full_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>{selectedCustomer.full_name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Mobile: {selectedCustomer.mobile_number}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>Aadhaar: {selectedCustomer.aadhaar_number || '—'}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedCustomer(null)}
                  style={{ color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.2)', backgroundColor: 'transparent' }}
                >
                  Change
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <Info size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, flex: 1 }}>
                New customer? Register them in the KYC section first to enable loan creation.
              </p>
              <Link href="/dashboard/customers/new" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
                <Plus size={14} /> Add Customer
              </Link>
            </div>
          </div>
        )}

        {/* Step 1: Gold Item Details */}
        {step === 1 && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--gold-primary)' }}>
              Gold Ornaments Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ornament-type">Ornament Type *</label>
                <select
                  id="ornament-type"
                  className="form-select"
                  value={ornamentType}
                  onChange={(e) => setOrnamentType(e.target.value as OrnamentType)}
                >
                  <option value="Ring">Ring</option>
                  <option value="Necklace">Necklace</option>
                  <option value="Chain">Chain</option>
                  <option value="Bangles">Bangles</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Coin">Coin</option>
                  <option value="Bracelet">Bracelet</option>
                  <option value="Anklet">Anklet</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="purity">Gold Purity *</label>
                <select
                  id="purity"
                  className="form-select"
                  value={purity}
                  onChange={(e) => setPurity(e.target.value as GoldPurity)}
                >
                  <option value="24K">24K (Pure Gold)</option>
                  <option value="22K">22K / 916</option>
                  <option value="18K">18K / 750</option>
                  <option value="16K">16K</option>
                  <option value="14K">14K / 585</option>
                  <option value="916">916 (Standard)</option>
                  <option value="750">750 (18K)</option>
                  <option value="585">585 (14K)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gross-weight">Gross Weight (grams) *</label>
                <input
                  id="gross-weight"
                  type="number"
                  step="0.001"
                  className="form-input"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="e.g. 15.450"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stone-weight">Stone Weight (grams)</label>
                <input
                  id="stone-weight"
                  type="number"
                  step="0.001"
                  className="form-input"
                  value={stoneWeight}
                  onChange={(e) => setStoneWeight(e.target.value)}
                  placeholder="e.g. 0.500"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="net-weight">Net Weight (grams) - Calculated</label>
                <input
                  id="net-weight"
                  type="number"
                  className="form-input"
                  value={netWeight.toFixed(3)}
                  disabled
                  style={{ opacity: 0.8, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="hallmark-number">Hallmark / HUID Number</label>
                <input
                  id="hallmark-number"
                  className="form-input"
                  value={hallmarkNumber}
                  onChange={(e) => setHallmarkNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. HUID123456"
                  maxLength={15}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="estimated-value">Estimated Gold Valuation (₹)</label>
                <input
                  id="estimated-value"
                  type="number"
                  className="form-input"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="e.g. 75000 (Based on current market rate)"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="gold-description">Item Description / Identification Marks</label>
                <textarea
                  id="gold-description"
                  className="form-textarea"
                  value={goldDescription}
                  onChange={(e) => setGoldDescription(e.target.value)}
                  placeholder="Describe details, e.g. 'Stone studded gold ring with floral design'"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Loan Terms */}
        {step === 2 && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--gold-primary)' }}>
              Loan Terms &amp; Settings
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="loan-amount">Loan Disbursement Amount (₹) *</label>
                <input
                  id="loan-amount"
                  type="number"
                  className="form-input"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="Enter loan amount"
                  required
                />
                {estimatedValue && parseFloat(loanAmount) > (parseFloat(estimatedValue) * 0.75) && (
                  <p style={{ fontSize: '0.75rem', color: '#faad14', marginTop: '0.25rem' }}>
                    ⚠️ Note: This amount exceeds 75% LTV (Loan-to-Value) threshold.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="interest-rate">Monthly Interest Rate (%) *</label>
                <input
                  id="interest-rate"
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="e.g. 1.5 or 2.0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="loan-date">Loan Disbursal Date *</label>
                <input
                  id="loan-date"
                  type="date"
                  className="form-input"
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="due-date">Loan Due Date</label>
                <input
                  id="due-date"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="scheme-name">Scheme Name</label>
                <input
                  id="scheme-name"
                  className="form-input"
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
                  placeholder="e.g. Standard Monthly Scheme"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="loan-purpose">Loan Purpose</label>
                <input
                  id="loan-purpose"
                  className="form-input"
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  placeholder="e.g. Agriculture, Personal"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            id="prev-step-btn"
          >
            Previous
          </button>

          {step < LOAN_STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-gold"
              onClick={handleNextStep}
              id="next-step-btn"
            >
              <span>Next</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-gold"
              onClick={handleSubmit}
              disabled={isPending}
              id="submit-loan-btn"
            >
              {isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Loan…</>
              ) : (
                <span>Create Gold Loan</span>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
