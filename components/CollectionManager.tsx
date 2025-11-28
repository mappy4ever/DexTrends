import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { supabase } from '../lib/supabase';
import { CompactPriceIndicator } from './ui/PriceIndicator';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import type { TCGCard } from '../types/api/cards';
import logger from '@/utils/logger';

// Type definitions for collections
interface CollectionCard {
  card_id: string;
  card_name: string;
  set_name: string;
  image_url: string;
  quantity: number;
  condition: string;
  notes: string;
  date_added: string;
  purchase_price: number | null;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  cards: CollectionCard[];
  created_at: string;
  user_id?: string;
  session_id?: string;
  expires_at?: string;
}

interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  totalValue: number;
}

interface CollectionManagerProps {
  userId?: string | null;
}

// Advanced collection management with portfolio tracking
const CollectionManager = memo<CollectionManagerProps>(({ userId = null }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<TCGCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      let sessionId = localStorage.getItem('dextrends_session_id');
      if (!sessionId) {
        // Use crypto.randomUUID if available, otherwise use a timestamp-based ID
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          sessionId = 'session_' + crypto.randomUUID();
        } else {
          // Fallback: use timestamp + performance counter for uniqueness
          const timestamp = Date.now();
          const counter = typeof performance !== 'undefined' ? performance.now() : 0;
          sessionId = 'session_' + timestamp + '_' + Math.floor(counter);
        }
        localStorage.setItem('dextrends_session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      // If localStorage is not available, return a temporary session ID
      return 'session_temp_' + Date.now();
    }
  }, []);

  const getCurrentCardPrice = useCallback(async (cardId: string): Promise<number> => {
    try {
      // In a real implementation, this would fetch from Pokemon TCG API or local cache
      // Use deterministic price based on card ID for consistency
      const hashCode = cardId.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      // Generate price between $5-$105 based on hash
      const normalizedHash = (Math.abs(hashCode) % 1000) / 1000;
      return (normalizedHash * 100) + 5;
    } catch (error) {
      return 0;
    }
  }, []);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      // Get user collections (if userId is provided) or session collections
      const sessionId = userId || getSessionId();
      const table = userId ? 'user_collections' : 'session_collections';
      const idField = userId ? 'user_id' : 'session_id';

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(idField, sessionId!)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCollections(data || []);
      if (data && data.length > 0 && !selectedCollection) {
        setSelectedCollection(data[0]);
      }
    } catch (error) {
      // Error loading collections
    } finally {
      setLoading(false);
    }
  }, [userId, getSessionId, selectedCollection]);

  const calculatePortfolioValue = useCallback(async () => {
    if (!selectedCollection?.cards) return;

    let totalValue = 0;
    for (const collectionCard of selectedCollection.cards) {
      const quantity = collectionCard.quantity || 1;
      const currentPrice = await getCurrentCardPrice(collectionCard.card_id);
      totalValue += currentPrice * quantity;
    }
    setPortfolioValue(totalValue);
  }, [selectedCollection, getCurrentCardPrice]);

  useEffect(() => {
    if (mounted) {
      loadCollections();
    }
  }, [mounted, loadCollections]);

  useEffect(() => {
    if (selectedCollection) {
      calculatePortfolioValue();
    }
  }, [selectedCollection, calculatePortfolioValue]);

  const createCollection = useCallback(async (name: string, description: string) => {
    try {
      const sessionId = userId || getSessionId();
      const table = userId ? 'user_collections' : 'session_collections';
      const newCollection: Partial<Collection> = {
        name,
        description,
        cards: [],
        created_at: new Date().toISOString(),
        [userId ? 'user_id' : 'session_id']: sessionId!
      };

      if (!userId) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        newCollection.expires_at = expiryDate.toISOString(); // 30 days
      }

      const { data, error } = await supabase
        .from(table)
        .insert(newCollection)
        .select()
        .single();

      if (error) throw error;

      setCollections(prev => [data, ...prev]);
      setSelectedCollection(data);
      setShowCreateModal(false);
    } catch (error) {
      // Error creating collection
    }
  }, [userId, getSessionId]);

  const addCardToCollection = async (cardData: TCGCard, quantity = 1, condition = 'Near Mint', notes = '') => {
    if (!selectedCollection) return;

    try {
      const updatedCards = [...(selectedCollection.cards || [])];
      
      // Check if card already exists in collection
      const existingIndex = updatedCards.findIndex(c => c.card_id === cardData.id);
      
      if (existingIndex >= 0) {
        // Update existing entry
        updatedCards[existingIndex].quantity += quantity;
        updatedCards[existingIndex].notes = notes || updatedCards[existingIndex].notes;
      } else {
        // Add new entry
        updatedCards.push({
          card_id: cardData.id,
          card_name: cardData.name,
          set_name: cardData.set?.name || 'Unknown',
          image_url: cardData.images?.small || '',
          quantity,
          condition,
          notes,
          date_added: new Date().toISOString(),
          purchase_price: null
        });
      }

      const table = userId ? 'user_collections' : 'session_collections';
      const { data, error } = await supabase
        .from(table)
        .update({ cards: updatedCards })
        .eq('id', selectedCollection.id)
        .select()
        .single();

      if (error) throw error;

      setSelectedCollection(data);
      setCollections(prev => prev.map(c => c.id === data.id ? data : c));
      setShowAddCardModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      // Error adding card to collection
    }
  };

  const removeCardFromCollection = async (cardId: string) => {
    if (!selectedCollection) return;

    try {
      const updatedCards = selectedCollection.cards.filter(c => c.card_id !== cardId);
      
      const table = userId ? 'user_collections' : 'session_collections';
      const { data, error } = await supabase
        .from(table)
        .update({ cards: updatedCards })
        .eq('id', selectedCollection.id)
        .select()
        .single();

      if (error) throw error;

      setSelectedCollection(data);
      setCollections(prev => prev.map(c => c.id === data.id ? data : c));
    } catch (error) {
      // Error removing card from collection
    }
  };

  const searchCards = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Simulate card search - in real app, use Pokemon TCG API
      const mockResults: TCGCard[] = [
        {
          id: 'base1-4',
          name: 'Charizard',
          supertype: 'Pokémon' as const,
          set: { 
            id: 'base1',
            name: 'Base Set',
            series: 'Base',
            printedTotal: 102,
            total: 102,
            releaseDate: '1999-01-09',
            updatedAt: '2023-01-01',
            images: {
              symbol: '',
              logo: ''
            }
          },
          number: '4',
          images: { 
            small: '/api/placeholder/150/200',
            large: '/api/placeholder/300/400'
          }
        },
        {
          id: 'base1-6',
          name: 'Blastoise',
          supertype: 'Pokémon' as const,
          set: { 
            id: 'base1',
            name: 'Base Set',
            series: 'Base',
            printedTotal: 102,
            total: 102,
            releaseDate: '1999-01-09',
            updatedAt: '2023-01-01',
            images: {
              symbol: '',
              logo: ''
            }
          },
          number: '6',
          images: { 
            small: '/api/placeholder/150/200',
            large: '/api/placeholder/300/400'
          }
        }
      ].filter(card => card.name.toLowerCase().includes(query.toLowerCase()));

      setSearchResults(mockResults);
    } catch (error) {
      // Error searching cards
    }
  };

  const exportCollection = useCallback((format: 'json' | 'csv' = 'json') => {
    if (!selectedCollection) return;

    if (format === 'json') {
      // Export as JSON
      const stats = {
        totalCards: selectedCollection.cards.reduce((sum, card) => sum + (card.quantity || 1), 0),
        uniqueCards: selectedCollection.cards.length,
        totalValue: portfolioValue
      };
      
      const exportData = {
        name: selectedCollection.name,
        description: selectedCollection.description,
        exportDate: new Date().toISOString(),
        cards: selectedCollection.cards,
        stats
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedCollection.name.replace(/[^a-z0-9]/gi, '_')}_collection.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Export as CSV
      const headers = ['Card ID', 'Card Name', 'Set Name', 'Quantity', 'Condition', 'Purchase Price', 'Notes', 'Date Added'];
      const rows = selectedCollection.cards.map(card => [
        card.card_id,
        card.card_name,
        card.set_name,
        card.quantity,
        card.condition,
        card.purchase_price || '',
        card.notes || '',
        card.date_added
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedCollection.name.replace(/[^a-z0-9]/gi, '_')}_collection.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [selectedCollection, portfolioValue]);

  const updateCollection = useCallback(async (collectionId: string, updates: Partial<Collection>) => {
    try {
      const sessionId = userId || getSessionId();
      const table = userId ? 'user_collections' : 'session_collections';
      const idField = userId ? 'user_id' : 'session_id';

      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', collectionId)
        .eq(idField, sessionId!)
        .select()
        .single();

      if (error) throw error;

      setCollections(prev => prev.map(c => c.id === collectionId ? data : c));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(data);
      }
    } catch (error) {
      logger.error('Error updating collection:', { error });
    }
  }, [userId, getSessionId, selectedCollection?.id]);

  const importCollection = useCallback(async (file: File) => {
    setImportError(null);
    
    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        // Import JSON
        const data = JSON.parse(text);
        
        // Validate structure
        if (!data.cards || !Array.isArray(data.cards)) {
          throw new Error('Invalid collection format: missing cards array');
        }

        // Create new collection or update existing
        if (selectedCollection) {
          // Merge with existing collection
          const existingCardIds = new Set(selectedCollection.cards.map(c => c.card_id));
          const newCards = data.cards.filter((card: CollectionCard) => !existingCardIds.has(card.card_id));
          
          const updatedCards = [...selectedCollection.cards, ...newCards];
          await updateCollection(selectedCollection.id, { cards: updatedCards });
        } else {
          // Create new collection
          await createCollection(
            data.name || 'Imported Collection',
            data.description || `Imported on ${new Date().toLocaleDateString()}`
          );
          
          // Add cards to the newly created collection
          if (collections.length > 0) {
            const newCollection = collections[0];
            await updateCollection(newCollection.id, { cards: data.cards });
          }
        }
      } else if (file.name.endsWith('.csv')) {
        // Import CSV
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('CSV file is empty or has no data rows');
        }

        // Parse headers
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
        
        // Map headers to expected fields
        const cardIdIndex = headers.findIndex(h => h.includes('card') && h.includes('id'));
        const nameIndex = headers.findIndex(h => h.includes('name') && !h.includes('set'));
        const setIndex = headers.findIndex(h => h.includes('set'));
        const quantityIndex = headers.findIndex(h => h.includes('quantity') || h.includes('qty'));
        
        if (cardIdIndex === -1 || nameIndex === -1) {
          throw new Error('CSV must contain at least Card ID and Card Name columns');
        }

        // Parse rows
        const cards: CollectionCard[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
          const cleanValues = values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
          
          if (cleanValues[cardIdIndex] && cleanValues[nameIndex]) {
            cards.push({
              card_id: cleanValues[cardIdIndex],
              card_name: cleanValues[nameIndex],
              set_name: setIndex >= 0 ? cleanValues[setIndex] : 'Unknown Set',
              image_url: '', // Will be populated when adding to collection
              quantity: quantityIndex >= 0 ? parseInt(cleanValues[quantityIndex]) || 1 : 1,
              condition: 'Near Mint',
              notes: '',
              date_added: new Date().toISOString(),
              purchase_price: null
            });
          }
        }

        if (cards.length === 0) {
          throw new Error('No valid cards found in CSV');
        }

        // Create new collection with imported cards
        await createCollection(
          'Imported from CSV',
          `Imported ${cards.length} cards on ${new Date().toLocaleDateString()}`
        );
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }

      setShowImportModal(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import collection');
    }
  }, [selectedCollection, collections, createCollection, updateCollection]);

  const getCollectionStats = useMemo((): CollectionStats => {
    if (!selectedCollection?.cards) return { totalCards: 0, uniqueCards: 0, totalValue: 0 };

    const cards = selectedCollection.cards;
    const totalCards = cards.reduce((sum, card) => sum + (card.quantity || 1), 0);
    const uniqueCards = cards.length;

    return {
      totalCards,
      uniqueCards,
      totalValue: portfolioValue
    };
  }, [selectedCollection, portfolioValue]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-stone-300 dark:bg-stone-600 rounded w-48"></div>
          <div className="h-32 bg-stone-300 dark:bg-stone-600 rounded"></div>
        </div>
      </div>
    );
  }

  const stats = getCollectionStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
          My Collections
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Collection
        </button>
      </div>
      {/* Collection Selector */}
      {collections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {collections.map(collection => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className={`px-4 py-2 rounded-md border ${
                selectedCollection?.id === collection.id
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              {collection.name}
            </button>
          ))}
        </div>
      )}
      {selectedCollection ? (
        <>
          {/* Collection Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow p-4">
              <div className="text-sm text-stone-500 dark:text-stone-400">Total Cards</div>
              <div className="text-2xl font-bold text-stone-900 dark:text-white">
                {stats.totalCards}
              </div>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow p-4">
              <div className="text-sm text-stone-500 dark:text-stone-400">Unique Cards</div>
              <div className="text-2xl font-bold text-stone-900 dark:text-white">
                {stats.uniqueCards}
              </div>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow p-4">
              <div className="text-sm text-stone-500 dark:text-stone-400">Estimated Value</div>
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalValue.toFixed(2)}
              </div>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow p-4 flex items-center justify-center">
              <button
                onClick={() => setShowAddCardModal(true)}
                className="w-full h-full flex items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-md hover:border-amber-500 text-stone-500 dark:text-stone-400 hover:text-amber-500"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Collection Cards */}
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-lg">
            <div className="p-4 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                    {selectedCollection.name}
                  </h3>
                  {selectedCollection.description && (
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {selectedCollection.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-3 py-1 text-sm bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md hover:bg-stone-200 dark:hover:bg-stone-600 flex items-center gap-1"
                    title="Import cards"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Import
                  </button>
                  <div className="relative group">
                    <button
                      className="px-3 py-1 text-sm bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md hover:bg-stone-200 dark:hover:bg-stone-600 flex items-center gap-1"
                      title="Export collection"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Export
                    </button>
                    <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-stone-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => exportCollection('json')}
                        className="block w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                      >
                        As JSON
                      </button>
                      <button
                        onClick={() => exportCollection('csv')}
                        className="block w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                      >
                        As CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              {selectedCollection.cards && selectedCollection.cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCollection.cards.map((card, index) => (
                    <div key={`${card.card_id}-${index}`} className="border border-stone-200 dark:border-stone-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {card.image_url && (
                          <img
                            src={card.image_url}
                            alt={card.card_name}
                            className="w-16 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/cards/${card.card_id}`}
                            className="text-sm font-medium text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 block truncate"
                          >
                            {card.card_name}
                          </Link>
                          <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                            {card.set_name}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <div className="text-xs text-stone-500 dark:text-stone-400">
                                Qty: {card.quantity} • {card.condition}
                              </div>
                              <CompactPriceIndicator
                                cardId={card.card_id}
                                currentPrice={`$${(Math.random() * 100 + 5).toFixed(2)}`}
                                className="mt-1"
                              />
                            </div>
                            <button
                              onClick={() => removeCardFromCollection(card.card_id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove from collection"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          {card.notes && (
                            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 italic">
                              {card.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-stone-500 dark:text-stone-400 mb-4">
                    No cards in this collection yet
                  </div>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    Add Your First Card
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-stone-500 dark:text-stone-400 mb-4">
            No collections found. Create your first collection to start tracking your cards!
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Create Collection
          </button>
        </div>
      )}
      {/* Create Collection Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CreateCollectionForm 
          onSubmit={createCollection}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
      {/* Add Card Modal */}
      <Modal isOpen={showAddCardModal} onClose={() => setShowAddCardModal(false)}>
        <AddCardForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onSearch={searchCards}
          onAddCard={addCardToCollection}
          onCancel={() => setShowAddCardModal(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportError(null);
        }}
        title="Import Collection"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Import your collection from a JSON or CSV file. CSV files should include columns for Card ID, Card Name, Set Name, and Quantity.
          </p>

          {importError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
            </div>
          )}

          <div className="border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".json,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  importCollection(file);
                }
              }}
              className="hidden"
              id="import-file-input"
            />
            <label
              htmlFor="import-file-input"
              className="cursor-pointer"
            >
              <svg className="w-12 h-12 text-stone-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                Click to select a file or drag and drop
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-500">
                Supported formats: JSON, CSV
              </p>
            </label>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800 rounded-md p-3">
            <h4 className="text-sm font-medium text-stone-900 dark:text-white mb-2">CSV Format Example:</h4>
            <pre className="text-xs text-stone-600 dark:text-stone-400 overflow-x-auto">
