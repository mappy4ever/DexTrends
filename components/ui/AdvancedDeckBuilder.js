import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaMinus, FaSearch, FaChartBar, FaExclamationTriangle, FaCheckCircle, FaSave, FaShare, FaDownload } from 'react-icons/fa';
import { BsCardList, BsLightning, BsDroplet, BsFire, BsSnow, BsFlower1, BsFillCircleFill } from 'react-icons/bs';
import { GiHighGrass, GiPsychicWaves, GiMetalBar, GiFairyWand, GiDragonHead } from 'react-icons/gi';

export default function AdvancedDeckBuilder({ initialDeck = null, onSaveDeck, userId = null }) {
  const [deck, setDeck] = useState({
    name: '',
    description: '',
    cards: [],
    format: 'standard',
    isPublic: true
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeTab, setActiveTab] = useState('builder');
  const [validation, setValidation] = useState({});
  const [metaAnalysis, setMetaAnalysis] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (initialDeck) {
      setDeck(initialDeck);
    }
  }, [initialDeck]);

  useEffect(() => {
    validateDeck();
    analyzeMetaGame();
    generateSuggestions();
  }, [deck]);

  const validateDeck = () => {
    const cards = deck.cards;
    const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);
    const pokemon = cards.filter(card => card.supertype === 'Pokémon');
    const trainers = cards.filter(card => card.supertype === 'Trainer');
    const energy = cards.filter(card => card.supertype === 'Energy');

    const errors = [];
    const warnings = [];

    // Basic deck size validation
    if (totalCards !== 60) {
      errors.push(`Deck must contain exactly 60 cards (currently ${totalCards})`);
    }

    // Card quantity validation
    cards.forEach(card => {
      if (card.name !== 'Basic Energy' && card.quantity > 4) {
        errors.push(`${card.name}: Maximum 4 copies allowed (currently ${card.quantity})`);
      }
    });

    // Pokemon validation
    const basicPokemon = pokemon.filter(card => !card.evolvesFrom);
    if (basicPokemon.length === 0) {
      errors.push('Deck must contain at least one Basic Pokémon');
    }

    // Energy validation
    const totalEnergy = energy.reduce((sum, card) => sum + card.quantity, 0);
    if (totalEnergy < 8) {
      warnings.push('Consider adding more Energy cards (recommended: 8-12)');
    }
    if (totalEnergy > 15) {
      warnings.push('Too many Energy cards might slow down your deck');
    }

    // Trainer card recommendations
    const supporters = trainers.filter(card => card.subtypes?.includes('Supporter'));
    const supporterCount = supporters.reduce((sum, card) => sum + card.quantity, 0);
    if (supporterCount < 8) {
      warnings.push('Consider adding more Supporter cards for consistency');
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalCards,
        pokemon: pokemon.reduce((sum, card) => sum + card.quantity, 0),
        trainers: trainers.reduce((sum, card) => sum + card.quantity, 0),
        energy: totalEnergy
      }
    });
  };

  const analyzeMetaGame = () => {
    const typeDistribution = {};
    const pokemon = deck.cards.filter(card => card.supertype === 'Pokémon');
    
    pokemon.forEach(card => {
      card.types?.forEach(type => {
        typeDistribution[type] = (typeDistribution[type] || 0) + card.quantity;
      });
    });

    const dominantTypes = Object.entries(typeDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    // Mock meta analysis data
    const metaScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const tierRating = metaScore >= 85 ? 'Tier 1' : metaScore >= 70 ? 'Tier 2' : 'Tier 3';
    
    const matchups = [
      { archetype: 'Charizard ex', winRate: Math.floor(Math.random() * 30) + 40 },
      { archetype: 'Miraidon ex', winRate: Math.floor(Math.random() * 30) + 40 },
      { archetype: 'Gardevoir ex', winRate: Math.floor(Math.random() * 30) + 40 },
      { archetype: 'Lost Box', winRate: Math.floor(Math.random() * 30) + 40 },
      { archetype: 'Pidgeot Control', winRate: Math.floor(Math.random() * 30) + 40 }
    ];

    setMetaAnalysis({
      score: metaScore,
      tier: tierRating,
      dominantTypes,
      typeDistribution,
      matchups,
      popularity: Math.floor(Math.random() * 20) + 5 // 5-25%
    });
  };

  const generateSuggestions = () => {
    const suggestions = [];
    
    // Card suggestions based on deck composition
    const pokemon = deck.cards.filter(card => card.supertype === 'Pokémon');
    const hasDrawPower = deck.cards.some(card => 
      card.name.includes('Professor') || card.name.includes('Draw')
    );

    if (!hasDrawPower) {
      suggestions.push({
        type: 'add',
        category: 'Draw Power',
        cards: ['Professor\'s Research', 'Colress\'s Experiment', 'Pokégear 3.0'],
        reason: 'Improve deck consistency with draw support'
      });
    }

    if (pokemon.length > 0) {
      const types = [...new Set(pokemon.flatMap(card => card.types || []))];
      if (types.length > 2) {
        suggestions.push({
          type: 'optimize',
          category: 'Type Focus',
          reason: 'Consider focusing on 1-2 types for better energy consistency'
        });
      }
    }

    // Tech card suggestions
    suggestions.push({
      type: 'tech',
      category: 'Meta Counters',
      cards: ['Lost Vacuum', 'Counter Catcher', 'Boss\'s Orders'],
      reason: 'Popular tech cards in current meta'
    });

    setSuggestions(suggestions);
  };

  const searchCards = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Mock card search results
    const mockCards = [
      {
        id: 'sv04-200',
        name: 'Charizard ex',
        supertype: 'Pokémon',
        subtypes: ['Basic', 'ex'],
        types: ['Fire'],
        hp: '330',
        images: { small: '/api/placeholder/150/200' },
        rarity: 'Ultra Rare',
        set: { name: 'Paldea Evolved' }
      },
      {
        id: 'sv04-245',
        name: 'Professor\'s Research',
        supertype: 'Trainer',
        subtypes: ['Supporter'],
        images: { small: '/api/placeholder/150/200' },
        rarity: 'Uncommon',
        set: { name: 'Paldea Evolved' }
      },
      {
        id: 'sv04-190',
        name: 'Fire Energy',
        supertype: 'Energy',
        subtypes: ['Basic'],
        images: { small: '/api/placeholder/150/200' },
        rarity: 'Common',
        set: { name: 'Paldea Evolved' }
      }
    ].filter(card => card.name.toLowerCase().includes(query.toLowerCase()));

    setSearchResults(mockCards);
  };

  const addCardToDeck = (card, quantity = 1) => {
    setDeck(prev => {
      const existingCard = prev.cards.find(c => c.id === card.id);
      
      if (existingCard) {
        const newQuantity = Math.min(existingCard.quantity + quantity, 4);
        return {
          ...prev,
          cards: prev.cards.map(c => 
            c.id === card.id ? { ...c, quantity: newQuantity } : c
          )
        };
      } else {
        return {
          ...prev,
          cards: [...prev.cards, { ...card, quantity }]
        };
      }
    });
  };

  const removeCardFromDeck = (cardId, quantity = 1) => {
    setDeck(prev => ({
      ...prev,
      cards: prev.cards.reduce((acc, card) => {
        if (card.id === cardId) {
          const newQuantity = card.quantity - quantity;
          if (newQuantity > 0) {
            acc.push({ ...card, quantity: newQuantity });
          }
        } else {
          acc.push(card);
        }
        return acc;
      }, [])
    }));
  };

  const getTypeIcon = (type) => {
    const icons = {
      Fire: <BsFire className="text-red-500" />,
      Water: <BsDroplet className="text-blue-500" />,
      Lightning: <BsLightning className="text-yellow-500" />,
      Grass: <BsFlower1 className="text-green-500" />,
      Fighting: <GiHighGrass className="text-orange-600" />,
      Psychic: <GiPsychicWaves className="text-purple-500" />,
      Darkness: <BsFillCircleFill className="text-gray-800" />,
      Metal: <GiMetalBar className="text-gray-500" />,
      Fairy: <GiFairyWand className="text-pink-500" />,
      Dragon: <GiDragonHead className="text-indigo-600" />,
      Colorless: <BsFillCircleFill className="text-gray-400" />
    };
    return icons[type] || <BsFillCircleFill className="text-gray-400" />;
  };

  const exportDeck = () => {
    const deckList = deck.cards.map(card => `${card.quantity} ${card.name}`).join('\n');
    const blob = new Blob([deckList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name || 'deck'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="advanced-deck-builder max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={deck.name}
              onChange={(e) => setDeck(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Deck Name"
              className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 w-full" />
            <input
              type="text"
              value={deck.description}
              onChange={(e) => setDeck(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deck description..."
              className="text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none w-full mt-1" />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={deck.format}
              onChange={(e) => setDeck(prev => ({ ...prev, format: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">

              <option value="standard">Standard</option>
              <option value="expanded">Expanded</option>
              <option value="unlimited">Unlimited</option>
            </select>
            <button
              onClick={() => onSaveDeck?.(deck)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">

              <FaSave />
              <span>Save</span>
            </button>
            <button
              onClick={exportDeck}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2">

              <FaDownload />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'builder'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BsCardList className="inline mr-2" />
          Deck Builder
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analysis'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FaChartBar className="inline mr-2" />
          Analysis
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'validation'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {validation.isValid ? (
            <FaCheckCircle className="inline mr-2 text-green-500" />
          ) : (
            <FaExclamationTriangle className="inline mr-2 text-red-500" />
          )}
          Validation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'builder' && (
            <>
              {/* Card Search */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add Cards
                </h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchCards(e.target.value);
                    }}
                    placeholder="Search for cards..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {searchResults.map(card => (
                      <div key={card.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={card.images.small}
                            alt={card.name}
                            className="w-12 h-16 object-cover rounded"  />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {card.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {card.set.name} • {card.rarity}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              {card.types?.map(type => (
                                <span key={type} title={type}>
                                  {getTypeIcon(type)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => addCardToDeck(card)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">

                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Deck Suggestions
                  </h3>
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-blue-900 dark:text-blue-100">
                              {suggestion.category}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              {suggestion.reason}
                            </div>
                            {suggestion.cards && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Consider: {suggestion.cards.join(', ')}
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            suggestion.type === 'add' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            suggestion.type === 'tech' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {suggestion.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Meta Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Meta Game Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metaAnalysis.score}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Meta Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metaAnalysis.tier}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tier Rating</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metaAnalysis.popularity}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Popularity</div>
                  </div>
                </div>

                {/* Matchup Analysis */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Predicted Matchups
                  </h4>
                  <div className="space-y-2">
                    {metaAnalysis.matchups?.map((matchup, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-gray-900 dark:text-white">{matchup.archetype}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                matchup.winRate >= 60 ? 'bg-green-500' :
                                matchup.winRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${matchup.winRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                            {matchup.winRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Distribution */}
                {metaAnalysis.dominantTypes && metaAnalysis.dominantTypes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Type Distribution
                    </h4>
                    <div className="space-y-2">
                      {metaAnalysis.dominantTypes.map(([type, count]) => (
                        <div key={type} className="flex items-center space-x-3">
                          {getTypeIcon(type)}
                          <span className="text-gray-900 dark:text-white">{type}</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${(count / Math.max(...Object.values(metaAnalysis.typeDistribution))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Deck Validation
              </h3>

              {/* Validation Status */}
              <div className={`p-4 rounded-lg mb-6 ${
                validation.isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {validation.isValid ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaExclamationTriangle className="text-red-500" />
                  )}
                  <span className={`font-medium ${
                    validation.isValid 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {validation.isValid ? 'Deck is tournament legal' : 'Deck has validation errors'}
                  </span>
                </div>
              </div>

              {/* Errors */}
              {validation.errors?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-3">Errors</h4>
                  <div className="space-y-2">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                        <div className="text-red-700 dark:text-red-300">{error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validation.warnings?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-3">Warnings</h4>
                  <div className="space-y-2">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <div className="text-yellow-700 dark:text-yellow-300">{warning}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deck Stats */}
              {validation.stats && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Deck Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {validation.stats.totalCards}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Cards</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {validation.stats.pokemon}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Pokémon</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {validation.stats.trainers}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Trainers</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {validation.stats.energy}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Energy</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Deck List Sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Deck List
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {deck.cards.reduce((sum, card) => sum + card.quantity, 0)}/60
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {['Pokémon', 'Trainer', 'Energy'].map(supertype => {
              const cards = deck.cards.filter(card => card.supertype === supertype);
              if (cards.length === 0) return null;

              return (
                <div key={supertype}>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {supertype} ({cards.reduce((sum, card) => sum + card.quantity, 0)})
                  </h4>
                  <div className="space-y-1">
                    {cards.map(card => (
                      <div key={card.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {card.quantity}x {card.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {card.set?.name}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => removeCardFromDeck(card.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">

                            <FaMinus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => addCardToDeck(card)}
                            className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded">

                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {deck.cards.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BsCardList className="w-12 h-12 mx-auto mb-4" />
              <p>Your deck is empty</p>
              <p className="text-sm">Search and add cards to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}