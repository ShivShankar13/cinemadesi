import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // TMDB poster CDN — required for next/image
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  experimental: {
    // Reserved for future opt-ins (PPR, dynamicIO, etc.)
  },
};

export default nextConfig;
