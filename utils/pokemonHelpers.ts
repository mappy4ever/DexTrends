/**
 * Pokemon helper utilities for handling special cases
 */

import logger from './logger';

/**
 * Sanitizes Pokemon names for API calls
 * Handles special characters, gender symbols, and forms
 * 
 * @param name - The raw Pokemon name
 * @returns Sanitized name suitable for API calls
 * 
 * @example
 * sanitizePokemonName("Farfetch'd") // "farfetchd"
 * sanitizePokemonName("Mr. Mime") // "mr-mime"
 * sanitizePokemonName("Nidoran♀") // "nidoran-f"
 * sanitizePokemonName("Nidoran♂") // "nidoran-m"
 * sanitizePokemonName("Deoxys Attack") // "deoxys-attack"
 */
export function sanitizePokemonName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')        // Female symbol
    .replace(/♂/g, '-m')        // Male symbol
    .replace(/[':.\s]/g, '-')   // Apostrophes, colons, periods, spaces
    .replace(/--+/g, '-')       // Multiple dashes to single dash
    .replace(/^-|-$/g, '');     // Remove leading/trailing dashes
}

/**
 * Converts API-safe names back to display names
 * This is a best-effort conversion and may not be perfect
 * 
 * @param sanitizedName - The sanitized Pokemon name from API
 * @returns Display-friendly name
 */
export function unsanitizePokemonName(sanitizedName: string): string {
  if (!sanitizedName) return '';
  
  // Special cases that need manual mapping
  const specialCases: Record<string, string> = {
    'farfetchd': "Farfetch'd",
    'mr-mime': 'Mr. Mime',
    'mr-rime': 'Mr. Rime',
    'mime-jr': 'Mime Jr.',
    'nidoran-f': 'Nidoran♀',
    'nidoran-m': 'Nidoran♂',
    'flabebe': 'Flabébé',
    'type-null': 'Type: Null',
    'ho-oh': 'Ho-Oh',
    'porygon-z': 'Porygon-Z',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
  };
  
  // Check if it's a special case
  const lowerName = sanitizedName.toLowerCase();
  if (specialCases[lowerName]) {
    return specialCases[lowerName];
  }
  
  // Otherwise, capitalize each word
  return sanitizedName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extracts base Pokemon name and form from a full name
 * 
 * @param fullName - The full Pokemon name including form
 * @returns Object with baseName and form
 * 
 * @example
 * extractPokemonForm("Deoxys-Attack") // { baseName: "deoxys", form: "attack" }
 * extractPokemonForm("Pikachu") // { baseName: "pikachu", form: null }
 */
export function extractPokemonForm(fullName: string): {
  baseName: string;
  form: string | null;
} {
  if (!fullName) return { baseName: '', form: null };
  
  const sanitized = sanitizePokemonName(fullName);
  const parts = sanitized.split('-');
  
  // Special cases where the dash is part of the name, not a form
  const dashInName = ['ho-oh', 'porygon-z', 'jangmo-o', 'hakamo-o', 'kommo-o'];
  
  if (parts.length === 1) {
    return { baseName: parts[0], form: null };
  }
  
  // Check if it's a Pokemon with a dash in its name
  const possibleBase = parts.slice(0, 2).join('-');
  if (dashInName.includes(possibleBase)) {
    return {
      baseName: possibleBase,
      form: parts.length > 2 ? parts.slice(2).join('-') : null
    };
  }
  
  // Otherwise, first part is base name, rest is form
  return {
    baseName: parts[0],
    form: parts.slice(1).join('-')
  };
}

/**
 * Common Pokemon forms that should be recognized
 */
export const POKEMON_FORMS = {
  ALOLA: 'alola',
  GALAR: 'galar',
  HISUI: 'hisui',
  PALDEA: 'paldea',
  MEGA: 'mega',
  MEGAX: 'mega-x',
  MEGAY: 'mega-y',
  GMAX: 'gmax',
  ETERNAL: 'eternamax',
  ORIGIN: 'origin',
  ALTERED: 'altered',
  ATTACK: 'attack',
  DEFENSE: 'defense',
  SPEED: 'speed',
  NORMAL: 'normal',
} as const;

/**
 * Test function to verify sanitization works correctly
 */
export function testPokemonSanitization(): void {
  const testCases = [
    { input: "Farfetch'd", expected: 'farfetchd' },
    { input: 'Mr. Mime', expected: 'mr-mime' },
    { input: 'Nidoran♀', expected: 'nidoran-f' },
    { input: 'Nidoran♂', expected: 'nidoran-m' },
    { input: 'Deoxys Attack', expected: 'deoxys-attack' },
    { input: 'Type: Null', expected: 'type-null' },
    { input: 'Ho-Oh', expected: 'ho-oh' },
    { input: 'Flabébé', expected: 'flabebe' },
    { input: 'Tapu Koko', expected: 'tapu-koko' },
  ];
  
  logger.debug('Testing Pokemon name sanitization:');
  testCases.forEach(({ input, expected }) => {
    const result = sanitizePokemonName(input);
    const passed = result === expected;
    logger.debug(`${passed ? '✅' : '❌'} ${input} → ${result} (expected: ${expected})`);
  });
}