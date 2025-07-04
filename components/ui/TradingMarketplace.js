import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaShoppingCart, FaDollarSign, FaEye, FaHeart, FaFilter, FaSort, FaShield, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import { BsCardList, BsSearch, BsGraphUp, BsStar, BsShieldCheck, BsChatDots } from 'react-icons/bs';
import { GiTwoCoins, GiDiamonds } from 'react-icons/gi';

export default function TradingMarketplace({ userId, onTradeRequest, onPurchase }) {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [listings, setListings] = useState([]);
  const [myTrades, setMyTrades] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    rarity: 'all',
    priceRange: [0, 1000],
    condition: 'all',
    tradeType: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  useEffect(() => {
    loadMarketplaceData();
  }, [filters, sortBy, searchTerm]);

  const loadMarketplaceData = () => {
    // Mock marketplace listings
    const mockListings = [
      {
        id: 'trade-1',
        type: 'sale',
        seller: {
          id: 'user1',
          username: 'CardMaster92',
          rating: 4.8,
          totalTrades: 147,
          verified: true,
          avatar: '/api/placeholder/40/40'
        },
        card: {
          id: 'base1-4',
          name: 'Charizard',
          set: 'Base Set',
          rarity: 'Rare Holo',
          image: '/api/placeholder/200/280',
          condition: 'Near Mint'
        },
        price: 1250.00,
        quantity: 1,
        description: 'First edition Base Set Charizard in excellent condition. Stored in protective sleeve since purchase.',
        images: ['/api/placeholder/400/560', '/api/placeholder/400/560'],
        listedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        views: 234,
        watchers: 17,
        featured: true,
        negotiable: true
      },
      {
        id: 'trade-2',
        type: 'trade',
        seller: {
          id: 'user2',
          username: 'CollectorPro',
          rating: 4.6,
          totalTrades: 89,
          verified: false,
          avatar: '/api/placeholder/40/40'
        },
        card: {
          id: 'sv04-245',
          name: 'Pikachu ex',
          set: 'Paldea Evolved',
          rarity: 'Ultra Rare',
          image: '/api/placeholder/200/280',
          condition: 'Mint'
        },
        wantedCards: ['Charizard ex', 'Blastoise VMAX'],
        quantity: 1,
        description: 'Looking to trade for competitive deck cards. Open to multiple card trades.',
        images: ['/api/placeholder/400/560'],
        listedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        views: 67,
        watchers: 8,
        featured: false,
        tradeCash: 50 // Additional cash they're willing to add
      },
      {
        id: 'trade-3',
        type: 'sale',
        seller: {
          id: 'user3',
          username: 'VintageCards',
          rating: 4.9,
          totalTrades: 203,
          verified: true,
          avatar: '/api/placeholder/40/40'
        },
        card: {
          id: 'base1-2',
          name: 'Blastoise',
          set: 'Base Set',
          rarity: 'Rare Holo',
          image: '/api/placeholder/200/280',
          condition: 'Light Play'
        },
        price: 450.00,
        quantity: 2,
        description: 'Two Blastoise cards available. Small edge wear but otherwise great condition.',
        images: ['/api/placeholder/400/560'],
        listedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        views: 156,
        watchers: 23,
        featured: false,
        negotiable: false
      },
      {
        id: 'trade-4',
        type: 'auction',
        seller: {
          id: 'user4',
          username: 'AuctionHouse',
          rating: 4.7,
          totalTrades: 76,
          verified: true,
          avatar: '/api/placeholder/40/40'
        },
        card: {
          id: 'sv04-198',
          name: 'Gardevoir ex',
          set: 'Paldea Evolved',
          rarity: 'Ultra Rare',
          image: '/api/placeholder/200/280',
          condition: 'Near Mint'
        },
        currentBid: 89.99,
        buyItNow: 125.00,
        bidders: 7,
        endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        quantity: 1,
        description: 'No reserve auction! Fresh from pack opening.',
        images: ['/api/placeholder/400/560'],
        listedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        views: 445,
        watchers: 34,
        featured: true
      }
    ];

    // Mock user's trades
    const mockMyTrades = [
      {
        id: 'my-trade-1',
        type: 'pending',
        otherUser: {
          username: 'TradingBuddy',
          avatar: '/api/placeholder/40/40',
          rating: 4.5
        },
        myCard: {
          name: 'Venusaur ex',
          image: '/api/placeholder/150/210'
        },
        theirCard: {
          name: 'Charizard VMAX',
          image: '/api/placeholder/150/210'
        },
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        messages: 3
      },
      {
        id: 'my-trade-2',
        type: 'completed',
        otherUser: {
          username: 'ProTrader',
          avatar: '/api/placeholder/40/40',
          rating: 4.8
        },
        myCard: {
          name: 'Blastoise VMAX',
          image: '/api/placeholder/150/210'
        },
        price: 87.50,
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    setListings(mockListings);
    setMyTrades(mockMyTrades);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatTimeRemaining = (date) => {
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs <= 0) return 'Ended';
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    return `${diffHours}h`;
  };

  const toggleWatchlist = (listingId) => {
    setWatchlist(prev => 
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleTradeRequest = (listing) => {
    setSelectedListing(listing);
    setShowTradeModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale': return <FaDollarSign className="text-green-500" />;
      case 'trade': return <FaExchangeAlt className="text-blue-500" />;
      case 'auction': return <BsGraphUp className="text-purple-500" />;
      default: return <BsCardList />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'declined': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const ListingCard = ({ listing }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 ${
      listing.featured ? 'ring-2 ring-yellow-400' : ''
    }`}>
      {listing.featured && (
        <div className="flex items-center space-x-1 mb-3">
          <BsStar className="text-yellow-500" />
          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Featured</span>
        </div>
      )}

      <div className="flex space-x-4">
        <div className="relative">
          <img
            src={listing.card.image}
            alt={listing.card.name}
            className="w-24 h-32 object-cover rounded-lg"  />
          <div className="absolute top-2 left-2">
            {getTypeIcon(listing.type)}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {listing.card.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {listing.card.set} • {listing.card.rarity}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Condition: {listing.card.condition}
              </p>
            </div>
            
            <button
              onClick={() => toggleWatchlist(listing.id)}
              className={`p-2 rounded-full transition-colors ${
                watchlist.includes(listing.id)
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <FaHeart className={watchlist.includes(listing.id) ? 'fill-current' : ''} />
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-3">
            <img
              src={listing.seller.avatar}
              alt={listing.seller.username}
              className="w-6 h-6 rounded-full"  />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {listing.seller.username}
            </span>
            {listing.seller.verified && (
              <BsShieldCheck className="text-blue-500" title="Verified seller" />
            )}
            <div className="flex items-center space-x-1">
              <BsStar className="text-yellow-500 w-3 h-3" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {listing.seller.rating} ({listing.seller.totalTrades})
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {listing.description}
          </p>

          {listing.type === 'sale' && (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${listing.price.toFixed(2)}
                </span>
                {listing.negotiable && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    (negotiable)
                  </span>
                )}
              </div>
              <button
                onClick={() => onPurchase?.(listing)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">

                Buy Now
              </button>
            </div>
          )}

          {listing.type === 'trade' && (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Wants: </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {listing.wantedCards?.join(', ')}
                </span>
                {listing.tradeCash && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    + ${listing.tradeCash} cash
                  </div>
                )}
              </div>
              <button
                onClick={() => handleTradeRequest(listing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

                Make Offer
              </button>
            </div>
          )}

          {listing.type === 'auction' && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${listing.currentBid.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {listing.bidders} bidders • {formatTimeRemaining(listing.endsAt)} left
                </div>
              </div>
              <div className="space-x-2">
                {listing.buyItNow && (
                  <button
                    onClick={() => onPurchase?.(listing, listing.buyItNow)}
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">

                    Buy ${listing.buyItNow}
                  </button>
                )}
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Place Bid
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FaEye />
                <span>{listing.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaHeart />
                <span>{listing.watchers}</span>
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Listed {formatTimeAgo(listing.listedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="trading-marketplace space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FaExchangeAlt className="mr-3" />
              Trading Marketplace
            </h2>
            <p className="text-green-100">Buy, sell, and trade Pokemon cards with the community</p>
          </div>
          <div className="text-right">
            <button className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              List a Card
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'marketplace', label: 'Marketplace', icon: <FaShoppingCart /> },
          { id: 'my-trades', label: 'My Trades', icon: <FaExchangeAlt /> },
          { id: 'watchlist', label: 'Watchlist', icon: <FaHeart /> },
          { id: 'sell', label: 'Sell Cards', icon: <FaDollarSign /> }
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

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div>
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cards..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Quick Filters */}
              <div className="flex space-x-2">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">

                  <option value="all">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="trade">For Trade</option>
                  <option value="auction">Auction</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">

                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="ending-soon">Ending Soon</option>
                  <option value="most-watched">Most Watched</option>
                </select>

                <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FaFilter className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="space-y-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* My Trades Tab */}
      {activeTab === 'my-trades' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Trade History
            </h3>
            
            <div className="space-y-4">
              {myTrades.map(trade => (
                <div key={trade.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={trade.otherUser.avatar}
                        alt={trade.otherUser.username}
                        className="w-8 h-8 rounded-full"  />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Trade with {trade.otherUser.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(trade.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trade.status)}`}>
                        {trade.status}
                      </span>
                      {trade.status === 'pending' && trade.messages > 0 && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <BsChatDots />
                          <span className="text-sm">{trade.messages}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <img
                        src={trade.myCard.image}
                        alt={trade.myCard.name}
                        className="w-20 h-28 object-cover rounded mx-auto mb-2"  />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Your: {trade.myCard.name}
                      </div>
                    </div>

                    <FaExchangeAlt className="text-gray-400" />

                    <div className="text-center">
                      {trade.theirCard ? (
                        <>
                          <img
                            src={trade.theirCard.image}
                            alt={trade.theirCard.name}
                            className="w-20 h-28 object-cover rounded mx-auto mb-2"  />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Their: {trade.theirCard.name}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-28 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center mx-auto mb-2">
                            <FaDollarSign className="text-green-600 text-2xl" />
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Cash: ${trade.price}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {trade.status === 'pending' && (
                    <div className="flex justify-center space-x-3 mt-4">
                      <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2">
                        <FaCheck />
                        <span>Accept</span>
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-2">
                        <FaTimes />
                        <span>Decline</span>
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2">
                        <BsChatDots />
                        <span>Message</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FaShield className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Safety First:</strong> Always use our secure escrow service for high-value trades. 
            Report any suspicious activity to our support team. Trade with verified users when possible.
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Make Trade Offer
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Offer
                  </label>
                  <textarea
                    placeholder="Describe what you're offering for this card..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTradeModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">

                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onTradeRequest?.(selectedListing);
                      setShowTradeModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

                    Send Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}