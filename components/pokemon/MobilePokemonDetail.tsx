import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import BottomSheet from '@/components/mobile/BottomSheet';
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

// Tab configuration for mobile - more compact
const MOBILE_TABS = [
  { id: 'overview' as PokemonTab, label: 'Overview' },
  { id: 'stats' as PokemonTab, label: 'Stats' },
  { id: 'evolution' as PokemonTab, label: 'Evolution' },
  { id: 'moves' as PokemonTab, label: 'Moves' },
  { id: 'cards' as PokemonTab, label: 'Cards' }
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
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  
  // Calculate available forms
  const availableForms = species.varieties || [];
  
  // Image for display
  const spriteUrl = showShiny 
    ? pokemon.sprites?.front_shiny || pokemon.sprites?.front_default
    : pokemon.sprites?.front_default || pokemon.sprites?.other?.['official-artwork']?.front_default;
  
  // Type colors
  const typeColors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };
  
  // Handle swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;
    
    if (Math.abs(diff) > 100) {
      if (diff > 0 && adjacentPokemon.next) {
        hapticFeedback.medium();
        router.push(`/pokedex/${adjacentPokemon.next.id}`);
      } else if (diff < 0 && adjacentPokemon.prev) {
        hapticFeedback.medium();
        router.push(`/pokedex/${adjacentPokemon.prev.id}`);
      }
    }
  };
  
  // Auto-scroll active tab into view
  useEffect(() => {
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);
  
  return (
    <div 
      className="mobile-pokemon-detail"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Compact Image Section - 180px */}
      <div className="image-gallery">
        <div className="relative h-full flex items-center justify-center p-4">
          {spriteUrl && (
            <img
              src={spriteUrl}
              alt={pokemon.name}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          )}
          
          {/* Shiny toggle */}
          <button
            onClick={() => {
              hapticFeedback.light();
              onShinyToggle();
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center"
            style={{ fontSize: '14px' }}
          >
            {showShiny ? '✨' : '⭐'}
          </button>
        </div>
      </div>
      
      {/* Compact Info Section */}
      <div className="info-section">
        {/* Pokemon Name and Number Inline */}
        <div className="pokemon-header">
          <h1 className="pokemon-name">
            {pokemon.name}
          </h1>
          <span className="pokemon-number">
            #{String(pokemon.id).padStart(3, '0')}
          </span>
        </div>
        
        {/* Compact Type Badges */}
        <div className="type-badges">
          {pokemon.types?.map(type => (
            <span 
              key={type.type.name}
              className="type-badge"
              style={{ 
                background: typeColors[type.type.name] || '#68A090',
                color: 'white'
              }}
            >
              {type.type.name}
            </span>
          ))}
        </div>
        
        {/* Inline Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Height</span>
            <span className="stat-value">{((pokemon.height || 0) / 10).toFixed(1)}m</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Weight</span>
            <span className="stat-value">{((pokemon.weight || 0) / 10).toFixed(1)}kg</span>
          </div>
        </div>
        
        {/* Compact Abilities */}
        <div className="abilities">
          <p className="abilities-title">Abilities</p>
          <div className="ability-pills">
            {(pokemon.abilities || []).map(ability => (
              <button
                key={ability.ability.name}
                onClick={() => {
                  hapticFeedback.light();
                  setExpandedAbility(
                    expandedAbility === ability.ability.name ? null : ability.ability.name
                  );
                }}
                className={cn(
                  "ability-pill",
                  ability.is_hidden && "hidden"
                )}
              >
                {ability.ability.name.replace(/-/g, ' ')}
                {ability.is_hidden && ' (H)'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Expanded ability description */}
        <AnimatePresence>
          {expandedAbility && abilities[expandedAbility] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                {abilities[expandedAbility].short_effect || abilities[expandedAbility].effect}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Horizontal Scrolling Tabs */}
      <div className="mobile-tabs">
        <div 
          ref={tabsRef}
          className="mobile-tabs-inner"
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
                "mobile-tab",
                activeTab === tab.id && "active"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mobile-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
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
      {availableForms.length > 1 && (
        <>
          <button
            onClick={() => setShowFormSelector(true)}
            className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
            style={{ zIndex: 'var(--m-z-sticky)' }}
          >
            {availableForms.length}
          </button>
          
          <BottomSheet
            isOpen={showFormSelector}
            onClose={() => setShowFormSelector(false)}
            title="Select Form"
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
                    "w-full p-3 rounded-lg text-left",
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
        </>
      )}
      
      {/* Navigation hints */}
      {(adjacentPokemon.prev || adjacentPokemon.next) && (
        <div className="fixed bottom-4 left-4 right-4 flex justify-between text-xs text-gray-400 pointer-events-none" style={{ zIndex: 1 }}>
          {adjacentPokemon.prev && (
            <span>← Swipe for #{adjacentPokemon.prev.id}</span>
          )}
          {adjacentPokemon.next && (
            <span className="ml-auto">Swipe for #{adjacentPokemon.next.id} →</span>
          )}
        </div>
      )}
    </div>
  );
};

// Simplified Tab Components
const MobileOverviewTab: React.FC<any> = ({ pokemon, species, competitiveTiers }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold mb-2">Description</h3>
      <p className="text-sm">{species?.flavor_text_entries?.find((f: any) => f.language.name === 'en')?.flavor_text || 'No description available.'}</p>
    </div>
    
    {competitiveTiers && (
      <div>
        <h3 className="text-sm font-semibold mb-2">Competitive Tiers</h3>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(competitiveTiers).filter(([key]) => !['pokemon_id', 'pokemon_name'].includes(key)).map(([tier, value]) => value ? (
            <span key={tier} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">
              {tier.toUpperCase()}
            </span>
          ) : null)}
        </div>
      </div>
    )}
  </div>
);

const MobileStatsTab: React.FC<any> = ({ pokemon }) => {
  const maxStat = Math.max(...(pokemon.stats || []).map((s: any) => s.base_stat));
  const totalStats = (pokemon.stats || []).reduce((sum: number, s: any) => sum + s.base_stat, 0);
  
  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <p className="text-2xl font-bold">{totalStats}</p>
        <p className="text-xs text-gray-500">Total Base Stats</p>
      </div>
      
      {(pokemon.stats || []).map((stat: any) => (
        <div key={stat.stat.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="capitalize">{stat.stat.name.replace('-', ' ')}</span>
            <span className="font-semibold">{stat.base_stat}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(stat.base_stat / maxStat) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const MobileEvolutionTab: React.FC<any> = ({ evolutionChain, currentPokemonId, router }) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-600 dark:text-gray-400">Evolution chain display here</p>
  </div>
);

const MobileMovesTab: React.FC<any> = ({ pokemon }) => (
  <div className="space-y-2">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {pokemon.moves?.length || 0} moves available
    </p>
  </div>
);

const MobileCardsTab: React.FC<any> = ({ tcgCards, pocketCards }) => (
  <div className="space-y-4">
    <div>
      <p className="text-sm font-semibold mb-2">TCG Cards: {tcgCards.length}</p>
      <p className="text-sm font-semibold">Pocket Cards: {pocketCards.length}</p>
    </div>
  </div>
);

export default MobilePokemonDetail;