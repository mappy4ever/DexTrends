// pages/api/pocket-decks.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface KeyCard {
  id: string;
  image: string;
  name: string;
  count: number;
}

interface PocketDeck {
  id: string;
  name: string;
  winRate: string;
  types: string[];
  description: string;
  keyCards: KeyCard[];
  strategy: string;
  creator: string;
  dateCreated: string;
  tier: string;
  tournaments: number;
  avgPlacement: number;
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<PocketDeck[]>
) {
  // Edge cache for 1 hour, stale for 24 hours
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json([
    {
      id: "pika-zapdos",
      name: "Pikachu EX / Zapdos EX Lightning",
      winRate: "82%",
      types: ["Electric"],
      description: "Aggressive electric deck focused on high damage output with Pikachu EX and Zapdos EX leading the charge.",
      keyCards: [
        { id: "pikachu-ex", image: "/cards/pikachu-ex.png", name: "Pikachu EX", count: 2 },
        { id: "zapdos-ex", image: "/cards/zapdos-ex.png", name: "Zapdos EX", count: 2 },
        { id: "lieutenant-surge", image: "/cards/lieutenant-surge.png", name: "Lt. Surge", count: 2 },
        { id: "pokeball", image: "/cards/pokeball.png", name: "Poké Ball", count: 2 }
      ],
      strategy: "Use Lt. Surge to accelerate energy onto powerful Electric EX Pokemon for quick knockouts.",
      creator: "ElectroMaster",
      dateCreated: "2024-11-15",
      tier: "S",
      tournaments: 47,
      avgPlacement: 2.3
    },
    {
      id: "mewtwo-garde", 
      name: "Mewtwo EX / Gardevoir Control",
      winRate: "79%",
      types: ["Psychic"],
      description: "Control deck using Gardevoir's energy acceleration to power up Mewtwo EX for massive damage.",
      keyCards: [
        { id: "mewtwo-ex", image: "/cards/mewtwo-ex.png", name: "Mewtwo EX", count: 2 },
        { id: "gardevoir", image: "/cards/gardevoir.png", name: "Gardevoir", count: 2 },
        { id: "kirlia", image: "/cards/kirlia.png", name: "Kirlia", count: 2 },
        { id: "ralts", image: "/cards/ralts.png", name: "Ralts", count: 3 }
      ],
      strategy: "Set up Gardevoir to accelerate Psychic energy and sweep with powered-up Mewtwo EX.",
      creator: "PsychicSage",
      dateCreated: "2024-11-20", 
      tier: "S",
      tournaments: 38,
      avgPlacement: 2.1
    },
    {
      id: "charizard-moltres",
      name: "Charizard EX / Moltres EX Fire",
      winRate: "76%", 
      types: ["Fire"],
      description: "Aggressive fire deck utilizing Moltres EX for energy acceleration and Charizard EX for powerful attacks.",
      keyCards: [
        { id: "charizard-ex", image: "/cards/charizard-ex.png", name: "Charizard EX", count: 2 },
        { id: "moltres-ex", image: "/cards/moltres-ex.png", name: "Moltres EX", count: 2 },
        { id: "charmander", image: "/cards/charmander.png", name: "Charmander", count: 2 },
        { id: "charmeleon", image: "/cards/charmeleon.png", name: "Charmeleon", count: 1 }
      ],
      strategy: "Use Moltres EX to accelerate Fire energy and set up Charizard EX for devastating attacks.",
      creator: "FlameWielder",
      dateCreated: "2024-11-18",
      tier: "A",
      tournaments: 29,
      avgPlacement: 3.2
    },
    {
      id: "starmie-articuno",
      name: "Starmie EX / Articuno EX Water",
      winRate: "73%",
      types: ["Water"],
      description: "Fast water deck with Starmie EX's mobility and Articuno EX's board control capabilities.",
      keyCards: [
        { id: "starmie-ex", image: "/cards/starmie-ex.png", name: "Starmie EX", count: 2 },
        { id: "articuno-ex", image: "/cards/articuno-ex.png", name: "Articuno EX", count: 2 },
        { id: "staryu", image: "/cards/staryu.png", name: "Staryu", count: 2 },
        { id: "misty", image: "/cards/misty.png", name: "Misty", count: 2 }
      ],
      strategy: "Use Misty for energy acceleration and leverage Water Pokemon's mobility for tactical advantages.",
      creator: "WaveRider",
      dateCreated: "2024-11-12",
      tier: "A",
      tournaments: 22,
      avgPlacement: 3.8
    },
    {
      id: "venusaur-ex",
      name: "Venusaur EX / Lilligant Grass",
      winRate: "68%",
      types: ["Grass"],
      description: "Sustainable grass deck focusing on healing and consistent damage with Venusaur EX.",
      keyCards: [
        { id: "venusaur-ex", image: "/cards/venusaur-ex.png", name: "Venusaur EX", count: 2 },
        { id: "lilligant", image: "/cards/lilligant.png", name: "Lilligant", count: 2 },
        { id: "ivysaur", image: "/cards/ivysaur.png", name: "Ivysaur", count: 1 },
        { id: "bulbasaur", image: "/cards/bulbasaur.png", name: "Bulbasaur", count: 2 }
      ],
      strategy: "Use Lilligant for energy acceleration and Venusaur EX for sustained pressure with healing.",
      creator: "GrassGuru",
      dateCreated: "2024-11-10",
      tier: "B",
      tournaments: 15,
      avgPlacement: 4.1
    },
    {
      id: "primeape-fighting",
      name: "Primeape / Machamp Fighting Rush",
      winRate: "71%",
      types: ["Fighting"],
      description: "Aggressive fighting deck with consistent damage and energy efficient attacks.",
      keyCards: [
        { id: "primeape", image: "/cards/primeape.png", name: "Primeape", count: 2 },
        { id: "machamp-ex", image: "/cards/machamp-ex.png", name: "Machamp EX", count: 2 },
        { id: "mankey", image: "/cards/mankey.png", name: "Mankey", count: 2 },
        { id: "bruno", image: "/cards/bruno.png", name: "Bruno", count: 2 }
      ],
      strategy: "Quick setup with low energy costs for consistent early game pressure.",
      creator: "FightClub",
      dateCreated: "2024-11-08",
      tier: "B",
      tournaments: 18,
      avgPlacement: 4.3
    }
  ]);
}
