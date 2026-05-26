import { ReactNode } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Checkout seguro | ${brandConfig.displayName}`,
  description: 'Finaliza tu pedido corporativo con un proceso de pago seguro y protegido.',
  alternates: {
    canonical: `${brandConfig.siteUrl}/checkout`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
