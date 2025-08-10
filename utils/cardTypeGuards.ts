/**
 * Card type guards and converters to ensure type safety between internal and SDK card types
 */

import type { Card } from "pokemontcgsdk";
import type { TCGCard } from "../types/api/cards";

/**
 * Valid supertype values according to pokemontcgsdk
 */
export type ValidSupertype = "Pokémon" | "Trainer" | "Energy";

/**
 * Type guard to check if a supertype is valid
 */
export function isValidSupertype(supertype: string | undefined): supertype is ValidSupertype {
  return supertype === "Pokémon" || supertype === "Trainer" || supertype === "Energy";
}

/**
 * Normalizes a supertype to a valid value, with fallback
 */
export function normalizeSupertypeWithFallback(supertype: string | undefined, cardName?: string): ValidSupertype {
  if (isValidSupertype(supertype)) {
    return supertype;
  }
  
  // Fallback logic based on common patterns
  if (cardName) {
    const name = cardName.toLowerCase();
    
    // Common trainer card patterns
    if (name.includes("professor") || name.includes("ball") || name.includes("potion") || 
        name.includes("switch") || name.includes("energy search") || name.includes("bill")) {
      return "Trainer";
    }
    
    // Common energy patterns
    if (name.includes("energy") && !name.includes("energy search")) {
      return "Energy";
    }
  }
  
  // Default to Pokémon if uncertain (most cards are Pokémon)
  return "Pokémon";
}

/**
 * Converts TCGCard to pokemontcgsdk Card with type safety
 */
export function tcgCardToSdkCard(tcgCard: TCGCard): Card {
  const normalizedSupertype = normalizeSupertypeWithFallback(tcgCard.supertype, tcgCard.name);
  
  return {
    id: tcgCard.id,
    name: tcgCard.name,
    supertype: normalizedSupertype,
    subtypes: tcgCard.subtypes,
    level: tcgCard.level,
    hp: tcgCard.hp,
    types: tcgCard.types,
    evolvesFrom: tcgCard.evolvesFrom,
    abilities: tcgCard.abilities,
    attacks: tcgCard.attacks,
    weaknesses: tcgCard.weaknesses,
    resistances: tcgCard.resistances,
    retreatCost: tcgCard.retreatCost,
    convertedRetreatCost: tcgCard.convertedRetreatCost,
    set: tcgCard.set,
    number: tcgCard.number,
    artist: tcgCard.artist,
    rarity: tcgCard.rarity,
    flavorText: tcgCard.flavorText,
    nationalPokedexNumbers: tcgCard.nationalPokedexNumbers,
    legalities: tcgCard.legalities,
    images: tcgCard.images,
    tcgplayer: tcgCard.tcgplayer
  };
}

/**
 * Type guard to check if a card has a valid SDK-compatible structure
 */
export function isSdkCompatibleCard(card: any): card is Card {
  return (
    card &&
    typeof card.id === "string" &&
    typeof card.name === "string" &&
    isValidSupertype(card.supertype) &&
    card.images &&
    typeof card.images.small === "string" &&
    typeof card.images.large === "string"
  );
}

/**
 * Ensures a card object is SDK-compatible by normalizing it
 */
export function ensureSdkCompatibleCard(card: any): Card {
  if (isSdkCompatibleCard(card)) {
    return card;
  }
  
  // Convert from TCGCard or normalize the structure
  return {
    id: card.id || "unknown",
    name: card.name || "Unknown Card",
    supertype: normalizeSupertypeWithFallback(card.supertype, card.name),
    subtypes: card.subtypes || [],
    level: card.level,
    hp: card.hp,
    types: card.types || [],
    evolvesFrom: card.evolvesFrom,
    abilities: card.abilities || [],
    attacks: card.attacks || [],
    weaknesses: card.weaknesses || [],
    resistances: card.resistances || [],
    retreatCost: card.retreatCost || [],
    convertedRetreatCost: card.convertedRetreatCost,
    set: card.set || { id: "unknown", name: "Unknown Set" },
    number: card.number || "0",
    artist: card.artist,
    rarity: card.rarity,
    flavorText: card.flavorText,
    nationalPokedexNumbers: card.nationalPokedexNumbers || [],
    legalities: card.legalities || {},
    images: {
      small: card.images?.small || card.image || "/back-card.png",
      large: card.images?.large || card.image || "/back-card.png"
    },
    tcgplayer: card.tcgplayer,
    currentPrice: card.currentPrice
  };
}