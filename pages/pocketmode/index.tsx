import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import dynamic from "next/dynamic";
import { FaCrown } from "react-icons/fa";
import { FadeIn, SlideUp } from "../../components/ui/animations/animations";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { TypeFilter } from "../../components/ui/forms/TypeFilter";
import { createGlassStyle, GradientButton, CircularButton } from '../../components/ui/design-system';
import { UnifiedSearchBar, EmptyStateGlass, LoadingStateGlass } from '../../components/ui/glass-components';
import { motion } from "framer-motion";
import PocketCardList from "../../components/PocketCardList";
import { fetchPocketData } from "../../utils/pocketData";
import BackToTop from "../../components/ui/SimpleBackToTop";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import { PocketCard } from "../../types/api/pocket-cards";
import { NextPage } from "next";

// Dynamic imports for components that might cause SSR issues
import { CardGridSkeleton } from "../../components/ui/SkeletonLoader";
const PokemonEmptyState = dynamic(() => import("../../components/ui/loading/PokemonEmptyState"), { ssr: false });

// Extended PocketCard interface with additional properties from the actual data
interface ExtendedPocketCard extends PocketCard {
  type?: string;
  ex?: "Yes" | "No";
  fullart?: "Yes" | "No";
}

type SortBy = "name" | "rarity";
type RarityFilter = "all" | "◊" | "◊◊" | "◊◊◊" | "◊◊◊◊" | "★" | "☆☆" | "★★" | "fullart" | "immersive";

interface LoadingState {
  pokemon: boolean;
}

interface ErrorState {
  pokemon: string | null;
}

