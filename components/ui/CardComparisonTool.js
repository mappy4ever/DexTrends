import React, { useState, useCallback } from 'react';
import UnifiedCard from './UnifiedCard';
import Modal from './modals/Modal';

/**
 * Advanced card comparison tool for side-by-side analysis
 */
const CardComparisonTool = ({ 
  isOpen = false, 
  onClose = () => {},
  initialCards = [],
  maxCards = 4 
}) => {
  const [selectedCards, setSelectedCards] = useState(initialCards.slice(0, maxCards));
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [comparisonView, setComparisonView] = useState('side-by-side'); // 'side-by-side', 'overlay', 'stats'

  // Mock search function - replace with actual API call
  const searchCards = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Mock search results
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockResults = [
        {
          id: 'base1-1',
          name: 'Alakazam',
          images: { small: '/back-card.png' },
          set: { name: 'Base Set', id: 'base1' },
          rarity: 'Rare Holo',
          hp: '80',
          types: [{ type: { name: 'psychic' } }],
          tcgplayer: { prices: { holofoil: { market: 45.99 } } }
        },
        {
          id: 'base1-4',
          name: 'Charizard',
          images: { small: '/back-card.png' },
          set: { name: 'Base Set', id: 'base1' },
          rarity: 'Rare Holo',
          hp: '120',
          types: [{ type: { name: 'fire' } }],
          tcgplayer: { prices: { holofoil: { market: 350.00 } } }
        }
      ].filter(card => card.name.toLowerCase().includes(term.toLowerCase()));
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const addCard = (card) => {
    if (selectedCards.length < maxCards && !selectedCards.find(c => c.id === card.id)) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const removeCard = (cardId) => {
    setSelectedCards(selectedCards.filter(card => card.id !== cardId));
  };

  const clearAll = () => {
    setSelectedCards([]);
  };

  const getComparisonData = () => {
    return selectedCards.map(card => ({
      id: card.id,
      name: card.name,
      hp: card.hp || 'N/A',
      rarity: card.rarity || 'N/A',
      price: card.tcgplayer?.prices?.holofoil?.market ? `$${card.tcgplayer.prices.holofoil.market.toFixed(2)}` : 'N/A',
      set: card.set?.name || 'N/A',
      types: card.types?.map(t => t.type?.name || t).join(', ') || 'N/A',
      releaseDate: card.set?.releaseDate ? new Date(card.set.releaseDate).getFullYear() : 'N/A'
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Card Comparison Tool</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Compare up to {maxCards} cards side by side
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View toggles */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setComparisonView('side-by-side')}
                className={`px-3 py-1 text-sm rounded ${
                  comparisonView === 'side-by-side'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Side by Side
              </button>
              <button
                onClick={() => setComparisonView('stats')}
                className={`px-3 py-1 text-sm rounded ${
                  comparisonView === 'stats'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Stats Table
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar for search and card selection */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cards to add..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchCards(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {isSearching && (
                  <div className="absolute right-2 top-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Search results */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Search Results</h3>
                  {searchResults.map(card => (
                    <div key={card.id} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <img 
                        src={card.images.small} 
                        alt={card.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{card.name}</p>
                        <p className="text-xs text-gray-500">{card.set.name}</p>
                      </div>
                      <button
                        onClick={() => addCard(card)}
                        disabled={selectedCards.length >= maxCards || selectedCards.find(c => c.id === card.id)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main comparison area */}
          <div className="flex-1 flex flex-col">
            {/* Selected cards header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Selected Cards ({selectedCards.length}/{maxCards})
              </h3>
              {selectedCards.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Comparison content */}
            <div className="flex-1 overflow-auto p-4">
              {selectedCards.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cards Selected</h3>
                    <p className="text-gray-500">Search and add cards to start comparing</p>
                  </div>
                </div>
              ) : comparisonView === 'side-by-side' ? (
                <div className={`grid gap-6 ${selectedCards.length === 1 ? 'grid-cols-1' : selectedCards.length === 2 ? 'grid-cols-2' : selectedCards.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                  {selectedCards.map(card => (
                    <div key={card.id} className="relative">
                      <button
                        onClick={() => removeCard(card.id)}
                        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <UnifiedCard
                        card={card}
                        cardType="tcg"
                        showPrice={true}
                        showSet={true}
                        showTypes={true}
                        showRarity={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // Stats table view
                (<div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                          Property
                        </th>
                        {selectedCards.map(card => (
                          <th key={card.id} className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <img src={card.images.small} alt={card.name} className="w-8 h-10 object-cover rounded" />
                              <span className="truncate">{card.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['hp', 'rarity', 'price', 'set', 'types', 'releaseDate'].map(property => {
                        const comparisonData = getComparisonData();
                        return (
                          <tr key={property}>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium text-gray-900 dark:text-white capitalize">
                              {property === 'hp' ? 'HP' : property.replace(/([A-Z])/g, ' $1').trim()}
                            </td>
                            {comparisonData.map(cardData => (
                              <td key={`${cardData.id}-${property}`} className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                                {cardData[property]}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CardComparisonTool;