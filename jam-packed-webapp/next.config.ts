import type { NextConfig } from "next";

const PROD_CONSOLE_LOG_TYPES: (keyof Console)[] = ["log", "warn", "error"];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: PROD_CONSOLE_LOG_TYPES } : false,
  },
};

export default nextConfig;
