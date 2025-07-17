import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { FadeIn, SlideUp, Scale } from "../../components/ui/animations";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { fetchPocketData } from "../../utils/pocketData";
import PocketCardList from "../../components/PocketCardList";
import Modal from "../../components/ui/modals/Modal";
import logger from "../../utils/logger";
import { getEvolutionChain } from "../../utils/evolutionUtils";
import type { PocketCard } from "../../types/api/pocket-cards";
// Define EvolutionTreeNode locally since it's not exported from types
interface EvolutionTreeNode {
  name: string;
  children?: EvolutionTreeNode[];
  parent?: EvolutionTreeNode;
}

interface PokemonDetails {
  name: string;
  type: string;
  pack: string;
  rarity: string;
  hp?: string;
  stage?: string;
  ability?: string;
  weakness?: string;
  retreat?: string;
  artist?: string;
  number?: string;
  expansion?: string;
  expansion_code?: string;
  fullart?: string;
}

interface RelatedCards {
  samePokemon: PocketCard[];
  evolution: PocketCard[];
  related: PocketCard[];
  fallback: PocketCard[];
}

// Helper function to map Pocket card names to PokeAPI IDs
const mapPocketCardNameToPokeId = (cardName: string | null | undefined): number | null => {
  if (!cardName) return null;
  
  // Remove common suffixes and clean the name
  const cleanName = cardName.toLowerCase()
    .replace(/\s+(ex|gx|v|vmax|vstar)$/i, '')
    .replace(/[^a-z]/g, '');
  
  // Manual mapping for Pokemon that have different names or special cases
  const nameMapping: Record<string, number | null> = {
    'mrmime': 122,
    'missingno': null, // Skip invalid Pokemon
    'nidoranf': 29, // Nidoran♀
    'nidoranm': 32, // Nidoran♂
    'farfetchd': 83,
    'sirfetchd': 865,
    // Add more special cases as needed
  };
  
  // Check manual mapping first
  if (nameMapping.hasOwnProperty(cleanName)) {
    return nameMapping[cleanName];
  }
  
  // For most Pokemon, try to get ID from a basic mapping
  // This is a simplified approach - we could expand this with a full name->ID map
  const commonPokemon: Record<string, number> = {
    'bulbasaur': 1, 'ivysaur': 2, 'venusaur': 3,
    'charmander': 4, 'charmeleon': 5, 'charizard': 6,
    'squirtle': 7, 'wartortle': 8, 'blastoise': 9,
    'caterpie': 10, 'metapod': 11, 'butterfree': 12,
    'weedle': 13, 'kakuna': 14, 'beedrill': 15,
    'pidgey': 16, 'pidgeotto': 17, 'pidgeot': 18,
    'rattata': 19, 'raticate': 20,
    'spearow': 21, 'fearow': 22,
    'ekans': 23, 'arbok': 24,
    'pikachu': 25, 'raichu': 26,
    'sandshrew': 27, 'sandslash': 28,
    'nidoranf': 29, 'nidorina': 30, 'nidoqueen': 31,
    'nidoranm': 32, 'nidorino': 33, 'nidoking': 34,
    'clefairy': 35, 'clefable': 36,
    'vulpix': 37, 'ninetales': 38,
    'jigglypuff': 39, 'wigglytuff': 40,
    'zubat': 41, 'golbat': 42,
    'oddish': 43, 'gloom': 44, 'vileplume': 45,
    'paras': 46, 'parasect': 47,
    'venonat': 48, 'venomoth': 49,
    'diglett': 50, 'dugtrio': 51,
    'meowth': 52, 'persian': 53,
    'psyduck': 54, 'golduck': 55,
    'mankey': 56, 'primeape': 57,
    'growlithe': 58, 'arcanine': 59,
    'poliwag': 60, 'poliwhirl': 61, 'poliwrath': 62,
    'abra': 63, 'kadabra': 64, 'alakazam': 65,
    'machop': 66, 'machoke': 67, 'machamp': 68,
    'bellsprout': 69, 'weepinbell': 70, 'victreebel': 71,
    'tentacool': 72, 'tentacruel': 73,
    'geodude': 74, 'graveler': 75, 'golem': 76,
    'ponyta': 77, 'rapidash': 78,
    'slowpoke': 79, 'slowbro': 80,
    'magnemite': 81, 'magneton': 82,
    'farfetchd': 83,
    'doduo': 84, 'dodrio': 85,
    'seel': 86, 'dewgong': 87,
    'grimer': 88, 'muk': 89,
    'shellder': 90, 'cloyster': 91,
    'gastly': 92, 'haunter': 93, 'gengar': 94,
    'onix': 95,
    'drowzee': 96, 'hypno': 97,
    'krabby': 98, 'kingler': 99,
    'voltorb': 100, 'electrode': 101,
    'exeggcute': 102, 'exeggutor': 103,
    'cubone': 104, 'marowak': 105,
    'hitmonlee': 106, 'hitmonchan': 107,
    'lickitung': 108,
    'koffing': 109, 'weezing': 110,
    'rhyhorn': 111, 'rhydon': 112,
    'chansey': 113,
    'tangela': 114,
    'kangaskhan': 115,
    'horsea': 116, 'seadra': 117,
    'goldeen': 118, 'seaking': 119,
    'staryu': 120, 'starmie': 121,
    'mrmime': 122,
    'scyther': 123,
    'jynx': 124,
    'electabuzz': 125,
    'magmar': 126,
    'pinsir': 127,
    'tauros': 128,
    'magikarp': 129, 'gyarados': 130,
    'lapras': 131,
    'ditto': 132,
    'eevee': 133, 'vaporeon': 134, 'jolteon': 135, 'flareon': 136,
    'porygon': 137,
    'omanyte': 138, 'omastar': 139,
    'kabuto': 140, 'kabutops': 141,
    'aerodactyl': 142,
    'snorlax': 143,
    'articuno': 144, 'zapdos': 145, 'moltres': 146,
    'dratini': 147, 'dragonair': 148, 'dragonite': 149,
    'mewtwo': 150, 'mew': 151,
  };
  
  return commonPokemon[cleanName] || null;
};

