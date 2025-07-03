import React, { useState } from "react";
import Link from "next/link";

export default function IndexPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 pt-24 pb-16 gradient-bg">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-6">
          <div className="w-20 h-20 mr-4 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            P
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
            DexTrends
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl">
          Track Pokémon TCG card prices, explore collections, and discover trending cards in real-time
        </p>
      </div>

      {/* Feature Cards */}
      <div className="w-full max-w-6xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">🎯 Smart Collection Management</h3>
          <p className="text-gray-600 mb-6">Track your card values, set price alerts, and get insights into market trends with our advanced collection tools.</p>
          <Link href="/collections">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Manage Collection
            </button>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border border-purple-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">⚡ Pocket Mode Experience</h3>
          <p className="text-gray-600 mb-6">Dive into the mobile-optimized TCG format with exclusive cards, quick battles, and streamlined rules.</p>
          <Link href="/pocketmode">
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Explore Pocket
            </button>
          </Link>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8 w-full max-w-3xl">
        <div className="relative flex-1 w-full md:max-w-lg">
          <input
            type="text"
            className="w-full px-6 py-4 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for Pokémon cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-lg hover:scale-105 transition-all duration-300"
        >
          Search
        </button>
        <button
          type="button"
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 text-lg font-semibold rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          Advanced
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">Searching cards...</span>
        </div>
      )}

      {/* Navigation Links */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
        <Link href="/trending" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
          <div className="text-2xl mb-2">📈</div>
          <h3 className="font-semibold text-lg mb-1">Trending</h3>
          <p className="text-sm text-gray-600">Hot cards right now</p>
        </Link>
        
        <Link href="/leaderboard" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="font-semibold text-lg mb-1">Leaderboard</h3>
          <p className="text-sm text-gray-600">Top valuable cards</p>
        </Link>
        
        <Link href="/tcgsets" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
          <div className="text-2xl mb-2">📦</div>
          <h3 className="font-semibold text-lg mb-1">TCG Sets</h3>
          <p className="text-sm text-gray-600">Browse by set</p>
        </Link>
        
        <Link href="/pokedex" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
          <div className="text-2xl mb-2">📚</div>
          <h3 className="font-semibold text-lg mb-1">Pokédex</h3>
          <p className="text-sm text-gray-600">Explore Pokémon</p>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-8">Your Pokemon Card Universe</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-500 mb-2">10,000+</div>
            <div className="text-gray-600">Cards Tracked</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-500 mb-2">Real-time</div>
            <div className="text-gray-600">Price Updates</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-500 mb-2">500+</div>
            <div className="text-gray-600">Sets Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}