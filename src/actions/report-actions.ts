'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

async function getShopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  return data?.shop_id ?? null;
}

export interface ReportData {
  loans: {
    total: number;
    active: number;
    closed: number;
    overdue: number;
    total_disbursed: number;
    total_outstanding: number;
  };
  payments: {
    total_count: number;
    total_amount: number;
    by_method: Record<string, number>;
  };
  customers: {
    total: number;
    new_this_month: number;
    active: number;
  };
  gold: {
    total_items: number;
    total_weight: number;
  };
  monthly_disbursements: { month: string; amount: number; count: number }[];
  monthly_collections: { month: string; amount: number }[];
  overdue_loans: {
    loan_number: string;
    customer_name: string;
    loan_amount: number;
    loan_date: string;
    days_overdue: number;
  }[];
}

export async function getReportData(
  dateFrom: string,
  dateTo: string
): Promise<ApiResponse<ReportData>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  // Loans in range
  const { data: loans } = await supabase
    .from('loans')
    .select('id, loan_amount, status, loan_date')
    .eq('shop_id', shopId)
    .gte('loan_date', dateFrom)
    .lte('loan_date', dateTo);

  // All active/overdue loans (for outstanding)
  const { data: activeLoans } = await supabase
    .from('loans')
    .select('loan_amount, status')
    .eq('shop_id', shopId)
    .in('status', ['Active', 'Overdue']);

  // Payments in range
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, payment_method, payment_date')
    .eq('shop_id', shopId)
    .gte('payment_date', dateFrom)
    .lte('payment_date', dateTo);

  // Customers
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId);

  const monthStart = new Date();
  monthStart.setDate(1);
  const { count: newCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .gte('created_at', monthStart.toISOString());

  const { count: activeCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .eq('status', 'Active');

  // Gold items
  const { data: goldItems } = await supabase
    .from('gold_items')
    .select('net_weight')
    .eq('shop_id', shopId);

  // Overdue loans detail
  const { data: overdueLoans } = await supabase
    .from('loans')
    .select('loan_number, loan_amount, loan_date, customers(full_name)')
    .eq('shop_id', shopId)
    .eq('status', 'Overdue')
    .order('loan_date', { ascending: true });

  const loansArr = loans ?? [];
  const paymentsArr = payments ?? [];

  // Payment by method
  const byMethod: Record<string, number> = {};
  for (const p of paymentsArr) {
    byMethod[p.payment_method] = (byMethod[p.payment_method] ?? 0) + p.amount;
  }

  // Monthly disbursements (group by month)
  const disbByMonth: Record<string, { amount: number; count: number }> = {};
  for (const l of loansArr) {
    const month = l.loan_date.slice(0, 7);
    if (!disbByMonth[month]) disbByMonth[month] = { amount: 0, count: 0 };
    disbByMonth[month].amount += l.loan_amount;
    disbByMonth[month].count += 1;
  }

  const collectByMonth: Record<string, number> = {};
  for (const p of paymentsArr) {
    const month = p.payment_date.slice(0, 7);
    collectByMonth[month] = (collectByMonth[month] ?? 0) + p.amount;
  }

  const overdueMapped = (overdueLoans ?? []).map((l: any) => {
    const daysOverdue = Math.floor(
      (Date.now() - new Date(l.loan_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const customer = Array.isArray(l.customers) ? l.customers[0] : l.customers;
    return {
      loan_number: l.loan_number,
      customer_name: (customer as { full_name: string })?.full_name ?? 'Unknown',
      loan_amount: l.loan_amount,
      loan_date: l.loan_date,
      days_overdue: daysOverdue,
    };
  });

  const data: ReportData = {
    loans: {
      total: loansArr.length,
      active: loansArr.filter((l: any) => l.status === 'Active').length,
      closed: loansArr.filter((l: any) => l.status === 'Closed').length,
      overdue: loansArr.filter((l: any) => l.status === 'Overdue').length,
      total_disbursed: loansArr.reduce((s: number, l: any) => s + l.loan_amount, 0),
      total_outstanding: (activeLoans ?? []).reduce((s: number, l: any) => s + l.loan_amount, 0),
    },
    payments: {
      total_count: paymentsArr.length,
      total_amount: paymentsArr.reduce((s: number, p: any) => s + p.amount, 0),
      by_method: byMethod,
    },
    customers: {
      total: totalCustomers ?? 0,
      new_this_month: newCustomers ?? 0,
      active: activeCustomers ?? 0,
    },
    gold: {
      total_items: goldItems?.length ?? 0,
      total_weight: (goldItems ?? []).reduce((s: number, g: any) => s + (g.net_weight ?? 0), 0),
    },
    monthly_disbursements: Object.entries(disbByMonth).map(([month, v]) => ({
      month,
      amount: v.amount,
      count: v.count,
    })).sort((a, b) => a.month.localeCompare(b.month)),
    monthly_collections: Object.entries(collectByMonth).map(([month, amount]) => ({
      month,
      amount,
    })).sort((a, b) => a.month.localeCompare(b.month)),
    overdue_loans: overdueMapped,
  };

  return { data };
}
