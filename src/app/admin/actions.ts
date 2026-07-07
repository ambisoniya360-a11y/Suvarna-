'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Fetch all registered shop owners
export async function fetchActiveShops() {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, role, shop_id, created_at, shops(*)')
    .eq('role', 'Shop Owner');
    
  if (error) {
    console.error('Error fetching active shops:', error);
    return [];
  }
  
  return (users || []).map((user: any) => {
    const now = new Date();
    const end = user.shops?.subscription_end ? new Date(user.shops.subscription_end) : null;
    let daysLeft = 365;
    if (end) {
      const diffTime = end.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      id: user.shops?.id || user.id,
      shopName: user.shops?.shop_name || 'N/A',
      ownerName: user.name || 'N/A',
      email: user.shops?.email || 'N/A',
      mobile: user.shops?.mobile || 'N/A',
      plan: user.shops?.plan || 'Starter',
      status: user.shops?.status || 'Active',
      customersCount: 0,
      customersLimit: user.shops?.plan === 'Enterprise' ? 'Unlimited' : 2000,
      daysLeft,
      tempPassword: user.shops?.temp_password || 'N/A',
      joinedDate: user.shops?.created_at 
        ? new Date(user.shops.created_at).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0]
    };
  });

}

// Fetch all pending requests from the database
export async function fetchPendingRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('registration_requests')
    .select('*')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }

  return (data || []).map((req: any) => ({
    id: req.id,
    shopName: req.shop_name,
    ownerName: req.owner_name,
    email: req.email,
    mobile: req.mobile,
    plan: req.plan,
    days: req.days,
    requestedDate: new Date(req.created_at).toISOString().split('T')[0]
  }));
}

// Securely approve registration and onboard the shop owner
export async function approveRequestAction(reqId: string) {
  const supabase = await createClient();
  
  // 1. Fetch request details
  const { data: request, error: fetchErr } = await supabase
    .from('registration_requests')
    .select('*')
    .eq('id', reqId)
    .single();

  if (fetchErr || !request) {
    return { success: false, error: 'Request details not found.' };
  }

  // Generate temporary password
  const pass = 'SHOP@' + Math.random().toString(36).slice(-6).toUpperCase();

  try {
    const adminClient = await createAdminClient();
    
    // 2. Create User in auth.users
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email: request.email,
      password: pass,
      email_confirm: true
    });

    if (authErr || !authData.user) {
      return { success: false, error: authErr?.message || 'Failed to register authentication account.' };
    }

    const authUserId = authData.user.id;

    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + (request.days || 365));

    // 3. Create Shop in public.shops
    const { data: shopData, error: shopErr } = await supabase
      .from('shops')
      .insert({
        shop_name: request.shop_name,
        owner_name: request.owner_name,
        mobile: request.mobile,
        email: request.email,
        plan: request.plan,
        subscription_start: subscriptionStart.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        status: 'Active',
        payment_method: 'Cash/Manual',
        amount_paid: 0,
        temp_password: pass
      })
      .select()
      .single();

    if (shopErr || !shopData) {
      // Rollback auth user
      await adminClient.auth.admin.deleteUser(authUserId);
      return { success: false, error: shopErr?.message || 'Failed to create shop record.' };
    }

    // 4. Create Profile in public.users
    const { error: profileErr } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        shop_id: shopData.id,
        name: request.owner_name,
        role: 'Shop Owner'
      });

    if (profileErr) {
      // Rollback shop and auth user
      await supabase.from('shops').delete().eq('id', shopData.id);
      await adminClient.auth.admin.deleteUser(authUserId);
      return { success: false, error: profileErr.message || 'Failed to create user profile.' };
    }

    // 5. Mark request as Approved
    const { error: updateErr } = await supabase
      .from('registration_requests')
      .update({ status: 'Approved' })
      .eq('id', reqId);

    if (updateErr) {
      console.error('Error updating request status column:', updateErr);
    }

    revalidatePath('/admin');
    
    return {
      success: true,
      credentials: {
        username: request.email,
        pass: pass
      }
    };
  } catch (e: any) {
    console.error('Approve Server Action Exception:', e);
    return { success: false, error: e.message || 'An unexpected error occurred during database approval.' };
  }
}

