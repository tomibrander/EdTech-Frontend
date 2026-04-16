import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_TENANT: process.env.NEXT_PUBLIC_TENANT ?? "default",
  },
};

export default nextConfig;
