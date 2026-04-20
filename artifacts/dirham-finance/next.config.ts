import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "../..");
const outputFileTracingRoot = fs.existsSync(
  path.join(monorepoRoot, "pnpm-lock.yaml"),
)
  ? monorepoRoot
  : __dirname;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot,
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
