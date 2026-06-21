import { NextRequest, NextResponse } from 'next/server';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  Professional: { monthly: 999900, yearly: 9999000 }, // in paise
  Enterprise: { monthly: 2499900, yearly: 24999000 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, billingCycle } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 });
    }

    const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
    const amountInPaise = PLAN_PRICES[plan][cycle];

    // If Razorpay keys are not configured, return a mock order for development
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        orderId: 'order_mock_' + Date.now(),
        amount: amountInPaise,
        currency: 'INR',
        keyId: 'rzp_test_mock',
        mockMode: true,
      });
    }

    // Create Razorpay order via their API
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
        receipt: `suvarna_${plan.toLowerCase()}_${Date.now()}`,
        notes: {
          plan,
          billingCycle: cycle,
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errorText = await rzpResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to create payment order. Please try again.' },
        { status: 500 }
      );
    }

    const rzpOrder = await rzpResponse.json();

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: RAZORPAY_KEY_ID,
      mockMode: false,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
