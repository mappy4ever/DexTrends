import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Modal from "../../components/ui/modals/Modal";
import EnhancedCardModal from "../../components/ui/EnhancedCardModal";
import { FadeIn, SlideUp } from "../../components/ui/animations";
import PriceHistoryChart from "../../components/ui/charts/PriceHistoryChart";
import { TypeBadge } from "../../components/ui/TypeBadge";
import Image from "next/image";
import { getPrice as getCardPrice } from "../../utils/pokemonutils";
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import UnifiedCard from "../../components/ui/cards/UnifiedCard";
import StyledBackButton from "../../components/ui/StyledBackButton";
import HolographicCard from "../../components/ui/HolographicCard";
import logger from "../../utils/logger";
import { useAppContext } from "../../context/UnifiedAppContext";
import { fetchJSON } from "../../utils/unifiedFetch";
import performanceMonitor from "../../utils/performanceMonitor";
import type { TCGCard, CardSet } from "../../types/api/cards";

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

  // Check if card is favorite
  const isCardFavorite = (id: string): boolean => {
    return favorites.cards.some(card => card.id === id);
  };
  
  // Fetch card data when cardId changes
  useEffect(() => {
    if (!cardId || typeof cardId !== 'string') return;

    const fetchCardData = async () => {
      setLoading(true);
      setError(null);
      
      // Start performance monitoring
      performanceMonitor.startTimer('page-load', `card-detail-${cardId}`);
      
      try {
        // Check sessionStorage first for instant loading
        if (typeof window !== 'undefined') {
          const cachedCardData = sessionStorage.getItem(`card-${cardId}`);
          const cachedSetData = sessionStorage.getItem(`set-${cardId.split('-')[0]}`);
          
          if (cachedCardData) {
            try {
              const cardData = JSON.parse(cachedCardData);
              setCard(cardData);
              logger.info('[Card Detail] Loaded from sessionStorage', { cardId });
              
              // Load set data if available
              if (cachedSetData && cardData.set?.id) {
                const setData = JSON.parse(sessionStorage.getItem(`set-${cardData.set.id}`) || 'null');
                if (setData) {
                  setCardSet(setData);
                  logger.info('[Card Detail] Set loaded from sessionStorage', { setId: cardData.set.id });
                }
              }
              
              // Clean up sessionStorage after use
              sessionStorage.removeItem(`card-${cardId}`);
              
              // Still fetch related cards in background
              if (cardData.name) {
                const pokemonName = cardData.name.split(" ")[0];
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
              performanceMonitor.endTimer('page-load', `card-detail-${cardId}`, {
                cardId,
                source: 'sessionStorage'
              });
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
              `/api/tcg-sets/${cardData.set.id}`,
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
        const loadTime = performanceMonitor.endTimer('page-load', `card-detail-${cardId}`, {
          cardId,
          cached: cardResponse.cached
        });
        
        if (loadTime) {
          logger.info('[Card Detail] Page load complete', {
            cardId,
            loadTime,
            cached: cardResponse.cached
          });
        }
        
      } catch (err: unknown) {
        logger.error("Error fetching card:", { 
          error: err instanceof Error ? err.message : String(err),
          cardId 
        });
        setError("Failed to load card details. Please try again.");
        setLoading(false);
        performanceMonitor.endTimer('page-load', `card-detail-${cardId}`);
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
        addToFavorites('cards', card);
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
      <PageLoader text="Loading card details..." />
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
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded"
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
        <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
          <h2 className="text-xl font-bold mb-2">Card Not Found</h2>
          <p>The card you&apos;re looking for couldn&apos;t be found.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <FullBleedWrapper gradient="tcg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <FadeIn>
        <div className="mb-4">
          <StyledBackButton variant="tcg" />
        </div>

        {/* Main card content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card image section */}
          <div className="lg:col-span-1">
            <div className="relative">
              {/* Apply gradient background here */}
              <div className="p-4 rounded-xl shadow-lg" style={{ background: bgGradient }}>
                {/* Card image with holographic effects and zoom functionality */}
                <HolographicCard 
                  rarity={card.rarity}
                  intensity="high"
                  className="mb-4"
                >
                  <div className="relative cursor-zoom-in" onClick={() => setMagnifyImage(true)}>
                    <img 
                      src={card.images.large} 
                      alt={card.name}
                      className="w-full h-auto rounded-md shadow-sm"
                    />
                    <div className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </HolographicCard>

                {/* Favorite button */}
                <button 
                  className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors ${
                    isCardFavorite(card.id) 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/40' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={handleToggleFavorite}
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
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

          {/* Card details section */}
          <div className="lg:col-span-2">
            {/* Apply gradient background here too for details */}
            <div className="p-6 rounded-xl shadow-lg" style={{ background: bgGradient }}>
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h1 className="text-3xl font-bold mb-2">{card.name}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/tcgsets/${card.set.id}`}
                    className="flex items-center">
                    
                    {card.set.images?.symbol && (
                      <img 
                        src={card.set.images.symbol} 
                        alt={card.set.name}
                        className="h-6 w-6 object-contain mr-1"
                      />
                    )}
                    <span className="text-blue-600 dark:text-blue-400 hover:underline">{card.set.name}</span>
                  </Link>
                  <span className="text-gray-500 dark:text-gray-400">#{card.number}</span>
                  {card.rarity && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                      {card.rarity}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Card Details</h2>
                  <div className="space-y-3">
                    {card.supertype && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Supertype:</span>
                        <span className="font-medium">{card.supertype}</span>
                      </div>
                    )}
                    
                    {card.subtypes && card.subtypes.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtypes:</span>
                        <span className="font-medium">{card.subtypes.join(", ")}</span>
                      </div>
                    )}

                    {card.hp && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">HP:</span>
                        <span className="font-medium">{card.hp}</span>
                      </div>
                    )}

                    {card.types && card.types.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Types:</span>
                        <div>{renderTypes(card.types)}</div>
                      </div>
                    )}

                    {card.evolvesFrom && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Evolves From:</span>
                        <Link
                          href={`/pokedex/${card.evolvesFrom}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          
                          {card.evolvesFrom}
                        </Link>
                      </div>
                    )}

                    {card.rules && card.rules.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <span className="block text-gray-600 dark:text-gray-400 mb-1">Rules:</span>
                        <ul className="list-disc pl-5 space-y-1">
                          {card.rules.map((rule, index) => (
                            <li key={index} className="text-sm">{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Market Data</h2>
                  <div className="space-y-3">
                    {card.tcgplayer && card.tcgplayer.prices ? (
                      <div>
                        {Object.entries(card.tcgplayer.prices).map(([priceType, priceData]) => (
                          <div key={priceType} className="mb-2">
                            <h3 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                              {priceType.replace(/([A-Z])/g, ' $1').trim()}:
                            </h3>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Low</div>
                                <div className="font-semibold">${priceData.low?.toFixed(2) || 'N/A'}</div>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Market</div>
                                <div className="font-semibold">${priceData.market?.toFixed(2) || 'N/A'}</div>
                              </div>
                              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                <div className="text-xs text-gray-500 dark:text-gray-400">High</div>
                                <div className="font-semibold">${priceData.high?.toFixed(2) || 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="mt-4">
                          <a 
                            href={card.tcgplayer.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
                          >
                            View on TCGPlayer
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 italic">
                        No pricing data available for this card.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Price history chart */}
            {getCardPrice(card) !== 'N/A' && (
              <div className={`mt-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <h2 className="text-xl font-semibold mb-4">Price History</h2>
                <PriceHistoryChart 
                  cardId={card.id} 
                  initialPrice={parseFloat(getCardPrice(card).substring(1))}
                  variantType="holofoil"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card attacks/abilities section */}
        {((card.attacks?.length || 0) > 0 || (card.abilities?.length || 0) > 0) && (
          <SlideUp delay={100}>
            <div className={`mt-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              {(card.abilities?.length || 0) > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Abilities</h2>
                  <div className="space-y-4">
                    {card.abilities?.map((ability, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">{ability.name}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{ability.type}</span>
                        </div>
                        <p className="mt-1">{ability.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(card.attacks?.length || 0) > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Attacks</h2>
                  <div className="space-y-4">
                    {card.attacks?.map((attack, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <h3 className="font-bold text-lg">{attack.name}</h3>
                            {attack.damage && (
                              <span className="ml-3 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
                                {attack.damage}
                              </span>
                            )}
                          </div>
                          <div className="flex">
                            {attack.cost?.map((type, i) => (
                              <TypeBadge key={i} type={type} size="sm" className="ml-1" />
                            ))}
                          </div>
                        </div>
                        {attack.text && <p className="mt-1">{attack.text}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SlideUp>
        )}

        {/* Related cards section */}
        {relatedCards.length > 0 && (
          <SlideUp delay={200}>
            <div className={`mt-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Related Cards</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {relatedCards.map(relatedCard => (
                  <UnifiedCard
                    key={relatedCard.id}
                    card={relatedCard}
                    cardType="tcg"
                    showSet={true}
                    showTypes={false}
                    showRarity={false}
                    showPrice={false}
                    imageWidth={160}
                    imageHeight={224}
                    className="transform transition-transform hover:scale-105"
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