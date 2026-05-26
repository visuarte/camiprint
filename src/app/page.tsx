import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';
import { faqItems } from './data/faqs';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Pricing from './components/Pricing';
import Process from './components/Process';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ViewportAnimator from './components/ViewportAnimator';

export const metadata: Metadata = {
  title: 'Camisetas Personalizadas para Empresas | Ropa Corporativa con Logo',
  description:
    'Fabricamos camisetas personalizadas para empresas con tu logo. Calidad premium, minimo desde 10-20 unidades. Envio rapido a toda Espana. Presupuesto en 24h.',
  keywords: [
    'camisetas personalizadas empresas',
    'camisetas corporativas',
    'uniformes personalizados',
    'polos con logo',
    'ropa publicitaria empresarial',
  ],
  alternates: {
    canonical: brandConfig.siteUrl,
  },
  openGraph: {
    title: 'Camisetas Personalizadas para Empresas | Ropa Corporativa con Logo',
    description:
      'Fabricamos camisetas corporativas, polos con logo y uniformes personalizados para empresas con produccion profesional y entrega rapida en toda Espana.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ViewportAnimator />
      <Navigation />
      <Hero />
      <Pricing />
      <Process />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </>
  );
}
