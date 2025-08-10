/**
 * Fetch gym leader and game data from Bulbapedia
 */

import { useState, useEffect } from 'react';
import { bulbapediaApi, fetchAndCacheBulbapediaData } from './bulbapediaApi';
import logger from './logger';
import { isObject, hasProperty, isString } from './typeGuards';

interface PokemonTeamMember {
  name: string;
  level?: number;
  type?: string;
  sprite?: string;
}

interface GymLeader {
  name: string;
  image?: string;
  region?: string;
  type?: string;
  badge?: string;
  quote?: string;
  team: PokemonTeamMember[];
}

interface Badge {
  name: string;
  image?: string;
}

interface GameData {
  name: string;
  boxArt?: string;
  releaseDate?: string;
  platform?: string;
  generation?: string;
  region?: string;
  director?: string;
  producer?: string;
}

interface RaritySymbol {
  name: string;
  symbol: string;
  fullImage: string;
}

interface BulbapediaImage {
  title: string;
  url: string;
  thumburl?: string;
}

interface PocketRarityImages {
  common?: BulbapediaImage;
  uncommon?: BulbapediaImage;
  rare?: BulbapediaImage;
  doubleRare?: BulbapediaImage;
  artRare?: BulbapediaImage;
  superRare?: BulbapediaImage;
  immersiveRare?: BulbapediaImage;
  crown?: BulbapediaImage;
}

type DataType = 'gymLeaders' | 'badges' | 'game' | 'tcgRarity' | 'pocketRarity';

interface UseBulbapediaDataParams {
  region?: string;
  gameName?: string;
}

interface UseBulbapediaDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch all gym leaders for a specific region
 */
export const fetchRegionGymLeaders = async (region: string): Promise<GymLeader[]> => {
  return fetchAndCacheBulbapediaData(
    `gym_leaders_${region}`,
    async () => {
      // Search for gym leader pages
      const searchResults = await bulbapediaApi.search(`${region} Gym Leader`, {
        limit: 20
      });
      
      // Get detailed data for each gym leader
      const leaders = await Promise.all(
        searchResults.map(async (result) => {
          const leaderData = await bulbapediaApi.getGymLeaderData(result.title);
          return leaderData;
        })
      );
      
      // Filter out null values and convert to GymLeader format
      return leaders
        .filter((leader): leader is NonNullable<typeof leader> => leader !== null && leader !== undefined)
        .map((leader): GymLeader => ({
          name: leader.name,
          image: leader.image,
          region: leader.region,
          type: leader.type,
          badge: leader.badge,
          quote: leader.quote,
          team: leader.team.map(pokemon => ({
            name: pokemon.name || 'Unknown',
            level: parseInt(pokemon.level?.toString() || '0') || undefined,
            type: pokemon.type,
            sprite: pokemon.sprite
          }))
        }));
    },
    86400000 // Cache for 24 hours
  );
};

/**
 * Fetch gym badges for a region
 */
export const fetchRegionBadges = async (region: string): Promise<Badge[]> => {
  return fetchAndCacheBulbapediaData(
    `badges_${region}`,
    async () => {
      const categoryMembers = await bulbapediaApi.getCategoryMembers(`${region} Badges`);
      
      const badges = await Promise.all(
        categoryMembers.map(async (member) => {
          const images = await bulbapediaApi.getPageImages(member.title);
          return {
            name: member.title.replace(' (Badge)', ''),
            image: images[0]?.thumburl
          };
        })
      );
      
      return badges;
    },
    86400000
  );
};

/**
 * Fetch Pokemon game data
 */
export const fetchPokemonGameData = async (gameName: string): Promise<GameData | null> => {
  return fetchAndCacheBulbapediaData(
    `game_${gameName}`,
    async () => {
      const pageContent = await bulbapediaApi.getPageContent(`Pokémon ${gameName}`);
      if (!pageContent) return null;
      
      const infobox = bulbapediaApi.parseInfobox(pageContent.content, 'Infobox game');
      const images = await bulbapediaApi.getPageImages(`Pokémon ${gameName}`);
      
      // Find box art image
      const boxArt = images.find(img => 
        img.title.toLowerCase().includes('boxart') || 
        img.title.toLowerCase().includes('box art')
      );
      
      return {
        name: gameName,
        boxArt: boxArt?.url,
        releaseDate: infobox?.release,
        platform: infobox?.platform,
        generation: infobox?.generation,
        region: infobox?.region,
        director: infobox?.director,
        producer: infobox?.producer
      };
    },
    604800000 // Cache for 7 days
  );
};

/**
 * Fetch TCG rarity data
 */
export const fetchTCGRarityData = async (): Promise<Record<string, RaritySymbol>> => {
  return fetchAndCacheBulbapediaData(
    'tcg_rarities',
    async () => {
      // Get the Rarity page content
      const pageContent = await bulbapediaApi.getPageContent('Rarity');
      const images = await bulbapediaApi.getPageImages('Rarity');
      
      // Map common rarity names to their symbols
      const rarityMap: Record<string, BulbapediaImage | undefined> = {
        'Common': images.find(img => img.title.includes('SetSymbolCommon')),
        'Uncommon': images.find(img => img.title.includes('SetSymbolUncommon')),
        'Rare': images.find(img => img.title.includes('SetSymbolRare')),
        'Ultra Rare': images.find(img => img.title.includes('SetSymbolUltra')),
        'Secret Rare': images.find(img => img.title.includes('SetSymbolSecret')),
        'Amazing Rare': images.find(img => img.title.includes('SetSymbolAmazing')),
        'Radiant Rare': images.find(img => img.title.includes('SetSymbolRadiant')),
        'Illustration Rare': images.find(img => img.title.includes('SetSymbolIllustration')),
        'Special Illustration Rare': images.find(img => img.title.includes('SetSymbolSpecial')),
        'Hyper Rare': images.find(img => img.title.includes('SetSymbolHyper'))
      };
      
      const rarities: Record<string, RaritySymbol> = {};
      for (const [name, image] of Object.entries(rarityMap)) {
        if (image) {
          rarities[name.toLowerCase().replace(/\s+/g, '')] = {
            name,
            symbol: image.thumburl || '',
            fullImage: image.url
          };
        }
      }
      
      return rarities;
    },
    2592000000 // Cache for 30 days
  );
};

/**
 * Fetch Pokemon TCG Pocket rarity data
 */
export const fetchPocketRarityData = async (): Promise<PocketRarityImages> => {
  return fetchAndCacheBulbapediaData(
    'pocket_rarities',
    async () => {
      const pageContent = await bulbapediaApi.getPageContent('Pokémon Trading Card Game Pocket');
      const raritySection = await bulbapediaApi.search('TCG Pocket rarity', { limit: 5 });
      
      // Get rarity images from the TCG Pocket category
      const categoryMembers = await bulbapediaApi.getCategoryMembers('Pokémon Trading Card Game Pocket');
      
      const rarityImages = await Promise.all(
        categoryMembers
          .filter(member => member.title.includes('TCG Pocket') && member.title.includes('rare'))
          .map(member => bulbapediaApi.getImageInfo(member.title))
      );
      
      const filterImage = (predicate: (img: unknown) => boolean) => {
        const found = rarityImages.find(img => img && predicate(img));
        return found || undefined;
      };
      
      const hasTitle = (img: unknown): img is { title: string } => {
        return isObject(img) && hasProperty(img, 'title') && isString(img.title);
      };

      return {
        common: filterImage(img => hasTitle(img) && img.title.includes('Common')),
        uncommon: filterImage(img => hasTitle(img) && img.title.includes('Uncommon')),
        rare: filterImage(img => hasTitle(img) && img.title.includes('Rare') && !img.title.includes('Double')),
        doubleRare: filterImage(img => hasTitle(img) && img.title.includes('Double rare')),
        artRare: filterImage(img => hasTitle(img) && img.title.includes('Art rare')),
        superRare: filterImage(img => hasTitle(img) && img.title.includes('Super rare')),
        immersiveRare: filterImage(img => hasTitle(img) && img.title.includes('Immersive rare')),
        crown: filterImage(img => hasTitle(img) && img.title.includes('Crown rare'))
      };
    },
    2592000000 // Cache for 30 days
  );
};

/**
 * React hook for fetching Bulbapedia data
 */
export const useBulbapediaData = <T = unknown>(
  dataType: DataType, 
  params: UseBulbapediaDataParams
): UseBulbapediaDataResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let result: T | null = null;
        
        switch (dataType) {
          case 'gymLeaders':
            if (params.region) {
              result = (await fetchRegionGymLeaders(params.region)) as T;
            }
            break;
          case 'badges':
            if (params.region) {
              result = (await fetchRegionBadges(params.region)) as T;
            }
            break;
          case 'game':
            if (params.gameName) {
              result = (await fetchPokemonGameData(params.gameName)) as T;
            }
            break;
          case 'tcgRarity':
            result = (await fetchTCGRarityData()) as T;
            break;
          case 'pocketRarity':
            result = (await fetchPocketRarityData()) as T;
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }
        
        setData(result);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        logger.error('Bulbapedia fetch error:', { error: err });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dataType, params.region, params.gameName]);
  
  return { data, loading, error };
};