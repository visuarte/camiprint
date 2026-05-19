import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  // pg permanece externo (usa dynamic require opaco para Turbopack compat)
  // ioredis y pino son pure-JS y pueden ser bundleados por Turbopack
  serverExternalPackages: ['pg'],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Webpack config para evitar problemas con symlinks en Prisma (Windows)
  webpack: (config, { isServer }) => {
    if (process.platform === 'win32') {
      config.snapshot = config.snapshot || {};
      config.snapshot.immutable = false;
      config.snapshot.managed = false;
    }
    return config;
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
