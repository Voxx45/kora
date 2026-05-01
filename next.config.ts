import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      // Map /admin/* → /* so route group (admin) pages are accessible at /admin/…
      { source: '/admin/:path*', destination: '/:path*' },
    ]
  },
};

export default nextConfig;
