import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
if (!pokemonKey) {
  throw new Error(
    "NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY environment variable is not set. Please set it to your .env.local."
  );
}

pokemon.configure({ apiKey: pokemonKey });

export default function PokemonDetail() {
  const router = useRouter();
  const { pokemonId } = router.query;

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");

  const [sortOption, setSortOption] = useState("price");

  const rarityOrder = {
    "Common": 1,
    "Uncommon": 2,
    "Rare": 3,
    "Rare Holo": 4,
    "Rare Ultra": 5,
    "Rare Secret": 6,
    "Rare Holo GX": 7,
    "Rare Rainbow": 8,
    "Rare Prism Star": 9,
    "Rare Full Art": 10,
    "Rare Holo EX": 11,
    "Rare Holo V": 12,
    "Rare Holo VMAX": 13,
  };

  function getPrice(card) {
    return (
      card.tcgplayer?.prices?.holofoil?.market ||
      card.tcgplayer?.prices?.normal?.market ||
      0
    );
  }

  function getReleaseDate(card) {
    return card.set?.releaseDate || "0000-00-00";
  }

  function getRarityRank(card) {
    return rarityOrder[card.rarity] || 0;
  }

  const sortedCards = [...cards].sort((a, b) => {
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

  useEffect(() => {
    if (!pokemonId) return;
    setLoading(true);
    setError(null);

    pokemon.card
      .where({ q: `name:${pokemonId}` })
      .then((res) => {
        setCards(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load cards.");
        setLoading(false);
      });
  }, [pokemonId]);

  return (
    <div className="container section-spacing-y-default max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 capitalize text-center">
        Cards for {pokemonId}
      </h1>

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
            className="card card-padding-default flex flex-col items-center w-[260px] bg-card shadow-app-md rounded-app-lg border border-border cursor-zoom-in"
          >
            {card.images?.large && (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setModalOpen(true);
                  setModalImageUrl(card.images.large);
                }}
              >
                <img
                  src={card.images.large}
                  alt={card.name}
                  className="rounded-app-md mb-2 w-[190px] h-[260px] object-cover shadow cursor-zoom-in hover:scale-110 transition-transform duration-200"
                />
              </div>
            )}
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

      {/* Modal for card image */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-200"
          style={{ animation: "modalFadeIn 0.18s" }}
          onClick={(e) => {
            // Only close if clicking the backdrop, not the image or close button
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              animation: "modalScaleIn 0.2s",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
          >
            <button
              className="absolute -top-5 -right-5 text-white bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition"
              onClick={() => setModalOpen(false)}
              style={{ zIndex: 2 }}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={modalImageUrl}
              alt="Card Large"
              className="rounded-app-lg shadow-2xl max-h-[80vh] max-w-[90vw] object-contain transition-transform duration-200"
              style={{ background: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <style jsx global>{`
            @keyframes modalFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalScaleIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}