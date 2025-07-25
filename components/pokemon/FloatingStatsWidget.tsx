import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon } from '../../types/api/pokemon';
import PokemonGlassCard from './PokemonGlassCard';
import { TypeBadge } from '../ui/TypeBadge';
import { useScrollVisibility } from '../../hooks/useScrollVisibility';
import { cn } from '../../utils/cn';
import { FaChevronUp, FaChevronDown, FaHeart, FaShare } from 'react-icons/fa';
import { sharePokemon } from '../../utils/shareUtils';
import { useFavorites } from '../../context/UnifiedAppContext';

interface FloatingStatsWidgetProps {
  pokemon: Pokemon;
  position?: 'bottom-left' | 'bottom-right';
  threshold?: number;
}

const FloatingStatsWidget: React.FC<FloatingStatsWidgetProps> = ({
  pokemon,
  position = 'bottom-right',
  threshold = 600
}) => {
  const isVisible = useScrollVisibility(threshold);
  const [isExpanded, setIsExpanded] = useState(false);
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  // Check if favorited
  const isFavorite = favorites.pokemon.some((p: Pokemon) => p.id === pokemon.id);
  
  // Calculate total base stats
  const totalStats = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  
  // Get stat values
  const stats = {
    hp: pokemon.stats?.find(s => s.stat.name === 'hp')?.base_stat || 0,
    attack: pokemon.stats?.find(s => s.stat.name === 'attack')?.base_stat || 0,
    defense: pokemon.stats?.find(s => s.stat.name === 'defense')?.base_stat || 0,
    spAttack: pokemon.stats?.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
    spDefense: pokemon.stats?.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
    speed: pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0,
  };
  
  // Determine position classes
  const positionClasses = position === 'bottom-left' 
    ? 'left-6' 
    : 'right-6';
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed bottom-6 z-50",
            positionClasses
          )}
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <PokemonGlassCard 
            variant="compact" 
            pokemonTypes={pokemon.types}
            className="shadow-2xl backdrop-blur-xl"
            hover={true}
            glow={true}
          >
            <div className="w-72">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    #{String(pokemon.id).padStart(4, '0')}
                  </span>
                  <h3 className="font-semibold capitalize">
                    {pokemon.name.replace(/-/g, ' ')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
                </button>
              </div>
              
              {/* Collapsed View */}
              {!isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Types */}
                  <div className="flex gap-2">
                    {pokemon.types?.map(typeInfo => (
                      <TypeBadge 
                        key={typeInfo.slot} 
                        type={typeInfo.type.name} 
                        size="sm" 
                      />
                    ))}
                  </div>
                  
                  {/* Total Stats */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Base Stats
                    </span>
                    <span className="text-lg font-bold">
                      {totalStats}
                    </span>
                  </div>
                  
                  {/* Mini stat bars */}
                  <div className="space-y-1">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 w-8">
                          {key.replace(/([A-Z])/g, ' $1').trim().slice(0, 3)}
                        </span>
                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / 255) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                        <span className="text-[10px] font-medium w-6 text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Expanded View */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Types with labels */}
                  <div className="flex gap-2">
                    {pokemon.types?.map(typeInfo => (
                      <TypeBadge 
                        key={typeInfo.slot} 
                        type={typeInfo.type.name} 
                        size="md" 
                      />
                    ))}
                  </div>
                  
                  {/* Hexagon Stats Chart */}
                  <div className="relative h-48 flex items-center justify-center">
                    <StatHexagon stats={stats} />
                  </div>
                  
                  {/* Detailed stat list */}
                  <div className="space-y-2">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full",
                              value >= 100 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                              value >= 80 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                              value >= 60 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                              "bg-gradient-to-r from-red-500 to-pink-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / 255) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                        <span className="text-sm font-bold w-8 text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                    
                    {/* Total */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Base Stat Total
                        </span>
                        <span className="text-lg font-bold">
                          {totalStats}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick actions */}
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        if (isFavorite) {
                          removeFromFavorites('pokemon', pokemon.id);
                        } else {
                          addToFavorites('pokemon', pokemon);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <FaHeart className={isFavorite ? "text-red-500" : "text-gray-400"} />
                      <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                    </button>
                    <button 
                      onClick={() => sharePokemon(pokemon, 'link')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <FaShare />
                      <span>Share</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </PokemonGlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hexagon stat visualization component
const StatHexagon: React.FC<{ stats: Record<string, number> }> = ({ stats }) => {
  const statOrder = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
  const maxStat = 255;
  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  
  // Calculate points for hexagon
  const points = statOrder.map((stat, index) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const value = stats[stat] || 0;
    const distance = (value / maxStat) * radius;
    
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  });
  
  // Create path string
  const pathString = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  // Create background hexagon
  const bgPoints = statOrder.map((_, index) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });
  
  const bgPathString = bgPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon
          key={scale}
          points={bgPoints.map(p => `${centerX + (p.x - centerX) * scale},${centerY + (p.y - centerY) * scale}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-200 dark:text-gray-700"
          opacity={0.5}
        />
      ))}
      
      {/* Background hexagon */}
      <path
        d={bgPathString}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-gray-300 dark:text-gray-600"
      />
      
      {/* Stats polygon */}
      <motion.path
        d={pathString}
        fill="url(#statGradient)"
        fillOpacity="0.3"
        stroke="url(#statGradient)"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      
      {/* Stat labels */}
      {statOrder.map((stat, index) => {
        const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
        const labelDistance = radius + 20;
        const x = centerX + Math.cos(angle) * labelDistance;
        const y = centerY + Math.sin(angle) * labelDistance;
        
        return (
          <text
            key={stat}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] font-medium fill-current text-gray-600 dark:text-gray-400"
          >
            {stat.toUpperCase().slice(0, 3)}
          </text>
        );
      })}
    </svg>
  );
};

export default FloatingStatsWidget;