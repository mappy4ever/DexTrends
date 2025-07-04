import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaStar, FaGift, FaFire, FaLock, FaUnlock, FaCoins, FaGem } from 'react-icons/fa';
import { BsLightning, BsCollection, BsCardChecklist, BsGraphUp, BsPeople, BsHeart } from 'react-icons/bs';
import { GiTwoCoins, GiDiamonds, GiCrown, GiStarMedal } from 'react-icons/gi';

export default function GameficationSystem({ userId, onRewardEarned, onLevelUp }) {
  const [userProfile, setUserProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [unlockedRewards, setUnlockedRewards] = useState([]);

  useEffect(() => {
    loadGameficationData();
  }, [userId]);

  const loadGameficationData = () => {
    // Mock user profile
    const profile = {
      level: 12,
      experience: 2750,
      experienceToNext: 3000,
      totalPoints: 15420,
      coins: 2340,
      gems: 47,
      streak: 7,
      title: 'Card Collector',
      badges: ['early_adopter', 'social_butterfly', 'price_prophet'],
      joinDate: '2023-01-15',
      stats: {
        cardsViewed: 1247,
        searchesPerformed: 389,
        favoriteCards: 156,
        collectionValue: 4567.89,
        socialInteractions: 298,
        accuratePredictions: 73
      }
    };

    // Mock achievements
    const mockAchievements = [
      {
        id: 'first_search',
        name: 'First Steps',
        description: 'Perform your first card search',
        icon: <BsLightning className="text-yellow-500" />,
        points: 50,
        rarity: 'common',
        unlocked: true,
        unlockedAt: '2023-01-15',
        progress: 1,
        maxProgress: 1
      },
      {
        id: 'collection_starter',
        name: 'Collection Starter',
        description: 'Add 10 cards to your collection',
        icon: <BsCollection className="text-blue-500" />,
        points: 100,
        rarity: 'common',
        unlocked: true,
        unlockedAt: '2023-01-16',
        progress: 10,
        maxProgress: 10
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Make 5 friends in the community',
        icon: <BsPeople className="text-purple-500" />,
        points: 200,
        rarity: 'uncommon',
        unlocked: true,
        unlockedAt: '2023-02-03',
        progress: 5,
        maxProgress: 5
      },
      {
        id: 'price_prophet',
        name: 'Price Prophet',
        description: 'Make 10 accurate price predictions',
        icon: <BsGraphUp className="text-green-500" />,
        points: 300,
        rarity: 'rare',
        unlocked: true,
        unlockedAt: '2023-03-12',
        progress: 10,
        maxProgress: 10
      },
      {
        id: 'deck_master',
        name: 'Deck Master',
        description: 'Create 3 tournament-legal decks',
        icon: <BsCardChecklist className="text-red-500" />,
        points: 500,
        rarity: 'epic',
        unlocked: false,
        progress: 2,
        maxProgress: 3
      },
      {
        id: 'collection_king',
        name: 'Collection King',
        description: 'Reach a collection value of $10,000',
        icon: <GiCrown className="text-yellow-600" />,
        points: 1000,
        rarity: 'legendary',
        unlocked: false,
        progress: 4567.89,
        maxProgress: 10000
      },
      {
        id: 'community_leader',
        name: 'Community Leader',
        description: 'Get 100 likes on your posts',
        icon: <BsHeart className="text-pink-500" />,
        points: 750,
        rarity: 'epic',
        unlocked: false,
        progress: 67,
        maxProgress: 100
      },
      {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'Join during beta period',
        icon: <GiStarMedal className="text-indigo-500" />,
        points: 1500,
        rarity: 'legendary',
        unlocked: true,
        unlockedAt: '2023-01-15',
        progress: 1,
        maxProgress: 1
      }
    ];

    // Mock daily tasks
    const mockDailyTasks = [
      {
        id: 'daily_search',
        name: 'Daily Explorer',
        description: 'Perform 5 card searches',
        icon: <BsLightning className="text-yellow-500" />,
        reward: { coins: 50, experience: 25 },
        progress: 3,
        maxProgress: 5,
        completed: false,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: 'daily_collection',
        name: 'Collection Curator',
        description: 'Add 2 cards to your collection',
        icon: <BsCollection className="text-blue-500" />,
        reward: { coins: 75, experience: 30 },
        progress: 2,
        maxProgress: 2,
        completed: true,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: 'daily_social',
        name: 'Social Connector',
        description: 'Like 3 community posts',
        icon: <BsHeart className="text-pink-500" />,
        reward: { coins: 30, experience: 15 },
        progress: 1,
        maxProgress: 3,
        completed: false,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ];

    // Mock leaderboard
    const mockLeaderboard = [
      { rank: 1, username: 'PokeMaster92', points: 28750, level: 18, avatar: '/api/placeholder/40/40' },
      { rank: 2, username: 'CardCollector', points: 24580, level: 16, avatar: '/api/placeholder/40/40' },
      { rank: 3, username: 'MetaGamer', points: 22340, level: 15, avatar: '/api/placeholder/40/40' },
      { rank: 4, username: 'TradingPro', points: 19876, level: 14, avatar: '/api/placeholder/40/40' },
      { rank: 5, username: 'YourUsername', points: 15420, level: 12, avatar: '/api/placeholder/40/40' },
      { rank: 6, username: 'DeckBuilder', points: 14250, level: 11, avatar: '/api/placeholder/40/40' }
    ];

    // Mock recent activity
    const mockActivity = [
      {
        id: 1,
        type: 'achievement',
        message: 'Unlocked "Price Prophet" achievement',
        points: 300,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        type: 'daily_complete',
        message: 'Completed daily task: Collection Curator',
        points: 75,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 3,
        type: 'level_up',
        message: 'Reached level 12!',
        points: 200,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    setUserProfile(profile);
    setAchievements(mockAchievements);
    setDailyTasks(mockDailyTasks);
    setLeaderboard(mockLeaderboard);
    setRecentActivity(mockActivity);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
      case 'uncommon': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'rare': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'epic': return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const claimDailyReward = (taskId) => {
    setDailyTasks(prev => prev.map(task => 
      task.id === taskId && task.completed && !task.claimed
        ? { ...task, claimed: true }
        : task
    ));

    const task = dailyTasks.find(t => t.id === taskId);
    if (task && task.completed) {
      setUserProfile(prev => ({
        ...prev,
        coins: prev.coins + (task.reward.coins || 0),
        experience: prev.experience + (task.reward.experience || 0)
      }));

      onRewardEarned?.(task.reward);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="gamification-system space-y-6">
      {/* User Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <FaTrophy className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Level {userProfile.level}</h2>
              <p className="text-purple-100">{userProfile.title}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <div className="flex items-center space-x-1">
                  <GiTwoCoins className="text-yellow-300" />
                  <span>{userProfile.coins.toLocaleString()} coins</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GiDiamonds className="text-cyan-300" />
                  <span>{userProfile.gems} gems</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaFire className="text-orange-300" />
                  <span>{userProfile.streak} day streak</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-purple-100 mb-1">Experience</div>
            <div className="text-lg font-bold mb-2">
              {userProfile.experience.toLocaleString()} / {userProfile.experienceToNext.toLocaleString()} XP
            </div>
            <div className="w-48 bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-300"
        style={{ width: `${(userProfile.experience / userProfile.experienceToNext) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <FaTrophy /> },
          { id: 'achievements', label: 'Achievements', icon: <FaMedal /> },
          { id: 'daily', label: 'Daily Tasks', icon: <BsCardChecklist /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <FaStar /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(userProfile.stats).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' :
                    activity.type === 'level_up' ? 'bg-purple-100 text-purple-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'achievement' ? <FaTrophy className="w-4 h-4" /> :
                     activity.type === 'level_up' ? <FaStar className="w-4 h-4" /> :
                     <FaGift className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{activity.points} points • {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map(achievement => (
            <div key={achievement.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 ${
              !achievement.unlocked ? 'opacity-75' : ''
            }`}>
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  achievement.unlocked ? getRarityColor(achievement.rarity) : 'bg-gray-200 text-gray-400'
                }`}>
                  {achievement.unlocked ? achievement.icon : <FaLock />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {achievement.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {achievement.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.min(achievement.progress, achievement.maxProgress)} / {achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {achievement.points} points
                    </span>
                    {achievement.unlocked ? (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <FaLock className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Daily Tasks Tab */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daily Tasks
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Resets in {Math.floor(Math.random() * 20 + 4)} hours
              </div>
            </div>

            <div className="space-y-4">
              {dailyTasks.map(task => (
                <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.completed ? <FaUnlock /> : task.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{task.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                      
                      {/* Progress */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{task.progress} / {task.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              task.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${(task.progress / task.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.reward.coins && (
                          <div className="flex items-center space-x-1">
                            <GiTwoCoins className="text-yellow-500" />
                            <span>{task.reward.coins}</span>
                          </div>
                        )}
                        {task.reward.experience && (
                          <div className="flex items-center space-x-1 mt-1">
                            <FaStar className="text-purple-500" />
                            <span>{task.reward.experience} XP</span>
                          </div>
                        )}
                      </div>
                      {task.completed && !task.claimed && (
                        <button
                          onClick={() => claimDailyReward(task.id)}
                          className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">

                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Global Leaderboard
          </h3>
          
          <div className="space-y-3">
            {leaderboard.map(player => (
              <div key={player.rank} className={`flex items-center space-x-4 p-4 rounded-lg ${
                player.username === 'YourUsername' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  player.rank === 1 ? 'bg-yellow-500 text-white' :
                  player.rank === 2 ? 'bg-gray-400 text-white' :
                  player.rank === 3 ? 'bg-orange-600 text-white' :
                  'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {player.rank}
                </div>
                
                <img 
                  src={player.avatar} 
                  alt={player.username}
                  className="w-10 h-10 rounded-full object-cover"  />
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {player.username}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Level {player.level}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {player.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}