import pokemon from 'pokemontcgsdk';

let isConfigured = false;

/**
 * Safely configure the Pokemon TCG SDK
 * This ensures the SDK is only configured once and handles SSR properly
 */
export function configurePokemonSDK(): void {
  // Only configure on client side
  if (typeof window === 'undefined') {
    return;
  }

  // Only configure once
  if (isConfigured) {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
  
  if (apiKey) {
    try {
      pokemon.configure({ apiKey });
      isConfigured = true;
    } catch (error) {
      console.warn('Failed to configure Pokemon SDK:', error);
    }
  }
}

/**
 * Get the configured Pokemon SDK instance
 * Ensures SDK is configured before returning
 */
export function getPokemonSDK(): typeof pokemon {
  configurePokemonSDK();
  return pokemon;
}

export default pokemon;