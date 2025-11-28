import React, { useState, useEffect } from 'react';
import { GlassContainer } from './design-system/GlassContainer';
import { cn } from '@/utils/cn';

interface RarityOption {
  value: string;
  label: string;
  count: number;
  color: string;
  gradient: string;
  icon: string;
  glow?: string;
}

interface EnhancedRarityFilterProps {
  rarities: Record<string, number>;
  selectedRarity: string;
  onRarityChange: (rarity: string) => void;
  className?: string;
  showLegend?: boolean;
}

export const EnhancedRarityFilter: React.FC<EnhancedRarityFilterProps> = ({
  rarities,
  selectedRarity,
  onRarityChange,
  className = '',
  showLegend = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredRarity, setHoveredRarity] = useState<string | null>(null);
  const [rarityOptions, setRarityOptions] = useState<RarityOption[]>([]);

  // Map rarities to visual options with enhanced visuals
  useEffect(() => {
    const options: RarityOption[] = Object.entries(rarities).map(([rarity, count]) => {
      return mapRarityToOption(rarity, count);
    });
    
    // Sort by custom order (premium rarities first)
    options.sort((a, b) => {
      const order = ['Gold Star', 'Silver Star', 'Diamond', 'Crown', 'Immersive', 'Secret', 'Rainbow', 'Ultra', 'Special', 'Rare'];
      const aIndex = order.findIndex(o => a.label.includes(o));
      const bIndex = order.findIndex(o => b.label.includes(o));
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    
    setRarityOptions(options);
  }, [rarities]);

  const mapRarityToOption = (rarity: string, count: number): RarityOption => {
    const lower = rarity.toLowerCase();
    
    // Gold Star (new premium rarity)
    if (lower.includes('gold star')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-yellow-500',
        gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
        icon: 'GS',
        glow: '0 0 30px rgba(251, 191, 36, 0.6)'
      };
    }
    
    // Silver Star (new premium rarity)
    if (lower.includes('silver star')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-stone-300',
        gradient: 'from-stone-300 via-stone-100 to-stone-300',
        icon: 'SS',
        glow: '0 0 25px rgba(209, 213, 219, 0.6)'
      };
    }
    
    // Diamond (new premium rarity)
    if (lower.includes('diamond')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-cyan-400',
        gradient: 'from-cyan-300 via-cyan-300 to-cyan-400',
        icon: 'D',
        glow: '0 0 25px rgba(34, 211, 238, 0.6)'
      };
    }
    
    // Crown (Pokemon TCG Pocket)
    if (lower.includes('crown')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-yellow-400',
        gradient: 'from-yellow-300 via-amber-400 to-yellow-500',
        icon: 'CR',
        glow: '0 0 20px rgba(251, 191, 36, 0.5)'
      };
    }
    
    // Secret Rare
    if (lower.includes('secret')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-amber-500',
        gradient: 'from-amber-400 via-pink-400 to-amber-500',
        icon: 'SR',
        glow: '0 0 20px rgba(217, 119, 6, 0.5)'
      };
    }
    
    // Rainbow Rare
    if (lower.includes('rainbow')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-pink-500',
        gradient: 'from-red-400 via-yellow-400 via-green-400 via-cyan-400 to-amber-400',
        icon: 'RR',
        glow: '0 0 20px rgba(236, 72, 153, 0.5)'
      };
    }
    
    // Ultra Rare
    if (lower.includes('ultra')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-red-500',
        gradient: 'from-red-400 to-red-600',
        icon: 'UR',
        glow: '0 0 15px rgba(239, 68, 68, 0.4)'
      };
    }
    
    // VSTAR
    if (lower.includes('vstar')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-yellow-500',
        gradient: 'from-yellow-300 via-yellow-400 to-orange-400',
        icon: 'VS',
        glow: '0 0 20px rgba(234, 179, 8, 0.4)'
      };
    }
    
    // V
    if (lower.includes(' v') || lower.endsWith(' v')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-amber-500',
        gradient: 'from-amber-400 to-amber-500',
        icon: 'V',
        glow: '0 0 15px rgba(217, 119, 6, 0.4)'
      };
    }
    
    // VMAX
    if (lower.includes('vmax')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-red-500',
        gradient: 'from-red-400 to-amber-500',
        icon: 'VM',
        glow: '0 0 15px rgba(239, 68, 68, 0.4)'
      };
    }
    
    // EX
    if (lower.includes(' ex') || lower.endsWith(' ex')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-amber-500',
        gradient: 'from-amber-400 to-amber-500',
        icon: 'EX',
        glow: '0 0 15px rgba(217, 119, 6, 0.4)'
      };
    }
    
    // GX
    if (lower.includes(' gx') || lower.endsWith(' gx')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-amber-500',
        gradient: 'from-amber-400 to-amber-500',
        icon: 'GX',
        glow: '0 0 15px rgba(217, 119, 6, 0.4)'
      };
    }
    
    // Rare Holo
    if (lower.includes('holo')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-amber-400',
        gradient: 'from-amber-300 to-amber-400',
        icon: 'H',
        glow: '0 0 10px rgba(217, 119, 6, 0.3)'
      };
    }
    
    // Rare
    if (lower.includes('rare')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-yellow-400',
        gradient: 'from-yellow-300 to-yellow-500',
        icon: 'R',
        glow: '0 0 10px rgba(250, 204, 21, 0.3)'
      };
    }
    
    // Uncommon
    if (lower.includes('uncommon')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-green-400',
        gradient: 'from-green-300 to-green-500',
        icon: 'U',
        glow: '0 0 8px rgba(74, 222, 128, 0.3)'
      };
    }
    
    // Common
    if (lower.includes('common')) {
      return {
        value: rarity,
        label: rarity,
        count,
        color: 'text-stone-400',
        gradient: 'from-stone-300 to-stone-500',
        icon: 'C',
        glow: ''
      };
    }
    
    // Default
    return {
      value: rarity,
      label: rarity,
      count,
      color: 'text-stone-500',
      gradient: 'from-stone-400 to-stone-600',
      icon: '?',
      glow: ''
    };
  };

  const totalCards = Object.values(rarities).reduce((sum, count) => sum + count, 0);
  const selectedOption = rarityOptions.find(opt => opt.value === selectedRarity);

  return (
    <div className={cn('space-y-4', className)}>
      <GlassContainer
        variant="default"
        blur="md"
        rounded="3xl"
        className="overflow-hidden"
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full px-4 py-3 flex items-center justify-between',
            'hover:bg-white/10 dark:hover:bg-stone-700/10',
            'transition-all duration-300'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                Rarity Filter
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {selectedRarity ? (
                  <span className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-bold',
                      'backdrop-blur-md border border-white/30'
                    )}
                    style={{
                      background: selectedOption ? `linear-gradient(135deg, ${selectedOption.gradient.replace('from-', '').replace('to-', '').split(' ')[0]}88, ${selectedOption.gradient.replace('from-', '').replace('to-', '').split(' ').pop()}88)` : ''
                    }}>
                      {selectedOption?.icon}
                    </span>
                    {selectedRarity} ({selectedOption?.count} cards)
                  </span>
                ) : (
                  `All Rarities (${totalCards} cards)`
                )}
              </p>
            </div>
          </div>
          
          <svg
            className={cn(
              'w-5 h-5 text-stone-600 dark:text-stone-400 transition-transform duration-300',
              isExpanded && 'rotate-180'
            )}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded Options */}
          {isExpanded && (
            <div
              className="overflow-hidden transition-all duration-300"
            >
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {/* All Rarities Option */}
                  <button
                    onClick={() => {
                      onRarityChange('');
                      setIsExpanded(false);
                    }}
                    className={cn(
                      'relative px-3 py-2 rounded-2xl',
                      'bg-gradient-to-r from-stone-100/80 to-stone-200/80',
                      'backdrop-blur-md border border-white/30',
                      'hover:from-stone-200/90 hover:to-stone-300/90',
                      'hover:scale-105 active:scale-95',
                      'transition-all duration-300',
                      !selectedRarity && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent'
                    )}
                  >
                    <div className="text-xs font-bold text-stone-700">ALL</div>
                    <div className="text-xs text-stone-600 mt-1">
                      {Object.values(rarities).reduce((sum, count) => sum + count, 0)} cards
                    </div>
                  </button>

                  {/* Individual Rarity Options */}
                  {rarityOptions.map((option) => (
                    <button
                      key={option.value}
                      onMouseEnter={() => setHoveredRarity(option.value)}
                      onMouseLeave={() => setHoveredRarity(null)}
                      onClick={() => {
                        onRarityChange(option.value);
                        setIsExpanded(false);
                      }}
                      className={cn(
                        'relative px-3 py-2 rounded-2xl',
                        'backdrop-blur-md border border-white/30',
                        'hover:scale-105 active:scale-95',
                        'transition-all duration-300',
                        selectedRarity === option.value && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent'
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${option.gradient.replace('from-', '').replace('to-', '').split(' ')[0]}88, ${option.gradient.replace('from-', '').replace('to-', '').split(' ').pop()}88)`,
                        boxShadow: hoveredRarity === option.value ? option.glow : undefined
                      }}
                    >
                      <div className="text-lg font-bold text-white drop-shadow-lg">
                        {option.icon}
                      </div>
                      <div className="text-xs text-white/90 mt-1 drop-shadow">
                        {option.count}
                      </div>
                      
                      {/* Sparkle effect on hover */}
                      {hoveredRarity === option.value && (
                        <div
                          className="absolute inset-0 rounded-2xl pointer-events-none opacity-100 transition-opacity"
                        >
                          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75" />
                          <div className="absolute top-3 left-3 w-1 h-1 bg-white rounded-full animate-pulse delay-150" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
      </GlassContainer>

      {/* Visual Rarity Legend (shown when expanded) */}
        {isExpanded && showLegend && (
          <div
            className="mt-4 transition-all duration-200"
          >
            <GlassContainer variant="outline" rounded="2xl" className="p-4">
              <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-3">
                Rarity Legend
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold">GS</span>
                  <span className="text-stone-600 dark:text-stone-400">Gold Star</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-stone-300 to-stone-400 flex items-center justify-center text-white font-bold">SS</span>
                  <span className="text-stone-600 dark:text-stone-400">Silver Star</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-300 to-cyan-400 flex items-center justify-center text-white font-bold">D</span>
                  <span className="text-stone-600 dark:text-stone-400">Diamond</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold">SR</span>
                  <span className="text-stone-600 dark:text-stone-400">Secret Rare</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-400 to-amber-400 flex items-center justify-center text-white font-bold">RR</span>
                  <span className="text-stone-600 dark:text-stone-400">Rainbow Rare</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-white font-bold">UR</span>
                  <span className="text-stone-600 dark:text-stone-400">Ultra Rare</span>
                </div>
              </div>
            </GlassContainer>
          </div>
        )}
    </div>
  );
};