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
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view users in same shop" ON public.users;
DROP POLICY IF EXISTS "Shop owners can manage their users" ON public.users;
DROP POLICY IF EXISTS "Only Super Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Super Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Super Admins can manage all profiles" ON public.users;


-- shops
DROP POLICY IF EXISTS "Users can view their own shop" ON public.shops;
DROP POLICY IF EXISTS "Super Admins can manage all shops" ON public.shops;

-- customers
DROP POLICY IF EXISTS "Shop users can access customers" ON public.customers;

-- gold_items
DROP POLICY IF EXISTS "Shop users can access gold items" ON public.gold_items;

-- loans
DROP POLICY IF EXISTS "Shop users can access loans" ON public.loans;

-- payments
DROP POLICY IF EXISTS "Shop users can access payments" ON public.payments;

-- subscription_payments
DROP POLICY IF EXISTS "Super Admins can manage subscription payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Shop owners can view their payments" ON public.subscription_payments;

-- branches
DROP POLICY IF EXISTS "Shop users can access branches" ON public.branches;

-- employees
DROP POLICY IF EXISTS "Shop users can access employees" ON public.employees;

-- documents
DROP POLICY IF EXISTS "Shop users can access documents" ON public.documents;

-- notifications
DROP POLICY IF EXISTS "Shop users can access notifications" ON public.notifications;

-- audit_logs
DROP POLICY IF EXISTS "Shop users can read audit logs" ON public.audit_logs;

-- valuations
DROP POLICY IF EXISTS "Shop users can access valuations" ON public.valuations;


-- ── 5. Re-create RLS Policies using helper functions (0 recursion) ──

-- public.users policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users in same shop" ON public.users
  FOR SELECT USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin' 
    OR id = auth.uid()
  );

CREATE POLICY "Shop owners can manage their users" ON public.users
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    AND get_user_role() = 'Shop Owner'
  );

CREATE POLICY "Super Admins can manage all users" ON public.users
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );


-- public.shops policies
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shop" ON public.shops
  FOR SELECT USING (
    id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );

CREATE POLICY "Super Admins can manage all shops" ON public.shops
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );


-- public.customers policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can access customers" ON public.customers
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.gold_items policies
ALTER TABLE public.gold_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can access gold items" ON public.gold_items
  FOR ALL USING (
    customer_id IN (SELECT id FROM public.customers WHERE shop_id = get_user_shop_id())
    OR get_user_role() = 'Super Admin'
  );


-- public.loans policies
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can access loans" ON public.loans
  FOR ALL USING (
    customer_id IN (SELECT id FROM public.customers WHERE shop_id = get_user_shop_id())
    OR get_user_role() = 'Super Admin'
  );


-- public.payments policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Super Admins can manage subscription payments" ON public.subscription_payments
  FOR ALL USING (
    get_user_role() = 'Super Admin'
  );

CREATE POLICY "Shop owners can view their payments" ON public.subscription_payments
  FOR SELECT USING (
    shop_id = get_user_shop_id()
  );


-- public.branches policies
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can access branches" ON public.branches
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.employees policies
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can access employees" ON public.employees
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.documents policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can access documents" ON public.documents
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can access notifications" ON public.notifications
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.audit_logs policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can read audit logs" ON public.audit_logs
  FOR SELECT USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );


-- public.valuations policies
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop users can access valuations" ON public.valuations
  FOR ALL USING (
    shop_id = get_user_shop_id() 
    OR get_user_role() = 'Super Admin'
  );
