-- ============================================================
-- SuvarnaLoan ERP — Schema V3: Subscription & Payment Tracking
-- Run this in Supabase SQL Editor after schema-v2.sql
-- ============================================================

-- ── Add subscription tracking to shops ────────────────────
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '365 days'),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Expired')),
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);

-- ── Payment history table (audit trail for all payments) ──
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

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Super Admins can view all payment records
CREATE POLICY "Super Admins can manage subscription payments" ON public.subscription_payments
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'Super Admin'
  );

-- Shop owners can view their own payment records
CREATE POLICY "Shop owners can view their payments" ON public.subscription_payments
  FOR SELECT USING (
    shop_id = (SELECT shop_id FROM public.users WHERE id = auth.uid())
  );

-- ── Allow unauthenticated inserts for public registration ──
-- (The existing policy may cover this, but let's make sure)
-- Note: registration_requests already has an INSERT policy for anonymous users.

-- ── Allow service_role to bypass RLS (already default in Supabase) ──
-- No additional policies needed for server-side admin operations.
