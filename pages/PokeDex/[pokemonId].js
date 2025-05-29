

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";

pokemon.configure({ apiKey: "7ee6ca7f-f74d-4599-87c9-3c9a95d0ebba" });

export default function PokemonDetail() {
  const router = useRouter();
  const { pokemonId } = router.query;

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      <div className="flex flex-wrap gap-7 justify-center">
        {cards.map((card) => (
          <div
            key={card.id}
            className="card card-padding-default flex flex-col items-center w-[260px] bg-card shadow-app-md rounded-app-lg border border-border"
          >
            {card.images?.large && (
              <img
                src={card.images.large}
                alt={card.name}
                className="rounded-app-md mb-2 w-[190px] h-[260px] object-cover shadow"
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