// Helper function to get evolution cards for a Pokemon
const getEvolutionCards = async (card: PocketCard, allCards: PocketCard[]): Promise<PocketCard[]> => {
  // Always get the PokeAPI ID for evolution data
  const baseName = card.name.toLowerCase().replace(/\s+(ex|gx|v|vmax|vstar)$/i, '').trim();
  const pokeId = mapPocketCardNameToPokeId(baseName);
  
  
  if (!pokeId) {
    // Fallback for special cases where we don't have evolution data
    // Just check for other cards with similar names
    const pokemonBaseName = card.name.split(' ')[0].toLowerCase();
    
    // Manual evolution mappings for Pokemon not covered by PokeAPI
    const manualEvolutions: Record<string, string[]> = {
      'pikachu': ['pichu', 'raichu'],
      'pichu': ['pikachu', 'raichu'],
      'raichu': ['pichu', 'pikachu'],
      'eevee': ['vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
      'vaporeon': ['eevee'],
      'jolteon': ['eevee'],
      'flareon': ['eevee'],
      // Add more manual mappings as needed
    };
    
    const evolutionNames = manualEvolutions[pokemonBaseName] || [];
    
    if (evolutionNames.length > 0) {
      const fallbackCards = allCards.filter(c => {
        if (c.id === card.id) return false;
        const cBaseName = c.name.split(' ')[0].toLowerCase();
        return evolutionNames.includes(cBaseName) || cBaseName === pokemonBaseName;
      });
      
      return fallbackCards; // Show all fallback evolution cards (no limit)
    }
    
    return [];
  }
  
  const evolutionChain = await getEvolutionChain(pokeId);
  
  if (!evolutionChain) {
    return [];
  }
  
  // Extract all Pokemon names from the evolution tree recursively
  // This includes the root, all children, and siblings
  const getAllPokemonFromTree = (node: EvolutionTreeNode, isRoot = true): string[] => {
    const names = [node.name];
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        names.push(...getAllPokemonFromTree(child, false));
      });
    }
    
    return names;
  };
  
  // For complete evolution families, we need to traverse from the root
  // to get all forms (especially important for Eevee evolutions)
  const getCompleteEvolutionFamily = (tree: EvolutionTreeNode): string[] => {
    const allNames = new Set<string>();
    
    // Add root and all descendants
    const addNodeAndChildren = (node: EvolutionTreeNode) => {
      allNames.add(node.name);
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => addNodeAndChildren(child));
      }
    };
    
    addNodeAndChildren(tree);
    return Array.from(allNames);
  };
  
  const evolutionNames = getCompleteEvolutionFamily(evolutionChain);
  
  
  const evolutionCards = allCards.filter(c => {
    if (c.id === card.id) return false; // Exclude current card
    
    const cardBaseName = c.name.toLowerCase().replace(/\s+ex$/i, '').trim();
    
    const isMatch = evolutionNames.some(evolName => {
      const cleanEvolName = evolName.toLowerCase().trim();
      return cardBaseName === cleanEvolName;
    });
    
    return isMatch;
  });
  
  
  // Sort evolution cards by Pokemon name then rarity - grouping all same Pokemon together
  const sortedEvolutionCards = evolutionCards.sort((a, b) => {
    // Extract exact Pokemon name (removing " ex" suffix but keeping full name)
    const getBasePokemonName = (name: string) => {
      return name.toLowerCase()
        .replace(/\s+ex$/i, '') // Remove " ex" suffix only
        .trim();
    };
    
    const aName = getBasePokemonName(a.name);
    const bName = getBasePokemonName(b.name);
    
    if (aName !== bName) {
      return aName.localeCompare(bName);
    }
    
    // If same Pokemon, sort by rarity (rarer cards first)
    // Pokemon Pocket uses ☆ and ◊ symbols with ♕ for crown
    const rarityOrder: Record<string, number> = {
      '♕': 0,           // Crown Rare (highest)
      '☆☆☆': 1,         // 3 stars - Immersive/Ultra Rare
      '☆☆': 2,          // 2 stars - Crown/Special
      '☆': 3,           // 1 star - EX/Full Art
      '◊◊◊◊': 4,        // 4 diamonds - Double Rare
      '◊◊◊': 5,         // 3 diamonds - Rare
      '◊◊': 6,          // 2 diamonds - Uncommon
      '◊': 7,           // 1 diamond - Common
      'Promo': 8        // Promo cards (lowest)
    };
    
    const aRarity = rarityOrder[a.rarity] !== undefined ? rarityOrder[a.rarity] : 9;
    const bRarity = rarityOrder[b.rarity] !== undefined ? rarityOrder[b.rarity] : 9;
    
    if (aRarity !== bRarity) {
      return aRarity - bRarity;
    }
    
    // If same rarity, sort by set/card number as tiebreaker
    if (a.set && b.set && a.number && b.number) {
      // First compare by set
      const setComparison = (a.set || '').localeCompare(b.set || '');
      if (setComparison !== 0) return setComparison;
      
      // Then by card number (handle numeric comparison)
      const aNum = parseInt(a.number || '0', 10);
      const bNum = parseInt(b.number || '0', 10);
      return aNum - bNum;
    }
    
    return 0;
  });
  
  // For now, show all evolution cards
  return sortedEvolutionCards;
};

