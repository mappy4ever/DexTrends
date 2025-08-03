import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon, PokemonSpecies, EvolutionChain } from '../../../types/api/pokemon';
import { GlassContainer } from '../../ui/design-system';
import { TypeBadge } from '../../ui/TypeBadge';
import { cn } from '../../../utils/cn';
import { FaArrowRight, FaArrowDown, FaStar } from 'react-icons/fa';

interface EvolutionTabV3Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain: EvolutionChain | null;
  typeColors: any;
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
    <div
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
        <div className="relative w-32 h-32 mx-auto mb-3">
          <Image
            src={node.sprite || '/placeholder-pokemon.png'}
            alt={node.name}
            fill
            className="object-contain"
            sizes="128px"
          />
        </div>
        
        {/* Pokemon Name */}
        <h3 className="font-bold capitalize text-lg mb-2">{node.name}</h3>
        
        {/* Pokemon Number */}
        <p className="text-sm text-gray-500 dark:text-gray-400">#{String(node.id).padStart(3, '0')}</p>
      </GlassContainer>
    </div>
  </Link>
);

const EvolutionArrow = ({ horizontal = true }: { horizontal?: boolean }) => (
  <div className={cn(
    "flex items-center justify-center",
    horizontal ? "mx-4" : "my-4"
  )}>
    <div className="text-gray-500 dark:text-gray-400">
      {horizontal ? (
        <FaArrowRight className="w-6 h-6" />
      ) : (
        <FaArrowDown className="w-6 h-6" />
      )}
    </div>
  </div>
);

const EvolutionTabV3: React.FC<EvolutionTabV3Props> = ({
  pokemon,
  species,
  evolutionChain,
  typeColors
}) => {
  const [showShiny, setShowShiny] = useState(false);
  
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
      <GlassContainer variant="dark" className="p-8 text-center" animate={false}>
        <p className="text-gray-500 dark:text-gray-400">
          No evolution data available for this Pokémon.
        </p>
      </GlassContainer>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Evolution Chain Title */}
      <GlassContainer variant="dark" className="p-6" animate={false}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Evolution Chain</h2>
            <p className="text-gray-500 dark:text-gray-400">
              This Pokémon's evolutionary line
            </p>
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
      </GlassContainer>
      
      {/* Evolution Chain Display */}
      <GlassContainer variant="dark" className="p-8" animate={false}>
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
      </GlassContainer>
      
      {/* Evolution Details */}
      {evolutionStages.length > 1 && (
        <GlassContainer variant="dark" className="p-6" animate={false}>
          <h3 className="font-bold mb-4">Evolution Methods</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Evolution methods and requirements will be displayed here</p>
            <p>• Level requirements, items, or special conditions</p>
          </div>
        </GlassContainer>
      )}
    </div>
  );
};

export default EvolutionTabV3;