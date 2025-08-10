// Game Scraper
// Downloads Pokemon game data and images from Bulbapedia

import logger from '../logger';
import scraperConfig from './scraperConfig';
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
} from './scraperUtils';

// Interfaces for type safety
interface GameImages {
  cover: string;
  logo: string;
  artwork: string[];
}

interface GameData {
  id: string;
  title: string;
  region: string;
  platform: string;
  releaseDate: string;
  generation: number;
  description: string;
  features: string[];
  images: GameImages;
}

interface PageRevision {
  slots: {
    main: {
      content: string;
    };
  };
}

interface WikiPage {
  pageid: number;
  title: string;
  missing?: boolean;
  revisions: PageRevision[];
}

interface MediaWikiPageResponse {
  query?: {
    pages: WikiPage[];
  };
}

interface Infobox {
  region?: string;
  platform?: string;
  console?: string;
  release?: string;
  releasedate?: string;
  japan?: string;
  jpdate?: string;
  generation?: string;
  [key: string]: string | undefined;
}

class GameScraper {
  private scrapedData: GameData[];

  constructor() {
    this.scrapedData = [];
  }

  // Scrape all games
  async scrapeAllGames(): Promise<GameData[]> {
    logger.debug('Starting game scraping...');
    
    for (const gameTitle of scraperConfig.targets.games.mainSeries) {
      const gameData = await this.scrapeGame(gameTitle);
      if (gameData) {
        this.scrapedData.push(gameData);
      }
      
      // Rate limiting
      await delay(scraperConfig.settings.requestDelay);
    }
    
    // Save all data
    await this.saveAllData();
    logger.debug('Game scraping completed!');
    
    return this.scrapedData;
  }

