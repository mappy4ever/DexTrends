import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";
import Modal from "../../components/Modal";

export default function SetIdPage() {
  const router = useRouter();
  const { setId } = router.query;

  const [setInfo, setSetInfo] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCard, setModalCard] = useState(null);

  useEffect(() => {
    if (!setId) return;

    setLoading(true);
    pokemon.set.find(setId).then((set) => {
      setSetInfo(set);
      setLoading(false);
    });

    pokemon.card.where({ q: `set.id:${setId}` }).then((cardsData) => {
      setCards(cardsData.data);
    });
  }, [setId]);

  function getPrice(card) {
    return (
      card.tcgplayer?.prices?.holofoil?.market?.toFixed(2) ||
      card.tcgplayer?.prices?.normal?.market?.toFixed(2) ||
      null
    );
  }

  function openModal(card) {
    setModalCard(card);
    setModalOpen(true);
    setSelectedCardId(card.id);
  }

  function closeModal() {
    setModalOpen(false);
    setModalCard(null);
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">{setInfo?.name || "Loading..."}</h2>
      {loading && <p>Loading cards...</p>}
      <div className="flex flex-wrap gap-6 justify-center">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card card-hover card-padding-default flex flex-col items-center w-[220px] bg-card shadow-app-md rounded-app-lg border border-border ${
              selectedCardId === card.id ? "card-selected" : ""
            }`}
            onClick={() => openModal(card)}
            title={`Click to zoom card: ${card.name}`}
          >
            {card.images?.large && (
              <img
                src={card.images.large}
                alt={card.name}
                className="mb-2 rounded-app-md w-[140px] h-[200px] object-cover"
              />
            )}
            <div className="card-name-overlay">{card.name}</div>
            <div className="card-price-box mt-1 px-2 py-1 bg-gray-100 rounded text-sm font-semibold text-green-700">
              {getPrice(card) ? `$${getPrice(card)}` : "N/A"}
            </div>
            <div className="card-magnifier-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 001.48-5.34C14.99 5.42 12.5 3 9.5 3S4 5.42 4 8.5 6.5 14 9.5 14a6.471 6.471 0 005.34-1.48l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 12c-1.93 0-3.5-1.57-3.5-3.5S7.57 5 9.5 5 13 6.57 13 8.5 11.43 12 9.5 12z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <Modal onClose={closeModal}>
          <div className="flex flex-col">
            <img
              src={modalCard.images.large}
              alt={modalCard.name}
              className="max-w-[80vw] md:max-w-[400px] max-h-[80vh] object-contain rounded-md"
            />
          </div>
        </Modal>
      )}
    </>
  );
}