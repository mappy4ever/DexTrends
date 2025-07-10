// Gym Leader Scraper
// Downloads gym leader data and images from Bulbapedia

import scraperConfig from './scraperConfig.js';
import {
  fetchMediaWikiApi,
  getPageImages,
  parseInfobox,
  cleanWikitext,
  downloadImage,
  getImageFileName,
  saveDataToFile,
  loadDataFromFile,
  delay,
  getCachedData,
  cacheData
} from './scraperUtils.js';

class GymLeaderScraper {
  constructor() {
    this.scrapedData = {};
  }

  // Scrape all gym leaders
  async scrapeAllGymLeaders() {
    console.log('Starting gym leader scraping...');
    
    for (const [region, data] of Object.entries(scraperConfig.targets.gymLeaders)) {
      console.log(`\nScraping ${region} gym leaders...`);
      this.scrapedData[region] = [];
      
      for (const leaderPage of data.pages) {
        const leaderData = await this.scrapeGymLeader(leaderPage, region);
        if (leaderData) {
          this.scrapedData[region].push(leaderData);
        }
        
        // Rate limiting
        await delay(scraperConfig.settings.requestDelay);
      }
    }
    
    // Save all data
    await this.saveAllData();
    console.log('\nGym leader scraping completed!');
    
    return this.scrapedData;
  }

  // Scrape individual gym leader
  async scrapeGymLeader(pageTitle, region) {
    try {
      console.log(`Scraping gym leader: ${pageTitle}`);
      
      // Check cache first
      const cacheKey = `gym-leader-${pageTitle}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${pageTitle}`);
        return cachedData;
      }

      // Get page content
      const pageData = await fetchMediaWikiApi({
        action: 'query',
        prop: 'revisions|images|categories',
        titles: pageTitle,
        rvprop: 'content',
        rvslots: 'main',
        formatversion: '2'
      });

      if (!pageData || !pageData.query || !pageData.query.pages || pageData.query.pages.length === 0) {
        console.error(`No data found for ${pageTitle}`);
        return null;
      }

      const page = pageData.query.pages[0];
      if (page.missing) {
        console.error(`Page not found: ${pageTitle}`);
        return null;
      }

      const wikitext = page.revisions[0].slots.main.content;
      
      // Parse gym leader data
      const gymLeaderData = await this.parseGymLeaderData(pageTitle, wikitext, region);
      
      // Extract main image from infobox
      const infoboxImage = this.extractInfoboxImage(wikitext);
      if (infoboxImage) {
        gymLeaderData.infoboxImage = infoboxImage;
      }
      
      // Download images
      await this.downloadGymLeaderImages(pageTitle, gymLeaderData);
      
      // Cache the data
      await cacheData(cacheKey, gymLeaderData, 24);
      
