import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  // This creates a minimal Node.js server that can run independently
  output: 'standalone',

  // Optimize images for production
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Headers CORS configurados por entorno
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // En desarrollo: permitir localhost y variaciones
    // En producción: solo el dominio específico de la app
    const allowedOrigin = isDevelopment
      ? '*' // Más flexible en desarrollo local
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    return [
      {
        // Aplicar a todas las rutas API
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigin
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400' // 24 horas de caché para preflight
          }
        ]
      }
    ]
  }
};

export default nextConfig;
