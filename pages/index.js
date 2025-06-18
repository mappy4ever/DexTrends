import React, { useState, useEffect, useRef } from "react";
import pokemon from "pokemontcgsdk";
import Modal from "../components/modal";
import CardList from "../components/CardList"; // Updated path
import CustomSiteLogo from "../components/icons/customsitelogo";
import { getPrice, getRarityRank } from "../utils/pokemonutils.js";

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
if (!pokemonKey) {
  throw new Error(
    "NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY environment variable is not set. Please set it to your .env.local."
  );
}

pokemon.configure({ apiKey: pokemonKey });

function getRarityGlow(rarity) {
  if (!rarity) return "";
  const rare = rarity.toLowerCase();
  if (rare.includes("ultra") || rare.includes("secret")) return "shadow-glow-ultra";
  if (rare.includes("rare")) return "shadow-glow-rare";
  if (rare.includes("holo")) return "shadow-glow-holo";
  return "";
}

export default function IndexPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for modal and selected card
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCard, setModalCard] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Ref to detect clicks outside expanded card modal
  const containerRef = useRef(null);

  function openModal(card) {
    setModalCard(card);
    setModalOpen(true);
    setSelectedCardId(card.id);
  }

  function closeModal() {
    setModalOpen(false);
    setModalCard(null);
    setSelectedCardId(null);
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCards([]);
    try {
      const result = await pokemon.card.where({ q: `name:${searchTerm}*` });
      setCards(result.data);
    } catch (err) {
      setError("Failed to load cards.");
    }
    setLoading(false);
  };

  const renderEvolutionLine = (card) => (
    <div className="mt-2 flex flex-wrap gap-2 text-xs">
      {card.evolvesFrom && (
        <span>
          <b className="text-foreground-muted">Evolves From:</b>{" "}
          <span className="font-medium">{card.evolvesFrom}</span>
        </span>
      )}
      {card.evolvesTo && card.evolvesTo.length > 0 && (
        <span>
          <b className="text-foreground-muted">Evolves To:</b>{" "}
          <span className="font-medium">{card.evolvesTo.join(", ")}</span>
        </span>
      )}
    </div>
  );

  // Handle click outside expanded card modal to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        modalOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        closeModal();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalOpen]);

  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <div className="flex flex-col items-center mb-8">
        <div className="rounded-3xl shadow-2xl border-4 border-[#FFDE59] bg-white p-6 mb-4 relative overflow-visible" style={{ background: 'linear-gradient(135deg, #fffbe6 60%, #e0f7fa 100%)' }}>
          <div className="absolute -top-4 -right-4 animate-bounce">
            <span className="inline-block text-yellow-400 text-3xl">✨</span>
          </div>
          <CustomSiteLogo size={130} className="mx-auto drop-shadow-xl" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#FF0000] drop-shadow-lg tracking-tight text-center mb-2 font-sans">
          Pokémon Card Search <span className="align-middle animate-pulse">✨</span>
        </h1>
        <p className="text-lg md:text-xl text-[#2a2a2a] font-medium text-center mb-4 max-w-xl">
          Discover, track, and explore Pokémon TCG card prices and trends in a beautiful Pokédex-inspired experience.
        </p>
      </div>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center items-center gap-3 mb-8 w-full max-w-2xl bg-white/80 rounded-xl shadow-md p-4 border border-[#FFDE59]">
        <input
          type="text"
          className="input text-lg rounded-app-md w-full md:w-80 max-w-full border-2 border-[#FFDE59] focus:border-[#FF0000] focus:ring-2 focus:ring-[#FFDE59] bg-[#fffbe6] placeholder-gray-400"
          placeholder="Search for a card (e.g., Pikachu)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-primary ml-0 md:ml-2 px-6 py-2 text-lg rounded-lg shadow-md bg-[#FF0000] hover:bg-[#C80000] text-white font-bold transition-all duration-150">
          Search
        </button>
      </form>
      <div className="w-full mb-8">
        <CardList
          cards={cards}
          loading={loading}
          error={error}
          initialSortOption="price"
          onCardClick={openModal}
          getPrice={getPrice}
          getReleaseDate={(card) => card.set?.releaseDate || "0000-00-00"}
          getRarityRank={getRarityRank}
        />
      </div>
      {modalOpen && modalCard && (
        <Modal onClose={closeModal}>
          <div className="flex flex-col items-center" ref={containerRef}>
            <img
              src={modalCard.images.large}
              alt={modalCard.name}
              className="max-w-[80vw] md:max-w-[400px] max-h-[80vh] object-contain rounded-2xl border-4 border-[#FFDE59] shadow-xl bg-white"
            />
            <h3 className="text-2xl font-bold mt-4 text-[#FF0000] drop-shadow-md">{modalCard.name}</h3>
            <p className="text-content-default mt-2">
              <b>Set:</b> {modalCard.set?.name || "N/A"}
            </p>
            <p className="text-content-default mt-1">
              <b>Rarity:</b> {modalCard.rarity || "N/A"}
            </p>
            <p className="text-content-default mt-1">
              <b>Price:</b> {getPrice(modalCard)}
            </p>
            {renderEvolutionLine(modalCard)}
          </div>
        </Modal>
      )}
      <style jsx global>{`
        .shadow-glow-rare {
          box-shadow: 0 0 14px 4px #ffe06655, 0 2px 8px 0 var(--color-shadow-default);
        }
        .shadow-glow-ultra {
          box-shadow: 0 0 18px 6px #a685ff99, 0 2px 8px 0 var(--color-shadow-default);
        }
        .shadow-glow-holo {
          box-shadow: 0 0 16px 5px #99ecff99, 0 2px 8px 0 var(--color-shadow-default);
        }
        @keyframes sparkleBurst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
          }
        }
        .animate-sparkleBurst {
          animation: sparkleBurst 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}