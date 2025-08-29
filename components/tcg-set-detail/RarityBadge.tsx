import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface RarityBadgeProps {
  rarity: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

// Map rarity names to actual TCG rarity image files
const rarityImageMap: Record<string, string> = {
  // Basic rarities
  'Common': '/images/TCG-rarity/120px-Rarity_Common.png',
  'Uncommon': '/images/TCG-rarity/120px-Rarity_Uncommon.png',
  'Rare': '/images/TCG-rarity/120px-Rarity_Rare.png',
  
  // Holo variations
  'Rare Holo': '/images/TCG-rarity/Rarity_Rare_Holo.png',
  'Common Holo': '/images/TCG-rarity/Rarity_Common_Holo.png',
  'Uncommon Holo': '/images/TCG-rarity/Rarity_Uncommon_Holo.png',
  
  // Modern rarities
  'Double Rare': '/images/TCG-rarity/120px-Rarity_Double_Rare.png',
  'Hyper Rare': '/images/TCG-rarity/120px-Rarity_Hyper_Rare.png',
  'Illustration Rare': '/images/TCG-rarity/120px-Rarity_Special_Illustration_Rare.png',
  'Special Illustration Rare': '/images/TCG-rarity/120px-Rarity_Special_Illustration_Rare.png',
  
  // V series
  'Rare Holo V': '/images/TCG-rarity/Rarity_Rare_Holo.png',
  'Rare Holo VMAX': '/images/TCG-rarity/Rarity_Holo_Rare_VMAX.png',
  'Rare Holo VSTAR': '/images/TCG-rarity/Rarity_Holo_Rare_VSTAR.png',
  
  // Special rarities
  'Rare Ultra': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Rare Secret': '/images/TCG-rarity/Rarity_Rare_Secret.png',
  'Rare Rainbow': '/images/TCG-rarity/Rarity_Rare_Rainbow.png',
  'Rare Shining': '/images/TCG-rarity/Rarity_Rare_Shining.png',
  'Rare Shiny': '/images/TCG-rarity/Rarity_Rare_Shiny.png',
  'Rare Gold': '/images/TCG-rarity/Rarity_Rare_Secret.png',
  'Amazing Rare': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Radiant Rare': '/images/TCG-rarity/Rarity_Radiant_Rare.png',
  
  // EX/GX series
  'Rare Holo EX': '/images/TCG-rarity/Rarity_Rare_Holo_ex.png',
  'Rare Holo GX': '/images/TCG-rarity/Rarity_Rare_Shiny_GX.png',
  'Rare Shiny GX': '/images/TCG-rarity/Rarity_Rare_Shiny_GX.png',
  'Rare Ultra GX': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  
  // Trainer Gallery
  'Trainer Gallery Rare Holo': '/images/TCG-rarity/Rarity_Trainer_Gallery_Holo_Rare.png',
  'Trainer Gallery Ultra Rare': '/images/TCG-rarity/Rarity_Trainer_Gallery_Ultra_Rare.png',
  'Trainer Gallery Secret Rare': '/images/TCG-rarity/Rarity_Trainer_Gallery_Secret_Rare.png',
  
  // ACE SPEC
  'ACE SPEC Rare': '/images/TCG-rarity/Rarity_Rare_ACE.png',
  
  // Prime/BREAK/etc
  'Rare Prime': '/images/TCG-rarity/Rarity_Rare_Prime.png',
  'Rare BREAK': '/images/TCG-rarity/Rarity_Rare_BREAK.png',
  'Rare Holo LV.X': '/images/TCG-rarity/Rarity_Rare_Holo_LV.X.png',
  'Rare Holo LEGEND': '/images/TCG-rarity/Rarity_Rare_Holo_LEGEND.png',
  
  // Shiny variations
  'Shiny Rare': '/images/TCG-rarity/120px-Rarity_ShinyRare.png',
  'Shiny Ultra Rare': '/images/TCG-rarity/120px-Rarity_Shiny_Ultra_Rare.png',
  
  // Classic
  'Classic Collection': '/images/TCG-rarity/Rarity_Classic_Collection.png',
  
  // Promo
  'Promo': '/images/TCG-rarity/Rarity_PR.png'
};

// Size configurations
const sizeConfig = {
  xs: { width: 16, height: 16, labelSize: 'text-[10px]' },
  sm: { width: 20, height: 20, labelSize: 'text-xs' },
  md: { width: 24, height: 24, labelSize: 'text-sm' },
  lg: { width: 32, height: 32, labelSize: 'text-base' }
};

// Get display label for rarity
const getRarityLabel = (rarity: string): string => {
  const labelMap: Record<string, string> = {
    'Rare Holo V': 'V',
    'Rare Holo VMAX': 'VMAX',
    'Rare Holo VSTAR': 'VSTAR',
    'Rare Holo EX': 'EX',
    'Rare Holo GX': 'GX',
    'Rare Ultra': 'Ultra',
    'Rare Secret': 'Secret',
    'Rare Rainbow': 'Rainbow',
    'Rare Shining': 'Shining',
    'Rare Shiny': 'Shiny',
    'Rare Gold': 'Gold',
    'Trainer Gallery Rare Holo': 'TG',
    'ACE SPEC Rare': 'ACE',
    'Double Rare': '★★',
    'Hyper Rare': 'Hyper',
    'Illustration Rare': 'IR',
    'Special Illustration Rare': 'SIR'
  };
  
  return labelMap[rarity] || rarity.replace('Rare ', '').replace('Holo ', '');
};

export const RarityBadge: React.FC<RarityBadgeProps> = ({
  rarity,
  size = 'md',
  showLabel = false,
  className = '',
  onClick,
  isActive = false
}) => {
  // Get the image path, fallback to common if not found
  const imagePath = rarityImageMap[rarity] || rarityImageMap['Common'];
  const config = sizeConfig[size];
  const label = getRarityLabel(rarity);
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity duration-200',
        isActive && 'ring-2 ring-purple-500 ring-offset-1 rounded-lg',
        className
      )}
      onClick={onClick}
      title={rarity}
    >
      {/* Rarity symbol image */}
      <div className="relative flex-shrink-0">
        <Image
          src={imagePath}
          alt={rarity}
          width={config.width}
          height={config.height}
          className={cn(
            'object-contain',
            isActive && 'drop-shadow-md'
          )}
          loading="lazy"
        />
      </div>
      
      {/* Optional label */}
      {showLabel && (
        <span className={cn(
          'font-medium whitespace-nowrap',
          config.labelSize,
          isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
        )}>
          {label}
        </span>
      )}
    </div>
  );
};

