import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION ?? "1",
  },
};

export default nextConfig;
