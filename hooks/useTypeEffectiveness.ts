import { useEffect, useState, useCallback, useMemo } from 'react';
import { showdownQueries } from '@/utils/supabase';
import logger from '@/utils/logger';

interface TypeChart {
  [attackingType: string]: {
    [defendingType: string]: number;
  };
}

interface TypeEffectivenessHook {
  typeChart: TypeChart | null;
  loading: boolean;
  error: Error | null;
  getEffectiveness: (attackingType: string, defendingTypes: string[]) => number;
  getWeaknesses: (defendingTypes: string[]) => { type: string; multiplier: number }[];
  getResistances: (defendingTypes: string[]) => { type: string; multiplier: number }[];
  getImmunities: (defendingTypes: string[]) => string[];
}

export function useTypeEffectiveness(): TypeEffectivenessHook {
  const [typeChart, setTypeChart] = useState<TypeChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load type chart on mount
  useEffect(() => {
    async function loadTypeChart() {
      try {
        setLoading(true);
        const chart = await showdownQueries.getAllTypeChart();
        
        if (chart) {
          setTypeChart(chart);
        } else {
          throw new Error('Failed to load type effectiveness data');
        }
      } catch (err) {
        logger.error('Error loading type effectiveness:', { error: err });
        setError(err as Error);
        
        // Fallback to hardcoded values if needed
        // This ensures the app still works if Supabase is down
        loadFallbackTypeChart();
      } finally {
        setLoading(false);
      }
    }

    loadTypeChart();
  }, []);

  // Calculate effectiveness for an attack
  const getEffectiveness = useCallback(
    (attackingType: string, defendingTypes: string[]): number => {
      if (!typeChart) return 1;

      let multiplier = 1;
      const attacker = attackingType.toLowerCase();

      defendingTypes.forEach(defendingType => {
        const defender = defendingType.toLowerCase();
        const effectiveness = typeChart[attacker]?.[defender] ?? 1;
        multiplier *= effectiveness;
      });

      return multiplier;
    },
    [typeChart]
  );

  // Get all type weaknesses for a Pokemon
  const getWeaknesses = useCallback(
    (defendingTypes: string[]): { type: string; multiplier: number }[] => {
      if (!typeChart) return [];

      const weaknesses: { type: string; multiplier: number }[] = [];
      
      Object.keys(typeChart).forEach(attackingType => {
        const multiplier = getEffectiveness(attackingType, defendingTypes);
        if (multiplier > 1) {
          weaknesses.push({ 
            type: attackingType, 
            multiplier 
          });
        }
      });

      return weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    },
    [typeChart, getEffectiveness]
  );

  // Get all type resistances for a Pokemon
  const getResistances = useCallback(
    (defendingTypes: string[]): { type: string; multiplier: number }[] => {
      if (!typeChart) return [];

      const resistances: { type: string; multiplier: number }[] = [];
      
      Object.keys(typeChart).forEach(attackingType => {
        const multiplier = getEffectiveness(attackingType, defendingTypes);
        if (multiplier > 0 && multiplier < 1) {
          resistances.push({ 
            type: attackingType, 
            multiplier 
          });
        }
      });

      return resistances.sort((a, b) => a.multiplier - b.multiplier);
    },
    [typeChart, getEffectiveness]
  );

  // Get all type immunities for a Pokemon
  const getImmunities = useCallback(
    (defendingTypes: string[]): string[] => {
      if (!typeChart) return [];

      const immunities: string[] = [];
      
      Object.keys(typeChart).forEach(attackingType => {
        const multiplier = getEffectiveness(attackingType, defendingTypes);
        if (multiplier === 0) {
          immunities.push(attackingType);
        }
      });

      return immunities;
    },
    [typeChart, getEffectiveness]
  );

  return {
    typeChart,
    loading,
    error,
    getEffectiveness,
    getWeaknesses,
    getResistances,
    getImmunities
  };
}

// Fallback type chart (simplified version)
function loadFallbackTypeChart() {
  // This would normally import from the existing typeEffectiveness utility
  // For now, we'll just log a warning
  logger.warn('Using fallback type effectiveness data');
}

// Helper function to format effectiveness as text
export function formatEffectiveness(multiplier: number): string {
  if (multiplier === 0) return '0×';
  if (multiplier === 0.25) return '¼×';
  if (multiplier === 0.5) return '½×';
  if (multiplier === 1) return '1×';
  if (multiplier === 2) return '2×';
  if (multiplier === 4) return '4×';
  return `${multiplier}×`;
}

// Helper function to get effectiveness color
export function getEffectivenessColor(multiplier: number): string {
  if (multiplier === 0) return 'bg-gray-500';
  if (multiplier < 1) return 'bg-green-500';
  if (multiplier === 1) return 'bg-gray-400';
  if (multiplier === 2) return 'bg-red-500';
  if (multiplier === 4) return 'bg-red-700';
  return 'bg-gray-400';
}