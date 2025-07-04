import React, { useState, useEffect, useMemo } from 'react';
import { 
  SparklesIcon, 
  TrendingUpIcon, 
  StarIcon, 
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Intelligent Card Recommendations System
 * ML-like suggestions based on user behavior, market trends, and card relationships
 */
const IntelligentRecommendations = ({ 
  userCards = [], 
  viewHistory = [], 
  favorites = [], 
  searchHistory = [],
  currentCard = null,
  maxRecommendations = 12
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('smart');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Analyze user preferences and create a profile
  const analyzeUserProfile = useMemo(() => {
    const profile = {
      favoriteTypes: {},
      favoriteRarities: {},
      favoriteSets: {},
      favoriteArtists: {},
      priceRange: { min: 0, max: 1000 },
      interests: [],
      activityLevel: 'casual' // casual, active, collector, investor
    };

    // Analyze from user's cards
    userCards.forEach(card => {
      // Types
      if (card.types) {
        card.types.forEach(type => {
          profile.favoriteTypes[type] = (profile.favoriteTypes[type] || 0) + 1;
        });
      }
      
      // Rarities
      if (card.rarity) {
        profile.favoriteRarities[card.rarity] = (profile.favoriteRarities[card.rarity] || 0) + 1;
      }
      
      // Sets
      if (card.set?.name) {
        profile.favoriteSets[card.set.name] = (profile.favoriteSets[card.set.name] || 0) + 1;
      }
      
      // Artists
      if (card.artist) {
        profile.favoriteArtists[card.artist] = (profile.favoriteArtists[card.artist] || 0) + 1;
      }

      // Price range
      const price = parseFloat(card.currentPrice || card.price || 0);
      if (price > 0) {
        profile.priceRange.min = Math.min(profile.priceRange.min, price);
        profile.priceRange.max = Math.max(profile.priceRange.max, price);
      }
    });

    // Analyze from favorites and view history
    [...favorites, ...viewHistory].forEach(card => {
      if (card.types) {
        card.types.forEach(type => {
          profile.favoriteTypes[type] = (profile.favoriteTypes[type] || 0) + 0.5;
        });
      }
      if (card.rarity) {
        profile.favoriteRarities[card.rarity] = (profile.favoriteRarities[card.rarity] || 0) + 0.5;
      }
    });

    // Determine activity level
    const totalCards = userCards.length;
    const totalViews = viewHistory.length;
    const totalFavorites = favorites.length;
    
    if (totalCards > 100 || totalViews > 500) {
      profile.activityLevel = 'collector';
    } else if (totalCards > 50 || totalViews > 200) {
      profile.activityLevel = 'active';
    } else if (totalFavorites > 20) {
      profile.activityLevel = 'investor';
    }

    // Determine interests
    const topTypes = Object.entries(profile.favoriteTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
    
    profile.interests = topTypes;

    return profile;
  }, [userCards, favorites, viewHistory]);

  // Generate smart recommendations
  const generateSmartRecommendations = async () => {
    setIsLoading(true);
    try {
      // This would typically call your backend API
      // For now, we'll simulate intelligent recommendations
      
      const allCards = await fetchAllCards(); // Mock function
      const scored = allCards.map(card => ({
        ...card,
        score: calculateRecommendationScore(card, analyzeUserProfile)
      }));

      scored.sort((a, b) => b.score - a.score);
      setRecommendations(scored.slice(0, maxRecommendations));
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate recommendation score for a card
  const calculateRecommendationScore = (card, profile) => {
    let score = 0;

    // Type preference matching
    if (card.types) {
      card.types.forEach(type => {
        if (profile.favoriteTypes[type]) {
          score += profile.favoriteTypes[type] * 2;
        }
      });
    }

    // Rarity preference
    if (card.rarity && profile.favoriteRarities[card.rarity]) {
      score += profile.favoriteRarities[card.rarity] * 1.5;
    }

    // Set preference
    if (card.set?.name && profile.favoriteSets[card.set.name]) {
      score += profile.favoriteSets[card.set.name] * 1.2;
    }

    // Artist preference
    if (card.artist && profile.favoriteArtists[card.artist]) {
      score += profile.favoriteArtists[card.artist] * 1.8;
    }

    // Price range compatibility
    const price = parseFloat(card.currentPrice || card.price || 0);
    if (price >= profile.priceRange.min && price <= profile.priceRange.max * 1.5) {
      score += 3;
    }

    // Evolution chain bonus (if user has related Pokemon)
    if (card.evolves_to || card.evolves_from) {
      const hasEvolution = userCards.some(userCard => 
        userCard.evolves_to?.includes(card.name) || 
        userCard.evolves_from?.includes(card.name) ||
        card.evolves_to?.includes(userCard.name) ||
        card.evolves_from?.includes(userCard.name)
      );
      if (hasEvolution) score += 5;
    }

    // Market trend bonus
    if (card.priceChange && card.priceChange > 0) {
      score += Math.min(card.priceChange / 10, 3);
    }

    // Popularity/view count bonus
    if (card.viewCount) {
      score += Math.log(card.viewCount) / 10;
    }

    // Recency bonus for new cards
    if (card.set?.releaseDate) {
      const releaseDate = new Date(card.set.releaseDate);
      const monthsOld = (Date.now() - releaseDate) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld < 6) {
        score += (6 - monthsOld) / 2;
      }
    }

    // Diversity bonus (encourage exploration)
    const hasType = userCards.some(userCard => 
      userCard.types?.some(type => card.types?.includes(type))
    );
    if (!hasType) score += 1; // Small bonus for new types

    return score;
  };

  // Generate trending recommendations
  const generateTrendingRecommendations = () => {
    // Mock trending cards based on price increases and market activity
    return [
      {
        id: 'trend-1',
        name: 'Charizard ex',
        set: { name: 'Paldea Evolved' },
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 89.99,
        priceChange: 15.2,
        reason: 'Price increased 15% this week',
        trend: 'up'
      },
      {
        id: 'trend-2', 
        name: 'Miraidon ex',
        set: { name: 'Scarlet & Violet' },
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 45.50,
        priceChange: 8.7,
        reason: 'High tournament play',
        trend: 'up'
      },
      {
        id: 'trend-3',
        name: 'Professor\'s Research',
        set: { name: 'Brilliant Stars' },
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 12.99,
        priceChange: -5.2,
        reason: 'Good buying opportunity',
        trend: 'down'
      }
    ];
  };

  // Generate completion recommendations
  const generateCompletionRecommendations = () => {
    // Find missing cards from user's favorite sets
    const favoriteSets = Object.keys(analyzeUserProfile.favoriteSets);
    const userCardIds = new Set(userCards.map(card => card.id));
    
    // Mock missing cards from favorite sets
    return [
      {
        id: 'comp-1',
        name: 'Missing Card 1',
        set: { name: favoriteSets[0] || 'Base Set' },
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 25.00,
        reason: `Complete your ${favoriteSets[0] || 'Base Set'} collection`,
        completion: 85
      },
      {
        id: 'comp-2',
        name: 'Missing Card 2', 
        set: { name: favoriteSets[1] || 'Jungle' },
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 15.50,
        reason: `Complete your ${favoriteSets[1] || 'Jungle'} collection`,
        completion: 92
      }
    ];
  };

  // Generate investment recommendations
  const generateInvestmentRecommendations = () => {
    return [
      {
        id: 'inv-1',
        name: 'Vintage Charizard',
        set: { name: 'Base Set Shadowless' },
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 1250.00,
        potential: 25,
        reason: 'Strong historical appreciation',
        risk: 'medium'
      },
      {
        id: 'inv-2',
        name: 'Japanese Promo Pikachu',
        set: { name: 'Promo' },
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 450.00,
        potential: 40,
        reason: 'Limited supply, growing demand',
        risk: 'high'
      }
    ];
  };

  // Mock fetch all cards function
  const fetchAllCards = async () => {
    // In a real app, this would fetch from your API
    return [
      {
        id: 'rec-1',
        name: 'Recommended Card 1',
        types: ['Electric'],
        rarity: 'Rare',
        set: { name: 'Temporal Forces' },
        artist: 'Mitsuhiro Arita',
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 35.99,
        priceChange: 5.2,
        viewCount: 1500
      },
      {
        id: 'rec-2',
        name: 'Recommended Card 2',
        types: ['Fire'],
        rarity: 'Ultra Rare',
        set: { name: 'Paldea Evolved' },
        artist: 'Kouki Saitou',
        images: { small: '/api/placeholder/200/280' },
        currentPrice: 67.50,
        priceChange: -2.1,
        viewCount: 2800
      }
    ];
  };

  useEffect(() => {
    setUserProfile(analyzeUserProfile);
    generateSmartRecommendations();
  }, [userCards, favorites, viewHistory, analyzeUserProfile]);

  const tabs = [
    { 
      id: 'smart', 
      name: 'Smart Picks', 
      icon: <SparklesIcon className="h-5 w-5" />,
      description: 'Personalized for you'
    },
    { 
      id: 'trending', 
      name: 'Trending', 
      icon: <TrendingUpIcon className="h-5 w-5" />,
      description: 'Market movers'
    },
    { 
      id: 'completion', 
      name: 'Complete Sets', 
      icon: <ChartBarIcon className="h-5 w-5" />,
      description: 'Finish collections'
    },
    { 
      id: 'investment', 
      name: 'Investment', 
      icon: <StarIcon className="h-5 w-5" />,
      description: 'Growth potential'
    }
  ];

  const getRecommendations = () => {
    switch (activeTab) {
      case 'trending':
        return generateTrendingRecommendations();
      case 'completion':
        return generateCompletionRecommendations();
      case 'investment':
        return generateInvestmentRecommendations();
      default:
        return recommendations;
    }
  };

  const getReasonIcon = (reason) => {
    if (reason?.includes('Price')) return <TrendingUpIcon className="h-4 w-4" />;
    if (reason?.includes('Complete')) return <ChartBarIcon className="h-4 w-4" />;
    if (reason?.includes('tournament')) return <UserGroupIcon className="h-4 w-4" />;
    if (reason?.includes('opportunity')) return <LightBulbIcon className="h-4 w-4" />;
    return <HeartIcon className="h-4 w-4" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-6 w-6 mr-2 text-purple-500" />
              Recommendations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Personalized suggestions based on your collection and interests
            </p>
          </div>
          
          {userProfile && (
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Activity Level: <span className="font-medium capitalize text-purple-600">{userProfile.activityLevel}</span>
              </div>
              {userProfile.interests.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Interests: <span className="font-medium">{userProfile.interests.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-4 text-center border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                {tab.icon}
                <span className="text-sm font-medium">{tab.name}</span>
                <span className="text-xs text-gray-500">{tab.description}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>
      {/* Content */}
      <div className="p-6">
        {isLoading && activeTab === 'smart' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-600 h-48 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getRecommendations().map((card) => (
              <div key={card.id} className="group relative">
                <Link
                  href={`/cards/${card.id}`}
                  className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all hover:shadow-lg hover:scale-105">

                  {/* Card Image */}
                  <div className="aspect-w-3 aspect-h-4 mb-3">
                    <Image
                      src={card.images?.small || '/back-card.png'}
                      alt={card.name}
                      width={150}
                      height={210}
                      className="rounded-lg object-cover" />
                  </div>
                  {/* Card Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {card.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {card.set?.name}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-600">
                        ${card.currentPrice?.toFixed(2)}
                      </span>
                      
                      {card.priceChange && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          card.priceChange > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {card.priceChange > 0 ? '+' : ''}{card.priceChange.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {/* Recommendation Reason */}
                    {card.reason && (
                      <div className="flex items-center space-x-2 text-xs text-purple-600 dark:text-purple-400">
                        {getReasonIcon(card.reason)}
                        <span className="line-clamp-2">{card.reason}</span>
                      </div>
                    )}

                    {/* Additional info for specific tabs */}
                    {activeTab === 'completion' && card.completion && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Set Completion</span>
                          <span>{card.completion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full">
                            style={{ width: `${card.completion}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'investment' && card.potential && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Potential</span>
                          <span className="font-medium text-green-600">+{card.potential}%</span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                          card.risk === 'high' ? 'bg-red-100 text-red-800' :
                          card.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {card.risk} risk
                        </div>
                      </div>
                    )}
                  </div>

                </Link>

                {/* Quick Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button 
                      className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      title="Add to favorites"
                    >
                      <HeartIcon className="h-4 w-4 text-red-500" />
                    </button>
                    <button 
                      className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      title="Add to collection"
                    >
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && getRecommendations().length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recommendations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add some cards to your collection to get personalized recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligentRecommendations;