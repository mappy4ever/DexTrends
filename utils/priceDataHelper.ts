// Helper functions for generating and managing price data

export interface PriceDataPoint {
  date: string;
  price: number;
}

export interface PriceHistoryData {
  cardId: string;
  cardName: string;
  setName: string;
  variantType: string;
  priceData: PriceDataPoint[];
  stats: {
    highest: number;
    lowest: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// Generate realistic price trends for development/testing
export function generateSamplePriceHistory(
  cardId: string,
  basePrice: number = 10,
  days: number = 30,
  volatility: number = 0.1
): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  let currentPrice = basePrice;
  
  // Generate data points for each day
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic price movement
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice = Math.max(0.5, currentPrice + change);
    
    // Add some trending behavior
    if (i < days / 2) {
      // Trend up in recent days
      currentPrice *= 1 + (Math.random() * 0.02);
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2))
    });
  }
  
  return data;
}

// Store sample data in localStorage
export function storeSamplePriceData(cardId: string, priceData: PriceDataPoint[]): void {
  if (typeof window === 'undefined') return;
  
  const key = `price_history_${cardId}`;
  const dataToStore = {
    cardId,
    data: priceData,
    timestamp: new Date().toISOString(),
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Failed to store sample price data:', error);
  }
}

// Retrieve sample data from localStorage
export function getSamplePriceData(cardId: string): PriceDataPoint[] | null {
  if (typeof window === 'undefined') return null;
  
  const key = `price_history_${cardId}`;
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Check if data is expired
    const age = Date.now() - new Date(parsed.timestamp).getTime();
    if (age > parsed.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    console.error('Failed to retrieve sample price data:', error);
    return null;
  }
}

// Calculate price statistics
export function calculatePriceStats(priceData: PriceDataPoint[]): PriceHistoryData['stats'] {
  if (!priceData || priceData.length === 0) {
    return {
      highest: 0,
      lowest: 0,
      average: 0,
      trend: 'stable'
    };
  }
  
  const prices = priceData.map(d => d.price);
  const highest = Math.max(...prices);
  const lowest = Math.min(...prices);
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  // Determine trend based on first and last 25% of data
  const quarterLength = Math.floor(priceData.length / 4);
  const firstQuarter = priceData.slice(0, quarterLength);
  const lastQuarter = priceData.slice(-quarterLength);
  
  const firstAvg = firstQuarter.reduce((sum, d) => sum + d.price, 0) / firstQuarter.length;
  const lastAvg = lastQuarter.reduce((sum, d) => sum + d.price, 0) / lastQuarter.length;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  const changePercent = ((lastAvg - firstAvg) / firstAvg) * 100;
  
  if (changePercent > 5) trend = 'up';
  else if (changePercent < -5) trend = 'down';
  
  return {
    highest: parseFloat(highest.toFixed(2)),
    lowest: parseFloat(lowest.toFixed(2)),
    average: parseFloat(average.toFixed(2)),
    trend
  };
}

// Format price data for the chart component
export function formatPriceDataForChart(
  data: any[],
  variantType: string = 'market'
): PriceDataPoint[] {
  if (!data || data.length === 0) return [];
  
  return data.map(item => ({
    date: item.collected_at?.split('T')[0] || item.collected_date || item.date,
    price: parseFloat(
      item[`price_${variantType}`] || 
      item.price_market || 
      item.price || 
      0
    )
  })).filter(d => d.price > 0);
}

// Mock Supabase response for development
export function mockSupabasePriceData(cardId: string, days: number = 30): any[] {
  const sampleData = generateSamplePriceHistory(cardId, 15 + Math.random() * 20, days);
  
  return sampleData.map(point => ({
    card_id: cardId,
    collected_date: point.date,
    collected_at: `${point.date}T00:00:00Z`,
    price_market: point.price,
    price_low: point.price * 0.9,
    price_mid: point.price,
    price_high: point.price * 1.1,
    variant_type: 'normal'
  }));
}

// Check if we should use mock data
export function shouldUseMockData(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use mock data in development or if explicitly enabled via localStorage
  const forceMock = localStorage.getItem('force_mock_price_data') === 'true';
  
  // Always use sample data if forced, otherwise never (since Supabase is configured)
  return forceMock;
}

// Batch fetch price data with caching
export async function batchFetchPriceData(
  cardIds: string[],
  fetchFunction: (cardId: string) => Promise<any[]>
): Promise<Map<string, PriceDataPoint[]>> {
  const results = new Map<string, PriceDataPoint[]>();
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < cardIds.length; i += batchSize) {
    const batch = cardIds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (cardId) => {
      try {
        // Check cache first
        const cached = getSamplePriceData(cardId);
        if (cached) {
          results.set(cardId, cached);
          return;
        }
        
        // Fetch from API
        const data = await fetchFunction(cardId);
        const formatted = formatPriceDataForChart(data);
        
        if (formatted.length > 0) {
          results.set(cardId, formatted);
          // Cache the result
          storeSamplePriceData(cardId, formatted);
        }
      } catch (error) {
        console.error(`Failed to fetch price data for ${cardId}:`, error);
      }
    });
    
    await Promise.all(batchPromises);
  }
  
  return results;
}