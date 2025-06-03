import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";
import Modal from "../../components/Modal";
import CardList from "../../components/CardList";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <CardList
        cards={cards}
        loading={loading}
        error={null}
        initialSortOption="price"
        onCardClick={openModal}
        getPrice={getPrice}
        getReleaseDate={(card) => card.set?.releaseDate || "0000-00-00"}
        getRarityRank={(card) => {
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
          return rarityOrder[card.rarity] || 0;
        }}
        title={setInfo?.name || "Loading..."}
        subtitle={null}
        showSearch={true}
      />
      {modalOpen && modalCard && (
        <Modal onClose={closeModal}>
          <div className="flex flex-col">
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
              <b>Price:</b> {getPrice(modalCard)}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}