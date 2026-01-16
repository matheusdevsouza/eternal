import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  async redirects() {
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001';
    return [
      {
        source: '/dashboard/:path*',
        destination: `${dashboardUrl}/:path*`,
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: dashboardUrl,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
