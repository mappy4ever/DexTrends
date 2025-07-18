import React, { memo, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { TypeBadge } from "../TypeBadge";
import { CompactPriceIndicator } from "../PriceIndicator";
import { isFeatureEnabled } from "../../../utils/featureFlags";
import performanceMonitor from "../../../utils/performanceMonitor";
import { useSmartMemo, useSmartCallback, withOptimizations } from "../../../utils/reactOptimizations";
import { getPrice } from "../../../utils/pokemonutils";
import OptimizedImage from "../OptimizedImage";

// Rarity tiers for holographic effects (illustration rare and above only)
const getHolographicRarities = () => [
  'Illustration Rare',
  'Special Illustration Rare', 
  'Rare Ultra',
  'Rare Secret',
  'Rare Rainbow',
  'Rare Full Art',
  'Rare Prism Star',
  'Hyper Rare',
  'Trainer Gallery Rare',
  'Double Rare'
];

// Check if card should have holographic effects (illustration rare and above)
const shouldHaveHolographicEffect = (rarity: string | undefined): boolean => {
  if (!rarity) return false;
  const holoRarities = getHolographicRarities();
  return holoRarities.some(holoRarity => 
    rarity.toLowerCase().includes(holoRarity.toLowerCase()) ||
    rarity.toLowerCase().includes('secret') ||
    rarity.toLowerCase().includes('rainbow') ||
    rarity.toLowerCase().includes('illustration')
  );
};

// Get holographic CSS class
const getHolographicEffect = (rarity: string | undefined): string => {
  if (!shouldHaveHolographicEffect(rarity)) return '';
  return 'card-holographic';
};

// Get rarity glow effect
const getRarityGlowClass = (rarity: string | undefined): string => {
  if (!rarity) return '';
  if (rarity.toLowerCase().includes('secret') || rarity.toLowerCase().includes('rainbow')) {
    return 'shadow-lg shadow-purple-400/50';
  }
  if (rarity.toLowerCase().includes('illustration')) {
    return 'shadow-lg shadow-yellow-400/50';
  }
  if (shouldHaveHolographicEffect(rarity)) {
    return 'shadow-md shadow-blue-300/50';
  }
  return '';
};


// Rarity styling for TCG cards - moved to top to avoid hoisting issues
const rarityMap: Record<string, { label: string; color: string }> = {
  'Common': { label: 'C', color: 'bg-gray-200 border border-gray-400 text-gray-700' },
  'Uncommon': { label: 'U', color: 'bg-green-200 border border-green-500 text-green-900' },
  'Rare': { label: 'R', color: 'bg-yellow-200 border border-yellow-500 text-yellow-900' },
  'Rare Holo': { label: 'RH', color: 'bg-blue-100 border border-blue-400 text-blue-900' },
  'Rare Holo GX': { label: 'GX', color: 'bg-blue-200 border border-blue-700 text-blue-900' },
  'Rare Holo EX': { label: 'EX', color: 'bg-blue-50 border border-blue-400 text-blue-900' },
  'Rare Holo V': { label: 'V', color: 'bg-red-100 border border-red-400 text-red-800' },
  'Rare Holo VMAX': { label: 'VMAX', color: 'bg-red-200 border border-red-600 text-red-900' },
  'Rare Ultra': { label: 'UR', color: 'bg-purple-200 border border-purple-600 text-purple-900' },
  'Rare Secret': { label: 'SR', color: 'bg-pink-100 border border-pink-400 text-pink-800' },
  'Rare Rainbow': { label: 'RR', color: 'bg-gradient-to-r from-pink-100 via-yellow-100 to-blue-100 border border-gray-300 text-gray-800' },
  'Rare Full Art': { label: 'FA', color: 'bg-indigo-100 border border-indigo-400 text-indigo-900' },
  'Rare Prism Star': { label: 'PR', color: 'bg-black border border-yellow-300 text-yellow-200' },
  'Promo': { label: 'PR', color: 'bg-orange-100 border border-orange-400 text-orange-900' },
  'Illustration Rare': { label: 'IR', color: 'bg-amber-100 border border-amber-400 text-amber-900' },
  'Special Illustration Rare': { label: 'SIR', color: 'bg-fuchsia-100 border border-fuchsia-400 text-fuchsia-900' },
  'Double Rare': { label: 'RR', color: 'bg-yellow-300 border border-yellow-600 text-yellow-900' },
  'Hyper Rare': { label: 'HR', color: 'bg-cyan-100 border border-cyan-400 text-cyan-900' },
  'Shiny Rare': { label: 'ShR', color: 'bg-sky-100 border border-sky-400 text-sky-900' },
  'Trainer Gallery Rare': { label: 'TG', color: 'bg-rose-100 border border-rose-400 text-rose-900' },
  'Radiant Rare': { label: 'Rad', color: 'bg-lime-100 border border-lime-400 text-lime-900' },
};

// Helper function to derive set code from pack name
const deriveSetCode = (packName: string) => {
  if (!packName) return null;
  
  // Map pack names to their set codes
  const packToSetCode: Record<string, string> = {
    'Mewtwo': 'A1',
    'Charizard': 'A1',
    'Pikachu': 'A1',
    'Mythical Island': 'A1a',
    'Dialga': 'A2',
    'Palkia': 'A2',
    'Triumphant Light': 'A2a',
    'Shining Revelry': 'A2b',
    'Solgaleo': 'A3',
    'Lunala': 'A3',
    'Extradimensional Crisis': 'A3a',
    'Eevee Grove': 'A4'
  };
  
  return packToSetCode[packName] || packName.substring(0, 3).toUpperCase();
};

// Helper function to get display type (handles trainer subtypes)
const getDisplayType = (type: string, card: any) => {
  const lowerType = type.toLowerCase();
  
  // Check if it's a trainer card and infer subtype from patterns
  if (lowerType === 'trainer') {
    const name = card.name?.toLowerCase() || '';
    
    // Pattern-based detection for Fossils (very specific patterns only)
    const fossilPatterns = [
      /^helix fossil$/, /^dome fossil$/, /^old amber$/
    ];
    
    // Pattern-based detection for Tools (equipment that stays in play)
    const toolPatterns = [
      /tool$/, 
      // Equipment and gear
      /^rocky helmet/, /^muscle band/, /^leftovers/, /^float stone/, /^choice band/, /^focus sash/, /^weakness policy/, /^air balloon/,
      // Berries (tools in Pocket)
      /berry$/, /^lam berry/, /^oran berry/, /^sitrus berry/, /^pecha berry/, /^cheri berry/, /^aspear berry/,
      // Capes and clothing
      /cape$/, /^giant cape/, /^rescue cape/,
      // Bands and accessories  
      /band$/, /^poison band/, /^expert band/, /^team band/,
      // Barbs and spikes
      /barb$/, /^poison barb/, /^toxic barb/,
      // Cords and cables
      /cord$/, /^electrical cord/, /^power cord/,
      // Stones and items that modify Pokemon
      /stone$/, /^evolution stone/, /^fire stone/, /^water stone/, /^thunder stone/, /^leaf stone/,
      // Protection items
      /^protective/, /^defense/, /^shield/,
      // Energy modifying tools
      /^energy/, /^double colorless energy/, /^rainbow energy/,
      // Other common tool patterns
      /^lucky/, /^amulet/, /^charm/, /^crystal/, /^scope/, /^specs/, /^goggles/
    ];
    
    // Pattern-based detection for Supporters (people/characters)
    const supporterPatterns = [
      // Titles and roles
      /^professor/, /^dr\./, /^mr\./, /^ms\./, /^mrs\./, /^captain/, /^gym leader/, /^elite/,
      /^team .* (grunt|admin|boss|leader)/, /grunt$/, /admin$/, /boss$/,
      // Common supporter endings
      /'s (advice|training|encouragement|help|research|orders|conviction|dedication|determination|resolve)$/,
      // Research and academic
      /research$/, /analysis$/, /theory$/,
      // Known supporter names (add more as needed)
      /^(erika|misty|blaine|koga|giovanni|brock|lt\. surge|sabrina|bill|oak|red)$/,
      /^(blue|green|yellow|gold|silver|crystal|ruby|sapphire)$/,
      /^(cynthia|lance|steven|wallace|diantha|iris|alder)$/,
      // Team members and roles
      /^team/, /rocket/, /aqua/, /magma/, /galactic/, /plasma/, /flare/
    ];
    
    // Common item patterns (check before supporter patterns)
    const itemPatterns = [
      /potion$/, /^potion$/, /^super potion/, /^hyper potion/, /^max potion/,
      /ball$/, /^poke ball/, /^great ball/, /^ultra ball/,
      /^x /, // X Speed, X Attack, etc.
      /^switch/, /^rope/, /candy$/, /^rare candy/
    ];
    
    // Check patterns in order of specificity
    if (fossilPatterns.some(pattern => pattern.test(name))) {
      return 'Fossil';
    }
    
    if (toolPatterns.some(pattern => pattern.test(name))) {
      return 'Tool';
    }
    
    if (itemPatterns.some(pattern => pattern.test(name))) {
      return 'Item';
    }
    
    if (supporterPatterns.some(pattern => pattern.test(name))) {
      return 'Supporter';
    }
    
    // Check if it's a character name or role
    const words = card.name?.split(' ') || [];
    if (words.length <= 3 && words[0] && /^[A-Z]/.test(words[0])) {
      // Check if it contains person/role indicators
      const personIndicators = ['grunt', 'admin', 'boss', 'leader', 'trainer', 'champion', 'rival'];
      if (personIndicators.some(indicator => name.includes(indicator))) {
        return 'Supporter';
      }
      // Single word, capitalized - likely a character name  
      if (words.length === 1 && /^[A-Z][a-z]+$/.test(words[0])) {
        return 'Supporter';
      }
    }
    
    // Everything else is an Item (most common trainer subtype)
    // This includes:
    // - All Pokéballs (Poké Ball, Great Ball, Ultra Ball, etc.)
    // - Potions (Potion, Super Potion, Hyper Potion, etc.)
    // - X items (X Speed, X Attack, etc.)
    // - Switches and escape items
    // - Rare Candy, Evolution items
    // - Any card that has effects but isn't a Tool, Supporter, or Fossil
    // - Fossils that don't match the specific fossil patterns (treated as items)
    return 'Item';
  }
  
  // For all other types, just capitalize normally
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

// Type color classes for pocket cards - matching TypeBadge component colors
const getTypeColorClass = (type: string, displayType: string) => {
  const typeColorMap: Record<string, string> = {
    fire: 'bg-red-500 text-white border-red-600',
    water: 'bg-blue-500 text-white border-blue-600',
    grass: 'bg-green-500 text-white border-green-600',
    electric: 'bg-yellow-400 text-black border-yellow-500',
    lightning: 'bg-yellow-400 text-black border-yellow-500',
    psychic: 'bg-pink-500 text-white border-pink-600',
    ice: 'bg-cyan-400 text-white border-cyan-500',
    dragon: 'bg-indigo-600 text-white border-indigo-700',
    dark: 'bg-gray-800 text-white border-gray-900',
    darkness: 'bg-gray-800 text-white border-gray-900',
    fairy: 'bg-pink-400 text-white border-pink-500',
    normal: 'bg-gray-400 text-white border-gray-500',
    fighting: 'bg-amber-700 text-white border-amber-800',
    flying: 'bg-indigo-400 text-white border-indigo-500',
    poison: 'bg-purple-500 text-white border-purple-600',
    ground: 'bg-yellow-600 text-white border-yellow-700',
    rock: 'bg-stone-500 text-white border-stone-600',
    bug: 'bg-lime-400 text-black border-lime-500',
    ghost: 'bg-purple-600 text-white border-purple-700',
    steel: 'bg-slate-500 text-white border-slate-600',
    metal: 'bg-slate-500 text-white border-slate-600',
    colorless: 'bg-gray-300 text-gray-800 border-gray-400',
    trainer: 'bg-emerald-500 text-white border-emerald-600',
    // Trainer subtypes
    item: 'bg-blue-500 text-white border-blue-600',
    supporter: 'bg-orange-500 text-white border-orange-600',
    fossil: 'bg-blue-500 text-white border-blue-600', // Same as item since fossils are items
    tool: 'bg-purple-500 text-white border-purple-600'
  };
  
  // For trainer cards, use the display type for color
  if (type === 'trainer' && displayType) {
    const displayTypeLower = displayType.toLowerCase();
    return typeColorMap[displayTypeLower] || typeColorMap.trainer;
  }
  
  return typeColorMap[type as string] || 'bg-gray-200 text-gray-700 border-gray-300';
};

// Pocket card rarity styling - moved to top to avoid hoisting issues
const pocketRarityMap: Record<string, { label: string; color: string; glow: string }> = {
  '◊': { label: 'C', color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300', glow: 'shadow-gray-200/50' },
  '◊◊': { label: 'U', color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300', glow: 'shadow-green-200/50' },
  '◊◊◊': { label: 'R', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300', glow: 'shadow-blue-200/50' },
  '◊◊◊◊': { label: 'RR', color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300', glow: 'shadow-purple-200/50' },
  '★': { label: 'EX', color: 'bg-gradient-to-r from-yellow-100 to-amber-200 text-amber-800 border-amber-300', glow: 'shadow-amber-200/50' },
  '★★': { label: 'Crown', color: 'bg-gradient-to-r from-red-100 to-rose-200 text-red-800 border-red-300', glow: 'shadow-red-200/50' }
};

interface UnifiedCardProps {
  card: any;
  cardType?: "tcg" | "pocket" | "pokedex";
  showPrice?: boolean;
  showSet?: boolean;
  showTypes?: boolean;
  showHP?: boolean;
  showRarity?: boolean;
  showPack?: boolean;
  showArtist?: boolean;
  onCardClick?: ((card: any) => void) | null;
  onMagnifyClick?: ((card: any) => void) | null;
  className?: string;
  imageWidth?: number;
  imageHeight?: number;
}

/**
 * UnifiedCard - A standardized card component that matches the "Related Cards" style
 * Used consistently across all card displays in the app (pocket, pokedex, TCG, etc.)
 */
const UnifiedCard = memo(({ 
  card, 
  cardType = "tcg", // "tcg", "pocket", "pokedex"
  showPrice = false,
  showSet = true,
  showTypes = true,
  showHP = false,
  showRarity = false,
  showPack = false,
  showArtist = false,
  onCardClick = null,
  onMagnifyClick = null,
  className = "",
  imageWidth = 220,
  imageHeight = 308
}: UnifiedCardProps) => {
  const router = useRouter();
  
  // Optimized card data normalization with performance monitoring
  const normalizedCard = useSmartMemo(() => {
    const startTime = Date.now();
    let normalizedData;
    
    if (cardType === "pocket") {
      // Parse card ID if it contains set code (e.g., "a2a-029" -> set: "A2a", number: "029")
      let setTag = card.setCode || card.setTag || deriveSetCode(card.pack) || 'PKT';
      let cardNumber = card.id;
      
      if (card.id && card.id.includes('-')) {
        const parts = card.id.split('-');
        if (parts.length === 2) {
          // Capitalize first letter, keep rest as is (e.g., a2a -> A2a)
          setTag = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
          cardNumber = parts[1];
        }
      }
      
      normalizedData = {
        id: card.id,
        name: card.name,
        image: card.image || "/back-card.png",
        types: card.type ? [card.type] : (card.types || []),
        set: { 
          name: card.pack, 
          id: null,
          tag: setTag
        },
        number: cardNumber,
        rarity: card.rarity,
        hp: card.health || card.hp,
        artist: card.artist,
        linkPath: `/pocketmode/${card.id}`
      };
    } else if (cardType === "pokedex") {
      normalizedData = {
        id: card.id,
        name: card.name,
        image: card.sprite || "/dextrendslogo.png",
        types: card.types || [],
        set: null,
        number: String(card.id).padStart(3, "0"),
        rarity: null,
        hp: null,
        artist: null,
        linkPath: `/pokedex/${card.id}`
      };
    } else {
      // TCG card (default)
      normalizedData = {
        id: card.id,
        name: card.name,
        image: card.images?.small || card.images?.large || "/back-card.png",
        types: card.types?.map((t: any) => t.type?.name || t) || [],
        set: {
          name: card.set?.name,
          id: card.set?.id,
          tag: card.set?.id?.toUpperCase() || card.set?.name?.substring(0, 3)?.toUpperCase() || 'TCG'
        },
        number: card.number,
        rarity: card.rarity,
        hp: card.hp,
        artist: card.artist,
        linkPath: `/cards/${card.id}`
      };
    }

    // Monitor normalization performance
    const duration = Date.now() - startTime;
    if (duration > 5) {
      performanceMonitor.recordMetric('card-normalization-slow', duration, {
        cardType,
        cardId: card.id
      });
    }
    
    return normalizedData;
  }, [card.id, card.name, card.image, card.images, cardType, card.pack, card.rarity], {
    enableProfiling: true,
    maxComputationTime: 10
  });

  // Memoized visual effects to prevent recalculation
  const visualEffects = useMemo(() => ({
    holographicClass: getHolographicEffect(normalizedCard.rarity),
    glowClass: getRarityGlowClass(normalizedCard.rarity)
  }), [normalizedCard.rarity]);

  // Optimized rarity info calculation
  const rarityInfo = useMemo(() => {
    if (cardType === "pocket") {
      return pocketRarityMap[normalizedCard.rarity] || { 
        label: '?', 
        color: 'bg-gray-100 text-gray-500 border-gray-200', 
        glow: 'shadow-gray-100/50' 
      };
    }
    return rarityMap[normalizedCard.rarity] || { 
      label: '?', 
      color: 'bg-gray-100 text-gray-500 border-gray-200' 
    };
  }, [cardType, normalizedCard.rarity]);

  // Image error handling state
  const [imageError, setImageError] = useState(false);

  // Optimized event handlers with useSmartCallback
  const handleCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('.magnifier-icon')
    ) return;
    
    // performanceMonitor.startTiming('card-click');
    
    if (onCardClick) {
      onCardClick(card);
    } else {
      router.push(normalizedCard.linkPath);
    }
    
    // performanceMonitor.endTiming('card-click');
  }, [card, onCardClick, normalizedCard.linkPath, router]);

  const handleMagnifyClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onMagnifyClick) {
      onMagnifyClick(card);
    }
  }, [card, onMagnifyClick]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target && target.src !== window.location.origin + '/back-card.png') {
      setImageError(true);
      target.src = '/back-card.png';
    }
  }, [imageError]);




  return (
    <>
      <div
        className={`
          ${className}
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-lg overflow-hidden 
          shadow-sm 
          ${cardType === "pocket" ? "pocket-card" : cardType === "tcg" ? "tcg-card" : "unified-card"}
          ${shouldHaveHolographicEffect(normalizedCard.rarity) ? "rare-card" : ""}
          cursor-pointer group relative
          ${visualEffects.holographicClass} ${visualEffects.glowClass}
          ${cardType === "pocket" ? "mx-auto" : ""}
        `}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
      {/* Card Image */}
      <div className="relative w-full">
        <OptimizedImage 
          src={normalizedCard.image} 
          alt={normalizedCard.name}
          width={imageWidth}
          height={imageHeight}
          className="w-full h-auto object-cover"
          placeholder="blur"
          onError={handleImageError}
          priority={card.priority || false}
        />

        {/* Holographic Shine Overlay - Only for rare cards, more subtle for Pocket cards */}
        {shouldHaveHolographicEffect(normalizedCard.rarity) && cardType !== "pocket" && (
          <div className="holographic-overlay absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="shine-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            <div className="holographic-pattern absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/10 via-green-400/10 via-yellow-400/10 to-red-400/10 opacity-30"></div>
          </div>
        )}
        
        {/* Subtle glow for rare Pocket cards only */}
        {shouldHaveHolographicEffect(normalizedCard.rarity) && cardType === "pocket" && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        )}

        {/* Magnify button overlay */}
        {onMagnifyClick && (
          <button
            className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity magnifier-icon"
            onClick={handleMagnifyClick}
            title="View card details"
            aria-label="View card details"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        )}
      </div>

      {/* Card Info */}
      {cardType === "pocket" ? (
        /* Clean Tag Section for Pocket Cards */
        <div className="bg-white rounded-xl p-2 mt-2 text-center">
          {/* Type and Set badges in one row */}
          <div className="flex justify-center items-center gap-2">
            {normalizedCard.types.length > 0 && (
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${
                getTypeColorClass(normalizedCard.types[0].toLowerCase(), getDisplayType(normalizedCard.types[0], card))
              }`}>
                {getDisplayType(normalizedCard.types[0], card)}
              </span>
            )}
            {normalizedCard.set && normalizedCard.number && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-500">
                {normalizedCard.set.tag.charAt(0).toUpperCase() + normalizedCard.set.tag.slice(1).toLowerCase()}-{normalizedCard.number.padStart(3, '0')}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Original Layout for TCG and Pokedex Cards */
        <div className="p-3 space-y-2">
          {/* Card Name */}
          <h3 className="font-medium text-center text-sm truncate group-hover:text-blue-600 transition-colors">
            {normalizedCard.name}
          </h3>

          {/* Set and Number Info - Simplified */}
          {(showSet || normalizedCard.number) && (
            <div className="text-center text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-center gap-2">
                {showSet && normalizedCard.set && (
                  <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {normalizedCard.set.tag}
                  </span>
                )}
                {normalizedCard.number && (
                  <span>#{normalizedCard.number}</span>
                )}
              </div>
            </div>
          )}

          {/* Types */}
          {showTypes && normalizedCard.types.length > 0 && (
            <div className="flex justify-center gap-1 flex-wrap">
              {normalizedCard.types.slice(0, 2).map((type: string) => (
                <span 
                  key={type} 
                  className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                    getTypeColorClass(type.toLowerCase(), getDisplayType(type, card))
                  }`}
                >
                  {getDisplayType(type, card)}
                </span>
              ))}
            </div>
          )}

          {/* Additional Info Row */}
          <div className="flex items-center justify-center gap-2 text-xs">
            {/* HP */}
            {showHP && normalizedCard.hp && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-bold">
                {normalizedCard.hp}HP
              </span>
            )}

            {/* Rarity */}
            {showRarity && normalizedCard.rarity && (
              <span className={`px-2 py-1 text-xs rounded-full font-bold ${rarityInfo.color}`}>
                {rarityInfo.label}
              </span>
            )}

            {/* Price */}
            {showPrice && cardType === "tcg" && (
              <CompactPriceIndicator 
                cardId={normalizedCard.id}
                currentPrice={card.currentPrice || getPrice(card)}
                variantType="holofoil"
              />
            )}
          </div>

          {/* Artist - Only shown when explicitly requested */}
        </div>
      )}
    </div>
      {/* CSS Styles for Holographic Effects */}
      <style jsx>{`
        .card-holographic {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%);
          border: 1px solid rgba(147, 51, 234, 0.3);
          position: relative;
        }
        
        .card-holographic::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(45deg, 
            rgba(147, 51, 234, 0.5), 
            rgba(59, 130, 246, 0.5), 
            rgba(16, 185, 129, 0.5), 
            rgba(245, 158, 11, 0.5), 
            rgba(239, 68, 68, 0.5));
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .card-holographic:hover::before {
          opacity: 1;
        }
        
        .holographic-overlay {
          background: radial-gradient(circle at 50% 50%, 
            rgba(147, 51, 234, 0.1) 0%, 
            rgba(59, 130, 246, 0.1) 25%, 
            rgba(16, 185, 129, 0.1) 50%, 
            rgba(245, 158, 11, 0.1) 75%, 
            rgba(239, 68, 68, 0.1) 100%);
          animation: holographic-shift 3s ease-in-out infinite;
        }
        
        @keyframes holographic-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .shine-effect {
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.2) 20%, 
            rgba(255, 255, 255, 0.5) 50%, 
            rgba(255, 255, 255, 0.2) 80%, 
            transparent 100%);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        
        .holographic-pattern {
          background: 
            linear-gradient(45deg, transparent 30%, rgba(147, 51, 234, 0.1) 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%),
            linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
          background-size: 20px 20px, 20px 20px, 40px 40px;
          animation: holographic-pattern 4s linear infinite;
        }
        
        @keyframes holographic-pattern {
          0% { background-position: 0px 0px, 0px 0px, 0px 0px; }
          100% { background-position: 20px 20px, -20px 20px, 40px 0px; }
        }
      `}</style>
    </>
  );
});

UnifiedCard.displayName = 'UnifiedCard';

// Apply optimizations to the component
const OptimizedUnifiedCard = withOptimizations(UnifiedCard, {
  enableMemo: true,
  enableProfiling: process.env.NODE_ENV === 'development',
  enableSuggestions: process.env.NODE_ENV === 'development'
});

export default OptimizedUnifiedCard;