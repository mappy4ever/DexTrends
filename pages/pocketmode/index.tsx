import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import dynamic from "next/dynamic";
import { FiFilter, FiX, FiChevronDown } from "react-icons/fi";
import { FadeIn, SlideUp } from "../../components/ui/animations/animations";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { TypeFilter } from "../../components/ui/forms/TypeFilter";
import { GradientButton, CircularButton } from '../../components/ui/design-system';
import { UnifiedSearchBar, LoadingStateGlass } from '../../components/ui/glass-components';
import { ErrorState } from '../../components/ui/EmptyState';
import Container from '../../components/ui/Container';
import { motion, AnimatePresence } from "framer-motion";
import PocketCardList from "../../components/PocketCardList";
import { fetchPocketData } from "../../utils/pocketData";
import BackToTop from "../../components/ui/BaseBackToTop";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import { PageHeader } from "../../components/ui/BreadcrumbNavigation";
import { PocketCard } from "../../types/api/pocket-cards";
import { NextPage } from "next";
import { cn } from "../../utils/cn";
import { TYPOGRAPHY } from "../../components/ui/design-system/glass-constants";

// Dynamic imports for components that might cause SSR issues
import { CardGridSkeleton } from "../../components/ui/Skeleton";
const PokemonEmptyState = dynamic(() => import("../../components/ui/loading/PokemonEmptyState"), { ssr: false });

// ===========================================
// MOBILE FILTER DRAWER
// ===========================================

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  rarityFilter: RarityFilter;
  setRarityFilter: (rarity: RarityFilter) => void;
  uniqueTypes: string[];
  activeFilterCount: number;
  onClearFilters: () => void;
}

