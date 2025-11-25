import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { FadeIn, SlideUp, Scale } from "../../components/ui/animations";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { TypeGradientBadge } from "../../components/ui/design-system/TypeGradientBadge";
import { fetchPocketData } from "../../utils/pocketData";
import PocketCardList from "../../components/PocketCardList";
import Modal from "../../components/ui/Modal";
import logger from "../../utils/logger";
import { getEvolutionChain } from "../../utils/evolutionUtils";
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { GlassContainer } from '../../components/ui/glass-components';
import Button from '../../components/ui/Button';
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import { motion, useScroll, useTransform } from "framer-motion";
import { PokemonRadarChart } from "../../components/ui/LazyComponents";
import PokemonTypeWheel from "../../components/pocket/PokemonTypeWheel";
import PokemonEvolutionFlow from "../../components/pocket/PokemonEvolutionFlow";
import { POKEMON_TYPE_COLORS as pokemonTypeColors } from "../../utils/unifiedTypeColors";
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
  const getAllPokemonFromTree = (node: EvolutionTreeNode, _isRoot = true): string[] => {
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
  
  // Add scroll-based animations (must be before any returns)
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 300], [0, -50]);
  const backgroundOpacity = useTransform(scrollY, [0, 300], [0.5, 0.8]);

  useEffect(() => {
    if (!pokemonid || typeof pokemonid !== 'string') return;

    const loadPokemonData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchPocketData();
        logger.debug('[Pocket Card Detail] Total cards loaded:', { count: data.length });
        logger.debug('[Pocket Card Detail] Looking for card ID:', { pokemonid });
        
        const card = data.find((c: PocketCard) => c.id === pokemonid);
        logger.debug('[Pocket Card Detail] Found card:', { card });
        
        if (!card) {
          logger.error('[Pocket Card Detail] Card not found in data');
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
      <PageLoader text="Loading Pokémon..." />
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
  const primaryCard = relatedCards?.samePokemon.find(c => c.id === currentCardId);
  const currentCard = primaryCard || allCards.find(c => c.id === currentCardId) || { 
    id: currentCardId,
    name: pokemonDetails.name,
    image: null, // Will use fallback in Image component
    type: pokemonDetails.type,
    pack: pokemonDetails.pack,
    rarity: pokemonDetails.rarity
  };

  return (
    <FullBleedWrapper gradient="tcg">
      {/* Animated Background Elements */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <Head>
          <title>{pokemonDetails.name} - Pokémon TCG Pocket</title>
          <meta name="description" content={`${pokemonDetails.name} details from Pokémon Trading Card Game Pocket`} />
        </Head>

      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Button gradient={true}
          onClick={() => router.push('/pocketmode')}
          variant="secondary"
          size="sm"
          className="mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Pocket Mode
        </Button>
      </motion.div>

        {/* Main Content Grid with Stagger Animation */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          {/* Premium Card Display with 3D Effects */}
          <div className="flex flex-col items-center">
            <motion.div
              className="relative perspective-1000"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* 3D Card Container */}
              <motion.div
                className="relative group cursor-pointer"
                whileHover="hover"
                onClick={() => setZoomedCard(currentCard as PocketCard)}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Card Glow Effect */}
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-0 blur-xl"
                  variants={{
                    hover: { opacity: 0.4 }
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Card Shadow */}
                <motion.div
                  className="absolute inset-0 bg-black rounded-xl"
                  style={{ transform: "translateZ(-20px) translateY(10px)" }}
                  variants={{
                    hover: { 
                      transform: "translateZ(-40px) translateY(20px)",
                      opacity: 0.3
                    }
                  }}
                  initial={{ opacity: 0.2 }}
                />
                
                {/* Main Card */}
                <motion.div
                  className="relative rounded-xl overflow-hidden shadow-2xl"
                  variants={{
                    hover: { 
                      rotateY: 5,
                      rotateX: -5,
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }
                  }}
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Holographic Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 mix-blend-overlay pointer-events-none"
                    variants={{
                      hover: { 
                        opacity: 1,
                        backgroundPosition: ["0% 0%", "100% 100%"],
                        transition: { duration: 2, repeat: Infinity }
                      }
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  />
                  
                  <Image
                    src={currentCard.image || "/back-card.png"}
                    alt={pokemonDetails.name}
                    width={300}
                    height={420}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/back-card.png";
                    }}
                    className="relative z-10"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                    sizes="300px"
                  />
                  
                  {/* Zoom Indicator */}
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center pointer-events-none"
                    variants={{
                      hover: { backgroundColor: "rgba(0,0,0,0.1)" }
                    }}
                  >
                    <motion.svg 
                      className="w-12 h-12 text-white opacity-0"
                      variants={{
                        hover: { opacity: 1, scale: [1, 1.2, 1] }
                      }}
                      transition={{ scale: { repeat: Infinity, duration: 1.5 } }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </motion.svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Card Info */}
            <motion.div 
              className="mt-6 text-center space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center space-x-3">
                <TypeGradientBadge type={pokemonDetails.type} size="lg" />
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {pokemonDetails.rarity}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Card #{pokemonDetails.number} • {pokemonDetails.pack}
              </p>
            </motion.div>
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

            {/* Premium Stats Display */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Hexagonal Stats Radar */}
              <GlassContainer variant="dark" blur="lg" hover gradient className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Battle Statistics
                </h2>
                <div className="flex justify-center">
                  <PokemonRadarChart
                    stats={[
                      { name: 'hp', value: parseInt(pokemonDetails.hp || '100'), max: 255 },
                      { name: 'attack', value: 120, max: 255 },
                      { name: 'defense', value: 95, max: 255 },
                      { name: 'special-attack', value: 110, max: 255 },
                      { name: 'special-defense', value: 85, max: 255 },
                      { name: 'speed', value: 90, max: 255 }
                    ]}
                    size={280}
                    typeColors={{
                      primary: `from-${pokemonDetails.type?.toLowerCase() || 'gray'}-400`,
                      secondary: `to-${pokemonDetails.type?.toLowerCase() || 'gray'}-600`
                    }}
                    animate
                    interactive
                  />
                </div>
              </GlassContainer>

              {/* Card Details in Premium Containers */}
              <GlassContainer variant="dark" blur="lg" hover gradient>
                <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Card Information
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {pokemonDetails.hp && (
                    <motion.div 
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 border border-green-500/20"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Health Points</h3>
                      <p className="text-3xl font-bold text-green-400">{pokemonDetails.hp}</p>
                      <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${(parseInt(pokemonDetails.hp) / 200) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  {pokemonDetails.stage && (
                    <motion.div 
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 border border-blue-500/20"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Evolution Stage</h3>
                      <p className="text-2xl font-bold text-blue-400">{pokemonDetails.stage}</p>
                    </motion.div>
                  )}
                  
                  {pokemonDetails.weakness && (
                    <motion.div 
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10 p-6 border border-red-500/20"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Weakness</h3>
                      <p className="text-2xl font-bold text-red-400">{pokemonDetails.weakness}</p>
                    </motion.div>
                  )}
                  
                  {pokemonDetails.retreat && (
                    <motion.div 
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500/10 to-slate-500/10 p-6 border border-gray-500/20"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent" />
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Retreat Cost</h3>
                      <p className="text-2xl font-bold text-gray-300">{pokemonDetails.retreat}</p>
                    </motion.div>
                  )}
                </div>

                {pokemonDetails.ability && (
                  <motion.div 
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 border border-purple-500/20 mt-4"
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Special Ability</h3>
                    <p className="text-gray-200 leading-relaxed">{pokemonDetails.ability}</p>
                  </motion.div>
                )}

                {pokemonDetails.artist && (
                  <motion.div 
                    className="relative mt-6 pt-6 border-t border-gray-700/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="text-center text-gray-400">
                      Illustrated by <span className="font-medium text-purple-400">{pokemonDetails.artist}</span>
                    </p>
                  </motion.div>
                )}
              </GlassContainer>
              
              {/* Type Effectiveness Wheel */}
              <GlassContainer variant="dark" blur="lg" hover gradient className="p-6 mt-6">
                <h2 className="text-xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Type Matchups
                </h2>
                <div className="flex justify-center">
                  <PokemonTypeWheel
                    pokemonType={pokemonDetails.type || 'normal'}
                    size={300}
                    interactive
                  />
                </div>
              </GlassContainer>
            </motion.div>
          </div>

        </motion.div>
      
      <SlideUp delay={200}>
        {/* Similar Cards - Premium Design */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassContainer variant="dark" blur="lg" hover gradient>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Similar Cards</h2>
            
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

            {/* Evolution Line Section - Premium Flow */}
            {relatedCards?.evolution && relatedCards.evolution.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="col-span-full"
              >
                <GlassContainer variant="dark" blur="lg" hover gradient className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                    Evolution Chain
                  </h3>
                  <PokemonEvolutionFlow
                    evolutionChain={[
                      ...(relatedCards.samePokemon.map(card => ({ card }))),
                      ...(relatedCards.evolution.map(card => ({ card })))
                    ].sort((a, b) => {
                      // Sort by Pokemon name to group evolution stages
                      const aName = a.card.name.toLowerCase().replace(/\s+(ex|gx|v|vmax|vstar)$/i, '');
                      const bName = b.card.name.toLowerCase().replace(/\s+(ex|gx|v|vmax|vstar)$/i, '');
                      return aName.localeCompare(bName);
                    })}
                    currentPokemon={pokemonDetails.name}
                    onCardClick={(card) => {
                      router.push(`/pocketmode/${card.id}`);
                    }}
                  />
                </GlassContainer>
              </motion.div>
            )}

              {/* Related Cards Section */}
              {relatedCards?.related && relatedCards.related.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Related Cards</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Other {pokemonDetails.type} type cards from the {pokemonDetails.pack} pack
                  </p>
                  <div className="glass-light rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
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
                </motion.div>
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
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No Related Cards Found</h3>
                <p className="text-gray-500 dark:text-gray-500">
                  We couldn't find any other cards related to {pokemonDetails.name}.
                </p>
              </div>
            )}
            </GlassContainer>
          </motion.div>
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/back-card.png";
              }}
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
    </FullBleedWrapper>
  );
}

// Mark this page as full bleed to remove Layout padding
(PocketPokemonDetail as any).fullBleed = true;