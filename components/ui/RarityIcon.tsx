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

// Map rarity strings to visual icons
const rarityIcons: Record<string, { icon: string; color: string; label: string; gradient?: string }> = {
  // Standard TCG Rarities
  'Common': { icon: '●', color: 'text-gray-400', label: 'Common' },
  'Uncommon': { icon: '◆', color: 'text-green-500', label: 'Uncommon' },
  'Rare': { icon: '★', color: 'text-yellow-500', label: 'Rare' },
  'Rare Holo': { icon: '★', color: 'text-yellow-400', label: 'Holo', gradient: 'from-yellow-400 to-yellow-600' },
  'Rare Holo EX': { icon: '★', color: 'text-red-500', label: 'EX', gradient: 'from-red-400 to-orange-500' },
  'Rare Holo GX': { icon: '★', color: 'text-blue-500', label: 'GX', gradient: 'from-blue-400 to-purple-500' },
  'Rare Holo V': { icon: '★', color: 'text-purple-500', label: 'V', gradient: 'from-purple-400 to-pink-500' },
  'Rare Holo VMAX': { icon: '★', color: 'text-purple-600', label: 'VMAX', gradient: 'from-purple-500 to-indigo-600' },
  'Rare Holo VSTAR': { icon: '★', color: 'text-yellow-600', label: 'VSTAR', gradient: 'from-yellow-500 to-orange-500' },
  'Rare Ultra': { icon: '★★', color: 'text-red-500', label: 'Ultra' },
  'Rare Secret': { icon: '★★★', color: 'text-purple-600', label: 'Secret', gradient: 'from-purple-500 to-pink-600' },
  'Rare Rainbow': { icon: '🌈', color: 'text-rainbow', label: 'Rainbow', gradient: 'from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400' },
  'Rare Shining': { icon: '✦', color: 'text-cyan-400', label: 'Shining', gradient: 'from-cyan-400 to-blue-500' },
  'Amazing Rare': { icon: '✨', color: 'text-yellow-500', label: 'Amazing', gradient: 'from-yellow-400 via-orange-400 to-red-400' },
  'Radiant Rare': { icon: '🌟', color: 'text-yellow-600', label: 'Radiant', gradient: 'from-yellow-500 to-yellow-300' },
  'Trainer Gallery Rare Holo': { icon: 'TG', color: 'text-blue-600', label: 'TG' },
  'ACE SPEC Rare': { icon: 'ACE', color: 'text-red-600', label: 'ACE' },
  'Promo': { icon: 'P', color: 'text-blue-500', label: 'Promo' },
  
  // Premium Rarities (custom additions)
  'Gold Star': { icon: '⭐', color: 'text-yellow-500', label: 'Gold Star', gradient: 'from-yellow-300 via-yellow-500 to-amber-600' },
  'Silver Star': { icon: '⭐', color: 'text-gray-400', label: 'Silver Star', gradient: 'from-gray-300 via-gray-400 to-gray-500' },
  'Diamond': { icon: '💎', color: 'text-cyan-400', label: 'Diamond', gradient: 'from-cyan-300 via-blue-400 to-purple-400' },
  'Platinum': { icon: '◈', color: 'text-gray-300', label: 'Platinum', gradient: 'from-gray-200 via-gray-300 to-gray-400' },
  
  // Illustration Rarities
  'Illustration Rare': { icon: '🎨', color: 'text-purple-500', label: 'Illustration' },
  'Special Illustration Rare': { icon: '🖼️', color: 'text-purple-600', label: 'Special Art', gradient: 'from-purple-500 via-pink-500 to-red-500' },
  'Hyper Rare': { icon: '⚡', color: 'text-yellow-600', label: 'Hyper', gradient: 'from-yellow-400 via-orange-500 to-red-500' },
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
  const rarityData = rarityIcons[rarity] || rarityIcons['Common'];
  
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
      {/* Icon Container with Glass Effect */}
      <div className={cn(
        'relative flex items-center justify-center rounded-full',
        'backdrop-blur-md',
        isActive ? 'bg-white/30 border-2 border-white/60' : 'bg-white/10 border border-white/20',
        'shadow-sm hover:shadow-md transition-all duration-200',
        sizeClasses[size]
      )}>
        {/* Gradient Background for Premium Rarities */}
        {rarityData.gradient && (
          <div className={cn(
            'absolute inset-0 rounded-full opacity-50',
            `bg-gradient-to-br ${rarityData.gradient}`
          )} />
        )}
        
        {/* Icon */}
        <span className={cn(
          'relative z-10 font-bold',
          rarityData.gradient ? 'text-white' : rarityData.color
        )}>
          {rarityData.icon}
        </span>
      </div>
      
      {/* Label */}
      {showLabel && (
        <span className={cn(
          'text-xs font-medium',
          isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
        )}>
          {rarityData.label}
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