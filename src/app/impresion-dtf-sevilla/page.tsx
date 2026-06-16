import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Impresión DTF en Sevilla — ${brandConfig.displayName}`,
  description:
    'Servicio profesional de impresión DTF en Sevilla para camisetas y merchandising. Ideal para tiradas pequeñas y acabados de alta calidad.',
  keywords: ['impresión DTF Sevilla', 'DTF camisetas Sevilla', 'impresion textil DTF'],
  alternates: { canonical: `${brandConfig.siteUrl}/impresion-dtf-sevilla` },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Impresión DTF — Sevilla',
  provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
  description: 'Impresión DTF (Direct To Film) para camisetas y textil promocional; colores vivos y excelente durabilidad.',
};

const offers = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `Impresión DTF — ${brandConfig.displayName}`,
  description: 'Impresión DTF para camisetas y merchandising. Packs desde 10 unidades.',
  offers: [
    { '@type': 'Offer', name: 'DTF 10+', price: '14.50', priceCurrency: 'EUR', url: `${brandConfig.siteUrl}/impresion-dtf-sevilla` },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-gray-900">Impresión DTF en Sevilla</h1>
        <p>
          La técnica DTF te permite imprimir diseños a todo color con gran definición y durabilidad. Perfecto para merchandising y prendas deportivas.
        </p>
        <p>
          Ofrecemos tiradas pequeñas, control de calidad y acondicionamiento para envío. Pide una muestra o presupuesto personalizado.
        </p>
      </section>
    </>
  );
}
