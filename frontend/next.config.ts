import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local dev proxy — in production NEXT_PUBLIC_API_URL points directly to backend
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