// Compact rarity filter bar using actual symbols
export const RarityFilterBar: React.FC<{
  selectedRarity: string | null;
  onRaritySelect: (rarity: string | null) => void;
  availableRarities: string[];
  className?: string;
}> = ({ selectedRarity, onRaritySelect, availableRarities, className = '' }) => {
  // Group rarities by category for better organization
  const groupedRarities = {
    basic: availableRarities.filter(r => ['Common', 'Uncommon', 'Rare'].includes(r)),
    holo: availableRarities.filter(r => r.includes('Holo') && !r.includes('Ultra')),
    ultra: availableRarities.filter(r => 
      r.includes('Ultra') || r.includes('Secret') || r.includes('Rainbow') || 
      r.includes('Gold') || r.includes('Hyper') || r.includes('Illustration')
    ),
    special: availableRarities.filter(r => 
      !['Common', 'Uncommon', 'Rare'].includes(r) && 
      !r.includes('Holo') && !r.includes('Ultra') && !r.includes('Secret') && 
      !r.includes('Rainbow') && !r.includes('Gold') && !r.includes('Hyper') && 
      !r.includes('Illustration')
    )
  };
  
  return (
    <div className={cn(
      'flex flex-wrap items-center gap-2 p-2',
      'bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg',
      'border border-gray-200/50 dark:border-gray-700/50 rounded-xl',
      className
    )}>
      {/* All cards button */}
      <button
        onClick={() => onRaritySelect(null)}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          selectedRarity === null
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        All
      </button>
      
      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
      
      {/* Rarity symbols */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Basic rarities */}
        {groupedRarities.basic.map(rarity => (
          <RarityBadge
            key={rarity}
            rarity={rarity}
            size="sm"
            onClick={() => onRaritySelect(rarity)}
            isActive={selectedRarity === rarity}
          />
        ))}
        
        {/* Separator if there are holo rarities */}
        {groupedRarities.holo.length > 0 && groupedRarities.basic.length > 0 && (
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
        )}
        
        {/* Holo rarities */}
        {groupedRarities.holo.map(rarity => (
          <RarityBadge
            key={rarity}
            rarity={rarity}
            size="sm"
            onClick={() => onRaritySelect(rarity)}
            isActive={selectedRarity === rarity}
          />
        ))}
        
        {/* Separator if there are ultra rarities */}
        {groupedRarities.ultra.length > 0 && (groupedRarities.basic.length > 0 || groupedRarities.holo.length > 0) && (
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
        )}
        
        {/* Ultra/Special rarities */}
        {groupedRarities.ultra.map(rarity => (
          <RarityBadge
            key={rarity}
            rarity={rarity}
            size="sm"
            onClick={() => onRaritySelect(rarity)}
            isActive={selectedRarity === rarity}
          />
        ))}
        
        {/* Special rarities if any */}
        {groupedRarities.special.length > 0 && (
          <>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            {groupedRarities.special.map(rarity => (
              <RarityBadge
                key={rarity}
                rarity={rarity}
                size="sm"
                onClick={() => onRaritySelect(rarity)}
                isActive={selectedRarity === rarity}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RarityBadge;