/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@/components/ui'],
  },
}

module.exports = nextConfig