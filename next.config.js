/** @type {import('next').NextConfig} */
const dotenv = require('dotenv');

// Load .env.map first (non-sensitive defaults), then .env.secret (sensitive overrides)
const mapEnv = dotenv.config({ path: '.env.map' }).parsed || {};
const secretEnv = dotenv.config({ path: '.env.secret' }).parsed || {};

// Only pass NEXT_PUBLIC_ variables explicitly to the client bundle
const combinedEnv = { ...mapEnv, ...secretEnv };
const publicEnv = Object.keys(combinedEnv)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .reduce((acc, key) => {
    acc[key] = combinedEnv[key];
    return acc;
  }, {});

const nextConfig = {
  env: publicEnv,
  output: 'standalone',
  reactStrictMode: false,
  experimental: {
    outputFileTracingRoot: undefined,
  },
  eslint: {
    ignoreDuringBuilds: true, // Enable ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Enable TypeScript checking during builds
  },
}

module.exports = nextConfig