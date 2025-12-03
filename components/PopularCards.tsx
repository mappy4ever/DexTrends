import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface PopularCard {
  id: string;
  name: string;
  image?: string;
  set?: string;
  rarity?: string;
  priceChange?: number;
  interestScore?: number;
}

interface LeaderboardMeta {
  lastUpdated: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function getTrendBadge(priceChange?: number): React.ReactElement {
  if (!priceChange) return <span className="badge bg-stone-200 text-stone-700">Stable</span>;
  if (priceChange > 5) return <span className="hot badge">Hot</span>;
  if (priceChange < -5) return <span className="cold badge">Cold</span>;
  return <span className="badge bg-stone-200 text-stone-700">Stable</span>;
}

function getTrendArrow(priceChange?: number): React.ReactElement {
  if (!priceChange) return <span className="text-stone-400 font-bold ml-1">→</span>;
  if (priceChange > 0) return <span className="text-green-600 font-bold ml-1">▲</span>;
  if (priceChange < 0) return <span className="text-red-600 font-bold ml-1">▼</span>;
  return <span className="text-stone-400 font-bold ml-1">→</span>;
}

export default function PopularCards() {
  const [cards, setCards] = useState<PopularCard[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalCard, setModalCard] = useState<PopularCard | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const [resData, resMeta] = await Promise.all([
          fetch('/data/leaderboard.json'),
          fetch('/data/leaderboard-meta.json'),
        ]);
        if (!resData.ok) throw new Error('Failed to fetch leaderboard data');
        if (!resMeta.ok) throw new Error('Failed to fetch leaderboard metadata');
        const data: PopularCard[] = await resData.json();
        const meta: LeaderboardMeta = await resMeta.json();
        data.sort((a, b) => (b.priceChange ?? 0) - (a.priceChange ?? 0));
        const topCards = data.slice(0, 200);
        setCards(topCards);
        setLastUpdated(meta.lastUpdated);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) return <p className="text-center text-content-muted mt-12">Loading popular cards...</p>;
  if (error) return <p className="text-center text-red-500 mt-12">Error loading cards: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Popular Cards</h1>
      {lastUpdated && (
        <p className="text-sm text-stone-500 mb-6 text-center">
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}
      <div className="flex flex-col gap-3 max-w-2xl mx-auto">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className="flex items-center bg-white rounded-lg shadow p-3 hover:bg-stone-50 cursor-pointer border border-stone-200 transition"
            onClick={() => setModalCard(card)}
            tabIndex={0}
            role="button"
            aria-label={`View investment perspective for ${card.name}`}
          >
            <span className="text-lg font-bold w-8 text-center">{idx + 1}</span>
            <Image src={card.image || '/placeholder.png'} alt={card.name} width={50} height={70} className="rounded mr-3" />
            <div className="flex-1">
              <div className="font-semibold text-lg">{card.name}</div>
              <div className="text-xs text-stone-500">{card.set || 'Unknown Set'} • {card.rarity || 'N/A'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${card.priceChange && card.priceChange > 0 ? 'text-green-600' : card.priceChange && card.priceChange < 0 ? 'text-red-600' : 'text-stone-600'}`}>{card.priceChange ? card.priceChange.toFixed(2) : '0.00'}%</span>
              {getTrendArrow(card.priceChange)}
              {getTrendBadge(card.priceChange)}
              <span className="ml-2 text-xs text-stone-400">Interest: {card.interestScore ?? Math.floor(Math.random()*1000)}</span>
            </div>
          </div>
        ))}
      </div>
      {modalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setModalCard(null)}>
          <div
            className="bg-white dark:bg-stone-800 rounded-lg p-4 md:p-6 relative max-w-md w-full transform-gpu"
            style={{
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-stone-600 hover:text-black text-2xl font-bold"
              onClick={() => setModalCard(null)}
              aria-label="Close"
            >&times;</button>
            <Image src={modalCard.image || '/placeholder.png'} alt={modalCard.name} width={200} height={280} className="rounded mb-4 mx-auto" />
            <h2 className="text-xl font-bold mb-2 text-center">{modalCard.name}</h2>
            <div className="text-center text-sm mb-2">Set: {modalCard.set || 'Unknown Set'}</div>
            <div className="text-center text-sm mb-2">Rarity: {modalCard.rarity || 'N/A'}</div>
            <div className="text-center text-lg mb-2 font-semibold">{modalCard.priceChange ? modalCard.priceChange.toFixed(2) : '0.00'}% {getTrendArrow(modalCard.priceChange)} {getTrendBadge(modalCard.priceChange)}</div>
            <div className="text-center text-xs text-stone-500 mb-2">Interest Score: {modalCard.interestScore ?? Math.floor(Math.random()*1000)}</div>
            <div className="text-center text-xs text-stone-400">(Investment perspective coming soon!)</div>
          </div>
        </div>
      )}
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
          /* Tailwind green-500 */
          background-color: rgb(34 197 94);
          box-shadow: 0 0 8px rgb(34 197 94);
          animation-name: pulse-green;
        }
        .cold {
          /* Tailwind red-500 */
          background-color: rgb(239 68 68);
          box-shadow: 0 0 8px rgb(239 68 68);
          animation-name: pulse-red;
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 8px rgb(34 197 94); }
          50% { box-shadow: 0 0 16px rgb(34 197 94); }
        }
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 8px rgb(239 68 68); }
          50% { box-shadow: 0 0 16px rgb(239 68 68); }
        }
      `}</style>
    </div>
  );
}