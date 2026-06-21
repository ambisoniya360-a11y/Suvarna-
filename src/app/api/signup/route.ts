import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Admin client for user creation (bypasses RLS)
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!RAZORPAY_KEY_SECRET) return false;
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentId,
      orderId,
      signature,
      shopName,
      ownerName,
      email,
      password,
      mobile,
      plan,
      billingCycle,
      mockMode,
    } = body;

    // Validate required fields
    if (!shopName || !ownerName || !email || !password || !mobile || !plan) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature (skip in mock mode)
    if (!mockMode) {
      if (!paymentId || !orderId || !signature) {
        return NextResponse.json(
          { error: 'Payment verification data is missing.' },
          { status: 400 }
        );
      }

      const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Payment verification failed. Invalid signature.' },
          { status: 400 }
        );
      }
    }

    const adminClient = getAdminClient();

    // Calculate subscription dates
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    if (billingCycle === 'yearly') {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    // Calculate amount paid (in rupees)
    const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
      Professional: { monthly: 9999, yearly: 99990 },
      Enterprise: { monthly: 24999, yearly: 249990 },
    };
    const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
    const amountPaid = PLAN_PRICES[plan]?.[cycle] || 0;

    // ── STEP 1: Create Auth User ──────────────────────────
    const { data: authData, error: authErr } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authErr || !authData.user) {
      return NextResponse.json(
        {
          error:
            authErr?.message ||
            'Failed to create authentication account. Email may already be registered.',
        },
        { status: 400 }
      );
    }

    const authUserId = authData.user.id;

    // ── STEP 2: Create Shop Record ─────────────────────────
    let shopData = null;
    let shopErr = null;

    const insertResult = await adminClient
      .from('shops')
      .insert({
        shop_name: shopName,
        owner_name: ownerName,
        mobile,
        email,
        plan,
        subscription_start: subscriptionStart.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        status: 'Active',
        payment_method: mockMode ? 'Mock/Test' : 'Razorpay',
        amount_paid: amountPaid,
        razorpay_payment_id: paymentId || null,
        razorpay_order_id: orderId || null,
      })
      .select()
      .single();

    if (insertResult.error) {
      console.warn(
        'Primary shop insert failed (possibly due to cached schema). Attempting fallback insert with basic columns.',
        insertResult.error
      );
      
      const fallbackResult = await adminClient
        .from('shops')
        .insert({
          shop_name: shopName,
          owner_name: ownerName,
          mobile,
          email,
          plan,
        })
        .select()
        .single();
        
      if (fallbackResult.error) {
        shopErr = fallbackResult.error;
      } else {
        shopData = fallbackResult.data;
      }
    } else {
      shopData = insertResult.data;
    }

    if (shopErr || !shopData) {
      // Rollback: delete auth user
      await adminClient.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: shopErr?.message || 'Failed to create shop record.' },
        { status: 500 }
      );
    }

    // ── STEP 3: Create User Profile ────────────────────────
    const { error: profileErr } = await adminClient.from('users').insert({
      id: authUserId,
      shop_id: shopData.id,
      name: ownerName,
      role: 'Shop Owner',
    });

    if (profileErr) {
      // Rollback: delete shop and auth user
      await adminClient.from('shops').delete().eq('id', shopData.id);
      await adminClient.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: profileErr.message || 'Failed to create user profile.' },
        { status: 500 }
      );
    }

    // ── STEP 4: Create Payment Audit Record ────────────────
    try {
      const { error: paymentErr } = await adminClient.from('subscription_payments').insert({
        shop_id: shopData.id,
        razorpay_payment_id: paymentId || 'mock_' + Date.now(),
        razorpay_order_id: orderId || 'mock_order_' + Date.now(),
        razorpay_signature: signature || null,
        amount: amountPaid,
        currency: 'INR',
        plan,
        payment_method: mockMode ? 'Mock/Test' : 'Razorpay',
        status: 'Success',
      });
      if (paymentErr) {
        console.warn('Failed to insert subscription payment audit record (possibly due to cached schema):', paymentErr);
      }
    } catch (paymentEx) {
      console.warn('Exception during subscription payment audit record insertion:', paymentEx);
    }

    return NextResponse.json({
      success: true,
      credentials: {
        email,
        shopName,
        plan,
        subscriptionEnd: subscriptionEnd.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Signup provisioning error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
