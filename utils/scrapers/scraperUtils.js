// Bulbapedia Scraper Utilities
// Core utilities for scraping, downloading, and processing data

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import scraperConfig from './scraperConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

// Ensure directory exists
export async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Download and save image
export async function downloadImage(imageUrl, fileName, subfolder = '') {
  try {
    const imagesDir = path.join(projectRoot, scraperConfig.storage.imagesDir, subfolder);
    await ensureDirectory(imagesDir);

    const filePath = path.join(imagesDir, fileName);
    
    // Skip if file already exists
    try {
      await fs.access(filePath);
      console.log(`Image already exists: ${fileName}`);
      return filePath;
    } catch {
      // File doesn't exist, proceed with download
    }

    console.log(`Downloading image: ${imageUrl}`);
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': scraperConfig.settings.userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check file size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > scraperConfig.settings.maxFileSize) {
      throw new Error(`File too large: ${contentLength} bytes`);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(filePath, buffer);
    console.log(`Image saved: ${fileName}`);
    
    return filePath;
  } catch (error) {
    console.error(`Error downloading image ${imageUrl}:`, error.message);
    return null;
  }
}

// Get image filename from URL
export function getImageFileName(imageUrl, prefix = '', suffix = '') {
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  let fileName = pathParts[pathParts.length - 1];
  
  // Remove common MediaWiki parameters
  fileName = fileName.split('?')[0];
  fileName = fileName.replace(/^\d+px-/, ''); // Remove size prefix
  
  // Add prefix and suffix
  if (prefix) fileName = `${prefix}-${fileName}`;
  if (suffix) fileName = fileName.replace(/(\.[^.]+)$/, `${suffix}$1`);
  
  return fileName;
}

// Fetch HTML content
export async function fetchHtml(url) {
  try {
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': scraperConfig.settings.userAgent
      },
      timeout: scraperConfig.settings.timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

// Parse MediaWiki API response
export async function fetchMediaWikiApi(params) {
  const url = new URL(scraperConfig.bulbapedia.apiUrl);
  
  // Default parameters
  const defaultParams = {
    format: 'json',
    origin: '*'
  };
  
  // Merge parameters
  const allParams = { ...defaultParams, ...params };
  
  // Add parameters to URL
  Object.keys(allParams).forEach(key => {
    url.searchParams.append(key, allParams[key]);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': scraperConfig.settings.userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching MediaWiki API:`, error.message);
    return null;
  }
}

// Extract images from MediaWiki page
export async function getPageImages(pageTitle, imageFilter = null) {
  const data = await fetchMediaWikiApi({
    action: 'query',
    prop: 'images',
    titles: pageTitle,
    imlimit: 50
  });

  if (!data || !data.query || !data.query.pages) {
    return [];
  }

  const page = Object.values(data.query.pages)[0];
  if (!page || !page.images) {
    return [];
  }

  const images = [];
  
  for (const image of page.images) {
    // Get image info
    const imageData = await fetchMediaWikiApi({
      action: 'query',
      prop: 'imageinfo',
      titles: image.title,
      iiprop: 'url|size|mime',
      iiurlwidth: scraperConfig.settings.imageSizes.large
    });

    if (imageData && imageData.query && imageData.query.pages) {
      const imagePage = Object.values(imageData.query.pages)[0];
      if (imagePage && imagePage.imageinfo && imagePage.imageinfo[0]) {
        const info = imagePage.imageinfo[0];
        
        // Apply filter if provided
        if (!imageFilter || imageFilter(image.title, info)) {
          images.push({
            title: image.title,
            url: info.url,
            thumburl: info.thumburl,
            width: info.width,
            height: info.height,
            mime: info.mime
          });
        }
      }
    }
    
    // Rate limiting
    await delay(scraperConfig.settings.requestDelay);
  }

  return images;
}

// Parse infobox from wikitext
export function parseInfobox(wikitext, infoboxType = 'Character') {
  try {
    const regex = new RegExp(`{{\\s*${infoboxType}([^}]*(?:{[^}]*}[^}]*)*)}}`, 'is');
    const match = wikitext.match(regex);
    
    if (!match) return null;
    
    const infoboxContent = match[1];
    const data = {};
    
    // Split by lines and parse key-value pairs
    const lines = infoboxContent.split('\n');
    let currentKey = null;
    let currentValue = '';
    
    for (let line of lines) {
      line = line.trim();
      
      if (line.startsWith('|')) {
        // Save previous key-value if exists
        if (currentKey) {
          data[currentKey] = cleanWikitext(currentValue.trim());
        }
        
        // Parse new key-value
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          currentKey = line.substring(1, equalIndex).trim();
          currentValue = line.substring(equalIndex + 1).trim();
        } else {
          currentKey = null;
          currentValue = '';
        }
      } else if (currentKey) {
        // Continue multiline value
        currentValue += ' ' + line;
      }
    }
    
    // Save last key-value
    if (currentKey) {
      data[currentKey] = cleanWikitext(currentValue.trim());
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing infobox:', error.message);
    return null;
  }
}

// Clean wikitext markup
export function cleanWikitext(text) {
  if (!text) return '';
  
  return text
    // Remove wiki links but keep display text
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    // Remove external links
    .replace(/\[https?:\/\/[^\s\]]+ ([^\]]+)\]/g, '$1')
    // Remove templates (basic)
    .replace(/{{[^}]*}}/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Delay function for rate limiting
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Save data to JSON file
export async function saveDataToFile(data, fileName, subfolder = '') {
  try {
    const dataDir = path.join(projectRoot, scraperConfig.storage.dataDir, subfolder);
    await ensureDirectory(dataDir);
    
    const filePath = path.join(dataDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    console.log(`Data saved: ${fileName}`);
    return filePath;
  } catch (error) {
    console.error(`Error saving data to ${fileName}:`, error.message);
    return null;
  }
}

// Load data from JSON file
export async function loadDataFromFile(fileName, subfolder = '') {
  try {
    const dataDir = path.join(projectRoot, scraperConfig.storage.dataDir, subfolder);
    const filePath = path.join(dataDir, fileName);
    
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading data from ${fileName}:`, error.message);
    return null;
  }
}

// Get cache file path
export function getCacheFilePath(key) {
  return path.join(projectRoot, scraperConfig.storage.cacheDir, `${key}.json`);
}

// Cache data with expiration
export async function cacheData(key, data, expirationHours = 24) {
  try {
    const cacheDir = path.join(projectRoot, scraperConfig.storage.cacheDir);
    await ensureDirectory(cacheDir);
    
    const cacheData = {
      data,
      timestamp: Date.now(),
      expirationHours
    };
    
    const filePath = getCacheFilePath(key);
    await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
    
    return true;
  } catch (error) {
    console.error(`Error caching data for ${key}:`, error.message);
    return false;
  }
}

// Get cached data if not expired
export async function getCachedData(key) {
  try {
    const filePath = getCacheFilePath(key);
    const content = await fs.readFile(filePath, 'utf-8');
    const cacheData = JSON.parse(content);
    
    const ageHours = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60);
    
    if (ageHours < cacheData.expirationHours) {
      return cacheData.data;
    } else {
      console.log(`Cache expired for ${key}`);
      return null;
    }
  } catch (error) {
    // Cache doesn't exist or is invalid
    return null;
  }
}

export default {
  ensureDirectory,
  downloadImage,
  getImageFileName,
  fetchHtml,
  fetchMediaWikiApi,
  getPageImages,
  parseInfobox,
  cleanWikitext,
  delay,
  saveDataToFile,
  loadDataFromFile,
  cacheData,
  getCachedData
};