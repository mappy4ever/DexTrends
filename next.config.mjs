// This is a Next.js configuration file that sets environment variables
// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Re-enabled after fixing Fast Refresh issues
  
  // PWA handled by custom service worker

  // Headers for PWA, mobile optimization, and security
  async headers() {
    return [
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
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
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
  
  // TypeScript configuration - re-enabled after fixing syntax errors
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
    loaderFile: './utils/imageLoader.js',
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
      }
    ],
  },
  
  // Webpack configuration for additional optimizations
  webpack: (config, { dev, isServer }) => {
    // Only in production builds
    if (!dev) {
      // Additional console statement removal for any that slip through
      config.optimization.minimize = true;
      
      // Split chunks for better caching
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
          echarts: {
            test: /[\/]node_modules[\/](echarts|echarts-for-react)[\/]/,
            name: 'echarts',
            chunks: 'all',
          },
          leaflet: {
            test: /[\/]node_modules[\/](leaflet|react-leaflet)[\/]/,
            name: 'leaflet',
            chunks: 'all',
          },
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
    
    // Optimize imports
    config.resolve.alias = {
      ...config.resolve.alias,
      // Tree shake lodash
      'lodash': 'lodash-es',
    };
    
    return config;
  },
  
  // Experimental features - minimal config for compatibility
  experimental: {
    // Only enable stable experimental features
    esmExternals: true,
  },
};

export default nextConfig;