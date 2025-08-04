import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon, PokemonSpecies, EvolutionChain } from '../../../types/api/pokemon';
import { GlassContainer } from '../../ui/design-system';
import { TypeBadge } from '../../ui/TypeBadge';
import { cn } from '../../../utils/cn';
import { 
  FaArrowRight, FaArrowDown, FaStar, FaDna,
  FaExchangeAlt, FaLevelUpAlt, FaGem
} from 'react-icons/fa';
import { GiTwoCoins, GiStoneSphere } from 'react-icons/gi';
import { HiSparkles } from 'react-icons/hi';
import { fetchPokemon } from '../../../utils/apiutils';

interface EvolutionTabV3Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain: EvolutionChain | null;
  typeColors: Record<string, string>;
}

interface EvolutionNode {
  id: number;
  name: string;
  types?: string[];
  sprite?: string;
  level?: number;
  trigger?: string;
  item?: string;
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
        isCurrent && "ring-2 ring-blue-500/50"
      )}
      style={{ 
        transform: 'translate3d(0,0,0)',
        WebkitTransform: 'translate3d(0,0,0)',
        backfaceVisibility: 'visible',
        WebkitBackfaceVisibility: 'visible'
      }}
    >
      <GlassContainer 
        variant="dark" 
        animate={false}
        className={cn(
          "p-4 text-center border transition-all duration-200 hover:border-white/30",
          isCurrent ? "border-blue-500/50 bg-blue-500/10" : "border-gray-700/50",
          "hover:shadow-xl"
        )}
      >
        {/* Current Pokemon Badge */}
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
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
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">#{String(node.id).padStart(3, '0')}</p>
      </GlassContainer>
    </motion.div>
  </Link>
);

const EvolutionArrow = ({ horizontal = true }: { horizontal?: boolean }) => (
  <motion.div 
    className={cn(
      "flex items-center justify-center",
      horizontal ? "mx-4" : "my-4"
    )}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2 }}
  >
    <div className="text-gray-500 dark:text-gray-400">
      {horizontal ? (
        <FaArrowRight className="w-6 h-6" />
      ) : (
        <FaArrowDown className="w-6 h-6" />
      )}
    </div>
  </motion.div>
);

