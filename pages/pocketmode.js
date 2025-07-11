import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import dynamic from "next/dynamic";
import { FadeIn, SlideUp } from "../components/ui/animations";
import { TypeBadge } from "../components/ui/TypeBadge";
import { TypeFilter } from "../components/ui/TypeFilter";
import PocketCardList from "../components/PocketCardList";
import { fetchPocketData } from "../utils/pocketData";
import BackToTop from "../components/ui/BackToTop";
import { FullBleedWrapper } from "../components/ui/FullBleedWrapper";

// Dynamic imports for components that might cause SSR issues
import PokeballLoader from "../components/ui/PokeballLoader";
const PokemonEmptyState = dynamic(() => import("../components/ui/PokemonEmptyState"), { ssr: false });

export default function PocketMode() {
  const router = useRouter();
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState({
    pokemon: true
  });
  const [error, setError] = useState({
    pokemon: null
  });
  const [search, setSearch] = useState("");
  // Removed deck builder - use /pocketmode/deckbuilder instead
  const [typeFilter, setTypeFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name"); // name, rarity
  
  // Replace fetchPokemonData to use the live Pocket API
  const fetchPokemonData = async () => {
    try {
      setLoading(prev => ({ ...prev, pokemon: true }));
      setError(prev => ({ ...prev, pokemon: null }));
      const cards = await fetchPocketData(); // Now returns an array
      setPokemon(cards || []);
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
  }, [router.query.view]);

  // Smooth scroll to top when filters change significantly
  useEffect(() => {
    if (search || typeFilter !== 'all' || rarityFilter !== 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [search, typeFilter, rarityFilter]);

  // Enhanced keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on Ctrl/Cmd + K or just '/' key
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' || e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search cards"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Removed view switching - deck builder is now at /pocketmode/deckbuilder
      
      // Clear search with Escape
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
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
  const getCardDisplayType = (type, card) => {
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
    
    return type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase();
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
       poke.rarity === rarityFilter || 
       (rarityFilter === "★" && poke.ex === "Yes" && poke.fullart === "Yes") ||
       (rarityFilter === "★★" && poke.rarity === "♕") ||
       (rarityFilter === "fullart" && poke.fullart === "Yes") ||
       (rarityFilter === "immersive" && poke.rarity === "☆☆☆"))
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "rarity") {
        // Simple rarity sorting logic (can be expanded)
        const rarityOrder = {
          "Common": 1,
          "Uncommon": 2,
          "Rare": 3,
          "Rare Holo": 4,
          "Rare Holo V": 5,
          "Rare Ultra": 6,
          "Rare Secret": 7
        };
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
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
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-3">Pokémon TCG Pocket</h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
            Explore the streamlined mobile version of the Pokémon Trading Card Game with simplified rules and unique cards.
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded"></div>
          
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pokemon-red/20 focus:border-pokemon-red transition-all duration-300 placeholder-gray-400"
                  placeholder="Search Pocket cards... (Press / to focus)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button 
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setSearch('')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Filter Pills */}
              <div className="space-y-4">
                {/* Rarity Filter - Simplified */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rarity</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRarityFilter('all')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === 'all'
                          ? 'bg-pokemon-red text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setRarityFilter('◊')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === '◊'
                          ? 'bg-gray-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ◊ Common
                    </button>
                    <button
                      onClick={() => setRarityFilter('◊◊')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === '◊◊'
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ◊◊ Uncommon
                    </button>
                    <button
                      onClick={() => setRarityFilter('◊◊◊')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === '◊◊◊'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ◊◊◊ Rare
                    </button>
                    <button
                      onClick={() => setRarityFilter('◊◊◊◊')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === '◊◊◊◊'
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ◊◊◊◊ Double Rare
                    </button>
                    <button
                      onClick={() => setRarityFilter('★')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === '★'
                          ? 'bg-yellow-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ★ EX
                    </button>
                    <button
                      onClick={() => setRarityFilter('immersive')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === 'immersive'
                          ? 'bg-pink-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ★★★ Immersive
                    </button>
                    <button
                      onClick={() => setRarityFilter('★★')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === '★★'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ★★ Crown
                    </button>
                    <button
                      onClick={() => setRarityFilter('fullart')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        rarityFilter === 'fullart'
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Full Art
                    </button>
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Type</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTypeFilter('all')}
                      className={`transition-all ${
                        typeFilter === 'all'
                          ? 'ring-2 ring-offset-1 scale-105 shadow-lg ring-red-500 shadow-red-500/25'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      title="Filter by all types"
                    >
                      <span className="type-badge size-md bg-red-500">All Types</span>
                    </button>
                    <TypeFilter 
                      types={uniqueTypes} 
                      selectedType={typeFilter} 
                      onTypeChange={setTypeFilter}
                      isPocketCard={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results counter */}
            {filteredPokemon.length !== pokemon.length && (
              <div className="bg-pokemon-red/10 border border-pokemon-red/20 rounded-xl p-4 text-center mb-4">
                <p className="text-sm text-pokemon-red font-medium">
                  Showing {filteredPokemon.length} of {pokemon.length} cards
                  {(search || typeFilter !== 'all' || rarityFilter !== 'all') && (
                    <span className="block text-xs mt-1 opacity-75">Active filters applied</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Deck builder has been moved to /pocketmode/deckbuilder */}
      
        {/* Main content with enhanced loading */}
        {isViewLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <PokeballLoader 
              size="large" 
              text="Loading Pocket cards..."
            />
          </div>
        ) : viewError ? (
          <PokemonEmptyState 
            type="error"
            customMessage={viewError}
            actionButton={
              <button 
                onClick={() => fetchPokemonData()} 
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ⚡ Revive Connection
              </button>
            }
          />
        ) : (
          <PocketCardList 
            cards={filteredPokemon}
            loading={loading.pokemon}
            error={error.pokemon}
            emptyMessage={`No Pokémon found${search || typeFilter !== 'all' || rarityFilter !== 'all' ? ' with current filters' : ''}. Try adjusting your search criteria.`}
            showPack={true}
            showRarity={true}
            showHP={true}
            imageWidth={110}
            imageHeight={154}
          />
        )}
      </FadeIn>
      {/* Back to Top Button */}
      <BackToTop />
      </div>
    </FullBleedWrapper>
  );
}