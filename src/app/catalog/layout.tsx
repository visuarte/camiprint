import type { Metadata } from 'next';
import Header from '@/components/Header';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Catalogo de camisetas corporativas | ${brandConfig.displayName}`,
  description:
    'Explora camisetas corporativas, polos con logo y prendas personalizadas para empresas. Modelos listos para solicitar presupuesto y comparar acabados.',
  alternates: {
    canonical: `${brandConfig.siteUrl}/catalog`,
  },
  openGraph: {
    title: `Catalogo de camisetas corporativas | ${brandConfig.displayName}`,
    description:
      'Catalogo de prendas corporativas personalizadas para empresas, eventos y equipos comerciales.',
    url: `${brandConfig.siteUrl}/catalog`,
    siteName: brandConfig.displayName,
    locale: 'es_ES',
    type: 'website',
    images: ['/og-image.svg'],
  },
};

export default function StoreLayout({
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
