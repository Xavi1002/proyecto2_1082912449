// next.config.ts
// Configuración de Next.js para HotelManager Pro

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TypeScript
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // Headers - CERO CACHÉ para API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ];
  },

  // Configuración experimental para App Router
  experimental: {
    esmExternals: true,
  },

  // Environment variables
  env: {},
};

export default nextConfig;
