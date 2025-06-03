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
    domains: ['images.pokemontcg.io'],
  },
};