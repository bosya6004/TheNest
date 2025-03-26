import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables strict mode for better debugging
  eslint: {
    ignoreDuringBuilds: true, // This allows build to succeed even with ESLint errors
  },
};

export default nextConfig;