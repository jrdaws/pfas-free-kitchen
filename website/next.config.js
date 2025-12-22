const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel handles Next.js natively
  images: {
    unoptimized: true,
  },

  // Set explicit root for monorepo
  outputFileTracingRoot: path.join(__dirname, '../'),
}

module.exports = nextConfig
