/**
 * Static fallback data for TCG sets when API is unavailable
 * This provides instant loading for the most common requests
 * SORTED BY RELEASE DATE (newest first) to match API default order
 */

export const STATIC_SETS_FALLBACK = {
  // Sets sorted by release date (newest first)
  recentSets: [
    // Mega Evolution series (new 2025) - NEWEST
    {
      id: "me2",
      name: "Phantasmal Flames",
      series: "Mega Evolution",
      releaseDate: "2025/11/14",
      total: 130,
      images: {
        symbol: "https://images.pokemontcg.io/me2/symbol.png",
        logo: "https://images.pokemontcg.io/me2/logo.png"
      }
    },
    {
      id: "me1",
      name: "Mega Evolution",
      series: "Mega Evolution",
      releaseDate: "2025/09/26",
      total: 188,
      images: {
        symbol: "https://images.pokemontcg.io/me1/symbol.png",
        logo: "https://images.pokemontcg.io/me1/logo.png"
      }
    },
    {
      id: "zsv10pt5",
      name: "Black Bolt",
      series: "Scarlet & Violet",
      releaseDate: "2025/07/18",
      total: 172,
      images: {
        symbol: "https://images.pokemontcg.io/zsv10pt5/symbol.png",
        logo: "https://images.pokemontcg.io/zsv10pt5/logo.png"
      }
    },
    {
      id: "rsv10pt5",
      name: "White Flare",
      series: "Scarlet & Violet",
      releaseDate: "2025/07/18",
      total: 173,
      images: {
        symbol: "https://images.pokemontcg.io/rsv10pt5/symbol.png",
        logo: "https://images.pokemontcg.io/rsv10pt5/logo.png"
      }
    },
    {
      id: "sv10",
      name: "Destined Rivals",
      series: "Scarlet & Violet",
      releaseDate: "2025/05/30",
      total: 244,
      images: {
        symbol: "https://images.pokemontcg.io/sv10/symbol.png",
        logo: "https://images.pokemontcg.io/sv10/logo.png"
      }
    },
    {
      id: "sv9",
      name: "Journey Together",
      series: "Scarlet & Violet",
      releaseDate: "2025/03/28",
      total: 190,
      images: {
        symbol: "https://images.pokemontcg.io/sv9/symbol.png",
        logo: "https://images.pokemontcg.io/sv9/logo.png"
      }
    },
    {
      id: "sv8pt5",
      name: "Prismatic Evolutions",
      series: "Scarlet & Violet",
      releaseDate: "2025/01/17",
      total: 180,
      images: {
        symbol: "https://images.pokemontcg.io/sv8pt5/symbol.png",
        logo: "https://images.pokemontcg.io/sv8pt5/logo.png"
      }
    },
    {
      id: "sv8",
      name: "Surging Sparks",
      series: "Scarlet & Violet",
      releaseDate: "2024/11/08",
      total: 252,
      images: {
        symbol: "https://images.pokemontcg.io/sv8/symbol.png",
        logo: "https://images.pokemontcg.io/sv8/logo.png"
      }
    },
    {
      id: "sv7",
      name: "Stellar Crown",
      series: "Scarlet & Violet",
      releaseDate: "2024/09/13",
      total: 175,
      images: {
        symbol: "https://images.pokemontcg.io/sv7/symbol.png",
        logo: "https://images.pokemontcg.io/sv7/logo.png"
      }
    },
    {
      id: "sv6pt5",
      name: "Shrouded Fable",
      series: "Scarlet & Violet",
      releaseDate: "2024/08/02",
      total: 99,
      images: {
        symbol: "https://images.pokemontcg.io/sv6pt5/symbol.png",
        logo: "https://images.pokemontcg.io/sv6pt5/logo.png"
      }
    },
    {
      id: "sv6",
      name: "Twilight Masquerade",
      series: "Scarlet & Violet",
      releaseDate: "2024/05/24",
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
      releaseDate: "2024/03/22",
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
      releaseDate: "2024/01/26",
      total: 245,
      images: {
        symbol: "https://images.pokemontcg.io/sv4pt5/symbol.png",
        logo: "https://images.pokemontcg.io/sv4pt5/logo.png"
      }
    },
    {
      id: "sv4",
      name: "Paradox Rift",
      series: "Scarlet & Violet",
      releaseDate: "2023/11/03",
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
      releaseDate: "2023/09/22",
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
      releaseDate: "2023/08/11",
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
      releaseDate: "2023/06/09",
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
      releaseDate: "2023/03/31",
      total: 264,
      images: {
        symbol: "https://images.pokemontcg.io/sv1/symbol.png",
        logo: "https://images.pokemontcg.io/sv1/logo.png"
      }
    },
    // Sword & Shield era sets
    {
      id: "swsh12pt5",
      name: "Crown Zenith",
      series: "Sword & Shield",
      releaseDate: "2023/01/20",
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
      releaseDate: "2022/11/11",
      total: 245,
      images: {
        symbol: "https://images.pokemontcg.io/swsh12/symbol.png",
        logo: "https://images.pokemontcg.io/swsh12/logo.png"
      }
    },
    {
      id: "swsh11",
      name: "Lost Origin",
      series: "Sword & Shield",
      releaseDate: "2022/09/09",
      total: 247,
      images: {
        symbol: "https://images.pokemontcg.io/swsh11/symbol.png",
        logo: "https://images.pokemontcg.io/swsh11/logo.png"
      }
    },
    {
      id: "swsh10",
      name: "Astral Radiance",
      series: "Sword & Shield",
      releaseDate: "2022/05/27",
      total: 246,
      images: {
        symbol: "https://images.pokemontcg.io/swsh10/symbol.png",
        logo: "https://images.pokemontcg.io/swsh10/logo.png"
      }
    },
    {
      id: "swsh9",
      name: "Brilliant Stars",
      series: "Sword & Shield",
      releaseDate: "2022/02/25",
      total: 216,
      images: {
        symbol: "https://images.pokemontcg.io/swsh9/symbol.png",
        logo: "https://images.pokemontcg.io/swsh9/logo.png"
      }
    },
    {
      id: "swsh8",
      name: "Fusion Strike",
      series: "Sword & Shield",
      releaseDate: "2021/11/12",
      total: 284,
      images: {
        symbol: "https://images.pokemontcg.io/swsh8/symbol.png",
        logo: "https://images.pokemontcg.io/swsh8/logo.png"
      }
    },
    {
      id: "swsh7",
      name: "Evolving Skies",
      series: "Sword & Shield",
      releaseDate: "2021/08/27",
      total: 237,
      images: {
        symbol: "https://images.pokemontcg.io/swsh7/symbol.png",
        logo: "https://images.pokemontcg.io/swsh7/logo.png"
      }
    },
    {
      id: "swsh6",
      name: "Chilling Reign",
      series: "Sword & Shield",
      releaseDate: "2021/06/18",
      total: 233,
      images: {
        symbol: "https://images.pokemontcg.io/swsh6/symbol.png",
        logo: "https://images.pokemontcg.io/swsh6/logo.png"
      }
    },
    {
      id: "swsh5",
      name: "Battle Styles",
      series: "Sword & Shield",
      releaseDate: "2021/03/19",
      total: 183,
      images: {
        symbol: "https://images.pokemontcg.io/swsh5/symbol.png",
        logo: "https://images.pokemontcg.io/swsh5/logo.png"
      }
    },
    {
      id: "swsh45",
      name: "Shining Fates",
      series: "Sword & Shield",
      releaseDate: "2021/02/19",
      total: 195,
      images: {
        symbol: "https://images.pokemontcg.io/swsh45/symbol.png",
        logo: "https://images.pokemontcg.io/swsh45/logo.png"
      }
    },
    {
      id: "swsh4",
      name: "Vivid Voltage",
      series: "Sword & Shield",
      releaseDate: "2020/11/13",
      total: 203,
      images: {
        symbol: "https://images.pokemontcg.io/swsh4/symbol.png",
        logo: "https://images.pokemontcg.io/swsh4/logo.png"
      }
    },
    {
      id: "swsh35",
      name: "Champion's Path",
      series: "Sword & Shield",
      releaseDate: "2020/09/25",
      total: 80,
      images: {
        symbol: "https://images.pokemontcg.io/swsh35/symbol.png",
        logo: "https://images.pokemontcg.io/swsh35/logo.png"
      }
    },
    {
      id: "swsh3",
      name: "Darkness Ablaze",
      series: "Sword & Shield",
      releaseDate: "2020/08/14",
      total: 201,
      images: {
        symbol: "https://images.pokemontcg.io/swsh3/symbol.png",
        logo: "https://images.pokemontcg.io/swsh3/logo.png"
      }
    },
    {
      id: "swsh2",
      name: "Rebel Clash",
      series: "Sword & Shield",
      releaseDate: "2020/05/01",
      total: 209,
      images: {
        symbol: "https://images.pokemontcg.io/swsh2/symbol.png",
        logo: "https://images.pokemontcg.io/swsh2/logo.png"
      }
    },
    {
      id: "swsh1",
      name: "Sword & Shield Base",
      series: "Sword & Shield",
      releaseDate: "2020/02/07",
      total: 216,
      images: {
        symbol: "https://images.pokemontcg.io/swsh1/symbol.png",
        logo: "https://images.pokemontcg.io/swsh1/logo.png"
      }
    },
    // Classic/Iconic sets
    {
      id: "base1",
      name: "Base Set",
      series: "Base",
      releaseDate: "1999/01/09",
      total: 102,
      images: {
        symbol: "https://images.pokemontcg.io/base1/symbol.png",
        logo: "https://images.pokemontcg.io/base1/logo.png"
      }
    },
    {
      id: "base2",
      name: "Jungle",
      series: "Base",
      releaseDate: "1999/06/16",
      total: 64,
      images: {
        symbol: "https://images.pokemontcg.io/base2/symbol.png",
        logo: "https://images.pokemontcg.io/base2/logo.png"
      }
    },
    {
      id: "base3",
      name: "Fossil",
      series: "Base",
      releaseDate: "1999/10/10",
      total: 62,
      images: {
        symbol: "https://images.pokemontcg.io/base3/symbol.png",
        logo: "https://images.pokemontcg.io/base3/logo.png"
      }
    },
    {
      id: "base4",
      name: "Base Set 2",
      series: "Base",
      releaseDate: "2000/02/24",
      total: 130,
      images: {
        symbol: "https://images.pokemontcg.io/base4/symbol.png",
        logo: "https://images.pokemontcg.io/base4/logo.png"
      }
    },
    {
      id: "base5",
      name: "Team Rocket",
      series: "Base",
      releaseDate: "2000/04/24",
      total: 83,
      images: {
        symbol: "https://images.pokemontcg.io/base5/symbol.png",
        logo: "https://images.pokemontcg.io/base5/logo.png"
      }
    }
  ],

  totalCount: 170, // Approximate total as of 2025
  lastUpdated: "2025-11-27T00:00:00.000Z"
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