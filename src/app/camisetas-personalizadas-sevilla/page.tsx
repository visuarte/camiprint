import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Camisetas personalizadas en Sevilla — ${brandConfig.displayName}`,
  description:
    'Impresión textil profesional en Sevilla: camisetas personalizadas desde 10 unidades. DTF, serigrafía, bordado y envío en toda Sevilla.',
  keywords: ['camisetas personalizadas Sevilla', 'impresión textil Sevilla', 'camisetas con logo Sevilla'],
  alternates: { canonical: `${brandConfig.siteUrl}/camisetas-personalizadas-sevilla` },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Camisetas personalizadas — Sevilla',
  provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
  areaServed: { '@type': 'City', name: 'Sevilla' },
  description: 'Camisetas personalizadas para empresas y eventos en Sevilla. Diseño y producción local con control de calidad.',
};

const offers = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Camisetas corporativas personalizadas',
  description: 'Pack de camisetas personalizadas — desde 10 unidades. Diseño y producción en Sevilla.',
  offers: [
    { '@type': 'Offer', name: 'Pack 10+', price: '12.90', priceCurrency: 'EUR', url: `${brandConfig.siteUrl}/camisetas-personalizadas-sevilla` },
    { '@type': 'Offer', name: 'Pack 25+', price: '10.90', priceCurrency: 'EUR', url: `${brandConfig.siteUrl}/camisetas-personalizadas-sevilla` },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-white">Camisetas personalizadas en Sevilla</h1>
        <p>
          Fabricamos camisetas personalizadas cerca de ti: procesos DTF, serigrafía y bordado con entrega rápida en Sevilla y provincia.
        </p>
        <ul>
          <li>Pedidos desde 10 unidades</li>
          <li>Diseño técnico incluido</li>
          <li>Plazos: 5-10 días según técnica</li>
        </ul>
        <p>
          Solicita presupuesto o chatea por WhatsApp para respuesta inmediata. Envío y muestras disponibles.
        </p>
      </section>
    </>
  );
}
