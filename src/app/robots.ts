import type { MetadataRoute } from 'next';
import { brandConfig } from '@/config/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${brandConfig.siteUrl}/sitemap.xml`,
  };
}
