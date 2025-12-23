const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set explicit root for monorepo
  outputFileTracingRoot: path.join(__dirname, '../'),

  // Image optimization
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Strict mode for React
  reactStrictMode: true,

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Experimental features for performance
  experimental: {
    // Enable server component HMR reliability
    serverComponentsHmrCache: true,
  },

  // Security headers (additional to vercel.json)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // Redirect www to non-www (or vice versa)
  async redirects() {
    return [];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimize bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
