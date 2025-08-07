import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PokemonType } from '../../types/api/pokemon';
import type { CompetitiveTierRecord } from '../../utils/supabase';
import { POKEMON_TYPE_COLORS } from '../../utils/unifiedTypeColors';
import { cn } from '../../utils/cn';
import { FaShieldAlt } from 'react-icons/fa';
import { GiSwordWound } from 'react-icons/gi';
import { TierBadgeGroup } from '../ui/TierBadge';

interface CompactTypeEffectivenessProps {
  types: PokemonType[];
  className?: string;
  competitiveTiers?: CompetitiveTierRecord | null;
}

interface TypeMatchup {
  type: string;
  multiplier: number;
}

// Defensive Type effectiveness chart (damage taken)
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { fighting: 2, ghost: 0 },
  fire: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5 },
  water: { electric: 2, grass: 2, water: 0.5, fire: 0.5, ice: 0.5, steel: 0.5 },
  electric: { ground: 2, electric: 0.5, flying: 0.5, steel: 0.5 },
  grass: { fire: 2, ice: 2, poison: 2, flying: 2, bug: 2, water: 0.5, electric: 0.5, grass: 0.5, ground: 0.5 },
  ice: { fire: 2, fighting: 2, rock: 2, steel: 2, ice: 0.5 },
  fighting: { flying: 2, psychic: 2, fairy: 2, bug: 0.5, rock: 0.5, dark: 0.5 },
  poison: { ground: 2, psychic: 2, grass: 0.5, fighting: 0.5, poison: 0.5, bug: 0.5, fairy: 0.5 },
  ground: { water: 2, grass: 2, ice: 2, poison: 0.5, rock: 0.5, electric: 0 },
  flying: { electric: 2, ice: 2, rock: 2, grass: 0.5, fighting: 0.5, bug: 0.5, ground: 0 },
  psychic: { bug: 2, ghost: 2, dark: 2, fighting: 0.5, psychic: 0.5 },
  bug: { fire: 2, flying: 2, rock: 2, grass: 0.5, fighting: 0.5, ground: 0.5 },
  rock: { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2, normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5 },
  ghost: { ghost: 2, dark: 2, poison: 0.5, bug: 0.5, normal: 0, fighting: 0 },
  dragon: { ice: 2, dragon: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5 },
  dark: { fighting: 2, bug: 2, fairy: 2, ghost: 0.5, dark: 0.5, psychic: 0 },
  steel: { fire: 2, fighting: 2, ground: 2, normal: 0.5, grass: 0.5, ice: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, poison: 0 },
  fairy: { poison: 2, steel: 2, fighting: 0.5, bug: 0.5, dark: 0.5, dragon: 0 }
};

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export const CompactTypeEffectiveness: React.FC<CompactTypeEffectivenessProps> = ({
  types,
  className = '',
  competitiveTiers
}) => {
  const [showRatingInfo, setShowRatingInfo] = React.useState(false);
  
  // Get primary type color for gradient theming
  const primaryType = types[0]?.type.name || 'normal';
  const typeColor = POKEMON_TYPE_COLORS[primaryType] || '#68A090';
  // Offensive Type effectiveness chart (damage dealt)
  const OFFENSIVE_TYPE_CHART: Record<string, Record<string, number>> = {
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
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };
  
  // Calculate defensive matchups
  const calculateDefensiveMatchups = (): TypeMatchup[] => {
    const matchups: Record<string, number> = {};
    
    // Initialize all types as 1x
    ALL_TYPES.forEach(type => {
      matchups[type] = 1;
    });
    
    // Apply type effectiveness for each of the Pokemon's types
    types.forEach(pokemonType => {
      const typeName = pokemonType.type.name;
      ALL_TYPES.forEach(attackingType => {
        if (TYPE_CHART[typeName] && TYPE_CHART[typeName][attackingType] !== undefined) {
          matchups[attackingType] *= TYPE_CHART[typeName][attackingType];
        }
      });
    });
    
    // Convert to array and filter out 1x effectiveness
    return ALL_TYPES
      .map(type => ({ type, multiplier: matchups[type] }))
      .filter(m => m.multiplier !== 1)
      .sort((a, b) => b.multiplier - a.multiplier);
  };
  
  const matchups = calculateDefensiveMatchups();
  
  // Group by effectiveness
  const weaknesses = matchups.filter(m => m.multiplier > 1);
  const resistances = matchups.filter(m => m.multiplier < 1 && m.multiplier > 0);
  const immunities = matchups.filter(m => m.multiplier === 0);
  
  // Calculate offensive matchups
  const calculateOffensiveMatchups = (): TypeMatchup[] => {
    const matchups: Record<string, number> = {};
    const offensiveTypes = new Set<string>();
    
    // Get all types this Pokemon can hit with STAB
    types.forEach(pokemonType => {
      const typeName = pokemonType.type.name;
      offensiveTypes.add(typeName);
    });
    
    // For each offensive type, check effectiveness against all types
    ALL_TYPES.forEach(defendingType => {
      let maxEffectiveness = 0;
      
      offensiveTypes.forEach(attackingType => {
        let effectiveness = 1;
        
        if (OFFENSIVE_TYPE_CHART[attackingType] && OFFENSIVE_TYPE_CHART[attackingType][defendingType] !== undefined) {
          effectiveness = OFFENSIVE_TYPE_CHART[attackingType][defendingType];
        }
        
        maxEffectiveness = Math.max(maxEffectiveness, effectiveness);
      });
      
      if (maxEffectiveness !== 1) {
        matchups[defendingType] = maxEffectiveness;
      }
    });
    
    return ALL_TYPES
      .map(type => ({ type, multiplier: matchups[type] || 1 }))
      .filter(m => m.multiplier !== 1)
      .sort((a, b) => b.multiplier - a.multiplier);
  };
  
  // Calculate defensive effectiveness score with better logic
  const calculateDefensiveScore = () => {
    let score = 50; // Start at 50 instead of 100
    
    // More nuanced scoring
    weaknesses.forEach(w => {
      if (w.multiplier === 4) score -= 20; // 4x weakness is very bad
      else if (w.multiplier === 2) {
        // Common attacking types are worse to be weak to
        const commonTypes = ['fighting', 'ground', 'rock', 'fire', 'water', 'electric', 'ice'];
        if (commonTypes.includes(w.type)) {
          score -= 10;
        } else {
          score -= 6;
        }
      }
    });
    
    // Add points for resistances and immunities
    resistances.forEach(r => {
      if (r.multiplier === 0.25) score += 8;
      else if (r.multiplier === 0.5) {
        // Resisting common types is better
        const commonTypes = ['fighting', 'ground', 'rock', 'fire', 'water', 'electric', 'ice'];
        if (commonTypes.includes(r.type)) {
          score += 5;
        } else {
          score += 3;
        }
      }
    });
    
    immunities.forEach(i => {
      // Immunities to common types are very valuable
      const valuableImmunities = ['ground', 'electric', 'poison', 'psychic'];
      if (valuableImmunities.includes(i.type)) {
        score += 20;
      } else {
        score += 12;
      }
    });
    
    // Bonus for good defensive type combos
    const typeNames = types.map(t => t.type.name);
    const goodCombos = [
      ['steel', 'flying'], ['water', 'ground'], ['steel', 'fairy'],
      ['ghost', 'dark'], ['water', 'flying'], ['steel', 'grass']
    ];
    
    if (goodCombos.some(combo => 
      combo.every(t => typeNames.includes(t))
    )) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  };
  
  // Calculate offensive effectiveness score
  const calculateOffensiveScore = () => {
    const offensiveMatchups = calculateOffensiveMatchups();
    const superEffective = offensiveMatchups.filter(m => m.multiplier > 1);
    const notVeryEffective = offensiveMatchups.filter(m => m.multiplier < 1 && m.multiplier > 0);
    const noEffect = offensiveMatchups.filter(m => m.multiplier === 0);
    
    let score = 50; // Base score
    
    // Add points for super effective coverage
    superEffective.forEach(se => {
      // Coverage of common defensive types is valuable
      const commonDefensiveTypes = ['steel', 'water', 'grass', 'fairy', 'flying'];
      if (commonDefensiveTypes.includes(se.type)) {
        score += 4;
      } else {
        score += 2;
      }
    });
    
    // Subtract for poor coverage
    notVeryEffective.forEach(() => score -= 1);
    noEffect.forEach(() => score -= 3);
    
    // Bonus for having diverse type coverage
    if (types.length === 2 && types[0].type.name !== types[1].type.name) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  };
  
  const defensiveScore = calculateDefensiveScore();
  const offensiveScore = calculateOffensiveScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 55) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const getScoreRank = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Avg.';
    return 'Poor';
  };
  
  // Format multiplier display
  const formatMultiplier = (multiplier: number) => {
    if (multiplier === 0) return '0';
    if (multiplier === 0.25) return '0.25';
    if (multiplier === 0.5) return '0.5';
    if (multiplier === 2) return '2';
    if (multiplier === 4) return '4';
    return multiplier.toString();
  };
  
  // Get color for effectiveness
  const getEffectivenessColor = (multiplier: number) => {
    if (multiplier === 0) return 'bg-gray-600 text-gray-200'; // Deep purple-grey for immune
    if (multiplier === 0.25) return 'bg-green-900 text-green-100'; // Dark dark green for double resistance
    if (multiplier < 1) return 'bg-green-600 text-white'; // Green for regular resistance
    if (multiplier === 4) return 'bg-orange-600 text-white'; // Orange for double weakness
    if (multiplier > 1) return 'bg-red-500 text-white'; // Red for regular weakness
    return 'bg-gray-400 text-white';
  };
  
  // Get text color for multipliers
  const getMultiplierTextColor = (multiplier: number) => {
    if (multiplier === 0) return 'text-gray-600'; // Gray for immune
    if (multiplier === 0.25) return 'text-green-900'; // Dark green for double resistance
    if (multiplier < 1) return 'text-green-600'; // Green for regular resistance
    if (multiplier === 4) return 'text-orange-600'; // Orange for double weakness
    if (multiplier > 1) return 'text-red-600'; // Red for regular weakness
    return 'text-gray-600';
  };
  
  const TypeBadge = ({ matchup }: { matchup: TypeMatchup }) => (
    <div
      className="relative group transform transition-transform duration-200 hover:scale-[1.02] badge-no-cull mb-2 mr-2"
      style={{ 
        transform: 'translate3d(0,0,0)',
        WebkitTransform: 'translate3d(0,0,0)',
        backfaceVisibility: 'visible',
        WebkitBackfaceVisibility: 'visible'
      }}
    >
      {/* Type and Multiplier Stack */}
      <div className="inline-flex flex-col items-center gap-0.5">
        {/* Type Pill Badge */}
        <div 
          className="px-4 py-2 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: POKEMON_TYPE_COLORS[matchup.type] || '#68A090' }}
        >
          <span className="text-sm font-bold text-white uppercase tracking-wide">
            {matchup.type}
          </span>
        </div>
        
        {/* Multiplier Text - Directly below */}
        <div className={cn(
          "text-xs font-bold",
          getMultiplierTextColor(matchup.multiplier)
        )}>
          {formatMultiplier(matchup.multiplier)}×
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {matchup.type}: {formatMultiplier(matchup.multiplier)}× damage
        </div>
      </div>
    </div>
  );
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Type Matchup Scores */}
      <div className="absolute top-4 right-4 z-10">
        {/* Title with Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-10 relative"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 inline-flex items-center gap-1">
            Type Advantage Rating
            <button
              onClick={() => setShowRatingInfo(!showRatingInfo)}
              className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors inline-flex items-center justify-center text-[10px] font-bold"
            >
              i
            </button>
          </h3>
        </motion.div>
        
        {/* Rating Badges - Side by Side */}
        <div className="flex flex-row gap-3 items-center">
          {/* Defensive Rating */}
          <div className="relative">
            {/* Label above */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              <FaShieldAlt className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Defense
              </span>
            </div>
            <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative rounded-full p-4 transition-all duration-300 cursor-pointer w-28 h-28 flex items-center justify-center",
              "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10",
              "shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3),0_8px_24px_-4px_rgba(0,0,0,0.12),0_16px_48px_-8px_rgba(0,0,0,0.08)] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),0_12px_32px_-4px_rgba(0,0,0,0.18),0_20px_56px_-8px_rgba(0,0,0,0.12)]",
              "border-4 border-white"
            )}
            style={{
              background: `linear-gradient(135deg, 
                ${defensiveScore >= 85 ? "rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2)" :
                  defensiveScore >= 70 ? "rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2)" :
                  defensiveScore >= 55 ? "rgba(251, 146, 60, 0.2), rgba(245, 158, 11, 0.2)" :
                  "rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.2)"}),
                rgba(255, 255, 255, 0.03)
              `,
              backdropFilter: "blur(20px) saturate(1.2)",
              WebkitBackdropFilter: "blur(20px) saturate(1.2)"
            }}
          >
            <div className="text-center relative z-10">
            <div className="text-3xl font-bold mt-3">
              <span className={cn(
                "bg-gradient-to-br bg-clip-text text-transparent",
                defensiveScore >= 85 ? "from-green-600 to-emerald-500" :
                defensiveScore >= 70 ? "from-blue-600 to-indigo-500" :
                defensiveScore >= 55 ? "from-amber-600 to-orange-500" :
                "from-red-600 to-rose-500"
              )}>
                {defensiveScore}
              </span>
            </div>
            {/* Dividing line */}
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gray-600 dark:via-gray-400 to-transparent my-2" />
            <div className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              defensiveScore >= 85 ? "text-green-700 dark:text-green-400" :
              defensiveScore >= 70 ? "text-blue-700 dark:text-blue-400" :
              defensiveScore >= 55 ? "text-amber-700 dark:text-amber-400" :
              "text-red-700 dark:text-red-400"
            )}>
              {getScoreRank(defensiveScore)}
            </div>
          </div>
            {/* Glass shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60" />
          </motion.div>
          </div>
          
          {/* Offensive Rating */}
          <div className="relative">
            {/* Label above */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              <GiSwordWound className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Offense
              </span>
            </div>
            <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative rounded-full p-4 transition-all duration-300 cursor-pointer w-28 h-28 flex items-center justify-center",
              "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10",
              "shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3),0_8px_24px_-4px_rgba(0,0,0,0.12),0_16px_48px_-8px_rgba(0,0,0,0.08)] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),0_12px_32px_-4px_rgba(0,0,0,0.18),0_20px_56px_-8px_rgba(0,0,0,0.12)]",
              "border-4 border-white"
            )}
            style={{
              background: `linear-gradient(135deg, 
                ${offensiveScore >= 85 ? "rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2)" :
                  offensiveScore >= 70 ? "rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2)" :
                  offensiveScore >= 55 ? "rgba(251, 146, 60, 0.2), rgba(245, 158, 11, 0.2)" :
                  "rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.2)"}),
                rgba(255, 255, 255, 0.03)
              `,
              backdropFilter: "blur(20px) saturate(1.2)",
              WebkitBackdropFilter: "blur(20px) saturate(1.2)"
            }}
          >
            <div className="text-center relative z-10">
            <div className="text-3xl font-bold mt-3">
              <span className={cn(
                "bg-gradient-to-br bg-clip-text text-transparent",
                offensiveScore >= 85 ? "from-green-600 to-emerald-500" :
                offensiveScore >= 70 ? "from-blue-600 to-indigo-500" :
                offensiveScore >= 55 ? "from-amber-600 to-orange-500" :
                "from-red-600 to-rose-500"
              )}>
                {offensiveScore}
              </span>
            </div>
            {/* Dividing line */}
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gray-600 dark:via-gray-400 to-transparent my-2" />
            <div className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              offensiveScore >= 85 ? "text-green-700 dark:text-green-400" :
              offensiveScore >= 70 ? "text-blue-700 dark:text-blue-400" :
              offensiveScore >= 55 ? "text-amber-700 dark:text-amber-400" :
              "text-red-700 dark:text-red-400"
            )}>
              {getScoreRank(offensiveScore)}
            </div>
          </div>
            {/* Glass shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60" />
          </motion.div>
          </div>
        </div>
        
        {/* Rating Info Modal */}
        <AnimatePresence>
          {showRatingInfo && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10"
                onClick={() => setShowRatingInfo(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                className="absolute top-8 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64 z-20"
              >
            <button
              onClick={() => setShowRatingInfo(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
            <h4 className="font-bold text-sm mb-3">How Ratings Are Calculated</h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold mb-1">Defense Rating:</p>
                <p className="text-gray-600 dark:text-gray-400">Based on type resistances, weaknesses, and immunities. Points are added for resistances and subtracted for weaknesses.</p>
              </div>
              
              <div>
                <p className="font-semibold mb-1">Offense Rating:</p>
                <p className="text-gray-600 dark:text-gray-400">Based on type coverage and super effective matchups against other types.</p>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="font-semibold mb-2">Score Ranges:</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400/80 to-emerald-500/80 border border-gray-400"></div>
                    <span>85-100: Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400/80 to-indigo-500/80 border border-gray-400"></div>
                    <span>70-84: Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400/90 to-amber-500/90 border border-gray-400"></div>
                    <span>55-69: Average</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-red-400/80 to-rose-500/80 border border-gray-400"></div>
                    <span>0-54: Poor</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-500 font-bold">!</span>
            </div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Weak to ({weaknesses.length} types)
            </h3>
          </div>
          <div className="flex flex-wrap">
            {weaknesses.map((matchup) => (
              <TypeBadge key={matchup.type} matchup={matchup} />
            ))}
          </div>
        </div>
      )}
      
      {/* Resistances */}
      {resistances.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-500 font-bold">✓</span>
            </div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Resistant to ({resistances.length} types)
            </h3>
          </div>
          <div className="flex flex-wrap">
            {resistances.map((matchup) => (
              <TypeBadge key={matchup.type} matchup={matchup} />
            ))}
          </div>
        </div>
      )}
      
      {/* Immunities */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
            <span className="text-gray-500 font-bold">∅</span>
          </div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
            Immune to ({immunities.length} types)
          </h3>
        </div>
        <div className="flex flex-wrap min-h-[60px]">
          {immunities.length > 0 ? (
            immunities.map((matchup) => (
              <TypeBadge key={matchup.type} matchup={matchup} />
            ))
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
              No immunities
            </div>
          )}
        </div>
      </div>
      
      {/* Competitive Section - Under Type Advantage Rating */}
      {competitiveTiers && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-500 font-bold">★</span>
            </div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Competitive Tiers
            </h3>
          </div>
          <TierBadgeGroup tiers={{
            singles: competitiveTiers.singles_tier,
            doubles: competitiveTiers.doubles_tier,
            nationalDex: competitiveTiers.national_dex_tier
          }} />
        </div>
      )}
    </div>
  );
};

export default CompactTypeEffectiveness;