// Elite Four Scraper
// Downloads high-quality Elite Four member images from Bulbapedia

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
interface TeamMember {
  name: string;
  level?: number;
  type1?: string;
  type2?: string;
}

interface EliteFourMemberData {
  id: string;
  name: string;
  region: string;
  role: string;
  type: string;
  team: TeamMember[];
  quote: string;
  description: string;
  generation: number;
  image: string;
  additionalImages: string[];
  infoboxImage?: string;
}

interface ChampionsData {
  [region: string]: EliteFourMemberData[];
}

type ScrapedEliteFourData = {
  [region: string]: EliteFourMemberData[];
} & {
  champions?: ChampionsData;
};

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
  type?: string;
  quote?: string;
  [key: string]: string | undefined;
}

interface ImageInfo {
  url: string;
  width: number;
  height: number;
}

interface ImagePageInfo {
  imageinfo?: ImageInfo[];
}

interface MediaWikiImageResponse {
  query?: {
    pages: {
      [key: string]: ImagePageInfo;
    };
  };
}

class EliteFourScraper {
  private scrapedData: any; // Using any internally, will cast to proper type on return

  constructor() {
    this.scrapedData = {};
  }

  // Scrape all Elite Four members
  async scrapeAllEliteFour(): Promise<ScrapedEliteFourData> {
    console.log('Starting Elite Four scraping...');
    
    for (const [region, data] of Object.entries(scraperConfig.targets.eliteFour)) {
      console.log(`\nScraping ${region} Elite Four...`);
      this.scrapedData[region] = [];
      
      for (const memberPage of data.pages) {
        const memberData = await this.scrapeEliteFourMember(memberPage, region);
        if (memberData) {
          this.scrapedData[region].push(memberData);
        }
        
        // Rate limiting
        await delay(scraperConfig.settings.requestDelay);
      }
    }
    
    // Also scrape champions
    console.log('\nScraping Champions...');
    this.scrapedData.champions = {};
    
    for (const [region, champions] of Object.entries(scraperConfig.targets.champions)) {
      this.scrapedData.champions[region] = [];
      
      for (const championPage of champions) {
        const championData = await this.scrapeEliteFourMember(championPage, region, true);
        if (championData) {
          this.scrapedData.champions[region].push(championData);
        }
        
        await delay(scraperConfig.settings.requestDelay);
      }
    }
    
    // Save all data
    await this.saveAllData();
    console.log('\nElite Four scraping completed!');
    
    return this.scrapedData as ScrapedEliteFourData;
  }

  // Scrape individual Elite Four member
  async scrapeEliteFourMember(pageTitle: string, region: string, isChampion: boolean = false): Promise<EliteFourMemberData | null> {
    try {
      console.log(`Scraping ${isChampion ? 'Champion' : 'Elite Four member'}: ${pageTitle}`);
      
      // Check cache first
      const cacheKey = `elite-four-${pageTitle}`;
      const cachedData = await getCachedData<EliteFourMemberData>(cacheKey);
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
      
      // Parse member data
      const memberData = await this.parseMemberData(pageTitle, wikitext, region, isChampion);
      
      // Extract main image from infobox
      const infoboxImage = this.extractInfoboxImage(wikitext);
      if (infoboxImage) {
        memberData.infoboxImage = infoboxImage;
      }
      
      // Download images
      await this.downloadMemberImages(pageTitle, memberData);
      
      // Cache the data
      await cacheData(cacheKey, memberData, 24);
      
      return memberData;
      
    } catch (error) {
      console.error(`Error scraping ${pageTitle}:`, (error as Error).message);
      return null;
    }
  }

