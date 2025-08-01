import React, { useState, useEffect, useMemo } from 'react';
import { CheckIcon, XMarkIcon, ArrowDownTrayIcon, ShareIcon, TagIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from './modals/Modal';
import { useNotifications } from '../../hooks/useNotifications';

// Types and Interfaces
interface Card {
  id: string;
  name: string;
  currentPrice?: number;
  price?: number;
  rarity?: string;
  set?: {
    name: string;
    releaseDate?: string;
  };
  types?: string[];
}

interface SelectionAnalytics {
  count: number;
  totalValue: number;
  averageValue: number;
  rarities: Record<string, number>;
  sets: Record<string, number>;
  types: Record<string, number>;
  oldestCard: Card;
  newestCard: Card;
}

interface BulkCardOperationsProps {
  cards?: Card[];
  selectedCardIds?: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkAction: (action: string, cardIds: string[], options?: any) => Promise<void>;
  isVisible?: boolean;
  onClose: () => void;
}

type TabId = 'select' | 'actions' | 'analytics';

interface Tab {
  id: TabId;
  name: string;
  icon: string;
}

/**
 * Advanced Bulk Card Operations System
 * Provides comprehensive bulk actions for power users
 */
const BulkCardOperations: React.FC<BulkCardOperationsProps> = ({ 
  cards = [], 
  selectedCardIds = [], 
  onSelectionChange,
  onBulkAction,
  isVisible = false,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('select');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [targetCollection, setTargetCollection] = useState('');
  const [priceThreshold, setPriceThreshold] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const { notify } = useNotifications();

  // Load custom tags from localStorage
  useEffect(() => {
    const savedTags = localStorage.getItem('customCardTags');
    if (savedTags) {
      setCustomTags(JSON.parse(savedTags));
    }
  }, []);

  // Save custom tags to localStorage
  const saveCustomTags = (tags: string[]) => {
    setCustomTags(tags);
    localStorage.setItem('customCardTags', JSON.stringify(tags));
  };

  // Get selected cards data
  const selectedCards = useMemo(() => {
    return cards.filter(card => selectedCardIds.includes(card.id));
  }, [cards, selectedCardIds]);

  // Analytics for selected cards
  const selectionAnalytics = useMemo((): SelectionAnalytics | null => {
    if (selectedCards.length === 0) return null;

    const totalValue = selectedCards.reduce((sum, card) => {
      const price = parseFloat(String(card.currentPrice || card.price || 0));
      return sum + price;
    }, 0);

    const rarities = selectedCards.reduce<Record<string, number>>((acc, card) => {
      const rarity = card.rarity || 'Unknown';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {});

    const sets = selectedCards.reduce<Record<string, number>>((acc, card) => {
      const setName = card.set?.name || 'Unknown';
      acc[setName] = (acc[setName] || 0) + 1;
      return acc;
    }, {});

    const types = selectedCards.reduce<Record<string, number>>((acc, card) => {
      const cardTypes = card.types || ['Unknown'];
      cardTypes.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      count: selectedCards.length,
      totalValue,
      averageValue: totalValue / selectedCards.length,
      rarities,
      sets,
      types,
      oldestCard: selectedCards.reduce((oldest, card) => {
        const cardDate = new Date(card.set?.releaseDate || '1999-01-01');
        const oldestDate = new Date(oldest.set?.releaseDate || '1999-01-01');
        return cardDate < oldestDate ? card : oldest;
      }, selectedCards[0]),
      newestCard: selectedCards.reduce((newest, card) => {
        const cardDate = new Date(card.set?.releaseDate || '1999-01-01');
        const newestDate = new Date(newest.set?.releaseDate || '1999-01-01');
        return cardDate > newestDate ? card : newest;
      }, selectedCards[0])
    };
  }, [selectedCards]);

  // Quick selection methods
  const quickSelect = {
    all: () => onSelectionChange(cards.map(card => card.id)),
    none: () => onSelectionChange([]),
    invert: () => {
      const newSelection = cards
        .filter(card => !selectedCardIds.includes(card.id))
        .map(card => card.id);
      onSelectionChange(newSelection);
    },
    byRarity: (rarity: string) => {
      const rarityCards = cards
        .filter(card => card.rarity === rarity)
        .map(card => card.id);
      onSelectionChange([...new Set([...selectedCardIds, ...rarityCards])]);
    },
    bySet: (setName: string) => {
      const setCards = cards
        .filter(card => card.set?.name === setName)
        .map(card => card.id);
      onSelectionChange([...new Set([...selectedCardIds, ...setCards])]);
    },
    byPrice: (operator: 'above' | 'below' | 'equal', threshold: number) => {
      const priceCards = cards
        .filter(card => {
          const price = parseFloat(String(card.currentPrice || card.price || 0));
          switch (operator) {
            case 'above': return price > threshold;
            case 'below': return price < threshold;
            case 'equal': return Math.abs(price - threshold) < 0.01;
            default: return false;
          }
        })
        .map(card => card.id);
      onSelectionChange([...new Set([...selectedCardIds, ...priceCards])]);
    }
  };

  // Bulk actions
  const bulkActions = {
    addToFavorites: async () => {
      setActionInProgress(true);
      try {
        await onBulkAction('addToFavorites', selectedCardIds);
        notify.success(`Added ${selectedCards.length} cards to favorites`);
      } catch (error) {
        notify.error('Failed to add cards to favorites');
      } finally {
        setActionInProgress(false);
      }
    },

    removeFromFavorites: async () => {
      setActionInProgress(true);
      try {
        await onBulkAction('removeFromFavorites', selectedCardIds);
        notify.success(`Removed ${selectedCards.length} cards from favorites`);
      } catch (error) {
        notify.error('Failed to remove cards from favorites');
      } finally {
        setActionInProgress(false);
      }
    },

    addToCollection: async (collectionName: string) => {
      if (!collectionName.trim()) {
        notify.error('Please enter a collection name');
        return;
      }
      
      setActionInProgress(true);
      try {
        await onBulkAction('addToCollection', selectedCardIds, { collection: collectionName });
        notify.success(`Added ${selectedCards.length} cards to ${collectionName}`);
        setTargetCollection('');
      } catch (error) {
        notify.error('Failed to add cards to collection');
      } finally {
        setActionInProgress(false);
      }
    },

    addTags: async (tags: string[]) => {
      if (tags.length === 0) {
        notify.error('Please select at least one tag');
        return;
      }

      setActionInProgress(true);
      try {
        await onBulkAction('addTags', selectedCardIds, { tags });
        notify.success(`Added tags to ${selectedCards.length} cards`);
      } catch (error) {
        notify.error('Failed to add tags to cards');
      } finally {
        setActionInProgress(false);
      }
    },

    setPriceAlerts: async (threshold: number, type: string) => {
      if (!threshold || threshold <= 0) {
        notify.error('Please enter a valid price threshold');
        return;
      }

      setActionInProgress(true);
      try {
        await onBulkAction('setPriceAlerts', selectedCardIds, { threshold, type });
        notify.success(`Set price alerts for ${selectedCards.length} cards`);
        setPriceThreshold('');
      } catch (error) {
        notify.error('Failed to set price alerts');
      } finally {
        setActionInProgress(false);
      }
    },

    exportCards: async (format: string) => {
      setActionInProgress(true);
      try {
        await onBulkAction('export', selectedCardIds, { format });
        notify.success(`Exported ${selectedCards.length} cards as ${format}`);
      } catch (error) {
        notify.error('Failed to export cards');
      } finally {
        setActionInProgress(false);
      }
    }
  };

  // Add new custom tag
  const addCustomTag = () => {
    if (!newTag.trim() || customTags.includes(newTag)) return;
    saveCustomTags([...customTags, newTag]);
    setNewTag('');
  };

  // Remove custom tag
  const removeCustomTag = (tagToRemove: string) => {
    saveCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  if (!isVisible) return null;

  const tabs: Tab[] = [
    { id: 'select', name: 'Quick Select', icon: '🎯' },
    { id: 'actions', name: 'Bulk Actions', icon: '⚡' },
    { id: 'analytics', name: 'Analytics', icon: '📊' }
  ];

  return (
    <Modal isOpen={isVisible} onClose={onClose} title="Bulk Card Operations" size="xl">
      <div className="space-y-6">
        {/* Header with selection count */}
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCards.length} cards selected
              </h3>
              {selectionAnalytics && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total value: ${selectionAnalytics.totalValue.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => quickSelect.none()}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">

            Clear selection
          </button>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'select' && (
          <div className="space-y-6">
            {/* Quick selection buttons */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Quick Selection
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={quickSelect.all}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

                  Select All
                </button>
                <button
                  onClick={quickSelect.none}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">

                  Select None
                </button>
                <button
                  onClick={quickSelect.invert}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">

                  Invert Selection
                </button>
              </div>
            </div>

            {/* Filter-based selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Rarity */}
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Select by Rarity</h5>
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                  <option value="">Choose a rarity...</option>
                  {[...new Set(cards.map(card => card.rarity))].filter(Boolean).map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
                {rarityFilter && (
                  <button
                    onClick={() => quickSelect.byRarity(rarityFilter)}
                    className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">

                    Add {rarityFilter} Cards
                  </button>
                )}
              </div>

              {/* By Price */}
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Select by Price</h5>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={priceThreshold}
                    onChange={(e) => setPriceThreshold(e.target.value)}
                    placeholder="Price threshold..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
                  {priceThreshold && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => quickSelect.byPrice('above', parseFloat(priceThreshold))}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">

                        Above ${priceThreshold}
                      </button>
                      <button
                        onClick={() => quickSelect.byPrice('below', parseFloat(priceThreshold))}
                        className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">

                        Below ${priceThreshold}
                      </button>
                      <button
                        onClick={() => quickSelect.byPrice('equal', parseFloat(priceThreshold))}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">

                        Equal ${priceThreshold}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            {selectedCards.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Select some cards to see available actions
              </div>
            ) : (
              <>
                {/* Favorites */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <StarIcon className="h-5 w-5 mr-2" />
                    Favorites
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={bulkActions.addToFavorites}
                      disabled={actionInProgress}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50">

                      Add to Favorites
                    </button>
                    <button
                      onClick={bulkActions.removeFromFavorites}
                      disabled={actionInProgress}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">

                      Remove from Favorites
                    </button>
                  </div>
                </div>

                {/* Collections */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2" />
                    Collections
                  </h4>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={targetCollection}
                      onChange={(e) => setTargetCollection(e.target.value)}
                      placeholder="Collection name..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
                    <button
                      onClick={() => bulkActions.addToCollection(targetCollection)}
                      disabled={actionInProgress || !targetCollection.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">

                      Add to Collection
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Custom Tags
                  </h4>
                  
                  {/* Add new tag */}
                  <div className="flex space-x-3 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="New tag name..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
                    <button
                      onClick={addCustomTag}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">

                      Add Tag
                    </button>
                  </div>

                  {/* Existing tags */}
                  {customTags.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {customTags.map(tag => (
                          <div key={tag} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                            <button
                              onClick={() => removeCustomTag(tag)}
                              className="ml-2 text-gray-500 hover:text-red-500">

                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => bulkActions.addTags(customTags)}
                        disabled={actionInProgress}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">

                        Apply All Tags to Selected Cards
                      </button>
                    </div>
                  )}
                </div>

                {/* Export */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Export Options
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => bulkActions.exportCards('csv')}
                      disabled={actionInProgress}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">

                      CSV
                    </button>
                    <button
                      onClick={() => bulkActions.exportCards('json')}
                      disabled={actionInProgress}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">

                      JSON
                    </button>
                    <button
                      onClick={() => bulkActions.exportCards('pdf')}
                      disabled={actionInProgress}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">

                      PDF
                    </button>
                    <button
                      onClick={() => bulkActions.exportCards('xlsx')}
                      disabled={actionInProgress}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">

                      Excel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {!selectionAnalytics ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Select some cards to see analytics
              </div>
            ) : (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectionAnalytics.count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Cards Selected</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${selectionAnalytics.totalValue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">${selectionAnalytics.averageValue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Value</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{Object.keys(selectionAnalytics.sets).length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Different Sets</div>
                  </div>
                </div>

                {/* Breakdown charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rarity breakdown */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Rarity Distribution</h5>
                    <div className="space-y-2">
                      {Object.entries(selectionAnalytics.rarities).map(([rarity, count]) => (
                        <div key={rarity} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{rarity}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
        style={{ width: `${(count / selectionAnalytics.count) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Set breakdown */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Set Distribution</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(selectionAnalytics.sets)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10)
                        .map(([setName, count]) => (
                        <div key={setName} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{setName}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notable cards */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Notable Cards</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Oldest Card</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectionAnalytics.oldestCard?.name} 
                        ({new Date(selectionAnalytics.oldestCard?.set?.releaseDate || '1999-01-01').getFullYear()})
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Newest Card</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectionAnalytics.newestCard?.name} 
                        ({new Date(selectionAnalytics.newestCard?.set?.releaseDate || '1999-01-01').getFullYear()})
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action in progress indicator */}
        {actionInProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-900 dark:text-white">Processing bulk action...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkCardOperations;