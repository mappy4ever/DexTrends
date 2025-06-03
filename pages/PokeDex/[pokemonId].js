import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";
import Modal from "../../components/Modal";
import CardList from "../../components/CardList";

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

  // Sorting helpers for CardList
  function getReleaseDate(card) {
    return card.set?.releaseDate || "0000-00-00";
  }

  function getRarityRank(card) {
    const rarityOrder = {
      common: 1,
      uncommon: 2,
      "rare holo": 3,
      rare: 4,
      "ultra rare": 5,
      "secret rare": 6,
    };
    return rarityOrder[card.rarity] || 0;
  }

  function openModal(card) {
    setModalCard(card);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalCard(null);
  }

  return (
    <>
      <CardList
        cards={cards}
        loading={loading}
        error={error}
        initialSortOption="price"
        onCardClick={openModal}
        getPrice={getPrice}
        getReleaseDate={getReleaseDate}
        getRarityRank={getRarityRank}
        title={`Cards for ${pokemonId}`}
        subtitle={null}
        showSearch={true}
      />
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
    </>
  );
}