      return gymLeaderData;
      
    } catch (error) {
      console.error(`Error scraping gym leader ${pageTitle}:`, error.message);
      return null;
    }
  }

  // Parse gym leader data from wikitext
  async parseGymLeaderData(pageTitle, wikitext, region) {
    const data = { ...scraperConfig.templates.gymLeader };
    
    // Basic info
    data.id = pageTitle.toLowerCase().replace(/_/g, '-');
    data.name = pageTitle.replace(/_/g, ' ');
    data.region = region;

    // Parse character infobox
    const infobox = parseInfobox(wikitext, 'Character') || 
                   parseInfobox(wikitext, 'CharacterInfobox') ||
                   parseInfobox(wikitext, 'Trainer');

    if (infobox) {
      // Extract basic information
      data.city = cleanWikitext(infobox.location || infobox.gym || infobox.hometown || '');
      data.type = this.extractType(infobox, wikitext);
      data.badge = this.extractBadge(infobox, wikitext);
      data.quote = cleanWikitext(infobox.quote || '');
      data.generation = this.extractGeneration(infobox, wikitext, region);
    }

    // Extract description from first paragraph
    data.description = this.extractDescription(wikitext);
    
    // Extract team data
    data.team = await this.extractTeamData(wikitext);

    return data;
  }

  // Extract Pokemon type specialization
  extractType(infobox, wikitext) {
    // Check infobox first
    if (infobox.type) {
      return cleanWikitext(infobox.type).toLowerCase();
    }
    
    // Look for type mentions in text
    const typePattern = /(Fire|Water|Grass|Electric|Psychic|Ice|Dragon|Dark|Fighting|Poison|Ground|Flying|Bug|Rock|Ghost|Steel|Fairy|Normal)-type/i;
    const match = wikitext.match(typePattern);
    return match ? match[1].toLowerCase() : 'normal';
  }

  // Extract badge name
  extractBadge(infobox, wikitext) {
    // Check infobox
    if (infobox.badge) {
      return cleanWikitext(infobox.badge);
    }
    
    // Look for badge mentions
    const badgePattern = /(\w+)\s+Badge/i;
    const match = wikitext.match(badgePattern);
    return match ? match[1] + ' Badge' : '';
  }

  // Extract generation
  extractGeneration(infobox, wikitext, region) {
    const regionToGen = {
      kanto: 1,
      johto: 2,
      hoenn: 3,
      sinnoh: 4,
      unova: 5,
      kalos: 6,
      alola: 7,
      galar: 8,
      paldea: 9
    };
    
    return regionToGen[region] || 1;
  }

  // Extract main image from infobox
  extractInfoboxImage(wikitext) {
    // Look for image parameter in Character infobox
    const infoboxMatch = wikitext.match(/\{\{(Character|CharacterInfobox|Trainer)[^}]*\|image\s*=\s*([^\n\|]+)/i);
    if (infoboxMatch && infoboxMatch[2]) {
      let imageName = infoboxMatch[2].trim();
      // Remove [[File: or File: prefix
      imageName = imageName.replace(/\[\[File:|File:/gi, '').replace(/\]\]/, '').trim();
      // Remove any size parameters
      imageName = imageName.split('|')[0].trim();
      return imageName;
    }
    return null;
  }

  // Extract description from wikitext
  extractDescription(wikitext) {
    // Find first substantial paragraph
    const lines = wikitext.split('\n');
    for (const line of lines) {
      const cleaned = cleanWikitext(line.trim());
      if (cleaned.length > 50 && !cleaned.startsWith('{{') && !cleaned.includes('|')) {
        return cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '');
      }
    }
    return '';
  }

  // Extract team data (simplified)
  async extractTeamData(wikitext) {
    const team = [];
    
    // Look for Pokemon tables or templates
    const pokemonPattern = /{{Pokémon([^}]+)}}/g;
    let match;
    
    while ((match = pokemonPattern.exec(wikitext)) !== null) {
      const pokemonData = this.parsePokemonTemplate(match[1]);
      if (pokemonData) {
        team.push(pokemonData);
      }
    }
    
    return team.slice(0, 6); // Limit to 6 Pokemon
  }

  // Parse Pokemon template data
  parsePokemonTemplate(templateContent) {
    const data = {};
    const lines = templateContent.split('|');
    
    for (const line of lines) {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key && value) {
        switch (key.toLowerCase()) {
          case 'pokemon':
          case 'name':
            data.name = cleanWikitext(value);
            break;
          case 'level':
            data.level = parseInt(cleanWikitext(value)) || 50;
            break;
          case 'type1':
            data.type1 = cleanWikitext(value).toLowerCase();
            break;
          case 'type2':
            data.type2 = cleanWikitext(value).toLowerCase();
            break;
          case 'ability':
            data.ability = cleanWikitext(value);
            break;
        }
      }
    }
    
    return data.name ? data : null;
  }

  // Download gym leader images
  async downloadGymLeaderImages(pageTitle, gymLeaderData) {
    try {
      console.log(`Downloading images for ${pageTitle}...`);
      
      // First, try to download the infobox image if we found one
      if (gymLeaderData.infoboxImage) {
        console.log(`Found infobox image: ${gymLeaderData.infoboxImage}`);
        
        // Get info for the specific infobox image
        const infoboxImageData = await fetchMediaWikiApi({
          action: 'query',
          prop: 'imageinfo',
          titles: `File:${gymLeaderData.infoboxImage}`,
          iiprop: 'url|size|mime',
          iiurlwidth: scraperConfig.settings.imageSizes.large
        });
        
        if (infoboxImageData && infoboxImageData.query && infoboxImageData.query.pages) {
          const imagePage = Object.values(infoboxImageData.query.pages)[0];
          if (imagePage && imagePage.imageinfo && imagePage.imageinfo[0]) {
            const info = imagePage.imageinfo[0];
            const fileName = `${gymLeaderData.region}-${gymLeaderData.id}-main.png`;
            const localPath = await downloadImage(info.url, fileName, 'gym-leaders');
            
            if (localPath) {
              gymLeaderData.image = `/images/scraped/gym-leaders/${fileName}`;
              console.log(`Downloaded main image from infobox for ${pageTitle}: ${fileName}`);
              return; // If we got the infobox image, we're done
            }
          }
        }
      }
      
      // If no infobox image or download failed, fall back to searching all images
      console.log(`Searching for images on ${pageTitle} page...`);
      
      // Get all images from the page
      const images = await getPageImages(pageTitle, (title, info) => {
        const fileName = title.toLowerCase();
        const cleanName = pageTitle.toLowerCase().replace(/_/g, ' ');
        
        // Exclude Pokemon images
        const isPokemonImage = /\d{3,4}[a-zA-Z]+\.png/i.test(title) || // Pokemon number pattern (e.g., 0095Onix.png)
                              fileName.includes('type_') || // Type icons
                              fileName.includes('bag_') || // Item sprites
                              fileName.includes('_sprite') || // Pokemon sprites
                              fileName.includes('spr_') || // Sprite files
                              fileName.includes('menu'); // Menu sprites
        
        if (isPokemonImage) return false;
        
        // Priority patterns for high-quality full artwork
        const gameVersions = ['black_white', 'black_2_white_2', 'heartgold_soulsilver', 
                             'sun_moon', 'ultra_sun_ultra_moon', 'sword_shield',
                             'brilliant_diamond_shining_pearl', 'scarlet_violet',
                             'omega_ruby_alpha_sapphire', 'x_y', 'diamond_pearl_platinum',
                             'firered_leafgreen', 'ruby_sapphire_emerald', 'gold_silver_crystal',
                             'red_blue_yellow', 'let\'s_go'];
        
        // Check if it's a game-specific full artwork
        const isGameArtwork = gameVersions.some(game => fileName.includes(game));
        
        // Exclude anime/manga/promotional images
        const isPromoOrAnime = fileName.includes('_jnm') || fileName.includes('_pg') || 
                              fileName.includes('anime') || fileName.includes('manga') ||
                              fileName.includes('promo') || fileName.includes('tcg') ||
                              fileName.includes('adventures');
        
        // Exclude small sprites and icons
        const isSmallSprite = (
          fileName.includes('_ow') || // Overworld sprites
          fileName.includes('vstrainer') || // VS trainer sprites
          fileName.includes('spr_') || // Sprite prefix
          (info.width < 150 && info.height < 200) || // Too small
          fileName.includes('_icon') || // Icons
          fileName.includes('_face') // Face sprites
        );
        
        if (isSmallSprite || isPromoOrAnime) return false;
        
        // Include gym leader artwork with better prioritization
        const isGymLeaderArt = (
          // PRIORITY 1: Game-specific artwork (like Black_White_Drayden.png)
          isGameArtwork && 
          (fileName.includes(cleanName) || fileName.includes(pageTitle.toLowerCase().replace(/_/g, ''))) &&
          info.width >= 200 && 
          info.height >= 250 &&
          !fileName.includes('back') &&
          !fileName.includes('_vs')
        ) || (
          // PRIORITY 2: Official artwork
          (fileName.includes(cleanName) || fileName.includes(pageTitle.toLowerCase())) &&
          (fileName.includes('artwork') || fileName.includes('official')) &&
          info.width >= 200 && info.height >= 250 &&
          !fileName.includes('_vs') && !fileName.includes('battle') && !fileName.includes('back')
        ) || (
          // PRIORITY 3: Other large images on their page
          (fileName.includes(cleanName) || fileName.includes(pageTitle.toLowerCase())) &&
          info.width >= 200 && info.height >= 250 &&
          !fileName.includes('_vs') && !fileName.includes('battle') && !fileName.includes('back') &&
          !isPromoOrAnime
        );
        
        return isGymLeaderArt;
      });

      if (images.length === 0) {
        console.log(`No suitable images found for ${pageTitle}`);
        // Debug: Show all images that were rejected
        const allImages = await getPageImages(pageTitle, () => true);
        console.log(`Total images on page: ${allImages.length}`);
        if (allImages.length > 0 && allImages.length < 20) {
          console.log('Available images:', allImages.map(img => ({
            title: img.title,
            width: img.width,
            height: img.height
          })));
        }
        return;
      }

      // Sort images by quality criteria
      const sortedImages = images.sort((a, b) => {
        const aName = a.title.toLowerCase();
        const bName = b.title.toLowerCase();
        
        // Deprioritize back sprites and VS sprites
        const aIsBack = aName.includes('back') || aName.includes('_b.png');
        const bIsBack = bName.includes('back') || bName.includes('_b.png');
        if (aIsBack !== bIsBack) return aIsBack ? 1 : -1;
        
        // Deprioritize promotional/anime images
        const aIsPromo = aName.includes('_jnm') || aName.includes('_pg') || 
                        aName.includes('anime') || aName.includes('tcg');
        const bIsPromo = bName.includes('_jnm') || bName.includes('_pg') || 
                        bName.includes('anime') || bName.includes('tcg');
        if (aIsPromo !== bIsPromo) return aIsPromo ? 1 : -1;
        
        // HIGHEST PRIORITY: Main game artwork (Black_White_Name.png format)
        const gameVersions = ['black_white', 'black_2_white_2', 'sun_moon', 'ultra_sun_ultra_moon',
                             'sword_shield', 'scarlet_violet', 'brilliant_diamond_shining_pearl',
                             'x_y', 'omega_ruby_alpha_sapphire', 'heartgold_soulsilver'];
        
        const aIsGameArt = gameVersions.some(v => aName.includes(v));
        const bIsGameArt = gameVersions.some(v => bName.includes(v));
        if (aIsGameArt !== bIsGameArt) return bIsGameArt ? 1 : -1;
        
        // If both are game art, prefer specific games
        if (aIsGameArt && bIsGameArt) {
          const aGameIndex = gameVersions.findIndex(v => aName.includes(v));
          const bGameIndex = gameVersions.findIndex(v => bName.includes(v));
          if (aGameIndex !== bGameIndex) return aGameIndex - bGameIndex;
        }
        
        // Then sort by size (larger is better)
        return (b.width * b.height) - (a.width * a.height);
      });

      // Download the best image and optionally additional artwork
      let mainImageDownloaded = false;
      const downloadedImages = [];
      
      for (let i = 0; i < Math.min(sortedImages.length, 3); i++) {
        const image = sortedImages[i];
        const imageName = image.title.toLowerCase();
        
        // Skip if it's a back sprite and we already have a main image
        if (mainImageDownloaded && (imageName.includes('back') || imageName.includes('_b.png'))) {
          continue;
        }
        
        let fileName;
        if (!mainImageDownloaded) {
          // Main image uses standard naming
          fileName = `${gymLeaderData.region}-${gymLeaderData.id}-main.png`;
          mainImageDownloaded = true;
          gymLeaderData.image = `/images/scraped/gym-leaders/${fileName}`;
        } else {
          // Additional images include game version or number
          const gameMatch = imageName.match(/(black_white|sun_moon|sword_shield|scarlet_violet|heartgold_soulsilver)/);
          const gameSuffix = gameMatch ? `-${gameMatch[1].replace(/_/g, '-')}` : `-alt${i}`;
          fileName = `${gymLeaderData.region}-${gymLeaderData.id}${gameSuffix}.png`;
          
          // Store additional images
          if (!gymLeaderData.additionalImages) {
            gymLeaderData.additionalImages = [];
          }
          gymLeaderData.additionalImages.push(`/images/scraped/gym-leaders/${fileName}`);
        }
        
        const localPath = await downloadImage(image.url, fileName, 'gym-leaders');
        if (localPath) {
          downloadedImages.push(fileName);
          console.log(`Downloaded ${mainImageDownloaded && i > 0 ? 'additional' : 'main'} image for ${pageTitle}: ${fileName}`);
        }
      }
      
      if (downloadedImages.length === 0) {
        console.log(`Failed to download any images for ${pageTitle}`);
      }

    } catch (error) {
      console.error(`Error downloading images for ${pageTitle}:`, error.message);
    }
  }

  // Save all scraped data
  async saveAllData() {
    try {
      // Save individual region files
      for (const [region, leaders] of Object.entries(this.scrapedData)) {
        await saveDataToFile(leaders, `${region}-gym-leaders.json`, 'gym-leaders');
      }
      
      // Save combined file
      await saveDataToFile(this.scrapedData, 'all-gym-leaders.json', 'gym-leaders');
      
      console.log('All gym leader data saved successfully');
    } catch (error) {
      console.error('Error saving gym leader data:', error.message);
    }
  }

  // Load saved data
  async loadSavedData(region = null) {
    try {
      if (region) {
        return await loadDataFromFile(`${region}-gym-leaders.json`, 'gym-leaders');
      } else {
        return await loadDataFromFile('all-gym-leaders.json', 'gym-leaders');
      }
    } catch (error) {
      console.error('Error loading gym leader data:', error.message);
      return null;
    }
  }
}

// Export instance and class
export const gymLeaderScraper = new GymLeaderScraper();
export default GymLeaderScraper;