import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFavorites } from '../../../context/UnifiedAppContext';
import logger from '@/utils/logger';

// Type definition
interface PokemonTCGCard {
  id: string;
  name: string;
  prices?: {
    market?: {
      averageSellPrice?: number;
    };
  };
  rarity?: string;
  types?: string[];
  set?: {
    id: string;
    name: string;
  };
}

interface CollectionStats {
  totalCards: number;
  totalValue: number;
  rareCards: number;
  uniqueSets: number;
  typeDistribution: Record<string, number>;
  rarityDistribution: Record<string, number>;
  averageValue: number;
  monthlyGrowth: number;
  mostValuableCard: { name: string; value: number } | null;
  completionPercentage: number;
  // Additional optional fields for extended stats
  totalPokemon?: number;
  recentAdditions?: number;
  generationDistribution?: Record<string, number>;
  valueByRarity?: Record<string, number>;
  setDistribution?: Record<string, number>;
}

const CollectionDashboard = () => {
  const { favorites: favoriteIds } = useFavorites();
  const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; value: number }>>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Generate price history for chart
  const generatePriceHistory = useCallback((currentValue: number): void => {
    const history: Array<{ date: string; value: number }> = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let value = currentValue * 0.7; // Start lower

    months.forEach((month) => {
      value += (Math.random() - 0.4) * (currentValue * 0.1);
      value = Math.max(value, 0);
      history.push({ date: month, value: Math.round(value) });
    });

    setPriceHistory(history);
  }, []);

  // Calculate analytics from favorites data without API calls
  useEffect(() => {
    if (!favoriteIds?.cards || favoriteIds.cards.length === 0) {
      setLoadingStats(false);
      return;
    }

    try {
      setLoadingStats(true);
      
      // Mock stats calculation since we don't have the actual card data here
      const mockValue = favoriteIds.cards.length * 10;
      const stats: CollectionStats = {
        totalCards: favoriteIds.cards.length,
        totalValue: mockValue,
        rareCards: Math.floor(favoriteIds.cards.length * 0.2),
        uniqueSets: Math.max(1, Math.floor(favoriteIds.cards.length / 5)),
        typeDistribution: {},
        rarityDistribution: {},
        averageValue: favoriteIds.cards.length > 0 ? mockValue / favoriteIds.cards.length : 0,
        monthlyGrowth: 5.2, // Mock growth percentage
        mostValuableCard: favoriteIds.cards.length > 0 ? { name: 'Charizard', value: 250 } : null,
        completionPercentage: Math.min(100, (favoriteIds.cards.length / 150) * 100)
      };
      setCollectionStats(stats);
      
      // Generate mock price history
      generatePriceHistory(stats.totalValue);
      
    } catch (error) {
      logger.error('Error calculating collection analytics:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [favoriteIds.cards, generatePriceHistory]); // Only trigger on favorites changes

  const calculateCollectionStats = (cards: PokemonTCGCard[], pokemon: unknown[]) => {
    const stats: CollectionStats = {
      totalCards: cards.length,
      totalPokemon: pokemon.length,
      totalValue: 0,
      rareCards: 0,
      uniqueSets: 0,
      averageValue: 0,
      rarityDistribution: {},
      typeDistribution: {},
      setDistribution: {},
      recentAdditions: 0,
      mostValuableCard: null,
      completionPercentage: 0,
      generationDistribution: {},
      valueByRarity: {},
      monthlyGrowth: 0
    };

    // Process cards (using simple mock data to avoid API calls)
    cards.forEach((card: PokemonTCGCard, index: number) => {
      // Simple mock price calculation
      const mockPrice = 10 + (index * 5) + Math.random() * 20;
      stats.totalValue += mockPrice;

      // Mock rarity distribution
      const rarities = ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Secret'];
      const rarity = rarities[index % rarities.length];
      stats.rarityDistribution[rarity] = (stats.rarityDistribution[rarity] || 0) + 1;
      if (stats.valueByRarity) {
        stats.valueByRarity[rarity] = (stats.valueByRarity[rarity] || 0) + mockPrice;
      }

      // Mock type distribution
      const types = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic'];
      const type = types[index % types.length];
      stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1;

      // Track most valuable card (use first card as mock)
      if (index === 0) {
        stats.mostValuableCard = { 
          name: card.name || `Card ${index + 1}`,
          value: mockPrice
        };
      }
    });

    // Process Pokemon with simple generation distribution
    pokemon.forEach((poke, index) => {
      const generation = Math.ceil((index + 1) / 151) || 1;
      if (stats.generationDistribution) {
        stats.generationDistribution[`Gen ${generation}`] = (stats.generationDistribution[`Gen ${generation}`] || 0) + 1;
      }
    });

    stats.averageValue = stats.totalCards > 0 ? stats.totalValue / stats.totalCards : 0;
    stats.completionPercentage = Math.min((stats.totalCards / 10) * 100, 100);
    stats.monthlyGrowth = 5.2; // Static mock growth

    return stats;
  };

  const getMockCardPrice = (card: PokemonTCGCard) => {
    // Mock pricing logic based on rarity
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
      'Rare Rainbow': Math.random() * 250 + 150,
    };

    return rarityPrices[card.rarity || 'Common'] || Math.random() * 10 + 1;
  };

  // Custom chart components
  const PriceHistoryChart = (): React.ReactElement | null => {
    if (!priceHistory.length) return null;

    const maxValue = Math.max(...priceHistory.map((item) => item.value));
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-end h-48 bg-gradient-to-t from-amber-50 to-transparent dark:from-amber-900/20 rounded-lg p-4">
          {priceHistory.map((item, index: number) => (
            <div key={item.date} className="flex flex-col items-center flex-1">
              <div 
                className="w-8 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-1000 ease-out"
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: '4px',
                  animationDelay: `${index * 100}ms`
                }}
                title={`${item.date}: $${item.value}`}
              ></div>
              <span className="text-xs text-stone-600 dark:text-stone-300 mt-2">{item.date}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-stone-600 dark:text-stone-300">
          Collection Value Over Time
        </div>
      </div>
    );
  };

  const RarityDonutChart = (): React.ReactElement | null => {
    if (!collectionStats?.rarityDistribution) return null;

    const data = Object.entries(collectionStats.rarityDistribution);
    const total = data.reduce((sum: number, [_, count]) => sum + (count as number), 0);
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
    
    let cumulativePercentage = 0;
    
    return (
      <div className="space-y-4">
        <div className="relative w-48 h-48 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            {data.map(([rarity, count], index: number) => {
              const percentage = (count / total) * 100;
              const strokeDasharray = `${percentage * 2.51} 251`;
              const strokeDashoffset = -cumulativePercentage * 2.51;
              
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={rarity}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{ animationDelay: `${index * 200}ms` }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-900 dark:text-white">{total}</div>
              <div className="text-xs text-stone-600 dark:text-stone-300">Cards</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.map(([rarity, count], index: number) => (
            <div key={rarity} className="flex items-center text-sm">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-stone-700 dark:text-stone-300 truncate">
                {rarity} ({count})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TypeBarChart = (): React.ReactElement | null => {
    if (!collectionStats?.typeDistribution) return null;

    const data = Object.entries(collectionStats.typeDistribution);
    const maxValue = Math.max(...data.map(([_, count]) => count as number));
    
    return (
      <div className="space-y-4">
        {data.map(([type, count], index: number) => (
          <div key={type} className="flex items-center space-x-3">
            <div className="w-20 text-sm font-medium text-stone-700 dark:text-stone-300 capitalize">
              {type}
            </div>
            <div className="flex-1 bg-stone-200 dark:bg-stone-700 rounded-full h-6 relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                style={{ 
                  width: `${(count / maxValue) * 100}%`,
                  animationDelay: `${index * 100}ms`
                }}
              >
                <span className="text-white text-xs font-medium">{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loadingStats) {
    return (
      <div className="collection-dashboard p-6 bg-white dark:bg-stone-800 rounded-xl shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-stone-200 dark:bg-stone-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-stone-200 dark:bg-stone-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!collectionStats || collectionStats.totalCards === 0) {
    return (
      <div className="collection-dashboard p-8 bg-white dark:bg-stone-800 rounded-xl shadow-lg text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-stone-600 dark:text-stone-300 mb-2">Start Your Collection</h3>
        <p className="text-stone-500 dark:text-stone-300">Add cards and Pokémon to your favorites to see detailed analytics and insights!</p>
      </div>
    );
  }

  return (
    <div className="collection-dashboard space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Collection Dashboard</h2>
        <p className="opacity-90">Track your Pokémon cards and collection value</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Total Cards</p>
              <p className="text-2xl font-semibold text-stone-900 dark:text-white">{collectionStats.totalCards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Total Value</p>
              <p className="text-2xl font-semibold text-stone-900 dark:text-white">${Math.round(collectionStats.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Avg Value</p>
              <p className="text-2xl font-semibold text-stone-900 dark:text-white">${Math.round(collectionStats.averageValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Completion</p>
              <p className="text-2xl font-semibold text-stone-900 dark:text-white">{Math.round(collectionStats.completionPercentage)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price History Chart */}
        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Collection Value Over Time</h3>
          <div className="h-64">
            <PriceHistoryChart />
          </div>
        </div>

        {/* Rarity Distribution */}
        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Rarity Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <RarityDonutChart />
          </div>
        </div>
      </div>

      {/* Type Distribution */}
      {collectionStats?.typeDistribution && Object.keys(collectionStats.typeDistribution).length > 0 && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Cards by Type</h3>
          <div className="h-auto">
            <TypeBarChart />
          </div>
        </div>
      )}

      {/* Most Valuable Card */}
      {collectionStats.mostValuableCard && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Crown Jewel</h3>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-28 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-md flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-stone-900 dark:text-white">{collectionStats.mostValuableCard.name}</h4>
              <p className="text-stone-600 dark:text-stone-300">${collectionStats.mostValuableCard.value}</p>
              <p className="text-sm text-stone-500 dark:text-stone-500">Rare Holo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDashboard;