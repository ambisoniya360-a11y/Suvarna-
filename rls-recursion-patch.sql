-- ============================================================
-- SQL PATCH: Drop Problematic Leftover Policy & Apply Fixes
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Drop the specific leftover policy that was causing the recursion:
DROP POLICY IF EXISTS "Super Admins can manage all profiles" ON public.users;

-- 2. Ensure functions are using PL/pgSQL and row_security = off to prevent recursion:
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
