import React, { useState, useEffect } from 'react';
import { PriceHistoryManager } from '../lib/supabase';
import { CompactPriceIndicator } from './ui/PriceIndicator';
import Modal from './ui/Modal';
import Link from 'next/link';

// Smart price alerts system with trend-based notifications
export default function PriceAlerts({ userId = null }) {
  const [alerts, setAlerts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadAlerts();
    }
  }, [userId, mounted]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      if (userId) {
        const alertsData = await PriceHistoryManager.getUserPriceAlerts(userId);
        setAlerts(alertsData);
      } else {
        // For non-authenticated users, load from localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          const localAlerts = localStorage.getItem('dextrends_price_alerts');
          if (localAlerts) {
            setAlerts(JSON.parse(localAlerts));
          }
        }
      }
    } catch (error) {
      // Failed to load alerts
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (cardId, cardName, alertType, targetPrice = null, percentageChange = null) => {
    try {
      const newAlert = {
        id: `alert_${Date.now()}_${cardId}`, // Use cardId for uniqueness
        card_id: cardId,
        card_name: cardName,
        alert_type: alertType,
        target_price: targetPrice,
        percentage_change: percentageChange,
        is_active: true,
        created_at: new Date().toISOString(),
        triggered_at: null
      };

      if (userId) {
        // Save to database
        const savedAlert = await PriceHistoryManager.addPriceAlert(
          userId, cardId, cardName, alertType, targetPrice, percentageChange
        );
        if (savedAlert) {
          setAlerts(prev => [savedAlert, ...prev]);
        }
      } else {
        // Save to localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          const existingAlerts = JSON.parse(localStorage.getItem('dextrends_price_alerts') || '[]');
          const updatedAlerts = [newAlert, ...existingAlerts];
          localStorage.setItem('dextrends_price_alerts', JSON.stringify(updatedAlerts));
          setAlerts(updatedAlerts);
        }
      }

      setShowCreateModal(false);
    } catch (error) {
      // Failed to create alert
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      if (userId) {
        // Delete from database (would need to implement this method)
        // await PriceHistoryManager.deletePriceAlert(alertId);
      } else {
        // Delete from localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          const existingAlerts = JSON.parse(localStorage.getItem('dextrends_price_alerts') || '[]');
          const updatedAlerts = existingAlerts.filter(alert => alert.id !== alertId);
          localStorage.setItem('dextrends_price_alerts', JSON.stringify(updatedAlerts));
        }
      }
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      // Failed to delete alert
    }
  };

  const getAlertTypeDisplay = (alertType) => {
    const types = {
      'price_drop': { label: 'Price Drop', color: 'text-red-600', icon: '↘' },
      'price_rise': { label: 'Price Rise', color: 'text-green-600', icon: '↗' },
      'percentage_change': { label: 'Percent Change', color: 'text-blue-600', icon: '📊' },
      'trend_reversal': { label: 'Trend Reversal', color: 'text-purple-600', icon: '🔄' }
    };
    return types[alertType] || { label: alertType, color: 'text-gray-600', icon: '🔔' };
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
          images: { small: '/api/placeholder/150/200' },
          currentPrice: 450.00
        },
        {
          id: 'base1-6',
          name: 'Blastoise',
          set: { name: 'Base Set' },
          images: { small: '/api/placeholder/150/200' },
          currentPrice: 180.00
        },
        {
          id: 'base1-15',
          name: 'Venusaur',
          set: { name: 'Base Set' },
          images: { small: '/api/placeholder/150/200' },
          currentPrice: 290.00
        }
      ].filter(card => card.name.toLowerCase().includes(query.toLowerCase()));

      setSearchResults(mockResults);
    } catch (error) {
      // Failed to search cards
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchCards(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Price Alerts
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 7h16M7 17V7m10 0v10" />
          </svg>
          New Alert
        </button>
      </div>
      {/* Active Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Alerts ({alerts.filter(a => a.is_active).length})
          </h3>
        </div>
        <div className="p-4">
          {alerts.filter(a => a.is_active).length > 0 ? (
            <div className="space-y-4">
              {alerts.filter(a => a.is_active).map((alert) => {
                const typeDisplay = getAlertTypeDisplay(alert.alert_type);
                return (
                  <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{typeDisplay.icon}</div>
                      <div>
                        <Link
                          href={`/cards/${alert.card_id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {alert.card_name}
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span className={typeDisplay.color}>{typeDisplay.label}</span>
                          {alert.target_price && ` - Target: $${alert.target_price}`}
                          {alert.percentage_change && ` - ${alert.percentage_change > 0 ? '+' : ''}${alert.percentage_change}%`}
                        </div>
                        <div className="text-xs text-gray-400">
                          Created {new Date(alert.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CompactPriceIndicator
                        cardId={alert.card_id}
                        currentPrice={`$${(Math.random() * 200 + 50).toFixed(2)}`}
                      />
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Delete alert"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No active alerts. Create your first alert to get notified of price changes!
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Alert
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Triggered Alerts History */}
      {alerts.filter(a => a.triggered_at).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Notifications
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {alerts.filter(a => a.triggered_at).slice(0, 5).map((alert) => {
                const typeDisplay = getAlertTypeDisplay(alert.alert_type);
                return (
                  <div key={alert.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg opacity-60">{typeDisplay.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {alert.card_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Alert triggered {new Date(alert.triggered_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Create Alert Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CreateAlertForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onCreateAlert={createAlert}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}

// Create Alert Form Component
function CreateAlertForm({ searchQuery, setSearchQuery, searchResults, onCreateAlert, onCancel }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [alertType, setAlertType] = useState('price_drop');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentageChange, setPercentageChange] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCard) {
      const price = targetPrice ? parseFloat(targetPrice) : null;
      const percent = percentageChange ? parseFloat(percentageChange) : null;
      onCreateAlert(selectedCard.id, selectedCard.name, alertType, price, percent);
    }
  };

  const alertTypes = [
    { value: 'price_drop', label: 'Price drops below target' },
    { value: 'price_rise', label: 'Price rises above target' },
    { value: 'percentage_change', label: 'Percentage change threshold' },
    { value: 'trend_reversal', label: 'Trend reversal detection' }
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Create Price Alert
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
                      {card.set?.name} • Current: ${card.currentPrice?.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="text-sm font-medium text-green-600">
                Current: ${selectedCard.currentPrice?.toFixed(2)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alert Type
            </label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              {alertTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {(alertType === 'price_drop' || alertType === 'price_rise') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Price ($)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="100.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          )}

          {alertType === 'percentage_change' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Percentage Change (%)
              </label>
              <input
                type="number"
                value={percentageChange}
                onChange={(e) => setPercentageChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="10"
                step="0.1"
                required
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Positive for price increases, negative for decreases
              </div>
            </div>
          )}

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
              Create Alert
            </button>
          </div>
        </form>
      )}
    </div>
  );
}