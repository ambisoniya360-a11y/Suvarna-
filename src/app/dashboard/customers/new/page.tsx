'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer } from '@/actions/customer-actions';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { User, Phone, CreditCard, MapPin, Upload, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { CustomerFormData, Gender, CustomerStatus } from '@/types';

const ORNAMENT_STEPS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'identity', label: 'Identity', icon: CreditCard },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'documents', label: 'Documents', icon: Upload },
];

export default function NewCustomerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Partial<CustomerFormData>>({
    status: 'Active',
    gender: 'Male',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);

  const supabase = createClient();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileUpload = async (
    file: File,
    bucket: string,
    field: string,
    setPreview: (url: string) => void
  ) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${bucket}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(path);

      setForm((prev) => ({ ...prev, [field]: publicUrl }));
      setPreview(URL.createObjectURL(file));
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Upload failed. Check storage bucket permissions.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.full_name || !form.mobile_number) {
      toast.error('Name and mobile number are required');
      return;
    }

    startTransition(async () => {
      const result = await createCustomer(form as CustomerFormData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Customer created successfully!');
        router.push(`/dashboard/customers/${result.data?.id}`);
      }
    });
  };

  return (
    <div className="dashboard-content" style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/dashboard/customers" className="btn btn-ghost btn-sm" style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Customers
          </Link>
          <h1 className="page-title">Add New Customer</h1>
          <p className="page-subtitle">Complete KYC for a new customer</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {ORNAMENT_STEPS.map((s, i) => (
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
        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gold-primary)' }}>
              Personal Information
            </h3>

            {/* Photo upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: photoPreview ? 'none' : 'var(--gold-subtle)',
                  border: '2px dashed var(--gold-border)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={28} style={{ color: 'var(--gold-primary)', opacity: 0.6 }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Customer Photo</p>
                <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  JPG, PNG. Max 5MB.
                </p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={uploading}
                  id="upload-photo-btn"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Upload Photo
                </button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'photos', 'photo_url', setPhotoPreview);
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Full Name *</label>
                <input
                  id="customer-full-name"
                  className="form-input"
                  value={form.full_name ?? ''}
                  onChange={(e) => update('full_name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  id="customer-mobile"
                  className="form-input"
                  type="tel"
                  value={form.mobile_number ?? ''}
                  onChange={(e) => update('mobile_number', e.target.value)}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alternate Mobile</label>
                <input
                  id="customer-alt-mobile"
                  className="form-input"
                  type="tel"
                  value={form.alternate_mobile ?? ''}
                  onChange={(e) => update('alternate_mobile', e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  id="customer-email"
                  className="form-input"
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  id="customer-dob"
                  className="form-input"
                  type="date"
                  value={form.date_of_birth ?? ''}
                  onChange={(e) => update('date_of_birth', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  id="customer-gender"
                  className="form-select"
                  value={form.gender ?? 'Male'}
                  onChange={(e) => update('gender', e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  id="customer-status"
                  className="form-select"
                  value={form.status ?? 'Active'}
                  onChange={(e) => update('status', e.target.value as CustomerStatus)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gold-primary)' }}>
              Identity Documents
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input
                  id="customer-aadhaar"
                  className="form-input"
                  value={form.aadhaar_number ?? ''}
                  onChange={(e) => update('aadhaar_number', e.target.value)}
                  placeholder="12-digit Aadhaar"
                  maxLength={12}
                />
              </div>
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  id="customer-pan"
                  className="form-input"
                  value={form.pan_number ?? ''}
                  onChange={(e) => update('pan_number', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nominee Name</label>
                <input
                  id="customer-nominee"
                  className="form-input"
                  value={form.nominee_name ?? ''}
                  onChange={(e) => update('nominee_name', e.target.value)}
                  placeholder="Nominee's full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nominee Relation</label>
                <select
                  id="customer-nominee-relation"
                  className="form-select"
                  value={form.nominee_relation ?? ''}
                  onChange={(e) => update('nominee_relation', e.target.value)}
                >
                  <option value="">Select relation</option>
                  <option>Spouse</option>
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Son</option>
                  <option>Daughter</option>
                  <option>Sibling</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gold-primary)' }}>
              Address Details
            </h3>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                id="customer-address"
                className="form-textarea"
                value={form.address ?? ''}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Door no, Street name, Area"
                rows={3}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  id="customer-city"
                  className="form-input"
                  value={form.city ?? ''}
                  onChange={(e) => update('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  id="customer-state"
                  className="form-input"
                  value={form.state ?? ''}
                  onChange={(e) => update('state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  id="customer-pincode"
                  className="form-input"
                  value={form.pincode ?? ''}
                  onChange={(e) => update('pincode', e.target.value)}
                  placeholder="6-digit PIN"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gold-primary)' }}>
              Upload Documents
            </h3>

            {/* Aadhaar upload */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Aadhaar Card
              </label>
              <div
                className="upload-zone"
                onClick={() => document.getElementById('aadhaar-upload')?.click()}
                style={{ cursor: 'pointer' }}
              >
                {aadhaarPreview ? (
                  <img src={aadhaarPreview} alt="Aadhaar" style={{ maxHeight: '120px', borderRadius: 'var(--radius-md)' }} />
                ) : (
                  <>
                    <Upload size={32} style={{ color: 'var(--gold-primary)', opacity: 0.6, marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Click to upload Aadhaar card</p>
                  </>
                )}
                <input
                  id="aadhaar-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'kyc', 'aadhaar_url', setAadhaarPreview);
                  }}
                />
              </div>
            </div>

            {/* PAN upload */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                PAN Card
              </label>
              <div
                className="upload-zone"
                onClick={() => document.getElementById('pan-upload')?.click()}
                style={{ cursor: 'pointer' }}
              >
                {panPreview ? (
                  <img src={panPreview} alt="PAN" style={{ maxHeight: '120px', borderRadius: 'var(--radius-md)' }} />
                ) : (
                  <>
                    <Upload size={32} style={{ color: 'var(--gold-primary)', opacity: 0.6, marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Click to upload PAN card</p>
                  </>
                )}
                <input
                  id="pan-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'kyc', 'pan_url', setPanPreview);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
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

          {step < ORNAMENT_STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => setStep((s) => s + 1)}
              id="next-step-btn"
            >
              <span>Next</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-gold"
              onClick={handleSubmit}
              disabled={isPending || uploading}
              id="submit-customer-btn"
            >
              {isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Saving…</>
              ) : (
                <span>Create Customer</span>
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
