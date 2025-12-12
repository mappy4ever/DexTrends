/**
 * Pokemon Form Utilities
 *
 * Provides utilities for detecting and parsing Pokemon form information
 * from Pokemon names (e.g., "pikachu-gmax", "charizard-mega-x")
 */

export type RegionName = 'alolan' | 'galarian' | 'hisuian' | 'paldean';
export type MegaVariant = 'x' | 'y' | null;

export interface FormInfo {
  /** Base species name without form suffix */
  baseName: string;
  /** Whether this is a regional variant */
  isRegional: boolean;
  /** Region name if regional */
  regionName?: RegionName;
  /** Whether this is a Mega Evolution */
  isMega: boolean;
  /** Mega variant (X, Y, or null for regular Mega) */
  megaVariant: MegaVariant;
  /** Whether this is a Gigantamax form */
  isGigantamax: boolean;
  /** Whether this is a Totem form */
  isTotem: boolean;
  /** Whether this is a Primal form */
  isPrimal: boolean;
  /** Whether this is an Origin form */
  isOrigin: boolean;
  /** Whether this is a Therian form */
  isTherian: boolean;
  /** Properly formatted display name */
  displayName: string;
  /** Short form indicator for badges (e.g., "Mega", "Alola") */
  formLabel?: string;
}

/**
 * Parse Pokemon name to extract form information
 */
export function parseFormInfo(pokemonName: string, speciesName?: string): FormInfo {
  const name = pokemonName.toLowerCase();
  const baseName = speciesName?.toLowerCase() || name.split('-')[0];

  const info: FormInfo = {
    baseName,
    isRegional: false,
    isMega: false,
    megaVariant: null,
    isGigantamax: false,
    isTotem: false,
    isPrimal: false,
    isOrigin: false,
    isTherian: false,
    displayName: formatDisplayName(pokemonName),
  };

  // Regional forms
  if (name.includes('-alola') || name.endsWith('-alolan')) {
    info.isRegional = true;
    info.regionName = 'alolan';
    info.formLabel = 'Alolan';
  } else if (name.includes('-galar') || name.endsWith('-galarian')) {
    info.isRegional = true;
    info.regionName = 'galarian';
    info.formLabel = 'Galarian';
  } else if (name.includes('-hisui') || name.endsWith('-hisuian')) {
    info.isRegional = true;
    info.regionName = 'hisuian';
    info.formLabel = 'Hisuian';
  } else if (name.includes('-paldea') || name.endsWith('-paldean')) {
    info.isRegional = true;
    info.regionName = 'paldean';
    info.formLabel = 'Paldean';
  }

  // Mega Evolutions
  if (name.includes('-mega-x')) {
    info.isMega = true;
    info.megaVariant = 'x';
    info.formLabel = 'Mega X';
  } else if (name.includes('-mega-y')) {
    info.isMega = true;
    info.megaVariant = 'y';
    info.formLabel = 'Mega Y';
  } else if (name.includes('-mega')) {
    info.isMega = true;
    info.formLabel = 'Mega';
  }

  // Gigantamax
  if (name.includes('-gmax') || name.includes('-gigantamax')) {
    info.isGigantamax = true;
    info.formLabel = 'Gigantamax';
  }

  // Totem forms (Alola)
  if (name.includes('-totem')) {
    info.isTotem = true;
    info.formLabel = 'Totem';
  }

  // Primal forms (Groudon, Kyogre)
  if (name.includes('-primal')) {
    info.isPrimal = true;
    info.formLabel = 'Primal';
  }

  // Origin forms (Dialga, Palkia, Giratina)
  if (name.includes('-origin')) {
    info.isOrigin = true;
    info.formLabel = 'Origin';
  }

  // Therian forms (Forces of Nature)
  if (name.includes('-therian')) {
    info.isTherian = true;
    info.formLabel = 'Therian';
  }

  return info;
}

/**
 * Format a Pokemon name for display
 * Handles special cases like "mr-mime" -> "Mr. Mime"
 */
