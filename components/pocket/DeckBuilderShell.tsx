/**
 * DeckBuilderShell - Main layout orchestrator for the deck builder
 *
 * Combines:
 * - SmartFilterBar (top)
 * - CardBrowser (main content)
 * - StickyDeckPanel (right sidebar on desktop, bottom sheet on mobile)
 * - DeckPreviewModal (triggered by View button)
 * - ShareDeckSheet (triggered by Share button)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { useDeckBuilder, type ExtendedPocketCard } from '@/hooks/useDeckBuilder';
import { useCardBrowser } from '@/hooks/useCardBrowser';
import { CardBrowser } from './CardBrowser';
import { StickyDeckPanel } from './StickyDeckPanel';
import { SmartFilterBar } from './SmartFilterBar';
import { DeckPreviewModal } from './DeckPreviewModal';
import { ShareDeckSheet } from './ShareDeckSheet';

interface DeckBuilderShellProps {
  cards: ExtendedPocketCard[];
  loading?: boolean;
  error?: string | null;
}

export function DeckBuilderShell({ cards, loading = false, error = null }: DeckBuilderShellProps) {
  const router = useRouter();

  // Initialize deck builder hook
  const {
    deck,
    deckName,
    setDeckName,
    deckStats,
    addCard,
    removeCard,
    getCardCount,
    clearDeck,
    generateShareUrl,
    exportToText,
    exportToJSON,
    importFromShareUrl,
    MAX_DECK_SIZE,
    MAX_COPIES_PER_CARD
  } = useDeckBuilder(cards);

  // Initialize card browser hook
  const {
    visibleCards,
    totalFilteredCount,
    filters,
    filterOptions,
    setSearch,
    toggleType,
    setCategory,
    setTrainerSubtype,
    togglePack,
    toggleRarity,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,
    hasMore,
    loadMore
  } = useCardBrowser(cards, { pageSize: 24 });

  // Modal states
  const [showPreview, setShowPreview] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [zoomedCard, setZoomedCard] = useState<ExtendedPocketCard | null>(null);

  // Check for shared deck in URL on mount
  useEffect(() => {
    const { d } = router.query;
    if (d && typeof d === 'string') {
      const result = importFromShareUrl(d);
      if (result.success) {
        // Clear the URL parameter after import
        router.replace('/pocketmode/deckbuilder', undefined, { shallow: true });
      }
    }
  }, [router.query, importFromShareUrl, router]);

  // Handlers
  const handleCardClick = useCallback((card: ExtendedPocketCard) => {
    addCard(card);
  }, [addCard]);

  const handleCardLongPress = useCallback((card: ExtendedPocketCard) => {
    setZoomedCard(card);
  }, []);

  const handleViewDeck = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleShareDeck = useCallback(() => {
    setShowShare(true);
  }, []);

  const handleSaveImage = useCallback(() => {
    setShowShare(false);
    setShowPreview(true);
  }, []);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 mb-4 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
          Failed to Load Cards
        </h2>
        <p className="text-stone-500 dark:text-stone-400 text-center max-w-md">
          {error}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={cn(
            'mt-6 px-6 py-2.5 rounded-full font-medium',
            'bg-blue-500 hover:bg-blue-600 text-white',
            'transition-colors duration-200'
          )}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-500 dark:text-stone-400">Loading cards...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)]">
      {/* Main Content Area */}
      <div className={cn(
        'flex-1 flex flex-col',
        'lg:mr-80', // Space for sticky panel on desktop
        'pb-[100px] lg:pb-0' // Space for bottom panel on mobile
      )}>
        {/* Filter Bar */}
        <div className="sticky top-0 z-20 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 p-4">
          <SmartFilterBar
            filters={filters}
            filterOptions={filterOptions}
            onSearchChange={setSearch}
            onTypeToggle={toggleType}
            onCategoryChange={setCategory}
            onTrainerSubtypeChange={setTrainerSubtype}
            onPackToggle={togglePack}
            onRarityToggle={toggleRarity}
            onClearFilters={clearFilters}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderToggle={toggleSortOrder}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            totalResults={totalFilteredCount}
          />
        </div>

        {/* Card Browser */}
        <div className="flex-1 px-4 py-2">
          <CardBrowser
            cards={visibleCards}
            onCardClick={handleCardClick}
            onCardLongPress={handleCardLongPress}
            getCardCount={getCardCount}
            maxCopies={MAX_COPIES_PER_CARD}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loading={loading}
            totalCount={totalFilteredCount}
          />
        </div>
      </div>

      {/* Sticky Deck Panel */}
      <div className="fixed right-0 top-16 bottom-0 lg:block hidden">
        <StickyDeckPanel
          deck={deck}
          deckName={deckName}
          deckStats={deckStats}
          maxDeckSize={MAX_DECK_SIZE}
          onRemoveCard={removeCard}
          onClearDeck={clearDeck}
          onViewDeck={handleViewDeck}
          onShareDeck={handleShareDeck}
          onNameChange={setDeckName}
        />
      </div>

      {/* Mobile Sticky Panel */}
      <div className="lg:hidden">
        <StickyDeckPanel
          deck={deck}
          deckName={deckName}
          deckStats={deckStats}
          maxDeckSize={MAX_DECK_SIZE}
          onRemoveCard={removeCard}
          onClearDeck={clearDeck}
          onViewDeck={handleViewDeck}
          onShareDeck={handleShareDeck}
          onNameChange={setDeckName}
        />
      </div>

      {/* Deck Preview Modal */}
      <DeckPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        deck={deck}
        deckName={deckName}
        deckStats={deckStats}
        onShare={() => {
          setShowPreview(false);
          setShowShare(true);
        }}
      />

      {/* Share Sheet */}
      <ShareDeckSheet
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        deck={deck}
        deckName={deckName}
        deckStats={deckStats}
        onSaveImage={handleSaveImage}
        shareUrl={generateShareUrl()}
        exportText={exportToText()}
        exportJSON={exportToJSON()}
      />

      {/* Card Zoom Modal (for long press) */}
      {zoomedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setZoomedCard(null)}
        >
          <div className="relative w-72 aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-2xl">
            <img
              src={zoomedCard.image || zoomedCard.thumbnail || '/placeholder-card.png'}
              alt={zoomedCard.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <h3 className="text-white text-xl font-bold mb-2">{zoomedCard.name}</h3>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addCard(zoomedCard);
                }}
                disabled={getCardCount(zoomedCard.id) >= MAX_COPIES_PER_CARD || deckStats.isFull}
                className={cn(
                  'px-6 py-2.5 rounded-full font-medium',
                  'bg-green-500 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors duration-200'
                )}
              >
                Add to Deck
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomedCard(null);
                }}
                className={cn(
                  'px-6 py-2.5 rounded-full font-medium',
                  'bg-white/20 text-white',
                  'transition-colors duration-200'
                )}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
