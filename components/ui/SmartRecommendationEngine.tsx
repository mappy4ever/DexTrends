import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { useUX } from './EnhancedUXProvider';

// Type definitions
interface CardType {
  type?: {
    name: string;
  };
}

interface Card {
  id: string;
  name: string;
  types?: (CardType | string)[];
  set?: {
    id: string;
    name: string;
  };
  rarity?: string;
  artist?: string;
  images?: {
    small?: string;
  };
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      normal?: { market?: number };
    };
  };
}

interface EnhancedCard extends Card {
  similarityScore?: number;
  personalityScore?: number;
  reason?: string;
  trendScore?: number;
  trendReason?: string;
  priceChange?: number;
  priority?: number;
}

interface PriceAlert {
  card: Card;
  type: 'price_drop' | 'price_spike';
  message: string;
  urgency: 'high' | 'medium' | 'low';
  currentPrice: number;
  avgPrice: number;
}

interface CollectionSuggestion {
  setName: string;
  setId: string;
  completionRate: number;
  missingCards: EnhancedCard[];
  reason: string;
}

interface Recommendations {
  similarCards: EnhancedCard[];
  priceAlerts: PriceAlert[];
  collectionSuggestions: CollectionSuggestion[];
  trendingCards: EnhancedCard[];
  personalizedPicks: EnhancedCard[];
}

interface UserInterests {
  favoriteTypes: Record<string, number>;
  favoriteSets: Record<string, number>;
  favoriteRarities: Record<string, number>;
  priceRange: { min: number; max: number };
  followsTrends: boolean;
}

interface SetData {
  name: string;
  cards: Card[];
  userCards: Card[];
  totalCards: number;
}

interface TrendingData {
  card: Card;
  trendScore: number;
  reason: string;
  priceChange: number;
}

interface SmartRecommendationEngineProps {
  currentCard?: Card | null;
  userFavorites?: Card[];
  userCollection?: Card[];
}

interface RecommendationSectionProps {
  title: string;
  description: string;
  cards: EnhancedCard[];
  onCardClick: (card: EnhancedCard) => void;
}

interface PriceAlertsSectionProps {
  alerts: PriceAlert[];
  onCardClick: (card: Card) => void;
}

interface CollectionSuggestionsSectionProps {
  suggestions: CollectionSuggestion[];
  onCardClick: (card: Card) => void;
}

