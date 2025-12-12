/**
 * useHomepageData - Fetches real content for homepage showcases
 * Uses Supabase database directly for TCG data
 * Caches data in localStorage to prevent re-fetching on every page load
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchJSON } from '../utils/unifiedFetch';
import { TcgCardManager } from '../lib/supabase';
import logger from '../utils/logger';

// Featured Pokemon to showcase (popular/iconic ones)
const FEATURED_POKEMON_IDS = [6, 25, 150, 384, 448, 658]; // Charizard, Pikachu, Mewtwo, Rayquaza, Lucario, Greninja

// Cache key and duration
const CACHE_KEY = 'dextrends-homepage-data-v2';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export interface FeaturedPokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface FeaturedCard {
  id: string;
  name: string;
  setName: string;
  rarity: string;
  image: string;
  price: number | null;
  priceSource: 'tcgplayer' | 'cardmarket' | null;
}

export interface FeaturedSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  cardCount: number;
  logo: string | null;
  symbol: string | null;
}

interface HomepageData {
  featuredPokemon: FeaturedPokemon[];
  featuredCards: FeaturedCard[];
  latestSets: FeaturedSet[];
  latestPocketSets: FeaturedSet[];
  loading: boolean;
  error: string | null;
}

interface CachedData {
  featuredPokemon: FeaturedPokemon[];
  featuredCards: FeaturedCard[];
  latestSets: FeaturedSet[];
  latestPocketSets: FeaturedSet[];
  timestamp: number;
}

// Helper to get cached data from localStorage
function getCachedData(): CachedData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as CachedData;
      // Check if cache is still valid
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

// Helper to save data to localStorage
function setCachedData(data: Omit<CachedData, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore localStorage errors (quota exceeded, etc.)
  }
}

// Initial state - always start with loading to avoid hydration mismatch
const INITIAL_STATE: HomepageData = {
  featuredPokemon: [],
  featuredCards: [],
  latestSets: [],
  latestPocketSets: [],
  loading: true,
  error: null,
};

export function useHomepageData() {
  const [data, setData] = useState<HomepageData>(INITIAL_STATE);
  const hasFetched = useRef(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    // Prevent double fetching (React Strict Mode)
    if (hasFetched.current && !forceRefresh) return;
    hasFetched.current = true;

    // Check localStorage cache first (client-side only)
    if (!forceRefresh) {
      const cached = getCachedData();
      if (cached) {
        setData({
          featuredPokemon: cached.featuredPokemon,
          featuredCards: cached.featuredCards,
          latestSets: cached.latestSets,
          latestPocketSets: cached.latestPocketSets,
          loading: false,
          error: null,
        });
        return;
      }
    }

    try {
      // Fetch Pokemon data from PokeAPI (external)
      const pokemonPromises = FEATURED_POKEMON_IDS.map(id =>
        fetchJSON<{
          id: number;
          name: string;
          types: Array<{ type: { name: string } }>;
          sprites: { other: { 'official-artwork': { front_default: string } } };
          stats: Array<{ stat: { name: string }; base_stat: number }>;
        }>(`https://pokeapi.co/api/v2/pokemon/${id}`, {
          useCache: true,
          cacheTime: 24 * 60 * 60 * 1000, // 24 hours - Pokemon data doesn't change
          throwOnError: false,
        })
      );

      // Fetch TCG sets from Supabase
      const setsPromise = TcgCardManager.getSets();

      // Fetch cards - use searchCards with a deterministic query
      // Sort by ID to get consistent results
      const cardsPromise = TcgCardManager.searchCards({
        limit: 6,
      });

      const [pokemonResults, setsResult, cardsResult] = await Promise.all([
        Promise.all(pokemonPromises),
        setsPromise,
        cardsPromise,
      ]);

      // Transform Pokemon data with safe property access
      const featuredPokemon: FeaturedPokemon[] = pokemonResults
        .filter(Boolean)
        .map(pokemon => ({
          id: pokemon!.id,
          name: pokemon!.name.charAt(0).toUpperCase() + pokemon!.name.slice(1),
          types: pokemon!.types?.map(t => t.type.name) || [],
          sprite: pokemon!.sprites?.other?.['official-artwork']?.front_default
            || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon!.id}.png`,
          stats: {
            hp: pokemon!.stats?.find(s => s.stat.name === 'hp')?.base_stat ?? 0,
            attack: pokemon!.stats?.find(s => s.stat.name === 'attack')?.base_stat ?? 0,
            defense: pokemon!.stats?.find(s => s.stat.name === 'defense')?.base_stat ?? 0,
            speed: pokemon!.stats?.find(s => s.stat.name === 'speed')?.base_stat ?? 0,
          },
        }));

      // Separate Pocket sets from regular TCG sets
      const POCKET_SET_PATTERNS = /^(A[0-9]|P-A)/i;

      const allSetsWithDates = (setsResult || []).filter(s => s.release_date);

      // Regular TCG sets - top 3 newest
      const latestSets: FeaturedSet[] = allSetsWithDates
        .filter(s => !POCKET_SET_PATTERNS.test(s.id))
        .sort((a, b) => new Date(b.release_date!).getTime() - new Date(a.release_date!).getTime())
        .slice(0, 3)
        .map(set => ({
          id: set.id,
          name: set.name,
          series: set.series_id || '',
          releaseDate: set.release_date || '',
          cardCount: set.total_cards || 0,
          logo: set.logo_url,
          symbol: set.symbol_url,
        }));

      // Pocket sets - top 3 newest
      const latestPocketSets: FeaturedSet[] = allSetsWithDates
        .filter(s => POCKET_SET_PATTERNS.test(s.id))
        .sort((a, b) => new Date(b.release_date!).getTime() - new Date(a.release_date!).getTime())
        .slice(0, 3)
        .map(set => ({
          id: set.id,
          name: set.name,
          series: set.series_id || '',
          releaseDate: set.release_date || '',
          cardCount: set.total_cards || 0,
          logo: set.logo_url,
          symbol: set.symbol_url,
        }));

      // Transform cards - sort by ID for consistency
      const sortedCards = (cardsResult || [])
        .filter(card => card.image_small || card.image_large)
        .sort((a, b) => a.id.localeCompare(b.id))
        .slice(0, 6);

      const featuredCards: FeaturedCard[] = sortedCards.map(card => ({
        id: card.id,
        name: card.name,
        setName: card.set_id || '',
        rarity: card.rarity || '',
        image: card.image_small || card.image_large || '/back-card.png',
        price: null,
        priceSource: null,
      }));

      // Cache the data for future page loads
      setCachedData({
        featuredPokemon,
        featuredCards,
        latestSets,
        latestPocketSets,
      });

      setData({
        featuredPokemon,
        featuredCards,
        latestSets,
        latestPocketSets,
        loading: false,
        error: null,
      });
    } catch (err) {
      logger.error('Failed to load homepage data', { error: err });
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load data',
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...data,
    refetch: () => loadData(true),
  };
}

export default useHomepageData;
