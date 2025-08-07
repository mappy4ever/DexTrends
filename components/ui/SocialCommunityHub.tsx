import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaUsers, FaComments, FaTrophy, FaHeart, FaShare, FaStar, FaFire, FaCrown } from 'react-icons/fa';
import { BsChatDots, BsHeart, BsShare, BsBookmark, BsThreeDots } from 'react-icons/bs';

// Types
interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  badges?: string[];
}

interface Card {
  id: string;
  name: string;
  image: string;
}

interface Deck {
  name: string;
  cards: number;
  keyCards: string[];
}

interface Post {
  id: string;
  user: User;
  type: 'collection_update' | 'price_alert' | 'deck_share';
  content: string;
  image?: string;
  card?: Card;
  deck?: Deck;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    username: string;
    avatar: string;
    level: number;
  };
  score: number;
  badge: string;
  change: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  reward: string;
  rarity: 'common' | 'rare' | 'legendary';
}

interface CommunityStats {
  totalUsers: number;
  activeUsers: number;
  postsToday: number;
  cardsShared: number;
  totalInteractions: number;
}

interface UserProfile {
  username: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  collectionsShared: number;
  helpfulVotes: number;
  reputation: number;
}

interface SocialData {
  posts: Post[];
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
  communityStats: CommunityStats;
  userProfile: UserProfile;
}

