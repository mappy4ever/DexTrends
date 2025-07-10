// Archives Category Scraper
// Downloads images directly from Bulbagarden Archives categories

import scraperConfig from './scraperConfig.js';
import {
  fetchMediaWikiApi,
  downloadImage,
  saveDataToFile,
  delay,
  getCachedData,
  cacheData
} from './scraperUtils.js';

class ArchivesCategoryScraper {
  constructor() {
    this.scrapedData = {};
    this.archivesApiUrl = 'https://archives.bulbagarden.net/w/api.php';
    
    // Category mappings - using actual Archives categories
    this.categories = {
      gameCovers: {
        name: 'Game Covers',
        category: 'Category:Game_covers',
        subfolder: 'games/covers',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          
          // Exclude non-English versions
          const excludedLanguages = ['_ja', '_jp', '_ko', '_kr', '_fr', '_de', '_it', '_es', '_zh', '_tc', '_sc', '_pt', '_ru', '_nl'];
          const hasExcludedLanguage = excludedLanguages.some(lang => lower.includes(lang));
          
          // Also exclude common non-English indicators
          const nonEnglishPatterns = [
            'japanese', 'korean', 'french', 'german', 'italian', 'spanish', 
            'chinese', 'portuguese', 'russian', 'dutch', 'taiwanese'
          ];
          const hasNonEnglishPattern = nonEnglishPatterns.some(pattern => lower.includes(pattern));
          
          return (lower.includes('.png') || lower.includes('.jpg')) &&
                 !lower.includes('back') &&
                 !lower.includes('spine') &&
                 !hasExcludedLanguage &&
                 !hasNonEnglishPattern;
        }
      },
      gameLogos: {
        name: 'Game Logos', 
        category: 'Category:Game_logos',
        subfolder: 'games/logos',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          return lower.includes('.png') || lower.includes('.jpg');
        }
      },
      gymBadges: {
        name: 'Gym Badges',
        category: 'Category:Badges',
        subfolder: 'badges',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          return lower.includes('badge') && 
                 !lower.includes('case') && 
                 !lower.includes('collection') &&
                 !lower.includes('trainer') &&
                 !lower.includes('ash') &&
                 !lower.includes('_anime');
        }
      },
      gymLeaderArt: {
        name: 'Gym Leader Artwork',
        category: 'Category:Character_artwork', 
        subfolder: 'gym-leaders',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          
          // Comprehensive list of gym leader names with variations
          const gymLeaderNames = [
            // Kanto
            'brock', 'misty', 'lt_surge', 'lieutenant_surge', 'surge', 'erika', 'koga', 'sabrina', 'blaine', 'giovanni',
            // Johto  
            'falkner', 'bugsy', 'whitney', 'morty', 'chuck', 'jasmine', 'pryce', 'clair',
            // Hoenn
            'roxanne', 'brawly', 'wattson', 'flannery', 'norman', 'winona', 'tate', 'liza', 'tate_and_liza', 'wallace', 'juan',
            // Sinnoh
            'roark', 'gardenia', 'fantina', 'maylene', 'crasher_wake', 'wake', 'byron', 'candice', 'volkner',
            // Unova
            'cilan', 'chili', 'cress', 'lenora', 'burgh', 'elesa', 'clay', 'skyla', 'brycen', 'drayden', 'iris',
            'cheren', 'roxie', 'marlon',
            // Kalos
            'viola', 'grant', 'korrina', 'ramos', 'clemont', 'valerie', 'olympia', 'wulfric',
            // Alola (Trial Captains - often called gym leaders)
            'ilima', 'lana', 'kiawe', 'mallow', 'sophocles', 'acerola', 'mina', 'nanu',
            // Galar
            'milo', 'nessa', 'kabu', 'bea', 'allister', 'opal', 'gordie', 'melony', 'piers', 'raihan',
            // Paldea
            'katy', 'brassius', 'iono', 'kofu', 'larry', 'ryme', 'tulip', 'grusha'
          ];
          
          const hasGymLeaderName = gymLeaderNames.some(name => lower.includes(name));
          
          // Only exclude the most obvious non-artwork files
          const excluded = lower.includes('sprite') || 
                          lower.includes('_ow') || // Overworld
                          lower.includes('_vs') || // VS sprites
                          lower.includes('overworld'); // Overworld sprites
          
          // Just need gym leader name and not be a sprite
          return hasGymLeaderName && !excluded && (lower.includes('.png') || lower.includes('.jpg'));
        }
      },
      eliteFourArt: {
        name: 'Elite Four Artwork',
        category: 'Category:Character_artwork',
        subfolder: 'elite-four', 
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          
          // Look for Elite Four member names
          const eliteFourNames = [
            'lorelei', 'bruno', 'agatha', 'lance', 'will', 'karen',
            'sidney', 'phoebe', 'glacia', 'drake', 'aaron', 'bertha', 'flint', 'lucian',
            'shauntal', 'marshal', 'grimsley', 'caitlin', 'malva', 'siebold', 'wikstrom', 'drasna',
            'hala', 'olivia', 'acerola', 'kahili', 'molayne',
            'rika', 'poppy', 'hassel', 'crispin', 'amarys', 'lacey', 'drayton'
          ];
          
          const hasEliteFourName = eliteFourNames.some(name => lower.includes(name));
          
          // Also check for "elite four" in filename
          const hasEliteFourTerm = lower.includes('elite_four') || lower.includes('elite four');
          
          // Only exclude the most obvious non-artwork files
          const excluded = lower.includes('sprite') || 
                          lower.includes('_ow') ||
                          lower.includes('overworld');
          
          return (hasEliteFourName || hasEliteFourTerm) && !excluded && (lower.includes('.png') || lower.includes('.jpg'));
        }
      },
      championArt: {
        name: 'Champion Artwork',
        category: 'Category:Character_artwork',
        subfolder: 'champions',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          
          // Look for Champion names
          const championNames = [
            'blue', 'lance', 'steven', 'wallace', 'cynthia', 'alder', 'iris', 'diantha',
            'leon', 'geeta', 'nemona', 'kieran', 'red', 'trace', 'kukui', 'hau'
          ];
          
          const hasChampionName = championNames.some(name => lower.includes(name));
          
          // Also check for "champion" in filename
          const hasChampionTerm = lower.includes('champion');
          
          // Only exclude the most obvious non-artwork files
          const excluded = lower.includes('sprite') || 
                          lower.includes('_ow') ||
                          lower.includes('overworld');
          
          return (hasChampionName || hasChampionTerm) && !excluded && (lower.includes('.png') || lower.includes('.jpg'));
        }
      },
      energyCards: {
        name: 'Energy Cards',
        category: 'Category:Energy_cards',
        subfolder: 'energy',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          return lower.includes('energy') && 
                 (lower.includes('.jpg') || lower.includes('.png')) &&
                 !lower.includes('symbol') &&
                 !lower.includes('icon');
        }
      },
      tcgPocketIcons: {
        name: 'TCG Pocket Icons',
        category: 'Category:Pokémon_TCG_Pocket_profile_icons',
        subfolder: 'tcg-pocket/icons',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          return lower.includes('.png');
        }
      },
      tcgPocketRarity: {
        name: 'TCG Pocket Rarity',
        category: 'Category:Pokémon_TCG_Pocket_rarity_icons',
        subfolder: 'tcg-pocket/rarity',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          return lower.includes('.png');
        }
      },
      regionMaps: {
        name: 'Region Maps',
        category: 'Category:Maps',
        subfolder: 'maps',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          
          // Look for region-related terms - be more inclusive
          const regionPatterns = [
            'kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea', 
            'kitakami', 'blueberry', 'region', 'world', 'map', 'overview'
          ];
          
          const hasRegionPattern = regionPatterns.some(pattern => lower.includes(pattern));
          
          // Less restrictive exclusions - only exclude clearly unwanted content
          const excluded = lower.includes('anime') ||
                          lower.includes('logo') ||
                          lower.includes('icon') ||
                          lower.includes('symbol') ||
                          lower.includes('battle') ||
                          lower.includes('sprite');
          
          return hasRegionPattern && !excluded && (lower.includes('.png') || lower.includes('.jpg'));
        }
      },
      typeIcons: {
        name: 'Type Icons',
        category: 'Category:Type_icons',
        subfolder: 'type-icons',
        filter: (fileName) => {
          const lower = fileName.toLowerCase();
          return lower.includes('type') && lower.includes('.png');
        }
      }
    };
  }

  // Fetch category members from Archives
  async fetchCategoryMembers(categoryName, continueFrom = null) {
    const params = {
      action: 'query',
      list: 'categorymembers',
      cmtitle: categoryName,
      cmlimit: 500,
      cmtype: 'file',
      format: 'json',
      origin: '*'
    };

    if (continueFrom) {
      params.cmcontinue = continueFrom;
    }

    try {
      const response = await fetch(`${this.archivesApiUrl}?${new URLSearchParams(params)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching category ${categoryName}:`, error);
      return null;
    }
  }

  // Get all files from a category
  async getAllCategoryFiles(categoryName) {
    const allFiles = [];
    let continueFrom = null;

    do {
      const data = await this.fetchCategoryMembers(categoryName, continueFrom);
      if (!data || !data.query || !data.query.categorymembers) break;

      allFiles.push(...data.query.categorymembers);
      
      // Check if there are more results
      continueFrom = data.continue?.cmcontinue || null;
      
      // Rate limiting
      if (continueFrom) await delay(500);
    } while (continueFrom);

    return allFiles;
  }

  // Get image info from Archives
  async getImageInfo(fileName) {
    const params = {
      action: 'query',
      prop: 'imageinfo',
      titles: fileName,
      iiprop: 'url|size|mime',
      format: 'json',
      origin: '*'
    };

    try {
      const response = await fetch(`${this.archivesApiUrl}?${new URLSearchParams(params)}`);
      const data = await response.json();
      
      if (data.query && data.query.pages) {
        const page = Object.values(data.query.pages)[0];
        if (page.imageinfo && page.imageinfo[0]) {
          return page.imageinfo[0];
        }
      }
    } catch (error) {
      console.error(`Error getting image info for ${fileName}:`, error);
    }
    
    return null;
  }

  // Scrape a specific category
  async scrapeCategory(categoryKey, overrideLimit = null) {
    const category = this.categories[categoryKey];
    if (!category) {
      console.error(`Unknown category: ${categoryKey}`);
      return null;
    }

    console.log(`\nScraping ${category.name} from ${category.category}...`);

    // Check cache
    const cacheKey = `archives-category-${categoryKey}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${category.name}`);
      return cachedData;
    }

    // Get all files in category
    const files = await this.getAllCategoryFiles(category.category);
    console.log(`Found ${files.length} files in ${category.category}`);

    // Filter files
    const filteredFiles = files.filter(file => category.filter(file.title));
    console.log(`${filteredFiles.length} files match filter criteria`);

    // Sort files to prioritize newer games and higher quality
    const sortedFiles = this.sortByPriority(filteredFiles, categoryKey);
    
    const downloadedFiles = [];
    let downloadCount = 0;
    
    // Different limits for different categories
    const categoryLimits = {
      gameCovers: 200,      // Many game covers
      gameLogos: 200,       // Many game logos
      gymLeaderArt: 150,    // Lots of gym leaders across regions
      eliteFourArt: 150,    // Elite Four from all regions
      championArt: 100,     // Champions from all regions
      gymBadges: 100,       // Badges from all regions
      energyCards: 100,     // Various energy card designs
      tcgPocketIcons: 50,   // Limited set
      tcgPocketRarity: 50,  // Limited set
      regionMaps: 100,      // Maps for all regions
      typeIcons: 50         // Type icons are limited
    };
    
    const maxDownloads = overrideLimit || categoryLimits[categoryKey] || 100; // Use override, then category limit, then default

    for (const file of sortedFiles) {
      if (downloadCount >= maxDownloads) {
        console.log(`Reached download limit of ${maxDownloads} for ${category.name}`);
        break;
      }

      // Get image info
      const imageInfo = await this.getImageInfo(file.title);
      if (!imageInfo) continue;

      // Skip small images
      if (imageInfo.width < 100 || imageInfo.height < 100) continue;

      // Generate clean filename
      let cleanName = file.title.replace(/^File:/, '').toLowerCase();
      cleanName = cleanName.replace(/[^a-z0-9\-_.]/g, '-');
      
      // Download image
      const localPath = await downloadImage(imageInfo.url, cleanName, category.subfolder);
      if (localPath) {
        downloadedFiles.push({
          original: file.title,
          local: cleanName,
          path: `/images/scraped/${category.subfolder}/${cleanName}`,
          width: imageInfo.width,
          height: imageInfo.height
        });
        downloadCount++;
        console.log(`Downloaded: ${cleanName}`);
      }

      // Rate limiting
      await delay(scraperConfig.settings.requestDelay);
    }

    const result = {
      category: category.name,
      totalFiles: files.length,
      matchedFiles: filteredFiles.length,
      downloadedFiles: downloadedFiles.length,
      files: downloadedFiles
    };

    // Cache the result
    await cacheData(cacheKey, result, 24);

    return result;
  }

  // Scrape all categories
  async scrapeAllCategories(overrideLimit = null) {
    console.log('Starting Archives category scraping...');
    if (overrideLimit) {
      console.log(`Using override limit: ${overrideLimit} images per category`);
    }
    
    for (const categoryKey of Object.keys(this.categories)) {
      const result = await this.scrapeCategory(categoryKey, overrideLimit);
      if (result) {
        this.scrapedData[categoryKey] = result;
      }
    }

    // Save all data
    await this.saveAllData();
    console.log('\nArchives category scraping completed!');
    
    return this.scrapedData;
  }

  // Scrape specific categories
  async scrapeCategories(categoryKeys, overrideLimit = null) {
    console.log(`Starting Archives category scraping for: ${categoryKeys.join(', ')}`);
    if (overrideLimit) {
      console.log(`Using override limit: ${overrideLimit} images per category`);
    }
    
    for (const categoryKey of categoryKeys) {
      const result = await this.scrapeCategory(categoryKey, overrideLimit);
      if (result) {
        this.scrapedData[categoryKey] = result;
      }
    }

    // Save data
    await this.saveAllData();
    console.log('\nSelected category scraping completed!');
    
    return this.scrapedData;
  }

  // Sort files by priority (newer games first, higher quality)
  sortByPriority(files, categoryKey) {
    const gameOrder = [
      'scarlet_violet', 'sword_shield', 'brilliant_diamond_shining_pearl',
      'legends_arceus', 'lets_go', 'ultra_sun_ultra_moon', 'sun_moon',
      'omega_ruby_alpha_sapphire', 'x_y', 'black_2_white_2', 'black_white',
      'heartgold_soulsilver', 'platinum', 'diamond_pearl', 
      'firered_leafgreen', 'emerald', 'ruby_sapphire',
      'crystal', 'gold_silver', 'yellow', 'red_blue', 'red_green'
    ];
    
    return files.sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      
      // For character artwork, prioritize by game recency
      if (categoryKey.includes('Art') || categoryKey === 'gymLeaderArt' || 
          categoryKey === 'eliteFourArt' || categoryKey === 'championArt') {
        const aGameIndex = gameOrder.findIndex(game => aLower.includes(game));
        const bGameIndex = gameOrder.findIndex(game => bLower.includes(game));
        
        // If both have game patterns, sort by game recency
        if (aGameIndex !== -1 && bGameIndex !== -1 && aGameIndex !== bGameIndex) {
          return aGameIndex - bGameIndex;
        }
      }
      
      // For all categories, deprioritize certain patterns
      const aIsLowPriority = aLower.includes('concept') || aLower.includes('beta') || 
                            aLower.includes('unused') || aLower.includes('early');
      const bIsLowPriority = bLower.includes('concept') || bLower.includes('beta') || 
                            bLower.includes('unused') || bLower.includes('early');
      
      if (aIsLowPriority !== bIsLowPriority) {
        return aIsLowPriority ? 1 : -1;
      }
      
      // Default to alphabetical
      return a.title.localeCompare(b.title);
    });
  }

  // Save all scraped data
  async saveAllData() {
    try {
      await saveDataToFile(this.scrapedData, 'archives-categories.json', 'archives');
      
      // Save individual category files
      for (const [key, data] of Object.entries(this.scrapedData)) {
        await saveDataToFile(data, `archives-${key}.json`, 'archives');
      }
      
      console.log('Archives category data saved successfully');
    } catch (error) {
      console.error('Error saving archives data:', error.message);
    }
  }
}

// Export instance and class
export const archivesCategoryScraper = new ArchivesCategoryScraper();
export default ArchivesCategoryScraper;