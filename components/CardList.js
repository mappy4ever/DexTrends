import React, { useState, useMemo, forwardRef } from "react";
import PropTypes from "prop-types";
import Image from 'next/image';
import LoadingSpinner from "./ui/LoadingSpinner";

// Rarity badge color map
const rarityColors = {
  Rare: "bg-yellow-400 text-yellow-900",
  Uncommon: "bg-gray-300 text-gray-700",
  Common: "bg-green-300 text-green-900",
  "Ultra Rare": "bg-purple-400 text-purple-900",
  "Secret Rare": "bg-pink-400 text-pink-900",
  default: "bg-gray-200 text-gray-700"
};

// Simple Modal for zoom
function ImageModal({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 relative" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >&times;</button>
        <Image src={src} alt={alt} width={400} height={550} className="rounded-lg" />
      </div>
    </div>
  );
}

const CardList = forwardRef(function CardList({
  cards = [],
  loading = false,
  error = null,
  initialSortOption = "price",
  onCardClick = () => {},
  getPrice = () => 0,
  getReleaseDate = () => "0000-00-00",
  getRarityRank = () => 0,
  title = null,
  subtitle = null,
  showSearch = true,
  searchPlaceholder = "Search cards...",
  containerClassName = "",
}, ref) {
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [zoomImg, setZoomImg] = useState(null);
  const [search, setSearch] = useState("");

  const filteredCards = useMemo(() => {
    if (!search) return cards;
    return cards.filter(card =>
      card.name?.toLowerCase().includes(search.toLowerCase()) ||
      card.set?.name?.toLowerCase().includes(search.toLowerCase()) ||
      card.rarity?.toLowerCase().includes(search.toLowerCase())
    );
  }, [cards, search]);

  const sortedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
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
  }, [filteredCards, sortOption, getPrice, getReleaseDate, getRarityRank]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto px-2 sm:px-4 ${containerClassName}`}>
      {/* Universal Card Section Header */}
      {(title || subtitle || showSearch) && (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 mt-2">
          <div className="flex-1 text-center md:text-left">
            {title && <h1 className="text-2xl md:text-3xl font-bold capitalize mb-1 text-center md:text-left drop-shadow-lg">{title}</h1>}
            {subtitle && <div className="text-content-muted text-base mb-1">{subtitle}</div>}
          </div>
          {showSearch && (
            <div className="flex items-center justify-center md:justify-end w-full md:w-auto">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="input w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary bg-white/80 shadow"
                aria-label="Search cards"
              />
            </div>
          )}
        </div>
      )}
      {error && <p className="text-center text-red-500" role="alert">{error}</p>}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <label htmlFor="sort" className="mr-2 font-semibold">Sort by:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1"
          aria-label="Sort cards by"
        >
          <option value="price">Price</option>
          <option value="releaseDate">Release Date</option>
          <option value="rarity">Rarity</option>
        </select>
      </div>
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-7">
          {sortedCards.map((card) => {
            const rarityClass = rarityColors[card.rarity] || rarityColors.default;
            return (
              <div
                key={card.id}
                className="card card-hover group flex flex-col items-center bg-card shadow-app-md rounded-app-lg border border-border cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-xl animate-fadeIn p-3 relative"
                tabIndex={0}
                role="button"
                aria-label={`View details for ${card.name}`}
                onClick={() => onCardClick(card)}
                style={{ minHeight: 320 }}
              >
                {/* Zoom Button */}
                <button
                  className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100"
                  onClick={e => { e.stopPropagation(); setZoomImg(card.images?.large); }}
                  aria-label={`Zoom image for ${card.name}`}
                  tabIndex={0}
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <Image
                  src={card.images?.large || '/placeholder.png'}
                  alt={card.name}
                  width={190}
                  height={260}
                  className="rounded-app-md mb-2 object-cover shadow transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                  priority={false}
                  loading="lazy"
                />
                <h3 className="text-lg font-bold text-text-heading text-center mb-1 transition-colors duration-200 group-hover:text-primary">
                  {card.name}
                </h3>
                <div className="text-content-default text-xs mb-1">
                  <b>Set:</b> {card.set?.name || "N/A"}
                </div>
                <div className="text-content-default text-xs mb-1 flex items-center gap-2">
                  <b>Rarity:</b>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rarityClass}`}>
                    {card.rarity || "N/A"}
                  </span>
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
            );
          })}
        </div>
      </div>
      {zoomImg && (
        <ImageModal
          src={zoomImg}
          alt="Zoomed Pokémon card"
          onClose={() => setZoomImg(null)}
        />
      )}
      {!loading && !error && cards.length === 0 && (
        <p className="text-center text-content-muted mt-12">
          No cards found for this Pokémon.
        </p>
      )}
    </div>
  );
});

CardList.displayName = "CardList";
CardList.propTypes = {
  cards: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  initialSortOption: PropTypes.string,
  onCardClick: PropTypes.func,
  getPrice: PropTypes.func,
  getReleaseDate: PropTypes.func,
  getRarityRank: PropTypes.func,
};

export default CardList;