const PocketMode: NextPage = () => {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<ExtendedPocketCard[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    pokemon: true
  });
  const [error, setError] = useState<ErrorState>({
    pokemon: null
  });
  const [search, setSearch] = useState<string>("");
  // Removed deck builder - use /pocketmode/deckbuilder instead
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name"); // name, rarity
  
  // Replace fetchPokemonData to use the live Pocket API
  const fetchPokemonData = async () => {
    try {
      setLoading(prev => ({ ...prev, pokemon: true }));
      setError(prev => ({ ...prev, pokemon: null }));
      const cards = await fetchPocketData(); // Now returns an array
      setPokemon(cards as ExtendedPocketCard[] || []);
      setLoading(prev => ({ ...prev, pokemon: false }));
    } catch (err) {
      // Failed to fetch Pokémon Pocket data
      setError(prev => ({ 
        ...prev, 
        pokemon: "Failed to load Pokémon Pocket data. Please try again later." 
      }));
      setLoading(prev => ({ ...prev, pokemon: false }));
    }
  };
  
  // Call fetch functions when component mounts and load saved deck
  useEffect(() => {
    fetchPokemonData();
    
    // Redirect to proper deck builder if old URL is used
    if (router.query.view === 'deckbuilder') {
      router.replace('/pocketmode/deckbuilder');
    }
  }, [router.query.view, router]);

  // Smooth scroll to top when filters change significantly
  useEffect(() => {
    if (typeof window !== 'undefined' && (search || typeFilter !== 'all' || rarityFilter !== 'all')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [search, typeFilter, rarityFilter]);

  // Enhanced keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + K or just '/' key
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' || e.key === '/') {
        e.preventDefault();
        if (typeof document !== 'undefined') {
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search cards"]');
          if (searchInput) {
            searchInput.focus();
          }
        }
      }
      
      // Removed view switching - deck builder is now at /pocketmode/deckbuilder
      
      // Clear search with Escape
      if (e.key === 'Escape') {
        if (typeof document !== 'undefined') {
          const activeElement = document.activeElement as HTMLInputElement;
          if (activeElement && activeElement.tagName === 'INPUT' && activeElement.value) {
            setSearch('');
            activeElement.blur();
          }
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, []);


  // Helper function to get display type for filtering (same logic as UnifiedCard)
  const getCardDisplayType = (type: string | undefined, card: ExtendedPocketCard): string => {
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType === 'trainer') {
      const name = card.name?.toLowerCase() || '';
      
      const fossilPatterns = [/^helix fossil$/, /^dome fossil$/, /^old amber$/];
      const toolPatterns = [
        /tool$/, 
        // Equipment and gear
        /^rocky helmet/, /^muscle band/, /^leftovers/, /^float stone/, /^choice band/, /^focus sash/, /^weakness policy/, /^air balloon/,
        // Berries (tools in Pocket)
        /berry$/, /^lam berry/, /^oran berry/, /^sitrus berry/, /^pecha berry/, /^cheri berry/, /^aspear berry/,
        // Capes and clothing
        /cape$/, /^giant cape/, /^rescue cape/,
        // Bands and accessories  
        /band$/, /^poison band/, /^expert band/, /^team band/,
        // Barbs and spikes
        /barb$/, /^poison barb/, /^toxic barb/,
        // Cords and cables
        /cord$/, /^electrical cord/, /^power cord/,
        // Stones and items that modify Pokemon
        /stone$/, /^evolution stone/, /^fire stone/, /^water stone/, /^thunder stone/, /^leaf stone/,
        // Protection items
        /^protective/, /^defense/, /^shield/,
        // Energy modifying tools
        /^energy/, /^double colorless energy/, /^rainbow energy/,
        // Other common tool patterns
        /^lucky/, /^amulet/, /^charm/, /^crystal/, /^scope/, /^specs/, /^goggles/
      ];
      const supporterPatterns = [/^professor/, /^dr\./, /^mr\./, /^ms\./, /^mrs\./, /^captain/, /^gym leader/, /^elite/, /^team .* (grunt|admin|boss|leader)/, /grunt$/, /admin$/, /boss$/, /'s (advice|training|encouragement|help|research|orders|conviction|dedication|determination|resolve)$/, /research$/, /analysis$/, /theory$/, /^(erika|misty|blaine|koga|giovanni|brock|lt\. surge|sabrina|bill|oak|red)$/, /^(blue|green|yellow|gold|silver|crystal|ruby|sapphire)$/, /^(cynthia|lance|steven|wallace|diantha|iris|alder)$/, /^team/, /rocket/, /aqua/, /magma/, /galactic/, /plasma/, /flare/];
      
      const itemPatterns = [
        /potion$/, /^potion$/, /^super potion/, /^hyper potion/, /^max potion/,
        /ball$/, /^poke ball/, /^great ball/, /^ultra ball/,
        /^x /, // X Speed, X Attack, etc.
        /^switch/, /^rope/, /candy$/, /^rare candy/
      ];
      
      if (fossilPatterns.some(pattern => pattern.test(name))) return 'Fossil';
      if (toolPatterns.some(pattern => pattern.test(name))) return 'Tool';
      if (itemPatterns.some(pattern => pattern.test(name))) return 'Item';
      if (supporterPatterns.some(pattern => pattern.test(name))) return 'Supporter';
      
      const words = card.name?.split(' ') || [];
      if (words.length <= 3 && words[0] && /^[A-Z]/.test(words[0])) {
        const personIndicators = ['grunt', 'admin', 'boss', 'leader', 'trainer', 'champion', 'rival'];
        if (personIndicators.some(indicator => name.includes(indicator))) return 'Supporter';
        if (words.length === 1 && /^[A-Z][a-z]+$/.test(words[0])) return 'Supporter';
      }
      
      return 'Item'; // Default for trainer cards (includes fossils not matching specific patterns)
    }
    
    return type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : '';
  };

  // Filter and sort Pokémon by search term, type, rarity, and sort order
  const filteredPokemon = pokemon
    .filter(poke => 
      poke.name.toLowerCase().includes(search.toLowerCase()) &&
      (typeFilter === "all" || 
       (poke.type && poke.type.toLowerCase() === typeFilter.toLowerCase()) || 
       (poke.types && poke.types.includes(typeFilter)) ||
       (typeFilter === "item" && poke.type && (getCardDisplayType(poke.type, poke).toLowerCase() === "item" || getCardDisplayType(poke.type, poke).toLowerCase() === "fossil")) ||
       (typeFilter === "supporter" && poke.type && getCardDisplayType(poke.type, poke).toLowerCase() === "supporter") ||
       (typeFilter === "tool" && poke.type && getCardDisplayType(poke.type, poke).toLowerCase() === "tool")) &&
      (rarityFilter === "all" || 
       (poke.rarity as string) === rarityFilter || 
       (rarityFilter === "★" && (poke.rarity as string) === "☆") ||
       (rarityFilter === "☆☆" && (poke.rarity as string) === "☆☆") ||
       (rarityFilter === "★★" && (poke.rarity as string) === "♕") ||
       (rarityFilter === "fullart" && poke.fullart === "Yes") ||
       (rarityFilter === "immersive" && (poke.rarity as string) === "☆☆☆"))
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "rarity") {
        // Simple rarity sorting logic (can be expanded)
        const rarityOrder: Record<string, number> = {
          "Common": 1,
          "Uncommon": 2,
          "Rare": 3,
          "Rare Holo": 4,
          "Rare Holo V": 5,
          "Rare Ultra": 6,
          "Rare Secret": 7
        };
        return (rarityOrder[b.rarity || ''] || 0) - (rarityOrder[a.rarity || ''] || 0);
      }
      return 0;
    });
  
  // Get unique types and rarities from all Pokémon cards for filter options
  const baseTypes = [...new Set(pokemon.flatMap(p => p.type ? [p.type.toLowerCase()] : (p.types || []).map(t => t.toLowerCase())))];
  // Add trainer subtypes to the type filter
  const uniqueTypes = [...baseTypes, 'item', 'supporter', 'tool'].filter(type => type !== 'trainer');
  const uniqueRarities = [...new Set(pokemon.map(p => p.rarity).filter(Boolean))];
  
  // Use pokemon loading/error states
  const isViewLoading = loading.pokemon;
  const viewError = error.pokemon;

  return (
    <FullBleedWrapper gradient="pokedex">
      <div className="section-spacing-y-default max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <Head>
        <title>Pokémon TCG Pocket | DexTrends</title>
        <meta name="description" content="Explore the Pokémon Trading Card Game Pocket - the streamlined mobile version with simplified rules, exclusive cards, top decks, and expansions." />
        <meta property="og:title" content="Pokémon TCG Pocket | DexTrends" />
        <meta property="og:description" content="Explore Pokémon TCG Pocket cards, decks, and expansions for the mobile-optimized version of the Pokémon Trading Card Game." />
        <meta property="og:type" content="website" />
        <meta name="keywords" content="Pokemon TCG Pocket, Pokemon cards, TCG mobile, Pocket decks, Pokemon expansions" />
      </Head>
      <FadeIn>
        {/* Enhanced Header Section with Glass Morphism */}
        <motion.div 
          className={`${createGlassStyle({
            blur: 'xl',
            opacity: 'medium',
            gradient: true,
            border: 'medium',
            shadow: 'xl',
            rounded: 'xl'
          })} mb-6 p-6 rounded-3xl`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header with Centered Title */}
          <motion.div 
            className="text-center mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent inline-block mb-3">
              Pokémon TCG Pocket Cards
            </h1>
            <div className="flex justify-center">
              <div className={`${createGlassStyle({
                blur: 'md',
                opacity: 'subtle',
                gradient: true,
                border: 'subtle',
                shadow: 'md',
                rounded: 'full'
              })} px-4 py-2`}>
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{pokemon.length} Total Cards</span>
              </div>
            </div>
          </motion.div>
          
          {/* Enhanced Tab Navigation */}
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className={`${createGlassStyle({
              blur: 'lg',
              opacity: 'medium',
              gradient: true,
              border: 'medium',
              shadow: 'lg',
              rounded: 'xl'
            })} p-3 inline-flex gap-3`}>
              <button
                onClick={() => router.push('/pocketmode')}
                className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'strong',
                  gradient: true,
                  border: 'medium',
                  shadow: 'md',
                  rounded: 'full'
                })} px-4 py-2 font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all hover:scale-105`}
              >
                Card List
              </button>
              <button
                onClick={() => router.push('/pocketmode/deckbuilder')}
                className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'subtle',
                  gradient: false,
                  border: 'subtle',
                  shadow: 'sm',
                  rounded: 'full'
                })} px-4 py-2 font-semibold text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:scale-105`}
              >
                Deck Builder
              </button>
              <button
                onClick={() => router.push('/pocketmode/decks')}
                className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'subtle',
                  gradient: false,
                  border: 'subtle',
                  shadow: 'sm',
                  rounded: 'full'
                })} px-4 py-2 font-semibold text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:scale-105`}
              >
                Pre-Built Decks
              </button>
            </div>
          </motion.div>
          
          {/* Enhanced Filter Section */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {/* Enhanced Rarity Filter */}
            <div className={`${createGlassStyle({
              blur: 'md',
              opacity: 'medium',
              gradient: true,
              border: 'medium',
              shadow: 'md',
              rounded: 'xl'
            })} flex items-center gap-3 p-3`}>
              <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1">Rarity</span>
              <div className="flex flex-wrap gap-1 flex-1">
                <button
                  onClick={() => setRarityFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all backdrop-blur-md border ${
                    rarityFilter === 'all' 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300/50 text-purple-700 dark:text-purple-300' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-600 dark:text-gray-400 hover:bg-white/80'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRarityFilter('◊')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all backdrop-blur-md border ${
                    rarityFilter === '◊' 
                      ? 'bg-gray-100 dark:bg-gray-800 border-gray-400/50 text-gray-700 dark:text-gray-300' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-500 dark:text-gray-400 hover:bg-white/80'
                  }`}
                >
                  <span className="text-gray-500">♦</span>
                </button>
                <button
                  onClick={() => setRarityFilter('◊◊')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all backdrop-blur-md border ${
                    rarityFilter === '◊◊' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-400/50 text-green-700 dark:text-green-300' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-500 dark:text-gray-400 hover:bg-white/80'
                  }`}
                >
                  <span className="text-gray-500">♦♦</span>
                </button>
                <button
                  onClick={() => setRarityFilter('◊◊◊')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all backdrop-blur-md border ${
                    rarityFilter === '◊◊◊' 
                      ? 'bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 border-blue-400/50 text-blue-700 dark:text-blue-300' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-500 dark:text-gray-400 hover:bg-white/80'
                  }`}
                >
                  <span className="text-gray-500">♦♦♦</span>
                </button>
                <button
                  onClick={() => setRarityFilter('◊◊◊◊')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all backdrop-blur-md border ${
                    rarityFilter === '◊◊◊◊' 
                      ? 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 border-purple-400/50 text-purple-700 dark:text-purple-300' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-500 dark:text-gray-400 hover:bg-white/80'
                  }`}
                >
                  <span className="text-gray-500">♦♦♦♦</span>
                </button>
                <button
                  onClick={() => setRarityFilter('★')}
                  className={`px-2.5 py-1 rounded-full text-xs font-black transition-all backdrop-blur-md border ${
                    rarityFilter === '★' 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-400/50' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 hover:bg-white/80'
                  }`}
                >
                  <span className={rarityFilter === '★' ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 bg-clip-text text-transparent' : 'text-gray-500 dark:text-gray-400'}>
                    ★
                  </span>
                </button>
                <button
                  onClick={() => setRarityFilter('☆☆')}
                  className={`px-2.5 py-1 rounded-full text-xs font-black transition-all backdrop-blur-md border ${
                    rarityFilter === '☆☆' 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-400/50' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 hover:bg-white/80'
                  }`}
                >
                  <span className={rarityFilter === '☆☆' ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 bg-clip-text text-transparent' : 'text-gray-500 dark:text-gray-400'}>
                    ★★
                  </span>
                </button>
                <button
                  onClick={() => setRarityFilter('immersive')}
                  className={`px-2.5 py-1 rounded-full text-xs font-black transition-all backdrop-blur-md border ${
                    rarityFilter === 'immersive' 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-400/50' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 hover:bg-white/80'
                  }`}
                >
                  <span className={rarityFilter === 'immersive' ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500 bg-clip-text text-transparent' : 'text-gray-500 dark:text-gray-400'}>
                    ★★★
                  </span>
                </button>
                <button
                  onClick={() => setRarityFilter('★★')}
                  className={`px-2.5 py-1 rounded-full text-xs font-black transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
                    rarityFilter === '★★' 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-400/50' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 hover:bg-white/80'
                  }`}
                >
                  <FaCrown className={rarityFilter === '★★' ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'} size={16} />
                </button>
                <button
                  onClick={() => setRarityFilter('fullart')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all backdrop-blur-md border ${
                    rarityFilter === 'fullart' 
                      ? 'bg-gradient-to-r from-purple-100/90 to-pink-100/90 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-300/50 text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-500 dark:text-gray-400 hover:bg-white/80'
                  }`}
                >
                  Full Art
                </button>
              </div>
            </div>
            
            {/* Enhanced Type Filter */}
            <div className={`${createGlassStyle({
              blur: 'md',
              opacity: 'medium',
              gradient: true,
              border: 'medium',
              shadow: 'md',
              rounded: 'xl'
            })} flex items-center gap-3 p-3`}>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-1">Type</span>
              <div className="flex flex-wrap gap-1 flex-1">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase transition-all backdrop-blur-md border ${
                    typeFilter === 'all' 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300/50 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/50' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-600 dark:text-gray-400 hover:bg-white/80'
                  }`}
                >
                  All Types
                </button>
                {uniqueTypes.filter(t => t !== 'all').map(type => {
                  const typeColors: Record<string, { bg: string; border: string; text: string; ring: string }> = {
                    'grass': { bg: 'from-green-200 to-green-300', border: 'border-green-500', text: 'text-green-800 dark:text-green-200', ring: 'ring-green-500' },
                    'fire': { bg: 'from-red-200 to-orange-200', border: 'border-red-500', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-500' },
                    'water': { bg: 'from-blue-200 to-cyan-200', border: 'border-blue-500', text: 'text-blue-800 dark:text-blue-200', ring: 'ring-blue-500' },
                    'lightning': { bg: 'from-yellow-200 to-amber-200', border: 'border-yellow-500', text: 'text-yellow-800 dark:text-yellow-200', ring: 'ring-yellow-500' },
                    'electric': { bg: 'from-yellow-200 to-amber-200', border: 'border-yellow-500', text: 'text-yellow-800 dark:text-yellow-200', ring: 'ring-yellow-500' },
                    'psychic': { bg: 'from-purple-200 to-pink-200', border: 'border-purple-500', text: 'text-purple-800 dark:text-purple-200', ring: 'ring-purple-500' },
                    'fighting': { bg: 'from-orange-200 to-red-200', border: 'border-orange-500', text: 'text-orange-800 dark:text-orange-200', ring: 'ring-orange-500' },
                    'darkness': { bg: 'from-gray-300 to-purple-200', border: 'border-gray-600', text: 'text-gray-800 dark:text-gray-200', ring: 'ring-gray-600' },
                    'dark': { bg: 'from-gray-300 to-purple-200', border: 'border-gray-600', text: 'text-gray-800 dark:text-gray-200', ring: 'ring-gray-600' },
                    'metal': { bg: 'from-gray-200 to-slate-200', border: 'border-gray-500', text: 'text-gray-800 dark:text-gray-200', ring: 'ring-gray-500' },
                    'steel': { bg: 'from-gray-200 to-slate-200', border: 'border-gray-500', text: 'text-gray-800 dark:text-gray-200', ring: 'ring-gray-500' },
                    'dragon': { bg: 'from-indigo-200 to-purple-200', border: 'border-indigo-500', text: 'text-indigo-800 dark:text-indigo-200', ring: 'ring-indigo-500' },
                    'colorless': { bg: 'from-gray-100 to-gray-200', border: 'border-gray-400', text: 'text-gray-700 dark:text-gray-300', ring: 'ring-gray-400' },
                    'fairy': { bg: 'from-pink-200 to-rose-200', border: 'border-pink-500', text: 'text-pink-800 dark:text-pink-200', ring: 'ring-pink-500' },
                    'item': { bg: 'from-blue-200 to-blue-300', border: 'border-blue-500', text: 'text-blue-800 dark:text-blue-200', ring: 'ring-blue-500' },
                    'supporter': { bg: 'from-amber-200 to-orange-200', border: 'border-amber-500', text: 'text-amber-800 dark:text-amber-200', ring: 'ring-amber-500' },
                    'tool': { bg: 'from-slate-200 to-gray-200', border: 'border-slate-500', text: 'text-slate-800 dark:text-slate-200', ring: 'ring-slate-500' },
                  };
                  const colors = typeColors[type.toLowerCase()] || { bg: 'from-gray-200 to-gray-300', border: 'border-gray-500', text: 'text-gray-700 dark:text-gray-300', ring: 'ring-gray-400' };
                  
                  return (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase transition-all backdrop-blur-md border bg-gradient-to-r ${colors.bg} ${
                        typeFilter === type 
                          ? `${colors.border}/70 ${colors.text} ring-2 ${colors.ring}/50 opacity-100` 
                          : `${colors.border}/40 ${colors.text} opacity-60 hover:opacity-90`
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <SlideUp>
          {isViewLoading ? (
            <CardGridSkeleton 
              count={20}
              columns={5}
              showPrice={false}
              showSet={false}
              showTypes={true}
              showHP={true}
              className="animate-fadeIn"
            />
          ) : viewError ? (
            <EmptyStateGlass 
              type="error"
              title="Oops! Something went wrong"
              message={viewError}
              actionButton={{
                text: "Try Again",
                onClick: fetchPokemonData,
                variant: "danger"
              }}
              className="min-h-[400px] flex items-center justify-center"
            />
          ) : filteredPokemon.length === 0 ? (
            <PokemonEmptyState 
              customMessage={search || typeFilter !== 'all' || rarityFilter !== 'all' 
                ? "No cards match your search criteria. Try adjusting your filters!" 
                : "No Pokémon cards found in this mode."
              }
            />
          ) : (
            <>
              <div className="text-center mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {filteredPokemon.length} {filteredPokemon.length === 1 ? 'card' : 'cards'}
                  {(search || typeFilter !== 'all' || rarityFilter !== 'all') && ' (filtered)'}
                </p>
              </div>
              {/* Enhanced Glass Container for Cards */}
              <motion.div 
                className={`${createGlassStyle({
                  blur: 'xl',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'xl',
                  rounded: 'xl'
                })} p-6 md:p-8 rounded-3xl`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* Search Bar */}
                <div className="mb-6">
                  <UnifiedSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search Pocket cards... (Press / to focus)"
                    className="w-full"
                    showSearchButton
                  />
                </div>

                <PocketCardList 
                  cards={filteredPokemon} 
                  loading={false}
                  selectedRarityFilter={rarityFilter}
                  searchValue={search}
                  onSearchChange={setSearch}
                />
              </motion.div>
            </>
          )}
        </SlideUp>
        
        {/* Enhanced Action Buttons */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GradientButton
            onClick={() => router.push('/pocketmode/expansions')}
            variant="primary"
            className="hover:scale-105 transition-transform"
          >
            Explore Expansions
          </GradientButton>
          <GradientButton
            onClick={() => router.push('/pocketmode/packs')}
            variant="secondary"
            className="hover:scale-105 transition-transform"
          >
            Pack Opening
          </GradientButton>
        </motion.div>
        
        {/* Pocket Mode Rules Guide Link */}
        <div className="text-center mt-8 pb-20">
          <Link href="/guides/tcg-pocket-rules" className="inline-flex items-center gap-2 text-pokemon-red hover:text-red-700 transition-colors duration-300 group">
            <span className="text-sm font-medium">Learn TCG Pocket Rules</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </FadeIn>
      </div>
      <BackToTop />
    </FullBleedWrapper>
  );
};

// Mark this page as full bleed to remove Layout padding
(PocketMode as any).fullBleed = true;

export default PocketMode;