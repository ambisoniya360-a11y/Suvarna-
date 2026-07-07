'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  Professional: { monthly: 99900, yearly: 999900 }, // in paise
  Enterprise: { monthly: 249900, yearly: 2499900 },
};

export async function getBillingStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Get user profile to find shop_id
  const { data: profile } = await supabase
    .from('users')
    .select('role, shop_id')
    .eq('id', user.id)
    .single();

  if (!profile?.shop_id) return { error: 'Shop profile not found' };

  // Fetch shop information
  const { data: shop, error: shopErr } = await supabase
    .from('shops')
    .select('*')
    .eq('id', profile.shop_id)
    .single();

  if (shopErr || !shop) return { error: 'Shop record not found' };

  // Fetch transaction history (from subscription_payments)
  const { data: history } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('shop_id', profile.shop_id)
    .order('created_at', { ascending: false });

  return {
    data: {
      shop,
      history: history ?? [],
      role: profile.role,
    }
  };
}

export async function createRenewalOrder(plan: string, billingCycle: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('users')
    .select('role, shop_id')
    .eq('id', user.id)
    .single();

  if (!profile?.shop_id || profile.role !== 'Shop Owner') {
    return { error: 'Only shop owners can renew or upgrade subscriptions.' };
  }

  if (!PLAN_PRICES[plan]) {
    return { error: 'Invalid plan selected.' };
  }

  const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  const amountInPaise = PLAN_PRICES[plan][cycle];

  // Mock mode for local testing if Razorpay keys are missing
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return {
      data: {
        orderId: 'order_renew_mock_' + Date.now(),
        amount: amountInPaise,
        currency: 'INR',
        keyId: 'rzp_test_mock',
        mockMode: true,
      }
    };
  }

  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `renew_${profile.shop_id.slice(0, 8)}_${Date.now()}`,
        notes: {
          shopId: profile.shop_id,
          plan,
          billingCycle: cycle,
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errorText = await rzpResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      return { error: 'Failed to create payment order.' };
    }

    const rzpOrder = await rzpResponse.json();
    return {
      data: {
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: RAZORPAY_KEY_ID,
        mockMode: false,
      }
    };
  } catch (err: any) {
    return { error: err.message || 'Payment provider error.' };
  }
}

export async function confirmRenewalPayment(paymentDetails: {
  paymentId: string;
  orderId: string;
  signature: string | null;
  plan: string;
  billingCycle: string;
  mockMode: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('users')
    .select('role, shop_id')
    .eq('id', user.id)
    .single();

  if (!profile?.shop_id || profile.role !== 'Shop Owner') {
    return { error: 'Only shop owners can confirm renewal payments.' };
  }

  const { paymentId, orderId, signature, plan, billingCycle, mockMode } = paymentDetails;

  // Signature verification (unless mockMode)
  if (!mockMode) {
    if (!paymentId || !orderId || !signature || !RAZORPAY_KEY_SECRET) {
      return { error: 'Payment verification signatures missing.' };
    }
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return { error: 'Invalid payment signature. Verification failed.' };
    }
  }

  // Calculate new subscription expiration date
  const newStart = new Date();
  const newEnd = new Date();
  if (billingCycle === 'yearly') {
    newEnd.setFullYear(newEnd.getFullYear() + 1);
  } else {
    newEnd.setMonth(newEnd.getMonth() + 1);
  }

  const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  const rawPriceInRupees = (PLAN_PRICES[plan]?.[cycle] ?? 0) / 100;

  // Use admin client to bypass RLS policies so we can update the shop details
  const adminClient = await createAdminClient();

  // 1. Update Shop Record
  const { error: shopUpdateErr } = await adminClient
    .from('shops')
    .update({
      plan,
      status: 'Active',
      subscription_start: newStart.toISOString(),
      subscription_end: newEnd.toISOString(),
      amount_paid: rawPriceInRupees,
      payment_method: mockMode ? 'Mock/Test' : 'Razorpay',
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
    })
    .eq('id', profile.shop_id);

  if (shopUpdateErr) {
    console.error('Failed to update shop billing info:', shopUpdateErr);
    return { error: 'Database update failed: ' + shopUpdateErr.message };
  }

  // 2. Insert into subscription_payments audit log
  const { error: logErr } = await adminClient
    .from('subscription_payments')
    .insert({
      shop_id: profile.shop_id,
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      amount: rawPriceInRupees,
      currency: 'INR',
      plan,
      payment_method: mockMode ? 'Mock/Test' : 'Razorpay',
      status: 'Success',
    });

  if (logErr) {
    console.warn('Failed to insert subscription payment audit log:', logErr);
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/overview');
  return { success: true, message: 'Subscription successfully renewed!' };
}
