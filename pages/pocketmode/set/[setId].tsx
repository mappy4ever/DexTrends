import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { fetchPocketData } from '@/utils/pocketData';
import { useDebounce } from '@/hooks/useDebounce';
import { DetailPageSkeleton } from '@/components/ui/SkeletonLoadingSystem';
import logger from '@/utils/logger';

// V2 Components - Matching TCG set detail style
import {
  PocketSetHero,
  PocketQuickStats,
  FeaturedCardsCarousel,
  PocketSearchBar,
  PocketCardGrid,
  PocketCardPreviewSheet
} from '@/components/pocket-set-detail/v2';

import type { PocketCard } from '@/types/api/pocket-cards';

// Extended PocketCard type with additional properties
interface ExtendedPocketCard extends PocketCard {
  pack?: string;
  type?: string;
  health?: string | number;
  ex?: "Yes" | "No";
  fullart?: "Yes" | "No";
}

interface SetInfo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cardCount: number;
}

// Set themes with details
const setThemes: Record<string, { name: string; description: string; emoji: string }> = {
  'genetic-apex': {
    name: 'Genetic Apex',
    description: 'The first expansion set for Pokemon TCG Pocket featuring legendary Pokemon.',
    emoji: '🧬'
  },
  'mythical-island': {
    name: 'Mythical Island',
    description: 'Discover mystical Pokemon from the legendary Mythical Island.',
    emoji: '🏝️'
  },
  'space-time-smackdown': {
    name: 'Space-Time Smackdown',
    description: 'Master time and space with the legendary powers of Dialga and Palkia.',
    emoji: '⏰'
  },
  'triumphant-light': {
    name: 'Triumphant Light',
    description: 'Illuminate your path to victory with brilliant light-type Pokemon.',
    emoji: '✨'
  },
  'shining-revelry': {
    name: 'Shining Revelry',
    description: 'Experience the ultimate rivalry with shining rare Pokemon cards.',
    emoji: '🌟'
  },
  'celestial-guardians': {
    name: 'Celestial Guardians',
    description: 'Harness the celestial powers of the sun and moon guardians.',
    emoji: '🌙'
  },
  'extradimensional-crisis': {
    name: 'Extradimensional Crisis',
    description: 'Battle across dimensions with ultra-rare interdimensional Pokemon.',
    emoji: '🌀'
  },
  'eevee-grove': {
    name: 'Eevee Grove',
    description: 'Celebrate the evolution possibilities with Eevee and all its evolutions.',
    emoji: '🦊'
  },
  'promo-a': {
    name: 'Promo Cards',
    description: 'Exclusive promotional cards available through special events and campaigns.',
    emoji: '🎁'
  }
};

// Rarity ranking for sorting
const rarityRank: Record<string, number> = {
  '👑': 10, '♕': 10,
  '★★★': 9, '★★': 8, '☆☆': 8, '★': 7, '☆': 7,
  '◊◊◊◊': 6, '◊◊◊': 5, '◊◊': 4, '◊': 3
};

