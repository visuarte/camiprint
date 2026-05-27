import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: 'Merchandising para empresas — CamiPrint',
  description:
    'Merchandising corporativo: camisetas, sudaderas, bolsas y regalos personalizados para empresas. Producción por volumen y logística a medida.',
  keywords: ['merchandising empresas', 'regalos corporativos', 'merchandising personalizado'],
  alternates: { canonical: `${brandConfig.siteUrl}/merchandising-empresas` },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Merchandising para empresas',
  provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
  description: 'Suministro de merchandising para empresas: desde camisetas y sudaderas hasta bolsas y accesorios personalizados.',
};

const offers = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Merchandising corporativo',
  description: 'Kits de merchandising para empresas: camisetas, bolsas y accesorios personalizados.',
  offers: [
    { '@type': 'Offer', name: 'Kit básico 25 uds', price: '345.00', priceCurrency: 'EUR', url: `${brandConfig.siteUrl}/merchandising-empresas` },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-white">Merchandising para empresas</h1>
        <p>
          Diseñamos y producimos merchandising corporativo con control de calidad y envíos a medida. Ideal para eventos, regalos y campañas promocionales.
        </p>
        <p>
          Ponte en contacto para calcular precios por volumen y logística personalizada.
        </p>
      </section>
    </>
  );
}
