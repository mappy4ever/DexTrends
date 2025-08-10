import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { TypeBadge } from './TypeBadge';
import { getHolographicEffect } from '../../utils/cardEffects';
import type { PocketCard } from '../../types/api/pocket-cards';

// Enhanced interfaces for the deck builder
interface PocketDeckCard {
  id: string;
  name: string;
  image?: string;
  type?: string;
  types?: string[];
  rarity?: string;
  count: number;
  hp?: number;
  attacks?: Array<{
    name: string;
    cost: string[];
    damage?: string;
    text?: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  resistances?: Array<{
    type: string;
    value: string;
  }>;
  retreatCost?: string[];
  convertedRetreatCost?: number;
  images?: {
    small?: string;
    large?: string;
  };
  abilities?: Array<{
    name: string;
    text: string;
    type: string;
  }>;
  rules?: string[];
  legalities?: Record<string, string>;
}

interface PocketDeck {
  name: string;
  cards: PocketDeckCard[];
  types: string[];
}

interface DeckStatistics {
  totalCards: number;
  remainingSlots: number;
  typeDistribution: Record<string, number>;
}

type DeckViewMode = '5x4' | '2x10' | 'list' | 'grid';

interface PocketDeckBuilderProps {
  availableCards?: PocketDeckCard[];
  onDeckChange?: (deck: PocketDeck) => void;
  initialDeck?: PocketDeck | null;
}

export default function PocketDeckBuilder({  
  availableCards = [], 
  onDeckChange = () => {},
  initialDeck = null 
}: PocketDeckBuilderProps) {
  const [deck, setDeck] = useState<PocketDeck>(initialDeck || {
    name: 'New Deck',
    cards: [],
    types: []
  });
  const [selectedCard, setSelectedCard] = useState<PocketDeckCard | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deckView, setDeckView] = useState<DeckViewMode>('5x4'); // Default to 5x4 view
  const [visibleCardCount, setVisibleCardCount] = useState<number>(24); // Start with 24 cards for faster initial load

  // Maximum deck size for Pocket TCG (typically 20 cards)
  const MAX_DECK_SIZE = 20;
  const MAX_COPIES_PER_CARD = 2; // Pocket TCG allows max 2 copies

  // Filter available cards with performance optimization
  const filteredCards = useMemo((): PocketDeckCard[] => {
    if (!availableCards.length) return [];
    return availableCards.filter((card: PocketDeckCard) => {
      const matchesSearch = searchTerm === '' || card.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || 
        (card.types && card.types.includes(typeFilter)) ||
        (card.type && card.type.toLowerCase() === typeFilter.toLowerCase());
      return matchesSearch && matchesType;
    });
  }, [availableCards, searchTerm, typeFilter]);

  // Get visible cards for performance
  const visibleCards = useMemo((): PocketDeckCard[] => {
    return filteredCards.slice(0, visibleCardCount);
  }, [filteredCards, visibleCardCount]);

  // Load more cards function
  const loadMoreCards = useCallback(() => {
    setVisibleCardCount(prev => Math.min(prev + 24, filteredCards.length));
  }, [filteredCards.length]);

  // Calculate deck statistics
  const deckStats: DeckStatistics = useMemo(() => {
    const stats: DeckStatistics = {
      totalCards: deck.cards.reduce((sum: number, card: PocketDeckCard) => sum + card.count, 0),
      remainingSlots: 0,
      typeDistribution: {}
    };
    
    stats.remainingSlots = MAX_DECK_SIZE - stats.totalCards;
    
    // Calculate type distribution
    deck.cards.forEach((deckCard: PocketDeckCard) => {
      const cardTypes = deckCard.types || [deckCard.type].filter((t): t is string => Boolean(t));
      cardTypes.forEach((type: string) => {
        stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + deckCard.count;
      });
    });
    
    return stats;
  }, [deck.cards]);

