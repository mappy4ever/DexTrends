import React, { useState, useEffect } from 'react';
import { useFavorites } from '../../context/favoritescontext';

const AchievementSystem = ({ onAchievementUnlocked = () => {} }) => {
  const { favorites } = useFavorites();
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);

  // Define all possible achievements
  const achievementDefinitions = [
    // Collection Size Achievements
    {
      id: 'first_card',
      title: 'First Steps',
      description: 'Add your first card to favorites',
      icon: '🥇',
      category: 'collection',
      tier: 'bronze',
      requirement: (data) => data.totalCards >= 1,
      reward: 'Welcome to the world of Pokemon card collecting!'
    },
    {
      id: 'starter_collection',
      title: 'Starter Collector',
      description: 'Collect 10 cards',
      icon: '⭐',
      category: 'collection',
      tier: 'bronze',
      requirement: (data) => data.totalCards >= 10,
      reward: '10 XP + Collector Badge'
    },
    {
      id: 'growing_collection',
      title: 'Growing Collection',
      description: 'Collect 25 cards',
      icon: '🌟',
      category: 'collection',
      tier: 'silver',
      requirement: (data) => data.totalCards >= 25,
      reward: '25 XP + Growth Badge'
    },
    {
      id: 'serious_collector',
      title: 'Serious Collector',
      description: 'Collect 50 cards',
      icon: '💎',
      category: 'collection',
      tier: 'gold',
      requirement: (data) => data.totalCards >= 50,
      reward: '50 XP + Diamond Badge'
    },
    {
      id: 'master_collector',
      title: 'Master Collector',
      description: 'Collect 100 cards',
      icon: '👑',
      category: 'collection',
      tier: 'legendary',
      requirement: (data) => data.totalCards >= 100,
      reward: '100 XP + Master Crown'
    },

    // Rarity Achievements
    {
      id: 'first_rare',
      title: 'Rare Find',
      description: 'Collect your first rare card',
      icon: '💫',
      category: 'rarity',
      tier: 'bronze',
      requirement: (data) => data.rareCards > 0,
      reward: 'Rare Hunter Badge'
    },
    {
      id: 'holographic_hunter',
      title: 'Holographic Hunter',
      description: 'Collect 5 holographic cards',
      icon: '🌈',
      category: 'rarity',
      tier: 'silver',
      requirement: (data) => data.holoCards >= 5,
      reward: 'Holo Master Badge'
    },
    {
      id: 'secret_finder',
      title: 'Secret Finder',
      description: 'Find a secret rare card',
      icon: '🔍',
      category: 'rarity',
      tier: 'gold',
      requirement: (data) => data.secretRares > 0,
      reward: 'Secret Agent Badge'
    },

    // Type Achievements
    {
      id: 'type_explorer',
      title: 'Type Explorer',
      description: 'Collect cards from 5 different types',
      icon: '🧭',
      category: 'types',
      tier: 'bronze',
      requirement: (data) => Object.keys(data.typeDistribution || {}).length >= 5,
      reward: 'Explorer Badge'
    },
    {
      id: 'type_master',
      title: 'Type Master',
      description: 'Collect cards from all 18 Pokemon types',
      icon: '🎨',
      category: 'types',
      tier: 'legendary',
      requirement: (data) => Object.keys(data.typeDistribution || {}).length >= 18,
      reward: 'Type Master Crown'
    },

    // Value Achievements
    {
      id: 'valuable_collection',
      title: 'Valuable Collection',
      description: 'Reach $100 in collection value',
      icon: '💰',
      category: 'value',
      tier: 'silver',
      requirement: (data) => data.totalValue >= 100,
      reward: 'Investor Badge'
    },
    {
      id: 'high_roller',
      title: 'High Roller',
      description: 'Reach $500 in collection value',
      icon: '💎',
      category: 'value',
      tier: 'gold',
      requirement: (data) => data.totalValue >= 500,
      reward: 'High Roller Badge'
    },
    {
      id: 'treasure_hunter',
      title: 'Treasure Hunter',
      description: 'Own a card worth over $100',
      icon: '🏆',
      category: 'value',
      tier: 'gold',
      requirement: (data) => data.mostValuableCardPrice >= 100,
      reward: 'Treasure Hunter Trophy'
    },

    // Special Achievements
    {
      id: 'shiny_hunter',
      title: 'Shiny Hunter',
      description: 'Collect a shiny Pokemon card',
      icon: '✨',
      category: 'special',
      tier: 'gold',
      requirement: (data) => data.shinyCards > 0,
      reward: 'Shiny Master Badge'
    },
    {
      id: 'legendary_collector',
      title: 'Legendary Collector',
      description: 'Collect 3 legendary Pokemon cards',
      icon: '🐉',
      category: 'special',
      tier: 'legendary',
      requirement: (data) => data.legendaryCards >= 3,
      reward: 'Legend Master Title'
    },
    {
      id: 'set_completionist',
      title: 'Set Completionist',
      description: 'Complete an entire card set',
      icon: '📋',
      category: 'special',
      tier: 'legendary',
      requirement: (data) => data.completedSets > 0,
      reward: 'Completionist Crown'
    },

    // Daily/Weekly Achievements
    {
      id: 'daily_visitor',
      title: 'Daily Visitor',
      description: 'Visit the app for 7 consecutive days',
      icon: '📅',
      category: 'engagement',
      tier: 'bronze',
      requirement: (data) => data.consecutiveDays >= 7,
      reward: 'Loyal Trainer Badge'
    },
    {
      id: 'comparison_expert',
      title: 'Comparison Expert',
      description: 'Use the card comparison tool 10 times',
      icon: '⚖️',
      category: 'engagement',
      tier: 'silver',
      requirement: (data) => data.comparisonsUsed >= 10,
      reward: 'Analyst Badge'
    }
  ];

  // Calculate collection statistics for achievement checking
  const calculateCollectionStats = () => {
    const stats = {
      totalCards: favorites.cards?.length || 0,
      totalPokemon: favorites.pokemon?.length || 0,
      rareCards: 0,
      holoCards: 0,
      secretRares: 0,
      shinyCards: 0,
      legendaryCards: 0,
      completedSets: 0,
      totalValue: 0,
      mostValuableCardPrice: 0,
      typeDistribution: {},
      consecutiveDays: parseInt(localStorage.getItem('consecutive_days') || '1'),
      comparisonsUsed: parseInt(localStorage.getItem('comparisons_used') || '0')
    };

    // Mock calculations (in real app, this would use actual card data)
    if (favorites.cards) {
      favorites.cards.forEach(card => {
        // Mock rarity detection
        const cardName = card.name?.toLowerCase() || '';
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
        if (mockValue > stats.mostValuableCardPrice) {
          stats.mostValuableCardPrice = mockValue;
        }

        // Type distribution (mock)
        const types = ['fire', 'water', 'grass', 'electric', 'psychic'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        stats.typeDistribution[randomType] = (stats.typeDistribution[randomType] || 0) + 1;
      });
    }

    return stats;
  };

  // Debounced achievement checking
  useEffect(() => {
    if (!favorites.cards && !favorites.pokemon) {
      setAchievements(achievementDefinitions);
      return;
    }

    // Debounce achievement calculations
    const timer = setTimeout(() => {
      const stats = calculateCollectionStats();
      const previouslyUnlocked = JSON.parse(localStorage.getItem('unlocked_achievements') || '[]');
      const newUnlocked = [];

      achievementDefinitions.forEach(achievement => {
        if (achievement.requirement(stats) && !previouslyUnlocked.includes(achievement.id)) {
          newUnlocked.push(achievement);
        }
      });

      if (newUnlocked.length > 0) {
        const allUnlocked = [...previouslyUnlocked, ...newUnlocked.map(a => a.id)];
        localStorage.setItem('unlocked_achievements', JSON.stringify(allUnlocked));
        setNewlyUnlocked(newUnlocked);
        setUnlockedAchievements(allUnlocked);
        
        // Trigger notifications for each new achievement
        newUnlocked.forEach(achievement => {
          onAchievementUnlocked(achievement);
          showAchievementNotification(achievement);
        });
      } else {
        setUnlockedAchievements(previouslyUnlocked);
      }

      setAchievements(achievementDefinitions);
    }, 500);

    return () => clearTimeout(timer);
  }, [favorites.cards?.length, favorites.pokemon?.length]);

  const showAchievementNotification = (achievement) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('achievement', `🎉 Achievement Unlocked: ${achievement.title}`, {
        description: achievement.reward,
        duration: 5000
      });
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'silver': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'gold': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'legendary': return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
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

  const getProgressPercentage = () => {
    return Math.round((unlockedAchievements.length / achievements.length) * 100);
  };

  const groupedAchievements = achievements.reduce((groups, achievement) => {
    if (!groups[achievement.category]) {
      groups[achievement.category] = [];
    }
    groups[achievement.category].push(achievement);
    return groups;
  }, {});

  return (
    <div className="achievement-system space-y-6">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-3">Trainer Achievements</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg">
              {unlockedAchievements.length} / {achievements.length} Unlocked
            </p>
            <p className="text-purple-100 text-sm">Keep collecting to unlock more badges!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{getProgressPercentage()}%</div>
            <div className="text-sm text-purple-100">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-purple-600 rounded-full h-3 overflow-hidden">
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
              {category} Achievements
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({categoryAchievements.filter(a => unlockedAchievements.includes(a.id)).length}/{categoryAchievements.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAchievements.map(achievement => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const isNewlyUnlocked = newlyUnlocked.some(a => a.id === achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    isUnlocked
                      ? `${getTierColor(achievement.tier)} shadow-lg transform hover:scale-105`
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                  } ${isNewlyUnlocked ? 'animate-pulse ring-4 ring-yellow-400' : ''}`}
                >
                  {/* Achievement Icon */}
                  <div className="flex items-start space-x-3">
                    <div className={`text-3xl ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${isUnlocked ? '' : 'text-gray-500 dark:text-gray-400'}`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${isUnlocked ? '' : 'text-gray-400 dark:text-gray-500'}`}>
                        {achievement.description}
                      </p>
                      
                      {isUnlocked && (
                        <div className="mt-2 text-xs font-medium">
                          🎁 {achievement.reward}
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
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-xl">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievement Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => {
            const unlockedCount = categoryAchievements.filter(a => unlockedAchievements.includes(a.id)).length;
            const percentage = Math.round((unlockedCount / categoryAchievements.length) * 100);
            
            return (
              <div key={category} className="text-center">
                <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {unlockedCount}/{categoryAchievements.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;