import React from 'react';
import Image from 'next/image';
import { getRarityDisplay } from '../../data/tcgRarity';

export const RarityBadge = ({ 
  rarity, 
  isPocket = false, 
  showName = false, 
  size = 'md',
  showImage = true 
}) => {
  const rarityInfo = getRarityDisplay(rarity, isPocket);
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };
  
  const imageSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };
  
  return (
    <div className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}>
      {showImage && rarityInfo.image ? (
        <div className={`relative`} style={{ width: imageSizes[size], height: imageSizes[size] }}>
          <Image
            src={rarityInfo.image}
            alt={rarityInfo.name}
            layout="fill"
            objectFit="contain"
          />
        </div>
      ) : (
        <span className={`font-bold ${rarityInfo.color}`}>
          {rarityInfo.symbol}
        </span>
      )}
      {showName && (
        <span className={`font-medium ${rarityInfo.color}`}>
          {rarityInfo.name}
        </span>
      )}
    </div>
  );
};

// Component to display multiple rarity options
export const RaritySelector = ({ 
  selectedRarity, 
  onSelect, 
  isPocket = false,
  className = "" 
}) => {
  const rarityData = isPocket ? 
    ['common', 'uncommon', 'rare', 'doubleRare', 'artRare', 'superRare', 'immersiveRare', 'crown'] :
    ['common', 'uncommon', 'rare', 'rareHolo', 'ultraRare', 'secretRare'];
    
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {rarityData.map(rarity => {
        const rarityInfo = getRarityDisplay(rarity, isPocket);
        const isSelected = selectedRarity === rarity;
        
        return (
          <button
            key={rarity}
            onClick={() => onSelect(rarity)}
            className={`px-3 py-2 rounded-lg border-2 transition-all ${
              isSelected 
                ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <RarityBadge 
              rarity={rarity} 
              isPocket={isPocket} 
              showName={true}
              size="sm"
            />
          </button>
        );
      })}
    </div>
  );
};