import type { Metadata } from 'next';
import Header from '@/components/Header';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Carrito | ${brandConfig.displayName}`,
  description: 'Resumen temporal de tu pedido antes de solicitar la compra o el checkout.',
  alternates: {
    canonical: `${brandConfig.siteUrl}/cart`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
