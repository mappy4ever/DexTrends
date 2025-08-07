import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { POKEMON_TYPE_COLORS as pokemonTypeColors } from '../../utils/unifiedTypeColors';

interface TypeEffectiveness {
  type: string;
  effectiveness: number; // 0, 0.5, 1, 2
}

interface PokemonTypeWheelProps {
  pokemonType: string;
  secondaryType?: string;
  size?: number;
  interactive?: boolean;
  className?: string;
}

const TYPE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, fighting: 2, poison: 0, ground: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export const PokemonTypeWheel: React.FC<PokemonTypeWheelProps> = ({
  pokemonType,
  secondaryType,
  size = 400,
  interactive = true,
  className = ''
}) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'offensive' | 'defensive'>('defensive');
  
  const center = size / 2;
  const innerRadius = size * 0.15;
  const outerRadius = size * 0.45;
  const typeCount = ALL_TYPES.length;
  
  // Calculate effectiveness for defensive matchups
  const getDefensiveEffectiveness = (attackingType: string) => {
    const primaryEffect = TYPE_EFFECTIVENESS[attackingType]?.[pokemonType.toLowerCase()] ?? 1;
    const secondaryEffect = secondaryType 
      ? TYPE_EFFECTIVENESS[attackingType]?.[secondaryType.toLowerCase()] ?? 1 
      : 1;
    
    return primaryEffect * secondaryEffect;
  };
  
  // Get color based on effectiveness
  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness === 0) return '#1f2937'; // Immune (gray-800)
    if (effectiveness === 0.25) return '#dc2626'; // 4x weak (red-600)
    if (effectiveness === 0.5) return '#f87171'; // 2x weak (red-400)
    if (effectiveness === 1) return '#9ca3af'; // Neutral (gray-400)
    if (effectiveness === 2) return '#4ade80'; // 2x resist (green-400)
    if (effectiveness === 4) return '#22c55e'; // 4x resist (green-600)
    return '#9ca3af';
  };
  
  // Create type segments
  const typeSegments = ALL_TYPES.map((type, index) => {
    const startAngle = (index * 360) / typeCount - 90;
    const endAngle = ((index + 1) * 360) / typeCount - 90;
    const effectiveness = getDefensiveEffectiveness(type);
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate path
    const x1 = center + Math.cos(startRad) * innerRadius;
    const y1 = center + Math.sin(startRad) * innerRadius;
    const x2 = center + Math.cos(startRad) * outerRadius;
    const y2 = center + Math.sin(startRad) * outerRadius;
    const x3 = center + Math.cos(endRad) * outerRadius;
    const y3 = center + Math.sin(endRad) * outerRadius;
    const x4 = center + Math.cos(endRad) * innerRadius;
    const y4 = center + Math.sin(endRad) * innerRadius;
    
    const path = `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
    `;
    
    // Label position
    const midAngle = (startAngle + endAngle) / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelRadius = outerRadius + 20;
    const labelX = center + Math.cos(midRad) * labelRadius;
    const labelY = center + Math.sin(midRad) * labelRadius;
    
    return {
      type,
      path,
      effectiveness,
      color: getEffectivenessColor(effectiveness),
      labelX,
      labelY,
      midAngle
    };
  });
  
  return (
    <div className={cn("relative inline-block", className)}>
      {/* View Toggle */}
      <div className="absolute top-0 left-0 flex gap-2 z-10">
        <button
          onClick={() => setSelectedView('defensive')}
          className={cn(
            "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
            selectedView === 'defensive'
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
        >
          Defense
        </button>
        <button
          onClick={() => setSelectedView('offensive')}
          className={cn(
            "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
            selectedView === 'offensive'
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          disabled
        >
          Attack
        </button>
      </div>
      
      <svg width={size} height={size} className="overflow-visible">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 dark:text-gray-600"
        />
        
        {/* Type segments */}
        {typeSegments.map((segment, index) => (
          <g key={segment.type}>
            <motion.path
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: hoveredType === segment.type ? 1 : 0.8,
                scale: hoveredType === segment.type ? 1.05 : 1
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "cursor-pointer transition-all",
                interactive && "hover:filter hover:brightness-110"
              )}
              onMouseEnter={() => interactive && setHoveredType(segment.type)}
              onMouseLeave={() => interactive && setHoveredType(null)}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
            
            {/* Type icon or abbreviation */}
            <text
              x={segment.labelX}
              y={segment.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "text-xs font-bold pointer-events-none transition-all",
                hoveredType === segment.type 
                  ? "fill-current text-gray-900 scale-110" 
                  : "fill-current text-gray-700 dark:text-gray-300"
              )}
              style={{
                transform: hoveredType === segment.type ? 'scale(1.1)' : 'scale(1)',
                transformOrigin: `${segment.labelX}px ${segment.labelY}px`
              }}
            >
              {segment.type.substring(0, 3).toUpperCase()}
            </text>
          </g>
        ))}
        
        {/* Center Pokemon type */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 5}
          fill={pokemonTypeColors[pokemonType.toLowerCase()] || '#6B7280'}
        />
        <text
          x={center}
          y={center - (secondaryType ? 10 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-lg font-bold"
        >
          {pokemonType.toUpperCase()}
        </text>
        {secondaryType && (
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-sm"
          >
            {secondaryType.toUpperCase()}
          </text>
        )}
        
        {/* Hover tooltip */}
        {hoveredType && interactive && (
          <g
            style={{
              transform: `translate(${center}px, ${center + outerRadius + 40}px)`
            }}
          >
            <rect
              x="-60"
              y="-15"
              width="120"
              height="30"
              rx="4"
              fill="black"
              fillOpacity="0.8"
            />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-sm"
            >
              {(() => {
                const eff = getDefensiveEffectiveness(hoveredType);
                if (eff === 0) return 'Immune';
                if (eff === 0.25) return '4× Damage';
                if (eff === 0.5) return '2× Damage';
                if (eff === 2) return '½× Damage';
                if (eff === 4) return '¼× Damage';
                return 'Normal Damage';
              })()}
            </text>
          </g>
        )}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Resistant</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-gray-400" />
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-red-400" />
          <span>Weak</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-gray-800" />
          <span>Immune</span>
        </div>
      </div>
    </div>
  );
};

export default PokemonTypeWheel;