import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Impresión DTF en Valencia — ${brandConfig.displayName}`,
  description: 'Impresión DTF profesional en Valencia: camisetas personalizadas con estampación de alta calidad. DTF, serigrafía y bordado desde 10 unidades.',
  keywords: ["impresión DTF Valencia","DTF Valencia","estampación textil Valencia","estampación textil Comunidad Valenciana"],
  alternates: { canonical: `${brandConfig.siteUrl}/impresion-dtf-valencia` },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Impresión DTF en Valencia',
  provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
  areaServed: { '@type': 'City', name: 'Valencia' },
  description: 'Impresión DTF profesional en Valencia: camisetas personalizadas con estampación de alta calidad. Diseño y producción con control de calidad.',
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-gray-900">Impresión DTF en Valencia</h1>
        <p>
          Fabricamos impresión DTF cerca de ti: procesos DTF, serigrafía y bordado con entrega rápida en Valencia y toda la provincia.
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
