// This is a Next.js configuration file that sets environment variables
// next.config.mjs

import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable strict mode for better error detection
  
  // PWA handled by custom service worker

  // Headers for PWA, mobile optimization, and security
  async headers() {
    return [
      // CORS headers for external API calls
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      },
      {
        source: '/sw-safari.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
          }
        ]
      },
      // Cache headers for static assets (removed Content-Encoding header which was causing issues)
      {
        source: '/:path*.(js|css|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      // Specific caching for TCG API endpoints
      {
        source: '/api/tcg-sets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=21600, stale-while-revalidate=86400'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ]
      },
      {
        source: '/api/tcg-cards',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1800, stale-while-revalidate=3600'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ]
      }
    ];
  },

  // Rewrites for external API proxying to avoid CORS issues
  async rewrites() {
    return [
      // PokeAPI proxy
      {
        source: '/proxy/pokeapi/:path*',
        destination: 'https://pokeapi.co/api/v2/:path*'
      },
      // Pokemon TCG API proxy
      {
        source: '/proxy/pokemontcg/:path*',
        destination: 'https://api.pokemontcg.io/v2/:path*'
      },
      // Limitless TCG proxy
      {
        source: '/proxy/limitless/:path*',
        destination: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/:path*'
      }
    ];
  },

  // Redirects for consolidated pages
  async redirects() {
    return [
      {
        source: '/regions',
        destination: '/pokemon/regions',
        permanent: true,
      },
      {
        source: '/regions/:region',
        destination: '/pokemon/regions/:region',
        permanent: true,
      },
      {
        source: '/leaderboard',
        destination: '/trending',
        permanent: true,
      },
    ];
  },
  
  // Remove console statements in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'] // Keep console.error for debugging production issues
    } : false,
  },
  
  // ESLint configuration - re-enabled after fixing JSX syntax errors
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // TypeScript configuration - strict checking enabled to enforce zero TypeScript errors at build time
  typescript: {
    ignoreBuildErrors: false,
  },

  // Your environment variables go directly here
  // NEXT_PUBLIC_ prefixed variables are automatically exposed by Next.js
  env: {
    // NEXT_PUBLIC_KV_REST_API_URL: process.env.NEXT_PUBLIC_KV_REST_API_URL,
    // NEXT_PUBLIC_KV_REST_API_TOKEN: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN,
    // NEXT_PUBLIC_KV_URL: process.env.NEXT_PUBLIC_KV_URL,
    // NEXT_PUBLIC_KV_REST_API_READ_ONLY_TOKEN: process.env.NEXT_PUBLIC_KV_REST_API_READ_ONLY_TOKEN,
    // Add your Pokémon API key here for explicit clarity in next.config.js
    NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY: process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY,
  },
  images: {
    // DISABLE VERCEL IMAGE OPTIMIZATION to avoid quota limits
    loader: 'custom',
    loaderFile: './utils/imageLoader.ts',
    // Keep remote patterns for security
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
        pathname: '/**', // Allow all paths from Pokemon TCG
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/chase-manning/pokemon-tcg-pocket-cards/**', // Only specific paths
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**', // Pokemon sprite images
      },
      {
        protocol: 'https',
        hostname: 'limitlesstcg.nyc3.cdn.digitaloceanspaces.com',
        pathname: '/**', // Allow all paths including /pocket/
      },
      {
        protocol: 'https',
        hostname: 'archives.bulbagarden.net',
        pathname: '/**', // Allow all paths for Bulbapedia images
      }
    ],
  },
  
  // Webpack configuration optimized for Fast Refresh
  webpack: (config, { dev, isServer }) => {
    // Separate development and production configurations
    if (dev) {
      // Development optimizations for Fast Refresh
      config.optimization = {
        ...config.optimization,
        // Enable Fast Refresh optimizations
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: {
          chunks: 'async', // Keep async chunks for dynamic imports
          cacheGroups: {
            default: false,
            vendors: false
          }
        },
        runtimeChunk: false,
        providedExports: true  // Help Fast Refresh track exports
        // Removed usedExports as it conflicts with Next.js caching
      };
      
      // Better development stats for debugging
      config.stats = {
        ...config.stats,
        errorDetails: true,
        warnings: true,
      };
      
      // Ensure React Refresh is properly configured
      config.module.rules.forEach(rule => {
        if (rule.use && rule.use.loader && rule.use.loader.includes('next-swc-loader')) {
          rule.use.options = {
            ...rule.use.options,
            hasReactRefresh: true
          };
        }
      });
    } else {
      // Production-only optimizations
      config.optimization.minimize = true;
      
      // Split chunks for better caching in production only
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
          },
          // Separate heavy libraries
          framerMotion: {
            test: /[\/]node_modules[\/]framer-motion[\/]/,
            name: 'framer-motion',
            chunks: 'all',
          },
          icons: {
            test: /[\/]node_modules[\/](@fortawesome|react-icons)[\/]/,
            name: 'icons',
            chunks: 'all',
          }
        }
      };
    }
    
    // Optimize imports for all environments
    config.resolve.alias = {
      ...config.resolve.alias,
      // Tree shake lodash
      'lodash': 'lodash-es',
    };
    
    // Better tree shaking
    config.module.rules.forEach(rule => {
      if (rule.use && rule.use.loader && rule.use.loader.includes('babel-loader')) {
        rule.use.options = {
          ...rule.use.options,
          // Enable tree shaking for ES modules
          plugins: [
            ...(rule.use.options.plugins || []),
            ['babel-plugin-transform-imports', {
              'react-icons': {
                'transform': 'react-icons/${member}',
                'preventFullImport': true
              }
            }]
          ]
        };
      }
    });
    
    // Exclude heavy libraries from server-side bundle when not needed
    if (!isServer) {
      config.externals = config.externals || [];
      // Don't bundle these heavy libraries unless they're actually used
      config.externals.push({
        'html2canvas': 'html2canvas',
        'jspdf': 'jspdf',
      });
    }
    
    return config;
  },
  
  // Experimental features - minimal config for compatibility
  experimental: {
    // Only enable stable experimental features
    esmExternals: true,
  },
  
  // Production optimizations
  compress: true,
  productionBrowserSourceMaps: false,
};

export default withBundleAnalyzer(nextConfig);