-- ============================================================
-- SuvarnaLoan ERP — Complete Consolidated Database Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================



-- ==========================================
-- SECTION: schema.sql
-- ==========================================

-- SuvarnaLoan ERP - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Shops (Tenants)
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'Starter', -- Starter, Professional, Enterprise
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users (Roles: Super Admin, Shop Owner, Staff)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'Shop Owner', 'Staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  aadhaar_number VARCHAR(20),
  pan_number VARCHAR(20),
  address TEXT,
  photo_url TEXT,
  aadhaar_url TEXT,
  pan_url TEXT,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Blacklisted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Gold Items
CREATE TABLE IF NOT EXISTS gold_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  ornament_type VARCHAR(100) NOT NULL, -- Necklace, Ring, Chain, Bangles, Coin, Other
  gross_weight DECIMAL(10, 3) NOT NULL,
  net_weight DECIMAL(10, 3) NOT NULL,
  purity VARCHAR(50) NOT NULL,
  hallmark_number VARCHAR(100),
  front_image_url TEXT,
  back_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Loans
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  gold_item_id UUID NOT NULL REFERENCES gold_items(id) ON DELETE RESTRICT,
  loan_number VARCHAR(50) UNIQUE NOT NULL,
  loan_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) DEFAULT 3.00, -- Monthly interest rate
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Closed', 'Overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Paid', 'Partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('Interest Payment', 'Partial Payment', 'Full Settlement')),
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('WhatsApp', 'SMS', 'Email')),
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's shop_id
CREATE OR REPLACE FUNCTION get_user_shop_id() RETURNS UUID AS $$
  SELECT shop_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies (Draft)

-- Users can read their own shop data
DROP POLICY IF EXISTS "Users can view their own shop" ON shops;
CREATE POLICY "Users can view their own shop" ON shops
  FOR SELECT USING (id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Users can view customers of their shop
DROP POLICY IF EXISTS "Shop users can access customers" ON customers;
CREATE POLICY "Shop users can access customers" ON customers
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Users can view gold items of their shop's customers
DROP POLICY IF EXISTS "Shop users can access gold items" ON gold_items;
CREATE POLICY "Shop users can access gold items" ON gold_items
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE shop_id = get_user_shop_id())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin'
  );

-- Users can view loans of their shop's customers
DROP POLICY IF EXISTS "Shop users can access loans" ON loans;
CREATE POLICY "Shop users can access loans" ON loans
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE shop_id = get_user_shop_id())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin'
  );

-- Payments access policy
DROP POLICY IF EXISTS "Shop users can access payments" ON payments;
CREATE POLICY "Shop users can access payments" ON payments
  FOR ALL USING (
    loan_id IN (
      SELECT l.id FROM loans l 
      JOIN customers c ON l.customer_id = c.id 
      WHERE c.shop_id = get_user_shop_id()
    )
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin'
  );


-- ==========================================
-- SECTION: schema-v2.sql
-- ==========================================

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
DROP POLICY IF EXISTS "Shop users can access branches" ON branches;
CREATE POLICY "Shop users can access branches" ON branches
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Employees: shop users can access their shop's employees
DROP POLICY IF EXISTS "Shop users can access employees" ON employees;
CREATE POLICY "Shop users can access employees" ON employees
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Documents: shop users can access their customers' documents
DROP POLICY IF EXISTS "Shop users can access documents" ON documents;
CREATE POLICY "Shop users can access documents" ON documents
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Notifications
DROP POLICY IF EXISTS "Shop users can access notifications" ON notifications;
CREATE POLICY "Shop users can access notifications" ON notifications
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Audit logs (read-only for shop users)
DROP POLICY IF EXISTS "Shop users can read audit logs" ON audit_logs;
CREATE POLICY "Shop users can read audit logs" ON audit_logs
  FOR SELECT USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Valuations
DROP POLICY IF EXISTS "Shop users can access valuations" ON valuations;
CREATE POLICY "Shop users can access valuations" ON valuations
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- ── Supabase Storage Buckets ───────────────────────────────
-- Run these in Supabase Dashboard > Storage, or use the storage API:
-- CREATE BUCKET 'documents' (public: false)
-- CREATE BUCKET 'photos' (public: true)

