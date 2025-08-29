import React from 'react';
import { cn } from '@/utils/cn';

interface CompetitiveTierBadgeProps {
  rating: number;
  showValue?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompetitiveTierBadge: React.FC<CompetitiveTierBadgeProps> = ({
  rating,
  showValue = true,
  size = 'sm',
  className = ''
}) => {
  // Determine tier based on rating
  const getTier = (rating: number): string => {
    if (rating >= 4.5) return 'S';
    if (rating >= 4) return 'A';
    if (rating >= 3.5) return 'B';
    if (rating >= 3) return 'C';
    if (rating >= 2) return 'D';
    return 'F';
  };

  // Get styling based on tier
  const getTierStyle = (tier: string) => {
    switch (tier) {
      case 'S':
        return {
          gradient: 'from-purple-500 to-pink-500',
          shadow: 'shadow-lg shadow-purple-500/25',
          text: 'text-white',
          glow: 'ring-2 ring-purple-400/50'
        };
      case 'A':
        return {
          gradient: 'from-yellow-400 to-orange-400',
          shadow: 'shadow-md shadow-yellow-400/25',
          text: 'text-white',
          glow: 'ring-2 ring-yellow-400/50'
        };
      case 'B':
        return {
          gradient: 'from-blue-400 to-cyan-400',
          shadow: 'shadow-md shadow-blue-400/25',
          text: 'text-white',
          glow: 'ring-1 ring-blue-400/30'
        };
      case 'C':
        return {
          gradient: 'from-green-400 to-emerald-400',
          shadow: 'shadow-sm shadow-green-400/25',
          text: 'text-white',
          glow: ''
        };
      case 'D':
        return {
          gradient: 'from-gray-400 to-gray-500',
          shadow: '',
          text: 'text-white',
          glow: ''
        };
      default:
        return {
          gradient: 'from-gray-300 to-gray-400',
          shadow: '',
          text: 'text-gray-700 dark:text-gray-300',
          glow: ''
        };
    }
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const tier = getTier(rating);
  const style = getTierStyle(tier);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span 
        className={cn(
          'font-bold rounded-md bg-gradient-to-r',
          style.gradient,
          style.shadow,
          style.text,
          style.glow,
          sizeClasses[size],
          'transition-all duration-200 hover:scale-105'
        )}
      >
        {tier} Tier
      </span>
      {showValue && (
        <span className={cn(
          'text-gray-500 dark:text-gray-400',
          size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        )}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

// Tier legend component for explaining the tiers
export const TierLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  const tiers = [
    { tier: 'S', rating: '4.5+', description: 'Meta-defining', color: 'from-purple-500 to-pink-500' },
    { tier: 'A', rating: '4.0+', description: 'Excellent', color: 'from-yellow-400 to-orange-400' },
    { tier: 'B', rating: '3.5+', description: 'Good', color: 'from-blue-400 to-cyan-400' },
    { tier: 'C', rating: '3.0+', description: 'Average', color: 'from-green-400 to-emerald-400' },
    { tier: 'D', rating: '2.0+', description: 'Below Average', color: 'from-gray-400 to-gray-500' },
    { tier: 'F', rating: '<2.0', description: 'Poor', color: 'from-gray-300 to-gray-400' }
  ];

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {tiers.map(({ tier, rating, description, color }) => (
        <div key={tier} className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-0.5 text-xs font-bold rounded-md bg-gradient-to-r text-white',
            color
          )}>
            {tier}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {rating} • {description}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CompetitiveTierBadge;