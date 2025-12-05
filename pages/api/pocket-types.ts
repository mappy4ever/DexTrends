// pages/api/pocket-types.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface PocketTypeCard {
  id: string;
  name: string;
  image: string | null;
  types: string[];
  rarity: string;
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<PocketTypeCard[]>
) {
  // Edge cache for 1 day (static data), stale for 7 days
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).json([
    { id: "pock-card-001", name: "Pocket Pikachu", image: "/placeholder-card.png", types: ["Electric"], rarity: "Rare Holo V" },
    { id: "pock-card-002", name: "Pocket Charmander", image: null, types: ["Fire"], rarity: "Common" },
    { id: "pock-card-003", name: "Pocket Squirtle", image: "/placeholder-card.png", types: ["Water"], rarity: "Uncommon" },
    { id: "pock-card-004", name: "Pocket Bulbasaur", image: null, types: ["Grass", "Poison"], rarity: "Common" },
    { id: "pock-card-005", name: "Pocket Eevee", image: "/placeholder-card.png", types: ["Normal"], rarity: "Rare" }
  ]);
}
