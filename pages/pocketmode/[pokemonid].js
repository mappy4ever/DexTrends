import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { FadeIn, SlideUp, Scale } from "../../components/ui/animations";
import { TypeBadge } from "../../components/ui/TypeBadge"; // Updated path
import { fetchPocketData } from "../../utils/pocketData";
import PocketCardList from "../../components/PocketCardList";
import Modal from "../../components/ui/Modal";
import logger from "../../utils/logger";
import { getEvolutionChain } from "../../utils/evolutionUtils";

// Helper function to map Pocket card names to PokeAPI IDs
const mapPocketCardNameToPokeId = (cardName) => {
  if (!cardName) return null;
  
  // Remove common suffixes and clean the name
  const cleanName = cardName.toLowerCase()
    .replace(/\s+(ex|gx|v|vmax|vstar)$/i, '')
    .replace(/[^a-z]/g, '');
  
  // Manual mapping for Pokemon that have different names or special cases
  const nameMapping = {
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
  const commonPokemon = {
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
    
    // Gen 2 additions (some key ones)
    'chikorita': 152, 'bayleef': 153, 'meganium': 154,
    'cyndaquil': 155, 'quilava': 156, 'typhlosion': 157,
    'totodile': 158, 'croconaw': 159, 'feraligatr': 160,
    'crobat': 169,
    'espeon': 196, 'umbreon': 197,
    'lugia': 249, 'hooh': 250,
    
    // Gen 3 additions (some key ones)  
    'treecko': 252, 'grovyle': 253, 'sceptile': 254,
    'torchic': 255, 'combusken': 256, 'blaziken': 257,
    'mudkip': 258, 'marshtomp': 259, 'swampert': 260,
    'gardevoir': 282,
    'metagross': 376,
    'rayquaza': 384,
    
    // Gen 4 additions (some key ones)
    'dialga': 483, 'palkia': 484, 'giratina': 487,
    'leafeon': 470, 'glaceon': 471,
    'darkrai': 491,
    
    // Gen 5 additions (Larvesta line and others)
    'larvesta': 636, 'volcarona': 637,
    'reshiram': 643, 'zekrom': 644,
    
    // Gen 6 additions
    'sylveon': 700,
    
    // Add more as needed for Pocket cards
    'lucario': 448,
    'garchomp': 445
  };
  
  return commonPokemon[cleanName] || null;
};

// Smart evolution detection using PokeAPI
const getSmartEvolutionCards = async (card, allCards) => {
  try {
    const pokeId = mapPocketCardNameToPokeId(card.name);
    
    
    if (!pokeId) {
      
      // Fallback to simple manual evolution detection for unmapped Pokemon
      const simpleFallbackEvolutions = {
        // Eevee evolution family - all should show each other
        'eevee': ['vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
        'vaporeon': ['eevee', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
        'jolteon': ['eevee', 'vaporeon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
        'flareon': ['eevee', 'vaporeon', 'jolteon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
        'espeon': ['eevee', 'vaporeon', 'jolteon', 'flareon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
        'umbreon': ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'leafeon', 'glaceon', 'sylveon'],
        'leafeon': ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'glaceon', 'sylveon'],
        'glaceon': ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'sylveon'],
        'sylveon': ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon'],
        
        // Other evolution families
        'larvesta': ['volcarona'],
        'volcarona': ['larvesta'],
        'pichu': ['pikachu', 'raichu'],
        'cleffa': ['clefairy', 'clefable'],
        'igglybuff': ['jigglypuff', 'wigglytuff'],
        'togepi': ['togetic'],
        'togetic': ['togepi', 'togekiss'],
        'riolu': ['lucario'],
        'lucario': ['riolu'],
        'gible': ['gabite', 'garchomp'],
        'gabite': ['gible', 'garchomp'],
        'garchomp': ['gible', 'gabite']
      };
      
      const currentCleanName = card.name.toLowerCase().replace(/\s+(ex|gx|v|vmax|vstar)$/i, '').replace(/[^a-z]/g, '');
      const fallbackEvolutions = simpleFallbackEvolutions[currentCleanName] || [];
      
      if (fallbackEvolutions.length > 0) {
        
        const fallbackCards = allCards.filter(c => {
          if (c.id === card.id) return false;
          const cardBaseName = c.name.toLowerCase().replace(/\s+(ex|gx|v|vmax|vstar)$/i, '').replace(/[^a-z]/g, '');
          return fallbackEvolutions.some(evolName => cardBaseName === evolName.toLowerCase());
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
    const getAllPokemonFromTree = (node, isRoot = true) => {
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
    const getCompleteEvolutionFamily = (tree) => {
      const allNames = new Set();
      
      // Add root and all descendants
      const addNodeAndChildren = (node) => {
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
      const getBasePokemonName = (name) => {
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
      const rarityOrder = {
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
        const setCompare = a.set.tag.localeCompare(b.set.tag);
        if (setCompare !== 0) return setCompare;
        return parseInt(a.number) - parseInt(b.number);
      }
      
      return 0;
    });
    
    // Show ALL evolution cards (including all variants)
    return sortedEvolutionCards;
    
  } catch (error) {
    console.error('Error getting smart evolution cards:', error);
    return [];
  }
};

function PocketPokemonDetail() {
  const router = useRouter();
  const { pokemonid } = router.query; // Changed to pokemonid
  
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [relatedCards, setRelatedCards] = useState({ samePokemon: [], evolution: [], related: [], fallback: [] });
  const [evolutionCards, setEvolutionCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("other-cards");
  const [zoomedCard, setZoomedCard] = useState(null);
  
  useEffect(() => {
    if (!router.isReady || !pokemonid) return; // Changed to pokemonid
    
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        // Fetch all Pocket data and find the specific card
        const allCards = await fetchPocketData();
        const card = allCards.find(c => c.id === pokemonid);
        
        if (!card) {
          throw new Error("Card not found");
        }
        
        setPokemonDetails(card);
        
        // Find related cards organized by category
        const baseName = card.name.toLowerCase().replace(/\s+(ex|gx|v|vmax|vstar)$/i, '');
        const currentFirstWord = card.name.split(' ')[0].toLowerCase();
        
        
        // Helper function to sort cards by Pokemon name then rarity
        const sortCardsByNameAndRarity = (cards) => {
          return cards.sort((a, b) => {
            // Extract exact Pokemon name (removing " ex" suffix but keeping full name)
            const getBasePokemonName = (name) => {
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
            const rarityOrder = {
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
            
            return aRarity - bRarity;
          });
        };

        // 1. Same Pokémon cards (different variants of the same Pokémon)
        const samePokemonCards = sortCardsByNameAndRarity(allCards.filter(c => {
          if (c.id === pokemonid) return false;
          
          const cardBaseName = c.name.toLowerCase().replace(/\s+(ex|gx|v|vmax|vstar)$/i, '');
          const cardFirstWord = c.name.split(' ')[0].toLowerCase();
          
          
          // Same base Pokémon name (e.g., Pikachu and Pikachu EX)
          return cardBaseName === baseName || cardFirstWord === currentFirstWord;
        })); // Show all same Pokemon cards (no limit)
        
        // 2. Evolution line cards - using smart PokeAPI-based detection
        const evolutionCards = await getSmartEvolutionCards(card, allCards);
        
        // 3. Related cards (same type and pack, but different Pokémon)
        const relatedCardsList = sortCardsByNameAndRarity(allCards.filter(c => {
          if (c.id === pokemonid) return false;
          
          const cardFirstWord = c.name.split(' ')[0].toLowerCase();
          
          // Exclude cards already in same Pokémon or evolution categories
          const isAlreadyIncluded = samePokemonCards.some(sc => sc.id === c.id) || 
                                   evolutionCards.some(ec => ec.id === c.id);
          
          if (isAlreadyIncluded) return false;
          
          // Same type and pack (different Pokémon)
          return c.type === card.type && c.pack === card.pack;
        })).slice(0, 8);
        
        
        // If we don't have many cards in categories, add a broader "similar" category
        let fallbackSimilar = [];
        const totalCategorized = samePokemonCards.length + evolutionCards.length + relatedCardsList.length;
        
        if (totalCategorized < 5) {
          fallbackSimilar = sortCardsByNameAndRarity(allCards.filter(c => {
            if (c.id === pokemonid) return false;
            
            // Already included in other categories
            const isAlreadyIncluded = samePokemonCards.some(sc => sc.id === c.id) || 
                                     evolutionCards.some(ec => ec.id === c.id) ||
                                     relatedCardsList.some(rc => rc.id === c.id);
            
            if (isAlreadyIncluded) return false;
            
            // Same pack OR same type
            return c.pack === card.pack || c.type === card.type;
          })).slice(0, 8); // Limit fallback similar cards to 8
          
        }
        
        // Store in separate state variables
        setRelatedCards({ 
          samePokemon: samePokemonCards, 
          evolution: evolutionCards, 
          related: relatedCardsList,
          fallback: fallbackSimilar
        });
        setEvolutionCards(evolutionCards);
        
        setLoading(false);
      } catch (err) {
        logger.error("Failed to fetch Pokémon details:", { error: err });
        setError(err.message || "Failed to load card details");
        setLoading(false);
      }
    };
    
    fetchPokemonDetails();
  }, [router.isReady, pokemonid]); // Changed to pokemonid
  
  if (loading) {
    return (
      <div className="container section-spacing-y-default max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
            <div className="w-20 h-20 rounded-full border-4 border-t-primary border-r-primary/70 border-b-primary/40 border-l-transparent animate-spin"></div>
          </div>
          <h3 className="mt-6 text-xl font-semibold">Loading card details...</h3>
        </div>
      </div>
    );
  }
  
  if (error || !pokemonDetails) {
    return (
      <div className="container section-spacing-y-default max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 opacity-30 rounded-full"></div>
            <svg className="w-24 h-24 text-red-500 mx-auto relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Error Loading Card</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md text-center">
            {error || "Card not found or unavailable at this time."}
          </p>
          <button 
            onClick={() => router.push('/pocketmode', undefined, { shallow: false })}
            className="mt-6 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
          >
            Back to Pocket Mode
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <Head>
        <title>{pokemonDetails.name} | Pokémon TCG Pocket Card | DexTrends</title>
        <meta name="description" content={`View detailed information about ${pokemonDetails.name} Pokémon TCG Pocket card, including attacks, abilities, and market prices.`} />
        <meta property="og:title" content={`${pokemonDetails.name} | Pokémon TCG Pocket Card`} />
        <meta property="og:description" content={`Explore ${pokemonDetails.name} card details, attacks, abilities, and related cards in the Pokémon TCG Pocket format.`} />
        <meta property="og:type" content="website" />
        {pokemonDetails.image && <meta property="og:image" content={pokemonDetails.image} />}
        <meta name="keywords" content={`Pokemon TCG Pocket, ${pokemonDetails.name}, Pokemon card, ${pokemonDetails.types?.join(', ')}`} />
      </Head>
      <FadeIn>
        <div className="mb-8">
          {/* Unified Layout - Mobile and Desktop */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <Scale className="relative flex-shrink-0">
              <div className="relative w-64 h-96 lg:w-80 lg:h-120 cursor-pointer group" style={{ width: '256px', height: '384px' }}>
                <Image 
                  src={pokemonDetails.image || "/back-card.png"} 
                  alt={pokemonDetails.name}
                  fill
                  className="drop-shadow-xl object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                  onClick={() => setZoomedCard(pokemonDetails)}
                  priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 p-2 rounded-full shadow-lg">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Scale>
            
            <div className="flex-1 text-center lg:text-left">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold capitalize">
                    {pokemonDetails.name}
                    {pokemonDetails.supertype && (
                      <span className="block lg:inline lg:ml-2 mt-1 lg:mt-0 text-sm lg:text-lg px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {pokemonDetails.supertype}
                      </span>
                    )}
                  </h1>
                </div>
                <Link href="/pocketmode">
                  <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Link>
              </div>
              
              <div className="flex justify-center lg:justify-start gap-2 mt-3">
                {pokemonDetails.type && (
                  <TypeBadge 
                    type={pokemonDetails.type} 
                    size="lg" 
                    isPocketCard={true}
                  />
                )}
              </div>
              
              {/* Card Details - Always Visible */}
              <div className="mt-6 bg-white/70 dark:bg-gray-800/70 p-6 rounded-lg backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Card Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pokemonDetails.health && (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">HP</h3>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{pokemonDetails.health}</p>
                    </div>
                  )}
                  {pokemonDetails.pack && (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pack</h3>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{pokemonDetails.pack}</p>
                    </div>
                  )}
                  {pokemonDetails.rarity && (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rarity</h3>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{pokemonDetails.rarity}</p>
                    </div>
                  )}
                  {pokemonDetails.artist && (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Artist</h3>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{pokemonDetails.artist}</p>
                    </div>
                  )}
                  {pokemonDetails.ex && (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">EX Card</h3>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{pokemonDetails.ex}</p>
                    </div>
                  )}
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
                  error={null}
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
                  error={null}
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
                  error={null}
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
                  error={null}
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
            {zoomedCard.pack && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{zoomedCard.pack}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PocketPokemonDetail;
