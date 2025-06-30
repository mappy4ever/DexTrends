// pages/api/filters.js 
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check environment variables.");
}

// Create client only if variables are present
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Cache for filter data
let filterCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const POKEMON_TYPES = [
  'colorless', 'darkness', 'dragon', 'fairy', 'fighting', 
  'fire', 'grass', 'lightning', 'metal', 'psychic', 'water'
];

const RARITIES = [
  'Amazing Rare',
  'Classic Collection',
  'Common',
  'LEGEND',
  'Promo',
  'Rare',
  'Rare ACE',
  'Rare BREAK',
  'Rare Holo',
  'Rare Holo EX',
  'Rare Holo GX',
  'Rare Holo LV.X',
  'Rare Holo Star',
  'Rare Holo V',
  'Rare Holo VMAX',
  'Rare Holo VSTAR',
  'Rare Prime',
  'Rare Prism Star',
  'Rare Rainbow',
  'Rare Secret',
  'Rare Shining',
  'Rare Shiny',
  'Rare Shiny GX',
  'Rare Ultra',
  'Uncommon'
];

async function getFiltersFromSupabase() {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    // Get unique sets from cards table
    const { data: setsData, error: setsError } = await supabase
      .from('cards')
      .select('set_id, set_name')
      .not('set_id', 'is', null)
      .not('set_name', 'is', null);

    if (setsError) {
      console.error('Error fetching sets:', setsError);
      throw setsError;
    }

    // Get unique sets with counts
    const setsMap = new Map();
    setsData?.forEach(card => {
      if (card.set_id && card.set_name) {
        if (setsMap.has(card.set_id)) {
          setsMap.get(card.set_id).count++;
        } else {
          setsMap.set(card.set_id, {
            id: card.set_id,
            name: card.set_name,
            count: 1
          });
        }
      }
    });

    const sets = Array.from(setsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    // Get unique artists
    const { data: artistsData, error: artistsError } = await supabase
      .from('cards')
      .select('artist')
      .not('artist', 'is', null);

    if (artistsError) {
      console.error('Error fetching artists:', artistsError);
      throw artistsError;
    }

    const artistsSet = new Set();
    artistsData?.forEach(card => {
      if (card.artist) {
        artistsSet.add(card.artist);
      }
    });

    const artists = Array.from(artistsSet).sort();

    return {
      types: POKEMON_TYPES,
      rarities: RARITIES,
      sets: sets,
      artists: artists.slice(0, 100) // Limit to first 100 artists
    };

  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

function getFallbackFilters() {
  return {
    types: POKEMON_TYPES,
    rarities: RARITIES,
    sets: [
      { id: 'base1', name: 'Base Set', count: 102 },
      { id: 'jungle', name: 'Jungle', count: 64 },
      { id: 'fossil', name: 'Fossil', count: 62 }
    ],
    artists: ['Ken Sugimori', 'Mitsuhiro Arita', 'Kagemaru Himeno']
  };
}

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check cache first
    const now = Date.now();
    if (filterCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        data: filterCache,
        cached: true,
        timestamp: new Date(cacheTimestamp).toISOString()
      });
    }

    let filterData;

    try {
      // Try to get data from Supabase
      filterData = await getFiltersFromSupabase();
    } catch (error) {
      console.error('Failed to fetch from database, using fallback:', error);
      // Use fallback data if database fails
      filterData = getFallbackFilters();
    }

    // Update cache
    filterCache = filterData;
    cacheTimestamp = now;

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return res.status(200).json({
      success: true,
      data: filterData,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Filter API error:', error);
    
    // Return fallback data even on error
    const fallbackData = getFallbackFilters();
    
    return res.status(200).json({
      success: true,
      data: fallbackData,
      error: 'Using fallback data due to server error',
      timestamp: new Date().toISOString()
    });
  }
}