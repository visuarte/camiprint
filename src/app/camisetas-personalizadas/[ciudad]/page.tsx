import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';
import { getCity, CITY_SLUGS } from '@/config/cities';

export function generateStaticParams() {
  return CITY_SLUGS.map(ciudad => ({ ciudad }));
}

export async function generateMetadata({ params }: { params: Promise<{ ciudad: string }> }): Promise<Metadata> {
  const { ciudad } = await params;
  const city = getCity(ciudad);
  const name = city?.name ?? ciudad;
  return {
    title: `Camisetas personalizadas en ${name} — ${brandConfig.displayName}`,
    description: `Camisetas personalizadas cerca de ti: impresión textil profesional en ${name}. DTF, serigrafía y bordado desde 10 unidades.`,
    keywords: [`camisetas personalizadas ${name}`, `impresión textil ${name}`, `camisetas con logo ${name}`],
    alternates: { canonical: `${brandConfig.siteUrl}/camisetas-personalizadas-${ciudad}` },
  };
}

export default async function Page({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params;
  const city = getCity(ciudad);
  const name = city?.name ?? ciudad;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Camisetas personalizadas en ${name}`,
    provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
    areaServed: { '@type': city?.areaType ?? 'City', name },
    description: `Camisetas personalizadas cerca de ti: impresión textil profesional en ${name}. Diseño y producción con control de calidad.`,
  };

  const offers = city?.offers ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Camisetas corporativas personalizadas',
    description: `Pack de camisetas personalizadas — desde 10 unidades. Diseño y producción en ${name}.`,
    offers: [
      { '@type': 'Offer', name: 'Pack 10+', price: '12.90', priceCurrency: 'EUR', url: `${brandConfig.siteUrl}/camisetas-personalizadas-${ciudad}` },
      { '@type': 'Offer', name: 'Pack 25+', price: '10.90', priceCurrency: 'EUR', url: `${brandConfig.siteUrl}/camisetas-personalizadas-${ciudad}` },
    ],
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {offers && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />}
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-gray-900">Camisetas personalizadas en {name}</h1>
        <p>
          Fabricamos camisetas personalizadas cerca de ti: procesos DTF, serigrafía y bordado con entrega rápida en {name}{city?.areaType === 'City' ? ' y toda la provincia' : ''}.
        </p>
        <ul>
          <li>Pedidos desde 10 unidades</li>
          <li>Diseño técnico incluido</li>
          <li>Plazos: 5-10 días según técnica</li>
        </ul>
        <p>
          Solicita presupuesto online o por email para respuesta inmediata. Envío a toda España.
        </p>
      </section>
    </>
  );
}
