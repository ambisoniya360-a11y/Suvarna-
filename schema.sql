-- SuvarnaLoan ERP - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Shops (Tenants)
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'Starter', -- Starter, Professional, Enterprise
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users (Roles: Super Admin, Shop Owner, Staff)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'Shop Owner', 'Staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Customers
CREATE TABLE customers (
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
CREATE TABLE gold_items (
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
CREATE TABLE loans (
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
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Paid', 'Partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Payments
CREATE TABLE payments (
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
CREATE TABLE reminders (
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
CREATE POLICY "Users can view their own shop" ON shops
  FOR SELECT USING (id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Users can view customers of their shop
CREATE POLICY "Shop users can access customers" ON customers
  FOR ALL USING (shop_id = get_user_shop_id() OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin');

-- Users can view gold items of their shop's customers
CREATE POLICY "Shop users can access gold items" ON gold_items
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE shop_id = get_user_shop_id())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin'
  );

-- Users can view loans of their shop's customers
CREATE POLICY "Shop users can access loans" ON loans
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE shop_id = get_user_shop_id())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin'
  );

-- Payments access policy
CREATE POLICY "Shop users can access payments" ON payments
  FOR ALL USING (
    loan_id IN (
      SELECT l.id FROM loans l 
      JOIN customers c ON l.customer_id = c.id 
      WHERE c.shop_id = get_user_shop_id()
    )
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'Super Admin'
  );
