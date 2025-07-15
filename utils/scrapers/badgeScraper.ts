// Badge Scraper
// Downloads high-quality gym badge images from Bulbapedia

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
interface BadgeData {
  id: string;
  name: string;
  region: string;
  gymLeader: string;
  type: string;
  description: string;
  image?: string;
}

interface ScrapedBadgeData {
  [region: string]: BadgeData[];
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
  leader?: string;
  gym?: string;
  type?: string;
  description?: string;
  effect?: string;
  [key: string]: string | undefined;
}

class BadgeScraper {
  private scrapedData: ScrapedBadgeData;

  constructor() {
    this.scrapedData = {};
  }

  // Scrape all badges
  async scrapeAllBadges(): Promise<ScrapedBadgeData> {
    console.log('Starting badge scraping...');
    
    for (const [region, badges] of Object.entries(scraperConfig.targets.badges)) {
      console.log(`\nScraping ${region} badges...`);
      this.scrapedData[region] = [];
      
      for (const badgePage of badges) {
        const badgeData = await this.scrapeBadge(badgePage, region);
        if (badgeData) {
          this.scrapedData[region].push(badgeData);
        }
        
        // Rate limiting
        await delay(scraperConfig.settings.requestDelay);
      }
    }
    
    // Save all data
    await this.saveAllData();
    console.log('\nBadge scraping completed!');
    
    return this.scrapedData;
  }

  // Scrape individual badge
  async scrapeBadge(pageTitle: string, region: string): Promise<BadgeData | null> {
    try {
      console.log(`Scraping badge: ${pageTitle}`);
      
      // Check cache first
      const cacheKey = `badge-${pageTitle}`;
      const cachedData = await getCachedData<BadgeData>(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${pageTitle}`);
        return cachedData;
      }

      // Get page content
      const pageData = await fetchMediaWikiApi({
        action: 'query',
        prop: 'revisions|images',
        titles: pageTitle,
        rvprop: 'content',
        rvslots: 'main',
        formatversion: '2'
      }) as MediaWikiPageResponse;

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
      
      // Parse badge data
      const badgeData = await this.parseBadgeData(pageTitle, wikitext, region);
      
      // Download images
      await this.downloadBadgeImages(pageTitle, badgeData);
      
      // Cache the data
      await cacheData(cacheKey, badgeData, 24);
      
      return badgeData;
      
    } catch (error) {
      console.error(`Error scraping badge ${pageTitle}:`, (error as Error).message);
      return null;
    }
  }

  // Parse badge data from wikitext
  private async parseBadgeData(pageTitle: string, wikitext: string, region: string): Promise<BadgeData> {
    const data: BadgeData = { 
      id: '',
      name: '',
      region: '',
      gymLeader: '',
      type: '',
      description: ''
    };
    
    // Basic info
    data.id = pageTitle.toLowerCase().replace(/_/g, '-').replace(/-badge$/, '');
    data.name = pageTitle.replace(/_/g, ' ');
    data.region = region;

    // Parse badge infobox
    const infobox = parseInfobox(wikitext, 'Badge') as Infobox || 
                   parseInfobox(wikitext, 'Item') as Infobox ||
                   parseInfobox(wikitext, 'Infobox') as Infobox;

    if (infobox) {
      // Extract badge information
      data.gymLeader = cleanWikitext(infobox.leader || infobox.gym || '');
      data.type = this.extractType(infobox, wikitext);
      data.description = cleanWikitext(infobox.description || infobox.effect || '');
    }

    // Extract description from first paragraph if not found
    if (!data.description) {
      data.description = this.extractDescription(wikitext);
    }

    return data;
  }

  // Extract type from badge
  private extractType(infobox: Infobox, wikitext: string): string {
    // Check infobox first
    if (infobox.type) {
      return cleanWikitext(infobox.type).toLowerCase();
    }
    
    // Look for type mentions in text
    const typePattern = /(Fire|Water|Grass|Electric|Psychic|Ice|Dragon|Dark|Fighting|Poison|Ground|Flying|Bug|Rock|Ghost|Steel|Fairy|Normal)-type/i;
    const match = wikitext.match(typePattern);
    return match ? match[1].toLowerCase() : '';
  }

  // Extract description
  private extractDescription(wikitext: string): string {
    const lines = wikitext.split('\n');
    for (const line of lines) {
      const cleaned = cleanWikitext(line.trim());
      if (cleaned.length > 30 && !cleaned.startsWith('{{') && !cleaned.includes('|')) {
        return cleaned.substring(0, 150) + (cleaned.length > 150 ? '...' : '');
      }
    }
    return '';
  }

  // Download badge images
  private async downloadBadgeImages(pageTitle: string, badgeData: BadgeData): Promise<void> {
    try {
      console.log(`Downloading images for ${pageTitle}...`);
      
      // Get all images from the page
      const images = await getPageImages(pageTitle, (title: string, info: { width: number; height: number }) => {
        const fileName = title.toLowerCase();
        
        // The main badge image usually has the exact badge name
        const badgeName = pageTitle.toLowerCase().replace(/_/g, ' ');
        
        // Filter for badge images
        const isBadgeImage = (
          // Direct badge image (e.g., Boulder_Badge.png)
          fileName === pageTitle.toLowerCase() + '.png' ||
          // Contains badge name
          (fileName.includes('badge') && fileName.includes(badgeData.id)) ||
          // Generic badge image on the page
          (fileName.includes(badgeData.id) && fileName.includes('.png'))
        );
        
        // Exclude unwanted images
        const isUnwanted = fileName.includes('sprite') || 
                          fileName.includes('spr_') ||
                          fileName.includes('collection') || // Badge collections
                          fileName.includes('case') || // Badge cases
                          fileName.includes('ash') || // Ash's badges
                          fileName.includes('trainer') || // Trainer cards
                          fileName.includes('early') || // Early badge designs
                          info.width < 80 || info.height < 80; // Too small
        
        return isBadgeImage && !isUnwanted;
      });

      if (images.length === 0) {
        console.log(`No suitable images found for ${pageTitle}`);
        return;
      }

      // Download the best image (usually the largest)
      const bestImage = images.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
      
      if (bestImage) {
        const fileName = `${badgeData.region}-${badgeData.id}.png`;
        const localPath = await downloadImage(bestImage.url, fileName, 'badges');
        
        if (localPath) {
          badgeData.image = `/images/scraped/badges/${fileName}`;
          console.log(`Downloaded image for ${pageTitle}: ${fileName}`);
        }
      }

    } catch (error) {
      console.error(`Error downloading images for ${pageTitle}:`, (error as Error).message);
    }
  }

  // Save all scraped data
  private async saveAllData(): Promise<void> {
    try {
      // Save individual region files
      for (const [region, badges] of Object.entries(this.scrapedData)) {
        await saveDataToFile(badges, `${region}-badges.json`, 'badges');
      }
      
      // Save combined file
      await saveDataToFile(this.scrapedData, 'all-badges.json', 'badges');
      
      console.log('All badge data saved successfully');
    } catch (error) {
      console.error('Error saving badge data:', (error as Error).message);
    }
  }
}

// Export instance and class
export const badgeScraper = new BadgeScraper();
export default BadgeScraper;