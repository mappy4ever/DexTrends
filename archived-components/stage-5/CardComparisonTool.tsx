import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { TypeBadge } from '../TypeBadge';
import { TCGCard as Advanced3DCard } from './TCGCard';
import logger from '@/utils/logger';

interface Card {
  id?: string;
  name?: string;
  images?: { small?: string; large?: string };
  set?: { name?: string; releaseDate?: string };
  rarity?: string;
  hp?: string;
  types?: string[];
  artist?: string;
  attacks?: Array<{ name?: string; damage?: string; text?: string }>;
  weaknesses?: Array<{ type?: string; value?: string }>;
  resistances?: Array<{ type?: string; value?: string }>;
  retreatCost?: string[];
}

interface CardComparisonToolProps {
  isOpen: boolean;
  onClose: () => void;
  initialCards?: Card[];
}

const CardComparisonTool = ({ isOpen, onClose, initialCards = [] }: CardComparisonToolProps) => {
  const [comparisonCards, setComparisonCards] = useState<(Card | null)[]>([null, null]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(0);

  // Initialize with provided cards
  useEffect(() => {
    if (initialCards.length > 0) {
      setComparisonCards([
        initialCards[0] || null,
        initialCards[1] || null
      ]);
    }
  }, [initialCards]);

  // Search for cards
  const searchCards = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // This would typically use your Pokemon TCG API
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${query}*&pageSize=12`);
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      logger.error('Error searching cards:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCards(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addCardToComparison = (card: Card) => {
    const newCards = [...comparisonCards];
    newCards[selectedSlot] = card;
    setComparisonCards(newCards);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCard = (index: number) => {
    const newCards = [...comparisonCards];
    newCards[index] = null;
    setComparisonCards(newCards);
  };

  const swapCards = (): void => {
    setComparisonCards([comparisonCards[1], comparisonCards[0]]);
  };

  const getMockPrice = (card: Card) => {
    // Mock pricing based on rarity
    const rarityPrices: Record<string, number> = {
      'Common': Math.random() * 5 + 0.5,
      'Uncommon': Math.random() * 10 + 2,
      'Rare': Math.random() * 25 + 5,
      'Rare Holo': Math.random() * 50 + 15,
      'Rare Holo GX': Math.random() * 100 + 25,
      'Rare Holo EX': Math.random() * 80 + 20,
      'Rare Holo V': Math.random() * 75 + 30,
      'Rare Holo VMAX': Math.random() * 150 + 50,
      'Rare Ultra': Math.random() * 200 + 75,
      'Rare Secret': Math.random() * 300 + 100,
    };
    return rarityPrices[card?.rarity || ''] || Math.random() * 10 + 1;
  };

  const formatPrice = (price: number) => `$${Math.round(price * 100) / 100}`;

  interface ComparisonRow {
    attribute: string;
    card1: string | number;
    card2: string | number;
    comparison: 'card1' | 'card2' | 'tie' | null;
  }

  const getComparisonData = (): ComparisonRow[] => {
    if (!comparisonCards[0] || !comparisonCards[1]) return [];

    const card1 = comparisonCards[0];
    const card2 = comparisonCards[1];

    return [
      {
        attribute: 'Name',
        card1: card1.name || 'Unknown',
        card2: card2.name || 'Unknown',
        comparison: null
      },
      {
        attribute: 'Set',
        card1: card1.set?.name || 'Unknown',
        card2: card2.set?.name || 'Unknown',
        comparison: null
      },
      {
        attribute: 'Rarity',
        card1: card1.rarity || 'Unknown',
        card2: card2.rarity || 'Unknown',
        comparison: null
      },
      {
        attribute: 'HP',
        card1: card1.hp || 'N/A',
        card2: card2.hp || 'N/A',
        comparison: card1.hp && card2.hp ? 
          (parseInt(card1.hp) > parseInt(card2.hp) ? 'card1' : 
           parseInt(card1.hp) < parseInt(card2.hp) ? 'card2' : 'tie') : null
      },
      {
        attribute: 'Types',
        card1: card1.types?.join(', ') || 'Unknown',
        card2: card2.types?.join(', ') || 'Unknown',
        comparison: null
      },
      {
        attribute: 'Artist',
        card1: card1.artist || 'Unknown',
        card2: card2.artist || 'Unknown',
        comparison: null
      },
      {
        attribute: 'Release Date',
        card1: card1.set?.releaseDate ? new Date(card1.set.releaseDate).getFullYear() : 'Unknown',
        card2: card2.set?.releaseDate ? new Date(card2.set.releaseDate).getFullYear() : 'Unknown',
        comparison: card1.set?.releaseDate && card2.set?.releaseDate ? 
          (new Date(card1.set.releaseDate) > new Date(card2.set.releaseDate) ? 'card1' : 
           new Date(card1.set.releaseDate) < new Date(card2.set.releaseDate) ? 'card2' : 'tie') : null
      },
      {
        attribute: 'Estimated Price',
        card1: formatPrice(getMockPrice(card1)),
        card2: formatPrice(getMockPrice(card2)),
        comparison: (() => {
          const price1 = getMockPrice(card1);
          const price2 = getMockPrice(card2);
          return price1 > price2 ? 'card1' : price1 < price2 ? 'card2' : 'tie';
        })()
      }
    ];
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Comparison Tool" size="xl">
      <div className="space-y-6">
        {/* Card Selection Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Slots */}
          {comparisonCards.map((card, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Card {index + 1}
                </h3>
                {card && (
                  <button
                    onClick={() => removeCard(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove card"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {card ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={card.images?.small || '/back-card.png'}
                      alt={card.name || 'Card'}
                      width={120}
                      height={168}
                      className="rounded-lg shadow-md"
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{card.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{card.set?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{card.rarity}</p>
                      {card.types && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {card.types.map((type: string) => (
                            <TypeBadge key={type} type={type.toLowerCase()} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedSlot(index)}
                  className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                    selectedSlot === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedSlot === index ? 'Search and select a card below' : 'Click to select card'}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Swap Button */}
        {comparisonCards[0] && comparisonCards[1] && (
          <div className="text-center">
            <button
              onClick={swapCards}
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Swap Cards
            </button>
          </div>
        )}

        {/* Search Section */}
        {(!comparisonCards[0] || !comparisonCards[1]) && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search for {selectedSlot === 0 ? 'first' : 'second'} card
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Enter card name..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {searchResults.map((card: Card) => (
                  <button
                    key={card.id}
                    onClick={() => addCardToComparison(card)}
                    className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Image
                      src={card.images?.small || '/back-card.png'}
                      alt={card.name || 'Card'}
                      width={80}
                      height={112}
                      className="rounded shadow-sm"
                    />
                    <span className="mt-2 text-xs text-center text-gray-700 dark:text-gray-300 line-clamp-2">
                      {card.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparison Table */}
        {comparisonCards[0] && comparisonCards[1] && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              Detailed Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      Attribute
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {comparisonCards[0].name}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {comparisonCards[1].name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getComparisonData().map((row: ComparisonRow, index: number) => (
                    <tr key={row.attribute} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                        {row.attribute}
                      </td>
                      <td className={`px-4 py-3 text-sm text-center border-b border-gray-200 dark:border-gray-600 ${
                        row.comparison === 'card1' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 font-semibold' :
                        row.comparison === 'card2' ? 'text-gray-600 dark:text-gray-400' :
                        'text-gray-700 dark:text-gray-300'
                      }`}>
                        {row.card1}
                      </td>
                      <td className={`px-4 py-3 text-sm text-center border-b border-gray-200 dark:border-gray-600 ${
                        row.comparison === 'card2' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 font-semibold' :
                        row.comparison === 'card1' ? 'text-gray-600 dark:text-gray-400' :
                        'text-gray-700 dark:text-gray-300'
                      }`}>
                        {row.card2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setComparisonCards([null, null])}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Comparison
              </button>
              <button
                onClick={() => {
                  // Export comparison data
                  const data = getComparisonData();
                  const csvContent = data.map((row: ComparisonRow) => `${row.attribute},${row.card1},${row.card2}`).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `card_comparison_${Date.now()}.csv`;
                  a.click();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CardComparisonTool;