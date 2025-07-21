// Bulbapedia Scraper Utilities
// Core utilities for scraping, downloading, and processing data

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import scraperConfig from './scraperConfig';
import logger from '../logger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

// Type definitions
interface ImageInfo {
  title: string;
  url: string;
  thumburl?: string;
  width: number;
  height: number;
  mime: string;
}

interface MediaWikiImageInfo {
  url: string;
  thumburl?: string;
  width: number;
  height: number;
  mime: string;
}

interface MediaWikiPageResponse {
  query?: {
    pages?: Record<string, {
      title?: string;
      images?: Array<{ title: string }>;
      imageinfo?: MediaWikiImageInfo[];
    }>;
  };
}

interface CacheData<T = any> {
  data: T;
  timestamp: number;
  expirationHours: number;
}

type ImageFilterFunction = (title: string, info: MediaWikiImageInfo) => boolean;

// Ensure directory exists
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    logger.debug(`Created directory: ${dirPath}`);
  }
}

// Download and save image
export async function downloadImage(imageUrl: string, fileName: string, subfolder: string = ''): Promise<string | null> {
  try {
    const imagesDir = path.join(projectRoot, scraperConfig.storage.imagesDir, subfolder);
    await ensureDirectory(imagesDir);

    const filePath = path.join(imagesDir, fileName);
    
    // Skip if file already exists
    try {
      await fs.access(filePath);
      logger.debug(`Image already exists: ${fileName}`);
      return filePath;
    } catch {
      // File doesn't exist, proceed with download
    }

    logger.info(`Downloading image: ${imageUrl}`);
    
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
    logger.info(`Image saved: ${fileName}`);
    
    return filePath;
  } catch (error) {
    logger.error(`Error downloading image ${imageUrl}:`, { url: imageUrl, error: (error as Error).message });
    return null;
  }
}

// Get image filename from URL
export function getImageFileName(imageUrl: string, prefix: string = '', suffix: string = ''): string {
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
export async function fetchHtml(url: string): Promise<string | null> {
  try {
    logger.debug(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': scraperConfig.settings.userAgent
      },
      signal: AbortSignal.timeout(scraperConfig.settings.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    logger.error(`Error fetching ${url}:`, { url, error: (error as Error).message });
    return null;
  }
}

// Parse MediaWiki API response
export async function fetchMediaWikiApi(params: Record<string, string>): Promise<MediaWikiPageResponse | null> {
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
    url.searchParams.append(key, allParams[key as keyof typeof allParams]);
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
    logger.error(`Error fetching MediaWiki API:`, { error: (error as Error).message });
    return null;
  }
}

// Extract images from MediaWiki page
export async function getPageImages(pageTitle: string, imageFilter: ImageFilterFunction | null = null): Promise<ImageInfo[]> {
  const data = await fetchMediaWikiApi({
    action: 'query',
    prop: 'images',
    titles: pageTitle,
    imlimit: '50'
  });

  if (!data || !data.query || !data.query.pages) {
    return [];
  }

  const page = Object.values(data.query.pages)[0];
  if (!page || !page.images) {
    return [];
  }

  const images: ImageInfo[] = [];
  
  for (const image of page.images) {
    // Get image info
    const imageData = await fetchMediaWikiApi({
      action: 'query',
      prop: 'imageinfo',
      titles: image.title,
      iiprop: 'url|size|mime',
      iiurlwidth: scraperConfig.settings.imageSizes.large.toString()
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
export function parseInfobox(wikitext: string, infoboxType: string = 'Character'): Record<string, string> | null {
  try {
    const regex = new RegExp(`{{\\s*${infoboxType}([^}]*(?:{[^}]*}[^}]*)*)}}`, 'is');
    const match = wikitext.match(regex);
    
    if (!match) return null;
    
    const infoboxContent = match[1];
    const data: Record<string, string> = {};
    
    // Split by lines and parse key-value pairs
    const lines = infoboxContent.split('\n');
    let currentKey: string | null = null;
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
    logger.error('Error parsing infobox:', { error: (error as Error).message });
    return null;
  }
}

// Clean wikitext markup
export function cleanWikitext(text: string): string {
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
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Save data to JSON file
export async function saveDataToFile<T>(data: T, fileName: string, subfolder: string = ''): Promise<string | null> {
  try {
    const dataDir = path.join(projectRoot, scraperConfig.storage.dataDir, subfolder);
    await ensureDirectory(dataDir);
    
    const filePath = path.join(dataDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    logger.debug(`Data saved: ${fileName}`);
    return filePath;
  } catch (error) {
    logger.error(`Error saving data to ${fileName}:`, { fileName, error: (error as Error).message });
    return null;
  }
}

// Load data from JSON file
export async function loadDataFromFile<T>(fileName: string, subfolder: string = ''): Promise<T | null> {
  try {
    const dataDir = path.join(projectRoot, scraperConfig.storage.dataDir, subfolder);
    const filePath = path.join(dataDir, fileName);
    
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    logger.error(`Error loading data from ${fileName}:`, { fileName, error: (error as Error).message });
    return null;
  }
}

// Get cache file path
export function getCacheFilePath(key: string): string {
  return path.join(projectRoot, scraperConfig.storage.cacheDir, `${key}.json`);
}

// Cache data with expiration
export async function cacheData<T>(key: string, data: T, expirationHours: number = 24): Promise<boolean> {
  try {
    const cacheDir = path.join(projectRoot, scraperConfig.storage.cacheDir);
    await ensureDirectory(cacheDir);
    
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      expirationHours
    };
    
    const filePath = getCacheFilePath(key);
    await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
    
    return true;
  } catch (error) {
    logger.error(`Error caching data for ${key}:`, { key, error: (error as Error).message });
    return false;
  }
}

// Get cached data if not expired
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const filePath = getCacheFilePath(key);
    const content = await fs.readFile(filePath, 'utf-8');
    const cacheData: CacheData<T> = JSON.parse(content);
    
    const ageHours = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60);
    
    if (ageHours < cacheData.expirationHours) {
      return cacheData.data;
    } else {
      logger.debug(`Cache expired for ${key}`);
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