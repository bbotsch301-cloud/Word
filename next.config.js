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
  webpack: (config, { dev }) => {
    if (dev) {
      // Use memory cache to avoid stale filesystem cache corruption
      // when files change mid-session (e.g. from external edits).
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

module.exports = nextConfig;
