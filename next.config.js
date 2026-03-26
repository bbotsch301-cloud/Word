/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.worf.replit.dev',
    '*.repl.co',
  ],
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
