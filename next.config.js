/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.pokemontcg.io",
      },
      {
        protocol: "https",
        hostname: "www.cjrose.com",
      },
      {
        protocol: "https",
        hostname: "archives.bulbagarden.net",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  
  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Optimize for production
  productionBrowserSourceMaps: false,
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks more aggressively
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor splitting
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[\\/]/.test(module.identifier());
            },
            name(module) {
              const hash = require('crypto').createHash('sha1');
              if (module.type === 'css/extract-css-chunk-plugin') {
                module.updateHash(hash);
              } else {
                if (!module.libIdent) {
                  throw new Error('libIdent is undefined');
                }
                const libIdent = module.libIdent({ context: __dirname });
                if (libIdent) {
                  hash.update(libIdent);
                } else {
                  // Fallback to module identifier if libIdent returns null
                  hash.update(module.identifier());
                }
              }
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: 'shared',
            chunks: 'all',
            test: /[\\/]components[\\/]|[\\/]utils[\\/]|[\\/]hooks[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
      };
      
      // Tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Minimize bundle
      config.optimization.minimize = true;
    }
    
    return config;
  },
  
  // Experimental features for performance
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;