import React from 'react';
import { cn } from '@/utils/cn';
import logger from '@/utils/logger';

interface RarityIconProps {
  rarity: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

// SVG Icon Components
const StarIcon = ({ className, hollow = false }: { className?: string; hollow?: boolean | 'mixed' }) => (
  <svg className={className} viewBox="0 0 24 24" fill={hollow ? "none" : "currentColor"} stroke={hollow ? "currentColor" : "none"} strokeWidth={hollow ? "2" : "0"}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const DiamondIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4L20 12L12 20L4 12z" />
  </svg>
);

const CircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

const CrownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.86-2h8.28l.96-5.2-2.65 2.2L12 8l-2.45 3-2.65-2.2L7.86 14z" />
  </svg>
);

// Map rarity strings to visual icons matching official Pokemon TCG specification
const rarityIcons: Record<string, { icon: React.FC<{className?: string; hollow?: boolean | 'mixed'}>; color: string; label: string; hollow?: boolean | 'mixed'; count?: number }> = {
  // Basic Rarities (Black symbols)
  'Common': { icon: CircleIcon, color: 'text-gray-900 dark:text-gray-100', label: 'Common', count: 1 },
  'Uncommon': { icon: DiamondIcon, color: 'text-gray-900 dark:text-gray-100', label: 'Uncommon', count: 1 },
  
  // Black star rarities
  'Rare': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'Rare', count: 1 },
  'Rare Holo': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'Rare Holo', count: 1 },
  
  // Black & White era special rarity (1 filled black star + 1 hollow grey star)
  'Black & White Rare': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'B&W Rare', count: 2, hollow: 'mixed' as const },
  'Black White Rare': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'B&W Rare', count: 2, hollow: 'mixed' as const }, // API returns without &
  
  // Double black star
  'Double Rare': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'Double Rare', count: 2 },
  
  // White/Silver star rarities (Ultra Rare)
  'Ultra Rare': { icon: StarIcon, color: 'text-gray-300 dark:text-gray-400', label: 'Ultra Rare', count: 2 },
  'Rare Ultra': { icon: StarIcon, color: 'text-gray-300 dark:text-gray-400', label: 'Ultra Rare', count: 2 },
  'Rare Holo EX': { icon: StarIcon, color: 'text-gray-300 dark:text-gray-400', label: 'EX', count: 2 },
  'Rare Holo GX': { icon: StarIcon, color: 'text-gray-300 dark:text-gray-400', label: 'GX', count: 2 },
  'Rare Holo V': { icon: StarIcon, color: 'text-gray-300 dark:text-gray-400', label: 'V', count: 2 },
  'Rare Holo VMAX': { icon: StarIcon, color: 'text-gray-300 dark:text-gray-400', label: 'VMAX', count: 2 },
  'Rare Holo VSTAR': { icon: StarIcon, color: 'text-gray-300 dark:text-gray-400', label: 'VSTAR', count: 2 },
  
  // Gold star rarities
  'Illustration Rare': { icon: StarIcon, color: 'text-yellow-500', label: 'Illustration Rare', count: 1 },
  'Rare Illustration': { icon: StarIcon, color: 'text-yellow-500', label: 'Illustration Rare', count: 1 },
  
  // Double gold star
  'Special Illustration Rare': { icon: StarIcon, color: 'text-yellow-500', label: 'SIR', count: 2 },
  'Rare Special Illustration': { icon: StarIcon, color: 'text-yellow-500', label: 'SIR', count: 2 },
  
  // Triple gold star (Hyper Rare)
  'Hyper Rare': { icon: StarIcon, color: 'text-yellow-500', label: 'Hyper Rare', count: 3 },
  'Rare Secret': { icon: StarIcon, color: 'text-yellow-500', label: 'Secret Rare', count: 3 },
  'Rare Rainbow': { icon: StarIcon, color: 'text-yellow-500', label: 'Rainbow Rare', count: 3 },
  
  // ACE SPEC (Magenta star)
  'ACE SPEC Rare': { icon: StarIcon, color: 'text-pink-600', label: 'ACE SPEC', count: 1 },
  
  // Shiny Vault (Hollow gold star)
  'Rare Shining': { icon: StarIcon, color: 'text-yellow-500', label: 'Shining', hollow: true, count: 1 },
  'Shiny Rare': { icon: StarIcon, color: 'text-yellow-500', label: 'Shiny', hollow: true, count: 1 },
  'Shiny Ultra Rare': { icon: StarIcon, color: 'text-yellow-500', label: 'Shiny Ultra', hollow: true, count: 2 },
  
  // Black & White era rarities
  'Rare Holo Lv.X': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'Lv.X', count: 1 },
  'Rare Prime': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'Prime', count: 1 },
  'Rare BREAK': { icon: StarIcon, color: 'text-yellow-500', label: 'BREAK', count: 1 },
  'LEGEND': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'LEGEND', count: 2 },
  
  // Other special rarities
  'Amazing Rare': { icon: StarIcon, color: 'text-yellow-500', label: 'Amazing', count: 1 },
  'Radiant Rare': { icon: StarIcon, color: 'text-yellow-500', label: 'Radiant', count: 1 },
  'Trainer Gallery Rare Holo': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'TG Holo', count: 1 },
  'Promo': { icon: StarIcon, color: 'text-gray-900 dark:text-gray-100', label: 'Promo', count: 1 },
  'Crown Rare': { icon: CrownIcon, color: 'text-amber-500', label: 'Crown', count: 1 },
};

