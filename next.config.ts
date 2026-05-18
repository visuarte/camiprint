import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg permanece externo (usa dynamic require opaco para Turbopack compat)
  // ioredis y pino son pure-JS y pueden ser bundleados por Turbopack
  serverExternalPackages: ['pg'],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default nextConfig;