-- ── Seed Default Pricing Plans ─────────────────────────────
INSERT INTO pricing_plans (name, price_monthly, price_yearly, features, max_customers, max_branches, max_employees, is_popular) VALUES
  ('Starter', 999, 9990, '["200 customers","2 staff","1 branch","Basic loans","Payments","PDF receipts","Email support"]', 200, 1, 2, FALSE),
  ('Professional', 9999, 99990, '["1000 customers","0 staff","Single branch","Full loans","WhatsApp alerts","Reports","Excel/PDF export","Priority support"]', 1000, 0, 0, TRUE),
  ('Enterprise', 24999, 249990, '["Unlimited customers","10 staff","10 branches","Full ERP","Custom integrations","Dedicated manager","White-label","SLA"]', NULL, 10, 10, FALSE)
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
DROP POLICY IF EXISTS "Anyone can submit registration requests" ON public.registration_requests;
CREATE POLICY "Anyone can submit registration requests" ON public.registration_requests
  FOR INSERT WITH CHECK (true);

-- Only Super Admins can view/edit registration requests
DROP POLICY IF EXISTS "Only Super Admins can manage registration requests" ON public.registration_requests;
CREATE POLICY "Only Super Admins can manage registration requests" ON public.registration_requests
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'Super Admin'
  );



-- ==========================================
-- SECTION: schema-v3-consolidated.sql
-- ==========================================

-- ============================================================
-- SuvarnaLoan ERP — Consolidated Schema Update
-- Combines Subscription Columns, Payment Audit Table, and RLS Recursion Fixes.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- ── 1. Helper Functions (SECURITY DEFINER to bypass RLS safely) ──

CREATE OR REPLACE FUNCTION get_user_shop_id() 
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT shop_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET row_security = off;

CREATE OR REPLACE FUNCTION get_user_role() 
RETURNS VARCHAR AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET row_security = off;




-- ── 2. Add Subscription Tracking Columns to shops ────────────────────

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '365 days'),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Expired')),
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);


-- ── 3. Create Subscription Payments Audit Table ────────────────

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  plan VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Razorpay',
  status VARCHAR(20) DEFAULT 'Success' CHECK (status IN ('Success', 'Failed', 'Pending', 'Refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ── 4. Drop problematic existing RLS policies ────────────────────

-- users
-- shops
-- customers
-- gold_items
-- loans
-- payments
-- subscription_payments
-- branches
-- employees
-- documents
-- notifications
-- audit_logs
-- valuations
-- ── 5. Re-create RLS Policies using helper functions (0 recursion) ──

-- public.users policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view users in same shop" ON public.users;
CREATE POLICY "Users can view users in same shop" ON public.users
  FOR SELECT USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin' 
    OR id = auth.uid()
  );

DROP POLICY IF EXISTS "Shop owners can manage their users" ON public.users;
CREATE POLICY "Shop owners can manage their users" ON public.users
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    AND get_user_role() = 'Shop Owner'
  );

DROP POLICY IF EXISTS "Super Admins can manage all users" ON public.users;
CREATE POLICY "Super Admins can manage all users" ON public.users
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );


-- public.shops policies
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own shop" ON public.shops;
CREATE POLICY "Users can view their own shop" ON public.shops
  FOR SELECT USING (
    id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );

DROP POLICY IF EXISTS "Super Admins can manage all shops" ON public.shops;
CREATE POLICY "Super Admins can manage all shops" ON public.shops
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );


-- public.customers policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access customers" ON public.customers;
CREATE POLICY "Shop users can access customers" ON public.customers
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.gold_items policies
ALTER TABLE public.gold_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access gold items" ON public.gold_items;
CREATE POLICY "Shop users can access gold items" ON public.gold_items
  FOR ALL USING (
    customer_id IN (SELECT id FROM public.customers WHERE shop_id = get_user_shop_id())
    OR get_user_role() = 'Super Admin'
  );


-- public.loans policies
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access loans" ON public.loans;
CREATE POLICY "Shop users can access loans" ON public.loans
  FOR ALL USING (
    customer_id IN (SELECT id FROM public.customers WHERE shop_id = get_user_shop_id())
    OR get_user_role() = 'Super Admin'
  );


-- public.payments policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access payments" ON public.payments;
CREATE POLICY "Shop users can access payments" ON public.payments
  FOR ALL USING (
    loan_id IN (
      SELECT l.id FROM public.loans l 
      JOIN public.customers c ON l.customer_id = c.id 
      WHERE c.shop_id = get_user_shop_id()
    )
    OR get_user_role() = 'Super Admin'
  );