export default function PocketPokemonDetail() {
  const router = useRouter();
  const { pokemonid } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pokemonDetails, setPokemonDetails] = useState<PokemonDetails | null>(null);
  const [relatedCards, setRelatedCards] = useState<RelatedCards | null>(null);
  const [zoomedCard, setZoomedCard] = useState<PocketCard | null>(null);

  useEffect(() => {
    if (!pokemonid || typeof pokemonid !== 'string') return;

    const loadPokemonData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchPocketData();
        const card = data.find((c: PocketCard) => c.id === pokemonid);

        if (!card) {
          setError("Pokemon card not found");
          setLoading(false);
          return;
        }

        // Extract Pokemon details
        const details: PokemonDetails = {
          name: card.name,
          type: card.types?.[0] || "Unknown",
          pack: card.set || "Unknown Pack",
          rarity: card.rarity || "Unknown",
          hp: card.hp?.toString(),
          stage: card.stage,
          ability: undefined,
          weakness: card.weaknesses?.[0]?.type,
          retreat: card.retreatCost?.toString(),
          artist: card.illustrator,
          number: card.number,
          expansion: card.set,
          expansion_code: card.set,
          fullart: undefined,
        };

        setPokemonDetails(details);

        // Find related cards
        const pokemonBaseName = card.name.split(' ')[0];
        
        // 1. Find other cards of the same Pokemon (different rarities/versions)
        const samePokemonCards = data.filter((c: PocketCard) => {
          return c.id !== card.id && c.name.split(' ')[0] === pokemonBaseName;
        });

        // 2. Find evolution line cards
        const evolutionCards = await getEvolutionCards(card, data);

        // 3. Find related cards (same type or pack, limited to avoid showing too many)
        const relatedTypeCards = data.filter((c: PocketCard) => {
          return c.id !== card.id && 
                 c.name.split(' ')[0] !== pokemonBaseName &&
                 !evolutionCards.some(e => e.id === c.id) &&
                 ((c.types?.[0] === card.types?.[0] && c.set === card.set) || 
                  (c.types?.[0] === card.types?.[0] && Math.random() > 0.7));
        }).slice(0, 12);

        // 4. Fallback cards (same pack, different type) in case we have few related cards
        const fallbackCards = data.filter((c: PocketCard) => {
          return c.id !== card.id && 
                 c.name.split(' ')[0] !== pokemonBaseName &&
                 !evolutionCards.some(e => e.id === c.id) &&
                 !relatedTypeCards.some(r => r.id === c.id) &&
                 c.set === card.set;
        }).slice(0, 8);

        setRelatedCards({
          samePokemon: samePokemonCards,
          evolution: evolutionCards,
          related: relatedTypeCards,
          fallback: fallbackCards
        });

        setLoading(false);
      } catch (err) {
        logger.error("Error loading Pokemon data:", err);
        setError("Failed to load Pokemon data");
        setLoading(false);
      }
    };

    loadPokemonData();
  }, [pokemonid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemonDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Pokemon not found"}</p>
          <Link
            href="/pocketmode"
            className="text-blue-500 hover:text-blue-600 underline">
            
            Back to Pocket Mode
          </Link>
        </div>
      </div>
    );
  }

  // Find the current card from the data
  const currentCardId = pokemonid as string;
  const allCards = relatedCards ? [
    ...relatedCards.samePokemon,
    ...relatedCards.evolution,
    ...relatedCards.related,
    ...relatedCards.fallback
  ] : [];
  const currentCard = allCards.find(c => c.id === currentCardId) || { 
    id: currentCardId,
    name: pokemonDetails.name,
    image: `/pocket-cards/${currentCardId}.webp`,
    type: pokemonDetails.type,
    pack: pokemonDetails.pack,
    rarity: pokemonDetails.rarity
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <Head>
        <title>{pokemonDetails.name} - Pokémon TCG Pocket</title>
        <meta name="description" content={`${pokemonDetails.name} details from Pokémon Trading Card Game Pocket`} />
      </Head>

      <FadeIn>
        <div className="mb-6">
          <Link
            href="/pocketmode"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors">
            
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Pocket Mode
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Image Section */}
          <div className="flex flex-col items-center">
            <Scale>
              <div className="relative group cursor-pointer" onClick={() => setZoomedCard(currentCard as PocketCard)}>
                <Image
                  src={currentCard.image || "/back-card.png"}
                  alt={pokemonDetails.name}
                  width={300}
                  height={420}
                  className="rounded-lg shadow-2xl transition-transform group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </Scale>
            <div className="mt-4 flex items-center space-x-2">
              <TypeBadge type={pokemonDetails.type} size="lg" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pokemonDetails.rarity}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{pokemonDetails.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {pokemonDetails.pack} • Card #{pokemonDetails.number}
              </p>
              {pokemonDetails.expansion && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Expansion: {pokemonDetails.expansion} ({pokemonDetails.expansion_code})
                </p>
              )}
            </div>

            {/* Card Stats */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Card Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {pokemonDetails.hp && (
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">HP</h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{pokemonDetails.hp}</p>
                  </div>
                )}
                
                {pokemonDetails.stage && (
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Stage</h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{pokemonDetails.stage}</p>
                  </div>
                )}
                
                {pokemonDetails.weakness && (
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Weakness</h3>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">{pokemonDetails.weakness}</p>
                  </div>
                )}
                
                {pokemonDetails.retreat && (
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Retreat Cost</h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{pokemonDetails.retreat}</p>
                  </div>
                )}
              </div>

              {pokemonDetails.ability && (
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ability</h3>
                  <p className="text-gray-800 dark:text-gray-200">{pokemonDetails.ability}</p>
                </div>
              )}

              {pokemonDetails.artist && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Illustrated by: <span className="font-medium">{pokemonDetails.artist}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                {pokemonDetails.fullart && (
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Art</h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{pokemonDetails.fullart}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </FadeIn>
      
      <SlideUp delay={200}>
        {/* Similar Cards - Always Visible */}
        <div className="mt-8">
          <div className="space-y-8">
            <h2 className="text-xl font-bold mb-6">Similar Cards</h2>
            
            {/* Same Pokémon Cards Section */}
            {relatedCards?.samePokemon && relatedCards.samePokemon.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400 border-b border-blue-200 dark:border-blue-700 pb-2">
                  Other {pokemonDetails.name.split(' ')[0]} Cards
                </h3>
                <PocketCardList 
                  cards={relatedCards.samePokemon}
                  loading={false}
                  error={undefined}
                  showSort={false}
                  hideCardCount={true}
                  gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4"
                  imageWidth={110}
                  imageHeight={154}
                  emptyMessage={`No other ${pokemonDetails.name.split(' ')[0]} cards found.`}
                />
              </div>
            )}

            {/* Evolution Line Section */}
            {relatedCards?.evolution && relatedCards.evolution.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400 border-b border-green-200 dark:border-green-700 pb-2">
                  Evolution Line
                </h3>
                <PocketCardList 
                  cards={relatedCards.evolution}
                  loading={false}
                  error={undefined}
                  showSort={false}
                  hideCardCount={true}
                  gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4"
                  imageWidth={110}
                  imageHeight={154}
                  emptyMessage="No evolution cards found."
                />
              </div>
            )}

            {/* Related Cards Section */}
            {relatedCards?.related && relatedCards.related.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400 border-b border-purple-200 dark:border-purple-700 pb-2">
                  Related Cards
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Other {pokemonDetails.type} type cards from the {pokemonDetails.pack} pack
                </p>
                <PocketCardList 
                  cards={relatedCards.related}
                  loading={false}
                  error={undefined}
                  showSort={false}
                  hideCardCount={true}
                  gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4"
                  imageWidth={110}
                  imageHeight={154}
                  emptyMessage="No related cards found."
                />
              </div>
            )}

            {/* Fallback Similar Cards Section */}
            {relatedCards?.fallback && relatedCards.fallback.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Other Similar Cards
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Cards from the same pack or with similar type
                </p>
                <PocketCardList 
                  cards={relatedCards.fallback}
                  loading={false}
                  error={undefined}
                  showSort={false}
                  hideCardCount={true}
                  gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4"
                  imageWidth={110}
                  imageHeight={154}
                  emptyMessage="No similar cards found."
                />
              </div>
            )}

            {/* Empty state if no cards in any category */}
            {(!relatedCards?.samePokemon || relatedCards.samePokemon.length === 0) &&
             (!relatedCards?.evolution || relatedCards.evolution.length === 0) &&
             (!relatedCards?.related || relatedCards.related.length === 0) &&
             (!relatedCards?.fallback || relatedCards.fallback.length === 0) && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No Related Cards Found</h3>
                <p className="text-gray-500 dark:text-gray-500">
                  We couldn't find any other cards related to {pokemonDetails.name}.
                </p>
              </div>
            )}
          </div>
        </div>
      </SlideUp>
      
      {/* Zoom Modal */}
      {zoomedCard && (
        <Modal isOpen={true} onClose={() => setZoomedCard(null)}>
          <div className="flex flex-col items-center">
            <Image
              src={zoomedCard.image || "/back-card.png"}
              alt={zoomedCard.name}
              width={400}
              height={560}
              className="rounded-lg shadow-lg"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
              sizes="400px"
            />
            <h3 className="mt-4 text-xl font-bold text-center">{zoomedCard.name}</h3>
            {zoomedCard.set && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{zoomedCard.set}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}