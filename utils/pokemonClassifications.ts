/**
 * Pokemon Classification Constants
 *
 * Provides ID-based classification for special Pokemon categories
 * that aren't available directly from PokeAPI's is_legendary/is_mythical flags.
 */

// Ultra Beasts (Gen 7 - Alola)
// Extradimensional Pokemon from Ultra Space
export const ULTRA_BEAST_IDS = new Set([
  793, // Nihilego
  794, // Buzzwole
  795, // Pheromosa
  796, // Xurkitree
  797, // Celesteela
  798, // Kartana
  799, // Guzzlord
  803, // Poipole
  804, // Naganadel
  805, // Stakataka
  806, // Blacephalon
]);

// Paradox Pokemon (Gen 9 - Paldea) - Past variants
// Ancient Pokemon from the distant past
export const PARADOX_PAST_IDS = new Set([
  984,  // Great Tusk (Donphan)
  985,  // Scream Tail (Jigglypuff)
  986,  // Brute Bonnet (Amoonguss)
  987,  // Flutter Mane (Misdreavus)
  988,  // Slither Wing (Volcarona)
  989,  // Sandy Shocks (Magneton)
  990,  // Roaring Moon (Salamence)
  1007, // Koraidon (Box Legendary)
  1009, // Walking Wake (Suicune)
  1020, // Gouging Fire (Entei)
  1021, // Raging Bolt (Raikou)
]);

// Paradox Pokemon (Gen 9 - Paldea) - Future variants
// Mechanical Pokemon from the distant future
export const PARADOX_FUTURE_IDS = new Set([
  991,  // Iron Treads (Donphan)
  992,  // Iron Bundle (Delibird)
  993,  // Iron Hands (Hariyama)
  994,  // Iron Jugulis (Hydreigon)
  995,  // Iron Moth (Volcarona)
  996,  // Iron Thorns (Tyranitar)
  997,  // Iron Valiant (Gardevoir/Gallade)
  1008, // Miraidon (Box Legendary)
  1010, // Iron Leaves (Virizion)
  1022, // Iron Boulder (Terrakion)
  1023, // Iron Crown (Cobalion)
]);

// All Paradox Pokemon combined
export const PARADOX_POKEMON_IDS = new Set([
  ...PARADOX_PAST_IDS,
  ...PARADOX_FUTURE_IDS,
]);

// Starter Pokemon (first form only)
export const STARTER_IDS = new Set([
  // Gen 1 - Kanto
  1,   // Bulbasaur
  4,   // Charmander
  7,   // Squirtle
  // Gen 2 - Johto
  152, // Chikorita
  155, // Cyndaquil
  158, // Totodile
  // Gen 3 - Hoenn
  252, // Treecko
  255, // Torchic
  258, // Mudkip
  // Gen 4 - Sinnoh
  387, // Turtwig
  390, // Chimchar
  393, // Piplup
  // Gen 5 - Unova
  495, // Snivy
  498, // Tepig
  501, // Oshawott
  // Gen 6 - Kalos
  650, // Chespin
  653, // Fennekin
  656, // Froakie
  // Gen 7 - Alola
  722, // Rowlet
  725, // Litten
  728, // Popplio
  // Gen 8 - Galar
  810, // Grookey
  813, // Scorbunny
  816, // Sobble
  // Gen 9 - Paldea
  906, // Sprigatito
  909, // Fuecoco
  912, // Quaxly
]);

// Helper functions
export function isUltraBeast(id: number): boolean {
  return ULTRA_BEAST_IDS.has(id);
}

export function isParadoxPokemon(id: number): boolean {
  return PARADOX_POKEMON_IDS.has(id);
}

export function isParadoxPast(id: number): boolean {
  return PARADOX_PAST_IDS.has(id);
}

export function isParadoxFuture(id: number): boolean {
  return PARADOX_FUTURE_IDS.has(id);
}

export function isStarter(id: number): boolean {
  return STARTER_IDS.has(id);
}

// Get classification type for a Pokemon
export type ClassificationType =
  | 'legendary'
  | 'mythical'
  | 'ultra-beast'
  | 'paradox-past'
  | 'paradox-future'
  | 'starter'
  | null;

export function getClassificationType(
  id: number,
  isLegendary?: boolean,
  isMythical?: boolean
): ClassificationType {
  // Check in order of priority (most specific first)
  if (isMythical) return 'mythical';
  if (isUltraBeast(id)) return 'ultra-beast';
  if (isParadoxPast(id)) return 'paradox-past';
  if (isParadoxFuture(id)) return 'paradox-future';
  if (isLegendary) return 'legendary';
  if (isStarter(id)) return 'starter';
  return null;
}

// Get all applicable classifications for a Pokemon (can have multiple)
export function getAllClassifications(
  id: number,
  isLegendary?: boolean,
  isMythical?: boolean
): ClassificationType[] {
  const classifications: ClassificationType[] = [];

  if (isLegendary) classifications.push('legendary');
  if (isMythical) classifications.push('mythical');
  if (isUltraBeast(id)) classifications.push('ultra-beast');
  if (isParadoxPast(id)) classifications.push('paradox-past');
  if (isParadoxFuture(id)) classifications.push('paradox-future');
  if (isStarter(id)) classifications.push('starter');

  return classifications;
}
