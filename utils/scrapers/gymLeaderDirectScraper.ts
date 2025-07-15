// Direct Gym Leader Scraper
// Downloads images from individual character categories

import scraperConfig from './scraperConfig';
import {
  downloadImage,
  saveDataToFile,
  delay,
  getCachedData,
  cacheData
} from './scraperUtils';

// Interfaces for type safety
interface DownloadedFile {
  character: string;
  original: string;
  local: string;
  path: string;
  width: number;
  height: number;
}

interface ScrapedCharacterData {
  totalCharacters: number;
  totalDownloaded: number;
  files: DownloadedFile[];
}

interface CategoryMember {
  pageid: number;
  ns: number;
  title: string;
}

interface CategoryResponse {
  query?: {
    categorymembers: CategoryMember[];
  };
  continue?: {
    cmcontinue: string;
  };
}

interface ImageInfo {
  url: string;
  width: number;
  height: number;
  mime?: string;
}

interface ImagePage {
  imageinfo?: ImageInfo[];
}

interface ImageInfoResponse {
  query?: {
    pages: {
      [key: string]: ImagePage;
    };
  };
}

class GymLeaderDirectScraper {
  private archivesApiUrl: string;
  private scrapedData: { [key: string]: any };
  private gymLeaders: { [region: string]: string[] };
  private eliteFour: { [region: string]: string[] };
  private champions: string[];

  constructor() {
    this.archivesApiUrl = 'https://archives.bulbagarden.net/w/api.php';
    this.scrapedData = {};
    
    // All gym leaders by region with their character page names
    this.gymLeaders = {
      kanto: [
        'Brock', 'Misty', 'Lt._Surge', 'Erika', 'Koga', 'Sabrina', 'Blaine', 'Giovanni'
      ],
      johto: [
        'Falkner', 'Bugsy', 'Whitney', 'Morty', 'Chuck', 'Jasmine', 'Pryce', 'Clair'
      ],
      hoenn: [
        'Roxanne', 'Brawly', 'Wattson', 'Flannery', 'Norman', 'Winona', 'Tate', 'Liza', 'Wallace', 'Juan'
      ],
      sinnoh: [
        'Roark', 'Gardenia', 'Fantina', 'Maylene', 'Crasher_Wake', 'Byron', 'Candice', 'Volkner'
      ],
      unova: [
        'Cilan', 'Chili', 'Cress', 'Lenora', 'Burgh', 'Elesa', 'Clay', 'Skyla', 'Brycen', 'Drayden', 'Iris',
        'Cheren', 'Roxie', 'Marlon'
      ],
      kalos: [
        'Viola', 'Grant', 'Korrina', 'Ramos', 'Clemont', 'Valerie', 'Olympia', 'Wulfric'
      ],
      alola: [
        'Ilima', 'Lana', 'Kiawe', 'Mallow', 'Sophocles', 'Acerola', 'Mina'
      ],
      galar: [
        'Milo', 'Nessa', 'Kabu', 'Bea', 'Allister', 'Opal', 'Gordie', 'Melony', 'Piers', 'Raihan'
      ],
      paldea: [
        'Katy', 'Brassius', 'Iono', 'Kofu', 'Larry', 'Ryme', 'Tulip', 'Grusha'
      ]
    };
    
    // Elite Four members
    this.eliteFour = {
      kanto: ['Lorelei', 'Bruno', 'Agatha', 'Lance'],
      johto: ['Will', 'Karen'],
      hoenn: ['Sidney', 'Phoebe', 'Glacia', 'Drake'],
      sinnoh: ['Aaron', 'Bertha', 'Flint', 'Lucian'],
      unova: ['Shauntal', 'Grimsley', 'Caitlin', 'Marshal'],
      kalos: ['Malva', 'Siebold', 'Wikstrom', 'Drasna'],
      alola: ['Hala', 'Olivia', 'Nanu', 'Hapu', 'Acerola', 'Kahili', 'Molayne'],
      paldea: ['Rika', 'Poppy', 'Larry', 'Hassel']
    };
    
    // Champions
    this.champions = [
      'Blue', 'Lance', 'Steven_Stone', 'Wallace', 'Cynthia', 'Alder', 'Iris', 
      'Diantha', 'Kukui', 'Hau', 'Leon', 'Geeta', 'Nemona', 'Red'
    ];
  }

