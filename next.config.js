/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // For static export if needed
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
};

module.exports = nextConfig;
module.exports = {
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors (not recommended for production)
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint warnings
  },
}
