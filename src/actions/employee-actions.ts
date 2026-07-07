'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface EmployeeFormData {
  name: string;
  role: string;
  phone: string;
  email?: string;
  salary?: number;
  joined_at?: string;
  branch_id?: string | null;
  is_active?: boolean;
}

async function getShopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  return data?.shop_id ?? null;
}

export async function getBranchesList() {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return [];

  const { data, error } = await supabase
    .from('branches')
    .select('id, name')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching branches list:', error.message);
    return [];
  }
  return data ?? [];
}

export async function createEmployee(formData: EmployeeFormData) {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  // Get active shop plan
  const { data: shop, error: shopErr } = await supabase
    .from('shops')
    .select('plan')
    .eq('id', shopId)
    .single();

  if (shopErr || !shop) {
    return { error: 'Failed to retrieve shop details.' };
  }

  if (shop.plan === 'Professional') {
    return { error: 'Your Professional plan does not support staff member accounts. Please upgrade to the Enterprise plan to add employees.' };
  }

  // Enforce Enterprise Employee Limit (Max 10 members)
  const { count, error: countErr } = await supabase
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', shopId);

  if (countErr) {
    return { error: countErr.message };
  }

  if (count !== null && count >= 10) {
    return { error: 'Staff limit reached. You can have a maximum of 10 staff members under the Enterprise plan.' };
  }

  const { data, error } = await supabase
    .from('employees')
    .insert([{
      ...formData,
      shop_id: shopId,
      salary: formData.salary ? Number(formData.salary) : null,
      branch_id: formData.branch_id || null,
      is_active: formData.is_active !== false, // default true
    }])
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard/employees');
  return { success: true, data };
}

export async function updateEmployee(id: string, formData: Partial<EmployeeFormData>) {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('employees')
    .update({
      ...formData,
      salary: formData.salary ? Number(formData.salary) : null,
      branch_id: formData.branch_id || null,
    })
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard/employees');
  return { success: true, data };
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/employees');
  return { success: true };
}
