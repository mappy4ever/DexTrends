// pages/api/pocket-expansions.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface FeaturedPokemon {
  id: string;
  imageUrl: string;
  name: string;
  rarity: string;
}

interface PocketExpansion {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  releaseDate: string;
  cardCount: number;
  packArt: string;
  symbol: string;
  theme: string;
  featuredPokemon: FeaturedPokemon[];
  types: string[];
  boosterPrice: number;
  guaranteedRares: number;
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<PocketExpansion[]>
) {
  res.status(200).json([
    {
      id: "mewtwo",
      name: "Genetic Apex: Mewtwo",
      description: "Unleash the power of psychic Pokemon with legendary Mewtwo leading the charge. Features powerful psychic types and legendary cards.",
      logoUrl: "/pack-mewtwo.png",
      releaseDate: "2024-10-30",
      cardCount: 68,
      packArt: "/pack-mewtwo-art.png",
      symbol: "A1a",
      theme: "psychic",
      featuredPokemon: [
        { id: "mewtwo-ex", imageUrl: "/cards/mewtwo-ex.png", name: "Mewtwo ex", rarity: "★★" },
        { id: "alakazam", imageUrl: "/cards/alakazam.png", name: "Alakazam", rarity: "◊◊◊◊" },
        { id: "gardevoir", imageUrl: "/cards/gardevoir.png", name: "Gardevoir", rarity: "◊◊◊" }
      ],
      types: ["Psychic", "Dark", "Fighting"],
      boosterPrice: 5,
      guaranteedRares: 1
    },
    {
      id: "charizard", 
      name: "Genetic Apex: Charizard",
      description: "Feel the heat with fire-type Pokemon and the mighty Charizard. Dominate battles with powerful fire attacks.",
      logoUrl: "/pack-charizard.png",
      releaseDate: "2024-10-30",
      cardCount: 68,
      packArt: "/pack-charizard-art.png", 
      symbol: "A1b",
      theme: "fire",
      featuredPokemon: [
        { id: "charizard-ex", imageUrl: "/cards/charizard-ex.png", name: "Charizard ex", rarity: "★★" },
        { id: "arcanine-ex", imageUrl: "/cards/arcanine-ex.png", name: "Arcanine ex", rarity: "★" },
        { id: "rapidash", imageUrl: "/cards/rapidash.png", name: "Rapidash", rarity: "◊◊◊" }
      ],
      types: ["Fire", "Fighting", "Ground"],
      boosterPrice: 5,
      guaranteedRares: 1
    },
    {
      id: "pikachu",
      name: "Genetic Apex: Pikachu", 
      description: "Spark up your collection with electric Pokemon and the beloved Pikachu. High-speed electric attacks await.",
      logoUrl: "/pack-pikachu.png",
      releaseDate: "2024-10-30",
      cardCount: 68,
      packArt: "/pack-pikachu-art.png",
      symbol: "A1c", 
      theme: "electric",
      featuredPokemon: [
        { id: "pikachu-ex", imageUrl: "/cards/pikachu-ex.png", name: "Pikachu ex", rarity: "★★" },
        { id: "zapdos-ex", imageUrl: "/cards/zapdos-ex.png", name: "Zapdos ex", rarity: "★" },
        { id: "electrode", imageUrl: "/cards/electrode.png", name: "Electrode", rarity: "◊◊◊" }
      ],
      types: ["Electric", "Flying", "Steel"],
      boosterPrice: 5,
      guaranteedRares: 1
    }
  ]);
}
