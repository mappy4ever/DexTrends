import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '../../utils/cn';
import type { PocketCard } from '../../types/api/pocket-cards';

interface EvolutionNode {
  card: PocketCard;
  level?: number;
  method?: string;
}

interface PokemonEvolutionFlowProps {
  evolutionChain: EvolutionNode[];
  currentPokemon: string;
  onCardClick?: (card: PocketCard) => void;
  className?: string;
}

export const PokemonEvolutionFlow: React.FC<PokemonEvolutionFlowProps> = ({
  evolutionChain,
  currentPokemon,
  onCardClick,
  className = ''
}) => {
  // Group cards by Pokemon name to handle multiple versions
  const groupedEvolutions = evolutionChain.reduce((acc, node) => {
    const baseName = node.card.name.toLowerCase().replace(/\s+(ex|gx|v|vmax|vstar)$/i, '');
    if (!acc[baseName]) {
      acc[baseName] = [];
    }
    acc[baseName].push(node);
    return acc;
  }, {} as Record<string, EvolutionNode[]>);

  // Create evolution stages
  const stages = Object.entries(groupedEvolutions).map(([name, nodes]) => ({
    name,
    nodes,
    isCurrent: nodes.some(n => n.card.name.toLowerCase() === currentPokemon.toLowerCase())
  }));

  return (
    <div className={cn("w-full overflow-x-auto pb-4", className)}>
      <div className="flex items-center justify-center min-w-max gap-8 p-4">
        {stages.map((stage, stageIndex) => (
          <React.Fragment key={stage.name}>
            {/* Evolution Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: stageIndex * 0.2 }}
              className="relative"
            >
              {/* Stage Container */}
              <div className={cn(
                "relative rounded-2xl p-4 transition-all",
                stage.isCurrent 
                  ? "bg-gradient-to-br from-amber-500/20 to-amber-500/20 border-2 border-amber-500/50" 
                  : "bg-gradient-to-br from-stone-500/10 to-stone-600/10 border border-stone-500/20"
              )}>
                {/* Current Pokemon Indicator */}
                {stage.isCurrent && (
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-600 text-white text-xs font-bold rounded-full">
                      CURRENT
                    </span>
                  </motion.div>
                )}

                {/* Pokemon Cards Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {stage.nodes.map((node, nodeIndex) => (
                    <motion.div
                      key={node.card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: stageIndex * 0.2 + nodeIndex * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCardClick?.(node.card)}
                      className="cursor-pointer"
                    >
                      {/* Card Container */}
                      <div className="relative group">
                        {/* Glow Effect */}
                        <div className={cn(
                          "absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl",
                          stage.isCurrent 
                            ? "bg-gradient-to-r from-amber-600 to-amber-600" 
                            : "bg-gradient-to-r from-stone-400 to-stone-600"
                        )} />
                        
                        {/* Card */}
                        <div className="relative bg-stone-800/80 rounded-xl p-2 backdrop-blur-sm border border-stone-700/50">
                          <div className="flex items-center gap-3">
                            {/* Card Image */}
                            <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-stone-900">
                              <Image
                                src={node.card.image || "/back-card.png"}
                                alt={node.card.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                            
                            {/* Card Info */}
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-stone-200">
                                {node.card.name}
                              </h4>
                              <p className="text-xs text-stone-400">
                                {node.card.rarity}
                              </p>
                              {node.level && (
                                <p className="text-xs text-amber-400 mt-1">
                                  Lv. {node.level}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stage Name */}
                <div className="mt-3 text-center">
                  <h3 className={cn(
                    "text-sm font-bold capitalize",
                    stage.isCurrent ? "text-amber-400" : "text-stone-400"
                  )}>
                    {stage.name}
                  </h3>
                </div>
              </div>
            </motion.div>

            {/* Evolution Arrow */}
            {stageIndex < stages.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: stageIndex * 0.2 + 0.3 }}
                className="relative"
              >
                <svg
                  width="60"
                  height="40"
                  viewBox="0 0 60 40"
                  className="text-stone-600"
                >
                  {/* Arrow Line */}
                  <motion.line
                    x1="0"
                    y1="20"
                    x2="40"
                    y2="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: stageIndex * 0.2 + 0.4 }}
                  />
                  
                  {/* Arrow Head */}
                  <motion.path
                    d="M40 20 L35 15 M40 20 L35 25"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: stageIndex * 0.2 + 0.8 }}
                  />
                  
                  {/* Evolution Method Label */}
                  {stages[stageIndex].nodes[0].method && (
                    <motion.text
                      x="20"
                      y="35"
                      textAnchor="middle"
                      className="text-xs fill-current text-stone-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: stageIndex * 0.2 + 0.9 }}
                    >
                      {stages[stageIndex].nodes[0].method}
                    </motion.text>
                  )}
                </svg>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Scroll Indicator */}
      <div className="md:hidden flex justify-center mt-2">
        <motion.div
          className="flex items-center gap-1 text-xs text-stone-500"
          animate={{ x: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Swipe to see more
        </motion.div>
      </div>
    </div>
  );
};

export default PokemonEvolutionFlow;