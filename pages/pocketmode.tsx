import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import dynamic from "next/dynamic";
import { FadeIn, SlideUp } from "../components/ui/animations/animations";
import { TypeBadge } from "../components/ui/TypeBadge";
import { TypeFilter } from "../components/ui/forms/TypeFilter";
import { GlassContainer } from "../components/ui/design-system/GlassContainer";
import { GradientButton } from "../components/ui/design-system/GradientButton";
import CircularButton from "../components/ui/CircularButton";
import { motion } from "framer-motion";
import PocketCardList from "../components/PocketCardList";
import { fetchPocketData } from "../utils/pocketData";
import BackToTop from "../components/ui/SimpleBackToTop";
import FullBleedWrapper from "../components/ui/FullBleedWrapper";
import { PocketCard } from "../types/api/pocket-cards";
import { NextPage } from "next";

// Dynamic imports for components that might cause SSR issues
import { CardGridSkeleton } from "../components/ui/SkeletonLoader";
const PokemonEmptyState = dynamic(() => import("../components/ui/loading/PokemonEmptyState"), { ssr: false });

// Extended PocketCard interface with additional properties from the actual data
interface ExtendedPocketCard extends PocketCard {
  type?: string;
  ex?: "Yes" | "No";
  fullart?: "Yes" | "No";
}

