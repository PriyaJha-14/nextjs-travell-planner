/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DOMAIN: "http://localhost:3000",
    BRIGHT_DATA_CUSTOMER: process.env.BRIGHT_DATA_CUSTOMER,
    BRIGHT_DATA_ZONE: process.env.BRIGHT_DATA_ZONE,
    BRIGHT_DATA_PASSWORD: process.env.BRIGHT_DATA_PASSWORD,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgcld.yatra.com", // ✅ Yatra
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // ✅ Unsplash fallback
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com", // ✅ Pixabay fallback
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net", // ✅ CloudFront (many APIs use this)
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com", // ✅ Google-hosted images
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
