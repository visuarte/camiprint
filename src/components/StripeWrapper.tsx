'use client';

import React, { ReactNode } from 'react';
import { loadStripe } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''
);

interface StripeWrapperProps {
  children: ReactNode;
}

export function StripeWrapper({ children }: StripeWrapperProps) {
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px',
    },
  };

  const options = {
    appearance,
    locale: 'es' as const,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
