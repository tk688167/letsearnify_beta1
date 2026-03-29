import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
       { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google Auth Images
       { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
       // Add other production external domains here explicitly
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
