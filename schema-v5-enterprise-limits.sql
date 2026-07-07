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
CREATE TRIGGER enforce_employee_limit
BEFORE INSERT ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.check_employee_limit();
