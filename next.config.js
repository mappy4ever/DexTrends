// This is a Next.js configuration file that sets environment variables
// next.config.js
module.exports = {
  reactStrictMode: true, // Keep your reactStrictMode setting

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
    domains: [
      'images.pokemontcg.io',
      'raw.githubusercontent.com',
      'limitlesstcg.nyc3.cdn.digitaloceanspaces.com', // Added for Pocket card images
    ],
    // Reduce transformations by limiting formats to just WebP
    formats: ['image/webp'],
    // Cache images for 31 days since they don't change often
    minimumCacheTTL: 2678400,
    // Limit device sizes to reduce transformations
    deviceSizes: [640, 750, 828, 1080, 1200],
    // Limit image sizes to common breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Set default quality to 75 to reduce file size (handled per-image basis)
    // Restrict remote patterns to only optimize large card images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
        pathname: '/*/cards/**', // Only optimize card images, not logos/icons
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/chase-manning/pokemon-tcg-pocket-cards/**', // Only specific paths
      },
      {
        protocol: 'https',
        hostname: 'limitlesstcg.nyc3.cdn.digitaloceanspaces.com',
        pathname: '/pokemon/**', // Only Pokemon images
      }
    ],
  },
};