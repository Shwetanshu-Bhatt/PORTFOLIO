import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure trailing slashes for proper static generation
  trailingSlash: true,
  
  // Improve SEO indexing
  poweredByHeader: false,
  
  // Ensure proper React hydration
  reactStrictMode: true,
};

export default nextConfig;
