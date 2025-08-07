import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaUsers, FaHeart, FaComment, FaShare, FaTrophy, FaEye, FaPlus, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { BsCardList, BsGrid3X3Gap, BsChat, BsStar, BsFire } from 'react-icons/bs';
import { supabase } from '../../lib/supabase';

// Type definitions
interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  title: string;
  followers: number;
  following: number;
  totalCards: number;
  favoriteSet: string;
  joinedDate: string;
  isFollowing: boolean;
  bio: string;
}

interface UserProfile extends User {
  stats: {
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
  };
}

interface PostUser {
  id: string;
  username: string;
  avatar: string;
  verified: boolean;
  title: string;
}

interface CardData {
  id: string;
  name: string;
  set: string;
  rarity: string;
}

interface Post {
  id: string;
  user: PostUser;
  content: string;
  images?: string[];
  cardData?: CardData;
  videoUrl?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  type: 'card_pull' | 'collection_milestone' | 'deck_showcase';
}

interface SocialPlatformProps {
  currentUserId?: string | null;
}

const SocialPlatform: React.FC<SocialPlatformProps> = ({ currentUserId = null }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'leaderboard'>('feed');
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, [currentUserId]);

  const loadSocialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadFeedPosts(),
        loadUsers(),
        loadUserProfile(),
        loadFollowing()
      ]);
    } catch (error) {
      logger.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedPosts = async () => {
    // Mock social feed data
    const mockPosts: Post[] = [
      {
        id: '1',
        user: {
          id: 'user1',
          username: 'PokeMaster92',
          avatar: '/api/placeholder/40/40',
          verified: true,
          title: 'Elite Trainer'
        },
        content: 'Just pulled this amazing Charizard VMAX from a booster pack! The artwork is incredible 🔥',
        images: ['/api/placeholder/300/400'],
        cardData: {
          id: 'swsh04-74',
          name: 'Charizard VMAX',
          set: 'Vivid Voltage',
          rarity: 'Rare Holo VMAX'
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        likes: 47,
        comments: 12,
        shares: 8,
        isLiked: false,
        type: 'card_pull'
      },
      {
        id: '2',
        user: {
          id: 'user2',
          username: 'CollectorAce',
          avatar: '/api/placeholder/40/40',
          verified: false,
          title: 'Card Collector'
        },
        content: 'Completed my Base Set collection today! 102/102 cards. What should I collect next?',
        images: ['/api/placeholder/400/300'],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        likes: 89,
        comments: 24,
        shares: 15,
        isLiked: true,
        type: 'collection_milestone'
      },
      {
        id: '3',
        user: {
          id: 'user3',
          username: 'MetaGamer',
          avatar: '/api/placeholder/40/40',
          verified: true,
          title: 'Tournament Player'
        },
        content: 'New deck tech video is live! This budget Pikachu VMAX deck has been crushing locals 💪',
        images: [],
        videoUrl: '/api/placeholder/video',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        likes: 156,
        comments: 43,
        shares: 67,
        isLiked: false,
        type: 'deck_showcase'
      }
    ];

    setFeedPosts(mockPosts);
  };

  const loadUsers = async () => {
    // Mock user data
    const mockUsers: User[] = [
      {
        id: 'user1',
        username: 'PokeMaster92',
        displayName: 'Alex Chen',
        avatar: '/api/placeholder/80/80',
        verified: true,
        title: 'Elite Trainer',
        followers: 1547,
        following: 234,
        totalCards: 2847,
        favoriteSet: 'Base Set',
        joinedDate: '2021-03-15',
        isFollowing: false,
        bio: 'Competitive player and collector. Love vintage cards and new meta decks!'
      },
      {
        id: 'user2',
        username: 'CollectorAce',
        displayName: 'Sarah Johnson',
        avatar: '/api/placeholder/80/80',
        verified: false,
        title: 'Card Collector',
        followers: 892,
        following: 156,
        totalCards: 1924,
        favoriteSet: 'Neo Genesis',
        joinedDate: '2020-11-08',
        isFollowing: true,
        bio: 'Completing every set one pack at a time ✨'
      },
      {
        id: 'user3',
        username: 'MetaGamer',
        displayName: 'Mike Rodriguez',
        avatar: '/api/placeholder/80/80',
        verified: true,
        title: 'Tournament Player',
        followers: 3421,
        following: 89,
        totalCards: 986,
        favoriteSet: 'Sword & Shield',
        joinedDate: '2019-07-22',
        isFollowing: false,
        bio: 'Professional TCG player. Top 8 at Worlds 2023!'
      }
    ];

    setUsers(mockUsers);
  };

  const loadUserProfile = async () => {
    if (!currentUserId) return;

    // Mock current user profile
    const mockProfile: UserProfile = {
      id: currentUserId,
      username: 'YourUsername',
      displayName: 'Your Name',
      avatar: '/api/placeholder/80/80',
      verified: false,
      title: 'Trainer',
      followers: 45,
      following: 67,
      totalCards: 234,
      favoriteSet: 'Evolutions',
      joinedDate: '2023-01-15',
      bio: 'New to collecting but loving every moment!',
      isFollowing: false,
      stats: {
        postsCount: 12,
        likesReceived: 89,
        commentsReceived: 34
      }
    };

    setUserProfile(mockProfile);
  };

  const loadFollowing = async () => {
    // Mock following list
    setFollowing(['user2']);
  };

  const handleLike = async (postId: string) => {
    setFeedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const handleFollow = async (userId: string) => {
    const isCurrentlyFollowing = following.includes(userId);
    
    if (isCurrentlyFollowing) {
      setFollowing(prev => prev.filter(id => id !== userId));
    } else {
      setFollowing(prev => [...prev, userId]);
    }

    // Update user's follower count
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            followers: isCurrentlyFollowing ? user.followers - 1 : user.followers + 1,
            isFollowing: !isCurrentlyFollowing
          }
        : user
    ));
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const PostCard: React.FC<{ post: Post }> = ({ post }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-center space-x-3 mb-4">
        <img 
          src={post.user.avatar} 
          alt={post.user.username}
          className="w-10 h-10 rounded-full object-cover"  />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {post.user.username}
            </span>
            {post.user.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.user.title}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimeAgo(post.timestamp)}
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs ${
          post.type === 'card_pull' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
          post.type === 'collection_milestone' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          {post.type.replace('_', ' ')}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-white">{post.content}</p>
      </div>

      {/* Post Images/Media */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {post.images.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt="Post image"
                className="rounded-lg object-cover max-h-80 w-full"  />
            ))}
          </div>
        </div>
      )}

      {/* Card Data */}
      {post.cardData && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
          <div className="flex items-center space-x-2">
            <BsCardList className="text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-white">
              {post.cardData.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              • {post.cardData.set}
            </span>
            <span className="text-sm text-purple-600 dark:text-purple-400">
              {post.cardData.rarity}
            </span>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => handleLike(post.id)}
            className={`flex items-center space-x-2 transition-colors ${
              post.isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
            }`}
          >
            <FaHeart className={post.isLiked ? 'fill-current' : ''} />
            <span>{post.likes}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
            <FaComment />
            <span>{post.comments}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
            <FaShare />
            <span>{post.shares}</span>
          </button>
        </div>

        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <FaEye />
        </button>
      </div>
    </div>
  );

  const UserCard: React.FC<{ user: User }> = ({ user }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start space-x-4">
        <img 
          src={user.avatar} 
          alt={user.username}
          className="w-16 h-16 rounded-full object-cover"  />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user.displayName}
            </h3>
            {user.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            @{user.username} • {user.title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {user.bio}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span><strong>{user.followers}</strong> followers</span>
            <span><strong>{user.following}</strong> following</span>
            <span><strong>{user.totalCards}</strong> cards</span>
          </div>

          <button 
            onClick={() => handleFollow(user.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              following.includes(user.id)
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {following.includes(user.id) ? (
              <>
                <FaUserMinus className="inline mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <FaUserPlus className="inline mr-2" />
                Follow
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="social-platform max-w-4xl mx-auto">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'feed'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BsFire className="inline mr-2" />
          Feed
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FaUsers className="inline mr-2" />
          Discover
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FaTrophy className="inline mr-2" />
          Leaderboard
        </button>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div>
          {/* Create Post */}
          {currentUserId && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex space-x-3">
                <img 
                  src={userProfile?.avatar || '/api/placeholder/40/40'} 
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover"  />
                <div className="flex-1">
                  <textarea 
                    placeholder="Share your latest card pull, collection update, or deck tech..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <BsCardList title="Add card" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-green-500 transition-colors">
                        <BsGrid3X3Gap title="Add image" />
                      </button>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feed Posts */}
          {feedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Discover Trainers
            </h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                Suggested
              </button>
              <button className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-sm">
                All Users
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {users.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Community Leaderboards
          </h2>

          <div className="grid gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaTrophy className="text-yellow-500 mr-2" />
                Top Collectors This Month
              </h3>
              <div className="space-y-3">
                {users
                  .sort((a, b) => b.totalCards - a.totalCards)
                  .slice(0, 5)
                  .map((user, index) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"  />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.totalCards} cards
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BsStar className="text-purple-500 mr-2" />
                Most Popular Posts
              </h3>
              <div className="space-y-3">
                {feedPosts
                  .sort((a, b) => b.likes - a.likes)
                  .slice(0, 3)
                  .map((post, index) => (
                    <div key={post.id} className="flex items-start space-x-3">
                      <div className="text-lg font-bold text-purple-500">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {post.content}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          by @{post.user.username} • {post.likes} likes
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPlatform;