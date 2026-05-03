import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/:slug([a-zA-Z0-9_-]+)',
          destination: '/api/redirect/:slug',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
