import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";
import CardList from "../../../components/CardList";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const rarityLabelToName = {
  C: "Common",
  U: "Uncommon",
  R: "Rare",
  RH: "Rare Holo",
  GX: "Rare Holo GX",
  EX: "Rare Holo EX",
  V: "Rare Holo V",
  VMAX: "Rare Holo VMAX",
  UR: "Rare Ultra",
  SR: "Rare Secret",
  RR: "Rare Rainbow",
  FA: "Rare Full Art",
  PR: "Rare Prism Star",
  IR: "Illustration Rare",
  SIR: "Special Illustration Rare",
  HR: "Hyper Rare",
  ShR: "Shiny Rare",
  TG: "Trainer Gallery Rare",
  Rad: "Radiant Rare",
};

export default function CardsByRarityPage() {
  const router = useRouter();
  const { rarity } = router.query;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rarity) return;
    setLoading(true);
    setError(null);
    const rarityName = rarityLabelToName[rarity] || rarity;
    pokemon.card
      .where({ q: `rarity:\"${rarityName}\"` })
      .then((res) => {
        setCards(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load cards for this rarity.");
        setLoading(false);
      });
  }, [rarity]);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 transition-all duration-300 animate-fadeIn">
      <h1 className="text-2xl font-bold text-center mb-6">
        Cards with Rarity: <span className="uppercase text-primary">{rarity}</span>
      </h1>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 my-8">{error}</div>
      ) : (
        <CardList cards={cards} loading={loading} error={error} initialSortOption="price" />
      )}
    </div>
  );
}
