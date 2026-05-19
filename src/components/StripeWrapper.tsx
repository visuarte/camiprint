'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';

interface StripeWrapperProps {
  children: ReactNode;
}

export function StripeWrapper({ children }: StripeWrapperProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    // Load Stripe from CDN
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      const stripe = (window as any).Stripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''
      );
      setStripePromise(Promise.resolve(stripe));
    };
    document.head.appendChild(script);
  }, []);

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

  const options: StripeElementsOptions = {
    appearance,
    locale: 'es' as const,
  };

  // Don't render Elements until Stripe is loaded
  if (!stripePromise) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
