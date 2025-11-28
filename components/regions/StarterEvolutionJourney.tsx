import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '@/utils/logger';
import { 
  BsArrowRight,
  BsChevronRight,
  BsLightningFill,
  BsShieldFill,
  BsSpeedometer2,
  BsHeart,
  BsStar,
  BsGraphUp
} from 'react-icons/bs';
import { GiSwordWound, GiShield, GiRunningNinja } from 'react-icons/gi';
import { FaFire, FaLeaf, FaTint } from 'react-icons/fa';

interface StarterEvolutionJourneyProps {
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
  signatureMoves?: string[];
  sprite: string;
}

interface EvolutionChain {
  stage1: PokemonEvolution;
  stage2?: PokemonEvolution;
  stage3?: PokemonEvolution;
}

const StarterEvolutionJourney: React.FC<StarterEvolutionJourneyProps> = ({ 
  region, 
  starters, 
  starterIds,
  theme 
}) => {
  const [selectedStarter, setSelectedStarter] = useState<number>(0);
  const [evolutionData, setEvolutionData] = useState<EvolutionChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  // Fetch evolution data for all starters
  useEffect(() => {
    const fetchEvolutionData = async () => {
      try {
        const chains: EvolutionChain[] = [];
        
        for (const starterId of starterIds) {
          // Fetch species data to get evolution chain
          const speciesData: any = await fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${starterId}`);
          const evolutionChainUrl = speciesData.evolution_chain.url;
          const evolutionData: any = await fetchJSON(evolutionChainUrl);
          
          // Process evolution chain
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
      case 'fire': return <FaFire className="text-orange-500" />;
      case 'water': return <FaTint className="text-amber-500" />;
      case 'grass': return <FaLeaf className="text-green-500" />;
      default: return null;
    }
  };

  const getTypeGradient = (types: string[]) => {
    const type = types[0];
    switch(type) {
      case 'fire': return 'from-orange-400 to-red-600';
      case 'water': return 'from-amber-400 to-cyan-600';
      case 'grass': return 'from-green-400 to-emerald-600';
      default: return 'from-stone-400 to-stone-600';
    }
  };

  const calculateStatPercentage = (stat: number) => {
    const maxStat = 255; // Max possible base stat
    return (stat / maxStat) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">Loading evolution journey...</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-pink-500 to-amber-500 animate-pulse" />
      </div>

      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/90 via-amber-50/70 to-white/80 dark:from-stone-800/90 dark:via-amber-900/30 dark:to-stone-900/80 rounded-3xl shadow-2xl border border-white/30 dark:border-stone-700/30 p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-pink-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Evolution Journey
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Choose your starter and explore their growth potential
          </p>
        </div>

        {/* Starter Selection */}
        <div className="flex justify-center gap-4 mb-12">
          {starters.map((starter, index) => (
            <motion.button
              key={starter}
              onClick={() => setSelectedStarter(index)}
              className={`relative p-4 rounded-2xl transition-all duration-300 ${
                selectedStarter === index
                  ? 'bg-gradient-to-br from-amber-500/20 to-pink-500/20 border-2 border-amber-500'
                  : 'bg-white/50 dark:bg-stone-800/50 border border-stone-300/50 dark:border-stone-700/50 hover:border-amber-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 relative">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${starterIds[index]}.png`}
                  alt={starter}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-2 text-sm font-semibold capitalize text-stone-800 dark:text-white">
                {starter}
              </p>
              {selectedStarter === index && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Evolution Path */}
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            {/* Stage 1 */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EvolutionStage
                pokemon={currentChain.stage1}
                stage={1}
                isHovered={hoveredStage === 1}
                onHover={() => setHoveredStage(1)}
                onLeave={() => setHoveredStage(null)}
                theme={theme}
              />
            </motion.div>

            {/* Evolution Arrow 1 */}
            {currentChain.stage2 && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-xs text-stone-600 dark:text-stone-400 mb-2">
                  Lv. {currentChain.stage2.evolutionLevel}
                </div>
                <div className="relative">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <BsArrowRight className="text-3xl text-amber-500" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Stage 2 */}
            {currentChain.stage2 && (
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <EvolutionStage
                  pokemon={currentChain.stage2}
                  stage={2}
                  isHovered={hoveredStage === 2}
                  onHover={() => setHoveredStage(2)}
                  onLeave={() => setHoveredStage(null)}
                  theme={theme}
                />
              </motion.div>
            )}

            {/* Evolution Arrow 2 */}
            {currentChain.stage3 && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-xs text-stone-600 dark:text-stone-400 mb-2">
                  Lv. {currentChain.stage3.evolutionLevel}
                </div>
                <div className="relative">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  >
                    <BsArrowRight className="text-3xl text-amber-500" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Stage 3 */}
            {currentChain.stage3 && (
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <EvolutionStage
                  pokemon={currentChain.stage3}
                  stage={3}
                  isHovered={hoveredStage === 3}
                  onHover={() => setHoveredStage(3)}
                  onLeave={() => setHoveredStage(null)}
                  theme={theme}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats Comparison */}
        <motion.div
          className="mt-12 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-amber-100/50 via-pink-100/50 to-amber-100/50 dark:from-amber-900/20 dark:via-pink-900/20 dark:to-amber-900/20 border border-amber-200/30 dark:border-amber-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
            <BsGraphUp className="text-amber-500" />
            Evolution Stats Progression
          </h3>
          
          <div className="space-y-3">
            {['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed'].map((statName, index) => {
              const statKey = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'][index];
              return (
                <div key={statName} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-stone-700 dark:text-stone-300">
                    {statName}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {/* Stage 1 bar */}
                    <div className="flex-1 relative">
                      <div className="h-6 bg-stone-200/50 dark:bg-stone-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-end pr-2"
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateStatPercentage(currentChain.stage1.stats[statKey as keyof typeof currentChain.stage1.stats] as number)}%` }}
                          transition={{ duration: 1, delay: 0.1 * index }}
                        >
                          <span className="text-xs text-white font-bold">
                            {currentChain.stage1.stats[statKey as keyof typeof currentChain.stage1.stats]}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                    
                    {currentChain.stage2 && (
                      <>
                        <BsChevronRight className="text-stone-400" />
                        <div className="flex-1 relative">
                          <div className="h-6 bg-stone-200/50 dark:bg-stone-700/50 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-end pr-2"
                              initial={{ width: 0 }}
                              animate={{ width: `${calculateStatPercentage(currentChain.stage2.stats[statKey as keyof typeof currentChain.stage2.stats] as number)}%` }}
                              transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                            >
                              <span className="text-xs text-white font-bold">
                                {currentChain.stage2.stats[statKey as keyof typeof currentChain.stage2.stats]}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {currentChain.stage3 && (
                      <>
                        <BsChevronRight className="text-stone-400" />
                        <div className="flex-1 relative">
                          <div className="h-6 bg-stone-200/50 dark:bg-stone-700/50 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-end pr-2"
                              initial={{ width: 0 }}
                              animate={{ width: `${calculateStatPercentage(currentChain.stage3.stats[statKey as keyof typeof currentChain.stage3.stats] as number)}%` }}
                              transition={{ duration: 1, delay: 0.4 + 0.1 * index }}
                            >
                              <span className="text-xs text-white font-bold">
                                {currentChain.stage3.stats[statKey as keyof typeof currentChain.stage3.stats]}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total Stats */}
          <div className="mt-4 pt-4 border-t border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Total Base Stats</span>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  {currentChain.stage1.stats.total}
                </span>
                {currentChain.stage2 && (
                  <>
                    <BsArrowRight className="text-stone-400" />
                    <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-700 dark:text-pink-300 font-bold">
                      {currentChain.stage2.stats.total}
                    </span>
                  </>
                )}
                {currentChain.stage3 && (
                  <>
                    <BsArrowRight className="text-stone-400" />
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                      {currentChain.stage3.stats.total}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Individual Evolution Stage Component
const EvolutionStage: React.FC<{
  pokemon: PokemonEvolution;
  stage: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  theme: 'light' | 'dark';
}> = ({ pokemon, stage, isHovered, onHover, onLeave, theme }) => {
  const getTypeGradient = (types: string[]) => {
    const type = types[0];
    switch(type) {
      case 'fire': return 'from-orange-400 to-red-600';
      case 'water': return 'from-amber-400 to-cyan-600';
      case 'grass': return 'from-green-400 to-emerald-600';
      case 'poison': return 'from-amber-500 to-amber-700';
      case 'flying': return 'from-amber-300 to-amber-400';
      case 'psychic': return 'from-pink-400 to-amber-500';
      case 'fighting': return 'from-red-600 to-red-800';
      case 'dark': return 'from-stone-700 to-stone-900';
      case 'steel': return 'from-stone-400 to-stone-600';
      case 'fairy': return 'from-pink-300 to-pink-500';
      case 'dragon': return 'from-amber-600 to-purple-800';
      case 'ground': return 'from-yellow-600 to-orange-700';
      case 'rock': return 'from-yellow-700 to-yellow-900';
      case 'bug': return 'from-green-500 to-green-700';
      case 'ghost': return 'from-amber-600 to-amber-900';
      case 'electric': return 'from-yellow-300 to-yellow-500';
      case 'normal': return 'from-stone-400 to-stone-600';
      case 'ice': return 'from-cyan-300 to-amber-400';
      default: return 'from-stone-400 to-stone-600';
    }
  };

  return (
    <Link href={`/pokedex/${pokemon.id}`}>
      <motion.div
        className="relative cursor-pointer"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        whileHover={{ scale: 1.05, y: -10 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/80 via-amber-50/60 to-white/70 dark:from-stone-800/80 dark:via-amber-900/30 dark:to-stone-900/70 shadow-xl border border-white/30 dark:border-stone-700/30">
          {/* Stage Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className={`px-3 py-1 rounded-full backdrop-blur-md ${
              stage === 1 ? 'bg-amber-500/80' : 
              stage === 2 ? 'bg-pink-500/80' : 
              'bg-amber-500/80'
            } text-white text-xs font-bold shadow-lg`}>
              Stage {stage}
            </div>
          </div>

          {/* Pokemon Number */}
          <div className="absolute top-4 right-4 z-10">
            <div className="px-3 py-1 rounded-full backdrop-blur-md bg-black/20 dark:bg-white/20 text-white dark:text-stone-200 text-sm font-bold shadow-lg">
              #{pokemon.id}
            </div>
          </div>

          {/* Pokemon Image */}
          <div className="relative pt-16 pb-4">
            <motion.div 
              className="relative w-32 h-32 mx-auto"
              animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(pokemon.types)} rounded-full blur-2xl opacity-30`} />
              <Image
                src={pokemon.sprite}
                alt={pokemon.name}
                fill
                className="object-contain drop-shadow-2xl relative z-10"
              />
            </motion.div>
          </div>

          {/* Info Panel */}
          <div className="p-5 pt-2">
            <h3 className="text-xl font-bold text-center text-stone-800 dark:text-white mb-2 capitalize">
              {pokemon.name}
            </h3>
            
            {/* Type Pills */}
            <div className="flex justify-center gap-2 mb-3">
              {pokemon.types.map((type) => (
                <span 
                  key={type}
                  className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-gradient-to-r ${
                    getTypeGradient([type])
                  } text-white shadow-md`}
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Key Stats Preview */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/50 dark:bg-stone-800/50">
                <GiSwordWound className="text-red-500 mx-auto mb-1" />
                <div className="text-xs text-stone-600 dark:text-stone-400">ATK</div>
                <div className="text-sm font-bold text-stone-800 dark:text-white">{pokemon.stats.attack}</div>
              </div>
              <div className="p-2 rounded-lg bg-white/50 dark:bg-stone-800/50">
                <GiShield className="text-amber-500 mx-auto mb-1" />
                <div className="text-xs text-stone-600 dark:text-stone-400">DEF</div>
                <div className="text-sm font-bold text-stone-800 dark:text-white">{pokemon.stats.defense}</div>
              </div>
              <div className="p-2 rounded-lg bg-white/50 dark:bg-stone-800/50">
                <GiRunningNinja className="text-green-500 mx-auto mb-1" />
                <div className="text-xs text-stone-600 dark:text-stone-400">SPD</div>
                <div className="text-sm font-bold text-stone-800 dark:text-white">{pokemon.stats.speed}</div>
              </div>
            </div>

            {/* Abilities */}
            <div className="mt-3 pt-3 border-t border-stone-200/30 dark:border-stone-700/30">
              <div className="text-xs text-stone-600 dark:text-stone-400 mb-1">Abilities</div>
              <div className="flex flex-wrap gap-1">
                {pokemon.abilities.slice(0, 2).map((ability) => (
                  <span key={ability} className="text-xs px-2 py-1 rounded-full bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 capitalize">
                    {ability.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hover Effect */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-amber-600/20 to-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Link>
  );
};

export default StarterEvolutionJourney;