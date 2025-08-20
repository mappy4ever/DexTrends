import React from 'react';
import { cn } from '@/utils/cn';
import { FaCrown } from 'react-icons/fa';

interface RaritySymbolProps {
  rarity: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

// Clean SVG Symbol Components
const CircleSymbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

const DiamondSymbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 3L4 12L12 21L20 12L12 3Z" />
  </svg>
);

const StarSymbol = ({ className, filled = true }: { className?: string; filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke={!filled ? "currentColor" : "none"} strokeWidth={!filled ? "2" : "0"}>
    <path d="M12 2L14.09 8.26L20.85 9.03L16.42 13.33L17.47 20.05L12 16.77L6.53 20.05L7.58 13.33L3.15 9.03L9.91 8.26L12 2Z" />
  </svg>
);

// Rarity configuration with just symbols and colors
const rarityConfig: Record<string, {
  symbol: React.ReactNode;
  label: string;
  color: string;
}> = {
  // Basic Rarities
  'Common': {
    symbol: <CircleSymbol className="w-full h-full" />,
    label: 'Common',
    color: 'text-gray-500 dark:text-gray-400'
  },
  'Uncommon': {
    symbol: <DiamondSymbol className="w-full h-full" />,
    label: 'Uncommon',
    color: 'text-gray-600 dark:text-gray-300'
  },
  'Rare': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Rare',
    color: 'text-gray-700 dark:text-gray-200'
  },
  
  // Holo Variations (star with different colors)
  'Rare Holo': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Holo',
    color: 'text-blue-500 dark:text-blue-400'
  },
  'Rare Holo EX': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'EX',
    color: 'text-red-500 dark:text-red-400'
  },
  'Rare Holo GX': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'GX',
    color: 'text-blue-600 dark:text-blue-400'
  },
  'Rare Holo V': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'V',
    color: 'text-purple-500 dark:text-purple-400'
  },
  'Rare Holo VMAX': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'VMAX',
    color: 'text-purple-600 dark:text-purple-400'
  },
  'Rare Holo VSTAR': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'VSTAR',
    color: 'text-yellow-500 dark:text-yellow-400'
  },
  
  // Modern Rarities (multiple stars)
  'Double Rare': {
    symbol: (
      <div className="flex gap-0.5 items-center justify-center">
        <StarSymbol className="w-full h-full" />
        <StarSymbol className="w-full h-full" />
      </div>
    ),
    label: 'Double Rare',
    color: 'text-gray-700 dark:text-gray-200'
  },
  'Rare Ultra': {
    symbol: (
      <div className="flex gap-0.5 items-center justify-center">
        <StarSymbol className="w-full h-full" />
        <StarSymbol className="w-full h-full" />
      </div>
    ),
    label: 'Ultra Rare',
    color: 'text-purple-500 dark:text-purple-400'
  },
  'Illustration Rare': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Illustration',
    color: 'text-yellow-500 dark:text-yellow-400'
  },
  'Special Illustration Rare': {
    symbol: (
      <div className="flex gap-0.5 items-center justify-center">
        <StarSymbol className="w-full h-full" />
        <StarSymbol className="w-full h-full" />
      </div>
    ),
    label: 'Special Art',
    color: 'text-yellow-600 dark:text-yellow-400'
  },
  'Hyper Rare': {
    symbol: (
      <div className="flex gap-0.5 w-full h-full items-center justify-center">
        <StarSymbol className="w-[32%] h-[32%]" />
        <StarSymbol className="w-[32%] h-[32%]" />
        <StarSymbol className="w-[32%] h-[32%]" />
      </div>
    ),
    label: 'Hyper',
    color: 'text-yellow-600 dark:text-yellow-400'
  },
  'Rare Secret': {
    symbol: (
      <div className="flex gap-0.5 w-full h-full items-center justify-center">
        <StarSymbol className="w-[32%] h-[32%]" />
        <StarSymbol className="w-[32%] h-[32%]" />
        <StarSymbol className="w-[32%] h-[32%]" />
      </div>
    ),
    label: 'Secret',
    color: 'text-purple-600 dark:text-purple-400'
  },
  'Rare Rainbow': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Rainbow',
    color: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent'
  },
  'Rare Shining': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Shining',
    color: 'text-cyan-500 dark:text-cyan-400'
  },
  'Amazing Rare': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Amazing',
    color: 'text-orange-500 dark:text-orange-400'
  },
  'Radiant Rare': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Radiant',
    color: 'text-yellow-500 dark:text-yellow-400'
  },
  'Trainer Gallery Rare Holo': {
    symbol: <span className="font-bold">TG</span>,
    label: 'TG',
    color: 'text-blue-500 dark:text-blue-400'
  },
  'ACE SPEC Rare': {
    symbol: <span className="font-bold text-[70%]">ACE</span>,
    label: 'ACE',
    color: 'text-red-600 dark:text-red-400'
  },
  'Promo': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Promo',
    color: 'text-blue-500 dark:text-blue-400'
  },
  
  // Crown Rare (Pocket TCG)
  'Crown Rare': {
    symbol: <FaCrown className="w-full h-full" />,
    label: 'Crown',
    color: 'text-yellow-500 dark:text-yellow-400'
  },
  'Crown': {
    symbol: <FaCrown className="w-full h-full" />,
    label: 'Crown',
    color: 'text-yellow-500 dark:text-yellow-400'
  }
};

