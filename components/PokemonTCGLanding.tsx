import React from 'react';
import Link from 'next/link';
import { BsCardList, BsHeart, BsBarChart } from 'react-icons/bs';
import { FiTrendingUp, FiShoppingBag } from 'react-icons/fi';

interface Feature {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const PokemonTCGLanding: React.FC = () => {
  const features: Feature[] = [
    {
      href: '/tcgexpansions',
      title: 'Browse Sets',
      description: 'Explore all Pokémon TCG sets with detailed information, card lists, and artwork.',
      icon: <BsCardList className="w-8 h-8" />,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      href: '/trending',
      title: 'Price Tracker',
      description: 'Track card prices, market trends, and investment opportunities.',
      icon: <FiTrendingUp className="w-8 h-8" />,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      href: '/collections',
      title: 'My Collection',
      description: 'Manage your personal card collection and track its value.',
      icon: <BsHeart className="w-8 h-8" />,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-pokemon font-black text-gray-900 dark:text-white mb-6">
            Pokémon TCG Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Your complete destination for Pokémon Trading Card Game collections, prices, and trends. 
            Discover, track, and manage everything TCG in one beautiful platform.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600 dark:text-gray-400">TCG Sets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">Live</div>
              <div className="text-gray-600 dark:text-gray-400">Price Tracking</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">Smart</div>
              <div className="text-gray-600 dark:text-gray-400">Collections</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <div className={`${feature.color} ${feature.hoverColor} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  Explore <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            What's New in TCG
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                📈 Trending Cards
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with the hottest cards in the market. Track price movements, 
                identify investment opportunities, and never miss a trend.
              </p>
              <Link href="/trending">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  View Trends
                </button>
              </Link>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                🎯 Smart Collection Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Organize your collection like never before. Track values, set alerts, 
                and get insights into your portfolio's performance.
              </p>
              <Link href="/collections">
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Manage Collection
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of collectors and traders in the ultimate TCG experience.
          </p>
          <Link href="/tcgexpansions">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Explore All Sets
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PokemonTCGLanding;