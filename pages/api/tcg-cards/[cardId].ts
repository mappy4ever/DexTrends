import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { tcgCache } from '../../../lib/tcg-cache';
import performanceMonitor from '../../../utils/performanceMonitor';
import type { TCGCard } from '../../../types/api/cards';
import type { TCGDexCard } from '../../../types/api/tcgdex';
import { transformCard, TCGDexEndpoints, extractBestPrice, transformTCGPlayerPricing, transformCardMarketPricing } from '../../../utils/tcgdex-adapter';
import { isTCGCard } from '../../../utils/typeGuards';
import { TcgCardManager, PriceHistoryManager } from '../../../lib/supabase';
// Pricing: First tries Supabase price_history table, falls back to TCGDex API

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cardId } = req.query;
  const id = Array.isArray(cardId) ? cardId[0] : cardId;
  
  if (!id) {
    return res.status(400).json({ error: 'Card ID is required' });
  }
  
  const startTime = Date.now();
  
  try {
    // Try Supabase first (local database)
    const supabaseCard = await TcgCardManager.getCard(id);
    if (supabaseCard) {
      logger.info('[TCG Card API] Supabase hit', {
        cardId: id,
        source: 'supabase'
      });

      // Transform Supabase card to expected format
      const card: Partial<TCGCard> = {
        id: supabaseCard.id as string,
        name: supabaseCard.name as string,
        supertype: supabaseCard.category === 'Pokemon' ? 'Pokémon' : (supabaseCard.category as 'Trainer' | 'Energy' | 'Pokémon' | undefined),
        hp: supabaseCard.hp ? String(supabaseCard.hp) : undefined,
        types: supabaseCard.types as string[] | undefined,
        evolvesFrom: supabaseCard.evolve_from as string | undefined,
        evolvesTo: supabaseCard.evolve_to as string[] | undefined,
        attacks: supabaseCard.attacks as TCGCard['attacks'],
        abilities: supabaseCard.abilities as TCGCard['abilities'],
        weaknesses: supabaseCard.weaknesses as TCGCard['weaknesses'],
        resistances: supabaseCard.resistances as TCGCard['resistances'],
        retreatCost: supabaseCard.retreat_cost ? Array(supabaseCard.retreat_cost as number).fill('Colorless') : undefined,
        number: supabaseCard.local_id as string,
        artist: supabaseCard.illustrator as string | undefined,
        rarity: supabaseCard.rarity as string | undefined,
        nationalPokedexNumbers: supabaseCard.dex_ids as number[] | undefined,
        legalities: {
          standard: supabaseCard.legal_standard ? 'Legal' : 'Banned',
          expanded: supabaseCard.legal_expanded ? 'Legal' : 'Banned'
        },
        images: {
          small: supabaseCard.image_small as string || '/back-card.png',
          large: supabaseCard.image_large as string || '/back-card.png'
        },
        set: {
          id: supabaseCard.set_id as string,
          name: '',
          series: '',
          printedTotal: 0,
          total: 0,
          releaseDate: '',
          updatedAt: '',
          images: { symbol: '', logo: '' }
        }
      };

      // Fetch pricing: First try Supabase price_history, fallback to TCGDex API
      let pricing = null;
      let priceSource = 'none';

      try {
        // Try Supabase price_history first (fast, local)
        const priceData = await PriceHistoryManager.getLatestPriceFromHistory(id);

        if (priceData && (priceData.tcgplayer_market || priceData.cardmarket_trend)) {
          priceSource = 'supabase';

          // Transform price_history data to TCGPlayer/CardMarket format
          if (priceData.tcgplayer_market || priceData.tcgplayer_low) {
            card.tcgplayer = {
              url: '',
              updatedAt: priceData.tcgplayer_updated_at || priceData.recorded_at || new Date().toISOString(),
              prices: {
                normal: {
                  low: priceData.tcgplayer_low,
                  mid: priceData.tcgplayer_mid,
                  high: priceData.tcgplayer_high,
                  market: priceData.tcgplayer_market,
                  directLow: null
                },
                holofoil: {
                  low: priceData.tcgplayer_low,
                  mid: priceData.tcgplayer_mid,
                  high: priceData.tcgplayer_high,
                  market: priceData.tcgplayer_market,
                  directLow: null
                }
              }
            };
          }

          if (priceData.cardmarket_trend || priceData.cardmarket_low) {
            card.cardmarket = {
              url: '',
              updatedAt: priceData.cardmarket_updated_at || priceData.recorded_at || new Date().toISOString(),
              prices: {
                // Regular prices
                averageSellPrice: priceData.cardmarket_avg || priceData.cardmarket_trend,
                lowPrice: priceData.cardmarket_low,
                trendPrice: priceData.cardmarket_trend,
                avg1: priceData.cardmarket_avg1,
                avg7: priceData.cardmarket_avg7,
                avg30: priceData.cardmarket_avg30,
                // Holo/Reverse prices (will be null until migration + next sync)
                reverseHoloSell: priceData.cardmarket_avg_holo,
                reverseHoloLow: priceData.cardmarket_low_holo,
                reverseHoloTrend: priceData.cardmarket_trend_holo,
                reverseHoloAvg1: priceData.cardmarket_avg1_holo,
                reverseHoloAvg7: priceData.cardmarket_avg7_holo,
                reverseHoloAvg30: priceData.cardmarket_avg30_holo
              }
            };
          }

          card.currentPrice = priceData.tcgplayer_market || priceData.cardmarket_trend || undefined;

          pricing = {
            source: priceData.tcgplayer_market ? 'tcgplayer' : 'cardmarket',
            tcgplayer: card.tcgplayer,
            cardmarket: card.cardmarket,
            lastUpdated: priceData.recorded_at
          };

          logger.debug('[TCG Card API] Pricing from Supabase price_history', {
            cardId: id,
            price: card.currentPrice,
            recordedAt: priceData.recorded_at
          });
        } else {
          // Fallback to TCGDex API if no Supabase price data
          logger.debug('[TCG Card API] No Supabase price, trying TCGDex', { cardId: id });

          const pricingUrl = TCGDexEndpoints.card(id, 'en');
          const tcgdexData = await fetchJSON<TCGDexCard>(pricingUrl, {
            useCache: true,
            cacheTime: 60 * 60 * 1000,
            timeout: 5000,
            retries: 1,
            throwOnError: false
          });

          if (tcgdexData?.pricing) {
            priceSource = 'tcgdex';
            const tcgplayer = transformTCGPlayerPricing(tcgdexData.pricing.tcgplayer);
            const cardmarket = transformCardMarketPricing(tcgdexData.pricing.cardmarket);

            if (tcgplayer) card.tcgplayer = tcgplayer;
            if (cardmarket) card.cardmarket = cardmarket;
            card.currentPrice = extractBestPrice(tcgdexData.pricing);

            pricing = {
              source: tcgplayer ? 'tcgplayer' : 'cardmarket',
              tcgplayer,
              cardmarket
            };

            logger.debug('[TCG Card API] Pricing from TCGDex fallback', {
              cardId: id,
              price: card.currentPrice
            });
          }
        }
      } catch (pricingError) {
        logger.warn('[TCG Card API] Failed to fetch pricing', {
          cardId: id,
          error: pricingError instanceof Error ? pricingError.message : String(pricingError)
        });
      }

      const responseTime = Date.now() - startTime;

      res.setHeader('X-Cache-Status', 'supabase');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Price-Source', priceSource);
      res.setHeader('Cache-Control', priceSource === 'supabase'
        ? 'public, s-maxage=86400, stale-while-revalidate=604800'  // 24h cache if from Supabase
        : 'public, s-maxage=3600, stale-while-revalidate=86400');  // 1h cache if from TCGDex

      return res.status(200).json({
        card,
        pricing,
        cached: false,
        source: 'supabase',
        responseTime
      });
    }

    // Check Redis cache next
    const cachedCard = await tcgCache.getCard(id);
    if (cachedCard) {
      const responseTime = Date.now() - startTime;
      logger.info('[TCG Card API] Cache hit', {
        cardId: id,
        responseTime,
        cached: true,
        hasPrice: !!cachedCard.currentPrice
      });

      res.setHeader('X-Cache-Status', 'hit');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000'); // 1 week cache, 30 day stale

      return res.status(200).json({
        card: cachedCard,
        pricing: cachedCard.tcgplayer || cachedCard.cardmarket ? {
          source: cachedCard.tcgplayer ? 'tcgplayer' : 'cardmarket',
          tcgplayer: cachedCard.tcgplayer,
          cardmarket: cachedCard.cardmarket
        } : null,
        cached: true,
        responseTime
      });
    }

    logger.info('[TCG Card API] No local data, fetching from TCGDex', { cardId: id });

    // Fetch card from TCGDex API (no API key required)
    const apiUrl = TCGDexEndpoints.card(id, 'en');
    const tcgdexCard = await fetchJSON<TCGDexCard>(apiUrl, {
      useCache: true,
      cacheTime: 60 * 60 * 1000, // 1 hour
      timeout: 10000,
      retries: 2,
      retryDelay: 1000,
      throwOnError: false
    });

    if (!tcgdexCard) {
      // API call returned null - likely timeout or API unavailable
      logger.warn('TCGDex API unavailable for card detail', { cardId: id, apiUrl });
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'The TCGDex API is currently unavailable. Please try again later.',
        cardId: id,
        retryAfter: 60
      });
    }

    if (!tcgdexCard.id) {
      return res.status(404).json({ error: 'Card not found', cardId: id });
    }

    // Transform TCGDex card to app format (includes pricing from TCGDex)
    const card = transformCard(tcgdexCard);

    // Extract best price from TCGDex pricing data
    if (tcgdexCard.pricing) {
      card.currentPrice = extractBestPrice(tcgdexCard.pricing);
      logger.debug('[TCG Card API] Card has pricing from TCGDex', {
        cardId: id,
        price: card.currentPrice,
        hasTcgPlayer: !!tcgdexCard.pricing.tcgplayer,
        hasCardMarket: !!tcgdexCard.pricing.cardmarket
      });
    }

    // Cache the card for future requests (ensure card exists)
    if (card) {
      await tcgCache.cacheCard(id, card as TCGCard);
    }

    // Also cache related data
    if (card.images) {
      await tcgCache.cacheImageUrls(id, {
        small: card.images.small,
        large: card.images.large
      });
    }

    if (card.tcgplayer?.prices) {
      await tcgCache.cachePriceData(id, card.tcgplayer.prices);
    }
    
    const responseTime = Date.now() - startTime;
    
    logger.info('[TCG Card API] Fetched and cached card', { 
      cardId: id, 
      responseTime,
      cached: false,
      setId: card.set?.id 
    });
    
    res.setHeader('X-Cache-Status', 'miss');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000'); // 1 week cache, 30 day stale
    
    res.status(200).json({
      card,
      pricing: card.tcgplayer || card.cardmarket ? {
        source: card.tcgplayer ? 'tcgplayer' : 'cardmarket',
        tcgplayer: card.tcgplayer,
        cardmarket: card.cardmarket
      } : null,
      cached: false,
      responseTime
    });
    
  } catch (error) {
    logger.error('[TCG Card API] Error fetching card', {
      cardId: id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch card',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// API endpoint for fetching related cards (cards with the same Pokemon name)
export async function getRelatedCards(pokemonName: string, excludeId?: string): Promise<TCGCard[]> {
  try {
    // Start performance monitoring
    const timerStart = performanceMonitor.startTimer('api-request-related');

    // Extract base Pokemon name (without forms/variants)
    const baseName = pokemonName.split(" ")[0];

    // Fetch related cards from TCGDex (no API key required)
    const apiUrl = `${TCGDexEndpoints.cards('en')}?name=${encodeURIComponent(baseName)}`;
    const relatedData = await fetchJSON<TCGDexCard[]>(apiUrl, {
      useCache: true,
      cacheTime: 30 * 60 * 1000, // 30 minutes
      timeout: 10000,
      retries: 1,
      throwOnError: false
    });

    performanceMonitor.endTimer('api-request-related', timerStart);

    if (!relatedData || !Array.isArray(relatedData)) {
      return [];
    }

    // Transform and filter cards
    const transformedCards = relatedData.map(transformCard);

    // Filter out the current card and limit results
    return transformedCards
      .filter(isTCGCard)
      .filter(card => card.id !== excludeId)
      .slice(0, 8);

  } catch (error) {
    logger.error('[TCG Card API] Error fetching related cards', {
      pokemonName,
      error
    });
    return [];
  }
}