import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CardList from "../../../components/CardList";
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { FullBleedWrapper } from '../../../components/ui/FullBleedWrapper';
import { getPokemonSDK } from "../../../utils/pokemonSDK";
import type { TCGCard } from "../../../types/api/cards";

const rarityLabelToName: Record<string, string> = {
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
  const [cards, setCards] = useState<TCGCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rarity || typeof rarity !== 'string') return;
    
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const pokemon = getPokemonSDK();
        const rarityName = rarityLabelToName[rarity] || rarity;
        const res = await pokemon.card.where({ q: `rarity:"${rarityName}"` });
        
        // Validate API response structure
        if (Array.isArray(res) && res.length > 0) {
          // Basic validation - check if items have expected card properties
          const validCards = res.filter(item => 
            item && 
            typeof item === 'object' && 
            'id' in item && 
            'name' in item
          ) as TCGCard[];
          setCards(validCards);
        } else if (Array.isArray(res)) {
          // Empty but valid array
          setCards([]);
        } else {
          // Invalid response structure
          throw new Error('Invalid API response structure');
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load cards for this rarity.");
        setLoading(false);
      }
    };

    fetchCards();
  }, [rarity]);

  return (
    <FullBleedWrapper gradient="tcg">
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 transition-all duration-300 animate-fadeIn">
        <h1 className="text-2xl font-bold text-center mb-6">
          Cards with Rarity: <span className="uppercase text-primary">{rarity}</span>
        </h1>
        {loading ? (
          <PageLoader text="Loading cards..." />
        ) : error ? (
          <div className="text-center text-red-500 my-8">{error}</div>
        ) : (
          <CardList cards={cards} loading={loading} error={error} initialSortOption="price" />
        )}
      </div>
    </FullBleedWrapper>
  );
}