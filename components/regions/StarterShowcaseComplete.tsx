import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '@/utils/logger';
import {
  BsChevronRight,
  BsLightningFill,
  BsShieldFill,
  BsHeart,
  BsStar,
  BsGraphUp,
  BsArrowRight,
  BsCheckCircleFill
} from 'react-icons/bs';
import {
  GiSwordWound,
  GiShield,
  GiRunningNinja,
  GiFlame,
  GiWaterDrop,
  GiTreeBranch
} from 'react-icons/gi';
import { FaFire, FaLeaf, FaTint } from 'react-icons/fa';
import {
  GLASS_BLUR,
  GLASS_OPACITY,
  GLASS_BORDER,
  GLASS_SHADOW,
  GLASS_ROUNDED,
  TYPE_GRADIENTS,
  createGlassStyle
} from '../ui/design-system/glass-constants';

interface StarterShowcaseCompleteProps {
  region: string;
  starters: string[];
  starterIds: number[];
  theme: 'light' | 'dark';
}

interface PokemonEvolution {
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
    total: number;
  };
  evolutionLevel?: number;
  evolutionMethod?: string;
  abilities: string[];
  sprite: string;
}

interface EvolutionChain {
  stage1: PokemonEvolution;
  stage2?: PokemonEvolution;
  stage3?: PokemonEvolution;
}

