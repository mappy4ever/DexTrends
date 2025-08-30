/** @type {import('next').NextConfig} */

/**
 * Production Configuration for DexTrends
 * 
 * Optimized for:
 * - Performance
 * - Bundle size
 * - SEO
 * - PWA features
 */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/images\.pokemontcg\.io\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'pokemon-tcg-images',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'github-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/api\.pokemontcg\.io\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pokemon-tcg-api',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 // 24 hours
        }
      }
    }
  ]
});

const nextConfig = {
  // React strict mode for better error handling
  reactStrictMode: true,
  
  // Enable SWC minification for smaller bundles
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: [
      'images.pokemontcg.io',
      'raw.githubusercontent.com',
      'archives.bulbagarden.net',
      'poke-holo.simey.me',
      'tcgdex.net',
      'api.tcgdex.net'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Compiler options for production
  compiler: {
    // Remove console logs in production
    removeConsole: {
      exclude: ['error', 'warn']
    },
    
    // Enable emotion support if needed
    emotion: true
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable optimized font loading
    optimizeFonts: true,
    
    // Enable modern JS output
    modern: true,
    
    // Enable granular chunks for better caching
    granularChunks: true,
    
    // Enable CSS optimization
    optimizeCss: true,
    
    // Enable webpack 5 optimizations
    webpack5: true,
    
    // Enable concurrent features
    concurrentFeatures: true,
    
    // Enable server components (if using App Router)
    serverComponents: false,
    
    // Optimize package imports
    optimizePackageImports: [
      'framer-motion',
      'lodash',
      '@heroicons/react',
      'react-icons'
    ]
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
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
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      }
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/pokemon',
        destination: '/pokedex',
        permanent: true
      },
      {
        source: '/cards',
        destination: '/tcgexpansions',
        permanent: true
      }
    ];
  },
  
  // Rewrites for API optimization
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/cache-status',
          destination: '/api/internal/cache-status'
        }
      ],
      fallback: []
    };
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev) {
      // Enable module concatenation
      config.optimization.concatenateModules = true;
      
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier());
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20
          },
          shared: {
            name(module, chunks) {
              return crypto
                .createHash('sha1')
                .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                .digest('hex') + (isServer ? '-server' : '');
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true
          }
        }
      };
      
      // Minimize bundle size
      config.optimization.minimize = true;
      
      // Use content hash for better caching
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }
    
    // Add bundle analyzer in production build with ANALYZE flag
    if (!dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: true
        })
      );
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV
  },
  
  // TypeScript configuration
  typescript: {
    // Ignore TypeScript errors in production build
    // Remove this once all errors are fixed
    ignoreBuildErrors: false
  },
  
  // ESLint configuration
  eslint: {
    // Ignore ESLint errors in production build
    // Remove this once all errors are fixed
    ignoreDuringBuilds: false
  },
  
  // Output configuration
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Generate build ID based on git commit
  generateBuildId: async () => {
    // Use git commit hash as build ID
    const { execSync } = require('child_process');
    try {
      const gitHash = execSync('git rev-parse HEAD').toString().trim();
      return gitHash.substring(0, 8);
    } catch {
      // Fallback to timestamp if git is not available
      return `build-${Date.now()}`;
    }
  },
  
  // Production source maps (disabled for smaller builds)
  productionBrowserSourceMaps: false,
  
  // Trailing slash configuration
  trailingSlash: false,
  
  // Base path (if deploying to a subdirectory)
  basePath: '',
  
  // Asset prefix for CDN
  assetPrefix: process.env.CDN_URL || '',
  
  // Internationalization (if needed)
  i18n: undefined,
  
  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js']
};

// Apply PWA plugin only in production
module.exports = process.env.NODE_ENV === 'production' 
  ? withPWA(nextConfig) 
  : nextConfig;

// Required for crypto in webpack
const crypto = require('crypto');