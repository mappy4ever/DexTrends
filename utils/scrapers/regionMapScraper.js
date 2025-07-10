// Region Map Scraper
// Downloads high-quality region maps from Bulbapedia

import scraperConfig from './scraperConfig.js';
import {
  fetchMediaWikiApi,
  getPageImages,
  downloadImage,
  saveDataToFile,
  delay,
  getCachedData,
  cacheData
} from './scraperUtils.js';

class RegionMapScraper {
  constructor() {
    this.scrapedData = {};
  }

  // Scrape all region maps
  async scrapeAllRegionMaps() {
    console.log('Starting region map scraping...');
    
    for (const [regionKey, regionPage] of Object.entries(scraperConfig.targets.regionMaps)) {
      const mapData = await this.scrapeRegionMap(regionKey, regionPage);
      if (mapData) {
        this.scrapedData[regionKey] = mapData;
      }
      
      // Rate limiting
      await delay(scraperConfig.settings.requestDelay);
    }
    
    // Save all data
    await this.saveAllData();
    console.log('\nRegion map scraping completed!');
    
    return this.scrapedData;
  }

  // Scrape individual region map
  async scrapeRegionMap(regionKey, regionPage) {
    try {
      console.log(`Scraping region map: ${regionPage}`);
      
      // Check cache first
      const cacheKey = `region-map-${regionKey}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${regionPage}`);
        return cachedData;
      }

      // Get page images
      const images = await getPageImages(regionPage, (title, info) => {
        const fileName = title.toLowerCase();
        
        // Filter for map images
        const isMapImage = (
          // Map patterns
          fileName.includes('map') ||
          fileName.includes(regionKey.toLowerCase()) ||
          fileName.includes('region') ||
          fileName.includes('artwork')
        );
        
        // Exclude unwanted images
        const isUnwanted = (
          fileName.includes('anime') || // Anime maps
          fileName.includes('manga') || // Manga maps
          fileName.includes('town_map') || // Town map items
          fileName.includes('sprite') || // Sprites
          fileName.includes('icon') || // Icons
          fileName.includes('badge') || // Badge collections
          fileName.includes('gym') || // Gym locations
          info.width < 400 || // Too small for a proper map
          info.height < 300
        );
        
        // Prioritize high-quality game maps
        const isHighQuality = (
          info.width >= 800 || // Large width
          (fileName.includes('artwork') && info.width >= 600) || // Official artwork
          (fileName.includes('map') && fileName.includes(regionKey.toLowerCase()))
        );
        
        // Look for main region maps (often have patterns like "Kanto_Map.png" or "HGSS_Kanto.png")
        const isMainMap = (
          fileName === `file:${regionKey}_map.png` ||
          fileName === `file:${regionKey}map.png` ||
          (fileName.includes(regionKey.toLowerCase()) && fileName.includes('map') && !fileName.includes('town'))
        );
        
        return (isMainMap || (isMapImage && !isUnwanted)) && (isHighQuality || info.width >= 500);
      });

      if (images.length === 0) {
        console.log(`No suitable map images found for ${regionPage}`);
        return null;
      }

      // Sort by quality (prefer larger, official artwork)
      const sortedImages = images.sort((a, b) => {
        const aName = a.title.toLowerCase();
        const bName = b.title.toLowerCase();
        
        // Prioritize artwork
        const aIsArtwork = aName.includes('artwork') || aName.includes('official');
        const bIsArtwork = bName.includes('artwork') || bName.includes('official');
        if (aIsArtwork !== bIsArtwork) return bIsArtwork ? 1 : -1;
        
        // Prioritize game maps over other types
        const aIsGame = aName.includes('game') || aName.includes('bdsp') || 
                       aName.includes('swsh') || aName.includes('sm');
        const bIsGame = bName.includes('game') || bName.includes('bdsp') || 
                       bName.includes('swsh') || bName.includes('sm');
        if (aIsGame !== bIsGame) return bIsGame ? 1 : -1;
        
        // Then by size
        return (b.width * b.height) - (a.width * a.height);
      });

      const mapData = {
        region: regionKey,
        name: regionPage.replace(/_/g, ' '),
        maps: {
          main: '',
          variants: [],
          detailed: []
        }
      };

      // Download multiple map variants
      let downloadCount = 0;
      for (const image of sortedImages.slice(0, 5)) {
        const imageName = image.title.toLowerCase();
        let fileName;
        let category;
        
        if (downloadCount === 0) {
          // Main map
          fileName = `${regionKey}-map-main.png`;
          category = 'main';
        } else if (imageName.includes('town') || imageName.includes('city') || 
                  imageName.includes('route') || imageName.includes('detailed')) {
          // Detailed maps
          fileName = `${regionKey}-map-detailed-${mapData.maps.detailed.length + 1}.png`;
          category = 'detailed';
        } else {
          // Variant maps (different games, etc.)
          const gameMatch = imageName.match(/(bdsp|swsh|sm|usum|xy|oras|bw|b2w2|dppt|hgss|frlg|rse|gsc|rby)/);
          const gameSuffix = gameMatch ? `-${gameMatch[1]}` : `-variant${mapData.maps.variants.length + 1}`;
          fileName = `${regionKey}-map${gameSuffix}.png`;
          category = 'variants';
        }
        
        const localPath = await downloadImage(image.url, fileName, 'maps');
        if (localPath) {
          const imagePath = `/images/scraped/maps/${fileName}`;
          
          if (category === 'main') {
            mapData.maps.main = imagePath;
          } else if (category === 'detailed') {
            mapData.maps.detailed.push({
              path: imagePath,
              type: imageName.includes('town') ? 'towns' : 
                    imageName.includes('route') ? 'routes' : 'detailed'
            });
          } else {
            mapData.maps.variants.push({
              path: imagePath,
              game: imageName.match(/(bdsp|swsh|sm|usum|xy|oras|bw|b2w2|dppt|hgss|frlg|rse|gsc|rby)/)?.[1] || 'unknown'
            });
          }
          
          console.log(`Downloaded ${category} map for ${regionPage}: ${fileName}`);
          downloadCount++;
        }
      }

      if (downloadCount === 0) {
        console.log(`Failed to download any maps for ${regionPage}`);
        return null;
      }

      // Cache the data
      await cacheData(cacheKey, mapData, 24);
      
      return mapData;
      
    } catch (error) {
      console.error(`Error scraping region map ${regionPage}:`, error.message);
      return null;
    }
  }

  // Save all scraped data
  async saveAllData() {
    try {
      // Save individual region files
      for (const [region, mapData] of Object.entries(this.scrapedData)) {
        await saveDataToFile(mapData, `${region}-map.json`, 'maps');
      }
      
      // Save combined file
      await saveDataToFile(this.scrapedData, 'all-region-maps.json', 'maps');
      
      console.log('All region map data saved successfully');
    } catch (error) {
      console.error('Error saving region map data:', error.message);
    }
  }
}

// Export instance and class
export const regionMapScraper = new RegionMapScraper();
export default RegionMapScraper;