  // Scrape individual game
  async scrapeGame(pageTitle: string): Promise<GameData | null> {
    try {
      logger.debug(`Scraping game: ${pageTitle}`);
      
      // Check cache first
      const cacheKey = `game-${pageTitle}`;
      const cachedData = await getCachedData<GameData>(cacheKey);
      if (cachedData) {
        logger.debug(`Using cached data for ${pageTitle}`);
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
      }) as MediaWikiPageResponse;

      if (!pageData || !pageData.query || !pageData.query.pages || pageData.query.pages.length === 0) {
        logger.error(`No data found for ${pageTitle}`);
        return null;
      }

      const page = pageData.query.pages[0];
      if (page.missing) {
        logger.error(`Page not found: ${pageTitle}`);
        return null;
      }

      const wikitext = page.revisions[0].slots.main.content;
      
      // Parse game data
      const gameData = await this.parseGameData(pageTitle, wikitext);
      
      // Download images
      await this.downloadGameImages(pageTitle, gameData);
      
      // Cache the data
      await cacheData(cacheKey, gameData, 24);
      
      return gameData;
      
    } catch (error) {
      logger.error(`Error scraping game ${pageTitle}:`, { error: (error as Error).message });
      return null;
    }
  }

  // Parse game data from wikitext
  private async parseGameData(pageTitle: string, wikitext: string): Promise<GameData> {
    const data: GameData = {
      id: '',
      title: '',
      region: '',
      platform: '',
      releaseDate: '',
      generation: 1,
      description: '',
      features: [],
      images: {
        cover: '',
        logo: '',
        artwork: []
      }
    };
    
    // Basic info
    data.id = pageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    data.title = pageTitle.replace(/_/g, ' ');

    // Parse game infobox
    const infobox = parseInfobox(wikitext, 'Gamebox') as Infobox || 
                   parseInfobox(wikitext, 'Game') as Infobox ||
                   parseInfobox(wikitext, 'Infobox') as Infobox;

    if (infobox) {
      // Extract game information
      data.region = this.extractRegion(infobox, wikitext);
      data.platform = cleanWikitext(infobox.platform || infobox.console || '');
      data.releaseDate = this.extractReleaseDate(infobox, wikitext);
      data.generation = this.extractGeneration(infobox, wikitext);
    }

    // Extract description from first paragraph
    data.description = this.extractDescription(wikitext);
    
    // Extract features
    data.features = this.extractFeatures(wikitext);

    return data;
  }

  // Extract region from game data
  private extractRegion(infobox: Infobox, wikitext: string): string {
    // Check infobox first
    if (infobox.region) {
      return cleanWikitext(infobox.region);
    }
    
    // Look for region mentions in text
    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea', 'Hisui'];
    for (const region of regions) {
      if (wikitext.includes(region)) {
        return region;
      }
    }
    
    return '';
  }

  // Extract release date
  private extractReleaseDate(infobox: Infobox, wikitext: string): string {
    // Check various infobox fields
    const dateFields: (keyof Infobox)[] = ['release', 'releasedate', 'japan', 'jpdate'];
    for (const field of dateFields) {
      if (infobox[field]) {
        const dateText = cleanWikitext(infobox[field] as string);
        // Extract year at minimum
        const yearMatch = dateText.match(/(\d{4})/);
        return yearMatch ? yearMatch[1] : dateText;
      }
    }
    
    // Look for date patterns in text
    const datePattern = /(\d{4})/;
    const match = wikitext.match(datePattern);
    return match ? match[1] : '';
  }

  // Extract generation
  private extractGeneration(infobox: Infobox, wikitext: string): number {
    // Check infobox
    if (infobox.generation) {
      const genText = cleanWikitext(infobox.generation);
      const genMatch = genText.match(/(\d+)/);
      return genMatch ? parseInt(genMatch[1]) : 1;
    }
    
    // Determine by game title patterns
    const title = wikitext.toLowerCase();
    if (title.includes('red') || title.includes('blue') || title.includes('yellow')) return 1;
    if (title.includes('gold') || title.includes('silver') || title.includes('crystal')) return 2;
    if (title.includes('ruby') || title.includes('sapphire') || title.includes('emerald')) return 3;
    if (title.includes('diamond') || title.includes('pearl') || title.includes('platinum')) return 4;
    if (title.includes('black') || title.includes('white')) return 5;
    if (title.includes('x') || title.includes('y')) return 6;
    if (title.includes('sun') || title.includes('moon')) return 7;
    if (title.includes('sword') || title.includes('shield')) return 8;
    if (title.includes('scarlet') || title.includes('violet')) return 9;
    
    return 1;
  }

  // Extract description from wikitext
  private extractDescription(wikitext: string): string {
    // Find first substantial paragraph
    const lines = wikitext.split('\n');
    for (const line of lines) {
      const cleaned = cleanWikitext(line.trim());
      if (cleaned.length > 100 && !cleaned.startsWith('{{') && !cleaned.includes('|')) {
        return cleaned.substring(0, 300) + (cleaned.length > 300 ? '...' : '');
      }
    }
    return '';
  }

  // Extract game features
  private extractFeatures(wikitext: string): string[] {
    const features: string[] = [];
    
    // Common feature keywords
    const featureKeywords = [
      'double battles',
      'mega evolution',
      'z-moves',
      'dynamax',
      'terastallization',
      'day/night cycle',
      'breeding',
      'contests',
      'battle frontier',
      'underground',
      'safari zone',
      'global trade',
      'wonder trade',
      'pss',
      'festival plaza',
      'camp',
      'wild area',
      'raid battles',
      'online trading',
      'multiplayer'
    ];
    
    const text = wikitext.toLowerCase();
    for (const keyword of featureKeywords) {
      if (text.includes(keyword)) {
        features.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
    
    return features.slice(0, 8); // Limit features
  }

  // Download game images
  private async downloadGameImages(pageTitle: string, gameData: GameData): Promise<void> {
    try {
      logger.debug(`Downloading images for ${pageTitle}...`);
      
      // Get all images from the page
      const images = await getPageImages(pageTitle, (title: string, info: { width: number; height: number }) => {
        const fileName = title.toLowerCase();
        // Filter for cover art and logos
        return (
          fileName.includes('cover') ||
          fileName.includes('box') ||
          fileName.includes('logo') ||
          fileName.includes('.png')
        ) && info.width > 200; // Minimum size filter
      });

      if (images.length === 0) {
        logger.debug(`No suitable images found for ${pageTitle}`);
        return;
      }

      // Categorize images
      const coverImages = images.filter(img => 
        img.title.toLowerCase().includes('cover') || 
        img.title.toLowerCase().includes('box')
      );
      
      const logoImages = images.filter(img => 
        img.title.toLowerCase().includes('logo')
      );

      // Download cover image
      if (coverImages.length > 0) {
        const bestCover = coverImages.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
        const fileName = getImageFileName(bestCover.url, `${gameData.id}-cover`);
        const localPath = await downloadImage(bestCover.url, fileName, 'games');
        
        if (localPath) {
          gameData.images.cover = `/images/scraped/games/${fileName}`;
          logger.debug(`Downloaded cover for ${pageTitle}: ${fileName}`);
        }
      }

      // Download logo image
      if (logoImages.length > 0) {
        const bestLogo = logoImages.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
        const fileName = getImageFileName(bestLogo.url, `${gameData.id}-logo`);
        const localPath = await downloadImage(bestLogo.url, fileName, 'games');
        
        if (localPath) {
          gameData.images.logo = `/images/scraped/games/${fileName}`;
          logger.debug(`Downloaded logo for ${pageTitle}: ${fileName}`);
        }
      }

      // Download additional artwork (limited to 3)
      const artworkImages = images
        .filter(img => !coverImages.includes(img) && !logoImages.includes(img))
        .slice(0, 3);
      
      for (let i = 0; i < artworkImages.length; i++) {
        const artwork = artworkImages[i];
        const fileName = getImageFileName(artwork.url, `${gameData.id}-artwork-${i + 1}`);
        const localPath = await downloadImage(artwork.url, fileName, 'games');
        
        if (localPath) {
          gameData.images.artwork.push(`/images/scraped/games/${fileName}`);
        }
      }

    } catch (error) {
      logger.error(`Error downloading images for ${pageTitle}:`, { error: (error as Error).message });
    }
  }

  // Save all scraped data
  private async saveAllData(): Promise<void> {
    try {
      await saveDataToFile(this.scrapedData, 'all-games.json', 'games');
      logger.debug('All game data saved successfully');
    } catch (error) {
      logger.error('Error saving game data:', { error: (error as Error).message });
    }
  }

  // Load saved data
  async loadSavedData(): Promise<GameData[] | null> {
    try {
      return await loadDataFromFile<GameData[]>('all-games.json', 'games');
    } catch (error) {
      logger.error('Error loading game data:', { error: (error as Error).message });
      return null;
    }
  }
}

// Export instance and class
export const gameScraper = new GameScraper();
export default GameScraper;