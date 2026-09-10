import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/about", destination: "/content/about" },
      { source: "/faq", destination: "/content/faq" },
      { source: "/privacy", destination: "/content/privacy" },
      { source: "/terms", destination: "/content/terms" },
    ];
  },
};

export default nextConfig;