type TabId = 'feed' | 'leaderboard' | 'achievements' | 'stats';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const SocialCommunityHub: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const [socialData, setSocialData] = useState<SocialData>({
    posts: [],
    leaderboard: [],
    achievements: [],
    communityStats: {
      totalUsers: 0,
      activeUsers: 0,
      postsToday: 0,
      cardsShared: 0,
      totalInteractions: 0
    },
    userProfile: {
      username: '',
      level: 0,
      xp: 0,
      nextLevelXp: 0,
      collectionsShared: 0,
      helpfulVotes: 0,
      reputation: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setLoading(true);
    try {
      // Mock social data - replace with real API calls
      const mockData: SocialData = {
        posts: [
          {
            id: 'post-1',
            user: {
              id: 'user-1',
              username: 'CardMaster2024',
              avatar: '/back-card.png',
              level: 42,
              badges: ['expert', 'collector']
            },
            type: 'collection_update',
            content: 'Just completed my Base Set collection! 🎉',
            image: '/back-card.png',
            card: {
              id: 'base1-4',
              name: 'Charizard',
              image: '/back-card.png'
            },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            likes: 24,
            comments: 8,
            shares: 3,
            isLiked: false,
            isBookmarked: false
          },
          {
            id: 'post-2',
            user: {
              id: 'user-2',
              username: 'PokéTrader',
              avatar: '/back-card.png',
              level: 38,
              badges: ['trader', 'friendly']
            },
            type: 'price_alert',
            content: 'Charizard ex prices are dropping! Great time to buy 📈',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            likes: 15,
            comments: 12,
            shares: 7,
            isLiked: true,
            isBookmarked: false
          },
          {
            id: 'post-3',
            user: {
              id: 'user-3',
              username: 'DeckBuilder',
              avatar: '/back-card.png',
              level: 35,
              badges: ['strategist']
            },
            type: 'deck_share',
            content: 'Check out my new Charizard deck build! Perfect for the current meta.',
            deck: {
              name: 'Fire Storm',
              cards: 60,
              keyCards: ['Charizard ex', 'Professor Oak', 'Fire Energy']
            },
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            likes: 31,
            comments: 18,
            shares: 12,
            isLiked: false,
            isBookmarked: true
          }
        ],
        leaderboard: [
          {
            rank: 1,
            user: {
              username: 'ChampionCollector',
              avatar: '/back-card.png',
              level: 85
            },
            score: 15420,
            badge: 'crown',
            change: 0
          },
          {
            rank: 2,
            user: {
              username: 'MasterTrainer',
              avatar: '/back-card.png',
              level: 78
            },
            score: 14890,
            badge: 'gold',
            change: 1
          },
          {
            rank: 3,
            user: {
              username: 'CardSage',
              avatar: '/back-card.png',
              level: 72
            },
            score: 14235,
            badge: 'silver',
            change: -1
          }
        ],
        achievements: [
          {
            id: 'first_hundred',
            name: 'Century Club',
            description: 'Collect 100 unique cards',
            icon: '💯',
            progress: 85,
            maxProgress: 100,
            reward: '500 XP',
            rarity: 'common'
          },
          {
            id: 'speed_collector',
            name: 'Speed Collector',
            description: 'Add 10 cards to favorites in one day',
            icon: '⚡',
            progress: 7,
            maxProgress: 10,
            reward: '250 XP + Speed Badge',
            rarity: 'rare'
          },
          {
            id: 'price_prophet',
            name: 'Price Prophet',
            description: 'Successfully predict 5 price movements',
            icon: '🔮',
            progress: 2,
            maxProgress: 5,
            reward: '750 XP + Oracle Badge',
            rarity: 'legendary'
          }
        ],
        communityStats: {
          totalUsers: 42847,
          activeUsers: 8964,
          postsToday: 234,
          cardsShared: 15672,
          totalInteractions: 98754
        },
        userProfile: {
          username: 'CurrentUser',
          level: 25,
          xp: 8450,
          nextLevelXp: 10000,
          collectionsShared: 12,
          helpfulVotes: 89,
          reputation: 432
        }
      };

      setSocialData(mockData);
    } catch (error) {
      logger.error('Failed to load social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    setSocialData(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    }));
  };

  const handleBookmark = async (postId: string) => {
    setSocialData(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    }));
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.user.username} shared on DexTrends`,
          text: post.content,
          url: `${window.location.origin}${router.asPath}`
        });
      } catch (error) {
        logger.debug('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}${router.asPath}`);
      // Show notification
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getRankIcon = (rank: number): React.ReactNode => {
    switch (rank) {
      case 1: return <FaCrown className="text-yellow-500" />;
      case 2: return <FaTrophy className="text-gray-400" />;
      case 3: return <FaTrophy className="text-orange-600" />;
      default: return null;
    }
  };

  const getAchievementColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'legendary': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'rare': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'common': return 'border-gray-300 bg-gray-50 dark:bg-gray-700/50';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-700/50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs: Tab[] = [
    { id: 'feed', label: 'Community Feed', icon: <BsChatDots /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
    { id: 'achievements', label: 'Achievements', icon: <FaStar /> },
    { id: 'stats', label: 'Community Stats', icon: <FaFire /> }
  ];

  return (
    <div className="social-community-hub space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FaUsers className="mr-3" />
              Community Hub
            </h2>
            <p className="text-blue-100">Connect with fellow trainers and collectors</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{socialData.communityStats.activeUsers.toLocaleString()}</div>
            <div className="text-sm text-blue-200">Active Trainers</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => (
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

      {/* Community Feed */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {socialData.posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Post Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.user.avatar}
                        alt={post.user.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {post.user.username}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                            Lv.{post.user.level}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(post.timestamp)}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                      <BsThreeDots className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-800 dark:text-gray-200 mb-3">{post.content}</p>
                    
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post image"
                        className="w-full max-w-md rounded-lg"
                      />
                    )}
                    
                    {post.card && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <img
                          src={post.card.image}
                          alt={post.card.name}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{post.card.name}</div>
                          <div className="text-sm text-gray-500">Featured Card</div>
                        </div>
                      </div>
                    )}
                    
                    {post.deck && (
                      <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">{post.deck.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {post.deck.cards} cards • Key: {post.deck.keyCards.join(', ')}
                        </div>
                        <button className="text-sm text-orange-600 dark:text-orange-400 font-medium hover:text-orange-800">
                          View Deck →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 ${
                          post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <BsHeart className={post.isLiked ? 'fill-current' : ''} />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                        <BsChatDots />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare(post)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
                      >
                        <BsShare />
                        <span className="text-sm">{post.shares}</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`${
                        post.isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
                      }`}
                    >
                      <BsBookmark className={post.isBookmarked ? 'fill-current' : ''} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Widget */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level {socialData.userProfile.level}</span>
                    <span>{socialData.userProfile.xp}/{socialData.userProfile.nextLevelXp} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(socialData.userProfile.xp / socialData.userProfile.nextLevelXp) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {socialData.userProfile.collectionsShared}
                    </div>
                    <div className="text-xs text-gray-500">Collections</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {socialData.userProfile.reputation}
                    </div>
                    <div className="text-xs text-gray-500">Reputation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Trending Topics</h3>
              <div className="space-y-3">
                {['Charizard ex prices', 'Base Set collecting', 'New tournament meta', 'Rare card finds'].map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                    <span className="text-xs text-gray-500">{Math.floor(Math.random() * 100)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Collectors</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">This month's leaderboard</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {socialData.leaderboard.map((entry) => (
              <div key={entry.rank} className="p-6 flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                  </div>
                  <img
                    src={entry.user.avatar}
                    alt={entry.user.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {entry.user.username}
                    </div>
                    <div className="text-sm text-gray-500">Level {entry.user.level}</div>
                  </div>
                </div>
                <div className="flex-1"></div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
                {entry.change !== 0 && (
                  <div className={`text-sm ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.change > 0 ? '↑' : '↓'} {Math.abs(entry.change)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialData.achievements.map((achievement) => (
            <div key={achievement.id} className={`rounded-lg shadow-md border-2 p-6 ${getAchievementColor(achievement.rarity)}`}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">Reward:</span> {achievement.reward}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Stats */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 text-center">
            <FaUsers className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {socialData.communityStats.totalUsers.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Members</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 text-center">
            <FaComments className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {socialData.communityStats.postsToday}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Posts Today</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 text-center">
            <FaShare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {socialData.communityStats.cardsShared.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Cards Shared</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialCommunityHub;