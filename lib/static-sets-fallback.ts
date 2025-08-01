/**
 * Static fallback data for TCG sets when API is unavailable
 * This provides instant loading for the most common requests
 */

export const STATIC_SETS_FALLBACK = {
  // Recent sets (updated manually when new sets release)
  recentSets: [
    {
      id: "sv8",
      name: "Surging Sparks",
      series: "Scarlet & Violet",
      releaseDate: "2024-11-08",
      total: 252,
      images: {
        symbol: "https://images.pokemontcg.io/sv8/symbol.png",
        logo: "https://images.pokemontcg.io/sv8/logo.png"
      }
    },
    {
      id: "sv8pt5",
      name: "Prismatic Evolutions",
      series: "Scarlet & Violet",
      releaseDate: "2025-01-17",
      total: 180,
      images: {
        symbol: "https://images.pokemontcg.io/sv8pt5/symbol.png",
        logo: "https://images.pokemontcg.io/sv8pt5/logo.png"
      }
    },
    {
      id: "sv7",
      name: "Stellar Crown", 
      series: "Scarlet & Violet",
      releaseDate: "2024-08-09",
      total: 175,
      images: {
        symbol: "https://images.pokemontcg.io/sv7/symbol.png",
        logo: "https://images.pokemontcg.io/sv7/logo.png"
      }
    },
    {
      id: "sv6",
      name: "Twilight Masquerade",
      series: "Scarlet & Violet", 
      releaseDate: "2024-05-24",
      total: 226,
      images: {
        symbol: "https://images.pokemontcg.io/sv6/symbol.png",
        logo: "https://images.pokemontcg.io/sv6/logo.png"
      }
    },
    {
      id: "sv5",
      name: "Temporal Forces",
      series: "Scarlet & Violet",
      releaseDate: "2024-03-22", 
      total: 218,
      images: {
        symbol: "https://images.pokemontcg.io/sv5/symbol.png",
        logo: "https://images.pokemontcg.io/sv5/logo.png"
      }
    },
    {
      id: "sv4pt5",
      name: "Paldean Fates",
      series: "Scarlet & Violet",
      releaseDate: "2024-01-26",
      total: 245,
      images: {
        symbol: "https://images.pokemontcg.io/sv4pt5/symbol.png",
        logo: "https://images.pokemontcg.io/sv4pt5/logo.png"
      }
    },
    {
      id: "sv6pt5",
      name: "Shrouded Fable",
      series: "Scarlet & Violet",
      releaseDate: "2024-08-02",
      total: 99,
      images: {
        symbol: "https://images.pokemontcg.io/sv6pt5/symbol.png",
        logo: "https://images.pokemontcg.io/sv6pt5/logo.png"
      }
    },
    {
      id: "sv4",
      name: "Paradox Rift",
      series: "Scarlet & Violet",
      releaseDate: "2023-11-03",
      total: 266,
      images: {
        symbol: "https://images.pokemontcg.io/sv4/symbol.png",
        logo: "https://images.pokemontcg.io/sv4/logo.png"
      }
    },
    {
      id: "sv3pt5",
      name: "151",
      series: "Scarlet & Violet",
      releaseDate: "2023-09-22",
      total: 207,
      images: {
        symbol: "https://images.pokemontcg.io/sv3pt5/symbol.png",
        logo: "https://images.pokemontcg.io/sv3pt5/logo.png"
      }
    },
    {
      id: "sv3",
      name: "Obsidian Flames",
      series: "Scarlet & Violet",
      releaseDate: "2023-08-11",
      total: 230,
      images: {
        symbol: "https://images.pokemontcg.io/sv3/symbol.png",
        logo: "https://images.pokemontcg.io/sv3/logo.png"
      }
    },
    {
      id: "sv2",
      name: "Paldea Evolved",
      series: "Scarlet & Violet",
      releaseDate: "2023-06-09",
      total: 279,
      images: {
        symbol: "https://images.pokemontcg.io/sv2/symbol.png",
        logo: "https://images.pokemontcg.io/sv2/logo.png"
      }
    },
    {
      id: "sv1",
      name: "Scarlet & Violet Base",
      series: "Scarlet & Violet",
      releaseDate: "2023-03-31",
      total: 264,
      images: {
        symbol: "https://images.pokemontcg.io/sv1/symbol.png",
        logo: "https://images.pokemontcg.io/sv1/logo.png"
      }
    },
    // Add some popular classic sets
    {
      id: "swsh12pt5",
      name: "Crown Zenith",
      series: "Sword & Shield",
      releaseDate: "2023-01-20",
      total: 230,
      images: {
        symbol: "https://images.pokemontcg.io/swsh12pt5/symbol.png",
        logo: "https://images.pokemontcg.io/swsh12pt5/logo.png"
      }
    },
    {
      id: "swsh12",
      name: "Silver Tempest",
      series: "Sword & Shield",
      releaseDate: "2022-11-11",
      total: 245,
      images: {
        symbol: "https://images.pokemontcg.io/swsh12/symbol.png",
        logo: "https://images.pokemontcg.io/swsh12/logo.png"
      }
    },
    {
      id: "base1",
      name: "Base Set",
      series: "Base",
      releaseDate: "1999-01-09",
      total: 102,
      images: {
        symbol: "https://images.pokemontcg.io/base1/symbol.png",
        logo: "https://images.pokemontcg.io/base1/logo.png"
      }
    }
  ],
  
  totalCount: 168, // Approximate total as of 2025
  lastUpdated: "2025-08-01T00:00:00.000Z"
};

export function createFallbackResponse(page: number = 1, pageSize: number = 25) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSets = STATIC_SETS_FALLBACK.recentSets.slice(startIndex, endIndex);
  
  return {
    data: paginatedSets,
    pagination: {
      page,
      pageSize,
      count: paginatedSets.length,
      totalCount: STATIC_SETS_FALLBACK.totalCount,
      hasMore: endIndex < STATIC_SETS_FALLBACK.recentSets.length
    },
    meta: {
      responseTime: 1, // Instant
      cached: true,
      fallback: true,
      lastUpdated: STATIC_SETS_FALLBACK.lastUpdated
    },
    warning: "Using fallback data due to API unavailability. Data may not include the very latest sets."
  };
}