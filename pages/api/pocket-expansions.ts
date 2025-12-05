// pages/api/pocket-expansions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';
import { TCGDEX } from '../../config/api';

interface TCGDexSet {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount?: {
    total?: number;
    official?: number;
  };
  releaseDate?: string;
}

interface TCGDexSeriesResponse {
  id: string;
  name: string;
  logo?: string;
  sets?: TCGDexSet[];
}

interface PocketExpansion {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  releaseDate: string;
  cardCount: number;
  symbol: string;
  code: string;
}

// Static fallback data in case API fails - comprehensive list of all known Pocket expansions
const FALLBACK_EXPANSIONS: PocketExpansion[] = [
  {
    id: "A1",
    name: "Genetic Apex",
    description: "The first expansion set for Pokémon TCG Pocket featuring legendary Pokémon from Kanto.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A1/logo",
    releaseDate: "2024-10-30",
    cardCount: 286,
    symbol: "A1",
    code: "A1"
  },
  {
    id: "A1a",
    name: "Mythical Island",
    description: "Discover mystical Pokémon from the legendary Mythical Island including Mew.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A1a/logo",
    releaseDate: "2024-12-17",
    cardCount: 86,
    symbol: "A1a",
    code: "A1a"
  },
  {
    id: "A2",
    name: "Space-Time Smackdown",
    description: "Master time and space with the legendary powers of Dialga and Palkia.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A2/logo",
    releaseDate: "2025-01-30",
    cardCount: 166,
    symbol: "A2",
    code: "A2"
  },
  {
    id: "A2a",
    name: "Triumphant Light",
    description: "Illuminate your path to victory with Arceus and brilliant light-type Pokémon.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A2a/logo",
    releaseDate: "2025-02-28",
    cardCount: 96,
    symbol: "A2a",
    code: "A2a"
  },
  {
    id: "A2b",
    name: "Shining Revelry",
    description: "Experience the ultimate rivalry with shining rare Pokémon cards.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A2b/logo",
    releaseDate: "2025-04-30",
    cardCount: 96,
    symbol: "A2b",
    code: "A2b"
  },
  {
    id: "A3",
    name: "Celestial Guardians",
    description: "Harness the celestial powers of Solgaleo and Lunala, the sun and moon guardians.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A3/logo",
    releaseDate: "2025-05-29",
    cardCount: 166,
    symbol: "A3",
    code: "A3"
  },
  {
    id: "A3a",
    name: "Extradimensional Crisis",
    description: "Battle across dimensions with Necrozma and ultra-rare interdimensional Pokémon.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A3a/logo",
    releaseDate: "2025-07-31",
    cardCount: 96,
    symbol: "A3a",
    code: "A3a"
  },
  {
    id: "A3b",
    name: "Eeveelution Celebration",
    description: "Celebrate the evolution possibilities with Eevee and all its evolutions.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A3b/logo",
    releaseDate: "2025-09-30",
    cardCount: 96,
    symbol: "A3b",
    code: "A3b"
  },
  {
    id: "A4",
    name: "Ancient Wisdom",
    description: "Explore the wisdom of Kyogre and Groudon with powerful Water and Ground types.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A4/logo",
    releaseDate: "2025-10-30",
    cardCount: 166,
    symbol: "A4",
    code: "A4"
  },
  {
    id: "A4a",
    name: "Hidden Springs",
    description: "Discover the tranquility of hidden springs with rare Water-type Pokémon.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/A4a/logo",
    releaseDate: "2025-12-18",
    cardCount: 96,
    symbol: "A4a",
    code: "A4a"
  },
  {
    id: "B1",
    name: "Mega Power",
    description: "Experience the power of Mega Evolution with classic Pokémon in their ultimate forms.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/B1/logo",
    releaseDate: "2026-01-29",
    cardCount: 166,
    symbol: "B1",
    code: "B1"
  },
  {
    id: "P-A",
    name: "Promos-A",
    description: "Exclusive promotional cards available through special events, campaigns, and shop purchases.",
    logoUrl: "https://assets.tcgdex.net/en/tcgp/P-A/logo",
    releaseDate: "2024-10-30",
    cardCount: 50,
    symbol: "P-A",
    code: "P-A"
  }
];

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<PocketExpansion[]>
) {
  try {
    logger.info('Fetching Pocket expansions from TCGDex');

    // Fetch the Pocket series from TCGDex
    // Force fresh data to avoid stale cache issues
    const seriesData = await fetchJSON<TCGDexSeriesResponse>(
      `${TCGDEX.serie('tcgp')}`,
      {
        useCache: false, // Disable cache temporarily to fix stale data issue
        forceRefresh: true,
        cacheTime: 60 * 60 * 1000, // Cache for 1 hour
        timeout: 15000,
        retries: 2,
        throwOnError: true
      }
    );

    if (!seriesData || !seriesData.sets || seriesData.sets.length === 0) {
      logger.warn('No Pocket sets found from TCGDex, using fallback');
      return res.status(200).json(FALLBACK_EXPANSIONS);
    }

    // Transform TCGDex data to our format
    const expansions: PocketExpansion[] = seriesData.sets.map((set) => ({
      id: set.id,
      name: set.name,
      description: getSetDescription(set.id, set.name),
      logoUrl: set.logo || `https://assets.tcgdex.net/en/tcgp/${set.id}/logo`,
      releaseDate: set.releaseDate || '2024-10-30',
      cardCount: set.cardCount?.official || set.cardCount?.total || 0,
      symbol: set.symbol || set.id,
      code: set.id
    }));

    // Sort by release date (newest first)
    expansions.sort((a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );

    logger.info('Successfully fetched Pocket expansions', {
      count: expansions.length,
      sets: expansions.map(e => e.id)
    });

    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000'); // 1 week cache, 30 day stale
    res.status(200).json(expansions);

  } catch (error) {
    logger.error('Failed to fetch Pocket expansions from TCGDex', {
      error: error instanceof Error ? error.message : String(error)
    });

    // Return fallback data on error
    res.setHeader('X-Fallback', 'true');
    res.status(200).json(FALLBACK_EXPANSIONS);
  }
}

// Helper function to get descriptions for each set
function getSetDescription(setId: string, setName: string): string {
  const descriptions: Record<string, string> = {
    'P-A': 'Exclusive promotional cards available through special events, campaigns, and shop purchases.',
    'A1': 'The first expansion set for Pokémon TCG Pocket featuring legendary Pokémon from Kanto.',
    'A1a': 'Discover mystical Pokémon from the legendary Mythical Island including Mew.',
    'A2': 'Master time and space with the legendary powers of Dialga and Palkia.',
    'A2a': 'Illuminate your path to victory with Arceus and brilliant light-type Pokémon.',
    'A2b': 'Experience the ultimate rivalry with shining rare Pokémon cards.',
    'A3': 'Harness the celestial powers of Solgaleo and Lunala, the sun and moon guardians.',
    'A3a': 'Battle across dimensions with Necrozma and ultra-rare interdimensional Pokémon.',
    'A3b': 'Celebrate the evolution possibilities with Eevee and all its evolutions.',
    'A4': 'Explore the wisdom of Kyogre and Groudon with powerful Water and Ground types.',
    'A4a': 'Discover the tranquility of hidden springs with rare Water-type Pokémon.',
    'B1': 'Experience the power of Mega Evolution with classic Pokémon in their ultimate forms.'
  };

  return descriptions[setId] || `Explore the ${setName} expansion for Pokémon TCG Pocket.`;
}
