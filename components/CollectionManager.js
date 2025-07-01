import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CompactPriceIndicator } from './ui/PriceIndicator';
import Modal from './ui/Modal';
import Link from 'next/link';

// Advanced collection management with portfolio tracking
export default function CollectionManager({ userId = null }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadCollections();
    }
  }, [userId, mounted]);

  useEffect(() => {
    if (selectedCollection) {
      calculatePortfolioValue();
    }
  }, [selectedCollection]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      // Get user collections (if userId is provided) or session collections
      const sessionId = userId || getSessionId();
      const table = userId ? 'user_collections' : 'session_collections';
      const idField = userId ? 'user_id' : 'session_id';

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(idField, sessionId)
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
  };

  const getSessionId = () => {
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
  };

  const calculatePortfolioValue = async () => {
    if (!selectedCollection?.cards) return;

    let totalValue = 0;
    for (const collectionCard of selectedCollection.cards) {
      const quantity = collectionCard.quantity || 1;
      const currentPrice = await getCurrentCardPrice(collectionCard.card_id);
      totalValue += currentPrice * quantity;
    }
    setPortfolioValue(totalValue);
  };

  const getCurrentCardPrice = async (cardId) => {
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
  };

  const createCollection = async (name, description) => {
    try {
      const sessionId = userId || getSessionId();
      const table = userId ? 'user_collections' : 'session_collections';
      const newCollection = {
        name,
        description,
        cards: [],
        created_at: new Date().toISOString(),
        [userId ? 'user_id' : 'session_id']: sessionId
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
  };

  const addCardToCollection = async (cardData, quantity = 1, condition = 'Near Mint', notes = '') => {
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

  const removeCardFromCollection = async (cardId) => {
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

  const searchCards = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Simulate card search - in real app, use Pokemon TCG API
      const mockResults = [
        {
          id: 'base1-4',
          name: 'Charizard',
          set: { name: 'Base Set' },
          images: { small: '/api/placeholder/150/200' }
        },
        {
          id: 'base1-6',
          name: 'Blastoise',
          set: { name: 'Base Set' },
          images: { small: '/api/placeholder/150/200' }
        }
      ].filter(card => card.name.toLowerCase().includes(query.toLowerCase()));

      setSearchResults(mockResults);
    } catch (error) {
      // Error searching cards
    }
  };

  const getCollectionStats = () => {
    if (!selectedCollection?.cards) return { totalCards: 0, uniqueCards: 0, totalValue: 0 };

    const cards = selectedCollection.cards;
    const totalCards = cards.reduce((sum, card) => sum + (card.quantity || 1), 0);
    const uniqueCards = cards.length;

    return {
      totalCards,
      uniqueCards,
      totalValue: portfolioValue
    };
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
          <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  const stats = getCollectionStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Collections
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
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
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Cards</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCards}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Unique Cards</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.uniqueCards}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Value</div>
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalValue.toFixed(2)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-center">
              <button
                onClick={() => setShowAddCardModal(true)}
                className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 text-gray-500 dark:text-gray-400 hover:text-blue-500"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Collection Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCollection.name}
              </h3>
              {selectedCollection.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedCollection.description}
                </p>
              )}
            </div>
            <div className="p-4">
              {selectedCollection.cards && selectedCollection.cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCollection.cards.map((card, index) => (
                    <div key={`${card.card_id}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate">
                            
                            {card.card_name}
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {card.set_name}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
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
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
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
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    No cards in this collection yet
                  </div>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No collections found. Create your first collection to start tracking your cards!
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
    </div>
  );
}

// Create Collection Form Component
function CreateCollectionForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim());
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Create New Collection
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Collection Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="My Pokemon Collection"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="Describe your collection..."
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Collection
          </button>
        </div>
      </form>
    </div>
  );
}

// Add Card Form Component
function AddCardForm({ searchQuery, setSearchQuery, searchResults, onSearch, onAddCard, onCancel }) {
  const [selectedCard, setSelectedCard] = useState(null);
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

  const handleAddCard = (e) => {
    e.preventDefault();
    if (selectedCard) {
      onAddCard(selectedCard, quantity, condition, notes);
    }
  };

  const conditions = [
    'Mint', 'Near Mint', 'Excellent', 'Good', 'Light Play', 'Moderate Play', 'Heavy Play', 'Damaged'
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Card to Collection
      </h3>

      {!selectedCard ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search for a card
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="Charizard, Pikachu..."
          />

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map(card => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {card.images?.small && (
                    <img
                      src={card.images.small}
                      alt={card.name}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {card.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
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
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            {selectedCard.images?.small && (
              <img
                src={selectedCard.images.small}
                alt={selectedCard.name}
                className="w-16 h-20 object-cover rounded"
              />
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {selectedCard.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedCard.set?.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="First edition, signed, etc..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add to Collection
            </button>
          </div>
        </form>
      )}
    </div>
  );
}