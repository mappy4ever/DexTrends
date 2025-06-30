/**
 * Enhanced Price Data Collection System
 * Provides improved frequency, accuracy, and market trend analysis
 */

import { supabase } from '../lib/supabase';
import logger from './logger';
import apiCache from './apiCache';

class EnhancedPriceCollector {
  constructor() {
    this.isRunning = false;
    this.batchSize = 25;
    this.delayBetweenBatches = 800; // Reduced delay for faster collection
    this.maxRetries = 3;
    this.collectionStats = {
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Enhanced card data fetching with retry logic and error handling
   */
  async fetchCardDataWithRetry(cardId, retryCount = 0) {
    try {
      const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['X-Api-Key'] = apiKey;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429 && retryCount < this.maxRetries) {
          // Rate limited, wait longer and retry
          const backoffDelay = Math.pow(2, retryCount) * 2000;
          logger.warn(`Rate limited for card ${cardId}, retrying in ${backoffDelay}ms`);
          await this.delay(backoffDelay);
          return this.fetchCardDataWithRetry(cardId, retryCount + 1);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      if (retryCount < this.maxRetries && !error.name === 'AbortError') {
        logger.warn(`Error fetching card ${cardId}, retry ${retryCount + 1}:`, error.message);
        await this.delay(1000 * (retryCount + 1));
        return this.fetchCardDataWithRetry(cardId, retryCount + 1);
      }
      logger.error(`Failed to fetch card ${cardId} after ${retryCount + 1} attempts:`, error);
      return null;
    }
  }

  /**
   * Get trending and popular cards for collection
   */
  async getTrendingCards(limit = 100) {
    try {
      const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['X-Api-Key'] = apiKey;
      }

      // Get cards from multiple popular sets with price data
      const queries = [
        'set.id:base1 OR set.id:base2 OR set.id:base3',
        'set.id:neo1 OR set.id:neo2 OR set.id:neo3',
        'set.id:ex1 OR set.id:ex2 OR set.id:ex3',
        'set.id:dp1 OR set.id:dp2 OR set.id:dp3',
        'set.id:hgss1 OR set.id:hgss2 OR set.id:hgss3',
        'set.id:bw1 OR set.id:bw2 OR set.id:bw3',
        'set.id:xy1 OR set.id:xy2 OR set.id:xy3',
        'set.id:sm1 OR set.id:sm2 OR set.id:sm3',
        'set.id:swsh1 OR set.id:swsh2 OR set.id:swsh3',
        'set.id:sv1 OR set.id:sv2 OR set.id:sv3'
      ];

      const allCards = [];
      const cardsPerQuery = Math.ceil(limit / queries.length);

      for (const query of queries) {
        try {
          const response = await fetch(
            `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=${cardsPerQuery}&orderBy=-tcgplayer.prices.holofoil.market`,
            { headers }
          );

          if (response.ok) {
            const data = await response.json();
            allCards.push(...(data.data || []));
          }
          
          // Small delay between queries
          await this.delay(200);
        } catch (error) {
          logger.warn(`Error fetching cards for query ${query}:`, error.message);
        }
      }

      // Remove duplicates and sort by market price
      const uniqueCards = allCards.filter((card, index, self) => 
        index === self.findIndex(c => c.id === card.id)
      );

      return uniqueCards
        .filter(card => card.tcgplayer?.prices)
        .sort((a, b) => {
          const aPrice = a.tcgplayer?.prices?.holofoil?.market || 0;
          const bPrice = b.tcgplayer?.prices?.holofoil?.market || 0;
          return bPrice - aPrice;
        })
        .slice(0, limit);
    } catch (error) {
      logger.error('Error fetching trending cards:', error);
      return [];
    }
  }

  /**
   * Enhanced price data extraction with market trend analysis
   */
  extractEnhancedPriceData(card) {
    const priceEntries = [];
    const currentTime = new Date().toISOString();
    
    if (card.tcgplayer && card.tcgplayer.prices) {
      const tcgplayerData = card.tcgplayer;
      
      Object.entries(tcgplayerData.prices).forEach(([variant, prices]) => {
        if (prices && typeof prices === 'object') {
          // Calculate price metrics
          const priceMetrics = this.calculatePriceMetrics(prices);
          
          priceEntries.push({
            card_id: card.id,
            card_name: card.name,
            set_name: card.set?.name || null,
            set_id: card.set?.id || null,
            variant_type: variant,
            price_low: prices.low || null,
            price_mid: prices.mid || null,
            price_high: prices.high || null,
            price_market: prices.market || null,
            price_direct_low: prices.directLow || null,
            // Enhanced fields
            price_volatility: priceMetrics.volatility,
            price_spread: priceMetrics.spread,
            price_stability_score: priceMetrics.stabilityScore,
            market_cap_estimate: priceMetrics.marketCapEstimate,
            liquidity_indicator: priceMetrics.liquidityIndicator,
            trend_direction: priceMetrics.trendDirection,
            // Metadata
            rarity: card.rarity || null,
            artist: card.artist || null,
            release_date: card.set?.releaseDate || null,
            tcgplayer_url: tcgplayerData.url || null,
            last_updated_at: tcgplayerData.updatedAt ? new Date(tcgplayerData.updatedAt) : null,
            collected_at: currentTime,
            collection_batch_id: this.currentBatchId,
            raw_data: tcgplayerData
          });
        }
      });
    }
    
    return priceEntries;
  }

  /**
   * Calculate enhanced price metrics for market analysis
   */
  calculatePriceMetrics(prices) {
    const market = prices.market || 0;
    const low = prices.low || 0;
    const high = prices.high || 0;
    const mid = prices.mid || 0;
    const directLow = prices.directLow || 0;

    // Price volatility (coefficient of variation)
    const priceValues = [low, mid, high, market].filter(p => p > 0);
    const mean = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;
    const variance = priceValues.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / priceValues.length;
    const volatility = mean > 0 ? Math.sqrt(variance) / mean : 0;

    // Price spread (high-low range relative to market)
    const spread = market > 0 ? ((high - low) / market) : 0;

    // Stability score (inverse of volatility, 0-100 scale)
    const stabilityScore = Math.max(0, Math.min(100, (1 - volatility) * 100));

    // Market cap estimate (simplified)
    const marketCapEstimate = market * 1000; // Rough estimate

    // Liquidity indicator based on price consistency
    const liquidityIndicator = this.calculateLiquidityScore(prices);

    // Trend direction based on price positioning
    const trendDirection = this.calculateTrendDirection(prices);

    return {
      volatility: Number(volatility.toFixed(4)),
      spread: Number(spread.toFixed(4)),
      stabilityScore: Number(stabilityScore.toFixed(2)),
      marketCapEstimate: Number(marketCapEstimate.toFixed(2)),
      liquidityIndicator: Number(liquidityIndicator.toFixed(2)),
      trendDirection
    };
  }

  /**
   * Calculate liquidity score based on price data
   */
  calculateLiquidityScore(prices) {
    const { market, low, high, directLow } = prices;
    
    if (!market || market <= 0) return 0;

    let score = 50; // Base score

    // Tight spread indicates good liquidity
    const spread = high && low ? (high - low) / market : 1;
    score += (1 - Math.min(spread, 1)) * 25;

    // DirectLow availability indicates active market
    if (directLow && directLow > 0) {
      score += 15;
      
      // DirectLow close to market price indicates competitive market
      const directLowRatio = directLow / market;
      if (directLowRatio >= 0.8 && directLowRatio <= 1.2) {
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate trend direction based on price positioning
   */
  calculateTrendDirection(prices) {
    const { market, low, high, mid } = prices;
    
    if (!market || !low || !high) return 'neutral';

    const position = (market - low) / (high - low);
    
    if (position >= 0.7) return 'bullish';
    if (position <= 0.3) return 'bearish';
    return 'neutral';
  }

  /**
   * Store enhanced price data with batch processing
   */
  async storeEnhancedPriceData(priceEntries, jobId) {
    if (priceEntries.length === 0) return { inserted: 0, errors: 0 };

    try {
      // Store in batches to avoid overwhelming the database
      const batchSize = 50;
      let totalInserted = 0;
      let totalErrors = 0;

      for (let i = 0; i < priceEntries.length; i += batchSize) {
        const batch = priceEntries.slice(i, i + batchSize);
        
        try {
          const { data, error } = await supabase
            .from('card_price_history')
            .insert(batch);

          if (error) {
            logger.error(`Error storing price batch ${i / batchSize + 1}:`, error);
            totalErrors += batch.length;
          } else {
            totalInserted += batch.length;
            logger.debug(`Stored price batch ${i / batchSize + 1}: ${batch.length} entries`);
          }
        } catch (batchError) {
          logger.error(`Batch storage error:`, batchError);
          totalErrors += batch.length;
        }

        // Small delay between batches
        await this.delay(100);
      }

      // Update collection job stats
      if (jobId) {
        await supabase
          .from('price_collection_jobs')
          .update({
            cards_processed: this.collectionStats.totalProcessed,
            cards_updated: totalInserted,
            cards_failed: totalErrors
          })
          .eq('id', jobId);
      }

      return { inserted: totalInserted, errors: totalErrors };
    } catch (error) {
      logger.error('Error in storeEnhancedPriceData:', error);
      return { inserted: 0, errors: priceEntries.length };
    }
  }

  /**
   * Generate market trend analysis
   */
  async generateMarketTrendAnalysis(daysBack = 30) {
    try {
      const { data: priceData, error } = await supabase
        .from('card_price_history')
        .select(`
          card_id,
          card_name,
          set_name,
          variant_type,
          price_market,
          price_volatility,
          trend_direction,
          collected_at
        `)
        .gte('collected_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .order('collected_at', { ascending: true });

      if (error) {
        logger.error('Error fetching price data for trend analysis:', error);
        return null;
      }

      return this.analyzeTrends(priceData);
    } catch (error) {
      logger.error('Error generating market trend analysis:', error);
      return null;
    }
  }

  /**
   * Analyze price trends and generate insights
   */
  analyzeTrends(priceData) {
    const cardTrends = {};
    const marketOverview = {
      totalCards: 0,
      averageVolatility: 0,
      trendDistribution: { bullish: 0, bearish: 0, neutral: 0 },
      topGainers: [],
      topLosers: [],
      mostVolatile: []
    };

    // Group data by card
    priceData.forEach(entry => {
      const key = `${entry.card_id}_${entry.variant_type}`;
      if (!cardTrends[key]) {
        cardTrends[key] = {
          cardId: entry.card_id,
          cardName: entry.card_name,
          setName: entry.set_name,
          variantType: entry.variant_type,
          prices: [],
          currentTrend: entry.trend_direction,
          volatility: entry.price_volatility || 0
        };
      }
      cardTrends[key].prices.push({
        price: entry.price_market,
        date: entry.collected_at
      });
    });

    // Calculate trends for each card
    Object.values(cardTrends).forEach(card => {
      if (card.prices.length < 2) return;

      const sortedPrices = card.prices.sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstPrice = sortedPrices[0].price;
      const lastPrice = sortedPrices[sortedPrices.length - 1].price;
      
      card.priceChange = lastPrice - firstPrice;
      card.priceChangePercent = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

      marketOverview.totalCards++;
      marketOverview.averageVolatility += card.volatility;
      marketOverview.trendDistribution[card.currentTrend]++;
    });

    // Calculate market overview
    if (marketOverview.totalCards > 0) {
      marketOverview.averageVolatility /= marketOverview.totalCards;
    }

    // Get top performers
    const cardArray = Object.values(cardTrends).filter(card => card.priceChangePercent !== undefined);
    
    marketOverview.topGainers = cardArray
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, 10);

    marketOverview.topLosers = cardArray
      .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
      .slice(0, 10);

    marketOverview.mostVolatile = cardArray
      .sort((a, b) => b.volatility - a.volatility)
      .slice(0, 10);

    return {
      marketOverview,
      cardTrends,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Schedule automatic price collection
   */
  async scheduleAutomaticCollection(intervalHours = 6) {
    logger.info(`Scheduling automatic price collection every ${intervalHours} hours`);
    
    setInterval(async () => {
      if (!this.isRunning) {
        logger.info('Starting scheduled price collection');
        await this.collectPricesForTrendingCards();
      }
    }, intervalHours * 60 * 60 * 1000);
  }

  /**
   * Main method to collect prices for trending cards
   */
  async collectPricesForTrendingCards(limit = 200) {
    if (this.isRunning) {
      logger.warn('Price collection already running');
      return { success: false, message: 'Collection already in progress' };
    }

    this.isRunning = true;
    this.collectionStats = {
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      startTime: new Date(),
      endTime: null
    };

    try {
      logger.info(`Starting enhanced price collection for ${limit} trending cards`);

      // Create collection job
      const job = await this.createCollectionJob('enhanced_trending');
      if (!job) {
        throw new Error('Failed to create collection job');
      }

      this.currentBatchId = `batch_${Date.now()}`;

      // Get trending cards
      const trendingCards = await this.getTrendingCards(limit);
      logger.info(`Found ${trendingCards.length} trending cards to process`);

      // Process cards in batches
      const allPriceEntries = [];
      
      for (let i = 0; i < trendingCards.length; i += this.batchSize) {
        const batch = trendingCards.slice(i, i + this.batchSize);
        logger.debug(`Processing batch ${Math.floor(i / this.batchSize) + 1}: ${batch.length} cards`);

        // Fetch card data in parallel
        const cardDataPromises = batch.map(card => this.fetchCardDataWithRetry(card.id));
        const cardDataResults = await Promise.all(cardDataPromises);

        // Extract enhanced price data
        for (let j = 0; j < cardDataResults.length; j++) {
          this.collectionStats.totalProcessed++;
          
          const cardData = cardDataResults[j];
          if (cardData) {
            const priceEntries = this.extractEnhancedPriceData(cardData);
            if (priceEntries.length > 0) {
              allPriceEntries.push(...priceEntries);
              this.collectionStats.successCount++;
            }
          } else {
            this.collectionStats.errorCount++;
          }
        }

        // Store batch results
        if (allPriceEntries.length >= 100) { // Store in chunks of 100
          await this.storeEnhancedPriceData(allPriceEntries, job.id);
          allPriceEntries.length = 0; // Clear array
        }

        // Delay between batches
        if (i + this.batchSize < trendingCards.length) {
          await this.delay(this.delayBetweenBatches);
        }
      }

      // Store remaining entries
      if (allPriceEntries.length > 0) {
        await this.storeEnhancedPriceData(allPriceEntries, job.id);
      }

      // Update job completion
      this.collectionStats.endTime = new Date();
      await this.updateCollectionJob(job.id, {
        status: 'completed',
        completed_at: this.collectionStats.endTime.toISOString(),
        cards_processed: this.collectionStats.totalProcessed,
        cards_updated: this.collectionStats.successCount,
        cards_failed: this.collectionStats.errorCount
      });

      logger.info('Enhanced price collection completed', this.collectionStats);

      return {
        success: true,
        jobId: job.id,
        stats: this.collectionStats
      };

    } catch (error) {
      logger.error('Enhanced price collection failed:', error);
      this.collectionStats.endTime = new Date();
      
      return {
        success: false,
        error: error.message,
        stats: this.collectionStats
      };
    } finally {
      this.isRunning = false;
    }
  }

  async createCollectionJob(jobType = 'enhanced_manual') {
    try {
      const { data, error } = await supabase
        .from('price_collection_jobs')
        .insert({
          job_type: jobType,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating collection job:', error);
      return null;
    }
  }

  async updateCollectionJob(jobId, updates) {
    try {
      const { error } = await supabase
        .from('price_collection_jobs')
        .update(updates)
        .eq('id', jobId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error updating collection job:', error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default EnhancedPriceCollector;