const EvolutionTabV3: React.FC<EvolutionTabV3Props> = ({
  pokemon,
  species,
  evolutionChain,
  typeColors
}) => {
  const [showShiny, setShowShiny] = useState(false);
  const [megaFormData, setMegaFormData] = useState<Record<string, Pokemon>>({});
  
  // Fetch mega form sprites
  useEffect(() => {
    const fetchMegaForms = async () => {
      if (!species?.varieties) return;
      
      const megaVarieties = species.varieties.filter(v => v.pokemon.name.includes('mega'));
      const formData: Record<string, Pokemon> = {};
      
      for (const variety of megaVarieties) {
        try {
          const data = await fetchPokemon(variety.pokemon.name);
          formData[variety.pokemon.name] = data;
        } catch (error) {
          console.warn(`Failed to fetch data for ${variety.pokemon.name}:`, error);
        }
      }
      
      setMegaFormData(formData);
    };
    
    fetchMegaForms();
  }, [species?.varieties]);
  
  // Parse evolution chain into a usable structure
  const parseEvolutionChain = (chain: any, isShiny: boolean): EvolutionNode[][] => {
    const stages: EvolutionNode[][] = [];
    
    const parseNode = (node: any, stageIndex: number = 0) => {
      if (!node || !node.species) return;
      
      if (!stages[stageIndex]) {
        stages[stageIndex] = [];
      }
      
      try {
        // Extract Pokemon ID from URL
        const urlParts = node.species.url.split('/');
        const pokemonId = parseInt(urlParts[urlParts.length - 2]);
        
        if (!isNaN(pokemonId)) {
          stages[stageIndex].push({
            id: pokemonId,
            name: node.species.name,
            sprite: isShiny 
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`
              : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
          });
        }
      } catch (err) {
        console.error('Error parsing evolution node:', err);
      }
      
      // Process evolutions
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((evolution: any) => {
          parseNode(evolution, stageIndex + 1);
        });
      }
    };
    
    if (evolutionChain?.chain) {
      parseNode(evolutionChain.chain);
    }
    
    return stages;
  };
  
  const evolutionStages = parseEvolutionChain(evolutionChain, showShiny);
  
  if (!evolutionChain || evolutionStages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/10 flex items-center justify-center mx-auto">
              <FaDna className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No evolution data available for this Pokémon.
            </p>
          </div>
        </GlassContainer>
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
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center flex-shrink-0">
                  <FaDna className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                    Evolution Chain
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                : "bg-white/10 text-gray-400 border border-white/20 hover:bg-white/20"
            )}
            style={{ 
              transform: 'translate3d(0,0,0)',
              WebkitTransform: 'translate3d(0,0,0)'
            }}
          >
            <FaStar className={cn("w-4 h-4", showShiny && "drop-shadow-glow")} />
            <span className="text-sm font-medium">Shiny</span>
          </button>
            </div>
          </div>
        </GlassContainer>
      </motion.div>
      
      {/* Evolution Chain Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:block">
            <div className="flex items-center justify-center">
              {evolutionStages.map((stage, stageIndex) => (
                <React.Fragment key={stageIndex}>
                  {stageIndex > 0 && <EvolutionArrow horizontal />}
                  
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
                  {stageIndex > 0 && <EvolutionArrow horizontal={false} />}
                  
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
        </GlassContainer>
      </motion.div>
      
      {/* Evolution Details */}
      {evolutionStages.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassContainer 
            variant="dark" 
            className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
            animate={false}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                  <FaLevelUpAlt className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Evolution Methods
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                  className="group"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <div className="bg-white dark:bg-gray-900/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FaExchangeAlt className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-sm">Evolution Requirements</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Level requirements, items, or special conditions
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="group"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <div className="bg-white dark:bg-gray-900/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <GiStoneSphere className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-sm">Special Items</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Evolution stones or trade items needed
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </GlassContainer>
        </motion.div>
      )}
      
      {/* Mega Evolution Section */}
      {species?.varieties?.some(v => v.pokemon.name.includes('mega')) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassContainer 
            variant="dark" 
            className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
            animate={false}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                  <HiSparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
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
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-3 shadow-lg">
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
                              pokemon.name === variety.pokemon.name && "ring-2 ring-purple-500/50"
                            )}
                          >
                            <GlassContainer 
                              variant="dark" 
                              animate={false}
                              className={cn(
                                "p-4 text-center border transition-all duration-200 hover:border-purple-500/30",
                                pokemon.name === variety.pokemon.name ? "border-purple-500/50 bg-purple-500/10" : "border-gray-700/50"
                              )}
                            >
                              {pokemon.name === variety.pokemon.name && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                    CURRENT
                                  </span>
                                </div>
                              )}
                              
                              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3">
                                {megaFormData[variety.pokemon.name]?.sprites?.other?.['official-artwork']?.front_default ? (
                                  <Image
                                    src={megaFormData[variety.pokemon.name].sprites.other['official-artwork'].front_default}
                                    alt={variety.pokemon.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 640px) 96px, 128px"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="font-bold capitalize text-base sm:text-lg mb-2">
                                {variety.pokemon.name.includes('mega-x') ? 'Mega X' : 
                                 variety.pokemon.name.includes('mega-y') ? 'Mega Y' : 'Mega'}
                              </h3>
                              
                              <p className="text-xs sm:text-sm text-purple-400">Mega Stone Required</p>
                            </GlassContainer>
                          </motion.div>
                        </Link>
                      );
                    })}
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>Mega Evolution is a temporary transformation that requires a Mega Stone and a strong bond with the trainer.</p>
              </div>
            </div>
          </GlassContainer>
        </motion.div>
      )}
    </div>
  );
};

export default EvolutionTabV3;