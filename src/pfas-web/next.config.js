/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/images/I/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Disabled typedRoutes - causes build errors with dynamic routes
  // experimental: {
  //   typedRoutes: true,
  // },
};

module.exports = nextConfig;
