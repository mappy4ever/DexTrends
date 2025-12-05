import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Head from "next/head";
import { fetchJSON } from "@/utils/unifiedFetch";
import { useDebounce } from "@/hooks/useDebounce";
import { useFavorites } from "@/context/UnifiedAppContext";
import { DetailPageSkeleton } from "@/components/ui/SkeletonLoadingSystem";
import logger from "@/utils/logger";
import { getRarityRank } from "@/components/ui/RarityIcon";
import TCGSetErrorBoundary from "@/components/TCGSetErrorBoundary";

// V2 Components - Comprehensive redesign
import {
  SetHero,
  ChaseCardsCarousel,
  QuickStats,
  StickySearchBar,
  CardGrid,
  CardPreviewSheet
} from "@/components/tcg-set-detail/v2";

import type { TCGCard, CardSet } from "@/types/api/cards";
import type { FavoriteCard } from "@/context/modules/types";

// Types
interface SetApiResponse {
  set: CardSet;
  cards: TCGCard[];
  warning?: string;
}

// Helper: Get actual rarity
const getActualRarity = (card: TCGCard): string => {
  if (card.rarity === 'Black White Rare') return 'Black & White Rare';

  const isBlackWhiteStyleRare =
    (card.name === 'Victini' && card.number === '172' && card.set.id === 'rsv10pt5') ||
    (card.name === 'Victini' && card.number === '171' && card.set.id === 'zsv10pt5');

  if (isBlackWhiteStyleRare) return 'Black & White Rare';

  const blackWhiteSets = ['bw1', 'bw2', 'bw3', 'bw4', 'bw5', 'bw6', 'bw7', 'bw8', 'bw9', 'bw10', 'bw11', 'bwp', 'dv1', 'bct', 'lds'];

  if (blackWhiteSets.includes(card.set.id.toLowerCase()) && card.rarity === 'Rare' && card.tcgplayer?.prices?.holofoil) {
    return 'Rare Holo';
  }

  if (card.rarity === 'Rare' && card.tcgplayer?.prices?.holofoil && !card.tcgplayer?.prices?.normal) {
    return 'Rare Holo';
  }

  return card.rarity || 'Common';
};

