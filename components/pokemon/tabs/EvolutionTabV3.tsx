import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon, PokemonSpecies, EvolutionChain } from "../../../types/pokemon";
import type { TypeColors } from '../../../types/pokemon-tabs';
import { Container } from '../../ui/Container';
import { TypeBadge } from '../../ui/TypeBadge';
import { cn } from '../../../utils/cn';
import { FiArrowRight, FiArrowDown, FiStar, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
// Domain-specific icons for evolution/items - documented exceptions
import { FaDna, FaGem } from 'react-icons/fa';
import { GiTwoCoins, GiStoneSphere } from 'react-icons/gi';
// HiSparkles replaced with FiStar from Feather
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { hasRegionalEvolution, getRegionalEvolution, isRegionalEvolution } from '../../../utils/regionalEvolutions';

interface EvolutionTabV3Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain: EvolutionChain | null;
  typeColors: TypeColors;
}

interface EvolutionNode {
  id: number;
  name: string;
  types?: string[];
  sprite?: string;
  evolutionDetails?: {
    trigger: string;
    minLevel?: number;
    item?: string;
    minHappiness?: number;
    location?: string;
    heldItem?: string;
    timeOfDay?: string;
    gender?: number;
    knownMove?: string;
    minAffection?: number;
    needsOverworldRain?: boolean;
    partySpecies?: string;
    tradeSpecies?: string;
    minBeauty?: number;
    relativePhysicalStats?: number;
  }[];
}

// Move component definitions outside to fix React rendering error
const EvolutionCard = ({ node, isCurrent }: { node: EvolutionNode; isCurrent: boolean }) => (
  <Link href={`/pokedex/${node.id}`}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "relative cursor-pointer rounded-xl badge-no-cull",
        "transform transition-all duration-300",
        "hover:scale-105 hover:shadow-evolution",
        "active:scale-[0.98]",
        isCurrent && "ring-2 ring-amber-500/50"
      )}
      style={{ 
        transform: 'translate3d(0,0,0)',
        WebkitTransform: 'translate3d(0,0,0)',
        backfaceVisibility: 'visible',
        WebkitBackfaceVisibility: 'visible'
      }}
    >
      <Container 
        variant="default" 
       
        className={cn(
          "p-4 text-center border transition-all duration-200 hover:border-white/30",
          isCurrent ? "border-amber-500/50 bg-amber-500/10" : "border-stone-700/50",
          "hover:shadow-xl"
        )}
      >
        {/* Current Pokemon Badge */}
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-600 to-amber-600 text-white">
              CURRENT
            </span>
          </div>
        )}
        
        {/* Pokemon Image */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3">
          <Image
            src={node.sprite || '/placeholder-pokemon.png'}
            alt={node.name}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 96px, 128px"
          />
        </div>
        
        {/* Pokemon Name */}
        <h3 className="font-bold capitalize text-base sm:text-lg mb-2">{node.name}</h3>
        
        {/* Pokemon Number */}
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-300">#{String(node.id).padStart(3, '0')}</p>
      </Container>
    </motion.div>
  </Link>
);

// Helper functions for formatting
const formatItemName = (item: string) => {
  return item.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
};

const formatLocationName = (location: string) => {
  return location.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
};

const formatMoveName = (move: string) => {
  return move.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
};

// Helper to get Pokemon ID for evolution (simplified - in production would fetch from API)
const getEvolutionPokemonId = (pokemonName: string): number => {
  const evolutionIds: Record<string, number> = {
    'perrserker': 863,
    'rapidash-galar': 78,
    'sirfetchd': 865,
    'slowbro-galar': 80,
    'slowking-galar': 199,
    'cursola': 864,
    'linoone-galar': 264,
    'obstagoon': 862,
    'runerigus': 867,
    'mr-rime': 866,
    'sneasler': 903,
    'overqwil': 904,
    'basculegion': 902,
    'raichu-alola': 26,
    'exeggutor-alola': 103,
    'marowak-alola': 105,
    'meowth-galar': 52,
    'ponyta-galar': 77,
    'farfetchd-galar': 83,
    'slowpoke-galar': 79,
    'corsola-galar': 222,
    'zigzagoon-galar': 263,
    'yamask-galar': 562,
    'mr-mime-galar': 122,
    'sneasel-hisui': 215,
    'qwilfish-hisui': 211,
    'basculin-white-striped': 550
  };
  
  return evolutionIds[pokemonName] || 1;
};

