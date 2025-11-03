import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Headers para permitir CORS en desarrollo
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
