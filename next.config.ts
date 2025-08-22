/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ["puppeteer-core", "ioredis", "@prisma/client", "bullmq"],
  },
  instrumentationHook: true, // ✅ ensure Next loads instrumentation.ts
  env: {
    NEXT_PUBLIC_DOMAIN: "http://localhost:3000",
    BRIGHT_DATA_CUSTOMER: process.env.BRIGHT_DATA_CUSTOMER,
    BRIGHT_DATA_ZONE: process.env.BRIGHT_DATA_ZONE,
    BRIGHT_DATA_PASSWORD: process.env.BRIGHT_DATA_PASSWORD,
  },
};

module.exports = nextConfig;