type SortBy = "name" | "rarity";
type RarityFilter = "all" | "◊" | "◊◊" | "◊◊◊" | "◊◊◊◊" | "★" | "★★" | "fullart" | "immersive";

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
    if (search || typeFilter !== 'all' || rarityFilter !== 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [search, typeFilter, rarityFilter]);

  // Enhanced keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + K or just '/' key
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' || e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search cards"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Removed view switching - deck builder is now at /pocketmode/deckbuilder
      
      // Clear search with Escape
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLInputElement;
        if (activeElement.tagName === 'INPUT' && activeElement.value) {
          setSearch('');
          activeElement.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
       (rarityFilter === "★" && poke.ex === "Yes" && poke.fullart === "Yes") ||
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
    <FullBleedWrapper gradient="pocket">
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
        <div className="flex flex-col items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl"
          >
            <span className="text-4xl">🎴</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">Pokémon TCG Pocket</h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
            Explore the streamlined mobile version of the Pokémon Trading Card Game with simplified rules and unique cards.
          </p>
          
          {/* Keyboard Shortcuts Help */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">/ or Cmd+K</kbd> to search, 
              <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded ml-1">Esc</kbd> to clear
            </p>
          </div>
        </div>
        
        {/* Filters */}
        {(
          <div className="mb-4 px-4">
            {/* Enhanced Search and Filters */}
            <GlassContainer variant="medium" className="mb-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-12 py-3 glass-light rounded-full text-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                  placeholder="Search Pocket cards... (Press / to focus)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <CircularButton
                    size="sm"
                    variant="ghost"
                    className="absolute inset-y-0 right-0 !p-0 pr-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setSearch('')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </CircularButton>
                )}
              </div>
              
              {/* Filter Pills */}
              <div className="space-y-4">
                {/* Rarity Filter - Simplified */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rarity</label>
                  <div className="flex flex-wrap gap-2">
                    <GradientButton
                      onClick={() => setRarityFilter('all')}
                      variant={rarityFilter === 'all' ? 'primary' : 'secondary'}
                      size="sm"
                    >
                      All
                    </GradientButton>
                    <CircularButton
                      onClick={() => setRarityFilter('◊')}
                      variant={rarityFilter === '◊' ? 'primary' : 'secondary'}
                      size="sm"
                      className={rarityFilter === '◊' ? 'border-gray-500 bg-gray-500/20' : ''}
                    >
                      ◊ Common
                    </CircularButton>
                    <CircularButton
                      onClick={() => setRarityFilter('◊◊')}
                      variant={rarityFilter === '◊◊' ? 'primary' : 'secondary'}
                      size="sm"
                      className={rarityFilter === '◊◊' ? 'border-green-500 bg-green-500/20' : ''}
                    >
                      ◊◊ Uncommon
                    </CircularButton>
                    <CircularButton
                      onClick={() => setRarityFilter('◊◊◊')}
                      variant={rarityFilter === '◊◊◊' ? 'primary' : 'secondary'}
                      size="sm"
                      className={rarityFilter === '◊◊◊' ? 'border-blue-500 bg-blue-500/20' : ''}
                    >
                      ◊◊◊ Rare
                    </CircularButton>
                    <CircularButton
                      onClick={() => setRarityFilter('◊◊◊◊')}
                      variant={rarityFilter === '◊◊◊◊' ? 'primary' : 'secondary'}
                      size="sm"
                      className={rarityFilter === '◊◊◊◊' ? 'border-purple-500 bg-purple-500/20' : ''}
                    >
                      ◊◊◊◊ Double Rare
                    </CircularButton>
                    <CircularButton
                      onClick={() => setRarityFilter('★')}
                      variant={rarityFilter === '★' ? 'primary' : 'secondary'}
                      size="sm"
                      className={rarityFilter === '★' ? 'border-yellow-500 bg-yellow-500/20' : ''}
                    >
                      ★ EX
                    </CircularButton>
                    <CircularButton
                      onClick={() => setRarityFilter('immersive')}
                      variant={rarityFilter === 'immersive' ? 'primary' : 'secondary'}
                      size="sm"
                      className={rarityFilter === 'immersive' ? 'border-pink-500 bg-pink-500/20' : ''}
                    >
                      ★★★ Immersive
                    </CircularButton>
                    <CircularButton
                      onClick={() => setRarityFilter('★★')}
                      variant={rarityFilter === '★★' ? 'primary' : 'secondary'}
                      size="sm"
                      className={rarityFilter === '★★' ? 'border-red-500 bg-red-500/20' : ''}
                    >
                      ★★ Crown
                    </CircularButton>
                    <CircularButton
                      onClick={() => setRarityFilter('fullart')}
                      variant={rarityFilter === 'fullart' ? 'primary' : 'secondary'}
                      size="sm"
                      className={rarityFilter === 'fullart' ? 'border-gradient-to-r from-yellow-500 to-pink-500 bg-gradient-to-r from-yellow-500/20 to-pink-500/20' : ''}
                    >
                      Full Art
                    </CircularButton>
                  </div>
                </div>
                
                {/* Type Filter */}
                <TypeFilter 
                  types={uniqueTypes}
                  selectedType={typeFilter}
                  onTypeChange={(type) => setTypeFilter(type || 'all')}
                />
                
                {/* Sort Options */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="px-4 py-2 glass-light rounded-full border border-gray-200 dark:border-gray-700"
                  >
                    <option value="name">Name</option>
                    <option value="rarity">Rarity</option>
                  </select>
                </div>
              </div>
            </GlassContainer>
          </div>
        )}
        
        {/* Tabs for Card List and Deck Builder */}
        <div className="flex justify-center mb-6 gap-4">
          <GradientButton
            onClick={() => router.push('/pocketmode')}
            variant="primary"
            size="md"
          >
            Card List
          </GradientButton>
          <GradientButton
            onClick={() => router.push('/pocketmode/deckbuilder')}
            variant="secondary"
            size="md"
          >
            Deck Builder
          </GradientButton>
          <GradientButton
            onClick={() => router.push('/pocketmode/decks')}
            variant="secondary"
            size="md"
          >
            Pre-Built Decks
          </GradientButton>
        </div>
        
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
            <GlassContainer variant="colored" className="flex flex-col items-center justify-center min-h-[400px]">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >😕</motion.div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{viewError}</p>
              <GradientButton 
                onClick={fetchPokemonData}
                variant="danger"
                size="lg"
              >
                Try Again
              </GradientButton>
            </GlassContainer>
          ) : filteredPokemon.length === 0 ? (
            <PokemonEmptyState 
              customMessage={search || typeFilter !== 'all' || rarityFilter !== 'all' 
                ? "No cards match your search criteria. Try adjusting your filters!" 
                : "No Pokémon cards found in this mode."
              }
            />
          ) : (
            <>
              <div className="text-center mb-4 text-gray-600 dark:text-gray-400">
                <p className="text-sm font-medium">
                  Showing {filteredPokemon.length} {filteredPokemon.length === 1 ? 'card' : 'cards'}
                  {(search || typeFilter !== 'all' || rarityFilter !== 'all') && ' (filtered)'}
                </p>
              </div>
              <PocketCardList 
                cards={filteredPokemon} 
                loading={false}
              />
            </>
          )}
        </SlideUp>
        
        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <GradientButton
            onClick={() => router.push('/pocketmode/expansions')}
            variant="primary"
            size="lg"
            icon={<span>🎯</span>}
          >
            Explore Expansions
          </GradientButton>
          <GradientButton
            onClick={() => router.push('/pocketmode/packs')}
            variant="success"
            size="lg"
            icon={<span>🎰</span>}
          >
            Pack Opening
          </GradientButton>
        </div>
        
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

export default PocketMode;