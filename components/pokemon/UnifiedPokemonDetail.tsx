import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { POKEMON_TYPE_COLORS } from '@/utils/pokemonTypeColors';
import type { 
  Pokemon, 
  PokemonSpecies, 
  EvolutionChain,
  Nature,
  PokemonTab,
  PokemonType,
  LocationAreaEncounterDetail
} from '@/types/pokemon';
import type { TCGCard } from '@/types/api/cards';
import type { PocketCard } from '@/types/api/pocket-cards';
import type { CompetitiveTierRecord } from '@/utils/supabase';
import PokemonHeroSectionV3 from './PokemonHeroSectionV3';
import PokemonTabSystem from './PokemonTabSystem';
import FloatingActionBar from './FloatingActionBar';
import NavigationArrow from './NavigationArrow';
import { ProgressiveImage } from '../ui/ProgressiveImage';
import { UnifiedPullToRefresh } from '../ui/UnifiedPullToRefresh';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import hapticFeedback from '@/utils/hapticFeedback';
import { dynamicIsland } from '../ui/DynamicIsland';

interface UnifiedPokemonDetailProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain: EvolutionChain | null;
  abilities: Record<string, any>;
  tcgCards: TCGCard[];
  pocketCards: PocketCard[];
  showShiny: boolean;
  onShinyToggle: () => void;
  adjacentPokemon: {
    prev: { id: number; name: string; types: PokemonType[] } | null;
    next: { id: number; name: string; types: PokemonType[] } | null;
  };
  activeTab: PokemonTab;
  onTabChange: (tab: PokemonTab) => void;
  selectedForm: string;
  onFormChange: (form: string) => void;
  locationEncounters: LocationAreaEncounterDetail[];
  natureData: Nature | null;
  allNatures: Nature[];
  selectedNature: string;
  onNatureChange: (nature: string) => void;
  selectedLevel: number;
  onLevelChange: (level: number) => void;
  competitiveTiers: CompetitiveTierRecord | null;
}

/**
 * Unified Pokemon Detail Component
 * Works responsively across all devices without JavaScript device detection
 */
export const UnifiedPokemonDetail: React.FC<UnifiedPokemonDetailProps> = ({
  pokemon,
  species,
  evolutionChain,
  abilities,
  tcgCards,
  pocketCards,
  showShiny,
  onShinyToggle,
  adjacentPokemon,
  activeTab,
  onTabChange,
  selectedForm,
  onFormChange,
  locationEncounters,
  natureData,
  allNatures,
  selectedNature,
  onNatureChange,
  selectedLevel,
  onLevelChange,
  competitiveTiers
}) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    hapticFeedback.success();
    dynamicIsland.show({
      type: 'loading',
      title: 'Refreshing Pokemon data...',
      duration: 0
    });
    
    // Simulate refresh (in real app, refetch data)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    dynamicIsland.show({
      type: 'success',
      title: 'Data refreshed',
      message: `${pokemon.name} data updated`,
      metadata: {
        pokemon: {
          id: typeof pokemon.id === 'string' ? parseInt(pokemon.id) : pokemon.id,
          name: pokemon.name,
          sprite: pokemon.sprites?.front_default || undefined
        }
      }
    });
    
    // Reload the page or refetch data
    window.location.reload();
  }, [pokemon]);
  
  // Add swipe gestures for navigation
  useSwipeGesture(mainRef, {
    onSwipeLeft: () => {
      if (adjacentPokemon.next) {
        hapticFeedback.light();
        dynamicIsland.show({
          type: 'info',
          title: `Navigating to ${adjacentPokemon.next.name}`,
          duration: 1500
        });
        router.push(`/pokedex/${adjacentPokemon.next.id}`);
      }
    },
    onSwipeRight: () => {
      if (adjacentPokemon.prev) {
        hapticFeedback.light();
        dynamicIsland.show({
          type: 'info',
          title: `Navigating to ${adjacentPokemon.prev.name}`,
          duration: 1500
        });
        router.push(`/pokedex/${adjacentPokemon.prev.id}`);
      }
    }
  });

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get Pokemon type colors
  const primaryType = pokemon.types?.[0]?.type.name;
  const typeColor = POKEMON_TYPE_COLORS[primaryType as keyof typeof POKEMON_TYPE_COLORS] || POKEMON_TYPE_COLORS.normal;

  return (
    <UnifiedPullToRefresh onRefresh={handleRefresh}>
      <div ref={mainRef} className="min-h-screen bg-gradient-to-b from-white to-stone-50 dark:from-stone-900 dark:to-black">
      {/* Sticky Navigation Header - Responsive */}
      <motion.header 
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          "h-14 md:h-16", // Smaller on mobile
          "px-4 md:px-6",
          "backdrop-blur-xl",
          isScrolled ? "bg-white/95 dark:bg-stone-900/95 shadow-premium-md" : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="h-full flex items-center justify-between max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => {
              hapticFeedback.light();
              dynamicIsland.show({
                type: 'info',
                title: 'Returning to Pokedex',
                duration: 1000
              });
              router.push('/pokedex');
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl",
              "text-sm font-medium",
              "hover:bg-stone-100 dark:hover:bg-stone-800",
              "transition-all duration-200",
              "touch-target" // Ensures 48px touch target
            )}
          >
            <span className="text-lg">←</span>
            <span className="hidden sm:inline">Pokédex</span>
          </button>

          {/* Pokemon Name - Responsive text */}
          <h1 className={cn(
            "font-bold capitalize",
            "text-responsive-lg md:text-responsive-2xl",
            "text-stone-900 dark:text-white"
          )}>
            {pokemon.name}
            <span className="text-stone-500 dark:text-stone-400 ml-2">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
          </h1>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            {adjacentPokemon.prev && (
              <NavigationArrow
                direction="prev"
                pokemon={adjacentPokemon.prev}
                onClick={() => {
                  hapticFeedback.light();
                  router.push(`/pokedex/${adjacentPokemon.prev?.id}`);
                }}
              />
            )}
            {adjacentPokemon.next && (
              <NavigationArrow
                direction="next"
                pokemon={adjacentPokemon.next}
                onClick={() => {
                  hapticFeedback.light();
                  router.push(`/pokedex/${adjacentPokemon.next?.id}`);
                }}
              />
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content - Responsive padding */}
      <main className="p-responsive-sm md:p-responsive-md lg:p-responsive-lg max-w-7xl mx-auto">
        {/* Hero Section - Responsive */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <PokemonHeroSectionV3
            pokemon={pokemon}
            species={species}
            showShiny={showShiny}
            onShinyToggle={onShinyToggle}
            onFormChange={onFormChange}
          />
        </motion.section>

        {/* Tab System - Responsive */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <PokemonTabSystem
            pokemon={pokemon}
            species={species}
            evolutionChain={evolutionChain}
            abilities={abilities}
            activeTab={activeTab}
            onTabChange={onTabChange}
            tcgCards={tcgCards}
            pocketCards={pocketCards}
            locationEncounters={locationEncounters}
            natureData={natureData}
            allNatures={allNatures}
            selectedNature={selectedNature}
            onNatureChange={onNatureChange}
            selectedLevel={selectedLevel}
            onLevelChange={onLevelChange}
            competitiveTiers={competitiveTiers}
          />
        </motion.section>
      </main>

      {/* Floating Action Bar - Mobile optimized */}
      <div className="block md:hidden">
        <FloatingActionBar
          pokemon={pokemon}
        />
      </div>

      {/* Bottom Navigation Spacer - Mobile only */}
      <div className="h-20 md:hidden" />
    </div>
    </UnifiedPullToRefresh>
  );
};