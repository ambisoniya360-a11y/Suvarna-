'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Loan, LoanFormData, ApiResponse, FilterState } from '@/types';
import { generateLoanNumber } from '@/lib/utils';

async function getShopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  return data?.shop_id ?? null;
}

export async function getLoans(
  filters: Partial<FilterState> = {},
  page = 1,
  pageSize = 20
): Promise<ApiResponse<Loan[]>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  let query = supabase
    .from('loans')
    .select(`
      *,
      customers(id, full_name, mobile_number, photo_url),
      gold_items(id, ornament_type, net_weight, purity)
    `, { count: 'exact' })
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.branch_id) query = query.eq('branch_id', filters.branch_id);
  if (filters.date_from) query = query.gte('loan_date', filters.date_from);
  if (filters.date_to) query = query.lte('loan_date', filters.date_to);
  if (filters.search) {
    query = query.or(`loan_number.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query;
  if (error) return { error: error.message };
  return { data: data as Loan[] ?? [], count: count ?? 0 };
}

export async function getLoanById(id: string): Promise<ApiResponse<Loan>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      customers(*),
      gold_items(*),
      payments(*)
    `)
    .eq('id', id)
    .eq('shop_id', shopId)
    .single();

  if (error) return { error: error.message };
  return { data: data as Loan };
}

export async function createLoan(
  formData: LoanFormData
): Promise<ApiResponse<Loan>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const loanNumber = generateLoanNumber();

  const { data, error } = await supabase
    .from('loans')
    .insert([{
      ...formData,
      shop_id: shopId,
      loan_number: loanNumber,
    }])
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/loans');
  revalidatePath('/dashboard/overview');
  return { data: data as Loan, message: `Loan ${loanNumber} created successfully` };
}

export async function updateLoan(
  id: string,
  formData: Partial<Loan>
): Promise<ApiResponse<Loan>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('loans')
    .update(formData)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/loans');
  revalidatePath(`/dashboard/loans/${id}`);
  return { data: data as Loan, message: 'Loan updated successfully' };
}

export async function closeLoan(id: string): Promise<ApiResponse<Loan>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('loans')
    .update({
      status: 'Closed',
      closed_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/loans');
  revalidatePath(`/dashboard/loans/${id}`);
  revalidatePath('/dashboard/overview');
  return { data: data as Loan, message: 'Loan closed successfully' };
}

export async function markLoanOverdue(id: string): Promise<ApiResponse<Loan>> {
  return updateLoan(id, { status: 'Overdue' });
}

export async function getLoanStats() {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return null;

  const { data: loans } = await supabase
    .from('loans')
    .select('id, loan_amount, status, loan_date')
    .eq('shop_id', shopId);

  if (!loans) return null;

  const active = loans.filter((l: any) => l.status === 'Active');
  const overdue = loans.filter((l: any) => l.status === 'Overdue');
  const closed = loans.filter((l: any) => l.status === 'Closed');
  const outstanding = active.reduce((s: number, l: any) => s + l.loan_amount, 0) +
    overdue.reduce((s: number, l: any) => s + l.loan_amount, 0);

  return {
    total: loans.length,
    active: active.length,
    overdue: overdue.length,
    closed: closed.length,
    outstanding,
  };
}
