'use client';

import React, { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';

interface StripeWrapperProps {
  children: ReactNode;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

export function StripeWrapper({ children }: StripeWrapperProps) {
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#c79b63',
      colorBackground: '#152131',
      colorText: '#f4f7fb',
      colorDanger: '#fca5a5',
      colorTextSecondary: '#afbed1',
      fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
      spacingUnit: '4px',
      borderRadius: '14px',
    },
  };

  const options: StripeElementsOptions = {
    appearance,
    locale: 'es' as const,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
