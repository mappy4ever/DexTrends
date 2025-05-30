import React, { useEffect, useState } from 'react';

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Pokémon Card Leaderboard</h1>
      {lastUpdated && (
        <p className="text-sm text-gray-500 mb-6">
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Card</th>
            <th className="border border-gray-300 px-4 py-2">Price (USD)</th>
            <th className="border border-gray-300 px-4 py-2">Change (%)</th>
          </tr>
        </thead>
        <tbody>
          {cards.map(card => (
            <tr key={card.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2 flex items-center space-x-4">
                <img src={card.image} alt={card.name} className="w-16 h-22 object-contain rounded" />
                <span className="flex items-center space-x-2">
                  <span>{card.name}</span>
                  {card.priceChange > 5 && (
                    <span className="badge hot">🔥 Hot</span>
                  )}
                  {card.priceChange < -5 && (
                    <span className="badge cold">❄️ Cold</span>
                  )}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2">${card.price?.toFixed(2) ?? 'N/A'}</td>
              <td className={`border border-gray-300 px-4 py-2 font-semibold ${
                card.priceChange > 0 ? 'text-green-600' : card.priceChange < 0 ? 'text-red-600' : ''
              }`}>
                {card.priceChange !== null ? card.priceChange.toFixed(2) + '%' : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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