  // Fetch files from a specific category
  private async fetchCategoryFiles(categoryName: string, continueFrom: string | null = null): Promise<CategoryResponse | null> {
    const params: any = {
      action: 'query',
      list: 'categorymembers',
      cmtitle: `Category:${categoryName}`,
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
      const data = await response.json() as CategoryResponse;
      return data;
    } catch (error) {
      console.error(`Error fetching category ${categoryName}:`, error);
      return null;
    }
  }

  // Get all files from a category
  private async getAllCategoryFiles(categoryName: string): Promise<CategoryMember[]> {
    const allFiles: CategoryMember[] = [];
    let continueFrom: string | null = null;

    do {
      const data = await this.fetchCategoryFiles(categoryName, continueFrom);
      if (!data || !data.query || !data.query.categorymembers) break;

      allFiles.push(...data.query.categorymembers);
      continueFrom = data.continue?.cmcontinue || null;
      
      if (continueFrom) await delay(500);
    } while (continueFrom);

    return allFiles;
  }

  // Get image info
  private async getImageInfo(fileName: string): Promise<ImageInfo | null> {
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
      const data = await response.json() as ImageInfoResponse;
      
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

  // Filter function for character images
  private filterCharacterImage(fileName: string, characterName: string): boolean {
    const lower = fileName.toLowerCase();
    const charLower = characterName.toLowerCase().replace(/_/g, ' ');
    
    // Must contain character name
    if (!lower.includes(charLower.replace(/ /g, '_')) && 
        !lower.includes(charLower.replace(/ /g, '')) &&
        !lower.includes(charLower)) {
      return false;
    }
    
    // Exclude unwanted file types
    const excluded = lower.includes('sprite') || 
                    lower.includes('_ow') || 
                    lower.includes('overworld') ||
                    lower.includes('menu') ||
                    lower.includes('icon') ||
                    lower.includes('_back') ||
                    lower.includes('_spr_');
    
    // Prioritize game artwork
    const gamePatterns = [
      'scarlet_violet', 'sword_shield', 'sun_moon', 'ultra_sun_ultra_moon',
      'x_y', 'omega_ruby_alpha_sapphire', 'black_white', 'black_2_white_2',
      'heartgold_soulsilver', 'diamond_pearl', 'platinum', 'brilliant_diamond_shining_pearl',
      'firered_leafgreen', 'ruby_sapphire', 'emerald', 'gold_silver', 'crystal',
      'red_blue', 'red_green', 'yellow', 'lets_go', 'legends_arceus'
    ];
    
    const isGameArt = gamePatterns.some(pattern => lower.includes(pattern));
    const isAnime = lower.includes('anime') || lower.includes('_ag') || lower.includes('_dp') || 
                   lower.includes('_bw') || lower.includes('_xy') || lower.includes('_sm') || 
                   lower.includes('_jn') || lower.includes('_hz');
    
    // Prefer game art, but accept other art if not sprites
    return !excluded && (lower.endsWith('.png') || lower.endsWith('.jpg'));
  }

  // Scrape a specific character
  private async scrapeCharacter(characterName: string, subfolder: string): Promise<DownloadedFile[]> {
    console.log(`\nScraping ${characterName}...`);
    
    const files = await this.getAllCategoryFiles(characterName);
    if (!files || files.length === 0) {
      console.log(`No files found for ${characterName}`);
      return [];
    }
    
    console.log(`Found ${files.length} files for ${characterName}`);
    
    const validFiles = files.filter(file => this.filterCharacterImage(file.title, characterName));
    console.log(`${validFiles.length} files match criteria`);
    
    const downloadedFiles: DownloadedFile[] = [];
    let count = 0;
    const maxPerCharacter = 10; // Get more variety per character
    
    // Sort to prioritize game artwork
    validFiles.sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      
      // Prioritize game names in filename
      const aHasGame = /red|blue|gold|silver|ruby|sapphire|diamond|pearl|black|white|x_y|sun|moon|sword|shield|scarlet|violet/.test(aLower);
      const bHasGame = /red|blue|gold|silver|ruby|sapphire|diamond|pearl|black|white|x_y|sun|moon|sword|shield|scarlet|violet/.test(bLower);
      
      if (aHasGame && !bHasGame) return -1;
      if (!aHasGame && bHasGame) return 1;
      
      return 0;
    });
    
