import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  // Next 15.5+ enables this by default; it can break dev with RSC manifest / webpack errors.
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
