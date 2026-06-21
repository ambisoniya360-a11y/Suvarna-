'use client';

import { create } from 'zustand';

export interface SignupFormData {
  // Plan selection
  plan: 'Professional' | 'Enterprise';
  billingCycle: 'monthly' | 'yearly';

  // Business details
  shopName: string;
  ownerName: string;
  email: string;
  password: string;
  mobile: string;

  // Payment info (set after Razorpay)
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  razorpaySignature: string | null;

  // Provisioning result
  provisioned: boolean;
}

interface SignupStore {
  formData: SignupFormData;
  setFormData: (partial: Partial<SignupFormData>) => void;
  reset: () => void;
  getPlanPrice: () => { monthly: number; yearly: number; display: string };
}

const DEFAULT_FORM_DATA: SignupFormData = {
  plan: 'Professional',
  billingCycle: 'monthly',
  shopName: '',
  ownerName: '',
  email: '',
  password: '',
  mobile: '',
  razorpayPaymentId: null,
  razorpayOrderId: null,
  razorpaySignature: null,
  provisioned: false,
};

const PLAN_PRICES = {
  Professional: { monthly: 9999, yearly: 99990 },
  Enterprise: { monthly: 24999, yearly: 249990 },
} as const;

export const useSignupStore = create<SignupStore>((set, get) => ({
  formData: { ...DEFAULT_FORM_DATA },

  setFormData: (partial) =>
    set((state) => ({
      formData: { ...state.formData, ...partial },
    })),

  reset: () =>
    set({ formData: { ...DEFAULT_FORM_DATA } }),

  getPlanPrice: () => {
    const { plan, billingCycle } = get().formData;
    const prices = PLAN_PRICES[plan];
    const amount = billingCycle === 'yearly' ? prices.yearly : prices.monthly;
    const label = billingCycle === 'yearly' ? '/year' : '/month';
    return {
      monthly: prices.monthly,
      yearly: prices.yearly,
      display: `₹${amount.toLocaleString('en-IN')}${label}`,
    };
  },
}));
