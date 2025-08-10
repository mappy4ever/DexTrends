/**
 * Card type guards and converters to ensure type safety between internal and SDK card types
 */

import type { Card, TCGPlayerPricing, PriceRange } from "pokemontcgsdk";
import type { TCGCard, TCGPlayer, PriceData } from "../types/api/cards";

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
 * Converts PriceData (allows null) to PriceRange (no null) by converting null to undefined
 */
function convertPriceDataToPriceRange(priceData: PriceData): PriceRange {
  return {
    low: priceData.low ?? undefined,
    mid: priceData.mid ?? undefined,
    high: priceData.high ?? undefined,
    market: priceData.market ?? undefined,
    directLow: priceData.directLow ?? undefined
  };
}

/**
 * Converts TCGPlayer to TCGPlayerPricing by handling null to undefined conversion
 */
function convertTCGPlayerToSDK(tcgPlayer: TCGPlayer): TCGPlayerPricing {
  const result: TCGPlayerPricing = {
    url: tcgPlayer.url,
    updatedAt: tcgPlayer.updatedAt
  };

  if (tcgPlayer.prices) {
    result.prices = {};
    if (tcgPlayer.prices.normal) {
      result.prices.normal = convertPriceDataToPriceRange(tcgPlayer.prices.normal);
    }
    if (tcgPlayer.prices.holofoil) {
      result.prices.holofoil = convertPriceDataToPriceRange(tcgPlayer.prices.holofoil);
    }
    if (tcgPlayer.prices.reverseHolofoil) {
      result.prices.reverseHolofoil = convertPriceDataToPriceRange(tcgPlayer.prices.reverseHolofoil);
    }
  }

  return result;
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
    tcgplayer: tcgCard.tcgplayer ? convertTCGPlayerToSDK(tcgCard.tcgplayer) : undefined
  };
}

/**
 * Type guard to check if a card has a valid SDK-compatible structure
 */
export function isSdkCompatibleCard(card: unknown): card is Card {
  if (!card || typeof card !== "object" || !("id" in card)) return false;
  
  const cardObj = card as Record<string, unknown>;
  
  return (
    typeof cardObj.id === "string" &&
    typeof cardObj.name === "string" &&
    isValidSupertype(cardObj.supertype as string) &&
    typeof cardObj.images === "object" &&
    cardObj.images !== null &&
    "small" in cardObj.images &&
    "large" in cardObj.images &&
    typeof (cardObj.images as Record<string, unknown>).small === "string" &&
    typeof (cardObj.images as Record<string, unknown>).large === "string"
  );
}

/**
 * Ensures a card object is SDK-compatible by normalizing it
 */
export function ensureSdkCompatibleCard(card: unknown): Card {
  if (isSdkCompatibleCard(card)) {
    return card;
  }
  
  // Convert from TCGCard or normalize the structure
  const cardObj = card as Record<string, unknown>;
  
  return {
    id: typeof cardObj?.id === "string" ? cardObj.id : "unknown",
    name: typeof cardObj?.name === "string" ? cardObj.name : "Unknown Card",
    supertype: normalizeSupertypeWithFallback(
      typeof cardObj?.supertype === "string" ? cardObj.supertype : undefined, 
      typeof cardObj?.name === "string" ? cardObj.name : undefined
    ),
    subtypes: Array.isArray(cardObj?.subtypes) ? cardObj.subtypes as string[] : [],
    level: typeof cardObj?.level === "string" ? cardObj.level : undefined,
    hp: typeof cardObj?.hp === "string" ? cardObj.hp : undefined,
    types: Array.isArray(cardObj?.types) ? cardObj.types as string[] : [],
    evolvesFrom: typeof cardObj?.evolvesFrom === "string" ? cardObj.evolvesFrom : undefined,
    abilities: Array.isArray(cardObj?.abilities) ? cardObj.abilities as Card["abilities"] : [],
    attacks: Array.isArray(cardObj?.attacks) ? cardObj.attacks as Card["attacks"] : [],
    weaknesses: Array.isArray(cardObj?.weaknesses) ? cardObj.weaknesses as Card["weaknesses"] : [],
    resistances: Array.isArray(cardObj?.resistances) ? cardObj.resistances as Card["resistances"] : [],
    retreatCost: Array.isArray(cardObj?.retreatCost) ? cardObj.retreatCost as string[] : [],
    convertedRetreatCost: typeof cardObj?.convertedRetreatCost === "number" ? cardObj.convertedRetreatCost : undefined,
    set: cardObj?.set && typeof cardObj.set === "object" ? cardObj.set as Card["set"] : { id: "unknown", name: "Unknown Set" },
    number: typeof cardObj?.number === "string" ? cardObj.number : "0",
    artist: typeof cardObj?.artist === "string" ? cardObj.artist : undefined,
    rarity: typeof cardObj?.rarity === "string" ? cardObj.rarity : undefined,
    flavorText: typeof cardObj?.flavorText === "string" ? cardObj.flavorText : undefined,
    nationalPokedexNumbers: Array.isArray(cardObj?.nationalPokedexNumbers) ? cardObj.nationalPokedexNumbers as number[] : [],
    legalities: cardObj?.legalities && typeof cardObj.legalities === "object" ? cardObj.legalities as Card["legalities"] : {},
    images: {
      small: (cardObj?.images as Record<string, unknown>)?.small as string || (cardObj?.image as string) || "/back-card.png",
      large: (cardObj?.images as Record<string, unknown>)?.large as string || (cardObj?.image as string) || "/back-card.png"
    },
    tcgplayer: cardObj?.tcgplayer ? convertTCGPlayerToSDK(cardObj.tcgplayer as TCGPlayer) : undefined,
    currentPrice: typeof cardObj?.currentPrice === "number" ? cardObj.currentPrice : undefined
  } as Card;
}