  // Add card to deck
  const addCardToDeck = useCallback((card: PocketDeckCard): void => {
    const existingCard = deck.cards.find((c: PocketDeckCard) => c.id === card.id);
    
    if (deckStats.totalCards >= MAX_DECK_SIZE) {
      alert('Deck is full! Remove cards to add more.');
      return;
    }

    if (existingCard) {
      if (existingCard.count >= MAX_COPIES_PER_CARD) {
        alert(`Maximum ${MAX_COPIES_PER_CARD} copies of ${card.name} allowed.`);
        return;
      }
      // Increase count
      setDeck((prev: PocketDeck) => ({
        ...prev,
        cards: prev.cards.map((c: PocketDeckCard) => 
          c.id === card.id ? { ...c, count: c.count + 1 } : c
        )
      }));
    } else {
      // Add new card
      setDeck((prev: PocketDeck) => ({
        ...prev,
        cards: [...prev.cards, { ...card, count: 1 }]
      }));
    }
  }, [deck.cards, deckStats.totalCards]);

  // Remove card from deck
  const removeCardFromDeck = useCallback((cardId: string): void => {
    setDeck((prev: PocketDeck) => ({
      ...prev,
      cards: prev.cards.map((c: PocketDeckCard) => 
        c.id === cardId ? { ...c, count: Math.max(0, c.count - 1) } : c
      ).filter((c: PocketDeckCard) => c.count > 0)
    }));
  }, []);

  // Update parent component when deck changes
  useEffect(() => {
    onDeckChange(deck);
  }, [deck, onDeckChange]);

  // Define interface for deck slots with additional properties
  interface DeckSlotCard extends PocketDeckCard {
    slotIndex?: number;
  }

