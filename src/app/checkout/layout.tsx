import { ReactNode } from 'react';
import Header from '@/components/Header';

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