const StarterShowcaseComplete: React.FC<StarterShowcaseCompleteProps> = ({ 
  region, 
  starters, 
  starterIds,
  theme 
}) => {
  const [selectedStarter, setSelectedStarter] = useState<number>(0);
  const [evolutionData, setEvolutionData] = useState<EvolutionChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredEvolution, setHoveredEvolution] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Fetch evolution data for all starters
  useEffect(() => {
    const fetchEvolutionData = async () => {
      try {
        const chains: EvolutionChain[] = [];
        
        for (const starterId of starterIds) {
          const speciesData: any = await fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${starterId}`);
          const evolutionChainUrl = speciesData.evolution_chain.url;
          const evolutionData: any = await fetchJSON(evolutionChainUrl);
          
          const chain: EvolutionChain = {} as EvolutionChain;
          
          // Stage 1
          const stage1Data: any = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${evolutionData.chain.species.name}`);
          chain.stage1 = {
            id: stage1Data.id,
            name: stage1Data.name,
            types: stage1Data.types.map((t: any) => t.type.name),
            stats: {
              hp: stage1Data.stats[0].base_stat,
              attack: stage1Data.stats[1].base_stat,
              defense: stage1Data.stats[2].base_stat,
              spAttack: stage1Data.stats[3].base_stat,
              spDefense: stage1Data.stats[4].base_stat,
              speed: stage1Data.stats[5].base_stat,
              total: stage1Data.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
            },
            abilities: stage1Data.abilities.map((a: any) => a.ability.name),
            sprite: stage1Data.sprites.other['official-artwork'].front_default
          };
          
          // Stage 2
          if (evolutionData.chain.evolves_to.length > 0) {
            const stage2Evolution = evolutionData.chain.evolves_to[0];
            const stage2Data: any = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${stage2Evolution.species.name}`);
            chain.stage2 = {
              id: stage2Data.id,
              name: stage2Data.name,
              types: stage2Data.types.map((t: any) => t.type.name),
              stats: {
                hp: stage2Data.stats[0].base_stat,
                attack: stage2Data.stats[1].base_stat,
                defense: stage2Data.stats[2].base_stat,
                spAttack: stage2Data.stats[3].base_stat,
                spDefense: stage2Data.stats[4].base_stat,
                speed: stage2Data.stats[5].base_stat,
                total: stage2Data.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
              },
              evolutionLevel: stage2Evolution.evolution_details[0]?.min_level || 16,
              evolutionMethod: stage2Evolution.evolution_details[0]?.trigger?.name || 'level-up',
              abilities: stage2Data.abilities.map((a: any) => a.ability.name),
              sprite: stage2Data.sprites.other['official-artwork'].front_default
            };
            
            // Stage 3
            if (stage2Evolution.evolves_to.length > 0) {
              const stage3Evolution = stage2Evolution.evolves_to[0];
              const stage3Data: any = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${stage3Evolution.species.name}`);
              chain.stage3 = {
                id: stage3Data.id,
                name: stage3Data.name,
                types: stage3Data.types.map((t: any) => t.type.name),
                stats: {
                  hp: stage3Data.stats[0].base_stat,
                  attack: stage3Data.stats[1].base_stat,
                  defense: stage3Data.stats[2].base_stat,
                  spAttack: stage3Data.stats[3].base_stat,
                  spDefense: stage3Data.stats[4].base_stat,
                  speed: stage3Data.stats[5].base_stat,
                  total: stage3Data.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
                },
                evolutionLevel: stage3Evolution.evolution_details[0]?.min_level || 36,
                evolutionMethod: stage3Evolution.evolution_details[0]?.trigger?.name || 'level-up',
                abilities: stage3Data.abilities.map((a: any) => a.ability.name),
                sprite: stage3Data.sprites.other['official-artwork'].front_default
              };
            }
          }
          
          chains.push(chain);
        }
        
        setEvolutionData(chains);
        setLoading(false);
      } catch (error) {
        logger.error('Failed to fetch evolution data', { error });
        setLoading(false);
      }
    };
    
    fetchEvolutionData();
  }, [starterIds]);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'fire': return <GiFlame className="text-orange-500" />;
      case 'water': return <GiWaterDrop className="text-blue-500" />;
      case 'grass': return <GiTreeBranch className="text-green-500" />;
      default: return null;
    }
  };

  const getTypeGradient = (types: string[]) => {
    const type = types[0];
    return TYPE_GRADIENTS[type as keyof typeof TYPE_GRADIENTS] || 'from-stone-400 to-stone-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">Loading starter Pokemon...</p>
        </div>
      </div>
    );
  }

  const currentChain = evolutionData[selectedStarter];
  if (!currentChain) return null;

  return (
    <div className="relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-500 to-amber-500 animate-pulse" />
      </div>

      <div className={createGlassStyle({ 
        blur: 'xl', 
        opacity: 'strong', 
        gradient: true, 
        rounded: 'xl',
        shadow: 'xl'
      })} style={{ padding: '1rem' }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-amber-600 to-amber-600 bg-clip-text text-transparent mb-3">
            Choose Your Partner
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Select your starter and explore their evolution journey
          </p>
        </div>

        {/* Starter Selection Cards */}
        <div className="grid grid-cols-1 min-420:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 min-420:gap-4 md:gap-6 mb-10">
          {starters.map((starter, index) => {
            const chain = evolutionData[index];
            const isSelected = selectedStarter === index;
            const gradient = getTypeGradient(chain.stage1.types);
            
            return (
              <motion.button
                key={starter}
                onClick={() => setSelectedStarter(index)}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  isSelected
                    ? 'ring-4 ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-stone-900'
                    : ''
                }`}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))'
                    : '',
                  backdropFilter: 'blur(16px)',
                  backgroundColor: isSelected 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute -top-2 -right-2 z-10"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <BsCheckCircleFill className="text-white text-lg" />
                    </div>
                  </motion.div>
                )}

                {/* Type Icon */}
                <div className="absolute top-4 left-4 text-2xl">
                  {getTypeIcon(chain.stage1.types[0])}
                </div>

                {/* Pokemon Image */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-30`} />
                  <Image
                    src={chain.stage1.sprite}
                    alt={starter}
                    fill
                    className="object-contain drop-shadow-xl relative z-10"
                  />
                </div>

                {/* Pokemon Info */}
                <h3 className="text-base sm:text-lg md:text-xl font-bold capitalize text-stone-800 dark:text-white mb-2">
                  {starter}
                </h3>
                
                {/* Type Badges */}
                <div className="flex justify-center gap-2 mb-3">
                  {chain.stage1.types.map((type) => (
                    <span 
                      key={type}
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                        getTypeGradient([type])
                      } text-white shadow-md`}
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {/* Evolution Preview */}
                <div className="flex items-center justify-center gap-1 mt-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                    <Image
                      src={chain.stage1.sprite}
                      alt="Stage 1"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  {chain.stage2 && (
                    <>
                      <BsChevronRight className="text-stone-400 text-xs" />
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                        <Image
                          src={chain.stage2.sprite}
                          alt="Stage 2"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    </>
                  )}
                  {chain.stage3 && (
                    <>
                      <BsChevronRight className="text-stone-400 text-xs" />
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                        <Image
                          src={chain.stage3.sprite}
                          alt="Stage 3"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    </>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Evolution Journey Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStarter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Evolution Path Header */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">
                Evolution Journey
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                Watch your {starters[selectedStarter]} grow stronger through each evolution
              </p>
            </div>

            {/* Evolution Cards */}
            <div className="grid grid-cols-1 min-420:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 min-420:gap-4">
              {/* Stage 1 */}
              <EvolutionCard
                pokemon={currentChain.stage1}
                stage={1}
                isHovered={hoveredEvolution === 1}
                onHover={() => setHoveredEvolution(1)}
                onLeave={() => setHoveredEvolution(null)}
              />

              {/* Evolution Arrow */}
              {currentChain.stage2 && (
                <div className="hidden md:flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-stone-600 dark:text-stone-400 mb-2">
                      Level {currentChain.stage2.evolutionLevel}
                    </div>
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <BsArrowRight className="text-3xl text-amber-500 mx-auto" />
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Stage 2 */}
              {currentChain.stage2 && (
                <EvolutionCard
                  pokemon={currentChain.stage2}
                  stage={2}
                  isHovered={hoveredEvolution === 2}
                  onHover={() => setHoveredEvolution(2)}
                  onLeave={() => setHoveredEvolution(null)}
                />
              )}

              {/* Evolution Arrow */}
              {currentChain.stage3 && (
                <div className="hidden md:flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-stone-600 dark:text-stone-400 mb-2">
                      Level {currentChain.stage3.evolutionLevel}
                    </div>
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    >
                      <BsArrowRight className="text-3xl text-amber-500 mx-auto" />
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Stage 3 */}
              {currentChain.stage3 && (
                <EvolutionCard
                  pokemon={currentChain.stage3}
                  stage={3}
                  isHovered={hoveredEvolution === 3}
                  onHover={() => setHoveredEvolution(3)}
                  onLeave={() => setHoveredEvolution(null)}
                />
              )}
            </div>

            {/* Stats Comparison Toggle */}
            <div className="text-center">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <BsGraphUp />
                  <span>{showStats ? 'Hide' : 'Show'} Stats Progression</span>
                </div>
              </button>
            </div>

            {/* Stats Progression */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <StatsProgression chain={currentChain} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Evolution Card Component
const EvolutionCard: React.FC<{
  pokemon: PokemonEvolution;
  stage: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}> = ({ pokemon, stage, isHovered, onHover, onLeave }) => {
  const getTypeGradient = (types: string[]) => {
    const type = types[0];
    return TYPE_GRADIENTS[type as keyof typeof TYPE_GRADIENTS] || 'from-stone-400 to-stone-600';
  };

  return (
    <Link href={`/pokedex/${pokemon.id}`}>
      <motion.div
        className="relative cursor-pointer h-full"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className={createGlassStyle({ 
          blur: 'xl', 
          opacity: 'medium', 
          gradient: true, 
          rounded: 'xl',
          shadow: 'lg'
        })} style={{ height: '100%' }}>
          {/* Stage Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
              stage === 1 ? 'bg-amber-500' : 
              stage === 2 ? 'bg-pink-500' : 
              'bg-amber-500'
            } shadow-lg`}>
              Stage {stage}
            </div>
          </div>

          {/* Pokemon Number */}
          <div className="absolute top-3 right-3 z-10">
            <div className="px-2 py-1 rounded-full backdrop-blur-md bg-black/20 text-white text-xs font-bold">
              #{pokemon.id}
            </div>
          </div>

          {/* Pokemon Image */}
          <div className="pt-12 pb-4">
            <motion.div 
              className="relative w-28 h-28 mx-auto"
              animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(pokemon.types)} rounded-full blur-xl opacity-30`} />
              <Image
                src={pokemon.sprite}
                alt={pokemon.name}
                fill
                className="object-contain drop-shadow-xl relative z-10"
              />
            </motion.div>
          </div>

          {/* Info */}
          <div className="px-4 pb-4">
            <h4 className="text-lg font-bold text-center text-stone-800 dark:text-white mb-2 capitalize">
              {pokemon.name}
            </h4>
            
            {/* Types */}
            <div className="flex justify-center gap-2 mb-3">
              {pokemon.types.map((type) => (
                <span 
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                    getTypeGradient([type])
                  } text-white`}
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/50 dark:bg-stone-800/50 rounded-lg p-2">
                <GiSwordWound className="text-red-500 mx-auto mb-1 text-sm" />
                <div className="text-xs font-bold">{pokemon.stats.attack}</div>
              </div>
              <div className="bg-white/50 dark:bg-stone-800/50 rounded-lg p-2">
                <GiShield className="text-blue-500 mx-auto mb-1 text-sm" />
                <div className="text-xs font-bold">{pokemon.stats.defense}</div>
              </div>
              <div className="bg-white/50 dark:bg-stone-800/50 rounded-lg p-2">
                <GiRunningNinja className="text-green-500 mx-auto mb-1 text-sm" />
                <div className="text-xs font-bold">{pokemon.stats.speed}</div>
              </div>
            </div>

            {/* Total Stats */}
            <div className="mt-3 text-center">
              <span className="text-xs text-stone-600 dark:text-stone-400">Total: </span>
              <span className="text-sm font-bold text-stone-800 dark:text-white">{pokemon.stats.total}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// Stats Progression Component
const StatsProgression: React.FC<{ chain: EvolutionChain }> = ({ chain }) => {
  const stats = ['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed'];
  const statKeys = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const;
  
  const maxStat = 255;
  const getPercentage = (value: number) => (value / maxStat) * 100;

  return (
    <div className={createGlassStyle({ 
      blur: 'md', 
      opacity: 'subtle', 
      gradient: false, 
      rounded: 'xl',
      shadow: 'md'
    })} style={{ padding: '1.5rem' }}>
      <h4 className="text-lg font-bold text-stone-800 dark:text-white mb-4 text-center">
        Stats Progression Chart
      </h4>
      
      <div className="space-y-4">
        {stats.map((statName, index) => {
          const statKey = statKeys[index];
          const stage1Value = chain.stage1.stats[statKey];
          const stage2Value = chain.stage2?.stats[statKey];
          const stage3Value = chain.stage3?.stats[statKey];
          
          return (
            <div key={statName}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 w-24">
                  {statName}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{stage1Value}</span>
                  {stage2Value && (
                    <>
                      <BsChevronRight className="text-stone-400" />
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{stage2Value}</span>
                    </>
                  )}
                  {stage3Value && (
                    <>
                      <BsChevronRight className="text-stone-400" />
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{stage3Value}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Progress Bars */}
              <div className="relative h-6 bg-stone-200/50 dark:bg-stone-700/50 rounded-full overflow-hidden">
                {/* Stage 3 Bar (back) */}
                {stage3Value && (
                  <motion.div
                    className="absolute h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(stage3Value)}%` }}
                    transition={{ duration: 1, delay: 0.4 + index * 0.05 }}
                  />
                )}
                
                {/* Stage 2 Bar (middle) */}
                {stage2Value && (
                  <motion.div
                    className="absolute h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(stage2Value)}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
                  />
                )}
                
                {/* Stage 1 Bar (front) */}
                <motion.div
                  className="absolute h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-end pr-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${getPercentage(stage1Value)}%` }}
                  transition={{ duration: 1, delay: index * 0.05 }}
                >
                  <span className="text-xs text-white font-bold drop-shadow">
                    {stage1Value}
                  </span>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Total Stats Summary */}
      <div className="mt-6 pt-6 border-t border-stone-200/30 dark:border-stone-700/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Total Base Stats</span>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
              {chain.stage1.stats.total}
            </span>
            {chain.stage2 && (
              <>
                <BsArrowRight className="text-stone-400" />
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  {chain.stage2.stats.total}
                </span>
              </>
            )}
            {chain.stage3 && (
              <>
                <BsArrowRight className="text-stone-400" />
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  {chain.stage3.stats.total}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarterShowcaseComplete;