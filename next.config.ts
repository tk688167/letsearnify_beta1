import type { NextConfig } from "next";

const supabaseRemotePattern = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!supabaseUrl) return null

  try {
    const parsed = new URL(supabaseUrl)
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
    }
  } catch {
    return null
  }
})()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
       { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google Auth Images
       { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
<<<<<<< HEAD
       { protocol: 'https', hostname: '*.supabase.co' }, // Supabase Storage (QR codes, screenshots, uploads)
=======
       ...(supabaseRemotePattern ? [supabaseRemotePattern] : []),
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec
       // Add other production external domains here explicitly

    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