// Deny/Reject registration request
export async function rejectRequestAction(reqId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('registration_requests')
    .update({ status: 'Rejected' })
    .eq('id', reqId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

// Create a new shop owner manually (without a registration request)
export async function createManualTenantAction(
  shopName: string,
  ownerName: string,
  email: string,
  mobile: string,
  plan: string,
  days: number
) {
  const supabase = await createClient();
  const pass = 'SHOP@' + Math.random().toString(36).slice(-6).toUpperCase();

  try {
    const adminClient = await createAdminClient();

    // 1. Create User in auth.users
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email: email,
      password: pass,
      email_confirm: true
    });

    if (authErr || !authData.user) {
      return { success: false, error: authErr?.message || 'Failed to register authentication account.' };
    }

    const authUserId = authData.user.id;

    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + (days || 365));

    // 2. Create Shop in public.shops
    const { data: shopData, error: shopErr } = await supabase
      .from('shops')
      .insert({
        shop_name: shopName,
        owner_name: ownerName,
        mobile: mobile,
        email: email,
        plan: plan,
        subscription_start: subscriptionStart.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        status: 'Active',
        payment_method: 'Cash/Manual',
        amount_paid: 0,
        temp_password: pass
      })
      .select()
      .single();

    if (shopErr || !shopData) {
      // Rollback auth user
      await adminClient.auth.admin.deleteUser(authUserId);
      return { success: false, error: shopErr?.message || 'Failed to create shop record.' };
    }

    // 3. Create Profile in public.users
    const { error: profileErr } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        shop_id: shopData.id,
        name: ownerName,
        role: 'Shop Owner'
      });

    if (profileErr) {
      // Rollback shop and auth user
      await supabase.from('shops').delete().eq('id', shopData.id);
      await adminClient.auth.admin.deleteUser(authUserId);
      return { success: false, error: profileErr.message || 'Failed to create user profile.' };
    }

    revalidatePath('/admin');

    return {
      success: true,
      credentials: {
        username: email,
        pass: pass
      }
    };
  } catch (e: any) {
    console.error('Manual Onboarding Server Action Exception:', e);
    return { success: false, error: e.message || 'An unexpected error occurred during database onboarding.' };
  }
}

// Change Plan for a shop
export async function changePlanAction(shopId: string, newPlan: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('shops')
    .update({ plan: newPlan })
    .eq('id', shopId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

// Extend subscription duration
export async function extendSubscriptionAction(shopId: string, days: number) {
  const supabase = await createClient();
  
  const { data: shop, error: fetchErr } = await supabase
    .from('shops')
    .select('subscription_end')
    .eq('id', shopId)
    .single();
    
  if (fetchErr || !shop) {
    return { success: false, error: fetchErr?.message || 'Shop not found' };
  }
  
  const currentEnd = shop.subscription_end ? new Date(shop.subscription_end) : new Date();
  const baseDate = currentEnd.getTime() > Date.now() ? currentEnd : new Date();
  const nextEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
  
  const { error: updateErr } = await supabase
    .from('shops')
    .update({ 
      subscription_end: nextEnd.toISOString(),
      status: 'Active' 
    })
    .eq('id', shopId);
    
  if (updateErr) {
    return { success: false, error: updateErr.message };
  }
  
  revalidatePath('/admin');
  return { success: true };
}

// Toggle shop status
export async function toggleShopStatusAction(shopId: string, nextStatus: string) {
  const supabase = await createClient();
  
  const validStatuses = ['Active', 'Suspended', 'Expired'];
  if (!validStatuses.includes(nextStatus)) {
    return { success: false, error: `Invalid status: ${nextStatus}` };
  }
  
  const { error } = await supabase
    .from('shops')
    .update({ status: nextStatus })
    .eq('id', shopId);
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin');
  return { success: true };
}

