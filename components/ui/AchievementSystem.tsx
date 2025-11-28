import React, { useState, useEffect } from 'react';
import { useFavorites } from '../../context/UnifiedAppContext';

// Extend Window interface for showNotification
declare global {
  interface Window {
    showNotification?: (type: string, message: string, options?: { description?: string; duration?: number }) => void;
  }
}

interface AchievementData {
  totalCards: number;
  rareCards: number;
  holoCards: number;
  ultraRareCards: number;
  typeCards: Record<string, number>;
  setCards: Record<string, number>;
  uniqueSets: number;
  uniqueTypes: number;
  totalValue: number;
  highestValue: number;
  secretRares: number;
  shinyCards: number;
  legendaryCards: number;
  completedSets: number;
  mostValuableCardPrice: number;
  consecutiveDays: number;
  comparisonsUsed: number;
  typeDistribution: Record<string, number>;
  totalPokemon: number;
  [key: string]: unknown;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  requirement: (data: AchievementData) => boolean;
  progress?: (data: AchievementData) => number;
  total?: number;
}

interface AchievementSystemProps {
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const AchievementSystem = ({ onAchievementUnlocked = () => {} }: AchievementSystemProps) => {
  const { favorites } = useFavorites();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Define all possible achievements
  const achievementDefinitions: Achievement[] = [
    // Collection Size Achievements
    {
      id: 'first_card',
      title: 'First Steps',
      description: 'Add your first card to favorites',
      icon: '🥇',
      category: 'collection',
      tier: 'bronze',
      requirement: (data: AchievementData) => data.totalCards >= 1,
      total: 1
    },
    {
      id: 'starter_collection',
      title: 'Starter Collector',
      description: 'Collect 10 cards',
      icon: '⭐',
      category: 'collection',
      tier: 'bronze',
      requirement: (data: AchievementData) => data.totalCards >= 10,
      total: 10
    },
    {
      id: 'growing_collection',
      title: 'Growing Collection',
      description: 'Collect 25 cards',
      icon: '🌟',
      category: 'collection',
      tier: 'silver',
      requirement: (data: AchievementData) => data.totalCards >= 25,
      total: 25
    },
    {
      id: 'serious_collector',
      title: 'Serious Collector',
      description: 'Collect 50 cards',
      icon: '💎',
      category: 'collection',
      tier: 'gold',
      requirement: (data: AchievementData) => data.totalCards >= 50,
      total: 50
    },
    {
      id: 'master_collector',
      title: 'Master Collector',
      description: 'Collect 100 cards',
      icon: '👑',
      category: 'collection',
      tier: 'legendary',
      requirement: (data: AchievementData) => data.totalCards >= 100,
      total: 100
    },

    // Rarity Achievements
    {
      id: 'first_rare',
      title: 'Rare Find',
      description: 'Collect your first rare card',
      icon: '💫',
      category: 'rarity',
      tier: 'bronze',
      requirement: (data: AchievementData) => data.rareCards > 0,
      total: 1
    },
    {
      id: 'holographic_hunter',
      title: 'Holographic Hunter',
      description: 'Collect 5 holographic cards',
      icon: '🌈',
      category: 'rarity',
      tier: 'silver',
      requirement: (data: AchievementData) => data.holoCards >= 5,
      total: 5
    },
    {
      id: 'secret_finder',
      title: 'Secret Finder',
      description: 'Find a secret rare card',
      icon: '🔍',
      category: 'rarity',
      tier: 'gold',
      requirement: (data: AchievementData) => data.secretRares > 0,
      total: 1
    },

    // Type Achievements
    {
      id: 'type_explorer',
      title: 'Type Explorer',
      description: 'Collect cards from 5 different types',
      icon: '🧭',
      category: 'types',
      tier: 'bronze',
      requirement: (data: AchievementData) => Object.keys(data.typeDistribution || {}).length >= 5,
      total: 5
    },
    {
      id: 'type_master',
      title: 'Type Master',
      description: 'Collect cards from all 18 Pokemon types',
      icon: '🎨',
      category: 'types',
      tier: 'legendary',
      requirement: (data: AchievementData) => Object.keys(data.typeDistribution || {}).length >= 18,
      total: 18
    },

    // Value Achievements
    {
      id: 'valuable_collection',
      title: 'Valuable Collection',
      description: 'Reach $100 in collection value',
      icon: '💰',
      category: 'value',
      tier: 'silver',
      requirement: (data: AchievementData) => data.totalValue >= 100,
      total: 100
    },
    {
      id: 'high_roller',
      title: 'High Roller',
      description: 'Reach $500 in collection value',
      icon: '💎',
      category: 'value',
      tier: 'gold',
      requirement: (data: AchievementData) => data.totalValue >= 500,
      total: 500
    },
    {
      id: 'treasure_hunter',
      title: 'Treasure Hunter',
      description: 'Own a card worth over $100',
      icon: '🏆',
      category: 'value',
      tier: 'gold',
      requirement: (data: AchievementData) => data.mostValuableCardPrice >= 100,
      total: 100
    },

    // Special Achievements
    {
      id: 'shiny_hunter',
      title: 'Shiny Hunter',
      description: 'Collect a shiny Pokemon card',
      icon: '✨',
      category: 'special',
      tier: 'gold',
      requirement: (data: AchievementData) => data.shinyCards > 0,
      total: 1
    },
    {
      id: 'legendary_collector',
      title: 'Legendary Collector',
      description: 'Collect 3 legendary Pokemon cards',
      icon: '🐉',
      category: 'special',
      tier: 'legendary',
      requirement: (data: AchievementData) => data.legendaryCards >= 3,
      total: 3
    },
    {
      id: 'set_completionist',
      title: 'Set Completionist',
      description: 'Complete an entire card set',
      icon: '📋',
      category: 'special',
      tier: 'legendary',
      requirement: (data: AchievementData) => data.completedSets > 0,
      total: 1
    },

    // Daily/Weekly Achievements
    {
      id: 'daily_visitor',
      title: 'Daily Visitor',
      description: 'Visit the app for 7 consecutive days',
      icon: '📅',
      category: 'engagement',
      tier: 'bronze',
      requirement: (data: AchievementData) => data.consecutiveDays >= 7,
      total: 7
    },
    {
      id: 'comparison_expert',
      title: 'Comparison Expert',
      description: 'Use the card comparison tool 10 times',
      icon: '⚖️',
      category: 'engagement',
      tier: 'silver',
      requirement: (data: AchievementData) => data.comparisonsUsed >= 10,
      total: 10
    }
  ];

  // Calculate collection statistics for achievement checking
  const calculateCollectionStats = (): AchievementData => {
    const stats: AchievementData = {
      totalCards: favorites.cards?.length || 0,
      totalPokemon: 0,
      rareCards: 0,
      holoCards: 0,
      ultraRareCards: 0,
      secretRares: 0,
      shinyCards: 0,
      legendaryCards: 0,
      completedSets: 0,
      totalValue: 0,
      highestValue: 0,
      mostValuableCardPrice: 0,
      typeCards: {},
      setCards: {},
      uniqueSets: 0,
      uniqueTypes: 0,
      typeDistribution: {},
      consecutiveDays: parseInt(localStorage.getItem('consecutive_days') || '1'),
      comparisonsUsed: parseInt(localStorage.getItem('comparisons_used') || '0')
    };

    // Mock calculations (in real app, this would use actual card data)
    if (favorites.cards && favorites.cards.length > 0) {
      // For now, mock the card data since we only have IDs
      favorites.cards.forEach((card: unknown) => {
        // Mock rarity detection based on ID patterns
        const cardName = (typeof card === 'string' ? card : (card as { id?: string })?.id || '').toLowerCase();
        if (cardName.includes('rare') || cardName.includes('holo')) stats.rareCards++;
        if (cardName.includes('holo') || cardName.includes('holographic')) stats.holoCards++;
        if (cardName.includes('secret')) stats.secretRares++;
        if (cardName.includes('shiny')) stats.shinyCards++;
        if (cardName.includes('legendary') || cardName.includes('mewtwo') || cardName.includes('lugia')) {
          stats.legendaryCards++;
        }

        // Mock value calculation
        const mockValue = Math.random() * 100 + 10;
        stats.totalValue += mockValue;
        if (mockValue > stats.highestValue) {
          stats.highestValue = mockValue;
        }
        stats.mostValuableCardPrice = stats.highestValue;

        // Type distribution (mock)
        const types = ['fire', 'water', 'grass', 'electric', 'psychic'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        stats.typeDistribution[randomType] = (stats.typeDistribution[randomType] || 0) + 1;
        stats.typeCards[randomType] = (stats.typeCards[randomType] || 0) + 1;
      });
    }

    // Calculate unique sets and types
    stats.uniqueSets = Object.keys(stats.setCards).length;
    stats.uniqueTypes = Object.keys(stats.typeCards).length;

    return stats;
  };

  // Check for newly unlocked achievements (optimized to prevent loops)
  useEffect(() => {
    if (!favorites?.cards || favorites.cards.length === 0) {
      setAchievements(achievementDefinitions);
      return;
    }

    const stats = calculateCollectionStats();
    const previouslyUnlocked: string[] = JSON.parse(localStorage.getItem('unlocked_achievements') || '[]');
    const newUnlocked: Achievement[] = [];

    achievementDefinitions.forEach((achievement: Achievement) => {
      if (achievement.requirement(stats) && !previouslyUnlocked.includes(achievement.id)) {
        newUnlocked.push(achievement);
      }
    });

    if (newUnlocked.length > 0) {
      const allUnlocked = [...previouslyUnlocked, ...newUnlocked.map((a: Achievement) => a.id)];
      localStorage.setItem('unlocked_achievements', JSON.stringify(allUnlocked));
      setNewlyUnlocked(newUnlocked);
      setUnlockedAchievements(allUnlocked);
      
      // Trigger notifications for each new achievement
      newUnlocked.forEach((achievement: Achievement) => {
        onAchievementUnlocked(achievement);
        showAchievementNotification(achievement);
      });
    } else {
      setUnlockedAchievements(previouslyUnlocked);
    }

    setAchievements(achievementDefinitions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites.cards?.length]); // Only trigger on count changes, onAchievementUnlocked excluded to prevent loops

  const showAchievementNotification = (achievement: Achievement) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('achievement', `🎉 Achievement Unlocked: ${achievement.title}`, {
        description: achievement.description,
        duration: 5000
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'silver': return 'bg-stone-100 border-stone-300 text-stone-800';
      case 'gold': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'legendary': return 'bg-amber-100 border-amber-300 text-amber-800';
      default: return 'bg-stone-100 border-stone-300 text-stone-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'collection': return '📚';
      case 'rarity': return '💎';
      case 'types': return '🎨';
      case 'value': return '💰';
      case 'special': return '⭐';
      case 'engagement': return '🎯';
      default: return '🏆';
    }
  };

  const getProgressPercentage = (): number => {
    return Math.round((unlockedAchievements.length / achievements.length) * 100);
  };

  const groupedAchievements = achievements.reduce<Record<string, Achievement[]>>((groups, achievement) => {
    if (!groups[achievement.category]) {
      groups[achievement.category] = [];
    }
    groups[achievement.category].push(achievement);
    return groups;
  }, {});

  return (
    <div className="achievement-system space-y-6">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-500 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-3">Trainer Achievements</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg">
              {unlockedAchievements.length} / {achievements.length} Unlocked
            </p>
            <p className="text-amber-100 text-sm">Keep collecting to unlock more badges!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{getProgressPercentage()}%</div>
            <div className="text-sm text-amber-100">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-amber-600 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Achievement Categories */}
      {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <h3 className="text-xl font-semibold text-stone-900 dark:text-white capitalize">
              {category} Achievements
            </h3>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              ({(categoryAchievements as Achievement[]).filter((a: Achievement) => unlockedAchievements.includes(a.id)).length}/{(categoryAchievements as Achievement[]).length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(categoryAchievements as Achievement[]).map((achievement: Achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const isNewlyUnlocked = newlyUnlocked.some(a => a.id === achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    isUnlocked
                      ? `${getTierColor(achievement.tier)} shadow-lg transform hover:scale-105`
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'
                  } ${isNewlyUnlocked ? 'animate-pulse ring-4 ring-yellow-400' : ''}`}
                >
                  {/* Achievement Icon */}
                  <div className="flex items-start space-x-3">
                    <div className={`text-3xl ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${isUnlocked ? '' : 'text-stone-500 dark:text-stone-400'}`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${isUnlocked ? '' : 'text-stone-400 dark:text-stone-500'}`}>
                        {achievement.description}
                      </p>
                      
                      {isUnlocked && achievement.total && (
                        <div className="mt-2 text-xs font-medium">
                          Progress: {achievement.total}/{achievement.total}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${getTierColor(achievement.tier)}`}>
                    {achievement.tier.toUpperCase()}
                  </div>

                  {/* Locked Overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900 bg-opacity-50 rounded-xl">
                      <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}

                  {/* New Achievement Sparkle Effect */}
                  {isNewlyUnlocked && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-xs">✨</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Achievement Statistics */}
      <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Achievement Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => {
            const unlockedCount = categoryAchievements.filter((a: Achievement) => unlockedAchievements.includes(a.id)).length;
            const percentage = Math.round((unlockedCount / categoryAchievements.length) * 100);
            
            return (
              <div key={category} className="text-center">
                <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                <div className="text-lg font-bold text-stone-900 dark:text-white">
                  {unlockedCount}/{categoryAchievements.length}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 capitalize">{category}</div>
                <div className="text-xs text-stone-500 dark:text-stone-500">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;