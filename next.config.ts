import type { NextConfig } from "next";

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  
  // Output configuration for production builds
  // Remove standalone output for Vercel
  // output: 'standalone',
  
  // Memory optimization settings
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Increase memory efficiency
    config.optimization = {
      ...config.optimization,
      concatenateModules: true,
      usedExports: true,
      sideEffects: false,
    };
    
    // Reduce chunk size for better memory management
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    };
    
    // Reduce memory usage during builds
    if (!dev) {
      config.optimization.minimize = true;
      config.optimization.minimizer = [
        ...config.optimization.minimizer,
      ];
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Turbopack configuration (simplified for compatibility)
  turbopack: {
    resolveAlias: {
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/types': './src/types',
      '@/models': './src/models',
      '@/hooks': './src/hooks',
    },
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
    webpackBuildWorker: true,
    memoryBasedWorkersCount: true,
    optimizeCss: true,
  },

  // External packages configuration
  serverExternalPackages: ['mongoose', 'mongodb', 'puppeteer', 'puppeteer-core', 'playwright', 'sharp'],

  // Build optimizations
  compiler: {
    removeConsole: !isDev ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Static optimization
  ...(process.env.NODE_ENV === 'production' && {
    trailingSlash: false,
    generateEtags: false,
  }),

  // Headers for better performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : process.env.NEXTAUTH_URL || 'https://trendwise.vercel.app'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  },

  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/articles/',
        destination: '/articles',
        permanent: true,
      }
    ];
  },
};

// Conditionally apply bundle analyzer only for webpack builds
const withBundleAnalyzer = process.env.ANALYZE === 'true' && !process.argv.includes('--turbopack') 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config: NextConfig) => config;

export default withBundleAnalyzer(nextConfig);
