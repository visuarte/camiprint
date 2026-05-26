import type { MetadataRoute } from 'next';
import { brandConfig } from '@/config/brand';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = brandConfig.siteUrl;

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/politica-privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/politica-de-cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}