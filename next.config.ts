import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  experimental: {
    // Allow server-side fetch to work without caching by default for API routes
  },
};

export default nextConfig;