// Define rarity order from lowest to highest
export const RARITY_ORDER = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Rare Holo Lv.X',
  'Rare Prime',
  'Double Rare',
  'Rare Holo V',
  'Rare Holo EX',
  'Rare Holo GX',
  'Rare Holo VMAX',
  'Rare Holo VSTAR',
  'Rare BREAK',
  'LEGEND',
  'Ultra Rare',
  'Rare Ultra',
  'Illustration Rare',
  'Rare Illustration',
  'Special Illustration Rare',
  'Rare Special Illustration',
  'Hyper Rare',
  'Black & White Rare', // Replaces Hyper Rare in certain sets
  'Black White Rare', // API returns without &
  'Rare Secret',
  'Rare Rainbow',
  'ACE SPEC Rare',
  'Amazing Rare',
  'Radiant Rare',
  'Rare Shining',
  'Shiny Rare',
  'Shiny Ultra Rare',
  'Trainer Gallery Rare Holo',
  'Crown Rare',
  'Promo'
];

// Helper function to get rarity rank
export const getRarityRank = (rarity: string): number => {
  const index = RARITY_ORDER.indexOf(rarity);
  return index !== -1 ? index : 999; // Unknown rarities go to the end
};

const sizeClasses = {
  xs: 'text-xs w-4 h-4',
  sm: 'text-sm w-5 h-5',
  md: 'text-base w-6 h-6',
  lg: 'text-lg w-8 h-8',
  xl: 'text-xl w-10 h-10'
};

