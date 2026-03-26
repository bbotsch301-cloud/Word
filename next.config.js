/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.worf.replit.dev',
    '*.repl.co',
  ],
};

module.exports = nextConfig;
