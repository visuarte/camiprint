import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Impresión DTF en Zaragoza — ${brandConfig.displayName}`,
  description: 'Impresión DTF profesional en Zaragoza: camisetas personalizadas con estampación de alta calidad. DTF, serigrafía y bordado desde 10 unidades.',
  keywords: ["impresión DTF Zaragoza","DTF Zaragoza","estampación textil Zaragoza","estampación textil Aragón"],
  alternates: { canonical: `${brandConfig.siteUrl}/impresion-dtf-zaragoza` },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Impresión DTF en Zaragoza',
  provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
  areaServed: { '@type': 'State', name: 'Zaragoza' },
  description: 'Impresión DTF profesional en Zaragoza: camisetas personalizadas con estampación de alta calidad. Diseño y producción con control de calidad.',
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-gray-900">Impresión DTF en Zaragoza</h1>
        <p>
          Fabricamos impresión DTF cerca de ti: procesos DTF, serigrafía y bordado con entrega rápida en Zaragoza y toda la provincia.
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
