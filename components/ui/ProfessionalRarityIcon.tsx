import React from 'react';
import { cn } from '@/utils/cn';

interface RarityIconProps {
  rarity: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

// SVG Components for each rarity symbol
const CircleSymbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const DiamondSymbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L2 12L12 22L22 12L12 2Z" />
  </svg>
);

const StarSymbol = ({ className, filled = true }: { className?: string; filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke={!filled ? "currentColor" : "none"} strokeWidth={!filled ? "2" : "0"}>
    <path d="M12 2L14.09 8.26L20.85 9.03L16.42 13.33L17.47 20.05L12 16.77L6.53 20.05L7.58 13.33L3.15 9.03L9.91 8.26L12 2Z" />
  </svg>
);

// Professional rarity mapping based on official TCG symbols
const rarityConfig: Record<string, {
  symbol: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  // Basic Rarities
  'Common': {
    symbol: <CircleSymbol className="w-full h-full" />,
    label: 'Common',
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-300'
  },
  'Uncommon': {
    symbol: <DiamondSymbol className="w-full h-full" />,
    label: 'Uncommon',
    color: 'text-stone-700',
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-400'
  },
  'Rare': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Rare',
    color: 'text-stone-800',
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-500'
  },
  
  // Holo Variations
  'Rare Holo': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Rare Holo',
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    borderColor: 'border-amber-400'
  },
  'Rare Holo EX': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'EX',
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    borderColor: 'border-amber-400'
  },
  'Rare Holo GX': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'GX',
    color: 'text-amber-700',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-50',
    borderColor: 'border-amber-500'
  },
  'Rare Holo V': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'V',
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    borderColor: 'border-amber-400'
  },
  'Rare Holo VMAX': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'VMAX',
    color: 'text-amber-700',
    bgColor: 'bg-gradient-to-br from-amber-100 to-amber-100',
    borderColor: 'border-amber-500'
  },
  'Rare Holo VSTAR': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'VSTAR',
    color: 'text-yellow-600',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-400'
  },
  
  // Modern Scarlet & Violet Rarities
  'Double Rare': {
    symbol: (
      <div className="flex gap-0.5 w-full h-full items-center justify-center">
        <StarSymbol className="w-[45%] h-[45%]" />
        <StarSymbol className="w-[45%] h-[45%]" />
      </div>
    ),
    label: 'Double Rare',
    color: 'text-stone-800',
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-600'
  },
  'Rare Ultra': {
    symbol: (
      <div className="flex gap-0.5 w-full h-full items-center justify-center">
        <StarSymbol className="w-[45%] h-[45%]" filled={false} />
        <StarSymbol className="w-[45%] h-[45%]" filled={false} />
      </div>
    ),
    label: 'Ultra Rare',
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-100 to-amber-100',
    borderColor: 'border-amber-500'
  },
  'Illustration Rare': {
    symbol: <StarSymbol className="w-full h-full text-yellow-500" />,
    label: 'Illustration',
    color: 'text-yellow-600',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-500'
  },
  'Special Illustration Rare': {
    symbol: (
      <div className="flex gap-0.5 w-full h-full items-center justify-center">
        <StarSymbol className="w-[45%] h-[45%] text-yellow-500" />
        <StarSymbol className="w-[45%] h-[45%] text-yellow-500" />
      </div>
    ),
    label: 'Special Art',
    color: 'text-yellow-600',
    bgColor: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    borderColor: 'border-yellow-600'
  },
  'Hyper Rare': {
    symbol: (
      <div className="flex gap-0.5 w-full h-full items-center justify-center">
        <StarSymbol className="w-[30%] h-[30%] text-yellow-500" />
        <StarSymbol className="w-[30%] h-[30%] text-yellow-500" />
        <StarSymbol className="w-[30%] h-[30%] text-yellow-500" />
      </div>
    ),
    label: 'Hyper',
    color: 'text-yellow-700',
    bgColor: 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100',
    borderColor: 'border-amber-600'
  },
  'Rare Secret': {
    symbol: (
      <div className="flex gap-0.5 w-full h-full items-center justify-center">
        <StarSymbol className="w-[30%] h-[30%] text-amber-500" />
        <StarSymbol className="w-[30%] h-[30%] text-amber-500" />
        <StarSymbol className="w-[30%] h-[30%] text-amber-500" />
      </div>
    ),
    label: 'Secret',
    color: 'text-amber-700',
    bgColor: 'bg-gradient-to-br from-amber-100 via-amber-100 to-amber-100',
    borderColor: 'border-amber-600'
  },
  'Rare Rainbow': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Rainbow',
    color: 'text-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-amber-500 to-amber-500 bg-clip-text',
    bgColor: 'bg-gradient-to-br from-red-50 via-yellow-50 via-green-50 via-amber-50 to-amber-50',
    borderColor: 'border-stone-400'
  },
  'Rare Shining': {
    symbol: <StarSymbol className="w-full h-full text-cyan-500" />,
    label: 'Shining',
    color: 'text-cyan-600',
    bgColor: 'bg-gradient-to-br from-cyan-50 to-amber-50',
    borderColor: 'border-cyan-400'
  },
  'Amazing Rare': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Amazing',
    color: 'text-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50',
    borderColor: 'border-orange-400'
  },
  'Radiant Rare': {
    symbol: <StarSymbol className="w-full h-full text-yellow-400" />,
    label: 'Radiant',
    color: 'text-yellow-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-400'
  },
  'Trainer Gallery Rare Holo': {
    symbol: <span className="font-bold text-xs">TG</span>,
    label: 'Trainer Gallery',
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    borderColor: 'border-amber-400'
  },
  'ACE SPEC Rare': {
    symbol: <span className="font-bold text-[8px]">ACE</span>,
    label: 'ACE SPEC',
    color: 'text-red-700',
    bgColor: 'bg-gradient-to-br from-red-50 to-orange-50',
    borderColor: 'border-red-500'
  },
  'Promo': {
    symbol: <StarSymbol className="w-full h-full" />,
    label: 'Promo',
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    borderColor: 'border-amber-400'
  }
};

