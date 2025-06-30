import React, { memo, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { TypeBadge } from "./TypeBadge";
import { CompactPriceIndicator } from "./PriceIndicator";
import { isFeatureEnabled } from "../../utils/featureFlags";
import performanceMonitor from "../../utils/performanceMonitor";
import { useSmartMemo, useSmartCallback, withOptimizations } from "../../utils/reactOptimizations";
import { getPrice } from "../../utils/pokemonutils";
import OptimizedImage from "./OptimizedImage";

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
const shouldHaveHolographicEffect = (rarity) => {
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
const getHolographicEffect = (rarity) => {
  if (!shouldHaveHolographicEffect(rarity)) return '';
  return 'card-holographic';
};

// Get rarity glow effect
const getRarityGlowClass = (rarity) => {
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

// Enhanced 3D Card Component for performance - loaded dynamically
import dynamic from "next/dynamic";
const Enhanced3DCard = dynamic(() => import('./Enhanced3DCard'), {
  ssr: false,
  loading: () => null
});

// Rarity styling for TCG cards - moved to top to avoid hoisting issues
const rarityMap = {
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

// Pocket card rarity styling - moved to top to avoid hoisting issues
const pocketRarityMap = {
  '◊': { label: 'C', color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300', glow: 'shadow-gray-200/50' },
  '◊◊': { label: 'U', color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300', glow: 'shadow-green-200/50' },
  '◊◊◊': { label: 'R', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300', glow: 'shadow-blue-200/50' },
  '◊◊◊◊': { label: 'RR', color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300', glow: 'shadow-purple-200/50' },
  '★': { label: 'EX', color: 'bg-gradient-to-r from-yellow-100 to-amber-200 text-amber-800 border-amber-300', glow: 'shadow-amber-200/50' },
  '★★': { label: 'Crown', color: 'bg-gradient-to-r from-red-100 to-rose-200 text-red-800 border-red-300', glow: 'shadow-red-200/50' }
};

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
}) => {
  // Optimized card data normalization with performance monitoring
  const normalizedCard = useSmartMemo(() => {
    const startTime = Date.now();
    let normalizedData;
    
    if (cardType === "pocket") {
      normalizedData = {
        id: card.id,
        name: card.name,
        image: card.image || "/back-card.png",
        types: card.type ? [card.type] : (card.types || []),
        set: { 
          name: card.pack, 
          id: null 
        },
        number: card.id,
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
        types: card.types?.map(t => t.type?.name || t) || [],
        set: {
          name: card.set?.name,
          id: card.set?.id
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
    glowClass: getRarityGlowClass(normalizedCard.rarity),
    use3DCards: isFeatureEnabled('ENABLE_3D_CARDS')
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
  const handleCardClick = useSmartCallback((e) => {
    if (
      e.target.closest('a') ||
      e.target.closest('button') ||
      e.target.closest('.magnifier-icon')
    ) return;
    
    performanceMonitor.startTimer('card-click');
    
    if (onCardClick) {
      onCardClick(card);
    } else {
      window.location.href = normalizedCard.linkPath;
    }
    
    performanceMonitor.endTimer('card-click');
  }, [card, onCardClick, normalizedCard.linkPath], {
    enableProfiling: true
  });

  const handleMagnifyClick = useSmartCallback((e) => {
    e.stopPropagation();
    if (onMagnifyClick) {
      onMagnifyClick(card);
    }
  }, [card, onMagnifyClick], {
    enableProfiling: true
  });

  const handleImageError = useSmartCallback((e) => {
    const target = e.target;
    if (target && target.src !== window.location.origin + '/back-card.png') {
      setImageError(true);
      target.src = '/back-card.png';
    }
  }, [], {
    stableCallback: true
  });



  // Use Enhanced3DCard if feature is enabled, otherwise fallback to regular card
  if (visualEffects.use3DCards && cardType === "tcg") {
    return (
      <Enhanced3DCard
        card={card}
        onClick={handleCardClick}
        className={`h-full ${className}`}
        showEffects={true}
      />
    );
  }

  return (
    <>
      <div
        className={`
          ${className}
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-lg overflow-hidden 
          shadow-sm hover:shadow-lg 
          transition-all duration-300 
          hover:scale-105 hover:-translate-y-1
          cursor-pointer group relative
          ${visualEffects.holographicClass} ${visualEffects.glowClass}
        `}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
      {/* Card Image */}
      <div className="relative w-full">
        <Link 
          href={normalizedCard.linkPath}
          className="block w-full"
          tabIndex={-1}
          onClick={e => e.stopPropagation()}
        >
            <OptimizedImage 
              src={normalizedCard.image} 
              alt={normalizedCard.name}
              width={imageWidth}
              height={imageHeight}
              className="w-full h-auto object-cover"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={handleImageError}
              priority={card.priority || false}
              quality={imageError ? 50 : 85}
              enableProgressiveLoading={true}
              enableLazyLoading={!card.priority}
              enableMonitoring={true}
              format="auto"
            />
        </Link>

        {/* Holographic Shine Overlay - Only for rare cards */}
        {shouldHaveHolographicEffect(normalizedCard.rarity) && (
          <div className="holographic-overlay absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="shine-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            <div className="holographic-pattern absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/10 via-green-400/10 via-yellow-400/10 to-red-400/10 opacity-30"></div>
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
      <div className="p-3 space-y-2">
        {/* Card Name */}
        <h3 className="font-medium text-center text-sm truncate group-hover:text-blue-600 transition-colors">
          {normalizedCard.name}
        </h3>

        {/* Set and Number Info */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-400">
          {showSet && normalizedCard.set?.name && (
            <div className="truncate">
              {cardType === "tcg" && normalizedCard.set.id ? (
                <Link
                  href={`/tcgsets/${normalizedCard.set.id}`}
                  className="hover:text-blue-600">
                  
                  {normalizedCard.set.name}
                </Link>
              ) : (
                normalizedCard.set.name
              )}
            </div>
          )}
          {normalizedCard.number && (
            <div>#{normalizedCard.number}</div>
          )}
          {/* Release Date for TCG Cards */}
          {cardType === "tcg" && card.set?.releaseDate && (
            <div className="text-xs text-gray-400 mt-1">
              {new Date(card.set.releaseDate).getFullYear()}
            </div>
          )}
        </div>

        {/* Types */}
        {showTypes && normalizedCard.types.length > 0 && (
          <div className="flex justify-center gap-1 flex-wrap">
            {normalizedCard.types.slice(0, 2).map(type => (
              <TypeBadge 
                key={type} 
                type={type.toLowerCase()} 
                size="xs" 
                isPocketCard={cardType === "pocket"}
              />
            ))}
          </div>
        )}

        {/* Additional Info Row */}
        <div className="flex items-center justify-center gap-2 text-xs">
          {/* HP */}
          {showHP && normalizedCard.hp && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
              {normalizedCard.hp}HP
            </span>
          )}

          {/* Rarity */}
          {showRarity && normalizedCard.rarity && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${rarityInfo.color}`}>
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

        {/* Artist */}
        {showArtist && normalizedCard.artist && (
          <div className="text-center text-xs text-gray-500 italic truncate">
            by {normalizedCard.artist}
          </div>
        )}
      </div>
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