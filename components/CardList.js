import React, { useState, useMemo } from "react";
import Image from 'next/image';

export default function CardList({
  cards = [],
  loading = false,
  error = null,
  initialSortOption = "price",
  onCardClick = () => {},
  getPrice = () => 0,
  getReleaseDate = () => "0000-00-00",
  getRarityRank = () => 0,
}) {
  // Local sort state
  const [sortOption, setSortOption] = useState(initialSortOption);

  // Sorting logic
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      if (sortOption === "price") {
        return getPrice(b) - getPrice(a);
      }
      if (sortOption === "releaseDate") {
        return (
          new Date(getReleaseDate(b)).getTime() -
          new Date(getReleaseDate(a)).getTime()
        );
      }
      if (sortOption === "rarity") {
        return getRarityRank(b) - getRarityRank(a);
      }
      return 0;
    });
  }, [cards, sortOption, getPrice, getReleaseDate, getRarityRank]);

  return (
    <div>
      {loading && <p className="text-center text-content-muted">Loading cards...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="flex justify-center mb-6">
        <label htmlFor="sort" className="mr-2 font-semibold">Sort by:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="price">Price</option>
          <option value="releaseDate">Release Date</option>
          <option value="rarity">Rarity</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-7 justify-center">
        {sortedCards.map((card) => (
          <div
            key={card.id}
            className="card card-padding-default flex flex-col items-center w-[260px] bg-card shadow-app-md rounded-app-lg border border-border cursor-zoom-in transition-transform duration-200 hover:scale-105 hover:shadow-xl animate-fadeIn"
            onClick={() => onCardClick(card)}
            title={`Click to zoom card: ${card.name}`}
            tabIndex={0}
            role="button"
            onKeyPress={e => { if (e.key === 'Enter') onCardClick(card); }}
          >
            <Image
              src={card.images?.large || '/placeholder.png'}
              alt={card.name}
              width={190}
              height={260}
              className="rounded-app-md mb-2 object-cover shadow"
              priority={false}
            />
            <h3 className="text-lg font-bold text-text-heading text-center mb-1">
              {card.name}
            </h3>
            <div className="text-content-default text-xs mb-1">
              <b>Set:</b> {card.set?.name || "N/A"}
            </div>
            <div className="text-content-default text-xs mb-1">
              <b>Rarity:</b> {card.rarity || "N/A"}
            </div>
            <div className="text-content-default text-xs mb-1">
              <b>Price:</b> {card.tcgplayer?.prices?.holofoil?.market
                ? `$${card.tcgplayer.prices.holofoil.market.toFixed(2)}`
                : card.tcgplayer?.prices?.normal?.market
                ? `$${card.tcgplayer.prices.normal.market.toFixed(2)}`
                : "N/A"}
            </div>
            <div className="text-content-default text-xs mb-1">
              <b>Number:</b> {card.number}
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && cards.length === 0 && (
        <p className="text-center text-content-muted mt-12">
          No cards found for this Pokémon.
        </p>
      )}
    </div>
  );
}
