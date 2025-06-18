import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// import CardList from "../components/cardlist.js";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function Leaderboard() {
  const [cards, setCards] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const [resData, resMeta] = await Promise.all([
          fetch('/data/leaderboard.json'),
          fetch('/data/leaderboard-meta.json'),
        ]);

        if (!resData.ok) throw new Error('Failed to fetch leaderboard data');
        if (!resMeta.ok) throw new Error('Failed to fetch leaderboard metadata');

        const data = await resData.json();
        const meta = await resMeta.json();

        // Sort by priceChange descending (hot first)
        data.sort((a, b) => (b.priceChange ?? 0) - (a.priceChange ?? 0));

        // Limit to top 200
        const topCards = data.slice(0, 200);

        setCards(topCards);
        setLastUpdated(meta.lastUpdated);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;
  if (error) return <p>Error loading leaderboard: {error}</p>;

  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pokémon Card Leaderboard</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </div>
        <Link 
          href="/trending"
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          View Trending
        </Link>
      </div>
      {/* <CardList cards={cards} /> */}
      <style jsx>{`
        .badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 0.375rem;
          color: white;
          user-select: none;
          animation-duration: 2s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .hot {
          background-color: #22c55e; /* Tailwind green-500 */
          box-shadow: 0 0 8px #22c55e;
          animation-name: pulse-green;
        }
        .cold {
          background-color: #ef4444; /* Tailwind red-500 */
          box-shadow: 0 0 8px #ef4444;
          animation-name: pulse-red;
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 8px #22c55e; }
          50% { box-shadow: 0 0 16px #22c55e; }
        }
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 8px #ef4444; }
          50% { box-shadow: 0 0 16px #ef4444; }
        }
      `}</style>
    </div>
  );
}































