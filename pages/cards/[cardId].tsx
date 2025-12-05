import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { RarityIcon } from "@/components/ui/RarityIcon";
import { DetailPageSkeleton } from "@/components/ui/SkeletonLoadingSystem";
import StyledBackButton from "@/components/ui/StyledBackButton";
import EnhancedCardModal from "@/components/ui/EnhancedCardModal";
import { FullBleedWrapper } from "@/components/ui";
import logger from "@/utils/logger";
import { useAppContext } from "@/context/UnifiedAppContext";
import { fetchJSON } from "@/utils/unifiedFetch";
import { safeSessionStorage } from "@/utils/safeStorage";
import type { TCGCard, CardSet } from "@/types/api/cards";
import type { FavoriteCard } from "@/context/modules/types";

const CARD_FALLBACK = '/back-card.png';

export default function CardDetailPage() {
  const router = useRouter();
  const { cardId } = router.query;
  const { favorites, addToFavorites, removeFromFavorites } = useAppContext();

  const [card, setCard] = useState<TCGCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magnifyImage, setMagnifyImage] = useState(false);
  const [relatedCards, setRelatedCards] = useState<TCGCard[]>([]);
  const [imgSrc, setImgSrc] = useState<string>(CARD_FALLBACK);

  // Check if card is favorite
  const isCardFavorite = (id: string): boolean => {
    return favorites.cards.some((c: FavoriteCard) => c.id === id);
  };

  // Handle image error
  const handleImageError = useCallback(() => {
    if (imgSrc !== CARD_FALLBACK) {
      setImgSrc(CARD_FALLBACK);
    }
  }, [imgSrc]);

  // Update image source when card changes
  useEffect(() => {
    if (card?.images?.large) {
      setImgSrc(card.images.large);
    } else if (card?.images?.small) {
      setImgSrc(card.images.small);
    } else {
      setImgSrc(CARD_FALLBACK);
    }
  }, [card]);

  // Fetch card data
  useEffect(() => {
    if (!cardId || typeof cardId !== 'string') return;

    const fetchCardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check sessionStorage first
        if (typeof window !== 'undefined') {
          const cachedCardData = safeSessionStorage.getItem(`card-${cardId}`);
          if (cachedCardData) {
            setCard(cachedCardData);
            safeSessionStorage.removeItem(`card-${cardId}`);

            // Fetch related cards in background
            if (cachedCardData.name) {
              const pokemonName = cachedCardData.name.split(" ")[0];
              fetchJSON<{ data: TCGCard[] }>(
                `/api/tcg-cards?name=${encodeURIComponent(pokemonName)}`,
                { useCache: true, cacheTime: 30 * 60 * 1000, timeout: 10000 }
              ).then(res => {
                if (res?.data) {
                  setRelatedCards(res.data.filter(c => c.id !== cardId).slice(0, 6));
                }
              }).catch(() => {});
            }

            setLoading(false);
            return;
          }
        }

        // Fetch from API
        const response = await fetchJSON<{ card: TCGCard }>(
          `/api/tcg-cards/${cardId}`,
          { useCache: true, cacheTime: 60 * 60 * 1000, timeout: 15000, retries: 2 }
        );

        if (!response?.card) throw new Error('Card not found');

        setCard(response.card);

        // Fetch related cards
        if (response.card.name) {
          const pokemonName = response.card.name.split(" ")[0];
          fetchJSON<{ data: TCGCard[] }>(
            `/api/tcg-cards?name=${encodeURIComponent(pokemonName)}`,
            { useCache: true, cacheTime: 30 * 60 * 1000, timeout: 10000 }
          ).then(res => {
            if (res?.data) {
              setRelatedCards(res.data.filter(c => c.id !== cardId).slice(0, 6));
            }
          }).catch(() => {});
        }

        setLoading(false);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error("Error fetching card:", { error: errorMessage, cardId });
        setError(errorMessage.includes('404') ? 'Card not found.' : 'Failed to load card details.');
        setLoading(false);
      }
    };

    fetchCardData();
  }, [cardId]);

  // Toggle favorite
  const handleToggleFavorite = () => {
    if (!card) return;

    if (isCardFavorite(card.id)) {
      removeFromFavorites('cards', card.id);
    } else {
      addToFavorites('cards', {
        id: card.id,
        name: card.name,
        set: card.set ? { id: card.set.id, name: card.set.name } : undefined,
        images: card.images,
        addedAt: Date.now()
      });
    }
  };

  // Get market price
  const getMarketPrice = (): number | null => {
    if (!card?.tcgplayer?.prices) return null;
    const prices = card.tcgplayer.prices;
    return prices.holofoil?.market || prices.normal?.market || prices.reverseHolofoil?.market || null;
  };

  // Loading state
  if (loading) {
    return (
      <FullBleedWrapper>
        <DetailPageSkeleton variant="card" showHeader showImage showStats showRelated />
      </FullBleedWrapper>
    );
  }

  // Error state
  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            {error || 'Card Not Found'}
          </h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const marketPrice = getMarketPrice();

  return (
    <FullBleedWrapper>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back button */}
        <div className="mb-6">
          <StyledBackButton variant="tcg" />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Card Image */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-6 sm:p-8">
              {/* Card image */}
              <div
                className="relative cursor-zoom-in mx-auto max-w-[280px] sm:max-w-[320px]"
                onClick={() => setMagnifyImage(true)}
              >
                <img
                  src={imgSrc}
                  alt={card.name}
                  className="w-full h-auto rounded-xl shadow-lg"
                  onError={handleImageError}
                  draggable={false}
                />
                {/* Zoom hint */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-stone-700/90 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-stone-600 dark:text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>

              {/* Favorite button */}
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  "w-full mt-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all",
                  isCardFavorite(card.id)
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600"
                )}
              >
                <svg className="w-5 h-5" fill={isCardFavorite(card.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isCardFavorite(card.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          </div>

          {/* Right: Card Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                {card.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Link
                  href={`/tcgexpansions/${card.set.id}`}
                  className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  {card.set.images?.symbol && (
                    <img src={card.set.images.symbol} alt="" className="h-4 w-4 object-contain" />
                  )}
                  <span>{card.set.name}</span>
                </Link>
                <span className="text-stone-300 dark:text-stone-600">•</span>
                <span className="text-sm text-stone-500 dark:text-stone-400 font-mono">#{card.number}</span>
              </div>
            </div>

            {/* Quick info row */}
            <div className="flex flex-wrap gap-3">
              {card.rarity && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <RarityIcon rarity={card.rarity} size="sm" showLabel={false} />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{card.rarity}</span>
                </div>
              )}
              {card.hp && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <span className="text-sm font-bold text-red-500">{card.hp}</span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">HP</span>
                </div>
              )}
              {card.types && card.types.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {card.types.map(type => (
                    <TypeBadge key={type} type={type} size="sm" />
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            {marketPrice && marketPrice > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wide">Market Price</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${marketPrice.toFixed(2)}</p>
                  </div>
                  {card.tcgplayer?.url && (
                    <a
                      href={card.tcgplayer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5"
                    >
                      Buy Now
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="space-y-4">
              {/* Card type & subtypes */}
              {(card.supertype || card.subtypes?.length) && (
                <div className="grid grid-cols-2 gap-4">
                  {card.supertype && (
                    <div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Category</p>
                      <p className="text-sm font-medium text-stone-900 dark:text-white">{card.supertype}</p>
                    </div>
                  )}
                  {card.subtypes && card.subtypes.length > 0 && (
                    <div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Stage</p>
                      <p className="text-sm font-medium text-stone-900 dark:text-white">{card.subtypes.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Evolves from */}
              {card.evolvesFrom && (
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Evolves From</p>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{card.evolvesFrom}</p>
                </div>
              )}

              {/* Artist */}
              {card.artist && (
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Illustrator</p>
                  <p className="text-sm font-medium text-stone-900 dark:text-white">{card.artist}</p>
                </div>
              )}
            </div>

            {/* Abilities */}
            {card.abilities && card.abilities.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-900 dark:text-white uppercase tracking-wide mb-3">Abilities</h2>
                <div className="space-y-3">
                  {card.abilities.map((ability, index) => (
                    <div key={index} className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">
                          {ability.type}
                        </span>
                        <h3 className="font-semibold text-stone-900 dark:text-white">{ability.name}</h3>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">{ability.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attacks */}
            {card.attacks && card.attacks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-900 dark:text-white uppercase tracking-wide mb-3">Attacks</h2>
                <div className="space-y-3">
                  {card.attacks.map((attack, index) => (
                    <div key={index} className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {attack.cost && attack.cost.length > 0 && (
                            <div className="flex items-center gap-0.5">
                              {attack.cost.map((type, i) => (
                                <TypeBadge key={i} type={type} size="xs" />
                              ))}
                            </div>
                          )}
                          <h3 className="font-semibold text-stone-900 dark:text-white">{attack.name}</h3>
                        </div>
                        {attack.damage && (
                          <span className="text-lg font-bold text-red-500">{attack.damage}</span>
                        )}
                      </div>
                      {attack.text && (
                        <p className="text-sm text-stone-600 dark:text-stone-400">{attack.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weakness/Resistance/Retreat */}
            {(card.weaknesses || card.resistances || card.retreatCost) && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Weakness</p>
                  {card.weaknesses && card.weaknesses.length > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <TypeBadge type={card.weaknesses[0].type} size="xs" />
                      <span className="text-sm font-medium text-stone-900 dark:text-white">{card.weaknesses[0].value}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Resistance</p>
                  {card.resistances && card.resistances.length > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <TypeBadge type={card.resistances[0].type} size="xs" />
                      <span className="text-sm font-medium text-stone-900 dark:text-white">{card.resistances[0].value}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Retreat</p>
                  {card.retreatCost && card.retreatCost.length > 0 ? (
                    <div className="flex items-center justify-center gap-0.5">
                      {card.retreatCost.map((type, i) => (
                        <TypeBadge key={i} type={type} size="xs" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </div>
              </div>
            )}

            {/* Rules */}
            {card.rules && card.rules.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-900 dark:text-white uppercase tracking-wide mb-3">Rules</h2>
                <div className="space-y-2">
                  {card.rules.map((rule, index) => (
                    <p key={index} className="text-sm text-stone-600 dark:text-stone-400 pl-3 border-l-2 border-amber-400">
                      {rule}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Cards */}
        {relatedCards.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
              More {card.name.split(" ")[0]} Cards
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {relatedCards.map(relatedCard => (
                <Link
                  key={relatedCard.id}
                  href={`/cards/${relatedCard.id}`}
                  className="group"
                >
                  <div className="relative rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 transition-transform hover:scale-105">
                    <img
                      src={relatedCard.images?.small || relatedCard.images?.large || CARD_FALLBACK}
                      alt={relatedCard.name}
                      className="w-full aspect-[245/342] object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-center text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1 transition-colors">
                    {relatedCard.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <EnhancedCardModal
        card={card}
        isOpen={magnifyImage}
        onClose={() => setMagnifyImage(false)}
        enablePinchZoom
      />
    </FullBleedWrapper>
  );
}

// Mark as full bleed
(CardDetailPage as any).fullBleed = true;