const SmartRecommendationEngine: React.FC<SmartRecommendationEngineProps> = ({ 
  currentCard = null, 
  userFavorites = [], 
  userCollection = [] 
}) => {
  const { userBehavior, trackUserAction } = useUX();
  const [recommendations, setRecommendations] = useState<Recommendations>({
    similarCards: [],
    priceAlerts: [],
    collectionSuggestions: [],
    trendingCards: [],
    personalizedPicks: []
  });
  const [loading, setLoading] = useState(false);

  // Algorithm 1: Content-based filtering for similar cards
  const getSimilarCards = async (): Promise<EnhancedCard[]> => {
    if (!currentCard) return [];

    const similarityScores: { card: Card; score: number }[] = [];
    
    // Mock database of cards - in real app, this would be an API call
    const allCards = getMockCardDatabase();
    
    for (const card of allCards) {
      if (card.id === currentCard.id) continue;
      
      let score = 0;
      
      // Type similarity (weight: 0.3)
      if (currentCard.types && card.types) {
        const typeOverlap = currentCard.types.filter(type => 
          card.types!.some(t => {
            const typeName1 = typeof type === 'string' ? type : type.type?.name;
            const typeName2 = typeof t === 'string' ? t : t.type?.name;
            return typeName1 === typeName2;
          })
        ).length;
        score += (typeOverlap / Math.max(currentCard.types.length, card.types.length)) * 0.3;
      }
      
      // Set similarity (weight: 0.2)
      if (currentCard.set && card.set && currentCard.set.id === card.set.id) {
        score += 0.2;
      }
      
      // Rarity similarity (weight: 0.15)
      if (currentCard.rarity && card.rarity && currentCard.rarity === card.rarity) {
        score += 0.15;
      }
      
      // Price range similarity (weight: 0.2)
      const currentPrice = getCurrentPrice(currentCard);
      const cardPrice = getCurrentPrice(card);
      if (currentPrice && cardPrice) {
        const priceDiff = Math.abs(currentPrice - cardPrice) / Math.max(currentPrice, cardPrice);
        score += (1 - priceDiff) * 0.2;
      }
      
      // Artist similarity (weight: 0.1)
      if (currentCard.artist && card.artist && currentCard.artist === card.artist) {
        score += 0.1;
      }
      
      // User behavior boost (weight: 0.05)
      if (userFavorites.some(fav => fav.id === card.id)) {
        score += 0.05;
      }
      
      similarityScores.push({ card, score });
    }
    
    return similarityScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => ({
        ...item.card,
        similarityScore: item.score,
        reason: generateSimilarityReason(currentCard, item.card)
      }));
  };

  // Algorithm 2: Collaborative filtering for personalized picks
  const getPersonalizedPicks = async (): Promise<EnhancedCard[]> => {
    const userInterests = analyzeUserInterests();
    const weightedCards: { card: Card; score: number }[] = [];
    
    const allCards = getMockCardDatabase();
    
    for (const card of allCards) {
      let score = 0;
      
      // Type preference scoring
      if (card.types) {
        const typeScore = card.types.reduce((acc, type) => {
          const typeName = typeof type === 'string' ? type : type.type?.name;
          return acc + (typeName ? userInterests.favoriteTypes[typeName] || 0 : 0);
        }, 0);
        score += typeScore * 0.25;
      }
      
      // Set preference scoring
      if (card.set) {
        score += (userInterests.favoriteSets[card.set.id] || 0) * 0.2;
      }
      
      // Rarity preference scoring
      if (card.rarity) {
        score += (userInterests.favoriteRarities[card.rarity] || 0) * 0.15;
      }
      
      // Price range preference
      const cardPrice = getCurrentPrice(card);
      if (cardPrice && userInterests.priceRange) {
        const { min, max } = userInterests.priceRange;
        if (cardPrice >= min && cardPrice <= max) {
          score += 0.2;
        }
      }
      
      // Trending boost
      if (userInterests.followsTrends && isTrendingCard(card)) {
        score += 0.1;
      }
      
      // Novelty boost (cards not in collection)
      if (!userCollection.some(c => c.id === card.id)) {
        score += 0.1;
      }
      
      weightedCards.push({ card, score });
    }
    
    return weightedCards
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => ({
        ...item.card,
        personalityScore: item.score,
        reason: 'Based on your interests and collection'
      }));
  };

  // Algorithm 3: Market-based price alerts
  const getPriceAlerts = async (): Promise<PriceAlert[]> => {
    const alerts: PriceAlert[] = [];
    
    for (const favorite of userFavorites) {
      const currentPrice = getCurrentPrice(favorite);
      const historicalPrices = getHistoricalPrices(favorite);
      
      if (currentPrice && historicalPrices.length > 0) {
        const avgPrice = historicalPrices.reduce((sum, p) => sum + p, 0) / historicalPrices.length;
        const priceChange = ((currentPrice - avgPrice) / avgPrice) * 100;
        
        if (priceChange < -15) {
          alerts.push({
            card: favorite,
            type: 'price_drop',
            message: `${favorite.name} is ${Math.abs(priceChange).toFixed(1)}% below average price`,
            urgency: 'high',
            currentPrice,
            avgPrice
          });
        } else if (priceChange > 25) {
          alerts.push({
            card: favorite,
            type: 'price_spike',
            message: `${favorite.name} price has increased ${priceChange.toFixed(1)}%`,
            urgency: 'medium',
            currentPrice,
            avgPrice
          });
        }
      }
    }
    
    return alerts.slice(0, 5);
  };

  // Algorithm 4: Collection completion suggestions
  const getCollectionSuggestions = async (): Promise<CollectionSuggestion[]> => {
    const suggestions: CollectionSuggestion[] = [];
    const collectionSets = getCollectionSets();
    
    for (const [setId, setData] of Object.entries(collectionSets)) {
      const { cards: setCards, userCards, totalCards } = setData;
      const completionRate = userCards.length / totalCards;
      
      if (completionRate > 0.2 && completionRate < 0.9) {
        const missingCards = setCards.filter(card => 
          !userCards.some(userCard => userCard.id === card.id)
        );
        
        // Prioritize by rarity and price
        const prioritized = missingCards
          .map(card => ({
            ...card,
            priority: calculateCardPriority(card, completionRate)
          }))
          .sort((a, b) => (b.priority || 0) - (a.priority || 0))
          .slice(0, 3);
        
        suggestions.push({
          setName: setData.name,
          setId,
          completionRate,
          missingCards: prioritized,
          reason: `You're ${(completionRate * 100).toFixed(1)}% complete with this set`
        });
      }
    }
    
    return suggestions.slice(0, 3);
  };

  // Algorithm 5: Trend-based recommendations
  const getTrendingCards = async (): Promise<EnhancedCard[]> => {
    const trendingData = getMockTrendingData();
    
    return trendingData.map(item => ({
      ...item.card,
      trendScore: item.trendScore,
      trendReason: item.reason,
      priceChange: item.priceChange
    })).slice(0, 6);
  };

  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const recs = await Promise.all([
        getSimilarCards(),
        getPriceAlerts(),
        getCollectionSuggestions(),
        getTrendingCards(),
        getPersonalizedPicks()
      ]);

      setRecommendations({
        similarCards: recs[0],
        priceAlerts: recs[1],
        collectionSuggestions: recs[2],
        trendingCards: recs[3],
        personalizedPicks: recs[4]
      });
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentCard, userFavorites, userCollection, userBehavior, getSimilarCards, getPriceAlerts, getCollectionSuggestions, getTrendingCards, getPersonalizedPicks]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  // Helper functions
  const analyzeUserInterests = (): UserInterests => {
    const interests: UserInterests = {
      favoriteTypes: {},
      favoriteSets: {},
      favoriteRarities: {},
      priceRange: { min: 0, max: 100 },
      followsTrends: false
    };
    
    // Analyze user's favorite cards
    userFavorites.forEach(card => {
      // Type preferences
      if (card.types) {
        card.types.forEach(type => {
          const typeName = typeof type === 'string' ? type : type.type?.name;
          if (typeName) {
            interests.favoriteTypes[typeName] = (interests.favoriteTypes[typeName] || 0) + 1;
          }
        });
      }
      
      // Set preferences
      if (card.set) {
        interests.favoriteSets[card.set.id] = (interests.favoriteSets[card.set.id] || 0) + 1;
      }
      
      // Rarity preferences
      if (card.rarity) {
        interests.favoriteRarities[card.rarity] = (interests.favoriteRarities[card.rarity] || 0) + 1;
      }
    });
    
    // Analyze price range from user behavior
    const userPrices = userFavorites
      .map(getCurrentPrice)
      .filter((price): price is number => price !== null)
      .sort((a, b) => a - b);
    
    if (userPrices.length > 0) {
      interests.priceRange.min = userPrices[Math.floor(userPrices.length * 0.1)];
      interests.priceRange.max = userPrices[Math.floor(userPrices.length * 0.9)];
    }
    
    // Determine if user follows trends
    interests.followsTrends = userBehavior.recentActions?.some(action => 
      action.action === 'view_trending'
    ) || false;
    
    return interests;
  };

  const generateSimilarityReason = (cardA: Card, cardB: Card): string => {
    const reasons: string[] = [];
    
    if (cardA.types && cardB.types) {
      const sharedTypes = cardA.types.filter(type => 
        cardB.types!.some(t => {
          const typeName1 = typeof type === 'string' ? type : type.type?.name;
          const typeName2 = typeof t === 'string' ? t : t.type?.name;
          return typeName1 === typeName2;
        })
      );
      if (sharedTypes.length > 0) {
        const typeNames = sharedTypes.map(t => typeof t === 'string' ? t : t.type?.name).filter(Boolean);
        reasons.push(`Both are ${typeNames.join('/')}-type`);
      }
    }
    
    if (cardA.set && cardB.set && cardA.set.id === cardB.set.id) {
      reasons.push(`From the same set: ${cardA.set.name}`);
    }
    
    if (cardA.rarity === cardB.rarity) {
      reasons.push(`Same rarity: ${cardA.rarity}`);
    }
    
    if (cardA.artist === cardB.artist) {
      reasons.push(`Same artist: ${cardA.artist}`);
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Similar characteristics';
  };

  const calculateCardPriority = (card: Card, completionRate: number): number => {
    let priority = 0;
    
    // Higher priority for rarer cards
    const rarityScores: Record<string, number> = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Rare Holo': 4,
      'Ultra Rare': 5,
      'Secret Rare': 6
    };
    priority += (card.rarity ? rarityScores[card.rarity] || 1 : 1) * 10;
    
    // Higher priority when closer to completion
    priority += completionRate * 50;
    
    // Lower priority for expensive cards
    const price = getCurrentPrice(card);
    if (price) {
      priority -= Math.log(price + 1) * 5;
    }
    
    return priority;
  };

  // Mock data functions (replace with real API calls)
  const getMockCardDatabase = (): Card[] => {
    return [
      {
        id: 'base1-4',
        name: 'Charizard',
        types: [{ type: { name: 'fire' } }],
        set: { id: 'base1', name: 'Base Set' },
        rarity: 'Rare Holo',
        artist: 'Mitsuhiro Arita',
        images: { small: '/back-card.png' }
      },
      {
        id: 'base1-2',
        name: 'Blastoise',
        types: [{ type: { name: 'water' } }],
        set: { id: 'base1', name: 'Base Set' },
        rarity: 'Rare Holo',
        artist: 'Ken Sugimori',
        images: { small: '/back-card.png' }
      }
      // ... more mock cards
    ];
  };

  const getCurrentPrice = (card: Card): number | null => {
    return card.tcgplayer?.prices?.holofoil?.market || 
           card.tcgplayer?.prices?.normal?.market || 
           null;
  };

  const getHistoricalPrices = (card: Card): number[] => {
    // Mock historical price data
    return Array.from({ length: 30 }, () => Math.random() * 50 + 20);
  };

  const getCollectionSets = (): Record<string, SetData> => {
    // Mock collection analysis
    return {
      'base1': {
        name: 'Base Set',
        cards: getMockCardDatabase().filter(c => c.set?.id === 'base1'),
        userCards: userCollection.filter(c => c.set?.id === 'base1'),
        totalCards: 102
      }
    };
  };

  const isTrendingCard = (card: Card): boolean => {
    // Mock trending detection
    return Math.random() > 0.7;
  };

  const getMockTrendingData = (): TrendingData[] => {
    return [
      {
        card: {
          id: 'trending-1',
          name: 'Charizard ex',
          images: { small: '/back-card.png' }
        },
        trendScore: 0.95,
        reason: 'Featured in recent tournament',
        priceChange: 15.3
      }
    ];
  };

  const handleRecommendationClick = (card: Card, source: string) => {
    trackUserAction('recommendation_click', {
      cardId: card.id,
      cardName: card.name,
      source,
      reason: (card as EnhancedCard).reason
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {recommendations.personalizedPicks.length > 0 && (
        <RecommendationSection
          title="Picked For You"
          description="Based on your interests and collection"
          cards={recommendations.personalizedPicks}
          onCardClick={(card) => handleRecommendationClick(card, 'personalized')}
        />
      )}

      {recommendations.similarCards.length > 0 && (
        <RecommendationSection
          title="Similar Cards"
          description="Cards similar to what you're viewing"
          cards={recommendations.similarCards}
          onCardClick={(card) => handleRecommendationClick(card, 'similar')}
        />
      )}

      {recommendations.priceAlerts.length > 0 && (
        <PriceAlertsSection
          alerts={recommendations.priceAlerts}
          onCardClick={(card) => handleRecommendationClick(card, 'price_alert')}
        />
      )}

      {recommendations.collectionSuggestions.length > 0 && (
        <CollectionSuggestionsSection
          suggestions={recommendations.collectionSuggestions}
          onCardClick={(card) => handleRecommendationClick(card, 'collection')}
        />
      )}

      {recommendations.trendingCards.length > 0 && (
        <RecommendationSection
          title="Trending Now"
          description="Popular cards in the community"
          cards={recommendations.trendingCards}
          onCardClick={(card) => handleRecommendationClick(card, 'trending')}
        />
      )}
    </div>
  );
};

// Helper components
const RecommendationSection: React.FC<RecommendationSectionProps> = ({ title, description, cards, onCardClick }) => (
  <div>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div 
          key={`${card.id}-${index}`}
          className="cursor-pointer transform hover:scale-105 transition-transform"
          onClick={() => onCardClick(card)}
        >
          <img
            src={card.images?.small || '/back-card.png'}
            alt={card.name}
            className="w-full rounded-lg shadow-md"
          />
          <p className="text-sm font-medium mt-2 text-center">{card.name}</p>
          {card.reason && (
            <p className="text-xs text-gray-500 text-center mt-1">{card.reason}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

const PriceAlertsSection: React.FC<PriceAlertsSectionProps> = ({ alerts, onCardClick }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Alerts</h3>
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border-l-4 cursor-pointer ${
            alert.urgency === 'high' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
            'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
          }`}
          onClick={() => onCardClick(alert.card)}
        >
          <div className="flex items-center space-x-3">
            <img
              src={alert.card.images?.small || '/back-card.png'}
              alt={alert.card.name}
              className="w-12 h-16 object-cover rounded"
            />
            <div>
              <p className="font-medium">{alert.card.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
              <p className="text-xs text-gray-500">
                Current: ${alert.currentPrice?.toFixed(2)} | Avg: ${alert.avgPrice?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CollectionSuggestionsSection: React.FC<CollectionSuggestionsSectionProps> = ({ suggestions, onCardClick }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complete Your Sets</h3>
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">{suggestion.setName}</h4>
            <span className="text-sm text-gray-500">
              {(suggestion.completionRate * 100).toFixed(1)}% complete
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {suggestion.missingCards.map((card, cardIndex) => (
              <div 
                key={cardIndex}
                className="cursor-pointer"
                onClick={() => onCardClick(card)}
              >
                <img
                  src={card.images?.small || '/back-card.png'}
                  alt={card.name}
                  className="w-full rounded"
                />
                <p className="text-xs text-center mt-1">{card.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SmartRecommendationEngine;