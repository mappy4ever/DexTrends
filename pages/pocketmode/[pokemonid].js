import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { FadeIn, SlideUp, Scale } from "../../components/ui/animations/animations";
import { TypeBadge } from "../../components/ui/TypeBadge"; // Updated path
import { fetchPocketData } from "../../utils/pocketData";
import PocketCardList from "../../components/PocketCardList";
import Modal from "../../components/ui/modals/Modal";
import logger from "../../utils/logger";
import { getEvolutionChain } from "../../utils/evolutionUtils";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";

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
      <FullBleedWrapper gradient="pocket">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping"></div>
              <div className="w-20 h-20 rounded-full border-4 border-t-yellow-400 border-r-yellow-400/70 border-b-yellow-400/40 border-l-transparent animate-spin"></div>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">Loading card details...</h3>
          </div>
        </div>
      </FullBleedWrapper>
    );
  }
  
  if (error || !pokemonDetails) {
    return (
      <FullBleedWrapper gradient="pocket">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center justify-center bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-red-500/20 opacity-30 rounded-full animate-pulse"></div>
              <svg className="w-24 h-24 text-red-400 mx-auto relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400">Error Loading Card</h3>
            <p className="text-gray-300 mt-2 max-w-md text-center">
              {error || "Card not found or unavailable at this time."}
            </p>
            <button 
              onClick={() => router.push('/pocketmode', undefined, { shallow: false })}
              className="mt-6 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-full transition-all"
            >
              Back to Pocket Mode
            </button>
          </div>
        </div>
      </FullBleedWrapper>
    );
  }
  
  return (
    <>
      <Head>
        <title>{pokemonDetails.name} | Pokémon TCG Pocket Card | DexTrends</title>
        <meta name="description" content={`View detailed information about ${pokemonDetails.name} Pokémon TCG Pocket card, including attacks, abilities, and market prices.`} />
        <meta property="og:title" content={`${pokemonDetails.name} | Pokémon TCG Pocket Card`} />
        <meta property="og:description" content={`Explore ${pokemonDetails.name} card details, attacks, abilities, and related cards in the Pokémon TCG Pocket format.`} />
        <meta property="og:type" content="website" />
        {pokemonDetails.image && <meta property="og:image" content={pokemonDetails.image} />}
        <meta name="keywords" content={`Pokemon TCG Pocket, ${pokemonDetails.name}, Pokemon card, ${pokemonDetails.types?.join(', ')}`} />
      </Head>
      <FullBleedWrapper gradient="pocket" className="text-white">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/pocketmode">
                <button className="group flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-all duration-300 border border-white/20">
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Back to Collection</span>
                </button>
              </Link>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Card Image Section */}
              <div className="flex justify-center lg:justify-start">
                <Scale className="relative">
                  <div 
                    className="relative cursor-pointer group transform hover:scale-105 transition-all duration-300"
                    onClick={() => setZoomedCard(pokemonDetails)}
                  >
                    <div className="relative w-80 h-[480px] rounded-2xl overflow-hidden shadow-2xl">
                      <Image 
                        src={pokemonDetails.image || "/back-card.png"} 
                        alt={pokemonDetails.name}
                        fill
                        className="object-contain"
                        priority
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                        <div className="flex items-center gap-2 text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="font-medium">Click to zoom</span>
                        </div>
                      </div>
                    </div>
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  </div>
                </Scale>
              </div>

              {/* Card Info Section */}
              <div className="space-y-6">
                {/* Title and Type */}
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2 capitalize bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {pokemonDetails.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {pokemonDetails.type && (
                      <TypeBadge 
                        type={pokemonDetails.type} 
                        size="lg" 
                        isPocketCard={true}
                      />
                    )}
                    {pokemonDetails.supertype && (
                      <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                        {pokemonDetails.supertype}
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Stats - Prominent Display */}
                <div className="flex flex-wrap gap-3">
                  {pokemonDetails.health && (
                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-sm rounded-xl p-3 border border-red-400/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/60">HP</p>
                        <p className="text-xl font-bold">{pokemonDetails.health}</p>
                      </div>
                    </div>
                  )}
                  {pokemonDetails.rarity && (
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm rounded-xl p-3 border border-purple-400/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-lg">{pokemonDetails.rarity}</span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/60">Rarity</p>
                        <p className="text-sm font-medium">Tier</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Additional Info - Compact Display */}
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {pokemonDetails.pack && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Pack</p>
                        <p className="text-sm font-semibold text-white/80">{pokemonDetails.pack}</p>
                      </div>
                    )}
                    {pokemonDetails.artist && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Artist</p>
                        <p className="text-sm font-semibold text-white/80">{pokemonDetails.artist}</p>
                      </div>
                    )}
                    {pokemonDetails.set && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Set</p>
                        <p className="text-sm font-semibold text-white/80">{pokemonDetails.set}</p>
                      </div>
                    )}
                    {pokemonDetails.number && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Card #</p>
                        <p className="text-sm font-semibold text-white/80">{pokemonDetails.number}</p>
                      </div>
                    )}
                    {pokemonDetails.weakness && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Weakness</p>
                        <p className="text-sm font-semibold text-white/80">{pokemonDetails.weakness}</p>
                      </div>
                    )}
                    {pokemonDetails.retreatCost && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Retreat</p>
                        <p className="text-sm font-semibold text-white/80">{pokemonDetails.retreatCost} ⚪</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attacks Section */}
                {pokemonDetails.attacks && pokemonDetails.attacks.length > 0 && (
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                      </svg>
                      Attacks
                    </h3>
                    <div className="space-y-3">
                      {pokemonDetails.attacks.map((attack, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg">{attack.name}</h4>
                            {attack.damage && (
                              <span className="text-2xl font-bold text-yellow-400">{attack.damage}</span>
                            )}
                          </div>
                          {attack.cost && (
                            <div className="flex gap-1 mb-2">
                              {attack.cost.map((energy, i) => (
                                <TypeBadge key={i} type={energy.toLowerCase()} size="sm" />
                              ))}
                            </div>
                          )}
                          {attack.text && (
                            <p className="text-sm text-white/80">{attack.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Abilities Section */}
                {pokemonDetails.abilities && pokemonDetails.abilities.length > 0 && (
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.414l.707-.707zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                      </svg>
                      Abilities
                    </h3>
                    <div className="space-y-3">
                      {pokemonDetails.abilities.map((ability, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-4">
                          <h4 className="font-bold text-lg mb-2">{ability.name}</h4>
                          <p className="text-sm text-white/80">{ability.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
      
          <SlideUp delay={200}>
            {/* Similar Cards Section */}
            <div className="space-y-12">
              {/* Same Pokémon Cards Section */}
              {relatedCards?.samePokemon && relatedCards.samePokemon.length > 0 && (
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                        <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                    </div>
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
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                        <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H7a1 1 0 110-2h2V8a1 1 0 011-1zM9 15a1 1 0 102 0v1a1 1 0 11-2 0v-1z" />
                      </svg>
                    </div>
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
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Related Cards
                  </h3>
                  <p className="text-sm text-white/60 mb-6">
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
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Other Similar Cards
                  </h3>
                  <p className="text-sm text-white/60 mb-6">
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
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white/80 mb-2">No Related Cards Found</h3>
                  <p className="text-white/60">
                    We couldn't find any other cards related to {pokemonDetails.name}.
                  </p>
                </div>
              )}
            </div>
          </SlideUp>
        </div>
      </FullBleedWrapper>
      
      {/* Zoom Modal */}
      {zoomedCard && (
        <Modal isOpen={true} onClose={() => setZoomedCard(null)} size="xl">
          <div className="flex flex-col items-center p-4">
            <div className="relative w-full max-w-md mx-auto">
              <Image
                src={zoomedCard.image || "/back-card.png"}
                alt={zoomedCard.name}
                width={600}
                height={840}
                className="rounded-2xl shadow-2xl w-full h-auto"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                sizes="600px"
              />
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur-2xl opacity-20 -z-10"></div>
            </div>
            <div className="mt-6 text-center space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {zoomedCard.name}
              </h3>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {zoomedCard.pack && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" />
                    </svg>
                    {zoomedCard.pack}
                  </span>
                )}
                {zoomedCard.rarity && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {zoomedCard.rarity}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

// Mark this page as fullBleed
PocketPokemonDetail.fullBleed = true;

export default PocketPokemonDetail;
