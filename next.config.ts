import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// initialize the PWA plugin safely
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

// define your base Next.js config
const baseConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com", "your-s3-bucket.s3.amazonaws.com"],
  },

  // ✅ Add this to silence the Turbopack error
  turbopack: {},
};

// ✅ Export the merged config cleanly (ESM style, TypeScript compatible)
const nextConfig = withPWA(baseConfig);

export default nextConfig;