const sizeClasses = {
  xs: 'w-4 h-4 text-xs',
  sm: 'w-5 h-5 text-sm',
  md: 'w-6 h-6 text-base',
  lg: 'w-8 h-8 text-lg',
  xl: 'w-10 h-10 text-xl'
};

export const CleanRaritySymbol: React.FC<RaritySymbolProps> = ({
  rarity,
  size = 'md',
  className = '',
  showLabel = false,
  onClick,
  isActive = false
}) => {
  const config = rarityConfig[rarity] || rarityConfig['Common'];
  
  // For 2-star rarities, double the width
  const is2Star = ['Double Rare', 'Rare Ultra', 'Special Illustration Rare'].includes(rarity);
  
  // Get size dimensions
  const sizeMap = {
    xs: { width: is2Star ? '2rem' : '1rem', height: '1rem' },    // 32px x 16px for 2-star, 16px x 16px for 1-star
    sm: { width: is2Star ? '2.5rem' : '1.25rem', height: '1.25rem' }, // 40px x 20px for 2-star, 20px x 20px for 1-star
    md: { width: is2Star ? '3rem' : '1.5rem', height: '1.5rem' },    // 48px x 24px for 2-star, 24px x 24px for 1-star
    lg: { width: is2Star ? '4rem' : '2rem', height: '2rem' },        // 64px x 32px for 2-star, 32px x 32px for 1-star
    xl: { width: is2Star ? '5rem' : '2.5rem', height: '2.5rem' }     // 80px x 40px for 2-star, 40px x 40px for 1-star
  };
  
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5',
        onClick && 'cursor-pointer hover:opacity-70 transition-opacity',
        isActive && 'opacity-100',
        !isActive && onClick && 'opacity-60',
        className
      )}
      onClick={onClick}
      title={config.label}
    >
      {/* Just the symbol, no container */}
      <div 
        className={cn(
          'flex items-center justify-center',
          config.color,
          isActive && 'drop-shadow-md'
        )}
        style={sizeMap[size]}
      >
        {config.symbol}
      </div>
      
      {/* Optional label */}
      {showLabel && (
        <span className={cn(
          'font-medium',
          size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : 'text-sm',
          isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
};

// Clean Filter Bar Component
export const CleanRarityFilterBar: React.FC<{
  selectedRarity: string | null;
  onRaritySelect: (rarity: string | null) => void;
  availableRarities: string[];
  className?: string;
}> = ({ selectedRarity, onRaritySelect, availableRarities, className = '' }) => {
  // Group rarities
  const basic = ['Common', 'Uncommon', 'Rare'];
  const holo = availableRarities.filter((r: string) => r.includes('Holo') && !r.includes('Trainer'));
  const special = availableRarities.filter((r: string) => 
    r.includes('Ultra') || r.includes('Secret') || r.includes('Rainbow') || 
    r.includes('Illustration') || r.includes('Hyper') || r.includes('Double')
  );
  const other = availableRarities.filter((r: string) => 
    !basic.includes(r) && 
    !r.includes('Holo') && 
    !r.includes('Ultra') && !r.includes('Secret') && !r.includes('Rainbow') &&
    !r.includes('Illustration') && !r.includes('Hyper') && !r.includes('Double')
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* All Cards Button */}
      <button
        onClick={() => onRaritySelect(null)}
        className={cn(
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          selectedRarity === null
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        )}
      >
        All Cards
      </button>
      
      {/* Rarity Symbols Grid */}
      <div className="space-y-3">
        {/* Basic */}
        {basic.filter((r: string) => availableRarities.includes(r)).length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-12">Basic</span>
            <div className="flex items-center gap-3">
              {basic.filter((r: string) => availableRarities.includes(r)).map((rarity: string) => (
                <CleanRaritySymbol
                  key={rarity}
                  rarity={rarity}
                  size="sm"
                  onClick={() => onRaritySelect(rarity)}
                  isActive={selectedRarity === rarity}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Holo */}
        {holo.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-12">Holo</span>
            <div className="flex items-center gap-3 flex-wrap">
              {holo.map((rarity: string) => (
                <CleanRaritySymbol
                  key={rarity}
                  rarity={rarity}
                  size="sm"
                  onClick={() => onRaritySelect(rarity)}
                  isActive={selectedRarity === rarity}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Special */}
        {special.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-12">Special</span>
            <div className="flex items-center gap-3 flex-wrap">
              {special.map((rarity: string) => (
                <CleanRaritySymbol
                  key={rarity}
                  rarity={rarity}
                  size="sm"
                  onClick={() => onRaritySelect(rarity)}
                  isActive={selectedRarity === rarity}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Other */}
        {other.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-12">Other</span>
            <div className="flex items-center gap-3 flex-wrap">
              {other.map((rarity: string) => (
                <CleanRaritySymbol
                  key={rarity}
                  rarity={rarity}
                  size="sm"
                  onClick={() => onRaritySelect(rarity)}
                  isActive={selectedRarity === rarity}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanRaritySymbol;