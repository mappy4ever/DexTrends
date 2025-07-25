/**
 * Sanitizes Pokemon names for API calls
 * Handles special characters, gender symbols, and form variants
 */

/**
 * Sanitizes a Pokemon name for use in PokeAPI calls
 * @param name - The raw Pokemon name (e.g., "Farfetch'd", "Mr. Mime", "Nidoran♀")
 * @returns The sanitized name suitable for API calls
 */
export function sanitizePokemonName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')      // Female symbol to -f
    .replace(/♂/g, '-m')      // Male symbol to -m
    .replace(/[':.\s]/g, '-') // Replace apostrophes, colons, periods, spaces with dashes
    .replace(/--+/g, '-')     // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '');   // Remove leading/trailing dashes
}

/**
 * Handles special Pokemon name cases that require specific formatting
 */
export const SPECIAL_NAME_MAPPINGS: Record<string, string> = {
  'nidoran-f': 'nidoran-f',
  'nidoran-m': 'nidoran-m',
  'mr-mime': 'mr-mime',
  'mime-jr': 'mime-jr',
  'farfetchd': 'farfetchd',
  'sirfetchd': 'sirfetchd',
  'type-null': 'type-null',
  'ho-oh': 'ho-oh',
  'porygon-z': 'porygon-z',
  'flabebe': 'flabebe',
  'jangmo-o': 'jangmo-o',
  'hakamo-o': 'hakamo-o',
  'kommo-o': 'kommo-o',
  'tapu-koko': 'tapu-koko',
  'tapu-lele': 'tapu-lele',
  'tapu-bulu': 'tapu-bulu',
  'tapu-fini': 'tapu-fini',
};

/**
 * Sanitizes Pokemon form names (e.g., "Deoxys-Attack" -> "deoxys-attack")
 * @param formName - The form name to sanitize
 * @returns The sanitized form name
 */
export function sanitizePokemonForm(formName: string): string {
  if (!formName) return '';
  
  // Split by dash to preserve form structure
  const parts = formName.split('-');
  if (parts.length > 1) {
    // First part is Pokemon name, rest is form
    const pokemonName = sanitizePokemonName(parts[0]);
    const formPart = parts.slice(1).join('-').toLowerCase();
    return `${pokemonName}-${formPart}`;
  }
  
  return sanitizePokemonName(formName);
}

/**
 * Extracts the base Pokemon name from a form name
 * @param formName - The full form name (e.g., "Deoxys-Attack")
 * @returns The base Pokemon name (e.g., "deoxys")
 */
export function getBasePokemonName(formName: string): string {
  if (!formName) return '';
  
  const sanitized = sanitizePokemonForm(formName);
  const parts = sanitized.split('-');
  
  // Handle special cases where the base name has dashes
  const specialCases = ['tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini', 'type-null', 'porygon-z', 'ho-oh'];
  for (const special of specialCases) {
    if (sanitized.startsWith(special)) {
      return special;
    }
  }
  
  return parts[0];
}

/**
 * Tests if a name needs sanitization
 * @param name - The Pokemon name to test
 * @returns True if the name contains characters that need sanitization
 */
export function needsSanitization(name: string): boolean {
  return /[♀♂':.\s-]/.test(name) || name !== name.toLowerCase();
}