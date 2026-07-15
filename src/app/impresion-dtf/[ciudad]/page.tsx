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
    title: `Impresión DTF en ${name} — ${brandConfig.displayName}`,
    description: `Impresión DTF profesional en ${name}: camisetas personalizadas con estampación de alta calidad. DTF, serigrafía y bordado desde 10 unidades.`,
    keywords: [`impresión DTF ${name}`, `DTF ${name}`, `estampación textil ${name}`],
    alternates: { canonical: `${brandConfig.siteUrl}/impresion-dtf-${ciudad}` },
  };
}

export default async function Page({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params;
  const city = getCity(ciudad);
  const name = city?.name ?? ciudad;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Impresión DTF en ${name}`,
    provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
    areaServed: { '@type': city?.areaType ?? 'City', name },
    description: `Impresión DTF profesional en ${name}: camisetas personalizadas con estampación de alta calidad. Diseño y producción con control de calidad.`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-gray-900">Impresión DTF en {name}</h1>
        <p>
          Fabricamos impresión DTF cerca de ti: procesos DTF, serigrafía y bordado con entrega rápida en {name}{city?.areaType === 'City' ? ' y toda la provincia' : ''}.
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
