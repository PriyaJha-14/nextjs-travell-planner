/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
    experimental: {
        // The `instrumentationHook` flag is no longer needed in modern Next.js.
    },
    instrumentationHook: true, // This line enables your worker
    env: {
        NEXT_PUBLIC_DOMAIN: "http://localhost:3000",
    },
};

module.exports = nextConfig;