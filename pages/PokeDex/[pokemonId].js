import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";
import Modal from "../../components/Modal";

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
  const [modalCard, setModalCard] = useState(null);

  const [sortOption, setSortOption] = useState("price");

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

  function getPrice(card) {
    return (
      card.tcgplayer?.prices?.holofoil?.market ||
      card.tcgplayer?.prices?.normal?.market ||
      0
    );
  }

  function openModal(card) {
    setModalCard(card);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalCard(null);
  }

  // Sorting logic
  function getReleaseDate(card) {
    return card.set?.releaseDate || "0000-00-00";
  }
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
            onClick={() => openModal(card)}
            title={`Click to zoom card: ${card.name}`}
          >
            {card.images?.large && (
              <img
                src={card.images.large}
                alt={card.name}
                className="rounded-app-md mb-2 w-[190px] h-[260px] object-cover shadow cursor-zoom-in hover:scale-110 transition-transform duration-200"
              />
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

      {modalOpen && modalCard && (
        <Modal onClose={closeModal}>
          <div className="flex flex-col items-center">
            <img
              src={modalCard.images.large}
              alt={modalCard.name}
              className="max-w-[80vw] md:max-w-[400px] max-h-[80vh] object-contain rounded-md"
            />
            <h3 className="text-xl font-bold mt-4">{modalCard.name}</h3>
            <p className="text-content-default mt-2">
              <b>Set:</b> {modalCard.set?.name || "N/A"}
            </p>
            <p className="text-content-default mt-1">
              <b>Rarity:</b> {modalCard.rarity || "N/A"}
            </p>
            <p className="text-content-default mt-1">
              <b>Price:</b>{" "}
              {modalCard.tcgplayer?.prices?.holofoil?.market
                ? `$${modalCard.tcgplayer.prices.holofoil.market.toFixed(2)}`
                : modalCard.tcgplayer?.prices?.normal?.market
                ? `$${modalCard.tcgplayer.prices.normal.market.toFixed(2)}`
                : "N/A"}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}