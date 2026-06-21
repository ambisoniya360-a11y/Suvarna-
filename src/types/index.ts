// ============================================================
// SuvarnaLoan ERP — TypeScript Interfaces
// ============================================================

export type UserRole = 'Super Admin' | 'Shop Owner' | 'Branch Admin' | 'Staff' | 'Viewer';
export type LoanStatus = 'Active' | 'Closed' | 'Overdue' | 'Auctioned';
export type PaymentType = 'Interest Payment' | 'Partial Payment' | 'Full Settlement';
export type PaymentMethod = 'Cash' | 'UPI' | 'NEFT' | 'RTGS' | 'Cheque' | 'Card';
export type OrnamentType = 'Necklace' | 'Ring' | 'Chain' | 'Bangles' | 'Earrings' | 'Coin' | 'Bracelet' | 'Anklet' | 'Other';
export type GoldPurity = '24K' | '22K' | '18K' | '16K' | '14K' | '916' | '750' | '585';
export type NotificationChannel = 'WhatsApp' | 'SMS' | 'Email';
export type CustomerStatus = 'Active' | 'Inactive' | 'Blacklisted';
export type Gender = 'Male' | 'Female' | 'Other';

// ── Shop / Tenant ─────────────────────────────────────────
export interface Shop {
  id: string;
  shop_name: string;
  owner_name: string;
  mobile: string;
  email?: string;
  address?: string;
  logo_url?: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  gstin?: string;
  license_number?: string;
  created_at: string;
}

// ── User Profile ──────────────────────────────────────────
export interface Profile {
  id: string;
  shop_id: string;
  branch_id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

// ── Branch ────────────────────────────────────────────────
export interface Branch {
  id: string;
  shop_id: string;
  name: string;
  address: string;
  phone?: string;
  manager_id?: string;
  is_active: boolean;
  created_at: string;
}

// ── Employee ──────────────────────────────────────────────
export interface Employee {
  id: string;
  shop_id: string;
  branch_id?: string;
  user_id?: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  salary?: number;
  joined_at?: string;
  is_active: boolean;
  created_at: string;
}

// ── Customer ──────────────────────────────────────────────
export interface Customer {
  id: string;
  shop_id: string;
  branch_id?: string;
  full_name: string;
  mobile_number: string;
  alternate_mobile?: string;
  email?: string;
  date_of_birth?: string;
  gender?: Gender;
  aadhaar_number?: string;
  pan_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  nominee_name?: string;
  nominee_relation?: string;
  photo_url?: string;
  aadhaar_url?: string;
  pan_url?: string;
  status: CustomerStatus;
  credit_score?: number;
  created_at: string;
}

// ── Gold Item ─────────────────────────────────────────────
export interface GoldItem {
  id: string;
  customer_id: string;
  shop_id: string;
  ornament_type: OrnamentType;
  description?: string;
  gross_weight: number;
  stone_weight?: number;
  net_weight: number;
  purity: GoldPurity;
  hallmark_number?: string;
  making_charges?: number;
  market_value_per_gram?: number;
  estimated_value?: number;
  front_image_url?: string;
  back_image_url?: string;
  created_at: string;
  // Relations
  customer?: Customer;
}

// ── Valuation ─────────────────────────────────────────────
export interface Valuation {
  id: string;
  gold_item_id: string;
  shop_id: string;
  appraised_by?: string;
  gold_rate_per_gram: number;
  net_weight: number;
  purity_percentage: number;
  estimated_value: number;
  max_loan_amount: number;
  ltv_percentage: number;
  notes?: string;
  created_at: string;
  // Relations
  gold_item?: GoldItem;
}

// ── Loan ──────────────────────────────────────────────────
export interface Loan {
  id: string;
  customer_id: string;
  gold_item_id: string;
  shop_id: string;
  branch_id?: string;
  loan_number: string;
  loan_amount: number;
  interest_rate: number;
  loan_date: string;
  due_date?: string;
  closed_date?: string;
  auction_date?: string;
  scheme_name?: string;
  loan_purpose?: string;
  status: LoanStatus;
  total_interest_paid?: number;
  created_by?: string;
  created_at: string;
  // Relations
  customer?: Customer;
  gold_item?: GoldItem;
  payments?: Payment[];
}

// ── Payment ───────────────────────────────────────────────
export interface Payment {
  id: string;
  loan_id: string;
  shop_id: string;
  payment_type: PaymentType;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  receipt_number?: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  // Relations
  loan?: Loan;
}

// ── Document ──────────────────────────────────────────────
export interface Document {
  id: string;
  customer_id: string;
  shop_id: string;
  doc_type: 'Aadhaar' | 'PAN' | 'Passport' | 'Voter ID' | 'Driving License' | 'Other';
  file_url: string;
  verified: boolean;
  created_at: string;
}

// ── Notification ──────────────────────────────────────────
export interface Notification {
  id: string;
  customer_id: string;
  loan_id?: string;
  shop_id: string;
  type: 'Payment Due' | 'Overdue Alert' | 'Loan Closed' | 'Custom';
  message: string;
  channel: NotificationChannel;
  status: 'Pending' | 'Sent' | 'Failed';
  sent_at?: string;
  created_at: string;
}

// ── Audit Log ─────────────────────────────────────────────
export interface AuditLog {
  id: string;
  shop_id: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  table_name: string;
  record_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ── CMS Content ───────────────────────────────────────────
export interface CmsContent {
  id: string;
  section: string;
  key: string;
  value: string;
  updated_at: string;
}

// ── Testimonial ───────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role?: string;
  photo_url?: string;
  rating: number;
  content: string;
  is_active: boolean;
  created_at: string;
}

// ── Pricing Plan ──────────────────────────────────────────
export interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_customers?: number;
  max_branches?: number;
  max_employees?: number;
  is_popular?: boolean;
  is_active: boolean;
}

// ── Dashboard Stats ───────────────────────────────────────
export interface DashboardStats {
  total_customers: number;
  active_loans: number;
  outstanding_balance: number;
  today_collections: number;
  overdue_loans: number;
  gold_weight_held: number;
  monthly_disbursements: { date: string; amount: number }[];
  loan_status_distribution: { status: string; count: number }[];
}

// ── Form Types ────────────────────────────────────────────
export type CustomerFormData = Omit<Customer, 'id' | 'shop_id' | 'created_at'>;
export type LoanFormData = Omit<Loan, 'id' | 'shop_id' | 'loan_number' | 'created_at' | 'customer' | 'gold_item' | 'payments'>;
export type GoldItemFormData = Omit<GoldItem, 'id' | 'shop_id' | 'created_at' | 'customer'>;
export type PaymentFormData = Omit<Payment, 'id' | 'shop_id' | 'created_at' | 'loan'>;

// ── API Response ──────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// ── Table Pagination ──────────────────────────────────────
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// ── Filter State ──────────────────────────────────────────
export interface FilterState {
  search: string;
  status?: string;
  branch_id?: string;
  date_from?: string;
  date_to?: string;
}