function MobileFilterDrawer({
  isOpen,
  onClose,
  typeFilter,
  setTypeFilter,
  rarityFilter,
  setRarityFilter,
  uniqueTypes,
  activeFilterCount,
  onClearFilters,
}: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  // Type colors with proper dark mode support
  const typeColors: Record<string, { bg: string; border: string; text: string }> = {
    'grass': { bg: 'from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40', border: 'border-green-500 dark:border-green-600', text: 'text-green-800 dark:text-green-300' },
    'fire': { bg: 'from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40', border: 'border-red-500 dark:border-red-600', text: 'text-red-800 dark:text-red-300' },
    'water': { bg: 'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40', border: 'border-blue-500 dark:border-blue-600', text: 'text-blue-800 dark:text-blue-300' },
    'lightning': { bg: 'from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40', border: 'border-yellow-500 dark:border-yellow-600', text: 'text-yellow-800 dark:text-yellow-300' },
    'psychic': { bg: 'from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40', border: 'border-purple-500 dark:border-purple-600', text: 'text-purple-800 dark:text-purple-300' },
    'fighting': { bg: 'from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40', border: 'border-orange-500 dark:border-orange-600', text: 'text-orange-800 dark:text-orange-300' },
    'darkness': { bg: 'from-stone-200 to-stone-300 dark:from-stone-800/60 dark:to-stone-700/60', border: 'border-stone-600 dark:border-stone-500', text: 'text-stone-800 dark:text-stone-200' },
    'metal': { bg: 'from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-700/60', border: 'border-slate-500 dark:border-slate-400', text: 'text-slate-800 dark:text-slate-200' },
    'dragon': { bg: 'from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40', border: 'border-indigo-500 dark:border-indigo-600', text: 'text-indigo-800 dark:text-indigo-300' },
    'colorless': { bg: 'from-stone-50 to-stone-100 dark:from-stone-800/50 dark:to-stone-700/50', border: 'border-stone-400 dark:border-stone-500', text: 'text-stone-700 dark:text-stone-300' },
    'item': { bg: 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40', border: 'border-blue-500 dark:border-blue-600', text: 'text-blue-800 dark:text-blue-300' },
    'supporter': { bg: 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40', border: 'border-orange-500 dark:border-orange-600', text: 'text-orange-800 dark:text-orange-300' },
    'tool': { bg: 'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40', border: 'border-purple-500 dark:border-purple-600', text: 'text-purple-800 dark:text-purple-300' },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 lg:hidden"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-stone-900 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiFilter className="w-5 h-5 text-amber-600" />
            <h2 className={cn(TYPOGRAPHY.heading.h4)}>Filters</h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Rarity Section */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-3">Rarity</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: '◊', label: '♦' },
              { value: '◊◊', label: '♦♦' },
              { value: '◊◊◊', label: '♦♦♦' },
              { value: '◊◊◊◊', label: '♦♦♦♦' },
              { value: '★', label: '★' },
              { value: '☆☆', label: '★★' },
              { value: 'immersive', label: '★★★' },
              { value: '★★', label: '♕' },
              { value: 'fullart', label: 'Full Art' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRarityFilter(value as RarityFilter)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-semibold transition-all border',
                  rarityFilter === value
                    ? 'bg-gradient-to-r from-amber-100 to-pink-100 dark:from-amber-900/30 dark:to-pink-900/30 border-amber-400/50 text-amber-700 dark:text-amber-300'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Section */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-3">Type</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-semibold transition-all border',
                typeFilter === 'all'
                  ? 'bg-gradient-to-r from-amber-100 to-pink-100 dark:from-amber-900/30 dark:to-pink-900/30 border-amber-400/50 text-amber-700 dark:text-amber-300'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              )}
            >
              All Types
            </button>
            {uniqueTypes.filter(t => t !== 'all').map(type => {
              const colors = typeColors[type.toLowerCase()] || { bg: 'from-stone-200 to-stone-300', border: 'border-stone-500', text: 'text-stone-700' };
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-semibold uppercase transition-all border bg-gradient-to-r',
                    colors.bg,
                    typeFilter === type
                      ? `${colors.border}/70 ${colors.text} ring-2 ring-${type}-500/50`
                      : `${colors.border}/40 ${colors.text} opacity-70`
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-3">
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="w-full py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-pink-600 text-white font-semibold hover:from-amber-700 hover:to-pink-700 transition-all"
          >
            Show Results
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Calculate active filter count
  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0) + (rarityFilter !== 'all' ? 1 : 0);

  // Clear all filters
  const clearFilters = () => {
    setTypeFilter('all');
    setRarityFilter('all');
  };
  
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-fadeIn">
        <Head>
        <title>Pokémon TCG Pocket | DexTrends</title>
        <meta name="description" content="Explore the Pokémon Trading Card Game Pocket - the streamlined mobile version with simplified rules, exclusive cards, top decks, and expansions." />
        <meta property="og:title" content="Pokémon TCG Pocket | DexTrends" />
        <meta property="og:description" content="Explore Pokémon TCG Pocket cards, decks, and expansions for the mobile-optimized version of the Pokémon Trading Card Game." />
        <meta property="og:type" content="website" />
        <meta name="keywords" content="Pokemon TCG Pocket, Pokemon cards, TCG mobile, Pocket decks, Pokemon expansions" />
      </Head>
      <FadeIn>
        {/* PageHeader with Breadcrumbs */}
        <PageHeader
          title="TCG Pocket Cards"
          description={`${pokemon.length} cards available • Browse, filter, and build your collection`}
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Pocket Mode', href: '/pocketmode', icon: '📱', isActive: true },
          ]}
        >
          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-full">
            <button className="px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-amber-600 to-pink-600 text-white rounded-full">
              Cards
            </button>
            <button
              onClick={() => router.push('/pocketmode/deckbuilder')}
              className="px-4 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-amber-600 rounded-full transition-colors"
            >
              Deck Builder
            </button>
            <button
              onClick={() => router.push('/pocketmode/packs')}
              className="px-4 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-amber-600 rounded-full transition-colors"
            >
              Packs
            </button>
          </div>
        </PageHeader>

        {/* Compact Filter Bar */}
        <Container variant="elevated" rounded="xl" className="mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <UnifiedSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search cards..."
                className="w-full"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3 flex-1">
              {/* Quick Type Filters - Popular types */}
              <div className="flex flex-wrap gap-1.5">
                {['fire', 'water', 'grass', 'lightning', 'psychic', 'fighting'].map(type => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
                    className={cn(
                      'p-1.5 rounded-lg border transition-all',
                      typeFilter === type
                        ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400/50'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400/50'
                    )}
                  >
                    <TypeBadge type={type} size="xs" />
                  </button>
                ))}
              </div>

              {/* Quick Rarity Filters */}
              <div className="flex gap-1">
                {[
                  { value: '★', label: '★' },
                  { value: '☆☆', label: '★★' },
                  { value: 'fullart', label: 'Full Art' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setRarityFilter(rarityFilter === value ? 'all' : value as RarityFilter)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                      rarityFilter === value
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-400/50 text-yellow-700 dark:text-yellow-300'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-400/50'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl font-medium text-stone-700 dark:text-stone-300"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active Filter Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {typeFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                    <TypeBadge type={typeFilter} size="xs" />
                    <span className="capitalize">{typeFilter}</span>
                    <button onClick={() => setTypeFilter('all')} className="ml-1 hover:text-blue-900">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {rarityFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium rounded-full">
                    {rarityFilter === 'fullart' ? 'Full Art' : rarityFilter}
                    <button onClick={() => setRarityFilter('all')} className="ml-1 hover:text-yellow-900">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-stone-500 hover:text-amber-600 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </Container>
        
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
            <ErrorState
              error={viewError}
              onRetry={fetchPokemonData}
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
              {/* Cards Container - no duplicate search bar */}
              <Container variant="elevated" rounded="xl" className="p-3 sm:p-4 md:p-6">
                <PocketCardList
                  cards={filteredPokemon}
                  loading={false}
                  selectedRarityFilter={rarityFilter}
                  variant="clean"
                />
              </Container>
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

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <MobileFilterDrawer
            isOpen={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            rarityFilter={rarityFilter}
            setRarityFilter={setRarityFilter}
            uniqueTypes={uniqueTypes}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
          />
        )}
      </AnimatePresence>
      </div>
      <BackToTop />
    </FullBleedWrapper>
  );
};

// Mark this page as full bleed to remove Layout padding
(PocketMode as any).fullBleed = true;

export default PocketMode;