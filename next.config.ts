import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com', // Allow Twitter images
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
      },
    ],
  },
};

export default nextConfig;
