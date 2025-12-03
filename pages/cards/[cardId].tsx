import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../components/ui/Modal";
import EnhancedCardModal from "../../components/ui/EnhancedCardModal";
import { FadeIn, SlideUp } from "../../components/ui/animations";
import { PriceHistoryChart } from "../../components/ui/LazyComponents";
import { TypeBadge } from "../../components/ui/TypeBadge";
import Image from "next/image";
import { getPrice as getCardPrice } from "../../utils/pokemonutils";
import { DetailPageSkeleton } from '@/components/ui/SkeletonLoadingSystem';
import { UnifiedCard } from "../../components/ui/cards";
import StyledBackButton from "../../components/ui/StyledBackButton";
// SimpleCardWrapper removed during consolidation - using div instead
const SimpleCardWrapper = ({ children, className, rarity }: any) => {
  const getBorderClass = () => {
    if (!rarity) return 'border-stone-300';
    const rarityLower = rarity.toLowerCase();
    if (rarityLower.includes('secret') || rarityLower.includes('rainbow')) return 'border-yellow-400';
    if (rarityLower.includes('ultra') || rarityLower.includes('hyper')) return 'border-amber-400';
    if (rarityLower.includes('rare')) return 'border-amber-400';
    return 'border-stone-300';
  };
  return <div className={`relative rounded-lg overflow-hidden transition-all duration-150 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg ${getBorderClass()} border-2 ${className}`}>{children}</div>;
};
import logger from "../../utils/logger";
import { useAppContext } from "../../context/UnifiedAppContext";
import { fetchJSON } from "../../utils/unifiedFetch";
import performanceMonitor from "../../utils/performanceMonitor";
import { use3DTiltCard, getHolographicGradient } from "../../hooks/use3DTiltCard";
import { cn } from "../../utils/cn";
import { safeSessionStorage } from "../../utils/safeStorage";
import type { TCGCard, CardSet } from "../../types/api/cards";
import type { FavoriteCard } from "../../context/modules/types";

// Type color mapping and RGBA helpers
const typeHexColors: Record<string, string> = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
  fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function getTypeRgba(type: string | null | undefined, alpha: number): string {
  return hexToRgba(typeHexColors[type?.toLowerCase() || ''] || '#e5e7eb', alpha);
}

import { FullBleedWrapper } from "../../components/ui";