  // Create a comprehensive deck view that shows all 20 slots
  const renderDeckView = (): React.ReactNode => {
    // Create an array of 20 slots, filled with cards or empty slots
    const allSlots: (DeckSlotCard | null)[] = Array(MAX_DECK_SIZE).fill(null);
    let cardIndex = 0;
    
    // Fill slots with cards, accounting for multiple copies
    deck.cards.forEach((card: PocketDeckCard) => {
      for (let i = 0; i < card.count; i++) {
        if (cardIndex < MAX_DECK_SIZE) {
          allSlots[cardIndex] = { ...card, slotIndex: cardIndex };
          cardIndex++;
        }
      }
    });

    if (deckView === '5x4') {
      return (
        <div className="grid grid-cols-5 gap-1">
          {allSlots.map((card, index) => (
            <DeckSlotComponent key={index} card={card} index={index} onRemove={removeCardFromDeck} isHorizontal={false} />
          ))}
        </div>
      );
    }

    if (deckView === '2x10') {
      return (
        <div className="grid grid-cols-2 gap-1">
          {allSlots.map((card, index) => (
            <DeckSlotComponent key={index} card={card} index={index} onRemove={removeCardFromDeck} isHorizontal={true} />
          ))}
        </div>
      );
    }

    if (deckView === 'list') {
      return (
        <div className="space-y-1">
          {deck.cards.length === 0 ? (
            <div className="text-center py-8 text-text-grey">
              <p className="text-sm">No cards in deck</p>
              <p className="text-xs">Tap cards to add them</p>
            </div>
          ) : (
            deck.cards.map((card: PocketDeckCard) => (
              <div
                key={card.id}
                className="group cursor-pointer bg-off-white border border-border-color rounded p-2 hover:bg-white transition-all flex items-center gap-3"
                onClick={() => removeCardFromDeck(card.id)}
              >
                <div className="w-10 aspect-[2.5/3.5] relative bg-white rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={card.image || '/dextrendslogo.png'}
                    alt={card.name}
                    fill
                    className="object-contain"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-text line-clamp-1">
                    {card.name}
                  </p>
                  <div className="flex items-center gap-1">
                    {(card.types || [card.type].filter((t): t is string => Boolean(t))).slice(0, 2).map((type: string) => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-pokemon-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {card.count}
                  </div>
                  <div className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    −
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    // Default compact grid view
    return (
      <div className="grid grid-cols-2 gap-2">
        {deck.cards.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-text-grey">
            <p className="text-sm">No cards in deck</p>
            <p className="text-xs">Tap cards to add them</p>
          </div>
        ) : (
          deck.cards.map((card: PocketDeckCard) => (
            <div
              key={card.id}
              className="group cursor-pointer bg-off-white border border-border-color rounded p-2 hover:bg-white transition-all text-center"
              onClick={() => removeCardFromDeck(card.id)}
            >
              <div className="aspect-[2.5/3.5] relative mb-1 bg-white rounded overflow-hidden">
                <Image
                  src={card.image || '/dextrendslogo.png'}
                  alt={card.name}
                  fill
                  className="object-contain"
                  sizes="100px"
                />
              </div>
              <p className="text-xs font-medium text-dark-text line-clamp-1">
                {card.name}
              </p>
              <div className="text-xs text-pokemon-red font-semibold">
                ×{card.count}
              </div>
              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                −
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Define props interface for DeckSlot component
  interface DeckSlotProps {
    card: DeckSlotCard | null;
    index: number;
    onRemove: (cardId: string) => void;
    isHorizontal: boolean;
  }

  // Component for individual deck slots
  const DeckSlotComponent = ({ card, index, onRemove, isHorizontal }: DeckSlotProps): React.ReactElement => {
    if (!card) {
      return (
        <div className={`border-2 border-dashed border-border-grey rounded bg-off-white flex items-center justify-center ${
          isHorizontal ? 'h-12 p-2' : 'aspect-[2.5/3.5] p-1'
        }`}>
          <span className="text-xs text-text-grey">{index + 1}</span>
        </div>
      );
    }

    return (
      <div 
        className={`group cursor-pointer bg-white border border-border-color rounded hover:border-pokemon-red transition-all ${
          isHorizontal ? 'flex items-center gap-2 p-2 h-12' : 'p-1 text-center'
        }`}
        onClick={() => onRemove(card.id)}
      >
        {isHorizontal ? (
          <>
            <div className="w-8 aspect-[2.5/3.5] relative bg-off-white rounded overflow-hidden flex-shrink-0">
              <Image
                src={card.image || '/dextrendslogo.png'}
                alt={card.name}
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-dark-text line-clamp-1">
                {card.name}
              </p>
            </div>
            <div className="w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              −
            </div>
          </>
        ) : (
          <>
            <div className="aspect-[2.5/3.5] relative mb-1 bg-off-white rounded overflow-hidden">
              <Image
                src={card.image || '/dextrendslogo.png'}
                alt={card.name}
                fill
                className="object-contain"
                sizes="60px"
              />
            </div>
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              −
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full max-h-screen overflow-hidden">
      {/* Card Collection Panel */}
      <div className="flex-1 flex flex-col bg-white border border-border-color rounded-lg shadow-sm">
        {/* Collection Header */}
        <div className="p-4 border-b border-border-color bg-light-grey">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Card Collection</h3>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search cards..."
                className="input-clean w-full"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select-clean w-full sm:w-auto"
              value={typeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="fire">Fire</option>
              <option value="water">Water</option>
              <option value="grass">Grass</option>
              <option value="electric">Electric</option>
              <option value="psychic">Psychic</option>
              <option value="fighting">Fighting</option>
              <option value="dark">Dark</option>
              <option value="metal">Metal</option>
              <option value="colorless">Colorless</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-sm text-text-grey">
            Showing {visibleCards.length} of {filteredCards.length} cards
            {visibleCardCount < filteredCards.length && (
              <span className="text-pokemon-blue ml-2">• Scroll to load more</span>
            )}
          </p>
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4" id="card-collection-scroll">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {visibleCards.map((card: PocketDeckCard) => {
              const inDeck = deck.cards.find((c: PocketDeckCard) => c.id === card.id);
              const canAdd = !inDeck || inDeck.count < MAX_COPIES_PER_CARD;
              const holographicClass = getHolographicEffect(card.rarity);

              return (
                <div
                  key={card.id}
                  className={`group cursor-pointer transition-all duration-300 ${holographicClass}`}
                  onClick={() => canAdd && deckStats.totalCards < MAX_DECK_SIZE && addCardToDeck(card)}
                >
                  <div className="relative bg-white border border-border-color rounded-lg p-1 sm:p-2 hover:shadow-lg touch-manipulation">
                    {/* Card Image */}
                    <div className="aspect-[2.5/3.5] relative mb-1 sm:mb-2 bg-off-white rounded overflow-hidden">
                      <Image
                        src={card.image || '/dextrendslogo.png'}
                        alt={card.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    </div>

                    {/* Card Info */}
                    <div className="text-center">
                      <h4 className="text-xs sm:text-sm font-medium text-dark-text mb-1 line-clamp-2 leading-tight">
                        {card.name}
                      </h4>
                      
                      {/* Types */}
                      <div className="flex justify-center gap-0.5 sm:gap-1 mb-1">
                        {(card.types || [card.type].filter((t): t is string => Boolean(t))).slice(0, 2).map((type: string) => (
                          <TypeBadge key={type} type={type} size="sm" />
                        ))}
                      </div>

                      {/* Card count in deck */}
                      {inDeck && (
                        <div className="absolute -top-1 -right-1 bg-pokemon-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {inDeck.count}
                        </div>
                      )}

                      {/* Add indicator */}
                      {canAdd && deckStats.totalCards < MAX_DECK_SIZE && (
                        <div className="absolute top-1 left-1 bg-pokemon-green text-white text-xs w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          +
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Load More Button */}
          {visibleCardCount < filteredCards.length && (
            <div className="p-4 text-center border-t border-border-color bg-light-grey/50">
              <button
                onClick={loadMoreCards}
                className="btn-secondary px-6 py-2 text-sm hover:bg-pokemon-blue hover:text-white transition-all"
              >
                Load More Cards ({filteredCards.length - visibleCardCount} remaining)
              </button>
              <p className="text-xs text-text-grey mt-2">
                Loading cards in batches improves performance
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Deck Builder Panel */}
      <div className="w-full lg:w-80 flex flex-col bg-white border border-border-color rounded-lg shadow-sm max-h-96 lg:max-h-none">
        {/* New Deck Header */}
        <div className="p-4 border-b border-border-color bg-pokemon-red text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">New Deck</h3>
            <div className="text-sm font-medium">
              {deckStats.totalCards}/{MAX_DECK_SIZE} Cards
            </div>
          </div>
          
          <input
            type="text"
            value={deck.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeck((prev: PocketDeck) => ({ ...prev, name: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:bg-white/20"
            placeholder="Enter deck name..."
          />

          {/* Deck Stats */}
          <div className="flex gap-4 text-xs mt-2 opacity-90">
            <span>Types: {Object.keys(deckStats.typeDistribution).length}</span>
            <span>Remaining: {deckStats.remainingSlots}</span>
          </div>
        </div>

        {/* Enhanced View Toggle */}
        <div className="p-3 border-b border-border-color bg-light-grey">
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => setDeckView('5x4')}
              className={`px-2 py-1 text-xs rounded transition-all ${
                deckView === '5x4' 
                  ? 'bg-pokemon-red text-white shadow-sm' 
                  : 'bg-white text-dark-text hover:bg-off-white'
              }`}
            >
              5×4 Grid
            </button>
            <button
              onClick={() => setDeckView('2x10')}
              className={`px-2 py-1 text-xs rounded transition-all ${
                deckView === '2x10' 
                  ? 'bg-pokemon-red text-white shadow-sm' 
                  : 'bg-white text-dark-text hover:bg-off-white'
              }`}
            >
              2×10 Grid
            </button>
            <button
              onClick={() => setDeckView('list')}
              className={`px-2 py-1 text-xs rounded transition-all ${
                deckView === 'list' 
                  ? 'bg-pokemon-red text-white shadow-sm' 
                  : 'bg-white text-dark-text hover:bg-off-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setDeckView('grid')}
              className={`px-2 py-1 text-xs rounded transition-all ${
                deckView === 'grid' 
                  ? 'bg-pokemon-red text-white shadow-sm' 
                  : 'bg-white text-dark-text hover:bg-off-white'
              }`}
            >
              Compact
            </button>
          </div>
        </div>

        {/* Deck Cards with All Slots Visible */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3">
          {renderDeckView()}
        </div>

        {/* Type Distribution */}
        {Object.keys(deckStats.typeDistribution).length > 0 && (
          <div className="p-3 border-t border-border-color bg-light-grey">
            <h4 className="text-sm font-medium text-dark-text mb-2">Type Distribution</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(deckStats.typeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center gap-1">
                  <TypeBadge type={type} size="sm" />
                  <span className="text-xs text-text-grey">×{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}