-- public.subscription_payments policies
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admins can manage subscription payments" ON public.subscription_payments;
CREATE POLICY "Super Admins can manage subscription payments" ON public.subscription_payments
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );

DROP POLICY IF EXISTS "Shop owners can view their payments" ON public.subscription_payments;
CREATE POLICY "Shop owners can view their payments" ON public.subscription_payments
  FOR SELECT USING (
    shop_id = get_user_shop_id()
  );


-- public.branches policies
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access branches" ON public.branches;
CREATE POLICY "Shop users can access branches" ON public.branches
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.employees policies
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access employees" ON public.employees;
CREATE POLICY "Shop users can access employees" ON public.employees
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.documents policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access documents" ON public.documents;
CREATE POLICY "Shop users can access documents" ON public.documents
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access notifications" ON public.notifications;
CREATE POLICY "Shop users can access notifications" ON public.notifications
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.audit_logs policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can read audit logs" ON public.audit_logs;
CREATE POLICY "Shop users can read audit logs" ON public.audit_logs
  FOR SELECT USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.valuations policies
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access valuations" ON public.valuations;
CREATE POLICY "Shop users can access valuations" ON public.valuations
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- ==========================================
-- SECTION: schema-v4-rls-fix.sql
-- ==========================================

-- ============================================================
-- SuvarnaLoan ERP — Schema V4: RLS Recursion Fixes
-- Run this in Supabase SQL Editor to resolve "infinite recursion" RLS errors.
-- ============================================================

-- ── 1. Helper Functions (SECURITY DEFINER to bypass RLS safely) ──

-- Get current user's shop_id safely
CREATE OR REPLACE FUNCTION get_user_shop_id() 
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT shop_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET row_security = off;

-- Get current user's role safely
CREATE OR REPLACE FUNCTION get_user_role() 
RETURNS VARCHAR AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET row_security = off;




-- ── 2. Drop existing problematic policies on all tables ──

-- users
-- shops
-- customers
-- gold_items
-- loans
-- payments
-- subscription_payments
-- ── 3. Re-create RLS Policies using helper functions (0 recursion) ──

-- public.users policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view users in same shop" ON public.users;
CREATE POLICY "Users can view users in same shop" ON public.users
  FOR SELECT USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin' 
    OR id = auth.uid()
  );

DROP POLICY IF EXISTS "Shop owners can manage their users" ON public.users;
CREATE POLICY "Shop owners can manage their users" ON public.users
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    AND get_user_role() = 'Shop Owner'
  );

DROP POLICY IF EXISTS "Super Admins can manage all users" ON public.users;
CREATE POLICY "Super Admins can manage all users" ON public.users
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );


-- public.shops policies
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own shop" ON public.shops;
CREATE POLICY "Users can view their own shop" ON public.shops
  FOR SELECT USING (
    id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );

DROP POLICY IF EXISTS "Super Admins can manage all shops" ON public.shops;
CREATE POLICY "Super Admins can manage all shops" ON public.shops
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );


-- public.customers policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access customers" ON public.customers;
CREATE POLICY "Shop users can access customers" ON public.customers
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.gold_items policies
ALTER TABLE public.gold_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access gold items" ON public.gold_items;
CREATE POLICY "Shop users can access gold items" ON public.gold_items
  FOR ALL USING (
    customer_id IN (SELECT id FROM public.customers WHERE shop_id = get_user_shop_id())
    OR get_user_role() = 'Super Admin'
  );


-- public.loans policies
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access loans" ON public.loans;
CREATE POLICY "Shop users can access loans" ON public.loans
  FOR ALL USING (
    customer_id IN (SELECT id FROM public.customers WHERE shop_id = get_user_shop_id())
    OR get_user_role() = 'Super Admin'
  );


-- public.payments policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shop users can access payments" ON public.payments;
CREATE POLICY "Shop users can access payments" ON public.payments
  FOR ALL USING (
    loan_id IN (
      SELECT l.id FROM public.loans l 
      JOIN public.customers c ON l.customer_id = c.id 
      WHERE c.shop_id = get_user_shop_id()
    )
    OR get_user_role() = 'Super Admin'
  );


-- public.subscription_payments policies
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admins can manage subscription payments" ON public.subscription_payments;
CREATE POLICY "Super Admins can manage subscription payments" ON public.subscription_payments
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );

DROP POLICY IF EXISTS "Shop owners can view their payments" ON public.subscription_payments;
CREATE POLICY "Shop owners can view their payments" ON public.subscription_payments
  FOR SELECT USING (
    shop_id = get_user_shop_id()
  );


-- ==========================================
-- SECTION: schema-v5-enterprise-limits.sql
-- ==========================================

-- ============================================================
-- SuvarnaLoan ERP — Schema V5: Enforce Enterprise Limits
-- Run this in Supabase SQL Editor to enforce plan limits
-- ============================================================

-- 1. Trigger function for Branch Limit enforcement
CREATE OR REPLACE FUNCTION public.check_branch_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan VARCHAR(50);
  v_branch_count INTEGER;
  v_max_branches INTEGER;
BEGIN
  -- Get active shop's plan
  SELECT plan INTO v_plan FROM public.shops WHERE id = NEW.shop_id;

  -- Count existing active branches
  SELECT COUNT(*) INTO v_branch_count FROM public.branches WHERE shop_id = NEW.shop_id;

  -- Set branch limits based on active plan
  IF v_plan = 'Professional' THEN
    v_max_branches := 0;
  ELSIF v_plan = 'Enterprise' THEN
    v_max_branches := 10;
  ELSE
    v_max_branches := 1; -- Starter or default
  END IF;

  IF v_branch_count >= v_max_branches THEN
    RAISE EXCEPTION 'Branch limit reached for your active % plan (Max branches: %). Upgrade plan or contact support.', v_plan, v_max_branches;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind trigger to branches table
DROP TRIGGER IF EXISTS enforce_branch_limit ON public.branches;
DROP TRIGGER IF EXISTS "enforce_branch_limit" ON public.branches;
CREATE TRIGGER enforce_branch_limit
BEFORE INSERT ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.check_branch_limit();


-- 2. Trigger function for Employee Limit enforcement
CREATE OR REPLACE FUNCTION public.check_employee_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan VARCHAR(50);
  v_employee_count INTEGER;
  v_max_employees INTEGER;
BEGIN
  -- Get active shop's plan
  SELECT plan INTO v_plan FROM public.shops WHERE id = NEW.shop_id;

  -- Count existing active staff members
  SELECT COUNT(*) INTO v_employee_count FROM public.employees WHERE shop_id = NEW.shop_id;

  -- Set employee limits based on active plan
  IF v_plan = 'Professional' THEN
    v_max_employees := 0;
  ELSIF v_plan = 'Enterprise' THEN
    v_max_employees := 10; -- 10 employees for 10 branches (1 branch = 1 employee rule)
  ELSE
    v_max_employees := 2; -- Starter or default
  END IF;

  IF v_employee_count >= v_max_employees THEN
    RAISE EXCEPTION 'Staff limit reached for your active % plan (Max staff: %). Upgrade plan or contact support.', v_plan, v_max_employees;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind trigger to employees table
DROP TRIGGER IF EXISTS enforce_employee_limit ON public.employees;
DROP TRIGGER IF EXISTS "enforce_employee_limit" ON public.employees;
CREATE TRIGGER enforce_employee_limit
BEFORE INSERT ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.check_employee_limit();


-- ==========================================
-- SECTION: storage-buckets-setup.sql
-- ==========================================

-- ============================================================
-- SQL PATCH: Setup Supabase Storage Buckets and RLS Policies
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('documents', 'documents', true),
  ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Drop existing conflicting policies on storage.objects if they exist
-- 3. Create RLS policies for storage.objects

-- Allow logged-in (authenticated) users to upload files to 'documents' and 'photos' buckets
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('documents', 'photos'));

-- Allow logged-in (authenticated) users to read/download files from both buckets
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('documents', 'photos'));

-- Allow anyone (public/anonymous users) to read/download files from the public 'photos' bucket
DROP POLICY IF EXISTS "Allow public read of photos" ON storage.objects;
CREATE POLICY "Allow public read of photos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'photos');

-- Allow anyone (public/anonymous users) to read/download files from the public 'documents' bucket
DROP POLICY IF EXISTS "Allow public read of documents" ON storage.objects;
CREATE POLICY "Allow public read of documents" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'documents');


-- Allow logged-in (authenticated) users to update their own files
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('documents', 'photos') AND owner = auth.uid())
  WITH CHECK (bucket_id IN ('documents', 'photos') AND owner = auth.uid());

-- Allow logged-in (authenticated) users to delete their own files
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('documents', 'photos') AND owner = auth.uid());

