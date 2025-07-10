// Bulbapedia MediaWiki API utility
// https://bulbapedia.bulbagarden.net/w/api.php

const BULBAPEDIA_API_BASE = 'https://bulbapedia.bulbagarden.net/w/api.php';

// Helper to build API URL with parameters
const buildApiUrl = (params) => {
  const defaultParams = {
    format: 'json',
    origin: '*' // Enable CORS
  };
  
  const urlParams = new URLSearchParams({
    ...defaultParams,
    ...params
  });
  
  return `${BULBAPEDIA_API_BASE}?${urlParams}`;
};

// Parse MediaWiki image URLs to get the actual file URL
const getImageUrl = (imageInfo) => {
  // If we already have a thumb URL from the API, use it
  if (imageInfo.thumburl) {
    return imageInfo.thumburl;
  }
  // Otherwise use the full URL
  return imageInfo.url;
};

// Main API functions
export const bulbapediaApi = {
  // Search for pages
  async search(searchTerm, options = {}) {
    const params = {
      action: 'query',
      list: 'search',
      srsearch: searchTerm,
      srlimit: options.limit || 10,
      srnamespace: options.namespace || 0, // 0 = main namespace
      ...options.additionalParams
    };
    
    try {
      const response = await fetch(buildApiUrl(params));
      const data = await response.json();
      return data.query?.search || [];
    } catch (error) {
      console.error('Bulbapedia search error:', error);
      return [];
    }
  },

  // Get page content
  async getPageContent(pageTitle, options = {}) {
    const params = {
      action: 'query',
      prop: 'revisions|images|categories',
      titles: pageTitle,
      rvprop: 'content',
      rvslots: 'main',
      formatversion: '2'
    };
    
    try {
      const response = await fetch(buildApiUrl(params));
      const data = await response.json();
      const page = data.query?.pages?.[0];
      
      if (!page || page.missing) {
        return null;
      }
      
      return {
        title: page.title,
        pageid: page.pageid,
        content: page.revisions?.[0]?.slots?.main?.content,
        images: page.images?.map(img => img.title),
        categories: page.categories?.map(cat => cat.title)
      };
    } catch (error) {
      console.error('Bulbapedia page content error:', error);
      return null;
    }
  },

  // Get images from a page
  async getPageImages(pageTitle, options = {}) {
    const params = {
      action: 'query',
      prop: 'images',
      titles: pageTitle,
      imlimit: options.limit || 50,
      formatversion: '2'
    };
    
    try {
      const response = await fetch(buildApiUrl(params));
      const data = await response.json();
      const page = data.query?.pages?.[0];
      
      if (!page || !page.images) {
        return [];
      }
      
      // Get image URLs for each image
      const imageUrls = await Promise.all(
        page.images.map(async (img) => {
          const imageInfo = await this.getImageInfo(img.title);
          return imageInfo;
        })
      );
      
      return imageUrls.filter(Boolean);
    } catch (error) {
      console.error('Bulbapedia images error:', error);
      return [];
    }
  },

  // Get detailed image information
  async getImageInfo(imageTitle) {
    const params = {
      action: 'query',
      prop: 'imageinfo',
      titles: imageTitle,
      iiprop: 'url|size|mime',
      iiurlwidth: 250, // Get thumbnail URL at 250px width
      formatversion: '2'
    };
    
    try {
      const response = await fetch(buildApiUrl(params));
      const data = await response.json();
      const page = data.query?.pages?.[0];
      const imageInfo = page?.imageinfo?.[0];
      
      if (!imageInfo) {
        return null;
      }
      
      return {
        title: page.title,
        url: imageInfo.url,
        thumburl: imageInfo.thumburl,
        width: imageInfo.width,
        height: imageInfo.height,
        mime: imageInfo.mime
      };
    } catch (error) {
      console.error('Bulbapedia image info error:', error);
      return null;
    }
  },

  // Get category members (e.g., all Gym Leaders)
  async getCategoryMembers(categoryName, options = {}) {
    const params = {
      action: 'query',
      list: 'categorymembers',
      cmtitle: `Category:${categoryName}`,
      cmlimit: options.limit || 500,
      cmnamespace: options.namespace || 0,
      formatversion: '2'
    };
    
    try {
      const response = await fetch(buildApiUrl(params));
      const data = await response.json();
      return data.query?.categorymembers || [];
    } catch (error) {
      console.error('Bulbapedia category error:', error);
      return [];
    }
  },

  // Parse infobox data from page content
  parseInfobox(wikitext, infoboxType = 'Character') {
    const regex = new RegExp(`{{${infoboxType}([^}]+)}}`, 'i');
    const match = wikitext.match(regex);
    
    if (!match) return null;
    
    const infoboxContent = match[1];
    const data = {};
    
    // Parse key-value pairs
    const lines = infoboxContent.split('\n');
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const cleanKey = key.replace(/^\|/, '').trim();
        const cleanValue = valueParts.join('=').trim();
        data[cleanKey] = cleanValue;
      }
    });
    
    return data;
  },

  // Specific helper functions for Pokemon data
  async getGymLeaderData(leaderName) {
    const pageContent = await this.getPageContent(leaderName);
    if (!pageContent) return null;
    
    const infobox = this.parseInfobox(pageContent.content, 'Character');
    const images = await this.getPageImages(leaderName);
    
    return {
      name: leaderName,
      image: images.find(img => img.title.includes('artwork') || img.title.includes(leaderName))?.thumburl,
      region: infobox?.region,
      type: infobox?.type,
      badge: infobox?.badge,
      quote: infobox?.quote,
      team: this.parseTeamData(pageContent.content)
    };
  },

  // Parse Pokemon team data from page
  parseTeamData(wikitext) {
    // This is a simplified parser - would need more robust parsing for production
    const teamRegex = /{{Pokémon\|([^}]+)}}/g;
    const team = [];
    let match;
    
    while ((match = teamRegex.exec(wikitext)) !== null) {
      const pokemonData = {};
      const content = match[1];
      
      // Parse Pokemon details
      const lines = content.split('|');
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          pokemonData[key.trim()] = value.trim();
        }
      });
      
      if (pokemonData.name) {
        team.push(pokemonData);
      }
    }
    
    return team;
  },

  // Get all gym leaders from a region
  async getRegionGymLeaders(region) {
    const categoryName = `${region} Gym Leaders`;
    const members = await this.getCategoryMembers(categoryName);
    
    const leaders = await Promise.all(
      members.map(member => this.getGymLeaderData(member.title))
    );
    
    return leaders.filter(Boolean);
  },

  // Get Pokemon TCG card data
  async getTCGCardData(cardName) {
    const pageContent = await this.getPageContent(`${cardName} (TCG)`);
    if (!pageContent) return null;
    
    const infobox = this.parseInfobox(pageContent.content, 'PokémoncardInfobox');
    const images = await this.getPageImages(`${cardName} (TCG)`);
    
    return {
      name: cardName,
      image: images.find(img => img.mime === 'image/png')?.url,
      rarity: infobox?.rarity,
      set: infobox?.set,
      number: infobox?.number,
      type: infobox?.type,
      hp: infobox?.hp,
      weakness: infobox?.weakness,
      resistance: infobox?.resistance,
      retreatCost: infobox?.retreatcost
    };
  },

  // Get rarity symbols
  async getRaritySymbols() {
    const rarityPages = [
      'SetSymbolCommon.png',
      'SetSymbolUncommon.png', 
      'SetSymbolRare.png',
      'SetSymbolUltra.png',
      'SetSymbolSecret.png'
    ];
    
    const symbols = await Promise.all(
      rarityPages.map(page => this.getImageInfo(`File:${page}`))
    );
    
    return symbols.filter(Boolean);
  }
};

// Helper function to fetch and cache data
export const fetchAndCacheBulbapediaData = async (key, fetchFunction, cacheTime = 3600000) => {
  // Check if we have cached data
  const cached = localStorage.getItem(`bulbapedia_${key}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheTime) {
      return data;
    }
  }
  
  // Fetch fresh data
  const freshData = await fetchFunction();
  
  // Cache the data
  localStorage.setItem(`bulbapedia_${key}`, JSON.stringify({
    data: freshData,
    timestamp: Date.now()
  }));
  
  return freshData;
};