export const RarityIcon: React.FC<RarityIconProps> = ({
  rarity,
  size = 'md',
  className = '',
  showLabel = false,
  onClick,
  isActive = false
}) => {
  // Debug: Check what rarity is being passed
  const rarityData = rarityIcons[rarity];
  if (!rarityData) {
    logger.debug(`Unknown rarity: "${rarity}" - defaulting to Common`);
  }
  const finalRarityData = rarityData || rarityIcons['Common'];
  const IconComponent = finalRarityData.icon;
  const count = finalRarityData.count || 1;
  
  // Render icons matching Pokemon TCG style with proper spacing
  const renderIcons = () => {
    // Bigger star sizes for better visibility
    const starSize = size === 'xs' ? 'w-4 h-4' : size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-7 h-7';
    // Make Common and Uncommon symbols bigger
    const commonUncommonSize = size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-7 h-7' : 'w-8 h-8';
    const otherSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    
    if (IconComponent === StarIcon) {
      const color = finalRarityData.color;
      
      if (count === 3) {
        // Triangle formation for 3 stars with better spacing (no overlap)
        return (
          <div className="relative inline-block" style={{ width: '32px', height: '28px' }}>
            {/* Top center star */}
            <StarIcon className={cn(color, starSize, 'absolute', 'left-1/2 -translate-x-1/2 top-0')} hollow={finalRarityData.hollow} />
            {/* Bottom left star - adjusted position */}
            <StarIcon className={cn(color, starSize, 'absolute', 'left-0 bottom-0')} hollow={finalRarityData.hollow} />
            {/* Bottom right star - adjusted position */}
            <StarIcon className={cn(color, starSize, 'absolute', 'right-0 bottom-0')} hollow={finalRarityData.hollow} />
          </div>
        );
      } else if (count === 2) {
        // Check if it's the Black & White special rarity (mixed hollow)
        if (finalRarityData.hollow === 'mixed') {
          // Black & White Rare: first star filled black, second star hollow grey
          return (
            <div className="relative inline-block" style={{ width: '26px', height: '22px' }}>
              {/* Top left star - filled black */}
              <StarIcon className={cn('text-gray-900 dark:text-gray-100', starSize, 'absolute left-0 top-0')} hollow={false} />
              {/* Bottom right star - hollow grey */}
              <StarIcon className={cn('text-gray-500 dark:text-gray-600', starSize, 'absolute right-0 bottom-0')} hollow={true} />
            </div>
          );
        } else {
          // Better spacing for 2 stars (Special Illustration Rare, etc.)
          return (
            <div className="relative inline-block" style={{ width: '26px', height: '22px' }}>
              {/* Top left star */}
              <StarIcon className={cn(color, starSize, 'absolute left-0 top-0')} hollow={finalRarityData.hollow} />
              {/* Bottom right star with proper spacing */}
              <StarIcon className={cn(color, starSize, 'absolute right-0 bottom-0')} hollow={finalRarityData.hollow} />
            </div>
          );
        }
      } else {
        // Single star (Rare, Holo, Illustration)
        return <StarIcon className={cn(color, starSize)} hollow={finalRarityData.hollow} />;
      }
    } else if (IconComponent === DiamondIcon) {
      // Single diamond for Uncommon - use bigger size
      return <DiamondIcon className={cn(finalRarityData.color, commonUncommonSize)} />;
    } else if (IconComponent === CircleIcon) {
      // Single circle for Common - use bigger size
      return <CircleIcon className={cn(finalRarityData.color, commonUncommonSize)} />;
    } else if (IconComponent === CrownIcon) {
      // Crown for Crown Rare (amber/gold)
      return <CrownIcon className={cn(finalRarityData.color, starSize)} />;
    }
    
    // Default fallback
    return <IconComponent className={cn(finalRarityData.color, otherSize)} />;
  };
  
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1',
        onClick && 'cursor-pointer hover:scale-110 transition-transform',
        isActive && 'scale-110',
        className
      )}
      onClick={onClick}
    >
      {/* Icons without containers - pure Pokemon TCG style */}
      {renderIcons()}
      
      {/* Label */}
      {showLabel && (
        <span className={cn(
          'text-xs font-medium ml-1',
          isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
        )}>
          {finalRarityData.label}
        </span>
      )}
    </div>
  );
};

// Component for displaying all rarities as a filter bar
export const RarityFilterBar: React.FC<{
  selectedRarity: string | null;
  onRaritySelect: (rarity: string | null) => void;
  availableRarities: string[];
  className?: string;
}> = ({ selectedRarity, onRaritySelect, availableRarities, className = '' }) => {
  return (
    <div className={cn(
      'flex flex-wrap gap-2 p-3',
      'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80',
      'rounded-2xl border border-white/50 dark:border-gray-700/50',
      'shadow-lg',
      className
    )}>
      {/* All Cards Option */}
      <button
        onClick={() => onRaritySelect(null)}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium',
          'backdrop-blur-md transition-all duration-200',
          selectedRarity === null
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
            : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70'
        )}
      >
        All Cards
      </button>
      
      {/* Rarity Icons */}
      {availableRarities.map((rarity) => (
        <RarityIcon
          key={rarity}
          rarity={rarity}
          size="sm"
          onClick={() => onRaritySelect(rarity)}
          isActive={selectedRarity === rarity}
          showLabel={false}
        />
      ))}
    </div>
  );
};

export default RarityIcon;