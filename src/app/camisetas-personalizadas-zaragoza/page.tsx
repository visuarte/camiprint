import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Camisetas personalizadas en Zaragoza — ${brandConfig.displayName}`,
  description: 'Camisetas personalizadas cerca de ti: impresión textil profesional en Zaragoza. DTF, serigrafía y bordado desde 10 unidades.',
  keywords: ["camisetas personalizadas Zaragoza","impresión textil Zaragoza","camisetas con logo Zaragoza","camisetas con logo Aragón"],
  alternates: { canonical: `${brandConfig.siteUrl}/camisetas-personalizadas-zaragoza` },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Camisetas personalizadas en Zaragoza',
  provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
  areaServed: { '@type': 'State', name: 'Zaragoza' },
  description: 'Camisetas personalizadas cerca de ti: impresión textil profesional en Zaragoza. Diseño y producción con control de calidad.',
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-gray-900">Camisetas personalizadas en Zaragoza</h1>
        <p>
          Fabricamos camisetas personalizadas cerca de ti: procesos DTF, serigrafía y bordado con entrega rápida en Zaragoza y toda la provincia.
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
