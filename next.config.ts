import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: [".trycloudflare.com"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
