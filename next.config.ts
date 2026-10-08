import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/image/:path*',
        destination: '/images/:path*',
      },
      {
        source: '/iamges/:path*',
        destination: '/images/:path*',
      },
    ];
  },
};

export default nextConfig;
