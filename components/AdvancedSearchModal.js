import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { CompactPriceIndicator } from './ui/PriceIndicator';
import pokemon from 'pokemontcgsdk';

export default function AdvancedSearchModal({ isOpen, onClose, onSearchResults }) {
  const [searchParams, setSearchParams] = useState({
    name: '',
    set: '',
    type: '',
    rarity: '',
    priceMin: '',
    priceMax: '',
    hp: '',
    attackDamage: '',
    artist: '',
    year: '',
    hasPrice: false,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  const [sets, setSets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Load sets for dropdown
  useEffect(() => {
    const loadSets = async () => {
      try {
        const setsData = await pokemon.set.all();
        setSets(setsData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error loading sets:', error);
      }
    };
    loadSets();
  }, []);

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const buildSearchQuery = () => {
    const queryParts = [];
    
    if (searchParams.name) queryParts.push(`name:"${searchParams.name}*"`);
    if (searchParams.set) queryParts.push(`set.id:${searchParams.set}`);
    if (searchParams.type) queryParts.push(`types:${searchParams.type}`);
    if (searchParams.rarity) queryParts.push(`rarity:"${searchParams.rarity}"`);
    if (searchParams.hp) queryParts.push(`hp:[${searchParams.hp} TO *]`);
    if (searchParams.artist) queryParts.push(`artist:"${searchParams.artist}*"`);
    if (searchParams.year) {
      const yearStart = `${searchParams.year}-01-01`;
      const yearEnd = `${searchParams.year}-12-31`;
      queryParts.push(`set.releaseDate:[${yearStart} TO ${yearEnd}]`);
    }

    return queryParts.join(' ');
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const query = buildSearchQuery();
      let searchResults = [];

      if (query) {
        const response = await pokemon.card.where({
          q: query,
          pageSize: 100
        });
        searchResults = response.data || [];
      } else {
        // If no specific query, get recent cards
        const response = await pokemon.card.all({ pageSize: 50 });
        searchResults = response.data || [];
      }

      // Apply price filtering
      if (searchParams.priceMin || searchParams.priceMax || searchParams.hasPrice) {
        searchResults = searchResults.filter(card => {
          if (!card.tcgplayer?.prices) {
            return !searchParams.hasPrice;
          }

          const prices = card.tcgplayer.prices;
          const marketPrice = prices.holofoil?.market || 
                             prices.normal?.market || 
                             prices.reverseHolofoil?.market || 0;

          if (searchParams.hasPrice && marketPrice === 0) return false;
          if (searchParams.priceMin && marketPrice < parseFloat(searchParams.priceMin)) return false;
          if (searchParams.priceMax && marketPrice > parseFloat(searchParams.priceMax)) return false;

          return true;
        });
      }

      // Apply sorting
      searchResults.sort((a, b) => {
        let aValue, bValue;
        
        switch (searchParams.sortBy) {
          case 'price':
            aValue = getCardPrice(a);
            bValue = getCardPrice(b);
            break;
          case 'releaseDate':
            aValue = new Date(a.set?.releaseDate || 0);
            bValue = new Date(b.set?.releaseDate || 0);
            break;
          case 'rarity':
            aValue = getRarityValue(a.rarity);
            bValue = getRarityValue(b.rarity);
            break;
          default:
            aValue = a.name || '';
            bValue = b.name || '';
        }

        if (searchParams.sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      setResults(searchResults);
      onSearchResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCardPrice = (card) => {
    if (!card.tcgplayer?.prices) return 0;
    const prices = card.tcgplayer.prices;
    return prices.holofoil?.market || 
           prices.normal?.market || 
           prices.reverseHolofoil?.market || 0;
  };

  const getRarityValue = (rarity) => {
    const rarityRanks = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Rare Holo': 4,
      'Rare Ultra': 5,
      'Rare Secret': 6,
      'Rare Rainbow': 7
    };
    return rarityRanks[rarity] || 0;
  };

  const formatPrice = (price) => {
    return price > 0 ? `$${price.toFixed(2)}` : 'N/A';
  };

  const pokemonTypes = [
    'Colorless', 'Fire', 'Water', 'Lightning', 'Grass', 'Fighting',
    'Psychic', 'Darkness', 'Metal', 'Fairy', 'Dragon'
  ];

  const rarities = [
    'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX',
    'Rare Holo GX', 'Rare Holo V', 'Rare Holo VMAX', 'Rare Ultra',
    'Rare Secret', 'Rare Rainbow', 'Illustration Rare'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} fullWidth>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Advanced Card Search
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Basic Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Card Name
            </label>
            <input
              type="text"
              value={searchParams.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Charizard, Pikachu..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Set
            </label>
            <select
              value={searchParams.set}
              onChange={(e) => handleInputChange('set', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Sets</option>
              {sets.map(set => (
                <option key={set.id} value={set.id}>
                  {set.name} ({new Date(set.releaseDate).getFullYear()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={searchParams.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Types</option>
              {pokemonTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rarity
            </label>
            <select
              value={searchParams.rarity}
              onChange={(e) => handleInputChange('rarity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Rarities</option>
              {rarities.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>

          {/* Price Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Price ($)
            </label>
            <input
              type="number"
              value={searchParams.priceMin}
              onChange={(e) => handleInputChange('priceMin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Price ($)
            </label>
            <input
              type="number"
              value={searchParams.priceMax}
              onChange={(e) => handleInputChange('priceMax', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="1000.00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Additional Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min HP
            </label>
            <input
              type="number"
              value={searchParams.hp}
              onChange={(e) => handleInputChange('hp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="50"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Artist
            </label>
            <input
              type="text"
              value={searchParams.artist}
              onChange={(e) => handleInputChange('artist', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Mitsuhiro Arita"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Release Year
            </label>
            <input
              type="number"
              value={searchParams.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="2023"
              min="1996"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        {/* Sorting and Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={searchParams.sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="releaseDate">Release Date</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort Order
            </label>
            <select
              value={searchParams.sortOrder}
              onChange={(e) => handleInputChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchParams.hasPrice}
                onChange={(e) => handleInputChange('hasPrice', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Only cards with prices
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setSearchParams({
              name: '', set: '', type: '', rarity: '', priceMin: '', priceMax: '',
              hp: '', attackDamage: '', artist: '', year: '', hasPrice: false,
              sortBy: 'name', sortOrder: 'asc'
            })}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Clear All
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Search Cards
            </button>
          </div>
        </div>

        {/* Quick Results Preview */}
        {results.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Search Results ({results.length} cards found)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
              {results.slice(0, 24).map(card => (
                <div key={card.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  <img
                    src={card.images?.small}
                    alt={card.name}
                    className="w-full h-auto rounded mb-2"
                  />
                  <div className="text-xs">
                    <div className="font-medium truncate" title={card.name}>
                      {card.name}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 truncate">
                      {card.set?.name}
                    </div>
                    <CompactPriceIndicator
                      cardId={card.id}
                      currentPrice={formatPrice(getCardPrice(card))}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            {results.length > 24 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Showing first 24 results. Close this modal to see all {results.length} results.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}