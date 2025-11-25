import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PokemonType } from "../../types/pokemon";
import { getTypeMatchups, getTypeEffectivenessColor, getEffectivenessLabel, getTypeColor, POKEMON_TYPES } from '../../utils/typeEffectiveness';
import { cn } from '../../utils/cn';

interface TypeEffectivenessChartProps {
  types: PokemonType[];
  variant?: 'compact' | 'detailed';
  showOffensive?: boolean;
  className?: string;
}

const TypeEffectivenessChart: React.FC<TypeEffectivenessChartProps> = ({
  types,
  variant = 'compact',
  showOffensive = false,
  className
}) => {
  // Calculate type effectiveness
  const typeNames = types.map(t => t.type.name);
  const { weaknesses, resistances, immunities } = useMemo(() => getTypeMatchups(typeNames), [typeNames]);

  // Sort by effectiveness
  const sortedWeaknesses = useMemo(() => {
    return Object.entries(weaknesses).sort((a, b) => b[1] - a[1]);
  }, [weaknesses]);

  const sortedResistances = useMemo(() => {
    return Object.entries(resistances).sort((a, b) => a[1] - b[1]);
  }, [resistances]);

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        {/* Critical weaknesses (4x) */}
        {sortedWeaknesses.filter(([_, mult]) => mult === 4).length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Critical:</span>
            {sortedWeaknesses.filter(([_, mult]) => mult === 4).map(([type, mult]) => (
              <TypeBadge key={type} type={type} multiplier={mult} />
            ))}
          </div>
        )}

        {/* Regular weaknesses (2x) */}
        {sortedWeaknesses.filter(([_, mult]) => mult === 2).length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Weak to:</span>
            {sortedWeaknesses.filter(([_, mult]) => mult === 2).map(([type, mult]) => (
              <TypeBadge key={type} type={type} multiplier={mult} />
            ))}
          </div>
        )}

        {/* Resistances */}
        {sortedResistances.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Resists:</span>
            {sortedResistances.map(([type, mult]) => (
              <TypeBadge key={type} type={type} multiplier={mult} />
            ))}
          </div>
        )}

        {/* Immunities */}
        {immunities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Immune:</span>
            {immunities.map(type => (
              <TypeBadge key={type} type={type} multiplier={0} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Detailed grid view
  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="grid grid-cols-9 gap-1 min-w-[600px]">
        {/* Header */}
        <div className="col-span-9 text-center font-semibold text-sm mb-2">
          Type Effectiveness Chart
        </div>

        {/* Type grid */}
        {POKEMON_TYPES.map(type => {
          const mult = weaknesses[type] || resistances[type] || (immunities.includes(type) ? 0 : 1);
          return (
            <motion.div
              key={type}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer",
                getTypeEffectivenessColor(mult)
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`${type}: ${getEffectivenessLabel(mult)}`}
            >
              <div className="text-center">
                <div className="capitalize">{type.slice(0, 3)}</div>
                <div className="text-[10px] opacity-90">{getEffectivenessLabel(mult)}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-600"></div>
          <span>4× Damage</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>2× Damage</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-400"></div>
          <span>1× Damage</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>0.5× Damage</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-600"></div>
          <span>0.25× Damage</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-500"></div>
          <span>No Effect</span>
        </div>
      </div>
    </div>
  );
};

// Type effectiveness badge component
const TypeBadge: React.FC<{ type: string; multiplier: number }> = ({ type, multiplier }) => {
  const typeColor = getTypeColor(type);

  // Create gradient background based on type and effectiveness
  const getBackgroundStyle = () => {
    if (multiplier === 4) {
      return {
        background: `linear-gradient(135deg, ${typeColor} 0%, #ef4444 100%)`,
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
      };
    } else if (multiplier === 2) {
      return {
        background: `linear-gradient(135deg, ${typeColor} 0%, #f97316 100%)`,
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)'
      };
    } else if (multiplier === 0.5) {
      return {
        background: `linear-gradient(135deg, ${typeColor} 0%, #22c55e 100%)`,
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.3)'
      };
    } else if (multiplier === 0.25) {
      return {
        background: `linear-gradient(135deg, ${typeColor} 0%, #10b981 100%)`,
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
      };
    } else if (multiplier === 0) {
      return {
        background: `linear-gradient(135deg, ${typeColor} 0%, #6b7280 100%)`,
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(107, 114, 128, 0.3)'
      };
    }
    return {
      backgroundColor: typeColor,
      color: 'white',
      boxShadow: `0 4px 6px -1px ${typeColor}33`
    };
  };

  const label = getEffectivenessLabel(multiplier);

  return (
    <motion.span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
      style={getBackgroundStyle()}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      <span className="capitalize font-semibold">{type}</span>
      <span className="font-bold opacity-90">{label}</span>
    </motion.span>
  );
};

export default TypeEffectivenessChart;