export default function CardDetailPage() {
  const router = useRouter();
  const { cardId } = router.query;
  const { theme, favorites, addToFavorites, removeFromFavorites } = useAppContext();
  
  // State variables
  const [card, setCard] = useState<TCGCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magnifyImage, setMagnifyImage] = useState(false);
  const [relatedCards, setRelatedCards] = useState<TCGCard[]>([]);
  const [cardSet, setCardSet] = useState<CardSet | null>(null);
  
  // 3D Tilt and Holographic effects with increased rotation for detail view
  const {
    cardRef,
    isHovered,
    rotateX,
    rotateY,
    scale,
    holoX,
    holoY,
    holoOpacity,
    shimmerX,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    shouldShowHolo,
    holoIntensity,
    particleCount
  } = use3DTiltCard({
    rarity: card?.rarity,
    enableHolo: true,
    maxRotation: 20 // Larger rotation for detail view
  });

  // Create shimmer position as a percentage string
  const [shimmerPosition, setShimmerPosition] = useState('0%');
  useEffect(() => {
    if (shimmerX) {
      const unsubscribe = shimmerX.on('change', (value) => {
        setShimmerPosition(`${value}%`);
      });
      return unsubscribe;
    }
    return undefined;
  }, [shimmerX]);

  // Check if card is favorite
  const isCardFavorite = (id: string): boolean => {
    return favorites.cards.some((card: FavoriteCard) => card.id === id);
  };
  
  // Fetch card data when cardId changes
  useEffect(() => {
    if (!cardId || typeof cardId !== 'string') return;
    
    let loadStartTime: number;

    const fetchCardData = async () => {
      setLoading(true);
      setError(null);
      
      // Start performance monitoring
      loadStartTime = performanceMonitor.startTimer('page-load');
      
      try {
        // Check sessionStorage first for instant loading using safe wrapper
        if (typeof window !== 'undefined') {
          const cachedCardData = safeSessionStorage.getItem(`card-${cardId}`);
          const cachedSetData = safeSessionStorage.getItem(`set-${cardId.split('-')[0]}`);
          
          if (cachedCardData) {
            try {
              setCard(cachedCardData);
              logger.info('[Card Detail] Loaded from sessionStorage', { cardId });
              
              // Load set data if available
              if (cachedSetData && cachedCardData.set?.id) {
                const setData = safeSessionStorage.getItem(`set-${cachedCardData.set.id}`);
                if (setData) {
                  setCardSet(setData);
                  logger.info('[Card Detail] Set loaded from sessionStorage', { setId: cachedCardData.set.id });
                }
              }
              
              // Clean up sessionStorage after use
              safeSessionStorage.removeItem(`card-${cardId}`);
              
              // Still fetch related cards in background
              if (cachedCardData.name) {
                const pokemonName = cachedCardData.name.split(" ")[0];
                fetchJSON<{ data: TCGCard[] }>(
                  `/api/tcg-cards?name=${encodeURIComponent(pokemonName)}`,
                  {
                    useCache: true,
                    cacheTime: 30 * 60 * 1000,
                    timeout: 10000
                  }
                ).then(relatedResponse => {
                  if (relatedResponse?.data) {
                    const filtered = relatedResponse.data
                      .filter(c => c.id !== cardId)
                      .slice(0, 8);
                    setRelatedCards(filtered);
                  }
                }).catch(err => {
                  logger.error("Error fetching related cards:", { error: err });
                });
              }
              
              setLoading(false);
              performanceMonitor.endTimer('page-load', loadStartTime);
              return; // Exit early since we have the data
            } catch (err) {
              logger.error('[Card Detail] Error parsing sessionStorage data', { error: err });
              // Continue with normal fetch if parsing fails
            }
          }
        }
        // Fetch card details from our cached API
        const cardResponse = await fetchJSON<{ card: TCGCard; cached: boolean; responseTime: number }>(
          `/api/tcg-cards/${cardId}`,
          {
            useCache: true,
            cacheTime: 60 * 60 * 1000, // 1 hour
            timeout: 10000,
            retries: 2
          }
        );
        
        if (!cardResponse?.card) {
          throw new Error('Card not found');
        }
        
        const cardData = cardResponse.card;
        setCard(cardData);
        
        logger.info('[Card Detail] Card loaded', {
          cardId,
          cached: cardResponse.cached,
          responseTime: cardResponse.responseTime,
          setId: cardData.set?.id
        });
        
        // Fetch set data and related cards in parallel
        const promises: Promise<any>[] = [];
        
        // Fetch card set data
        if (cardData.set?.id) {
          promises.push(
            fetchJSON<{ set: CardSet; cached: boolean }>(
              `/api/tcgexpansions/${cardData.set.id}`,
              {
                useCache: true,
                cacheTime: 60 * 60 * 1000,
                timeout: 10000
              }
            ).then(setResponse => {
              if (setResponse?.set) {
                setCardSet(setResponse.set);
                logger.info('[Card Detail] Set loaded', {
                  setId: cardData.set.id,
                  cached: setResponse.cached
                });
              }
            }).catch(err => {
              logger.error("Error fetching set data:", { error: err });
            })
          );
        }
        
        // Fetch related cards
        if (cardData.name) {
          const pokemonName = cardData.name.split(" ")[0]; // Get base name without form/variant
          promises.push(
            fetchJSON<{ data: TCGCard[] }>(
              `/api/tcg-cards?name=${encodeURIComponent(pokemonName)}`,
              {
                useCache: true,
                cacheTime: 30 * 60 * 1000, // 30 minutes
                timeout: 10000
              }
            ).then(relatedResponse => {
              if (relatedResponse?.data) {
                // Filter out the current card and limit to 8 related cards
                const filtered = relatedResponse.data
                  .filter(c => c.id !== cardId)
                  .slice(0, 8);
                
                setRelatedCards(filtered);
                logger.info('[Card Detail] Related cards loaded', {
                  pokemonName,
                  count: filtered.length
                });
              }
            }).catch(err => {
              logger.error("Error fetching related cards:", { error: err });
            })
          );
        }
        
        // Wait for parallel fetches to complete
        await Promise.all(promises);
        
        setLoading(false);
        
        // End performance monitoring
        const loadTime = performanceMonitor.endTimer('page-load', loadStartTime);
        
        if (loadTime) {
          logger.info('[Card Detail] Page load complete', {
            cardId,
            loadTime,
            cached: cardResponse.cached
          });
        }
        
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error("Error fetching card:", { error: errorMessage, cardId });

        // Check for specific error types
        if (errorMessage.includes('503') || errorMessage.includes('temporarily unavailable')) {
          setError('The Pokemon TCG API is temporarily unavailable. Please try again in a few minutes.');
        } else if (errorMessage.includes('404')) {
          setError(`Card not found.`);
        } else {
          setError("Failed to load card details. Please try again.");
        }
        setLoading(false);
        if (loadStartTime) {
          performanceMonitor.endTimer('page-load', loadStartTime);
        }
      }
    };

    fetchCardData();
  }, [cardId]);

  // Handle toggling favorite status
  const handleToggleFavorite = () => {
    if (card) {
      if (isCardFavorite(card.id)) {
        removeFromFavorites('cards', card.id);
      } else {
        const favoriteCard: FavoriteCard = {
          id: card.id,
          name: card.name,
          set: card.set ? { id: card.set.id, name: card.set.name } : undefined,
          images: card.images,
          addedAt: Date.now()
        };
        addToFavorites('cards', favoriteCard);
      }
    }
  };

  // Format types as badges
  const renderTypes = (types: string[]) => {
    if (!types || types.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2">
        {types.map(type => (
          <TypeBadge key={type} type={type} size="md" />
        ))}
      </div>
    );
  };

  // Compute gradient for card background
  let leftBg = theme === 'dark' ? '#23272f' : '#f3f4f6';
  let bgGradient = 'none';
  const types = card?.types || [];
  const primaryType = types[0] || null;
  const secondaryType = types[1] || null;
  const thirdType = types[2] || null;
  if (primaryType && secondaryType && thirdType) {
    bgGradient = `linear-gradient(90deg, ${leftBg} 0%, ${leftBg} 20%, ${getTypeRgba(primaryType,0.13)} 20%, ${getTypeRgba(primaryType,0.13)} 49%, ${getTypeRgba(secondaryType,0.13)} 50%, ${getTypeRgba(secondaryType,0.13)} 79%, ${getTypeRgba(thirdType,0.13)} 80%, ${getTypeRgba(thirdType,0.13)} 100%)`;
  } else if (primaryType && secondaryType) {
    // Type 2 occupies both Type 2 and Type 3 regions
    bgGradient = `linear-gradient(90deg, ${leftBg} 0%, ${leftBg} 20%, ${getTypeRgba(primaryType,0.11)} 20%, ${getTypeRgba(primaryType,0.11)} 49%, ${getTypeRgba(secondaryType,0.11)} 50%, ${getTypeRgba(secondaryType,0.11)} 100%)`;
  } else if (primaryType) {
    // Single type: blend from background at 0% to type color at 3%, then fill to 100% for a quicker solid color
    bgGradient = `linear-gradient(90deg, ${leftBg} 0%, ${getTypeRgba(primaryType,0.10)} 3%, ${getTypeRgba(primaryType,0.10)} 100%)`;
  }

  // Loading state
  if (loading) {
    return (
      <FullBleedWrapper>
        <DetailPageSkeleton 
          variant="card"
          showHeader={true}
          showImage={true}
          showStats={true}
          showTabs={false}
          showRelated={true}
        />
      </FullBleedWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-150"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No card found state
  if (!card) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl">
          <h2 className="text-xl font-bold mb-2">Card Not Found</h2>
          <p>The card you&apos;re looking for couldn&apos;t be found.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-150"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <FullBleedWrapper gradient="tcg">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <FadeIn>
        <div className="mb-4 sm:mb-6">
          <StyledBackButton variant="tcg" />
        </div>

        {/* Main card content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Card image section with 3D tilt - 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div
              className="relative sticky top-20"
              style={{ perspective: '1000px' }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Apply gradient background here */}
              <div className={cn(
                "p-3 sm:p-4 rounded-2xl",
                "bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm",
                "border border-stone-200/50 dark:border-stone-700/50",
                "shadow-xl"
              )}>
                {/* Card image with 3D tilt, holographic effects and zoom functionality */}
                <motion.div
                  ref={cardRef}
                  style={{
                    rotateX,
                    rotateY,
                    scale,
                    transformStyle: 'preserve-3d'
                  }}
                  className="mb-3"
                  whileHover={{ z: 50 }}
                >
                  <div className="relative cursor-zoom-in rounded-lg overflow-hidden" onClick={() => setMagnifyImage(true)}>
                    <img 
                      src={card.images.large} 
                      alt={card.name}
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                    
                    {/* Holographic overlay that moves with tilt */}
                    {shouldShowHolo && (
                      <>
                        {/* Base holographic gradient */}
                        <motion.div
                          className={cn(
                            "absolute inset-0 rounded-lg mix-blend-color-dodge pointer-events-none",
                            "bg-gradient-to-br",
                            getHolographicGradient(card.rarity || 'Common')
                          )}
                          style={{ opacity: holoOpacity }}
                        />
                        
                        {/* Dynamic light reflection that follows tilt */}
                        <motion.div
                          className="absolute inset-0 rounded-lg pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at ${holoX}% ${holoY}%, rgba(255,255,255,${holoIntensity * 0.5}) 0%, transparent 60%)`,
                            mixBlendMode: 'overlay'
                          }}
                        />
                        
                        {/* Rainbow shimmer effect that moves with tilt */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              className="absolute inset-0 rounded-lg pointer-events-none"
                              initial={{ x: '-100%' }}
                              animate={{ x: shimmerPosition }}
                              transition={{ duration: 0.8 }}
                            >
                              <div 
                                className="h-full w-1/2"
                                style={{
                                  background: `linear-gradient(90deg, 
                                    transparent 0%,
                                    rgba(255, 0, 0, ${holoIntensity * 0.4}) 20%,
                                    rgba(255, 255, 0, ${holoIntensity * 0.4}) 35%,
                                    rgba(0, 255, 0, ${holoIntensity * 0.4}) 50%,
                                    rgba(0, 255, 255, ${holoIntensity * 0.4}) 65%,
                                    rgba(0, 0, 255, ${holoIntensity * 0.4}) 80%,
                                    transparent 100%
                                  )`,
                                  filter: 'blur(25px)',
                                  mixBlendMode: 'screen'
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Foil texture overlay */}
                        <div 
                          className="absolute inset-0 rounded-lg pointer-events-none"
                          style={{
                            opacity: isHovered ? holoIntensity * 0.4 : 0,
                            backgroundImage: `
                              repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 3px,
                                rgba(255, 255, 255, 0.15) 3px,
                                rgba(255, 255, 255, 0.15) 6px
                              ),
                              repeating-linear-gradient(
                                -45deg,
                                transparent,
                                transparent 3px,
                                rgba(255, 255, 255, 0.1) 3px,
                                rgba(255, 255, 255, 0.1) 6px
                              )
                            `,
                            transition: 'opacity 0.3s ease'
                          }}
                        />
                        
                        {/* Sparkle particles for ultra rare cards */}
                        {particleCount > 0 && isHovered && (
                          <div className="absolute inset-0 rounded-lg pointer-events-none">
                            {Array.from({ length: particleCount }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                  width: Math.random() * 3 + 1 + 'px',
                                  height: Math.random() * 3 + 1 + 'px',
                                  background: 'radial-gradient(circle, white, transparent)',
                                  filter: 'blur(0.5px)'
                                }}
                                initial={{ 
                                  x: Math.random() * 100 + '%',
                                  y: Math.random() * 100 + '%',
                                  scale: 0,
                                  opacity: 0
                                }}
                                animate={{
                                  scale: [0, 2, 0],
                                  opacity: [0, 1, 0],
                                }}
                                transition={{
                                  duration: Math.random() * 2 + 1,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Magnify icon overlay */}
                    <div className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-stone-800/80 rounded-full shadow-sm pointer-events-none">
                      <svg className="w-5 h-5 text-stone-600 dark:text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Favorite button */}
                <button
                  className={cn(
                    "w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2",
                    "font-medium text-sm transition-all duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
                    isCardFavorite(card.id)
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-md"
                      : "bg-stone-100 dark:bg-stone-700/80 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600"
                  )}
                  onClick={handleToggleFavorite}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isCardFavorite(card.id) ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={isCardFavorite(card.id) ? 0 : 2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {isCardFavorite(card.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          </div>

          {/* Card details section - 3 columns on desktop */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Header Card */}
            <div className={cn(
              "p-4 sm:p-6 rounded-2xl",
              "bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm",
              "border border-stone-200/50 dark:border-stone-700/50",
              "shadow-lg"
            )}>
              {/* Card Title & Meta */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">{card.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Link
                      href={`/tcgexpansions/${card.set.id}`}
                      className="flex items-center gap-1.5 group">
                      {card.set.images?.symbol && (
                        <img
                          src={card.set.images.symbol}
                          alt={card.set.name}
                          className="h-5 w-5 object-contain"
                        />
                      )}
                      <span className="text-amber-600 dark:text-amber-400 group-hover:underline text-sm font-medium">{card.set.name}</span>
                    </Link>
                    <span className="text-stone-400 dark:text-stone-500">•</span>
                    <span className="text-stone-600 dark:text-stone-400 text-sm font-mono">#{card.number}</span>
                  </div>
                </div>
                {card.rarity && (
                  <span className={cn(
                    "inline-flex px-3 py-1.5 rounded-full text-xs font-semibold",
                    "bg-gradient-to-r shadow-sm",
                    card.rarity.toLowerCase().includes('secret') || card.rarity.toLowerCase().includes('special')
                      ? "from-amber-400 to-yellow-500 text-stone-900"
                      : card.rarity.toLowerCase().includes('ultra') || card.rarity.toLowerCase().includes('hyper')
                      ? "from-purple-500 to-pink-500 text-white"
                      : card.rarity.toLowerCase().includes('rare')
                      ? "from-amber-500 to-orange-500 text-white"
                      : "from-stone-200 to-stone-300 dark:from-stone-600 dark:to-stone-700 text-stone-700 dark:text-stone-200"
                  )}>
                    {card.rarity}
                  </span>
                )}
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {card.hp && (
                  <div className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl",
                    "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
                    "border border-red-100 dark:border-red-800/30"
                  )}>
                    <span className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">HP</span>
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">{card.hp}</span>
                  </div>
                )}
                {card.supertype && (
                  <div className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl",
                    "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
                    "border border-blue-100 dark:border-blue-800/30"
                  )}>
                    <span className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">Type</span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{card.supertype}</span>
                  </div>
                )}
                {card.types && card.types.length > 0 && (
                  <div className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl col-span-2 sm:col-span-2",
                    "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
                    "border border-amber-100 dark:border-amber-800/30"
                  )}>
                    <span className="text-xs text-stone-500 dark:text-stone-400 mb-1">Energy</span>
                    <div>{renderTypes(card.types)}</div>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {(card.subtypes?.length || card.evolvesFrom || card.rules?.length) && (
                <div className="mt-4 pt-4 border-t border-stone-200/50 dark:border-stone-700/50 space-y-2">
                  {card.subtypes && card.subtypes.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500 dark:text-stone-400">Subtypes</span>
                      <span className="font-medium text-stone-700 dark:text-stone-200">{card.subtypes.join(", ")}</span>
                    </div>
                  )}
                  {card.evolvesFrom && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500 dark:text-stone-400">Evolves From</span>
                      <Link
                        href={`/pokedex/${card.evolvesFrom}`}
                        className="font-medium text-amber-600 dark:text-amber-400 hover:underline">
                        {card.evolvesFrom}
                      </Link>
                    </div>
                  )}
                  {card.rules && card.rules.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Rules</span>
                      <ul className="mt-1 space-y-1">
                        {card.rules.map((rule, index) => (
                          <li key={index} className="text-xs text-stone-600 dark:text-stone-300 pl-3 border-l-2 border-amber-400">{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Market Data Card */}
            <div className={cn(
              "p-4 sm:p-6 rounded-2xl",
              "bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm",
              "border border-stone-200/50 dark:border-stone-700/50",
              "shadow-lg"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Market Prices
                </h2>
                {card.tcgplayer?.url && (
                  <a
                    href={card.tcgplayer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
                      "hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                    )}
                  >
                    TCGPlayer
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              {card.tcgplayer && card.tcgplayer.prices ? (
                <div className="space-y-4">
                  {Object.entries(card.tcgplayer.prices).map(([priceType, priceData]) => (
                    <div key={priceType}>
                      <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
                        {priceType.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div className={cn(
                          "p-3 rounded-xl text-center",
                          "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
                          "border border-amber-100 dark:border-amber-800/30"
                        )}>
                          <div className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-medium">Low</div>
                          <div className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                            ${priceData.low?.toFixed(2) || '—'}
                          </div>
                        </div>
                        <div className={cn(
                          "p-3 rounded-xl text-center",
                          "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                          "border border-green-100 dark:border-green-800/30"
                        )}>
                          <div className="text-[10px] uppercase tracking-wide text-green-600 dark:text-green-400 font-medium">Market</div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-0.5">
                            ${priceData.market?.toFixed(2) || '—'}
                          </div>
                        </div>
                        <div className={cn(
                          "p-3 rounded-xl text-center",
                          "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
                          "border border-red-100 dark:border-red-800/30"
                        )}>
                          <div className="text-[10px] uppercase tracking-wide text-red-600 dark:text-red-400 font-medium">High</div>
                          <div className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                            ${priceData.high?.toFixed(2) || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "text-center py-8 rounded-xl",
                  "bg-stone-50 dark:bg-stone-700/30",
                  "text-stone-500 dark:text-stone-400"
                )}>
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No pricing data available</p>
                </div>
              )}
            </div>

            {/* Price history chart */}
            {getCardPrice(card) !== 'N/A' && (
              <div className={cn(
                "p-4 sm:p-6 rounded-2xl",
                "bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm",
                "border border-stone-200/50 dark:border-stone-700/50",
                "shadow-lg"
              )}>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Price History
                </h2>
                <PriceHistoryChart
                  cardId={card.id}
                  initialPrice={parseFloat(getCardPrice(card).substring(1))}
                  variantType="holofoil"
                />
              </div>
            )}

            {/* Card attacks/abilities section */}
            {((card.attacks?.length || 0) > 0 || (card.abilities?.length || 0) > 0) && (
              <div className={cn(
                "p-4 sm:p-6 rounded-2xl",
                "bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm",
                "border border-stone-200/50 dark:border-stone-700/50",
                "shadow-lg"
              )}>
                {(card.abilities?.length || 0) > 0 && (
                  <div className={card.attacks?.length ? "mb-6 pb-6 border-b border-stone-200/50 dark:border-stone-700/50" : ""}>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Abilities
                    </h2>
                    <div className="space-y-3">
                      {card.abilities?.map((ability, index) => (
                        <div key={index} className={cn(
                          "p-4 rounded-xl",
                          "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
                          "border border-purple-100 dark:border-purple-800/30"
                        )}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-stone-900 dark:text-white">{ability.name}</h3>
                            <span className={cn(
                              "shrink-0 px-2 py-0.5 rounded-full text-xs font-medium",
                              "bg-purple-200 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300"
                            )}>
                              {ability.type}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600 dark:text-stone-300">{ability.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(card.attacks?.length || 0) > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                      Attacks
                    </h2>
                    <div className="space-y-3">
                      {card.attacks?.map((attack, index) => (
                        <div key={index} className={cn(
                          "p-4 rounded-xl",
                          "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
                          "border border-red-100 dark:border-red-800/30"
                        )}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-stone-900 dark:text-white">{attack.name}</h3>
                              {attack.damage && (
                                <span className={cn(
                                  "px-2.5 py-1 rounded-lg text-sm font-bold",
                                  "bg-red-500 text-white"
                                )}>
                                  {attack.damage}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {attack.cost?.map((type, i) => (
                                <TypeBadge key={i} type={type} size="sm" />
                              ))}
                            </div>
                          </div>
                          {attack.text && (
                            <p className="text-sm text-stone-600 dark:text-stone-300">{attack.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related cards section */}
        {relatedCards.length > 0 && (
          <SlideUp delay={200}>
            <div className={cn(
              "mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl",
              "bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm",
              "border border-stone-200/50 dark:border-stone-700/50",
              "shadow-lg"
            )}>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                More {card.name.split(" ")[0]} Cards
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                {relatedCards.map(relatedCard => (
                  <UnifiedCard
                    key={relatedCard.id}
                    card={relatedCard}
                    cardType="tcg"
                    showSet={false}
                    showTypes={false}
                    showRarity={false}
                    showPrice={false}
                    imageWidth={120}
                    imageHeight={168}
                    className="transform transition-all duration-150 hover:scale-[1.03] hover:-translate-y-1"
                  />
                ))}
              </div>
            </div>
          </SlideUp>
        )}
      </FadeIn>
      {/* Enhanced card zoom modal */}
      <EnhancedCardModal
        card={card}
        isOpen={magnifyImage}
        onClose={() => setMagnifyImage(false)}
        enablePinchZoom={true}
      />
      </div>
    </FullBleedWrapper>
  );
}

// Mark this page as full bleed to remove Layout padding
(CardDetailPage as any).fullBleed = true;