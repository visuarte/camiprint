import type { MetadataRoute } from 'next';
import { brandConfig } from '@/config/brand';
import { CITY_SLUGS } from '@/config/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = brandConfig.siteUrl;

  const locationPages = CITY_SLUGS.flatMap(city => [
    { url: `${base}/camisetas-personalizadas-${city}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${base}/impresion-dtf-${city}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
  ]);

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/catalog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...locationPages,
    { url: `${base}/guia-estampacion-y-tallas`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/merchandising-empresas`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/guia-tallas`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/cart`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/checkout`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/aviso-legal`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terminos-y-condiciones`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/politica-privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/politica-de-cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/politica-de-envios`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}