// Helper to get pre-evolution for regional evolutions
const getPreEvolutionForRegional = (pokemonName: string): { from: string; method: string; level?: number; item?: string } | null => {
  const preEvolutions: Record<string, { from: string; method: string; level?: number; item?: string }> = {
    'perrserker': { from: 'meowth-galar', method: 'level-up', level: 28 },
    'rapidash-galar': { from: 'ponyta-galar', method: 'level-up', level: 40 },
    'sirfetchd': { from: 'farfetchd-galar', method: 'level-up' },
    'slowbro-galar': { from: 'slowpoke-galar', method: 'use-item', item: 'galarica-cuff' },
    'slowking-galar': { from: 'slowpoke-galar', method: 'use-item', item: 'galarica-wreath' },
    'cursola': { from: 'corsola-galar', method: 'level-up', level: 38 },
    'obstagoon': { from: 'linoone-galar', method: 'level-up', level: 35 },
    'runerigus': { from: 'yamask-galar', method: 'level-up' },
    'mr-rime': { from: 'mr-mime-galar', method: 'level-up', level: 42 },
    'sneasler': { from: 'sneasel-hisui', method: 'level-up' },
    'overqwil': { from: 'qwilfish-hisui', method: 'level-up' },
    'basculegion': { from: 'basculin-white-striped', method: 'level-up' }
  };
  
  return preEvolutions[pokemonName] || null;
};

const EvolutionArrow = ({ 
  horizontal = true, 
  evolutionDetails 
}: { 
  horizontal?: boolean; 
  evolutionDetails?: Array<{
    trigger: string;
    minLevel?: number;
    item?: string;
    minHappiness?: number;
    location?: string;
    heldItem?: string;
    timeOfDay?: string;
    gender?: number;
    knownMove?: string;
    minAffection?: number;
    needsOverworldRain?: boolean;
    partySpecies?: string;
    tradeSpecies?: string;
    minBeauty?: number;
    relativePhysicalStats?: number;
  }> 
}) => {
  // Display evolution requirements
  const getEvolutionText = () => {
    if (!evolutionDetails || evolutionDetails.length === 0) return null;
    
    const detail = evolutionDetails[0]; // Primary evolution method
    const parts = [];
    
    // Level-based evolution
    if (detail.minLevel) {
      parts.push(`Lv. ${detail.minLevel}`);
    }
    
    // Item-based evolution
    if (detail.item) {
      parts.push(formatItemName(detail.item));
    }
    
    // Trade evolution
    if (detail.trigger === 'trade') {
      if (detail.heldItem) {
        parts.push(`Trade holding ${formatItemName(detail.heldItem)}`);
      } else if (detail.tradeSpecies) {
        parts.push(`Trade for ${detail.tradeSpecies}`);
      } else {
        parts.push('Trade');
      }
    }
    
    // Happiness evolution
    if (detail.minHappiness) {
      parts.push(`Happiness ${detail.minHappiness}+`);
    }
    
    // Location-based evolution
    if (detail.location) {
      parts.push(`at ${formatLocationName(detail.location)}`);
    }
    
    // Time of day
    if (detail.timeOfDay && detail.timeOfDay !== '') {
      parts.push(`(${detail.timeOfDay.charAt(0).toUpperCase() + detail.timeOfDay.slice(1)})`);
    }
    
    // Known move
    if (detail.knownMove) {
      parts.push(`knowing ${formatMoveName(detail.knownMove)}`);
    }
    
    // Weather condition
    if (detail.needsOverworldRain) {
      parts.push('(Raining)');
    }
    
    // Gender requirement
    if (detail.gender === 1) {
      parts.push('(Female)');
    } else if (detail.gender === 2) {
      parts.push('(Male)');
    }
    
    // Affection
    if (detail.minAffection) {
      parts.push(`Affection ${detail.minAffection}+`);
    }
    
    // Beauty
    if (detail.minBeauty) {
      parts.push(`Beauty ${detail.minBeauty}+`);
    }
    
    // Physical stats comparison
    if (detail.relativePhysicalStats === 1) {
      parts.push('(Attack > Defense)');
    } else if (detail.relativePhysicalStats === -1) {
      parts.push('(Attack < Defense)');
    } else if (detail.relativePhysicalStats === 0) {
      parts.push('(Attack = Defense)');
    }
    
    return parts.join(' ');
  };
  
  const evolutionText = getEvolutionText();
  
  return (
    <motion.div 
      className={cn(
        "flex flex-col items-center gap-1",
        horizontal ? "mx-4" : "my-4"
      )}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      {evolutionText && (
        <div className="text-xs text-stone-600 dark:text-stone-300 font-medium text-center max-w-[120px]">
          {evolutionText}
        </div>
      )}
      <div className="text-stone-500 dark:text-stone-300">
        {horizontal ? (
          <FiArrowRight className="w-6 h-6" />
        ) : (
          <FiArrowDown className="w-6 h-6" />
        )}
      </div>
    </motion.div>
  );
};

