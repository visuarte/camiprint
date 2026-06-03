import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';
import { faqItems } from './data/faqs';
import TemplateNuevoPage from './template-nuevo/page';

export const metadata: Metadata = {
  title: `Camisetas Personalizadas para Empresas | Ropa Corporativa con Logo | ${brandConfig.displayName}`,
  description:
    'Fabricamos camisetas personalizadas para empresas con tu logo. Calidad premium, mínimo desde 10 unidades, diseño incluido y envío a toda España. Presupuesto gratuito en menos de 24h.',
  keywords: [
    'camisetas personalizadas empresas',
    'camisetas corporativas',
    'uniformes personalizados',
    'polos con logo',
    'ropa publicitaria empresarial',
    'camisetas con logo empresa',
    'ropa corporativa personalizada',
    'camisetas para eventos',
    'camisetas serigrafiía empresas',
    'uniformes laborales personalizados',
  ],
  alternates: {
    canonical: brandConfig.siteUrl,
  },
  openGraph: {
    title: 'Camisetas Personalizadas para Empresas | Ropa Corporativa con Logo',
    description:
      'Fabricamos camisetas corporativas, polos con logo y uniformes personalizados para empresas desde 10 uds. Diseño incluido, entrega rápida y presupuesto gratuito en menos de 24h.',
    url: brandConfig.siteUrl,
    siteName: brandConfig.displayName,
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Camisetas corporativas personalizadas para empresas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Camisetas Personalizadas para Empresas | Ropa Corporativa con Logo',
    description:
      'Camisetas corporativas, polos con logo y uniformes personalizados para empresas con presupuesto en 24h.',
    images: ['/og-image.svg'],
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${brandConfig.siteUrl}/#organization`,
  name: brandConfig.displayName,
  url: brandConfig.siteUrl,
  logo: `${brandConfig.siteUrl}/logo.svg`,
  image: `${brandConfig.siteUrl}/og-image.svg`,
  description: 'Fabricación de camisetas corporativas personalizadas para empresas desde 10 unidades. Diseño incluido, calidad premium y envío a toda España.',
  telephone: brandConfig.phoneDisplay,
  email: brandConfig.supportEmail,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. de la Industria 18',
    addressLocality: 'Madrid',
    addressCountry: 'ES',
  },
  priceRange: '€€',
  areaServed: {
    '@type': 'Country',
    name: 'España',
  },
  sameAs: [],
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Camisetas corporativas personalizadas',
  description: 'Camisetas personalizadas con logo para empresas. Impresión profesional, diseño incluido, envío a toda España.',
  brand: {
    '@type': 'Brand',
    name: brandConfig.displayName,
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Pack 10+ camisetas',
      price: '12.90',
      priceCurrency: 'EUR',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '12.90', priceCurrency: 'EUR', unitText: 'unidad' },
      availability: 'https://schema.org/InStock',
      url: brandConfig.siteUrl,
    },
    {
      '@type': 'Offer',
      name: 'Pack 25+ camisetas',
      price: '10.90',
      priceCurrency: 'EUR',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '10.90', priceCurrency: 'EUR', unitText: 'unidad' },
      availability: 'https://schema.org/InStock',
      url: brandConfig.siteUrl,
    },
    {
      '@type': 'Offer',
      name: 'Pack 50+ camisetas',
      price: '8.90',
      priceCurrency: 'EUR',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '8.90', priceCurrency: 'EUR', unitText: 'unidad' },
      availability: 'https://schema.org/InStock',
      url: brandConfig.siteUrl,
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '1200',
    bestRating: '5',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <TemplateNuevoPage />
    </>
  );
}