const sizeClasses = {
  xs: 'w-4 h-4 text-[8px]',
  sm: 'w-5 h-5 text-[10px]',
  md: 'w-6 h-6 text-xs',
  lg: 'w-8 h-8 text-sm',
  xl: 'w-10 h-10 text-base'
};

export const ProfessionalRarityIcon: React.FC<RarityIconProps> = ({
  rarity,
  size = 'md',
  className = '',
  showLabel = false,
  onClick,
  isActive = false
}) => {
  const config = rarityConfig[rarity] || rarityConfig['Common'];
  
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5',
        onClick && 'cursor-pointer transition-transform hover:scale-110',
        isActive && 'scale-110',
        className
      )}
      onClick={onClick}
    >
      {/* Icon Container */}
      <div className={cn(
        'relative flex items-center justify-center',
        'border-2 rounded-lg p-1',
        sizeClasses[size],
        config.bgColor,
        config.borderColor,
        config.color,
        isActive && 'ring-2 ring-amber-400 ring-offset-1'
      )}>
        {config.symbol}
      </div>
      
      {/* Label */}
      {showLabel && (
        <span className={cn(
          'font-medium',
          size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : 'text-sm',
          isActive ? 'text-stone-900 dark:text-white font-semibold' : 'text-stone-600 dark:text-stone-400'
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
};

// Filter Bar Component
export const ProfessionalRarityFilterBar: React.FC<{
  selectedRarity: string | null;
  onRaritySelect: (rarity: string | null) => void;
  availableRarities: string[];
  className?: string;
}> = ({ selectedRarity, onRaritySelect, availableRarities, className = '' }) => {
  // Group rarities by category
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
  
  const groupedRarities = { basic, holo, special, other };

  return (
    <div className={cn(
      'p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700',
      className
    )}>
      {/* All Cards Button */}
      <button
        onClick={() => onRaritySelect(null)}
        className={cn(
          'mb-3 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          selectedRarity === null
            ? 'bg-amber-600 text-white shadow-md'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
        )}
      >
        All Cards
      </button>
      
      {/* Rarity Groups */}
      <div className="space-y-3">
        {/* Basic Rarities */}
        {groupedRarities.basic.filter((r: string) => availableRarities.includes(r)).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wider">
              Basic
            </h4>
            <div className="flex flex-wrap gap-2">
              {groupedRarities.basic.filter((r: string) => availableRarities.includes(r)).map((rarity: string) => (
                <ProfessionalRarityIcon
                  key={rarity}
                  rarity={rarity}
                  size="sm"
                  onClick={() => onRaritySelect(rarity)}
                  isActive={selectedRarity === rarity}
                  showLabel={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Holo Rarities */}
        {groupedRarities.holo.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wider">
              Holo Variants
            </h4>
            <div className="flex flex-wrap gap-2">
              {groupedRarities.holo.map((rarity: string) => (
                <ProfessionalRarityIcon
                  key={rarity}
                  rarity={rarity}
                  size="sm"
                  onClick={() => onRaritySelect(rarity)}
                  isActive={selectedRarity === rarity}
                  showLabel={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Special Rarities */}
        {groupedRarities.special.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wider">
              Special
            </h4>
            <div className="flex flex-wrap gap-2">
              {groupedRarities.special.map((rarity: string) => (
                <ProfessionalRarityIcon
                  key={rarity}
                  rarity={rarity}
                  size="sm"
                  onClick={() => onRaritySelect(rarity)}
                  isActive={selectedRarity === rarity}
                  showLabel={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Other Rarities */}
        {groupedRarities.other.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wider">
              Other
            </h4>
            <div className="flex flex-wrap gap-2">
              {groupedRarities.other.map((rarity: string) => (
                <ProfessionalRarityIcon
                  key={rarity}
                  rarity={rarity}
                  size="sm"
                  onClick={() => onRaritySelect(rarity)}
                  isActive={selectedRarity === rarity}
                  showLabel={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalRarityIcon;