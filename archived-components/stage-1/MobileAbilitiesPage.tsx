import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet as BottomSheet } from '../ui/Sheet';
import hapticFeedback from '../../utils/hapticFeedback';
import { fetchShowdownAbilities } from '../../utils/showdownData';
import { requestCache } from '../../utils/UnifiedCacheManager';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';
import { useDebounce } from '../../hooks/useDebounce';
import { POKEAPI } from '../../config/api';

interface Ability {
  id: number;
  name: string;
  displayName: string;
  effect: string;
  short_effect: string;
  generation?: number;
  rating?: number;
  is_competitive?: boolean;
  pokemon?: string[];
}

interface PokemonWithAbility {
  name: string;
  sprite: string;
  isHidden: boolean;
}

const GENERATION_FILTERS = [
  { key: 'all', name: 'All Gens', color: 'from-gray-400 to-gray-500' },
  { key: '1', name: 'Gen I', color: 'from-red-400 to-red-500' },
  { key: '2', name: 'Gen II', color: 'from-yellow-400 to-yellow-500' },
  { key: '3', name: 'Gen III', color: 'from-green-400 to-green-500' },
  { key: '4', name: 'Gen IV', color: 'from-blue-400 to-blue-500' },
  { key: '5', name: 'Gen V', color: 'from-purple-400 to-purple-500' },
  { key: '6', name: 'Gen VI', color: 'from-pink-400 to-pink-500' },
  { key: '7', name: 'Gen VII', color: 'from-orange-400 to-orange-500' },
  { key: '8', name: 'Gen VIII', color: 'from-indigo-400 to-indigo-500' },
  { key: '9', name: 'Gen IX', color: 'from-teal-400 to-teal-500' },
];

const MobileAbilitiesPage: React.FC = () => {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [filteredAbilities, setFilteredAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('all');
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [expandedAbilityId, setExpandedAbilityId] = useState<number | null>(null);
  const [abilityPokemon, setAbilityPokemon] = useState<Record<number, PokemonWithAbility[]>>({});
  const [loadingPokemon, setLoadingPokemon] = useState<Record<number, boolean>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch abilities on mount
  useEffect(() => {
    const fetchAllAbilities = async () => {
      setLoading(true);
      
      try {
        const cacheKey = 'showdown-abilities-data';
        const cached = await requestCache.get(cacheKey);
        
        if (cached) {
          setAbilities(cached);
          setFilteredAbilities(cached);
          setLoading(false);
          return;
        }

        const showdownAbilities = await fetchShowdownAbilities();
        
        if (!showdownAbilities || Object.keys(showdownAbilities).length === 0) {
          throw new Error('Failed to fetch abilities from Showdown');
        }

        const allAbilities: Ability[] = [];
        
        for (const [abilityName, abilityData] of Object.entries(showdownAbilities)) {
          if (!abilityData || typeof abilityData !== 'object') continue;
          
          // Skip abilities without proper descriptions
          if (!abilityData.desc || abilityData.desc.length < 10) continue;
          
          allAbilities.push({
            id: allAbilities.length + 1,
            name: abilityName,
            displayName: abilityData.name || abilityName.replace(/-/g, ' '),
            effect: abilityData.desc || '',
            short_effect: abilityData.shortDesc || abilityData.desc || '',
            generation: (abilityData as any).gen || 1,
            rating: abilityData.rating || 0,
            is_competitive: (abilityData.rating && abilityData.rating >= 3) || false
          });
        }
        
        const sortedAbilities = allAbilities.sort((a, b) => {
          // Sort by competitive rating first, then by name
          if (b.rating !== a.rating) {
            return (b.rating || 0) - (a.rating || 0);
          }
          return a.displayName.localeCompare(b.displayName);
        });
        
        await requestCache.set(cacheKey, sortedAbilities); // Will use default TTL
        setAbilities(sortedAbilities);
        setFilteredAbilities(sortedAbilities);
      } catch (error) {
        logger.error('Failed to fetch abilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAbilities();
  }, []);

  // Filter abilities
  useEffect(() => {
    let filtered = [...abilities];
    
    // Generation filter
    if (selectedGeneration !== 'all') {
      const gen = parseInt(selectedGeneration);
      filtered = filtered.filter(ability => ability.generation === gen);
    }
    
    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(ability => 
        ability.displayName.toLowerCase().includes(searchLower) ||
        ability.effect.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredAbilities(filtered);
  }, [abilities, selectedGeneration, debouncedSearch]);

  // Fetch Pokemon with this ability
  const fetchAbilityPokemon = useCallback(async (abilityId: number, abilityName: string) => {
    if (abilityPokemon[abilityId] || loadingPokemon[abilityId]) return;
    
    setLoadingPokemon(prev => ({ ...prev, [abilityId]: true }));
    
    try {
      const response = await fetchJSON<any>(`https://pokeapi.co/api/v2/ability/${abilityName}`);
      
      const pokemonList: PokemonWithAbility[] = response.pokemon?.slice(0, 12).map((p: any) => ({
        name: p.pokemon.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokemon.url.split('/')[6]}.png`,
        isHidden: p.is_hidden
      })) || [];
      
      setAbilityPokemon(prev => ({ ...prev, [abilityId]: pokemonList }));
    } catch (error) {
      logger.error(`Failed to fetch Pokemon for ability ${abilityName}:`, error);
    } finally {
      setLoadingPokemon(prev => ({ ...prev, [abilityId]: false }));
    }
  }, [abilityPokemon, loadingPokemon]);

  // Handle ability expansion
  const handleAbilityPress = useCallback((ability: Ability) => {
    hapticFeedback.light();
    
    if (expandedAbilityId === ability.id) {
      setExpandedAbilityId(null);
    } else {
      setExpandedAbilityId(ability.id);
      fetchAbilityPokemon(ability.id, ability.name);
    }
  }, [expandedAbilityId, fetchAbilityPokemon]);

  // Ability card component
  const AbilityCard = useCallback(({ ability }: { ability: Ability }) => {
    const isExpanded = expandedAbilityId === ability.id;
    const pokemon = abilityPokemon[ability.id];
    const isLoadingPokemon = loadingPokemon[ability.id];
    
    return (
      <motion.div
        layout
        className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
      >
        <motion.button
          className="w-full p-4 text-left"
          onClick={() => handleAbilityPress(ability)}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base capitalize">
                  {ability.displayName}
                </h3>
                {ability.is_competitive && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-xs font-bold rounded-full">
                    META
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 line-clamp-2">
                {ability.short_effect}
              </p>
              {ability.generation && (
                <p className="text-xs text-white/40 mt-1">Gen {ability.generation}</p>
              )}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 mt-1"
            >
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </motion.button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/10"
            >
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Full Effect</h4>
                  <p className="text-sm">{ability.effect}</p>
                </div>
                
                {ability.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Competitive Rating:</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < (ability.rating || 0) ? 'text-yellow-400' : 'text-white/20'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {isLoadingPokemon ? (
                  <div className="text-sm text-white/40">Loading Pokemon...</div>
                ) : pokemon && pokemon.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-2">Pokemon with this ability</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {pokemon.map((p, idx) => (
                        <Link 
                          key={idx}
                          href={`/pokedex/${p.name.split('-')[0]}`}
                          className="relative group"
                        >
                          <div className={`relative w-12 h-12 rounded-lg overflow-hidden ${
                            p.isHidden ? 'ring-2 ring-purple-500' : ''
                          }`}>
                            <Image
                              src={p.sprite}
                              alt={p.name}
                              fill
                              className="object-contain p-1 group-hover:scale-110 transition-transform"
                            />
                          </div>
                          {p.isHidden && (
                            <span className="absolute -top-1 -right-1 text-xs bg-purple-500 rounded-full w-4 h-4 flex items-center justify-center">
                              H
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      {pokemon.some(p => p.isHidden) && 'H = Hidden Ability'}
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [expandedAbilityId, abilityPokemon, loadingPokemon, handleAbilityPress]);

  // Generation filter chip
  const GenerationChip = ({ generation }: { generation: typeof GENERATION_FILTERS[0] }) => (
    <motion.button
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
        selectedGeneration === generation.key
          ? 'bg-gradient-to-r text-white'
          : 'bg-white/10 text-white/70'
      }`}
      style={{
        backgroundImage: selectedGeneration === generation.key 
          ? `linear-gradient(to right, var(--tw-gradient-stops))` 
          : undefined
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        hapticFeedback.light();
        setSelectedGeneration(generation.key);
      }}
    >
      {generation.name}
    </motion.button>
  );

  return (
    <div className="mobile-abilities-page min-h-screen pb-20">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-sm">
        <div className="px-4 py-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search abilities..."
              className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                onClick={() => {
                  setSearchTerm('');
                  searchInputRef.current?.focus();
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Generation Filters - Horizontal Scroll */}
          <div className="mt-3 -mx-4 px-4">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
              {GENERATION_FILTERS.map(generation => (
                <GenerationChip key={generation.key} generation={generation} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="px-4 pb-2 text-xs text-white/60">
          {loading ? 'Loading abilities...' : `${filteredAbilities.length} abilities found`}
        </div>
      </div>

      {/* Abilities List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filteredAbilities.length > 0 ? (
          <div className="grid gap-3">
            {filteredAbilities.slice(0, 50).map(ability => (
              <AbilityCard key={ability.id} ability={ability} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-white/60">No abilities found</p>
            {searchTerm && (
              <p className="text-sm text-white/40 mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAbilitiesPage;