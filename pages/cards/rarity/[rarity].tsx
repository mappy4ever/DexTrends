import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CardList from "../../../components/CardList";
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { FullBleedWrapper } from '../../../components/ui/FullBleedWrapper';
import { fetchJSON } from "../../../utils/unifiedFetch";
import { TCGDexEndpoints } from "../../../utils/tcgdex-adapter";
import type { TCGCard } from "../../../types/api/cards";
import logger from "../../../utils/logger";

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
        const rarityName = rarityLabelToName[rarity] || rarity;
        // Use TCGDex API for card search by rarity
        const url = `${TCGDexEndpoints.cards('en')}?rarity=eq:${encodeURIComponent(rarityName)}&pagination:itemsPerPage=100`;

        logger.debug('Fetching cards by rarity from TCGDex', { rarity: rarityName, url });

        const res = await fetchJSON<any[]>(url, {
          useCache: true,
          cacheTime: 30 * 60 * 1000, // 30 minute cache
          timeout: 15000,
          retries: 2
        });

        // Transform TCGDex response to our card format
        if (Array.isArray(res) && res.length > 0) {
          const validCards = res.map((card: any) => {
            const imageBase = card.image || `https://assets.tcgdex.net/en/${card.id.split('-')[0]}/${card.id}`;
            return {
              id: card.id,
              name: card.name,
              supertype: 'Pokémon',
              rarity: card.rarity || rarityName,
              images: {
                small: `${imageBase}/low.png`,
                large: `${imageBase}/high.png`
              },
              set: {
                id: card.id.split('-')[0] || '',
                name: '',
                series: ''
              }
            } as TCGCard;
          });
          setCards(validCards);
        } else if (Array.isArray(res)) {
          setCards([]);
        } else {
          throw new Error('Invalid API response structure');
        }
        setLoading(false);
      } catch (err) {
        logger.error('Failed to fetch cards by rarity', { rarity, error: err });
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