import React, { useState, useEffect, useRef } from "react";
import pokemon from "pokemontcgsdk";
import Modal from "../components/Modal";

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
if (!pokemonKey) {
  throw new Error(
    "NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY environment variable is not set. Please set it to your .env.local."
  );
}

pokemon.configure({ apiKey: pokemonKey });

function getPrice(card) {
  // TCGPlayer market price if available
  if (
    card.tcgplayer &&
    card.tcgplayer.prices &&
    card.tcgplayer.prices.normal &&
    card.tcgplayer.prices.normal.market
  ) {
    return `$${card.tcgplayer.prices.normal.market.toFixed(2)}`;
  }
  if (
    card.tcgplayer &&
    card.tcgplayer.prices &&
    card.tcgplayer.prices.holofoil &&
    card.tcgplayer.prices.holofoil.market
  ) {
    return `$${card.tcgplayer.prices.holofoil.market.toFixed(2)}`;
  }
  return "N/A";
}

function getRarityGlow(rarity) {
  if (!rarity) return "";
  const rare = rarity.toLowerCase();
  if (rare.includes("ultra") || rare.includes("secret")) return "shadow-glow-ultra";
  if (rare.includes("rare")) return "shadow-glow-rare";
  if (rare.includes("holo")) return "shadow-glow-holo";
  return "";
}

export default function Moazzam() {
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
    <div
      className="container section-spacing-y-default max-w-6xl mx-auto relative min-h-screen"
    >
      <h2 className="text-page-heading text-center mb-6">
        Pokémon Card Search
        <span className="ml-2 animate-bounce">✨</span>
      </h2>
      <form
        onSubmit={handleSearch}
        className="flex justify-center mb-8"
        autoComplete="off"
      >
        <input
          type="text"
          placeholder="Enter Pokémon name (e.g., Charizard)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input rounded-l-app-md text-lg w-72 max-w-xs focus:ring-primary focus:border-primary bg-white/80"
        />
        <button
          type="submit"
          className="btn-primary rounded-r-app-md rounded-l-none text-lg font-semibold px-6 shadow hover:scale-105 active:scale-95 transition-transform duration-150"
        >
          Search
        </button>
      </form>

      {loading && (
        <p className="text-center text-content-muted animate-fadeIn">
          Loading cards...
        </p>
      )}
      {error && (
        <p className="text-center text-red-500 animate-fadeIn">{error}</p>
      )}

      <div className="flex flex-wrap gap-8 justify-center">
        {cards.map((card, i) => {
          return (
            <div
              key={card.id}
              onClick={() => openModal(card)}
              className={`card card-padding-default flex flex-col items-center w-[260px] bg-gradient-to-br from-surface via-card to-background shadow-app-md rounded-app-lg border border-border animate-fadeIn group cursor-pointer ${getRarityGlow(card.rarity)} ${selectedCardId === card.id ? "card-selected" : ""}`}
              style={{
                animationDelay: `${i * 50}ms`
              }}
            >
              <div className="relative mb-2 w-[190px] h-[260px]">
                <img
                  src={card.images.large}
                  alt={card.name}
                  className="rounded-app-md w-full h-full object-cover shadow-lg transition-all duration-200 ease-in-out transform hover:scale-125 hover:z-20 hover:shadow-2xl cursor-pointer"
                  draggable="false"
                />
                {/* Magnifier / Zoom icon */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute top-2 right-2 z-30 text-xl select-none bg-white/80 rounded-full p-1 shadow-md transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Zoom in"
                >
                  🔍
                </button>
              </div>
              <h3 className="text-lg font-bold text-text-heading text-center mb-1">
                {card.name}
              </h3>
              <div className="text-content-default text-sm text-center mb-1">
                <b>Set:</b> {card.set?.name || "N/A"}
              </div>
              <div className="text-content-default text-xs mb-1">
                <b>Rarity:</b>{" "}
                <span className="font-semibold">{card.rarity || "N/A"}</span>
              </div>
              <div className="text-content-default text-xs mb-1">
                <b>Market Price:</b>{" "}
                <span className="font-semibold text-green-700">
                  {getPrice(card)}
                </span>
              </div>
              <div className="text-content-default text-xs mb-1">
                <b>Type:</b> {card.types ? card.types.join(", ") : "N/A"}
              </div>
              {renderEvolutionLine(card)}
            </div>
          );
        })}
      </div>
      {!loading && !error && cards.length === 0 && (
        <p className="text-center text-content-muted mt-12 animate-fadeIn">
          No cards found. Try another Pokémon name!
        </p>
      )}

      {modalOpen && (
        <Modal onClose={closeModal}>
          <div className="flex flex-col" ref={containerRef}>
            <img
              src={modalCard.images.large}
              alt={modalCard.name}
              className="max-w-[80vw] md:max-w-[400px] max-h-[80vh] object-contain rounded-md"
            />
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