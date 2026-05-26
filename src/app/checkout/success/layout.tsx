import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Pedido completado | ${brandConfig.displayName}`,
  description: 'Confirmacion interna del pedido completado.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}