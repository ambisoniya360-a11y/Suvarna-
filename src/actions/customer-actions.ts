'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Customer, CustomerFormData, ApiResponse, FilterState } from '@/types';

async function getShopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('shop_id')
    .eq('id', user.id)
    .single();

  return data?.shop_id ?? null;
}

export async function getCustomers(
  filters: Partial<FilterState> = {},
  page = 1,
  pageSize = 20
): Promise<ApiResponse<Customer[]>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,mobile_number.ilike.%${filters.search}%,aadhaar_number.ilike.%${filters.search}%`
    );
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.branch_id) {
    query = query.eq('branch_id', filters.branch_id);
  }

  const { data, error, count } = await query;

  if (error) return { error: error.message };
  return { data: data ?? [], count: count ?? 0 };
}

export async function getCustomerById(id: string): Promise<ApiResponse<Customer>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('shop_id', shopId)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function createCustomer(
  formData: CustomerFormData
): Promise<ApiResponse<Customer>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('customers')
    .insert([{ ...formData, shop_id: shopId }])
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/customers');
  return { data, message: 'Customer created successfully' };
}

export async function updateCustomer(
  id: string,
  formData: Partial<CustomerFormData>
): Promise<ApiResponse<Customer>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('customers')
    .update(formData)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/customers');
  revalidatePath(`/dashboard/customers/${id}`);
  return { data, message: 'Customer updated successfully' };
}

export async function deleteCustomer(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/customers');
  return { data: null, message: 'Customer deleted successfully' };
}

export async function getCustomerStats(customerId: string) {
  const supabase = await createClient();

  const { data: loans } = await supabase
    .from('loans')
    .select('id, loan_amount, status')
    .eq('customer_id', customerId);

  const totalLoans = loans?.length ?? 0;
  const activeLoans = loans?.filter((l: any) => l.status === 'Active').length ?? 0;
  const totalBorrowed = loans?.reduce((sum: number, l: any) => sum + (l.loan_amount || 0), 0) ?? 0;

  return { totalLoans, activeLoans, totalBorrowed };
}