const EvolutionTabV3: React.FC<EvolutionTabV3Props> = ({
  pokemon,
  species,
  evolutionChain,
  typeColors
}) => {
  const [showShiny, setShowShiny] = useState(false);
  const [megaFormData, setMegaFormData] = useState<Record<string, Pokemon>>({});
  
  // Check if this is a regional variant
  const isRegionalVariant = pokemon.name.includes('-alola') || 
                           pokemon.name.includes('-galar') || 
                           pokemon.name.includes('-hisui') || 
                           pokemon.name.includes('-paldea');
  
  // Fetch mega and gigantamax form sprites
  useEffect(() => {
    const fetchSpecialForms = async () => {
      if (!species?.varieties) return;
      
      const specialVarieties = species.varieties.filter(v => 
        v.pokemon.name.includes('mega') || v.pokemon.name.includes('gmax')
      );
      const formData: Record<string, Pokemon> = {};
      
      for (const variety of specialVarieties) {
        const data = await fetchJSON<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${variety.pokemon.name}`);
        if (data) {
          formData[variety.pokemon.name] = data;
        } else {
          logger.warn(`Failed to fetch data for ${variety.pokemon.name}`);
        }
      }
      
      setMegaFormData(formData);
    };
    
    fetchSpecialForms();
  }, [species?.varieties]);
  
  interface EvolutionDetail {
  trigger: string;
  minLevel?: number;
  item?: string;
  minHappiness?: number;
  location?: string;
  heldItem?: string;
  timeOfDay?: string;
  gender?: number;
  knownMove?: string;
  minAffection?: number;
  needsOverworldRain?: boolean;
  partySpecies?: string;
  tradeSpecies?: string;
  minBeauty?: number;
  relativePhysicalStats?: number;
}

interface EvolutionChainNode {
  species: { name: string; url: string };
  evolution_details?: Array<{
    trigger?: { name: string } | null;
    min_level?: number | null;
    item?: { name: string } | null;
    min_happiness?: number | null;
    location?: { name: string } | null;
    held_item?: { name: string } | null;
    time_of_day?: string;
    gender?: number | null;
    known_move?: { name: string } | null;
    min_affection?: number | null;
    needs_overworld_rain?: boolean;
    party_species?: { name: string } | null;
    trade_species?: { name: string } | null;
    min_beauty?: number | null;
    relative_physical_stats?: number | null;
  }>;
  evolves_to?: EvolutionChainNode[];
}

// Parse evolution chain into a usable structure
  const parseEvolutionChain = (_chain: EvolutionChainNode, isShiny: boolean): EvolutionNode[][] => {
    const stages: EvolutionNode[][] = [];
    
    // For regional variants, we need to filter the evolution path
    const currentFormPrefix = isRegionalVariant ? pokemon.name.split('-')[1] : null;
    
    const parseNode = (node: EvolutionChainNode, stageIndex: number = 0, _followPath: boolean = true) => {
      if (!node || !node.species) return;
      
      if (!stages[stageIndex]) {
        stages[stageIndex] = [];
      }
      
      try {
        // Extract Pokemon ID from URL
        const urlParts = node.species.url.split('/');
        const pokemonId = parseInt(urlParts[urlParts.length - 2]);
        
        if (!isNaN(pokemonId)) {
          // Extract evolution details
          const evolutionDetails = node.evolution_details?.map((detail) => ({
            trigger: detail.trigger?.name || '',
            minLevel: detail.min_level ?? undefined,
            item: detail.item?.name ?? undefined,
            minHappiness: detail.min_happiness ?? undefined,
            location: detail.location?.name ?? undefined,
            heldItem: detail.held_item?.name ?? undefined,
            timeOfDay: detail.time_of_day || undefined,
            gender: detail.gender ?? undefined,
            knownMove: detail.known_move?.name ?? undefined,
            minAffection: detail.min_affection ?? undefined,
            needsOverworldRain: detail.needs_overworld_rain || false,
            partySpecies: detail.party_species?.name ?? undefined,
            tradeSpecies: detail.trade_species?.name ?? undefined,
            minBeauty: detail.min_beauty ?? undefined,
            relativePhysicalStats: detail.relative_physical_stats ?? undefined
          })) || [];
          
          stages[stageIndex].push({
            id: pokemonId,
            name: node.species.name,
            sprite: isShiny 
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`
              : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
            evolutionDetails
          });
        }
      } catch (err) {
        logger.error('Error parsing evolution node:', err);
      }
      
      // Process evolutions
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((evolution) => {
          parseNode(evolution, stageIndex + 1);
        });
      }
    };
    
    if (evolutionChain?.chain) {
      parseNode(evolutionChain.chain);
    }
    
    return stages;
  };
  
  // Create custom evolution chain for regional variants
  const getEvolutionStages = () => {
    // Check if this Pokemon has a regional evolution
    if (hasRegionalEvolution(pokemon.name)) {
      const regionalEvos = getRegionalEvolution(pokemon.name);
      if (regionalEvos) {
        // Create a custom evolution chain
        const customStages: EvolutionNode[][] = [[]];
        
        // Add current Pokemon
        customStages[0].push({
          id: Number(pokemon.id),
          name: pokemon.name,
          sprite: showShiny 
            ? pokemon.sprites?.other?.['official-artwork']?.front_shiny || ''
            : pokemon.sprites?.other?.['official-artwork']?.front_default || '',
          evolutionDetails: []
        });
        
        // Add evolutions
        if (regionalEvos.length > 0) {
          customStages[1] = [];
          for (const evo of regionalEvos) {
            // Extract ID from the evolution name
            // This is a simplification - in production you'd fetch the Pokemon data
            const evoId = getEvolutionPokemonId(evo.to);
            
            const evolutionDetail: {
              trigger: string;
              minLevel?: number;
              item?: string;
            } = {
              trigger: evo.method === 'use-item' ? 'use-item' : 'level-up',
              minLevel: evo.level,
              item: evo.item
            };
            
            customStages[1].push({
              id: evoId,
              name: evo.to,
              sprite: showShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${evoId}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`,
              evolutionDetails: [evolutionDetail]
            });
          }
        }
        
        return customStages;
      }
    }
    
    // Check if this is a regional evolution (evolved from regional form)
    if (isRegionalEvolution(pokemon.name)) {
      // For Pokemon like Perrserker, we need to show Galarian Meowth -> Perrserker
      const preEvolution = getPreEvolutionForRegional(pokemon.name);
      if (preEvolution) {
        const customStages: EvolutionNode[][] = [[]];
        
        // Add pre-evolution
        const preEvoId = getEvolutionPokemonId(preEvolution.from);
        customStages[0].push({
          id: preEvoId,
          name: preEvolution.from,
          sprite: showShiny
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${preEvoId}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${preEvoId}.png`,
          evolutionDetails: []
        });
        
        // Add current Pokemon
        customStages[1] = [{
          id: Number(pokemon.id),
          name: pokemon.name,
          sprite: showShiny 
            ? pokemon.sprites?.other?.['official-artwork']?.front_shiny || ''
            : pokemon.sprites?.other?.['official-artwork']?.front_default || '',
          evolutionDetails: [{
            trigger: preEvolution.method === 'use-item' ? 'use-item' : 'level-up',
            minLevel: preEvolution.level || undefined,
            item: preEvolution.item || undefined
          }]
        }];
        
        return customStages;
      }
    }
    
    // Use standard evolution chain
    return evolutionChain ? parseEvolutionChain(evolutionChain.chain, showShiny) : [];
  };
  
  const evolutionStages = getEvolutionStages();
  
  if (!evolutionChain || evolutionStages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container 
          variant="default" 
          className="backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl"
         
        >
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-stone-500/20 to-stone-600/10 flex items-center justify-center mx-auto">
              <FaDna className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500 dark:text-stone-300">
              No evolution data available for this Pokémon.
            </p>
          </div>
        </Container>
      </motion.div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Evolution Chain Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container 
          variant="default" 
          className="backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl"
         
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center flex-shrink-0">
                  <FaDna className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-300">
                    Evolution Chain
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-300">
                    This Pokémon's evolutionary line
                  </p>
                </div>
              </div>
          
          {/* Shiny Toggle */}
          <button
            onClick={() => setShowShiny(!showShiny)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
              "transform hover:scale-[1.02] active:scale-[0.98]",
              showShiny 
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30" 
                : "bg-white/10 text-stone-400 border border-white/20 hover:bg-white/20"
            )}
            style={{ 
              transform: 'translate3d(0,0,0)',
              WebkitTransform: 'translate3d(0,0,0)'
            }}
          >
            <FiStar className={cn("w-4 h-4", showShiny && "drop-shadow-glow")} />
            <span className="text-sm font-medium">Shiny</span>
          </button>
            </div>
          </div>
        </Container>
      </motion.div>
      
      {/* Evolution Chain Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Container 
          variant="default" 
          className="backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl"
         
        >
          <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:block">
            <div className="flex items-center justify-center">
              {evolutionStages.map((stage, stageIndex) => (
                <React.Fragment key={stageIndex}>
                  {stageIndex > 0 && (
                    <EvolutionArrow 
                      horizontal 
                      evolutionDetails={stage[0]?.evolutionDetails}
                    />
                  )}
                  
                  {/* Stage with multiple Pokemon (branched evolution) */}
                  {stage.length > 1 ? (
                    <div className="flex flex-col gap-4">
                      {stage.map((node) => (
                        <div key={node.id}>
                          <EvolutionCard 
                            node={node} 
                            isCurrent={node.name === pokemon.name}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <EvolutionCard 
                        node={stage[0]} 
                        isCurrent={stage[0].name === pokemon.name}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Mobile: Vertical Layout */}
          <div className="md:hidden">
            <div className="flex flex-col items-center">
              {evolutionStages.map((stage, stageIndex) => (
                <React.Fragment key={stageIndex}>
                  {stageIndex > 0 && (
                    <EvolutionArrow 
                      horizontal={false} 
                      evolutionDetails={stage[0]?.evolutionDetails}
                    />
                  )}
                  
                  {/* Stage with multiple Pokemon (branched evolution) */}
                  {stage.length > 1 ? (
                    <div className="flex gap-4">
                      {stage.map((node) => (
                        <div key={node.id}>
                          <EvolutionCard 
                            node={node} 
                            isCurrent={node.name === pokemon.name}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <EvolutionCard 
                        node={stage[0]} 
                        isCurrent={stage[0].name === pokemon.name}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
            </div>
          </div>
        </Container>
      </motion.div>
      
      {/* Evolution Details */}
      {evolutionStages.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Container 
            variant="default" 
            className="backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl"
           
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-300">
                  Evolution Methods
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                  className="group"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <div className="bg-white dark:bg-stone-900/50 rounded-xl p-4 backdrop-blur-md border border-stone-200 dark:border-stone-700 shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FiRefreshCw className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-sm">Evolution Requirements</span>
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-300">
                      {(() => {
                        const allMethods = evolutionStages.flatMap(stage => 
                          stage.flatMap(node => node.evolutionDetails || [])
                        );
                        const uniqueMethods = new Set<string>();
                        
                        allMethods.forEach(detail => {
                          if (detail.minLevel) uniqueMethods.add('Level up');
                          if (detail.item) uniqueMethods.add('Evolution item');
                          if (detail.trigger === 'trade') uniqueMethods.add('Trade');
                          if (detail.minHappiness) uniqueMethods.add('High friendship');
                          if (detail.location) uniqueMethods.add('Specific location');
                          if (detail.timeOfDay) uniqueMethods.add('Time of day');
                        });
                        
                        return Array.from(uniqueMethods).join(' • ') || 'Various methods';
                      })()}
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="group"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <div className="bg-white dark:bg-stone-900/50 rounded-xl p-4 backdrop-blur-md border border-stone-200 dark:border-stone-700 shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <GiStoneSphere className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-sm">Special Items</span>
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-300">
                      {(() => {
                        const allItems = evolutionStages.flatMap(stage => 
                          stage.flatMap(node => 
                            node.evolutionDetails?.filter(d => d.item || d.heldItem)
                              .map(d => d.item || d.heldItem) || []
                          )
                        ).filter(Boolean);
                        
                        const uniqueItems = Array.from(new Set(allItems));
                        
                        if (uniqueItems.length === 0) {
                          return 'No special items required';
                        }
                        
                        return uniqueItems.map(item => formatItemName(item!)).join(' • ');
                      })()}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </Container>
        </motion.div>
      )}
      
      {/* Mega Evolution Section */}
      {species?.varieties?.some(v => v.pokemon.name.includes('mega')) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Container 
            variant="default" 
            className="backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl"
           
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-300">
                  Mega Evolution
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6">
                {/* Base Pokemon */}
                <div>
                  <EvolutionCard 
                    node={{
                      id: species.id,
                      name: species.name,
                      sprite: !pokemon.name.includes('mega') 
                        ? pokemon.sprites?.other?.['official-artwork']?.front_default || ''
                        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${species.id}.png`,
                      types: pokemon.types?.map(t => t.type.name)
                    }} 
                    isCurrent={!pokemon.name.includes('mega')}
                  />
                </div>
                
                {/* Mega Arrow */}
                <motion.div 
                  className="flex items-center justify-center mx-4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-3 shadow-lg">
                    <FaGem className="w-5 h-5" />
                  </div>
                </motion.div>
                
                {/* Mega Evolutions */}
                <div className="flex flex-col gap-4">
                  {species.varieties
                    .filter(v => v.pokemon.name.includes('mega'))
                    .map(variety => {
                      const megaId = variety.pokemon.url.split('/').filter(Boolean).pop() || '';
                      return (
                        <Link key={variety.pokemon.name} href={`/pokedex/${species.id}?form=${variety.pokemon.name.replace(`${species.name}-`, '')}`}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className={cn(
                              "relative cursor-pointer rounded-xl",
                              pokemon.name === variety.pokemon.name && "ring-2 ring-amber-500/50"
                            )}
                          >
                            <Container 
                              variant="default" 
                             
                              className={cn(
                                "p-4 text-center border transition-all duration-200 hover:border-amber-500/30",
                                pokemon.name === variety.pokemon.name ? "border-amber-500/50 bg-amber-500/10" : "border-stone-700/50"
                              )}
                            >
                              {pokemon.name === variety.pokemon.name && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-600 to-pink-600 text-white">
                                    CURRENT
                                  </span>
                                </div>
                              )}
                              
                              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3">
                                {megaFormData[variety.pokemon.name]?.sprites?.other?.['official-artwork']?.front_default ? (
                                  <Image
                                    src={megaFormData[variety.pokemon.name]?.sprites?.other?.['official-artwork']?.front_default || '/dextrendslogo.png'}
                                    alt={variety.pokemon.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 640px) 96px, 128px"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="font-bold capitalize text-base sm:text-lg mb-2">
                                {variety.pokemon.name.includes('mega-x') ? 'Mega X' : 
                                 variety.pokemon.name.includes('mega-y') ? 'Mega Y' : 'Mega'}
                              </h3>
                              
                              <p className="text-xs sm:text-sm text-amber-400">Mega Stone Required</p>
                            </Container>
                          </motion.div>
                        </Link>
                      );
                    })}
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">
                <p>Mega Evolution is a temporary transformation that requires a Mega Stone and a strong bond with the trainer.</p>
              </div>
            </div>
          </Container>
        </motion.div>
      )}
      
      {/* Gigantamax Section */}
      {species?.varieties?.some(v => v.pokemon.name.includes('gmax')) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Container 
            variant="default" 
            className="backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl"
           
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-300">
                  Gigantamax Form
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6">
                {/* Base Pokemon */}
                <div>
                  <EvolutionCard 
                    node={{
                      id: species.id,
                      name: species.name,
                      sprite: !pokemon.name.includes('gmax') 
                        ? pokemon.sprites?.other?.['official-artwork']?.front_default || ''
                        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${species.id}.png`,
                      types: pokemon.types?.map(t => t.type.name)
                    }} 
                    isCurrent={!pokemon.name.includes('gmax')}
                  />
                </div>
                
                {/* Gigantamax Arrow */}
                <motion.div 
                  className="flex items-center justify-center mx-4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full p-3 shadow-lg">
                    <FiStar className="w-5 h-5" />
                  </div>
                </motion.div>
                
                {/* Gigantamax Form */}
                <div className="flex flex-col gap-4">
                  {species.varieties
                    .filter(v => v.pokemon.name.includes('gmax'))
                    .map(variety => (
                      <Link key={variety.pokemon.name} href={`/pokedex/${species.id}?form=${variety.pokemon.name.replace(`${species.name}-`, '')}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className={cn(
                            "relative cursor-pointer rounded-xl",
                            pokemon.name === variety.pokemon.name && "ring-2 ring-red-500/50"
                          )}
                        >
                          <Container 
                            variant="default" 
                           
                            className={cn(
                              "p-4 text-center border transition-all duration-200 hover:border-red-500/30",
                              pokemon.name === variety.pokemon.name ? "border-red-500/50 bg-red-500/10" : "border-stone-700/50"
                            )}
                          >
                            {pokemon.name === variety.pokemon.name && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white">
                                  CURRENT
                                </span>
                              </div>
                            )}
                            
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3">
                              {megaFormData[variety.pokemon.name]?.sprites?.other?.['official-artwork']?.front_default ? (
                                <Image
                                  src={megaFormData[variety.pokemon.name]?.sprites?.other?.['official-artwork']?.front_default || '/dextrendslogo.png'}
                                  alt={variety.pokemon.name}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 640px) 96px, 128px"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                </div>
                              )}
                            </div>
                            
                            <h3 className="font-bold capitalize text-base sm:text-lg mb-2">
                              Gigantamax
                            </h3>
                            
                            <p className="text-xs sm:text-sm text-red-400">Max Soup Required</p>
                          </Container>
                        </motion.div>
                      </Link>
                    ))}
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">
                <p>Gigantamax is a phenomenon that makes Pokemon giant with a special appearance. It requires a Pokemon with the Gigantamax Factor.</p>
              </div>
            </div>
          </Container>
        </motion.div>
      )}
    </div>
  );
};

export default EvolutionTabV3;