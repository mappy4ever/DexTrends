// Example: Fetch gym leader data from Bulbapedia automatically
import { bulbapediaApi, fetchAndCacheBulbapediaData } from './bulbapediaApi';

// Fetch all gym leaders for a specific region
export const fetchRegionGymLeaders = async (region) => {
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
      
      return leaders.filter(Boolean);
    },
    86400000 // Cache for 24 hours
  );
};

// Fetch gym badges for a region
export const fetchRegionBadges = async (region) => {
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

// Fetch Pokemon game data
export const fetchPokemonGameData = async (gameName) => {
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

// Fetch TCG rarity data
export const fetchTCGRarityData = async () => {
  return fetchAndCacheBulbapediaData(
    'tcg_rarities',
    async () => {
      // Get the Rarity page content
      const pageContent = await bulbapediaApi.getPageContent('Rarity');
      const images = await bulbapediaApi.getPageImages('Rarity');
      
      // Map common rarity names to their symbols
      const rarityMap = {
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
      
      const rarities = {};
      for (const [name, image] of Object.entries(rarityMap)) {
        if (image) {
          rarities[name.toLowerCase().replace(/\s+/g, '')] = {
            name,
            symbol: image.thumburl,
            fullImage: image.url
          };
        }
      }
      
      return rarities;
    },
    2592000000 // Cache for 30 days
  );
};

// Fetch Pokemon TCG Pocket rarity data
export const fetchPocketRarityData = async () => {
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
      
      return {
        common: rarityImages.find(img => img?.title.includes('Common')),
        uncommon: rarityImages.find(img => img?.title.includes('Uncommon')),
        rare: rarityImages.find(img => img?.title.includes('Rare') && !img.title.includes('Double')),
        doubleRare: rarityImages.find(img => img?.title.includes('Double rare')),
        artRare: rarityImages.find(img => img?.title.includes('Art rare')),
        superRare: rarityImages.find(img => img?.title.includes('Super rare')),
        immersiveRare: rarityImages.find(img => img?.title.includes('Immersive rare')),
        crown: rarityImages.find(img => img?.title.includes('Crown rare'))
      };
    },
    2592000000 // Cache for 30 days
  );
};

// Example usage in a React component
export const useBulbapediaData = (dataType, params) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let result;
        
        switch (dataType) {
          case 'gymLeaders':
            result = await fetchRegionGymLeaders(params.region);
            break;
          case 'badges':
            result = await fetchRegionBadges(params.region);
            break;
          case 'game':
            result = await fetchPokemonGameData(params.gameName);
            break;
          case 'tcgRarity':
            result = await fetchTCGRarityData();
            break;
          case 'pocketRarity':
            result = await fetchPocketRarityData();
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }
        
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error('Bulbapedia fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dataType, params]);
  
  return { data, loading, error };
};