  // Parse member data from wikitext
  private async parseMemberData(pageTitle: string, wikitext: string, region: string, isChampion: boolean): Promise<EliteFourMemberData> {
    const data: EliteFourMemberData = {
      id: pageTitle.toLowerCase().replace(/_/g, '-').replace(/\(.*\)/, '').trim(),
      name: pageTitle.replace(/_/g, ' ').replace(/\(.*\)/, '').trim(),
      region: region,
      role: isChampion ? 'Champion' : 'Elite Four',
      type: '',
      team: [],
      quote: '',
      description: '',
      generation: this.getGenerationFromRegion(region),
      image: '',
      additionalImages: []
    };

    // Parse character infobox
    const infobox = parseInfobox(wikitext, 'Character') as Infobox || 
                   parseInfobox(wikitext, 'CharacterInfobox') as Infobox ||
                   parseInfobox(wikitext, 'Trainer') as Infobox;

    if (infobox) {
      // Extract type specialization
      data.type = this.extractType(infobox, wikitext);
      data.quote = cleanWikitext(infobox.quote || '');
    }

    // Extract description
    data.description = this.extractDescription(wikitext);
    
    // Extract team data
    data.team = await this.extractTeamData(wikitext);

    return data;
  }

  // Get generation from region
  private getGenerationFromRegion(region: string): number {
    const regionToGen: { [key: string]: number } = {
      kanto: 1, johto: 2, hoenn: 3, sinnoh: 4,
      unova: 5, kalos: 6, alola: 7, galar: 8, paldea: 9
    };
    return regionToGen[region] || 1;
  }