    for (const file of validFiles) {
      if (count >= maxPerCharacter) break;
      
      const imageInfo = await this.getImageInfo(file.title);
      if (!imageInfo) continue;
      
      // Skip small images
      if (imageInfo.width < 200 || imageInfo.height < 200) continue;
      
      // Generate filename
      const extension = imageInfo.url.split('.').pop()?.split('?')[0] || 'png';
      const cleanName = `${characterName.toLowerCase().replace(/_/g, '-')}-${count + 1}.${extension}`;
      
      // Download image
      const localPath = await downloadImage(imageInfo.url, cleanName, subfolder);
      if (localPath) {
        downloadedFiles.push({
          character: characterName,
          original: file.title,
          local: cleanName,
          path: `/images/scraped/${subfolder}/${cleanName}`,
          width: imageInfo.width,
          height: imageInfo.height
        });
        count++;
        console.log(`Downloaded: ${cleanName}`);
      }
      
      await delay(1000);
    }
    
    return downloadedFiles;
  }

  // Scrape all gym leaders
  async scrapeAllGymLeaders(): Promise<ScrapedCharacterData> {
    console.log('Starting direct gym leader scraping...');
    
    const allFiles: DownloadedFile[] = [];
    
    for (const [region, leaders] of Object.entries(this.gymLeaders)) {
      console.log(`\n=== Scraping ${region.toUpperCase()} gym leaders ===`);
      
      for (const leader of leaders) {
        const files = await this.scrapeCharacter(leader, 'gym-leaders');
        allFiles.push(...files);
      }
    }
    
    // Save data
    const data: ScrapedCharacterData = {
      totalCharacters: Object.values(this.gymLeaders).flat().length,
      totalDownloaded: allFiles.length,
      files: allFiles
    };
    
    await saveDataToFile(data, 'gym-leaders-direct.json', 'gym-leaders');
    console.log(`\n✅ Gym leader scraping complete! Downloaded ${allFiles.length} images`);
    
    return data;
  }

  // Scrape all elite four
  async scrapeAllEliteFour(): Promise<ScrapedCharacterData> {
    console.log('Starting direct elite four scraping...');
    
    const allFiles: DownloadedFile[] = [];
    
    for (const [region, members] of Object.entries(this.eliteFour)) {
      console.log(`\n=== Scraping ${region.toUpperCase()} elite four ===`);
      
      for (const member of members) {
        const files = await this.scrapeCharacter(member, 'elite-four');
        allFiles.push(...files);
      }
    }
    
    // Save data
    const data: ScrapedCharacterData = {
      totalCharacters: Object.values(this.eliteFour).flat().length,
      totalDownloaded: allFiles.length,
      files: allFiles
    };
    
    await saveDataToFile(data, 'elite-four-direct.json', 'elite-four');
    console.log(`\n✅ Elite Four scraping complete! Downloaded ${allFiles.length} images`);
    
    return data;
  }

  // Scrape all champions
  async scrapeAllChampions(): Promise<ScrapedCharacterData> {
    console.log('Starting direct champion scraping...');
    
    const allFiles: DownloadedFile[] = [];
    
    for (const champion of this.champions) {
      const files = await this.scrapeCharacter(champion, 'champions');
      allFiles.push(...files);
    }
    
    // Save data
    const data: ScrapedCharacterData = {
      totalCharacters: this.champions.length,
      totalDownloaded: allFiles.length,
      files: allFiles
    };
    
    await saveDataToFile(data, 'champions-direct.json', 'champions');
    console.log(`\n✅ Champion scraping complete! Downloaded ${allFiles.length} images`);
    
    return data;
  }
}

export const gymLeaderDirectScraper = new GymLeaderDirectScraper();
export default GymLeaderDirectScraper;