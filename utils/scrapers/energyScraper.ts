// Energy Type Scraper
// Downloads high-quality Pokemon TCG energy type images from Bulbapedia

import scraperConfig from './scraperConfig';
import {
  fetchMediaWikiApi,
  getPageImages,
  downloadImage,
  saveDataToFile,
  delay,
  getCachedData,
  cacheData
} from './scraperUtils';

// Interfaces for type safety
interface EnergyImages {
  basic: string;
  special: string[];
  cards: string[];
}

interface EnergyData {
  name: string;
  type: string;
  images: EnergyImages;
}

interface ScrapedEnergyData {
  [energyType: string]: EnergyData;
}

interface EnergyTypeInfo {
  name: string;
  page: string;
}

class EnergyScraper {
  private scrapedData: ScrapedEnergyData;
  private energyTypes: EnergyTypeInfo[];

  constructor() {
    this.scrapedData = {};
    this.energyTypes = [
      { name: 'Grass', page: 'Grass_(TCG)' },
      { name: 'Fire', page: 'Fire_(TCG)' },
      { name: 'Water', page: 'Water_(TCG)' },
      { name: 'Lightning', page: 'Lightning_(TCG)' },
      { name: 'Psychic', page: 'Psychic_(TCG)' },
      { name: 'Fighting', page: 'Fighting_(TCG)' },
      { name: 'Darkness', page: 'Darkness_(TCG)' },
      { name: 'Metal', page: 'Metal_(TCG)' },
      { name: 'Dragon', page: 'Dragon_(TCG)' },
      { name: 'Fairy', page: 'Fairy_(TCG)' },
      { name: 'Colorless', page: 'Colorless_(TCG)' }
    ];
  }

  // Scrape all energy types
  async scrapeAllEnergyTypes(): Promise<ScrapedEnergyData> {
    console.log('Starting energy type scraping...');
    
    for (const energyType of this.energyTypes) {
      const energyData = await this.scrapeEnergyType(energyType);
      if (energyData) {
        this.scrapedData[energyType.name.toLowerCase()] = energyData;
      }
      
      // Rate limiting
      await delay(scraperConfig.settings.requestDelay);
    }
    
    // Save all data
    await this.saveAllData();
    console.log('\nEnergy type scraping completed!');
    
    return this.scrapedData;
  }

  // Scrape individual energy type
  async scrapeEnergyType(energyType: EnergyTypeInfo): Promise<EnergyData | null> {
    try {
      console.log(`Scraping energy type: ${energyType.name}`);
      
      // Check cache first
      const cacheKey = `energy-${energyType.name}`;
      const cachedData = await getCachedData<EnergyData>(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${energyType.name}`);
        return cachedData;
      }

      // Get page images
      const images = await getPageImages(energyType.page, (title: string, info: { width: number; height: number }) => {
        const fileName = title.toLowerCase();
        
        // Energy type variations (Lightning vs Electric, etc.)
        const energyTypeLower = energyType.name.toLowerCase();
        const typeVariations: { [key: string]: string[] } = {
          'lightning': ['lightning', 'electric'],
          'darkness': ['darkness', 'dark'],
          'metal': ['metal', 'steel']
        };
        const typeNames = typeVariations[energyTypeLower] || [energyTypeLower];
        
        // Filter for energy card images
        const isEnergyImage = typeNames.some(typeName => {
          return (
            // Basic energy cards (e.g., FireEnergyBaseSet.png)
            (fileName.includes(typeName) && fileName.includes('energy') && 
             (fileName.includes('base') || fileName.includes('basic'))) ||
            // Set-specific energy (e.g., FireEnergySunMoon.png)
            (fileName.includes(typeName) && fileName.includes('energy') && 
             /[a-z]+[0-9]|sun|moon|sword|shield/.test(fileName)) ||
            // Special energy cards
            (fileName.includes('special') && fileName.includes(typeName)) ||
            // Direct energy card reference
            fileName === `file:${typeName}energy.png` ||
            fileName === `file:${typeName}_energy.png`
          );
        });
        
        // Exclude non-card images
        const isNotCard = fileName.includes('sprite') || 
                         fileName.includes('icon') ||
                         fileName.includes('symbol') ||
                         fileName.includes('type') || // Type symbols
                         fileName.includes('move') || // Move category icons
                         info.width < 150;
        
        // TCG cards are typically 2.5" x 3.5" (ratio ~1.4)
        const aspectRatio = info.height / info.width;
        const isCardShaped = aspectRatio > 1.2 && aspectRatio < 1.6;
        
        return isEnergyImage && !isNotCard && (isCardShaped || info.width >= 250);
      });

      const energyData: EnergyData = {
        name: energyType.name,
        type: energyType.name.toLowerCase(),
        images: {
          basic: '',
          special: [],
          cards: []
        }
      };

      // Download images with proper naming
      for (const image of images.slice(0, 5)) { // Limit to 5 best images
        const isBasic = image.title.toLowerCase().includes('basic');
        const isSpecial = image.title.toLowerCase().includes('special');
        
        let fileName: string;
        if (isBasic && !energyData.images.basic) {
          fileName = `${energyType.name.toLowerCase()}-basic-energy.png`;
          const localPath = await downloadImage(image.url, fileName, 'energy');
          if (localPath) {
            energyData.images.basic = `/images/scraped/energy/${fileName}`;
            console.log(`Downloaded basic energy for ${energyType.name}: ${fileName}`);
          }
        } else if (isSpecial) {
          fileName = `${energyType.name.toLowerCase()}-special-energy-${energyData.images.special.length + 1}.png`;
          const localPath = await downloadImage(image.url, fileName, 'energy');
          if (localPath) {
            energyData.images.special.push(`/images/scraped/energy/${fileName}`);
            console.log(`Downloaded special energy for ${energyType.name}: ${fileName}`);
          }
        } else {
          fileName = `${energyType.name.toLowerCase()}-energy-card-${energyData.images.cards.length + 1}.png`;
          const localPath = await downloadImage(image.url, fileName, 'energy');
          if (localPath) {
            energyData.images.cards.push(`/images/scraped/energy/${fileName}`);
            console.log(`Downloaded energy card for ${energyType.name}: ${fileName}`);
          }
        }
      }

      // Cache the data
      await cacheData(cacheKey, energyData, 24);
      
      return energyData;
      
    } catch (error) {
      console.error(`Error scraping energy type ${energyType.name}:`, (error as Error).message);
      return null;
    }
  }

  // Save all scraped data
  private async saveAllData(): Promise<void> {
    try {
      await saveDataToFile(this.scrapedData, 'tcg-energy-types.json', 'energy');
      console.log('All energy type data saved successfully');
    } catch (error) {
      console.error('Error saving energy type data:', (error as Error).message);
    }
  }
}

// Export instance and class
export const energyScraper = new EnergyScraper();
export default EnergyScraper;