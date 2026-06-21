-- ============================================================
-- SuvarnaLoan ERP — Database Schema V2
-- Run this in Supabase SQL Editor (after schema.sql V1)
-- ============================================================

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Extend existing tables ────────────────────────────────

-- Add shop-level fields
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS gstin VARCHAR(20),
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);

-- Add customer enhancements
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS branch_id UUID,
  ADD COLUMN IF NOT EXISTS alternate_mobile VARCHAR(20),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
  ADD COLUMN IF NOT EXISTS nominee_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nominee_relation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS credit_score INTEGER;

-- Add gold item enhancements
ALTER TABLE gold_items
  ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS stone_weight DECIMAL(10, 3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS making_charges DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS market_value_per_gram DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(15, 2);

-- Add loan enhancements
ALTER TABLE loans
  ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS branch_id UUID,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS closed_date DATE,
  ADD COLUMN IF NOT EXISTS auction_date DATE,
  ADD COLUMN IF NOT EXISTS scheme_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS loan_purpose VARCHAR(255),
  ADD COLUMN IF NOT EXISTS total_interest_paid DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add payment enhancements
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS recorded_by UUID;

-- ── New Tables ────────────────────────────────────────────

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  manager_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  salary DECIMAL(10, 2),
  joined_at DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents (KYC)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('Aadhaar', 'PAN', 'Passport', 'Voter ID', 'Driving License', 'Other')),
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Payment Due', 'Overdue Alert', 'Loan Closed', 'Custom')),
  message TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('WhatsApp', 'SMS', 'Email')),
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Valuations
CREATE TABLE IF NOT EXISTS valuations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gold_item_id UUID NOT NULL REFERENCES gold_items(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  appraised_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gold_rate_per_gram DECIMAL(10, 2) NOT NULL,
  net_weight DECIMAL(10, 3) NOT NULL,
  purity_percentage DECIMAL(5, 2) NOT NULL,
  estimated_value DECIMAL(15, 2) NOT NULL,
  max_loan_amount DECIMAL(15, 2) NOT NULL,
  ltv_percentage DECIMAL(5, 2) DEFAULT 75,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMS Content
CREATE TABLE IF NOT EXISTS cms_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section, key)
);

-- SEO Settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255),
  description TEXT,
  og_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(100),
  photo_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Plans
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  max_customers INTEGER,
  max_branches INTEGER,
  max_employees INTEGER,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── RLS Policies for new tables ────────────────────────────

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;

-- Branches: shop users can access their shop's branches
CREATE POLICY "Shop users can access branches" ON branches
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Employees: shop users can access their shop's employees
CREATE POLICY "Shop users can access employees" ON employees
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Documents: shop users can access their customers' documents
CREATE POLICY "Shop users can access documents" ON documents
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Notifications
CREATE POLICY "Shop users can access notifications" ON notifications
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Audit logs (read-only for shop users)
CREATE POLICY "Shop users can read audit logs" ON audit_logs
  FOR SELECT USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Valuations
CREATE POLICY "Shop users can access valuations" ON valuations
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- ── Supabase Storage Buckets ───────────────────────────────
-- Run these in Supabase Dashboard > Storage, or use the storage API:
-- CREATE BUCKET 'documents' (public: false)
-- CREATE BUCKET 'photos' (public: true)

-- ── Seed Default Pricing Plans ─────────────────────────────
INSERT INTO pricing_plans (name, price_monthly, price_yearly, features, max_customers, max_branches, max_employees, is_popular) VALUES
  ('Starter', 999, 9990, '["200 customers","2 staff","1 branch","Basic loans","Payments","PDF receipts","Email support"]', 200, 1, 2, FALSE),
  ('Professional', 2499, 24990, '["1000 customers","10 staff","3 branches","Full loans","WhatsApp alerts","Reports","Excel/PDF export","Priority support"]', 1000, 3, 10, TRUE),
  ('Enterprise', 7999, 79990, '["Unlimited customers","Unlimited staff","Unlimited branches","Full ERP","Custom integrations","Dedicated manager","White-label","SLA"]', NULL, NULL, NULL, FALSE)
ON CONFLICT DO NOTHING;

-- ── Seed Default Testimonials ──────────────────────────────
INSERT INTO testimonials (name, company, role, rating, content, is_active) VALUES
  ('Rajan Patel', 'Patel Gold Finance, Surat', 'Owner', 5, 'SuvarnaLoan ERP transformed how we manage 500+ active loans. The gold valuation tool alone saves us 2 hours daily.', TRUE),
  ('Priya Krishnamurthy', 'Lakshmi Gold Loans, Chennai', 'Branch Manager', 5, 'Managing 3 branches was a nightmare before SuvarnaLoan. Now everything is in one place. Outstanding platform.', TRUE),
  ('Amit Sharma', 'Sharma Jewellers & Finance, Jaipur', 'Director', 5, 'WhatsApp reminders and automatic interest calculation have reduced our overdue loans by 60%.', TRUE)
ON CONFLICT DO NOTHING;

-- ── Registration Requests for Shop Owners ──────────────────

CREATE TABLE IF NOT EXISTS public.registration_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'Professional',
  days INTEGER NOT NULL DEFAULT 365,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a registration request (public registration form access)
CREATE POLICY "Anyone can submit registration requests" ON public.registration_requests
  FOR INSERT WITH CHECK (true);

-- Only Super Admins can view/edit registration requests
CREATE POLICY "Only Super Admins can manage registration requests" ON public.registration_requests
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'Super Admin'
  );