const SetDetailPage: NextPage = () => {
  const router = useRouter();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  // Core state
  const [setInfo, setSetInfo] = useState<CardSet | null>(null);
  const [cards, setCards] = useState<TCGCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterSupertype, setFilterSupertype] = useState("");
  const [filterEnergyType, setFilterEnergyType] = useState("");
  const [sortBy, setSortBy] = useState("number");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Modal state
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const setid = router.query.setid as string | undefined;

  // Price helper
  const getCardPrice = useCallback((card: TCGCard): number => {
    const c = card as any;

    // Check pricing object first (from enhanced API)
    if (c.pricing?.tcgplayer) {
      const tcg = c.pricing.tcgplayer;
      return tcg.holofoil?.marketPrice || tcg.normal?.marketPrice || tcg.reverse?.marketPrice || 0;
    }
    if (c.pricing?.cardmarket) {
      const cm = c.pricing.cardmarket;
      return cm.avg || cm.trend || cm.low || 0;
    }

    // Fallback to tcgplayer object
    if (c.tcgplayer?.prices) {
      const prices = Object.values(c.tcgplayer.prices) as any[];
      return prices[0]?.market || 0;
    }

    // Fallback to cardmarket
    if (c.cardmarket?.prices?.averageSellPrice) {
      return c.cardmarket.prices.averageSellPrice;
    }

    return 0;
  }, []);

  // Fetch data
  useEffect(() => {
    if (!router.isReady || !setid) return;

    let mounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const data = await fetchJSON<SetApiResponse>(`/api/tcgexpansions/${setid}`, {
          signal: controller.signal
        });

        if (!mounted) return;

        if (!data?.set) throw new Error('No data returned');

        setSetInfo(data.set);
        setCards(data.cards || []);
        setLoading(false);
      } catch (err: any) {
        if (err?.name === 'AbortError' || !mounted) return;

        logger.error("Error fetching set:", { error: err, setId: setid });

        const msg = err?.message || 'Unknown error';
        if (msg.includes('503')) {
          setError('The API is temporarily unavailable. Please try again.');
        } else if (msg.includes('404')) {
          setError(`Set "${setid}" was not found.`);
        } else {
          setError(`Failed to load: ${msg}`);
        }
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [router.isReady, setid]);

  // Filter options
  const filterOptions = useMemo(() => {
    const rarities = new Set<string>();
    const supertypes = new Set<string>();
    const energyTypes = new Set<string>();

    // Energy type order for sorting
    const energyTypeOrder: Record<string, number> = {
      'grass': 1, 'fire': 2, 'water': 3, 'lightning': 4, 'psychic': 5,
      'fighting': 6, 'darkness': 7, 'metal': 8, 'dragon': 9, 'colorless': 10, 'fairy': 11
    };

    cards.forEach(card => {
      const rarity = getActualRarity(card);
      if (rarity) rarities.add(rarity);
      if (card.supertype) supertypes.add(card.supertype);
      // Collect energy types from card types array
      if (card.types && card.types.length > 0) {
        card.types.forEach(type => {
          if (type) energyTypes.add(type.toLowerCase());
        });
      }
    });

    return {
      rarities: Array.from(rarities).sort((a, b) => getRarityRank(a) - getRarityRank(b)),
      supertypes: Array.from(supertypes),
      energyTypes: Array.from(energyTypes).sort((a, b) =>
        (energyTypeOrder[a] || 99) - (energyTypeOrder[b] || 99)
      )
    };
  }, [cards]);

  // Filtered & sorted cards
  const filteredCards = useMemo(() => {
    let result = cards.filter(card => {
      // Search filter
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!card.name.toLowerCase().includes(q)) return false;
      }

      // Rarity filter
      if (filterRarity && getActualRarity(card) !== filterRarity) return false;

      // Supertype filter
      if (filterSupertype && card.supertype !== filterSupertype) return false;

      // Energy type filter
      if (filterEnergyType) {
        const cardTypes = card.types?.map(t => t.toLowerCase()) || [];
        if (!cardTypes.includes(filterEnergyType.toLowerCase())) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-desc':
          return getCardPrice(b) - getCardPrice(a);
        case 'price-asc':
          return getCardPrice(a) - getCardPrice(b);
        case 'rarity':
          return getRarityRank(b.rarity || '') - getRarityRank(a.rarity || '');
        case 'rarity-asc':
          return getRarityRank(a.rarity || '') - getRarityRank(b.rarity || '');
        case 'hp-desc': {
          // Parse HP as number, cards without HP (Trainer/Energy) go to end
          const hpA = parseInt(a.hp || '0') || 0;
          const hpB = parseInt(b.hp || '0') || 0;
          if (hpA === 0 && hpB === 0) return 0;
          if (hpA === 0) return 1; // a goes after b
          if (hpB === 0) return -1; // b goes after a
          return hpB - hpA;
        }
        case 'hp-asc': {
          const hpA = parseInt(a.hp || '0') || 0;
          const hpB = parseInt(b.hp || '0') || 0;
          if (hpA === 0 && hpB === 0) return 0;
          if (hpA === 0) return 1;
          if (hpB === 0) return -1;
          return hpA - hpB;
        }
        case 'type': {
          // Sort by first type alphabetically
          const typeA = (a.types && a.types[0]) || 'zzz'; // Cards without types go to end
          const typeB = (b.types && b.types[0]) || 'zzz';
          return typeA.localeCompare(typeB);
        }
        case 'number-desc':
          return parseInt(b.number) - parseInt(a.number);
        case 'number':
        default:
          return parseInt(a.number) - parseInt(b.number);
      }
    });

    return result;
  }, [cards, debouncedSearch, filterRarity, filterSupertype, filterEnergyType, sortBy, getCardPrice]);

  // Stats
  const stats = useMemo(() => {
    let totalValue = 0;
    let pricedCards = 0;

    cards.forEach(card => {
      const price = getCardPrice(card);
      if (price > 0) {
        totalValue += price;
        pricedCards++;
      }
    });

    return {
      totalValue,
      averagePrice: pricedCards > 0 ? totalValue / pricedCards : 0,
      cardCount: cards.length,
      rarityCount: filterOptions.rarities.length
    };
  }, [cards, getCardPrice, filterOptions.rarities.length]);

  // Handlers
  const handleCardClick = (card: TCGCard) => {
    setSelectedCard(card);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setSelectedCard(null);
  };

  const handleFavoriteToggle = (card: TCGCard) => {
    const fav: FavoriteCard = {
      id: card.id,
      name: card.name,
      images: card.images,
      set: { id: card.set.id, name: card.set.name },
      addedAt: Date.now()
    };

    if (favorites.cards.some((c: FavoriteCard) => c.id === card.id)) {
      removeFromFavorites('cards', card.id);
    } else {
      addToFavorites('cards', fav);
    }
  };

  const isCardFavorite = (cardId: string) =>
    favorites.cards.some((c: FavoriteCard) => c.id === cardId);

  // Loading state
  if (!router.isReady || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-900">
        <DetailPageSkeleton
          variant="tcgset"
          showHeader={true}
          showImage={true}
          showStats={true}
          showTabs={false}
          showRelated={true}
        />
      </div>
    );
  }

  // Error state
  if (error || !setInfo) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            {error ? 'Error Loading Set' : 'Set Not Found'}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
            {error || "The set you're looking for couldn't be found."}
          </p>
          <button
            onClick={() => router.push('/tcgexpansions')}
            className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors"
          >
            Back to Sets
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{setInfo.name} | DexTrends TCG</title>
        <meta name="description" content={`Browse all ${cards.length} cards from ${setInfo.name}. ${setInfo.series ? `Part of the ${setInfo.series} series.` : ''}`} />
      </Head>

      <div className="min-h-screen bg-white dark:bg-stone-900">
        {/* Hero section */}
        <SetHero
          setInfo={setInfo}
          totalValue={stats.totalValue}
          cardCount={stats.cardCount}
        />

        {/* Quick stats bar */}
        <QuickStats
          totalValue={stats.totalValue}
          averagePrice={stats.averagePrice}
          cardCount={stats.cardCount}
          printedTotal={setInfo.printedTotal}
          rarityCount={stats.rarityCount}
        />

        {/* Chase cards carousel */}
        {cards.length > 0 && (
          <div className="py-4">
            <ChaseCardsCarousel
              cards={cards}
              onCardClick={handleCardClick}
              getPrice={getCardPrice}
              maxCards={12}
            />
          </div>
        )}

        {/* Sticky search & filters */}
        <StickySearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          rarities={filterOptions.rarities}
          selectedRarity={filterRarity}
          onRarityChange={setFilterRarity}
          supertypes={filterOptions.supertypes}
          selectedSupertype={filterSupertype}
          onSupertypeChange={setFilterSupertype}
          energyTypes={filterOptions.energyTypes}
          selectedEnergyType={filterEnergyType}
          onEnergyTypeChange={setFilterEnergyType}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCards={cards.length}
          filteredCount={filteredCards.length}
        />

        {/* Card grid */}
        <div className="pb-safe">
          <CardGrid
            cards={filteredCards}
            onCardClick={handleCardClick}
            getPrice={getCardPrice}
            showPrices={true}
          />
        </div>

        {/* Card preview sheet */}
        <CardPreviewSheet
          card={selectedCard}
          isOpen={sheetOpen}
          onClose={handleCloseSheet}
          onFavoriteToggle={handleFavoriteToggle}
          isFavorite={selectedCard ? isCardFavorite(selectedCard.id) : false}
          getPrice={getCardPrice}
        />
      </div>
    </>
  );
};

// Wrap with error boundary
const SetDetailPageWithErrorBoundary: NextPage = () => (
  <TCGSetErrorBoundary>
    <SetDetailPage />
  </TCGSetErrorBoundary>
);

// Full bleed layout
(SetDetailPageWithErrorBoundary as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default SetDetailPageWithErrorBoundary;