export function formatDisplayName(name: string): string {
  // Special case handling
  const specialCases: Record<string, string> = {
    'mr-mime': 'Mr. Mime',
    'mr-mime-galar': 'Galarian Mr. Mime',
    'mr-rime': 'Mr. Rime',
    'mime-jr': 'Mime Jr.',
    'type-null': 'Type: Null',
    'tapu-koko': 'Tapu Koko',
    'tapu-lele': 'Tapu Lele',
    'tapu-bulu': 'Tapu Bulu',
    'tapu-fini': 'Tapu Fini',
    'ho-oh': 'Ho-Oh',
    'porygon-z': 'Porygon-Z',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
    'nidoran-f': 'Nidoran♀',
    'nidoran-m': 'Nidoran♂',
    'flabebe': 'Flabébé',
    'farfetchd': "Farfetch'd",
    'farfetchd-galar': "Galarian Farfetch'd",
    'sirfetchd': "Sirfetch'd",
  };

  const lowerName = name.toLowerCase();
  if (specialCases[lowerName]) {
    return specialCases[lowerName];
  }

  // Handle regional forms
  if (lowerName.includes('-alola')) {
    const base = lowerName.replace('-alola', '');
    return `Alolan ${formatSimpleName(base)}`;
  }
  if (lowerName.includes('-galar')) {
    const base = lowerName.replace('-galar', '');
    return `Galarian ${formatSimpleName(base)}`;
  }
  if (lowerName.includes('-hisui')) {
    const base = lowerName.replace('-hisui', '');
    return `Hisuian ${formatSimpleName(base)}`;
  }
  if (lowerName.includes('-paldea')) {
    const base = lowerName.replace('-paldea', '');
    return `Paldean ${formatSimpleName(base)}`;
  }

  // Handle Mega forms
  if (lowerName.includes('-mega-x')) {
    const base = lowerName.replace('-mega-x', '');
    return `Mega ${formatSimpleName(base)} X`;
  }
  if (lowerName.includes('-mega-y')) {
    const base = lowerName.replace('-mega-y', '');
    return `Mega ${formatSimpleName(base)} Y`;
  }
  if (lowerName.includes('-mega')) {
    const base = lowerName.replace('-mega', '');
    return `Mega ${formatSimpleName(base)}`;
  }

  // Handle Gigantamax forms
  if (lowerName.includes('-gmax')) {
    const base = lowerName.replace('-gmax', '');
    return `Gigantamax ${formatSimpleName(base)}`;
  }

  // Handle Primal forms
  if (lowerName.includes('-primal')) {
    const base = lowerName.replace('-primal', '');
    return `Primal ${formatSimpleName(base)}`;
  }

  // Handle Origin forms
  if (lowerName.includes('-origin')) {
    const base = lowerName.replace('-origin', '');
    return `${formatSimpleName(base)} (Origin)`;
  }

  // Handle Therian forms
  if (lowerName.includes('-therian')) {
    const base = lowerName.replace('-therian', '');
    return `${formatSimpleName(base)} (Therian)`;
  }

  return formatSimpleName(name);
}

/**
 * Format a simple Pokemon name (capitalize each word)
 */
function formatSimpleName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if a Pokemon has any special form
 */
export function hasSpecialForm(pokemonName: string): boolean {
  const info = parseFormInfo(pokemonName);
  return (
    info.isRegional ||
    info.isMega ||
    info.isGigantamax ||
    info.isTotem ||
    info.isPrimal ||
    info.isOrigin ||
    info.isTherian
  );
}

/**
 * Get all special form suffixes that a Pokemon might have
 */
export function getFormSuffixes(): string[] {
  return [
    '-alola',
    '-galar',
    '-hisui',
    '-paldea',
    '-mega',
    '-mega-x',
    '-mega-y',
    '-gmax',
    '-primal',
    '-origin',
    '-therian',
    '-totem',
  ];
}

/**
 * Extract base species name from a form name
 */
export function getBaseSpeciesName(pokemonName: string): string {
  const suffixes = getFormSuffixes();
  let name = pokemonName.toLowerCase();

  for (const suffix of suffixes) {
    if (name.includes(suffix)) {
      name = name.replace(suffix, '');
    }
  }

  return name;
}

/**
 * Group Pokemon forms by their base species
 */
export function groupByBaseSpecies<T extends { name: string }>(
  pokemon: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const p of pokemon) {
    const baseName = getBaseSpeciesName(p.name);
    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push(p);
  }

  return groups;
}
