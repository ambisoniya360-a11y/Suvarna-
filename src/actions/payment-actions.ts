'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Payment, PaymentFormData, ApiResponse } from '@/types';
import { generateReceiptNumber } from '@/lib/utils';

async function getShopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  return data?.shop_id ?? null;
}

export async function recordPayment(
  formData: PaymentFormData
): Promise<ApiResponse<Payment>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const receiptNumber = generateReceiptNumber();

  const { data, error } = await supabase
    .from('payments')
    .insert([{
      ...formData,
      shop_id: shopId,
      receipt_number: receiptNumber,
    }])
    .select()
    .single();

  if (error) return { error: error.message };

  // If full settlement, close the loan
  if (formData.payment_type === 'Full Settlement') {
    await supabase
      .from('loans')
      .update({ status: 'Closed', closed_date: new Date().toISOString().split('T')[0] })
      .eq('id', formData.loan_id);
  }

  revalidatePath('/dashboard/payments');
  revalidatePath(`/dashboard/loans/${formData.loan_id}`);
  revalidatePath('/dashboard/overview');
  return { data: data as Payment, message: `Payment recorded. Receipt: ${receiptNumber}` };
}

export async function getPaymentsByLoan(loanId: string): Promise<ApiResponse<Payment[]>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('loan_id', loanId)
    .eq('shop_id', shopId)
    .order('payment_date', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as Payment[] ?? [] };
}

export async function getAllPayments(
  page = 1,
  pageSize = 20,
  filters: { date_from?: string; date_to?: string; payment_type?: string } = {}
): Promise<ApiResponse<Payment[]>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  let query = supabase
    .from('payments')
    .select(`
      *,
      loans(loan_number, customers(full_name, mobile_number))
    `, { count: 'exact' })
    .eq('shop_id', shopId)
    .order('payment_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters.payment_type) query = query.eq('payment_type', filters.payment_type);
  if (filters.date_from) query = query.gte('payment_date', filters.date_from);
  if (filters.date_to) query = query.lte('payment_date', filters.date_to);

  const { data, error, count } = await query;
  if (error) return { error: error.message };
  return { data: data as Payment[] ?? [], count: count ?? 0 };
}

export async function getTodayCollections(): Promise<number> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return 0;

  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('payments')
    .select('amount')
    .eq('shop_id', shopId)
    .eq('payment_date', today);

  return data?.reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;
}
