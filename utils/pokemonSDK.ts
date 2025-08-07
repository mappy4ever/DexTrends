import pokemon from 'pokemontcgsdk';
import logger from '@/utils/logger';

let isConfigured = false;

/**
 * Safely configure the Pokemon TCG SDK
 * This ensures the SDK is only configured once and handles SSR properly
 */
export function configurePokemonSDK(): void {
  // Only configure once
  if (isConfigured) {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
  
  if (apiKey) {
    try {
      pokemon.configure({ apiKey });
      isConfigured = true;
      logger.info('[Pokemon SDK] Configured successfully');
    } catch (error) {
      logger.warn('[Pokemon SDK] Failed to configure:', error);
    }
  } else {
    logger.warn('[Pokemon SDK] No API key found');
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