function PocketSetView() {
  const router = useRouter();
  const { setId } = router.query;

  // Core state
  const [allCards, setAllCards] = useState<ExtendedPocketCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setInfo, setSetInfo] = useState<SetInfo | null>(null);

  // Filter & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState('');
  const [filterSupertype, setFilterSupertype] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('number');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Modal state
  const [selectedCard, setSelectedCard] = useState<ExtendedPocketCard | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter cards based on set ID
  const filterCardsBySet = useCallback((cards: ExtendedPocketCard[], targetSetId: string): ExtendedPocketCard[] => {
    const packMappings: Record<string, string[]> = {
      'genetic-apex': ['Mewtwo', 'Charizard', 'Pikachu'],
      'mythical-island': ['Mythical Island'],
      'space-time-smackdown': ['Dialga', 'Palkia'],
      'triumphant-light': ['Triumphant Light'],
      'shining-revelry': ['Shining Revelry'],
      'celestial-guardians': ['Solgaleo', 'Lunala'],
      'extradimensional-crisis': ['Extradimensional Crisis'],
      'eevee-grove': ['Eevee Grove'],
      'promo-a': []
    };

    const packNames = packMappings[targetSetId] || [];

    if (targetSetId === 'promo-a') {
      return cards.filter((card: ExtendedPocketCard) => {
        const packName = (card.pack || '').toLowerCase();
        return packName.includes('promo') ||
               packName.includes('promotional') ||
               packName.includes('special') ||
               packName.includes('shop') ||
               packName.includes('campaign') ||
               packName.includes('premium') ||
               packName.includes('wonder');
      });
    }

    const filtered = cards.filter((card: ExtendedPocketCard) =>
      packNames.includes(card.pack || '')
    );

    return Array.from(new Map(filtered.map(card => [card.id, card])).values());
  }, []);

  // Load data
  useEffect(() => {
    if (!router.isReady || !setId || typeof setId !== 'string') return;

    // Handle old URL format (e.g., a2b-107) by redirecting
    if (/^[a-z]\d+[a-z]?-\d+$/i.test(setId)) {
      const expansionCode = setId.split('-')[0].toLowerCase();
      const expansionMapping: Record<string, string> = {
        'a1': 'genetic-apex',
        'a1a': 'mythical-island',
        'a2': 'space-time-smackdown',
        'a2a': 'triumphant-light',
        'a2b': 'shining-revelry',
        'a3': 'celestial-guardians',
        'a3a': 'extradimensional-crisis',
        'a4': 'eevee-grove',
        'pa': 'promo-a'
      };

      const correctSetName = expansionMapping[expansionCode] || expansionCode;
      router.replace(`/pocketmode/set/${correctSetName}`);
      return;
    }

    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cards = await fetchPocketData() as ExtendedPocketCard[];
        if (!mounted) return;

        logger.debug('PocketSetView cards loaded', { setId, totalCards: cards.length });

        const theme = setThemes[setId] || {
          name: setId.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          description: 'Browse cards from this Pokemon TCG Pocket expansion.',
          emoji: '📦'
        };

        const setCards = filterCardsBySet(cards, setId);

        setAllCards(setCards);
        setSetInfo({
          id: setId,
          name: theme.name,
          description: theme.description,
          emoji: theme.emoji,
          cardCount: setCards.length
        });

        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        logger.error("Error loading set data:", err);
        setError("Failed to load expansion data");
        setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [router.isReady, setId, router, filterCardsBySet]);

  // Filter options
  const filterOptions = useMemo(() => {
    const rarities = new Set<string>();
    const supertypes = new Set<string>();
    const types = new Set<string>();

    const energyTypeOrder: Record<string, number> = {
      'grass': 1, 'fire': 2, 'water': 3, 'lightning': 4, 'psychic': 5,
      'fighting': 6, 'darkness': 7, 'metal': 8, 'dragon': 9, 'colorless': 10, 'fairy': 11
    };

    allCards.forEach(card => {
      if (card.rarity) rarities.add(card.rarity);
      if (card.supertype) supertypes.add(card.supertype);
      if (card.types && card.types.length > 0) {
        card.types.forEach(type => {
          if (type) types.add(type.toLowerCase());
        });
      }
      // Also check the type field for backward compatibility
      if (card.type) types.add(card.type.toLowerCase());
    });

    return {
      rarities: Array.from(rarities).sort((a, b) => (rarityRank[b] || 0) - (rarityRank[a] || 0)),
      supertypes: Array.from(supertypes),
      types: Array.from(types).sort((a, b) =>
        (energyTypeOrder[a] || 99) - (energyTypeOrder[b] || 99)
      )
    };
  }, [allCards]);

  // Filtered & sorted cards
  const filteredCards = useMemo(() => {
    let result = allCards.filter(card => {
      // Search filter
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!card.name.toLowerCase().includes(q)) return false;
      }

      // Rarity filter
      if (filterRarity && card.rarity !== filterRarity) return false;

      // Supertype filter
      if (filterSupertype && card.supertype !== filterSupertype) return false;

      // Type filter
      if (filterType) {
        const cardTypes = card.types?.map(t => t.toLowerCase()) || [];
        const cardType = card.type?.toLowerCase() || '';
        if (!cardTypes.includes(filterType.toLowerCase()) && cardType !== filterType.toLowerCase()) {
          return false;
        }
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
        case 'rarity':
          return (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0);
        case 'rarity-asc':
          return (rarityRank[a.rarity] || 0) - (rarityRank[b.rarity] || 0);
        case 'hp-desc': {
          const hpA = parseInt(String(a.hp || a.health || 0)) || 0;
          const hpB = parseInt(String(b.hp || b.health || 0)) || 0;
          if (hpA === 0 && hpB === 0) return 0;
          if (hpA === 0) return 1;
          if (hpB === 0) return -1;
          return hpB - hpA;
        }
        case 'hp-asc': {
          const hpA = parseInt(String(a.hp || a.health || 0)) || 0;
          const hpB = parseInt(String(b.hp || b.health || 0)) || 0;
          if (hpA === 0 && hpB === 0) return 0;
          if (hpA === 0) return 1;
          if (hpB === 0) return -1;
          return hpA - hpB;
        }
        case 'type': {
          const typeA = (a.types && a.types[0]) || a.type || 'zzz';
          const typeB = (b.types && b.types[0]) || b.type || 'zzz';
          return typeA.localeCompare(typeB);
        }
        case 'number-desc': {
          const numA = parseInt(a.id?.split('-')[1] || a.number || '0') || 0;
          const numB = parseInt(b.id?.split('-')[1] || b.number || '0') || 0;
          return numB - numA;
        }
        case 'number':
        default: {
          const numA = parseInt(a.id?.split('-')[1] || a.number || '0') || 0;
          const numB = parseInt(b.id?.split('-')[1] || b.number || '0') || 0;
          return numA - numB;
        }
      }
    });

    return result;
  }, [allCards, debouncedSearch, filterRarity, filterSupertype, filterType, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const exCount = allCards.filter(c => (c as ExtendedPocketCard).ex === 'Yes').length;
    return {
      cardCount: allCards.length,
      typeCount: filterOptions.types.length,
      rarityCount: filterOptions.rarities.length,
      exCount
    };
  }, [allCards, filterOptions]);

  // Handlers
  const handleCardClick = (card: PocketCard) => {
    setSelectedCard(card as ExtendedPocketCard);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setSelectedCard(null);
  };

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
            onClick={() => router.push('/pocketmode/expansions')}
            className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors"
          >
            Back to Expansions
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{setInfo.name} | Pokemon Pocket | DexTrends</title>
        <meta name="description" content={`Browse all ${allCards.length} cards from ${setInfo.name}. ${setInfo.description}`} />
      </Head>

      <div className="min-h-screen bg-white dark:bg-stone-900">
        {/* Hero section */}
        <PocketSetHero setInfo={setInfo} />

        {/* Quick stats bar */}
        <PocketQuickStats
          cardCount={stats.cardCount}
          typeCount={stats.typeCount}
          rarityCount={stats.rarityCount}
          exCount={stats.exCount}
        />

        {/* Featured cards carousel */}
        {allCards.length > 0 && (
          <div className="py-4">
            <FeaturedCardsCarousel
              cards={allCards}
              onCardClick={handleCardClick}
              maxCards={12}
            />
          </div>
        )}

        {/* Sticky search & filters */}
        <PocketSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          rarities={filterOptions.rarities}
          selectedRarity={filterRarity}
          onRarityChange={setFilterRarity}
          types={filterOptions.types}
          selectedType={filterType}
          onTypeChange={setFilterType}
          supertypes={filterOptions.supertypes}
          selectedSupertype={filterSupertype}
          onSupertypeChange={setFilterSupertype}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCards={allCards.length}
          filteredCount={filteredCards.length}
        />

        {/* Card grid */}
        <div className="pb-safe">
          <PocketCardGrid
            cards={filteredCards}
            onCardClick={handleCardClick}
          />
        </div>

        {/* Card preview sheet */}
        <PocketCardPreviewSheet
          card={selectedCard}
          isOpen={sheetOpen}
          onClose={handleCloseSheet}
        />
      </div>
    </>
  );
}

// Full bleed layout
(PocketSetView as any).fullBleed = true;

export default PocketSetView;
