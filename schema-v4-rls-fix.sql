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
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view users in same shop" ON public.users;
DROP POLICY IF EXISTS "Shop owners can manage their users" ON public.users;
DROP POLICY IF EXISTS "Only Super Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Super Admins can manage all profiles" ON public.users;


-- shops
DROP POLICY IF EXISTS "Users can view their own shop" ON public.shops;

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


-- ── 3. Re-create RLS Policies using helper functions (0 recursion) ──

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
