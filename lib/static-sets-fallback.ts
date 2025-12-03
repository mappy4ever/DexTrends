/**
 * Static fallback data for TCG sets when API is unavailable
 * This provides instant loading for the most common requests
 * SORTED BY RELEASE DATE (newest first) to match API default order
 *
 * Note: Image URLs use TCGDex assets CDN
 * Set IDs use TCGDex format (e.g., sv08.5 not sv8pt5)
 */

export const STATIC_SETS_FALLBACK = {
  // Sets sorted by release date (newest first)
  recentSets: [
    // Mega Evolution series (new 2025) - NEWEST
    {
      id: "me02",
      name: "Phantasmal Flames",
      series: "Mega Evolution",
      releaseDate: "2025-11-14",
      total: 130,
      images: {
        symbol: "https://assets.tcgdex.net/univ/me/me02/symbol.png",
        logo: "https://assets.tcgdex.net/en/me/me02/logo.png"
      }
    },
    {
      id: "me01",
      name: "Mega Evolution",
      series: "Mega Evolution",
      releaseDate: "2025-09-26",
      total: 188,
      images: {
        symbol: "https://assets.tcgdex.net/univ/me/me01/symbol.png",
        logo: "https://assets.tcgdex.net/en/me/me01/logo.png"
      }
    },
    {
      id: "sv10",
      name: "Destined Rivals",
      series: "Scarlet & Violet",
      releaseDate: "2025-05-30",
      total: 244,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv10/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv10/logo.png"
      }
    },
    {
      id: "sv09",
      name: "Journey Together",
      series: "Scarlet & Violet",
      releaseDate: "2025-03-28",
      total: 190,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv09/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv09/logo.png"
      }
    },
    {
      id: "sv08.5",
      name: "Prismatic Evolutions",
      series: "Scarlet & Violet",
      releaseDate: "2025-01-17",
      total: 180,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv08.5/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv08.5/logo.png"
      }
    },
    {
      id: "sv08",
      name: "Surging Sparks",
      series: "Scarlet & Violet",
      releaseDate: "2024-11-08",
      total: 252,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv08/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv08/logo.png"
      }
    },
    {
      id: "sv07",
      name: "Stellar Crown",
      series: "Scarlet & Violet",
      releaseDate: "2024-09-13",
      total: 175,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv07/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv07/logo.png"
      }
    },
    {
      id: "sv06.5",
      name: "Shrouded Fable",
      series: "Scarlet & Violet",
      releaseDate: "2024-08-02",
      total: 99,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv06.5/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv06.5/logo.png"
      }
    },
    {
      id: "sv06",
      name: "Twilight Masquerade",
      series: "Scarlet & Violet",
      releaseDate: "2024-05-24",
      total: 226,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv06/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv06/logo.png"
      }
    },
    {
      id: "sv05",
      name: "Temporal Forces",
      series: "Scarlet & Violet",
      releaseDate: "2024-03-22",
      total: 218,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv05/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv05/logo.png"
      }
    },
    {
      id: "sv04.5",
      name: "Paldean Fates",
      series: "Scarlet & Violet",
      releaseDate: "2024-01-26",
      total: 245,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv04.5/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv04.5/logo.png"
      }
    },
    {
      id: "sv04",
      name: "Paradox Rift",
      series: "Scarlet & Violet",
      releaseDate: "2023-11-03",
      total: 266,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv04/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv04/logo.png"
      }
    },
    {
      id: "sv03.5",
      name: "151",
      series: "Scarlet & Violet",
      releaseDate: "2023-09-22",
      total: 207,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv03.5/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv03.5/logo.png"
      }
    },
    {
      id: "sv03",
      name: "Obsidian Flames",
      series: "Scarlet & Violet",
      releaseDate: "2023-08-11",
      total: 230,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv03/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv03/logo.png"
      }
    },
    {
      id: "sv02",
      name: "Paldea Evolved",
      series: "Scarlet & Violet",
      releaseDate: "2023-06-09",
      total: 279,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv02/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv02/logo.png"
      }
    },
    {
      id: "sv01",
      name: "Scarlet & Violet",
      series: "Scarlet & Violet",
      releaseDate: "2023-03-31",
      total: 264,
      images: {
        symbol: "https://assets.tcgdex.net/univ/sv/sv01/symbol.png",
        logo: "https://assets.tcgdex.net/en/sv/sv01/logo.png"
      }
    },
    // Sword & Shield era sets
    {
      id: "swsh12.5",
      name: "Crown Zenith",
      series: "Sword & Shield",
      releaseDate: "2023-01-20",
      total: 230,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh12.5/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh12.5/logo.png"
      }
    },
    {
      id: "swsh12",
      name: "Silver Tempest",
      series: "Sword & Shield",
      releaseDate: "2022-11-11",
      total: 245,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh12/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh12/logo.png"
      }
    },
    {
      id: "swsh11",
      name: "Lost Origin",
      series: "Sword & Shield",
      releaseDate: "2022-09-09",
      total: 247,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh11/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh11/logo.png"
      }
    },
    {
      id: "swsh10",
      name: "Astral Radiance",
      series: "Sword & Shield",
      releaseDate: "2022-05-27",
      total: 246,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh10/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh10/logo.png"
      }
    },
    {
      id: "swsh9",
      name: "Brilliant Stars",
      series: "Sword & Shield",
      releaseDate: "2022-02-25",
      total: 216,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh9/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh9/logo.png"
      }
    },
    {
      id: "swsh8",
      name: "Fusion Strike",
      series: "Sword & Shield",
      releaseDate: "2021-11-12",
      total: 284,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh8/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh8/logo.png"
      }
    },
    {
      id: "swsh7",
      name: "Evolving Skies",
      series: "Sword & Shield",
      releaseDate: "2021-08-27",
      total: 237,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh7/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh7/logo.png"
      }
    },
    {
      id: "swsh6",
      name: "Chilling Reign",
      series: "Sword & Shield",
      releaseDate: "2021-06-18",
      total: 233,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh6/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh6/logo.png"
      }
    },
    {
      id: "swsh5",
      name: "Battle Styles",
      series: "Sword & Shield",
      releaseDate: "2021-03-19",
      total: 183,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh5/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh5/logo.png"
      }
    },
    {
      id: "swsh4.5",
      name: "Shining Fates",
      series: "Sword & Shield",
      releaseDate: "2021-02-19",
      total: 195,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh4.5/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh4.5/logo.png"
      }
    },
    {
      id: "swsh4",
      name: "Vivid Voltage",
      series: "Sword & Shield",
      releaseDate: "2020-11-13",
      total: 203,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh4/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh4/logo.png"
      }
    },
    {
      id: "swsh3.5",
      name: "Champion's Path",
      series: "Sword & Shield",
      releaseDate: "2020-09-25",
      total: 80,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh3.5/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh3.5/logo.png"
      }
    },
    {
      id: "swsh3",
      name: "Darkness Ablaze",
      series: "Sword & Shield",
      releaseDate: "2020-08-14",
      total: 201,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh3/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh3/logo.png"
      }
    },
    {
      id: "swsh2",
      name: "Rebel Clash",
      series: "Sword & Shield",
      releaseDate: "2020-05-01",
      total: 209,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh2/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh2/logo.png"
      }
    },
    {
      id: "swsh1",
      name: "Sword & Shield",
      series: "Sword & Shield",
      releaseDate: "2020-02-07",
      total: 216,
      images: {
        symbol: "https://assets.tcgdex.net/univ/swsh/swsh1/symbol.png",
        logo: "https://assets.tcgdex.net/en/swsh/swsh1/logo.png"
      }
    },
    // Classic/Iconic sets (Wizards of the Coast era)
    {
      id: "base1",
      name: "Base Set",
      series: "Wizards Black Star Promos",
      releaseDate: "1999-01-09",
      total: 102,
      images: {
        symbol: "https://assets.tcgdex.net/univ/base/base1/symbol.png",
        logo: "https://assets.tcgdex.net/en/base/base1/logo.png"
      }
    },
    {
      id: "base2",
      name: "Jungle",
      series: "Base",
      releaseDate: "1999-06-16",
      total: 64,
      images: {
        symbol: "https://assets.tcgdex.net/univ/base/base2/symbol.png",
        logo: "https://assets.tcgdex.net/en/base/base2/logo.png"
      }
    },
    {
      id: "base3",
      name: "Fossil",
      series: "Base",
      releaseDate: "1999-10-10",
      total: 62,
      images: {
        symbol: "https://assets.tcgdex.net/univ/base/base3/symbol.png",
        logo: "https://assets.tcgdex.net/en/base/base3/logo.png"
      }
    },
    {
      id: "base4",
      name: "Base Set 2",
      series: "Base",
      releaseDate: "2000-02-24",
      total: 130,
      images: {
        symbol: "https://assets.tcgdex.net/univ/base/base4/symbol.png",
        logo: "https://assets.tcgdex.net/en/base/base4/logo.png"
      }
    },
    {
      id: "base5",
      name: "Team Rocket",
      series: "Base",
      releaseDate: "2000-04-24",
      total: 83,
      images: {
        symbol: "https://assets.tcgdex.net/univ/base/base5/symbol.png",
        logo: "https://assets.tcgdex.net/en/base/base5/logo.png"
      }
    }
  ],

  totalCount: 170, // Approximate total as of 2025
  lastUpdated: "2025-11-27T00:00:00.000Z"
};

// Get set info from static data for fallback
export function getStaticSetInfo(setId: string) {
  const set = STATIC_SETS_FALLBACK.recentSets.find(s => s.id === setId);
  if (!set) return null;

  return {
    ...set,
    printedTotal: set.total,
    updatedAt: STATIC_SETS_FALLBACK.lastUpdated,
    legalities: { standard: 'Legal', expanded: 'Legal' }
  };
}

// Create fallback response for set detail when API is unavailable
export function createSetDetailFallback(setId: string) {
  const set = getStaticSetInfo(setId);
  if (!set) return null;

  return {
    set,
    cards: [], // No cards available in fallback
    pagination: {
      page: 1,
      pageSize: 250,
      count: 0,
      totalCount: set.total,
      hasMore: false
    },
    warning: "The Pokemon TCG API is temporarily unavailable. Set information is shown but cards cannot be loaded. Please try again later.",
    fallback: true
  };
}

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