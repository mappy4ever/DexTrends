import type { Evolution } from './types';

export const getTypeGradient = (primaryType?: string): string => {
  switch (primaryType) {
    case 'grass': return 'from-green-400 to-green-600';
    case 'fire': return 'from-red-400 to-orange-600';
    case 'water': return 'from-blue-400 to-cyan-600';
    default: return 'from-stone-400 to-stone-600';
  }
};

export const getFirstEvolution = (evolutions: Evolution[]): Evolution | undefined => {
  return evolutions?.[0];
};