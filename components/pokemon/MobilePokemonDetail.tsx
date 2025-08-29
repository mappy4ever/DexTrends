import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { TypeBadge } from '@/components/ui/TypeBadge';
import BottomSheet from '@/components/mobile/BottomSheet';
import EnhancedSwipeGestures from '@/components/mobile/EnhancedSwipeGestures';
import hapticFeedback from '@/utils/hapticFeedback';
import logger from '@/utils/logger';
import type { 
  Pokemon, 
  PokemonSpecies, 
  EvolutionChain, 
  PokemonTab,
  Nature,
  LocationAreaEncounterDetail
} from '@/types/pokemon';
import type { TCGCard } from '@/types/api/cards';
import type { PocketCard } from '@/types/api/pocket-cards';
import { CompetitiveTierRecord } from '@/utils/supabase';

interface MobilePokemonDetailProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain: EvolutionChain | null;
  abilities: Record<string, any>;
  tcgCards: TCGCard[];
  pocketCards: PocketCard[];
  showShiny: boolean;
  onShinyToggle: () => void;
  adjacentPokemon: {
    prev: { id: number; name: string; types: any[] } | null;
    next: { id: number; name: string; types: any[] } | null;
  };
  router: any;
  activeTab: PokemonTab;
  onTabChange: (tab: PokemonTab) => void;
  selectedForm: string;
  onFormChange: (pokemonId: string, formName: string) => void;
  locationEncounters: LocationAreaEncounterDetail[];
  natureData: Nature | null;
  allNatures: Nature[];
  selectedNature: string;
  onNatureChange: (nature: string) => void;
  selectedLevel: number;
  onLevelChange: (level: number) => void;
  competitiveTiers: CompetitiveTierRecord | null;
}

// Tab configuration for mobile
const MOBILE_TABS = [
  { id: 'overview' as PokemonTab, label: 'Overview', icon: '📊' },
  { id: 'stats' as PokemonTab, label: 'Stats', icon: '💪' },
  { id: 'evolution' as PokemonTab, label: 'Evolution', icon: '🔄' },
  { id: 'moves' as PokemonTab, label: 'Moves', icon: '⚔️' },
  { id: 'cards' as PokemonTab, label: 'Cards', icon: '🃏' }
];

export const MobilePokemonDetail: React.FC<MobilePokemonDetailProps> = ({
  pokemon,
  species,
  evolutionChain,
  abilities,
  tcgCards,
  pocketCards,
  showShiny,
  onShinyToggle,
  adjacentPokemon,
  router,
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
  const [imageIndex, setImageIndex] = useState(0);
  const [showFormSelector, setShowFormSelector] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  
  // Calculate available forms
  const availableForms = species.varieties || [];
  const currentFormData = availableForms.find(v => v.pokemon.name === selectedForm) || availableForms[0];
  
  // Image gallery data
  const images = [
    showShiny ? pokemon.sprites?.front_shiny : pokemon.sprites?.front_default,
    showShiny ? pokemon.sprites?.back_shiny : pokemon.sprites?.back_default,
    pokemon.sprites?.other?.['official-artwork']?.front_default,
    pokemon.sprites?.other?.['official-artwork']?.front_shiny
  ].filter(Boolean);
  
  // Handle swipe navigation between Pokémon
  const handleSwipeNavigation = useCallback((direction: 'left' | 'right') => {
    hapticFeedback.medium();
    
    if (direction === 'left' && adjacentPokemon.next) {
      setSwipeDirection('left');
      setTimeout(() => {
        router.push(`/pokedex/${adjacentPokemon.next!.id}`);
      }, 300);
    } else if (direction === 'right' && adjacentPokemon.prev) {
      setSwipeDirection('right');
      setTimeout(() => {
        router.push(`/pokedex/${adjacentPokemon.prev!.id}`);
      }, 300);
    }
  }, [adjacentPokemon, router]);
  
  // Handle tab scrolling
  useEffect(() => {
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);
  
  // Calculate stats for display
  const maxStat = Math.max(...(pokemon.stats || []).map(s => s.base_stat));
  const totalStats = (pokemon.stats || []).reduce((sum, s) => sum + s.base_stat, 0);
  
  return (
    <EnhancedSwipeGestures
      onSwipeLeft={() => handleSwipeNavigation('left')}
      onSwipeRight={() => handleSwipeNavigation('right')}
    >
      <div ref={containerRef} className="mobile-pokemon-detail pb-20">
        {/* Image Gallery Section */}
        <div className="relative h-[280px] bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={imageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative h-full flex items-center justify-center"
            >
              <ProgressiveImage
                src={images[imageIndex] || '/back-card.png'}
                alt={pokemon.name}
                className="w-full h-full"
                imgClassName="object-contain"
                priority={true}
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Image dots indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setImageIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === imageIndex ? "bg-white w-6" : "bg-white/50"
                )}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
          
          {/* Shiny toggle */}
          <button
            onClick={onShinyToggle}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur"
            aria-label="Toggle shiny"
          >
            {showShiny ? '✨' : '⭐'}
          </button>
          
          {/* Pokémon number */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur">
            <span className="text-sm font-semibold">#{String(pokemon.id).padStart(3, '0')}</span>
          </div>
        </div>
        
        {/* Basic Info Section */}
        <div className="px-4 py-4 space-y-4">
          {/* Name and Types */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold capitalize">{pokemon.name}</h1>
              <div className="flex gap-2 mt-2">
                {(pokemon.types || []).map(type => (
                  <TypeBadge key={type.type.name} type={type.type.name} size="sm" />
                ))}
              </div>
            </div>
            
            {/* Form selector button */}
            {availableForms.length > 1 && (
              <button
                onClick={() => setShowFormSelector(true)}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium"
              >
                Forms ({availableForms.length})
              </button>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
              <p className="text-lg font-semibold">{((pokemon.height || 0) / 10).toFixed(1)}m</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
              <p className="text-lg font-semibold">{((pokemon.weight || 0) / 10).toFixed(1)}kg</p>
            </div>
          </div>
          
          {/* Abilities */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Abilities</h3>
            <div className="flex flex-wrap gap-2">
              {(pokemon.abilities || []).map(ability => (
                <button
                  key={ability.ability.name}
                  onClick={() => setExpandedSection(
                    expandedSection === ability.ability.name ? null : ability.ability.name
                  )}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    ability.is_hidden 
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  )}
                >
                  {ability.ability.name.replace('-', ' ')}
                  {ability.is_hidden && ' (H)'}
                </button>
              ))}
            </div>
            
            {/* Expanded ability description */}
            <AnimatePresence>
              {expandedSection && abilities[expandedSection] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mt-2">
                    <p className="text-sm">{abilities[expandedSection].short_effect}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Sliding Tab System */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div 
            ref={tabsRef}
            className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {MOBILE_TABS.map(tab => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  hapticFeedback.selection();
                }}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  "scroll-snap-align-center min-w-[80px]",
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <MobileOverviewTab 
                  pokemon={pokemon} 
                  species={species}
                  competitiveTiers={competitiveTiers}
                />
              )}
              
              {activeTab === 'stats' && (
                <MobileStatsTab 
                  pokemon={pokemon}
                  maxStat={maxStat}
                  totalStats={totalStats}
                />
              )}
              
              {activeTab === 'evolution' && evolutionChain && (
                <MobileEvolutionTab 
                  evolutionChain={evolutionChain}
                  currentPokemonId={Number(pokemon.id)}
                  router={router}
                />
              )}
              
              {activeTab === 'moves' && (
                <MobileMovesTab 
                  pokemon={pokemon}
                />
              )}
              
              {activeTab === 'cards' && (
                <MobileCardsTab 
                  tcgCards={tcgCards}
                  pocketCards={pocketCards}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Form Selector Bottom Sheet */}
        <BottomSheet
          isOpen={showFormSelector}
          onClose={() => setShowFormSelector(false)}
          title="Select Form"
          snapPoints={[0.4, 0.7]}
          initialSnapPoint={0.4}
        >
          <div className="p-4 space-y-2">
            {availableForms.map(variety => (
              <button
                key={variety.pokemon.name}
                onClick={() => {
                  onFormChange(String(pokemon.id), variety.pokemon.name);
                  setShowFormSelector(false);
                  hapticFeedback.light();
                }}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all",
                  variety.pokemon.name === selectedForm
                    ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                    : "bg-gray-100 dark:bg-gray-800 border-2 border-transparent"
                )}
              >
                <p className="font-medium capitalize">
                  {variety.pokemon.name.replace(`${species.name}-`, '').replace('-', ' ')}
                </p>
                {variety.is_default && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default Form</p>
                )}
              </button>
            ))}
          </div>
        </BottomSheet>
        
        {/* Navigation hint for adjacent Pokémon */}
        <AnimatePresence>
          {(adjacentPokemon.prev || adjacentPokemon.next) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-20 left-4 right-4 flex justify-between pointer-events-none"
            >
              {adjacentPokemon.prev && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ← #{String(adjacentPokemon.prev!.id).padStart(3, '0')}
                </div>
              )}
              {adjacentPokemon.next && (
                <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  #{String(adjacentPokemon.next!.id).padStart(3, '0')} →
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </EnhancedSwipeGestures>
  );
};

// Mobile tab components
const MobileOverviewTab: React.FC<{ 
  pokemon: Pokemon; 
  species: PokemonSpecies;
  competitiveTiers: CompetitiveTierRecord | null;
}> = ({ pokemon, species, competitiveTiers }) => (
  <div className="space-y-4">
    {/* Description */}
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold mb-2">Description</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {species.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || 'No description available.'}
      </p>
    </div>
    
    {/* Base Stats Summary */}
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold mb-2">Base Stats Total</h3>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">
          {(pokemon.stats || []).reduce((sum, s) => sum + s.base_stat, 0)}
        </span>
        <div className="flex gap-2">
          {(pokemon.stats || []).map(stat => (
            <div key={stat.stat.name} className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.stat.name.substring(0, 3).toUpperCase()}
              </p>
              <p className="text-sm font-semibold">{stat.base_stat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Competitive Tiers */}
    {competitiveTiers && (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Competitive Tiers</h3>
        <div className="flex flex-wrap gap-2">
          {competitiveTiers.singles_tier && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">
              Singles: {competitiveTiers.singles_tier}
            </span>
          )}
          {competitiveTiers.doubles_tier && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">
              Doubles: {competitiveTiers.doubles_tier}
            </span>
          )}
          {competitiveTiers.national_dex_tier && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs">
              NatDex: {competitiveTiers.national_dex_tier}
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);

const MobileStatsTab: React.FC<{ 
  pokemon: Pokemon;
  maxStat: number;
  totalStats: number;
}> = ({ pokemon, maxStat, totalStats }) => (
  <div className="space-y-3">
    {(pokemon.stats || []).map(stat => (
      <div key={stat.stat.name} className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium capitalize">
            {stat.stat.name.replace('-', ' ')}
          </span>
          <span className="text-sm font-semibold">{stat.base_stat}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stat.base_stat / 255) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn(
              "h-full rounded-full",
              stat.base_stat >= 100 ? "bg-green-500" :
              stat.base_stat >= 80 ? "bg-blue-500" :
              stat.base_stat >= 60 ? "bg-yellow-500" : "bg-red-500"
            )}
          />
        </div>
      </div>
    ))}
    
    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold">{totalStats}</span>
      </div>
    </div>
  </div>
);

const MobileEvolutionTab: React.FC<{ 
  evolutionChain: EvolutionChain;
  currentPokemonId: number;
  router: any;
}> = ({ evolutionChain, currentPokemonId, router }) => {
  // Simple evolution display for mobile - would need full implementation
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Evolution chain display would go here
      </p>
    </div>
  );
};

const MobileMovesTab: React.FC<{ 
  pokemon: Pokemon;
}> = ({ pokemon }) => {
  // Simple moves display for mobile - would need full implementation
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Moves list would go here
      </p>
    </div>
  );
};

const MobileCardsTab: React.FC<{ 
  tcgCards: TCGCard[];
  pocketCards: PocketCard[];
}> = ({ tcgCards, pocketCards }) => {
  const [activeCardType, setActiveCardType] = useState<'tcg' | 'pocket'>('tcg');
  
  return (
    <div className="space-y-4">
      {/* Card type selector */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setActiveCardType('tcg')}
          className={cn(
            "flex-1 py-2 rounded-md text-sm font-medium transition-all",
            activeCardType === 'tcg'
              ? "bg-white dark:bg-gray-700 shadow"
              : "text-gray-600 dark:text-gray-400"
          )}
        >
          TCG ({tcgCards.length})
        </button>
        <button
          onClick={() => setActiveCardType('pocket')}
          className={cn(
            "flex-1 py-2 rounded-md text-sm font-medium transition-all",
            activeCardType === 'pocket'
              ? "bg-white dark:bg-gray-700 shadow"
              : "text-gray-600 dark:text-gray-400"
          )}
        >
          Pocket ({pocketCards.length})
        </button>
      </div>
      
      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {activeCardType === 'tcg' && tcgCards.slice(0, 6).map(card => (
          <div key={card.id} className="aspect-[2.5/3.5] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <ProgressiveImage
              src={card.images.small}
              alt={card.name}
              className="w-full h-full"
              imgClassName="object-cover"
            />
          </div>
        ))}
        
        {activeCardType === 'pocket' && pocketCards.slice(0, 6).map(card => (
          <div key={card.id} className="aspect-[2.5/3.5] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <ProgressiveImage
              src={card.image}
              alt={card.name}
              className="w-full h-full"
              imgClassName="object-cover"
            />
          </div>
        ))}
      </div>
      
      {((activeCardType === 'tcg' && tcgCards.length > 6) ||
        (activeCardType === 'pocket' && pocketCards.length > 6)) && (
        <button className="w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium">
          View All Cards
        </button>
      )}
    </div>
  );
};

export default MobilePokemonDetail;