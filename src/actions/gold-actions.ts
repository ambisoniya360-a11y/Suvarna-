'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { GoldItem, GoldItemFormData, ApiResponse } from '@/types';

async function getShopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  return data?.shop_id ?? null;
}

export async function createGoldItem(
  formData: GoldItemFormData
): Promise<ApiResponse<GoldItem>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('gold_items')
    .insert([{ ...formData, shop_id: shopId }])
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/gold-items');
  return { data: data as GoldItem, message: 'Gold item added successfully' };
}

export async function getGoldItems(
  page = 1,
  pageSize = 20,
  customerId?: string
): Promise<ApiResponse<GoldItem[]>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  let query = supabase
    .from('gold_items')
    .select('*, customers(full_name, mobile_number)', { count: 'exact' })
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (customerId) query = query.eq('customer_id', customerId);

  const { data, error, count } = await query;
  if (error) return { error: error.message };
  return { data: data as GoldItem[] ?? [], count: count ?? 0 };
}

export async function getGoldItemById(id: string): Promise<ApiResponse<GoldItem>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('gold_items')
    .select('*, customers(*)')
    .eq('id', id)
    .eq('shop_id', shopId)
    .single();

  if (error) return { error: error.message };
  return { data: data as GoldItem };
}

export async function updateGoldItem(
  id: string,
  formData: Partial<GoldItemFormData>
): Promise<ApiResponse<GoldItem>> {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('gold_items')
    .update(formData)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/gold-items');
  return { data: data as GoldItem, message: 'Gold item updated' };
}

export async function getGoldInventoryStats() {
  const supabase = await createClient();
  const shopId = await getShopId();
  if (!shopId) return null;

  const { data } = await supabase
    .from('gold_items')
    .select('net_weight, purity, estimated_value')
    .eq('shop_id', shopId);

  if (!data) return null;

  const totalWeight = data.reduce((sum: number, item: any) => sum + (item.net_weight ?? 0), 0);
  const totalValue = data.reduce((sum: number, item: any) => sum + (item.estimated_value ?? 0), 0);

  return { totalItems: data.length, totalWeight, totalValue };
}
