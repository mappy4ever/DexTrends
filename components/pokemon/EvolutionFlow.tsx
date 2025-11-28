import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { CircularCard } from '../ui/design-system';
import { Container } from '../ui/Container';
import { TypeBadge } from '../ui/TypeBadge';
import type { EvolutionChain, EvolutionLink, Pokemon, PokemonSpecies } from "../../types/pokemon";

interface EvolutionFlowProps {
  evolutionChain: EvolutionChain | null;
  currentPokemon: Pokemon;
  species: PokemonSpecies;
  onPokemonClick?: (pokemonId: number) => void;
  className?: string;
}

interface EvolutionNode {
  id: number;
  name: string;
  sprite: string;
  types?: string[];
  evolutionDetails: {
    trigger: string;
    level?: number;
    item?: string;
    location?: string;
    happiness?: number;
    timeOfDay?: string;
    condition?: string;
  }[];
  evolvesTo: EvolutionNode[];
}

const EVOLUTION_TRIGGER_ICONS: Record<string, string> = {
  'level-up': '⬆️',
  'trade': '🔄',
  'use-item': '💎',
  'location': '📍',
  'happiness': '😊',
  'time': '🕐',
  'other': '✨'
};

const EvolutionFlow: React.FC<EvolutionFlowProps> = ({
  evolutionChain,
  currentPokemon,
  species,
  onPokemonClick,
  className
}) => {
  // Parse evolution chain into a tree structure
  const evolutionTree = useMemo(() => {
    if (!evolutionChain?.chain) return null;
    
    const parseNode = (node: EvolutionLink): EvolutionNode => {
      const speciesId = parseInt(node.species.url.split('/').slice(-2, -1)[0]);
      const evolutionDetails = node.evolution_details.map((detail) => ({
        trigger: detail.trigger.name,
        level: detail.min_level || undefined,
        item: detail.item?.name || undefined,
        location: detail.location?.name || undefined,
        happiness: detail.min_happiness || undefined,
        timeOfDay: detail.time_of_day || undefined,
        condition: detail.known_move?.name || detail.held_item?.name || undefined
      }));
      
      return {
        id: speciesId,
        name: node.species.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
        evolutionDetails,
        evolvesTo: node.evolves_to.map(parseNode)
      };
    };
    
    return parseNode(evolutionChain.chain);
  }, [evolutionChain]);
  
  if (!evolutionTree) {
    return (
      <Container variant="default" className={cn("text-center py-12", className)}>
        <p className="text-stone-600 dark:text-stone-400">
          No evolution data available
        </p>
      </Container>
    );
  }
  
  // Render evolution node
  const renderEvolutionNode = (node: EvolutionNode, depth: number = 0, index: number = 0) => {
    const isCurrentPokemon = node.id === currentPokemon.id;
    
    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: depth * 0.2 + index * 0.1 }}
        className="flex items-center"
      >
        {/* Evolution arrow/details */}
        {depth > 0 && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            transition={{ delay: depth * 0.2, duration: 0.3 }}
            className="mx-4 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
              <span className="text-2xl">
                {EVOLUTION_TRIGGER_ICONS[node.evolutionDetails[0]?.trigger || 'other']}
              </span>
              <div className="text-sm">
                {node.evolutionDetails[0]?.level && (
                  <div className="font-bold">Lv. {node.evolutionDetails[0].level}</div>
                )}
                {node.evolutionDetails[0]?.item && (
                  <div className="capitalize">{node.evolutionDetails[0].item.replace(/-/g, ' ')}</div>
                )}
                {node.evolutionDetails[0]?.happiness && (
                  <div>Happiness {node.evolutionDetails[0].happiness}+</div>
                )}
                {node.evolutionDetails[0]?.timeOfDay && (
                  <div className="capitalize">{node.evolutionDetails[0].timeOfDay}</div>
                )}
              </div>
            </div>
            <div className="w-8 h-0.5 bg-stone-300 dark:bg-stone-600 mt-2" />
          </motion.div>
        )}
        
        {/* Pokemon node */}
        <div className="relative">
          <CircularCard
            size="xl"
            onClick={() => onPokemonClick?.(node.id)}
            className={cn(
              "cursor-pointer transition-all duration-300",
              isCurrentPokemon && "ring-4 ring-amber-500 ring-offset-4"
            )}
          >
            <div className="relative w-full h-full p-4">
              <img
                src={node.sprite}
                alt={node.name}
                className="w-full h-full object-contain"
              />
              {isCurrentPokemon && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                >
                  Current
                </motion.div>
              )}
            </div>
          </CircularCard>
          <div className="mt-3 text-center">
            <h4 className="font-bold capitalize">{node.name.replace(/-/g, ' ')}</h4>
            <div className="text-sm text-stone-600 dark:text-stone-400">#{node.id.toString().padStart(3, '0')}</div>
          </div>
        </div>
        
        {/* Render branches if multiple evolutions */}
        {node.evolvesTo.length > 0 && (
          <div className={cn(
            "flex",
            node.evolvesTo.length > 1 ? "flex-col gap-8" : "flex-row"
          )}>
            {node.evolvesTo.map((evolution, idx) => 
              renderEvolutionNode(evolution, depth + 1, idx)
            )}
          </div>
        )}
      </motion.div>
    );
  };
  
  // Check if this is a branching evolution
  const hasBranches = evolutionTree.evolvesTo.some(node => 
    node.evolvesTo.length > 1 || evolutionTree.evolvesTo.length > 1
  );
  
  return (
    <Container 
      variant="default" 
      className={cn("p-8", className)}
    >
      <div className={cn(
        "flex items-center justify-center overflow-x-auto",
        hasBranches ? "flex-col gap-8" : "flex-row"
      )}>
        {renderEvolutionNode(evolutionTree)}
      </div>
      
      {/* Evolution method legend */}
      <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
        <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-3">
          Evolution Methods
        </h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(EVOLUTION_TRIGGER_ICONS).slice(0, -1).map(([key, icon]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{icon}</span>
              <span className="capitalize text-stone-600 dark:text-stone-400">
                {key.replace(/-/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default EvolutionFlow;