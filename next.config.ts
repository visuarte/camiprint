import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

const cspBase = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://vercel.live";

// En desarrollo: permitimos CDN para Three.js + unsafe-eval para React Refresh
// En producción: también CDN para three-loader.js (migrando a npm)
const cspScript = isDev
  ? "script-src 'self' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com https://cdn.jsdelivr.net; script-src-elem 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://cdn.jsdelivr.net"
  : "script-src 'self' https://vercel.live https://va.vercel-scripts.com https://cdn.jsdelivr.net; script-src-elem 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://cdn.jsdelivr.net";

const cspConnect = isDev
  ? "connect-src 'self' https://api.stripe.com https://js.stripe.com https://vercel.live https://cdn.jsdelivr.net"
  : "connect-src 'self' https://api.stripe.com https://js.stripe.com https://vercel.live https://cdn.jsdelivr.net";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: `${cspBase}; ${cspScript}; ${cspConnect}` },
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
      // Deben ir ANTES de / → /template-2 para que / en camiprint.com redirija a camiart.com
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
      {
        source: '/faq',
        destination: '/#faq',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/#contacto',
        permanent: true,
      },
      {
        source: '/returns',
        destination: '/terminos-y-condiciones',
        permanent: true,
      },
      {
        source: '/preferences',
        destination: '/politica-privacidad',
        permanent: true,
      },
      // Templates legacy — borrados 15 Jul 2026 (limpieza código muerto)
      {
        source: '/template-2',
        destination: '/',
        permanent: true,
      },
      {
        source: '/template-3',
        destination: '/',
        permanent: true,
      },
      {
        source: '/template-nuevo',
        destination: '/',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    // ── MODO OBRAS ──────────────────────────────────────────────────────
    // La web está en construcción (base de datos nueva, ver
    // docs/PLAN_NUEVA_BASE_DE_DATOS.md). Con MAINTENANCE_MODE=1 en el entorno
    // todas las páginas sirven la portada de obras; /api sigue respondiendo
    // para poder probar y diagnosticar. Se apaga borrando la variable: no hay
    // que revertir código.
    if (process.env.MAINTENANCE_MODE === '1') {
      // beforeFiles: las páginas ya prerenderizadas (incluida la portada) se
      // saltan los rewrites normales, así que el desvío va ANTES del sistema
      // de ficheros. /_next y /api quedan fuera para que el sitio siga
      // sirviendo estilos y para poder diagnosticar la API.
      return {
        beforeFiles: [
          { source: '/', destination: '/mantenimiento.html' },
          {
            source: '/((?!_next|api|mantenimiento|favicon|assets|images|robots|sitemap).*)',
            destination: '/mantenimiento.html',
          },
        ],
        afterFiles: [
          { source: '/api/admin/:path*', destination: '/api/admin/:path*' },
        ],
        fallback: [],
      };
    }

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
