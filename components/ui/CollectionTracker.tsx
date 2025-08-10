import React, { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { 
  FaChartPie,
  FaTrophy,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaFire,
  FaGift,
  FaEye,
  FaPlus,
  FaSlidersH
} from 'react-icons/fa';
// BsSparkles import removed - not available in react-icons/bs
import { Doughnut, Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import Modal from './modals/Modal';
import { useNotifications } from '../../hooks/useNotifications';
import { TCGCard } from '../../types/api/cards';
import { PocketCard } from '../../types/api/pocket-cards';
import { Pokemon } from "../../types/pokemon";

type Card = TCGCard | PocketCard | Pokemon;

interface SetAnalysis {
  id: string;
  name: string;
  totalCards: number;
  ownedCards: number;
  releaseDate?: string;
  series?: string;
  completionRate: number;
  missingCards: number;
}

interface RarityAnalysis {
  name: string;
  totalCards: number;
  ownedCards: number;
  completionRate: number;
}

interface TypeAnalysis {
  name: string;
  totalCards: number;
  ownedCards: number;
  completionRate: number;
}

interface CollectionAnalysis {
  totalCards: number;
  ownedCards: number;
  completionRate: number;
  setAnalysis: Record<string, SetAnalysis>;
  rarityAnalysis: Record<string, RarityAnalysis>;
  typeAnalysis: Record<string, TypeAnalysis>;
  missingCards: Card[];
  highPriorityMissing: Card[];
  recentAdditions: Card[];
  completedSets: SetAnalysis[];
  nearCompleteSets: SetAnalysis[];
  averageSetCompletion: number;
}

interface TrackingGoal {
  id: string;
  name: string;
  description: string;
  type: 'set' | 'count' | 'rarity';
  target: string;
  deadline: string;
  createdAt: string;
  progress: number;
  completed: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: () => boolean;
  points: number;
  unlockedAt?: string;
}

interface CollectionTrackerProps {
  userCards?: Card[];
  allCards?: Card[];
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Collection Completion Tracking with Progress Visualization
 * Gamified collection tracking with achievements and detailed progress analytics
 */
const CollectionTracker: React.FC<CollectionTrackerProps> = ({ 
  userCards = [], 
  allCards = [], 
  isOpen = false, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sets' | 'goals' | 'achievements'>('overview');
  const [selectedSet, setSelectedSet] = useState('all');
  const [trackingGoals, setTrackingGoals] = useState<TrackingGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<TrackingGoal, 'id' | 'createdAt' | 'progress' | 'completed'>>({
    name: '',
    description: '',
    type: 'set',
    target: '',
    deadline: ''
  });
  const { notify } = useNotifications();

  // Load saved data
  useEffect(() => {
    const savedGoals = localStorage.getItem('collectionGoals');
    const savedAchievements = localStorage.getItem('collectionAchievements');
    
    if (savedGoals) {
      setTrackingGoals(JSON.parse(savedGoals));
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  // Helper to get card properties safely
  const getCardProperty = (card: Card, property: string): unknown => {
    return (card as unknown as Record<string, unknown>)[property];
  };

  // Type-safe helper to get card set (wrapped in useCallback for stable reference)
  const getCardSet = useCallback((card: Card): { id?: string; name?: string; releaseDate?: string; series?: string } => {
    const set = getCardProperty(card, 'set');
    if (set && typeof set === 'object' && set !== null) {
      return set as { id?: string; name?: string; releaseDate?: string; series?: string };
    }
    return {};
  }, []);

  // Collection analysis
  const collectionAnalysis = useMemo((): CollectionAnalysis => {
    const userCardIds = new Set(userCards.map(card => card.id));
    
    // Overall completion
    const totalCards = allCards.length;
    const ownedCards = userCards.length;
    const completionRate = totalCards > 0 ? (ownedCards / totalCards) * 100 : 0;
    
    // Set completion analysis
    const setAnalysis: Record<string, SetAnalysis> = allCards.reduce<Record<string, SetAnalysis>>((acc, card) => {
      const cardSet = getCardSet(card);
      const setName = cardSet.name || 'Unknown';
      const setId = cardSet.id || 'unknown';
      
      if (!acc[setId]) {
        acc[setId] = {
          id: setId,
          name: setName,
          totalCards: 0,
          ownedCards: 0,
          releaseDate: cardSet.releaseDate,
          series: cardSet.series,
          completionRate: 0,
          missingCards: 0
        };
      }
      
      acc[setId].totalCards++;
      if (userCardIds.has(card.id)) {
        acc[setId].ownedCards++;
      }
      
      return acc;
    }, {});

    // Calculate completion rates for sets
    Object.values(setAnalysis).forEach(set => {
      set.completionRate = set.totalCards > 0 ? (set.ownedCards / set.totalCards) * 100 : 0;
      set.missingCards = set.totalCards - set.ownedCards;
    });

    // Rarity completion analysis
    const rarityAnalysis: Record<string, RarityAnalysis> = allCards.reduce<Record<string, RarityAnalysis>>((acc, card) => {
      const rarityValue = getCardProperty(card, 'rarity');
      const rarity = String(rarityValue || 'Unknown');
      
      if (!acc[rarity]) {
        acc[rarity] = {
          name: rarity,
          totalCards: 0,
          ownedCards: 0,
          completionRate: 0
        };
      }
      
      acc[rarity].totalCards++;
      if (userCardIds.has(card.id)) {
        acc[rarity].ownedCards++;
      }
      
      return acc;
    }, {});

    // Calculate completion rates for rarities
    Object.values(rarityAnalysis).forEach(rarity => {
      rarity.completionRate = rarity.totalCards > 0 ? (rarity.ownedCards / rarity.totalCards) * 100 : 0;
    });

    // Type completion analysis
    const typeAnalysis: Record<string, TypeAnalysis> = {};
    allCards.forEach(card => {
      const cardTypes = getCardProperty(card, 'types');
      if (cardTypes && Array.isArray(cardTypes)) {
        cardTypes.forEach((type: string) => {
          if (!typeAnalysis[type]) {
            typeAnalysis[type] = {
              name: type,
              totalCards: 0,
              ownedCards: 0,
              completionRate: 0
            };
          }
          
          typeAnalysis[type].totalCards++;
          if (userCardIds.has(card.id)) {
            typeAnalysis[type].ownedCards++;
          }
        });
      }
    });

    Object.values(typeAnalysis).forEach(type => {
      type.completionRate = type.totalCards > 0 ? (type.ownedCards / type.totalCards) * 100 : 0;
    });

    // Missing cards analysis
    const missingCards = allCards.filter(card => !userCardIds.has(card.id));
    
    // High priority missing cards (rare/valuable)
    const highPriorityMissing = missingCards
      .filter(card => {
        const currentPrice = getCardProperty(card, 'currentPrice');
        const price = getCardProperty(card, 'price');
        const priceValue = parseFloat(String(currentPrice || price || '0'));
        const rarityValue = getCardProperty(card, 'rarity');
        const rarity = String(rarityValue || '');
        return rarity.includes('Rare') || priceValue > 20;
      })
      .sort((a, b) => {
        const currentPriceA = getCardProperty(a, 'currentPrice');
        const priceA = getCardProperty(a, 'price');
        const priceValueA = parseFloat(String(currentPriceA || priceA || '0'));
        const currentPriceB = getCardProperty(b, 'currentPrice');
        const priceB = getCardProperty(b, 'price');
        const priceValueB = parseFloat(String(currentPriceB || priceB || '0'));
        return priceValueB - priceValueA;
      })
      .slice(0, 10);

    // Recent additions
    const recentAdditions = userCards
      .filter(card => {
        const addedDate = getCardProperty(card, 'addedToCollection');
        return addedDate && String(addedDate).trim() !== '';
      })
      .sort((a, b) => {
        const addedDateA = getCardProperty(a, 'addedToCollection');
        const addedDateB = getCardProperty(b, 'addedToCollection');
        const dateA = new Date(String(addedDateA || 0));
        const dateB = new Date(String(addedDateB || 0));
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);

    // Completion streaks
    const completedSets = Object.values(setAnalysis).filter(set => set.completionRate === 100);
    const nearCompleteSets = Object.values(setAnalysis)
      .filter(set => set.completionRate >= 80 && set.completionRate < 100)
      .sort((a, b) => b.completionRate - a.completionRate);

    return {
      totalCards,
      ownedCards,
      completionRate,
      setAnalysis,
      rarityAnalysis,
      typeAnalysis,
      missingCards,
      highPriorityMissing,
      recentAdditions,
      completedSets,
      nearCompleteSets,
      averageSetCompletion: Object.values(setAnalysis).reduce((sum, set) => sum + set.completionRate, 0) / Object.values(setAnalysis).length
    };
  }, [userCards, allCards, getCardSet]);

  // Achievement system
  const achievementDefinitions: Achievement[] = useMemo(() => [
    {
      id: 'first_card',
      name: 'Getting Started',
      description: 'Add your first card to the collection',
      icon: '🌟',
      condition: () => userCards.length >= 1,
      points: 10
    },
    {
      id: 'milestone_10',
      name: 'Collector',
      description: 'Collect 10 cards',
      icon: '📚',
      condition: () => userCards.length >= 10,
      points: 25
    },
    {
      id: 'milestone_50',
      name: 'Enthusiast',
      description: 'Collect 50 cards',
      icon: '🎯',
      condition: () => userCards.length >= 50,
      points: 50
    },
    {
      id: 'milestone_100',
      name: 'Serious Collector',
      description: 'Collect 100 cards',
      icon: '💎',
      condition: () => userCards.length >= 100,
      points: 100
    },
    {
      id: 'milestone_500',
      name: 'Master Collector',
      description: 'Collect 500 cards',
      icon: '👑',
      condition: () => userCards.length >= 500,
      points: 250
    },
    {
      id: 'first_complete_set',
      name: 'Set Master',
      description: 'Complete your first set',
      icon: '🏆',
      condition: () => collectionAnalysis.completedSets.length >= 1,
      points: 150
    },
    {
      id: 'three_complete_sets',
      name: 'Set Conqueror',
      description: 'Complete 3 different sets',
      icon: '⭐',
      condition: () => collectionAnalysis.completedSets.length >= 3,
      points: 300
    },
    {
      id: 'all_types',
      name: 'Type Master',
      description: 'Collect at least one card of every type',
      icon: '🌈',
      condition: () => {
        const collectedTypes = new Set<string>();
        userCards.forEach(card => {
          const types = getCardProperty(card, 'types');
          if (types && Array.isArray(types)) {
            types.forEach((type: string) => collectedTypes.add(type));
          }
        });
        return collectedTypes.size >= 18; // Assuming 18 different types
      },
      points: 200
    },
    {
      id: 'rare_collector',
      name: 'Rare Hunter',
      description: 'Collect 10 rare or higher cards',
      icon: '💫',
      condition: () => {
        return userCards.filter(card => {
          const rarityValue = getCardProperty(card, 'rarity');
          const rarity = String(rarityValue || '');
          return rarity.includes('Rare') || 
                 rarity.includes('Ultra') || 
                 rarity.includes('Secret');
        }).length >= 10;
      },
      points: 75
    },
    {
      id: 'speed_collector',
      name: 'Speed Collector',
      description: 'Collect 20 cards in one week',
      icon: '⚡',
      condition: () => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return userCards.filter(card => {
          const addedDateValue = getCardProperty(card, 'addedToCollection');
          const addedDate = String(addedDateValue || '');
          return addedDate && new Date(addedDate) > oneWeekAgo;
        }).length >= 20;
      },
      points: 100
    }
  ], [userCards, collectionAnalysis]);

  // Check for new achievements
  const checkAchievements = useCallback(() => {
    const currentAchievements = achievements.map(a => a.id);
    const newAchievements: Achievement[] = [];

    achievementDefinitions.forEach(achievement => {
      if (!currentAchievements.includes(achievement.id) && achievement.condition()) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
      }
    });

    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements];
      setAchievements(updatedAchievements);
      localStorage.setItem('collectionAchievements', JSON.stringify(updatedAchievements));
      
      newAchievements.forEach(achievement => {
        notify.success(`Achievement unlocked: ${achievement.name}!`);
      });
    }
  }, [achievements, achievementDefinitions, notify]);

  // Check achievements on mount if not loaded from storage
  useEffect(() => {
    const savedAchievements = localStorage.getItem('collectionAchievements');
    if (!savedAchievements) {
      checkAchievements();
    }
  }, [checkAchievements]);

  // Progress tracking goals
  const createGoal = () => {
    if (!newGoal.name.trim()) {
      notify.error('Goal name is required');
      return;
    }

    const goal = {
      id: Date.now().toString(),
      ...newGoal,
      createdAt: new Date().toISOString(),
      progress: 0,
      completed: false
    };

    const updatedGoals = [...trackingGoals, goal];
    setTrackingGoals(updatedGoals);
    localStorage.setItem('collectionGoals', JSON.stringify(updatedGoals));
    setShowCreateGoal(false);
    setNewGoal({ name: '', description: '', type: 'set', target: '', deadline: '' });
    notify.success('Goal created successfully!');
  };

  // Update goal progress
  const updateGoalProgress = useCallback(() => {
    setTrackingGoals(prevGoals => {
      const updatedGoals = prevGoals.map(goal => {
        let progress = 0;
        let completed = false;

        switch (goal.type) {
          case 'set':
            const setData = Object.values(collectionAnalysis.setAnalysis).find(s => s.name === goal.target);
            if (setData) {
              progress = setData.completionRate;
              completed = setData.completionRate === 100;
            }
            break;
          case 'count':
            const targetCount = parseInt(goal.target);
            progress = Math.min((userCards.length / targetCount) * 100, 100);
            completed = userCards.length >= targetCount;
            break;
          case 'rarity':
            const rarityCards = userCards.filter(card => {
              const rarityValue = getCardProperty(card, 'rarity');
              return String(rarityValue || '') === goal.target;
            });
            const targetRarityCount = parseInt(goal.description.match(/\d+/)?.[0] || '1');
            progress = Math.min((rarityCards.length / targetRarityCount) * 100, 100);
            completed = rarityCards.length >= targetRarityCount;
            break;
        }

        return { ...goal, progress, completed };
      });

      localStorage.setItem('collectionGoals', JSON.stringify(updatedGoals));
      return updatedGoals;
    });
  }, [collectionAnalysis, userCards]);

  useEffect(() => {
    updateGoalProgress();
  }, [updateGoalProgress]);

  // Chart configurations
  const completionChart: {
    data: ChartData<'doughnut', number[], string>;
    options: ChartOptions<'doughnut'>;
  } = {
    data: {
      labels: ['Owned', 'Missing'],
      datasets: [{
        data: [collectionAnalysis.ownedCards, collectionAnalysis.totalCards - collectionAnalysis.ownedCards],
        backgroundColor: ['#10B981', '#E5E7EB'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Overall Collection Progress' }
      }
    }
  };

  const setProgressChart: {
    data: ChartData<'bar', number[], string>;
    options: ChartOptions<'bar'>;
  } = {
    data: {
      labels: Object.values(collectionAnalysis.setAnalysis)
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 10)
        .map(set => set.name.length > 15 ? set.name.substring(0, 15) + '...' : set.name),
      datasets: [{
        label: 'Completion %',
        data: Object.values(collectionAnalysis.setAnalysis)
          .sort((a, b) => b.completionRate - a.completionRate)
          .slice(0, 10)
          .map(set => set.completionRate),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Top 10 Sets by Completion' }
      },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  };

  const rarityChart: {
    data: ChartData<'doughnut', number[], string>;
    options: ChartOptions<'doughnut'>;
  } = {
    data: {
      labels: Object.keys(collectionAnalysis.rarityAnalysis),
      datasets: [{
        data: Object.values(collectionAnalysis.rarityAnalysis).map(r => r.completionRate),
        backgroundColor: [
          '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' },
        title: { display: true, text: 'Completion by Rarity' }
      }
    }
  };

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: <FaChartPie className="h-5 w-5" /> },
    { id: 'sets' as const, name: 'Sets', icon: <FaCheckCircle className="h-5 w-5" /> },
    { id: 'goals' as const, name: 'Goals', icon: <FaTrophy className="h-5 w-5" /> },
    { id: 'achievements' as const, name: 'Achievements', icon: <FaStar className="h-5 w-5" /> }
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose || (() => {})} title="Collection Tracker" size="xl">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Cards</p>
                <p className="text-2xl font-bold">{collectionAnalysis.ownedCards}</p>
              </div>
              <FaChartPie className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Completion</p>
                <p className="text-2xl font-bold">{collectionAnalysis.completionRate.toFixed(1)}%</p>
              </div>
              <FaCheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Complete Sets</p>
                <p className="text-2xl font-bold">{collectionAnalysis.completedSets.length}</p>
              </div>
              <FaTrophy className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Achievements</p>
                <p className="text-2xl font-bold">{achievements.length}</p>
              </div>
              <FaStar className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Progress Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
              <Doughnut data={completionChart.data} options={completionChart.options} />
            </div>

            {/* Rarity Progress Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
              <Doughnut data={rarityChart.data} options={rarityChart.options} />
            </div>

            {/* Set Progress Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border lg:col-span-2">
              <Bar data={setProgressChart.data} options={setProgressChart.options} />
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Collection Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {collectionAnalysis.averageSetCompletion.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Average Set Completion
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {collectionAnalysis.nearCompleteSets.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Sets Near Completion (80%+)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {collectionAnalysis.highPriorityMissing.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    High Priority Missing Cards
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sets' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex justify-between items-center">
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                <option value="all">All Sets</option>
                <option value="completed">Completed Sets</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
              </select>
            </div>

            {/* Sets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(collectionAnalysis.setAnalysis)
                .filter(set => {
                  if (selectedSet === 'completed') return set.completionRate === 100;
                  if (selectedSet === 'in-progress') return set.completionRate > 0 && set.completionRate < 100;
                  if (selectedSet === 'not-started') return set.completionRate === 0;
                  return true;
                })
                .sort((a, b) => b.completionRate - a.completionRate)
                .map(set => (
                  <div key={set.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {set.name}
                      </h4>
                      {set.completionRate === 100 && (
                        <FaCheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {set.ownedCards} / {set.totalCards} cards
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {set.completionRate.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${set.completionRate}%` }}
                        />
                      </div>
                      
                      {set.missingCards > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {set.missingCards} cards remaining
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            {/* Create Goal Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Collection Goals
              </h3>
              <button
                onClick={() => setShowCreateGoal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">

                <FaPlus className="h-4 w-4" />
                <span>Create Goal</span>
              </button>
            </div>

            {/* Goals List */}
            {trackingGoals.length > 0 ? (
              <div className="space-y-4">
                {trackingGoals.map(goal => (
                  <div key={goal.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {goal.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.description}
                        </p>
                      </div>
                      {goal.completed && (
                        <FaCheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {goal.progress.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            goal.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        />
                      </div>
                      
                      {goal.deadline && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <FaClock className="h-4 w-4 mr-1" />
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaTrophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No goals set yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Set collection goals to track your progress and stay motivated
                </p>
                <button
                  onClick={() => setShowCreateGoal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

                  Create Your First Goal
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Achievement Stats */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Achievement Progress</h3>
                  <p className="text-yellow-100">
                    {achievements.length} of {achievementDefinitions.length} unlocked
                  </p>
                </div>
                <div className="text-3xl">
                  {achievements.reduce((sum, a) => sum + a.points, 0)} pts
                </div>
              </div>
              <div className="mt-4 w-full bg-yellow-300 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
        style={{ 
                    width: `${(achievements.length / achievementDefinitions.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementDefinitions.map(achievement => {
                const isUnlocked = achievements.some(a => a.id === achievement.id);
                const unlockedAchievement = achievements.find(a => a.id === achievement.id);
                
                return (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isUnlocked
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          isUnlocked ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className={`text-sm ${
                          isUnlocked ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                        {isUnlocked && unlockedAchievement && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            Unlocked {unlockedAchievement.unlockedAt ? new Date(unlockedAchievement.unlockedAt).toLocaleDateString() : ''}
                          </p>
                        )}
                      </div>
                      <div className={`text-right ${
                        isUnlocked ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        <div className="font-bold">{achievement.points} pts</div>
                        {isUnlocked && <FaCheckCircle className="h-5 w-5 text-green-500 mx-auto mt-1" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <Modal isOpen={showCreateGoal} onClose={() => setShowCreateGoal(false)} title="Create Collection Goal">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              value={newGoal.name}
              onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        placeholder="Goal description..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goal Type
            </label>
            <select
              value={newGoal.type}
              onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as 'set' | 'count' | 'rarity' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

              <option value="set">Complete a specific set</option>
              <option value="count">Collect a certain number of cards</option>
              <option value="rarity">Collect cards of specific rarity</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target
            </label>
            {newGoal.type === 'set' ? (
              <select
                value={newGoal.target}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                <option value="">Select a set...</option>
                {Object.values(collectionAnalysis.setAnalysis).map(set => (
                  <option key={set.id} value={set.name}>{set.name}</option>
                ))}
              </select>
            ) : (
              <input
                type={newGoal.type === 'count' ? 'number' : 'text'}
                value={newGoal.target}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateGoal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">

              Cancel
            </button>
            <button
              onClick={createGoal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

              Create Goal
            </button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default CollectionTracker;