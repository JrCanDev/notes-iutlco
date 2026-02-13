import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Exclude API routes from service worker cache
  // This prevents login/grades API calls from being cached
  buildExcludes: [/\/api\/.*/],
  cacheOnFrontEndNav: true,
});

const nextConfig: NextConfig = {
  turbopack: {}, // Allow webpack config from next-pwa
};

export default withPWA(nextConfig);
