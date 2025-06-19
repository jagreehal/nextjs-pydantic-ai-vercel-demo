import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // eslint-disable-next-line @typescript-eslint/require-await
  rewrites: async () => {
    return [
      {
        source: '/api/ai/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:5003/api/ai/:path*'
            : '/api/',
      },
    ];
  },
};

export default nextConfig;
