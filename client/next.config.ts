/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React strict mode
  swcMinify: true, // Use SWC for minification (faster than Terser)
  output: 'standalone', // Enable standalone output for Docker
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  images: {
    domains: [], // Add domains for external images if needed
  },
  experimental: {
    appDir: false, // Disable the experimental app directory (optional)
    serverActions: false, // Disable experimental server actions (optional)
  },
  // Enable compression for production builds
  compress: true,
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)', // Apply to all routes
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Configure rewrites or redirects if needed
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://compiler:3001/:path*', // Proxy API requests to the backend
      },
    ];
  },
  // Configure environment variables
  env: {
    NEXT_PUBLIC_COMPILER_URL: process.env.NEXT_PUBLIC_COMPILER_URL || 'http://localhost:3001/compile',
  },
  // Configure webpack for additional optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Ignore fs module on the client
        path: false, // Ignore path module on the client
      };
    }
    return config;
  },
};

export default nextConfig;