Card ID,Card Name,Set Name,Quantity
sm1-1,Bulbasaur,Sun & Moon,2
xy1-54,Charizard,XY Base,1
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.userId === nextProps.userId;
});

CollectionManager.displayName = 'CollectionManager';

export default CollectionManager;

// Create Collection Form Component
interface CreateCollectionFormProps {
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

const CreateCollectionForm = memo<CreateCollectionFormProps>(({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim());
    }
  }, [name, description, onSubmit]);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
        Create New Collection
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Collection Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:text-white"
            placeholder="My Pokemon Collection"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:text-white"
            placeholder="Describe your collection..."
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-md hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Create Collection
          </button>
        </div>
      </form>
    </div>
  );
});

CreateCollectionForm.displayName = 'CreateCollectionForm';

// Add Card Form Component
interface AddCardFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: TCGCard[];
  onSearch: (query: string) => void;
  onAddCard: (card: TCGCard, quantity: number, condition: string, notes: string) => void;
  onCancel: () => void;
}

const AddCardForm = memo<AddCardFormProps>(({ searchQuery, setSearchQuery, searchResults, onSearch, onAddCard, onCancel }) => {
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('Near Mint');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const handleAddCard = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCard) {
      onAddCard(selectedCard, quantity, condition, notes);
    }
  }, [selectedCard, quantity, condition, notes, onAddCard]);

  const conditions = [
    'Mint', 'Near Mint', 'Excellent', 'Good', 'Light Play', 'Moderate Play', 'Heavy Play', 'Damaged'
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
        Add Card to Collection
      </h3>

      {!selectedCard ? (
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Search for a card
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:text-white"
            placeholder="Charizard, Pikachu..."
          />

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map(card => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="flex items-center gap-3 p-2 border border-stone-200 dark:border-stone-700 rounded cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700"
                >
                  {card.images?.small && (
                    <img
                      src={card.images.small}
                      alt={card.name}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium text-stone-900 dark:text-white">
                      {card.name}
                    </div>
                    <div className="text-sm text-stone-500 dark:text-stone-400">
                      {card.set?.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleAddCard} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-700 rounded">
            {selectedCard.images?.small && (
              <img
                src={selectedCard.images.small}
                alt={selectedCard.name}
                className="w-16 h-20 object-cover rounded"
              />
            )}
            <div>
              <div className="font-medium text-stone-900 dark:text-white">
                {selectedCard.name}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                {selectedCard.set?.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="ml-auto text-stone-500 hover:text-stone-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:text-white"
              >
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:text-white"
              placeholder="First edition, signed, etc..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-md hover:bg-stone-50 dark:hover:bg-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              Add to Collection
            </button>
          </div>
        </form>
      )}
    </div>
  );
});

AddCardForm.displayName = 'AddCardForm';