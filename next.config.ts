import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://unpkg.com https://va.vercel-scripts.com; script-src-elem 'self' 'unsafe-inline' https://vercel.live https://unpkg.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://vercel.live; connect-src 'self' https://api.stripe.com https://js.stripe.com https://vercel.live https://unpkg.com" },
];

const nextConfig: NextConfig = {
  // pg permanece externo (usa dynamic require opaco para Turbopack compat)
  // pino externo en Windows: Turbopack falla al crear junction points para pino
  // en sistemas con permisos de symlinks restringidos (OS error 1)
  serverExternalPackages: ['pg', 'pino', 'pino-pretty'],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // En algunos entornos (export estático / ciertas configuraciones en Vercel)
    // la API de optimización de imágenes puede devolver 400 al procesar rutas
    // locales. Para evitar ese problema en producción mientras mantenemos
    // soporte de imágenes estáticas en `public/`, desactivamos la optimización.
    unoptimized: true,
  },
  async redirects() {
    return [
      // Redirecciones de dominio camiprint.com → camiart.com (301 permanentes para SEO)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'camiprint.com',
          },
        ],
        destination: 'https://camiart.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.camiprint.com',
          },
        ],
        destination: 'https://camiart.com/:path*',
        permanent: true,
      },
      // Rutas legacy → actuales (permanentes, se ejecutan en el borde)
      {
        source: '/legacy-catalog',
        destination: '/catalog',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      // El Puente: todo tráfico admin pasa por el proxy validador
      {
        source: '/api/admin/:path*',
        destination: '/api/admin/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          ...securityHeaders,
          // HSTS solo en produccion
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
