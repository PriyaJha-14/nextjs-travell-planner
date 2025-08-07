import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This line has been removed
  },
  env:{
    NEXT_PUBLIC_DOMAIN:"http://localhost:3000",
  },
};

export default nextConfig;