  // Extract main image from infobox
  private extractInfoboxImage(wikitext: string): string | null {
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

  // Extract type specialization
  private extractType(infobox: Infobox, wikitext: string): string {
    if (infobox.type) {
      return cleanWikitext(infobox.type).toLowerCase();
    }
    
    const typePattern = /(Fire|Water|Grass|Electric|Psychic|Ice|Dragon|Dark|Fighting|Poison|Ground|Flying|Bug|Rock|Ghost|Steel|Fairy|Normal)-type/i;
    const match = wikitext.match(typePattern);
    return match ? match[1].toLowerCase() : 'mixed';
  }

  // Extract description
  private extractDescription(wikitext: string): string {
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
  private async extractTeamData(wikitext: string): Promise<TeamMember[]> {
    const team: TeamMember[] = [];
    const pokemonPattern = /{{Pokémon([^}]+)}}/g;
    let match;
    
    while ((match = pokemonPattern.exec(wikitext)) !== null) {
      const pokemonData = this.parsePokemonTemplate(match[1]);
      if (pokemonData) {
        team.push(pokemonData);
      }
    }
    
    return team.slice(0, 6);
  }

  // Parse Pokemon template
  private parsePokemonTemplate(templateContent: string): TeamMember | null {
    const data: Partial<TeamMember> = {};
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
        }
      }
    }
    
    return data.name ? data as TeamMember : null;
  }

  // Download member images
  private async downloadMemberImages(pageTitle: string, memberData: EliteFourMemberData): Promise<void> {
    try {
      console.log(`Downloading images for ${pageTitle}...`);
      
      // First, try to download the infobox image if we found one
      if (memberData.infoboxImage) {
        console.log(`Found infobox image: ${memberData.infoboxImage}`);
        
        // Get info for the specific infobox image
        const infoboxImageData = await fetchMediaWikiApi({
          action: 'query',
          prop: 'imageinfo',
          titles: `File:${memberData.infoboxImage}`,
          iiprop: 'url|size|mime',
          iiurlwidth: String(scraperConfig.settings.imageSizes.large)
        }) as MediaWikiImageResponse;
        
        if (infoboxImageData && infoboxImageData.query && infoboxImageData.query.pages) {
          const imagePage = Object.values(infoboxImageData.query.pages)[0];
          if (imagePage && imagePage.imageinfo && imagePage.imageinfo[0]) {
            const info = imagePage.imageinfo[0];
            const role = memberData.role.toLowerCase().replace(' ', '-');
            const fileName = `${memberData.region}-${role}-${memberData.id}-main.png`;
            const localPath = await downloadImage(info.url, fileName, 'elite-four');
            
            if (localPath) {
              memberData.image = `/images/scraped/elite-four/${fileName}`;
              console.log(`Downloaded main image from infobox for ${pageTitle}: ${fileName}`);
              return; // If we got the infobox image, we're done
            }
          }
        }
      }
      
      // If no infobox image or download failed, fall back to searching all images
      console.log(`Searching for images on ${pageTitle} page...`);
      
      // Get all images from the page
      const images = await getPageImages(pageTitle, (title: string, info: { width: number; height: number }) => {
        const fileName = title.toLowerCase();
        const cleanName = pageTitle.toLowerCase().replace(/_/g, ' ').replace(/\(.*\)/, '').trim();
        
        // Exclude Pokemon and small sprites
        const isPokemonImage = /\d{3,4}[a-zA-Z]+\.png/i.test(title) ||
                              fileName.includes('type_') ||
                              fileName.includes('bag_') ||
                              fileName.includes('_sprite') ||
                              fileName.includes('spr_') ||
                              fileName.includes('menu');
        
        // Exclude anime/promotional images
        const isPromoOrAnime = fileName.includes('_jnm') || fileName.includes('_pg') || 
                              fileName.includes('anime') || fileName.includes('manga') ||
                              fileName.includes('promo') || fileName.includes('tcg') ||
                              fileName.includes('adventures');
        
        const isSmallSprite = (
          fileName.includes('_ow') ||
          fileName.includes('vstrainer') ||
          fileName.includes('spr_') ||
          (info.width < 150 && info.height < 200) ||
          fileName.includes('_icon') ||
          fileName.includes('_face')
        );
        
        if (isPokemonImage || isSmallSprite || isPromoOrAnime) return false;
        
        // Priority patterns for high-quality full artwork
        const gameVersions = ['black_white', 'black_2_white_2', 'heartgold_soulsilver', 
                             'sun_moon', 'ultra_sun_ultra_moon', 'sword_shield',
                             'brilliant_diamond_shining_pearl', 'scarlet_violet',
                             'omega_ruby_alpha_sapphire', 'x_y', 'diamond_pearl_platinum'];
        
        const isGameArtwork = gameVersions.some(game => fileName.includes(game));
        
        // Include Elite Four artwork
        const isMemberArt = (
          (fileName.includes(cleanName) || fileName.includes(pageTitle.toLowerCase())) &&
          (isGameArtwork || fileName.includes('artwork') || fileName.includes('official')) &&
          info.width >= 250 && info.height >= 400 &&
          !fileName.includes('_vs') && !fileName.includes('battle') && !fileName.includes('back')
        );
        
        return isMemberArt;
      });

      if (images.length === 0) {
        console.log(`No suitable images found for ${pageTitle}`);
        return;
      }

      // Sort and download images
      const sortedImages = images.sort((a, b) => {
        const aName = a.title.toLowerCase();
        const bName = b.title.toLowerCase();
        
        const aIsBack = aName.includes('back') || aName.includes('_b.png');
        const bIsBack = bName.includes('back') || bName.includes('_b.png');
        if (aIsBack !== bIsBack) return aIsBack ? 1 : -1;
        
        return (b.width * b.height) - (a.width * a.height);
      });

      // Download best images
      for (let i = 0; i < Math.min(sortedImages.length, 3); i++) {
        const image = sortedImages[i];
        const role = memberData.role.toLowerCase().replace(' ', '-');
        
        let fileName: string;
        if (i === 0) {
          fileName = `${memberData.region}-${role}-${memberData.id}-main.png`;
          memberData.image = `/images/scraped/elite-four/${fileName}`;
        } else {
          fileName = `${memberData.region}-${role}-${memberData.id}-alt${i}.png`;
          memberData.additionalImages.push(`/images/scraped/elite-four/${fileName}`);
        }
        
        const localPath = await downloadImage(image.url, fileName, 'elite-four');
        if (localPath) {
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
      // Save Elite Four data
      for (const [region, members] of Object.entries(this.scrapedData)) {
        if (region !== 'champions' && Array.isArray(members)) {
          await saveDataToFile(members, `${region}-elite-four.json`, 'elite-four');
        }
      }
      
      // Save Champions data
      if (this.scrapedData.champions) {
        await saveDataToFile(this.scrapedData.champions, 'champions.json', 'elite-four');
      }
      
      // Save combined file
      await saveDataToFile(this.scrapedData, 'all-elite-four.json', 'elite-four');
      
      console.log('All Elite Four data saved successfully');
    } catch (error) {
      console.error('Error saving Elite Four data:', (error as Error).message);
    }
  }
}

// Export instance and class
export const eliteFourScraper = new EliteFourScraper();
export default EliteFourScraper;