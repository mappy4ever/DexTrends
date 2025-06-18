import React, { useState, useMemo } from "react";
import Image from 'next/image';
import Link from 'next/link';
import Modal from "./ui/Modal";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { InlineLoadingSpinner } from "./ui/LoadingSpinner";

export default function CardList({
  cards = [],
  loading = false,
  error = null,
  initialSortOption = "price",
  onCardClick = () => {},
  onRarityClick,
  getPrice = () => 0,
  getReleaseDate = () => "0000-00-00",
  getRarityRank = () => 0,
}) {
  // Local sort state
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [zoomedCard, setZoomedCard] = useState(null);

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

  // Infinite scroll for cards
  const { visibleItems: visibleCards, hasMore, isLoading: scrollLoading } = useInfiniteScroll(
    sortedCards, 
    24, // Initial visible count
    12  // Load 12 more at a time
  );

  return (
    <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 transition-all duration-300 animate-fadeIn">
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

      {/* Card grid: always one big flex-wrap, not split by anything else */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-5 md:gap-7 justify-center">
        {visibleCards.map((card) => {
          const setLogo = card.set?.images?.logo;
          const setId = card.set?.id;
          const setName = card.set?.name;
          const setRelease = card.set?.releaseDate ? new Date(card.set.releaseDate).getFullYear() : null;
          const pokemonName = card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0 ? card.name.split(' ')[0] : card.name;
          const rarity = card.rarity || "N/A";
          // Official TCG rarity short forms and colors
          const rarityMap = {
            'Common': { label: 'C', color: 'bg-gray-200 border border-gray-400 text-gray-700' },
            'Uncommon': { label: 'U', color: 'bg-green-200 border border-green-500 text-green-900' },
            'Rare': { label: 'R', color: 'bg-yellow-200 border border-yellow-500 text-yellow-900' },
            'Rare Holo': { label: 'RH', color: 'bg-blue-100 border border-blue-400 text-blue-900' },
            'Rare Holo GX': { label: 'GX', color: 'bg-blue-200 border border-blue-700 text-blue-900' },
            'Rare Holo EX': { label: 'EX', color: 'bg-blue-50 border border-blue-400 text-blue-900' },
            'Rare Holo V': { label: 'V', color: 'bg-red-100 border border-red-400 text-red-800' },
            'Rare Holo VMAX': { label: 'VMAX', color: 'bg-red-200 border border-red-600 text-red-900' },
            'Rare Ultra': { label: 'UR', color: 'bg-purple-200 border border-purple-600 text-purple-900' },
            'Rare Secret': { label: 'SR', color: 'bg-pink-100 border border-pink-400 text-pink-800' },
            'Rare Rainbow': { label: 'RR', color: 'bg-gradient-to-r from-pink-100 via-yellow-100 to-blue-100 border border-gray-300 text-gray-800' },
            'Rare Full Art': { label: 'FA', color: 'bg-indigo-100 border border-indigo-400 text-indigo-900' },
            'Rare Prism Star': { label: 'PR', color: 'bg-black border border-yellow-300 text-yellow-200' },
            'Promo': { label: 'PR', color: 'bg-orange-100 border border-orange-400 text-orange-900' },
            'Illustration Rare': { label: 'IR', color: 'bg-amber-100 border border-amber-400 text-amber-900' },
            'Special Illustration Rare': { label: 'SIR', color: 'bg-fuchsia-100 border border-fuchsia-400 text-fuchsia-900' },
            'Double Rare': { label: 'RR', color: 'bg-yellow-300 border border-yellow-600 text-yellow-900' },
            'Hyper Rare': { label: 'HR', color: 'bg-cyan-100 border border-cyan-400 text-cyan-900' },
            'Shiny Rare': { label: 'ShR', color: 'bg-sky-100 border border-sky-400 text-sky-900' },
            'Trainer Gallery Rare': { label: 'TG', color: 'bg-rose-100 border border-rose-400 text-rose-900' },
            'Radiant Rare': { label: 'Rad', color: 'bg-lime-100 border border-lime-400 text-lime-900' },
          };
          const rarityTag = rarityMap[rarity] || { label: '?', color: 'bg-gray-100 border border-gray-300 text-gray-400' };

          // Use getPrice prop for price display
          const currentPrice = getPrice(card); // getPrice already formats it as string "$X.XX" or "N/A"
          const priceDisplay = currentPrice !== 'N/A'
            ? (
                <span className="inline-block text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 tracking-tight">
                  {currentPrice}
                </span>
              )
            : (
                <span className="inline-block text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                  N/A
                </span>
              );

          const handleRarityClick = (e) => {
            e.stopPropagation();
            // Always navigate to a dedicated rarity page using the short label (e.g. /cards/rarity/SR)
            if (typeof window !== 'undefined') {
              window.location.href = `/cards/rarity/${encodeURIComponent(rarityTag.label)}`;
            }
          };

          const handleCardClick = (e) => {
            // Prevent navigation if a link or button was clicked
            if (
              e.target.closest('a') ||
              e.target.closest('button') ||
              e.target.closest('.magnifier-icon')
            ) return;
            window.location.href = `/cards/${card.id}`;
          };

          return (
            <div
              key={card.id}
              className={
                `card p-3 md:p-4 flex flex-col items-center bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-fadeIn group ring-0
                hover:border-primary/90 hover:ring-2 hover:ring-primary/60 hover:-translate-y-2 hover:bg-primary/5 hover:shadow-xl
                focus-within:border-primary/90 focus-within:ring-2 focus-within:ring-primary/60 focus-within:-translate-y-2 focus-within:bg-primary/5 focus-within:shadow-xl
                `
              }
              style={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)', cursor: 'pointer' }}
              tabIndex={0}
              onClick={handleCardClick}
            >
              <div className="w-full flex flex-col items-center relative">
                <Link href={`/cards/${card.id}`} legacyBehavior>
                  <a
                    className="block w-full"
                    tabIndex={-1}
                    onClick={e => e.stopPropagation()}
                  >
                    <Image
                      src={card.images?.large || '/back-card.png'}
                      alt={card.name}
                      width={220}
                      height={308}
                      className="rounded-app-md mb-2 object-cover shadow-md hover:shadow-lg transition-all"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        const target = e.target;
                        if (target && target.src !== window.location.origin + '/back-card.png') {
                          target.src = '/back-card.png';
                        }
                      }}
                    />
                  </a>
                </Link>
              </div>
              <h3 className="text-lg font-bold text-text-heading text-center mb-1 group-hover:text-primary group-focus-within:text-primary transition-colors duration-200 flex items-center justify-center gap-2">
                <Link href={`/cards/${card.id}`} legacyBehavior>
                  <a className="text-blue-900 hover:text-blue-700 focus:text-blue-700 hover:underline focus:underline outline-none focus-visible:ring-2 focus-visible:ring-primary px-1 rounded" tabIndex={0} title={`View card details for ${card.name}`} onClick={e => e.stopPropagation()}>
                    {card.name}
                  </a>
                </Link>
                <button
                  className="magnifier-icon ml-1 p-1 rounded-full hover:bg-gray-200 focus:bg-gray-300 focus:outline-none"
                  title="Zoom card"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); setZoomedCard(card); }}
                  aria-label="Zoom card"
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
              </h3>
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/tcgsets/${setId}`} legacyBehavior>
                  <a
                    className="text-blue-900 hover:text-blue-700 focus:text-blue-700 hover:underline focus:underline outline-none focus-visible:ring-2 focus-visible:ring-primary px-1 rounded"
                    tabIndex={0}
                    title={`View set ${setName}`}
                    onClick={e => e.stopPropagation()}
                    onFocus={e => e.currentTarget.closest('.card')?.classList.add('ring-4','ring-primary/60','border-primary/90','-translate-y-6','scale-110','shadow-2xl')}
                    onBlur={e => e.currentTarget.closest('.card')?.classList.remove('ring-4','ring-primary/60','border-primary/90','-translate-y-6','scale-110','shadow-2xl')}
                    onMouseEnter={e => e.currentTarget.closest('.card')?.classList.add('ring-4','ring-primary/60','border-primary/90','-translate-y-6','scale-110','shadow-2xl')}
                    onMouseLeave={e => e.currentTarget.closest('.card')?.classList.remove('ring-4','ring-primary/60','border-primary/90','-translate-y-6','scale-110','shadow-2xl')}
                  >
                    {setName || "N/A"}
                  </a>
                </Link>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition ${rarityTag.color}`}
                  title={`Show all ${rarityTag.label} rarity cards`}
                  aria-label={`Show all ${rarityTag.label} rarity cards`}
                  tabIndex={0}
                  onClick={handleRarityClick}
                  style={{ minWidth: 32, cursor: 'pointer', background: 'inherit' }}
                >
                  {rarityTag.label}
                </button>
                {priceDisplay}
              </div>
              <div className="text-content-default text-xs mb-1">
                <b>Number:</b> {card.number}
              </div>
              {setRelease && (
                <div className="text-xs text-gray-400 mt-1">{setRelease}</div>
              )}

              {/* External Links */}
              <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                {card.tcgplayer?.url && (
                  <a
                    href={card.tcgplayer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when link is clicked
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                  >
                    TCGPlayer
                  </a>
                )}
                {card.cardmarket?.url && (
                  <a
                    href={card.cardmarket.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when link is clicked
                    className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                  >
                    CardMarket
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll loading indicator */}
      {scrollLoading && hasMore && (
        <InlineLoadingSpinner 
          text="Loading more cards..." 
          className="mt-8"
        />
      )}

      {!loading && !error && cards.length === 0 && (
        <p className="text-center text-content-muted mt-12">
          No cards found for this Pokémon.
        </p>
      )}

      {!loading && !scrollLoading && !hasMore && cards.length > 0 && (
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400">
          All {cards.length} cards loaded
        </div>
      )}

      {/* Modal for zoomed card */}
      {zoomedCard && (
        <Modal isOpen={!!zoomedCard} onClose={() => setZoomedCard(null)}>
          <div className="flex flex-col items-center p-4">
            <Image
              src={zoomedCard.images?.large || '/back-card.png'}
              alt={zoomedCard.name}
              width={400}
              height={560}
              className="rounded-lg shadow-2xl mb-4"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
              sizes="400px"
            />
            <button
              className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              onClick={() => setZoomedCard(null)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
