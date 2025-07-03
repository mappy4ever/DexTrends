/**
 * Enhanced fetch utility with retry logic, exponential backoff, and error handling
 */

import logger from './logger';

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000, // Base delay in ms
  retryDelayMultiplier: 2, // Exponential backoff multiplier
  retryOn: [408, 429, 500, 502, 503, 504], // HTTP status codes to retry on
  timeout: 10000, // Request timeout in ms
  onRetry: null // Callback function for retry events
};

/**
 * Check if error should trigger a retry
 */
function shouldRetry(error, retryOn, attempt, maxRetries) {
  if (attempt >= maxRetries) {
    return false;
  }

  // Network errors
  if (error.name === 'TypeError' || error.name === 'NetworkError') {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError') {
    return true;
  }

  // HTTP status code errors
  if (error.status && retryOn.includes(error.status)) {
    return true;
  }

  return false;
}

/**
 * Enhanced fetch with retry logic
 */
export async function retryFetch(url, options = {}, retryConfig = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  const { retries, retryDelay, retryDelayMultiplier, retryOn, timeout, onRetry } = config;
  
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const fetchOptions = {
        ...options,
        signal: controller.signal
      };
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      // If response is ok, return it
      if (response.ok) {
        return response;
      }
      
      // Create error for non-ok responses
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      
      throw error;
      
    } catch (error) {
      lastError = error;
      
      // If this is the last attempt or shouldn't retry, throw the error
      if (!shouldRetry(error, retryOn, attempt, retries)) {
        throw error;
      }
      
      // Calculate delay for next attempt (exponential backoff)
      const delay = retryDelay * Math.pow(retryDelayMultiplier, attempt);
      
      // Call retry callback if provided
      if (onRetry) {
        try {
          onRetry(error, attempt + 1);
        } catch (callbackError) {
          // Don't let callback errors stop the retry process
        }
      }
      
      // Wait before next attempt
      await sleep(delay);
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

/**
 * Enhanced fetch with JSON parsing and retry logic
 */
export async function retryFetchJson(url, options = {}, retryConfig = {}) {
  const response = await retryFetch(url, options, retryConfig);
  
  try {
    return await response.json();
  } catch (error) {
    const parseError = new Error(`Failed to parse JSON response: ${error.message}`);
    parseError.originalError = error;
    parseError.response = response;
    throw parseError;
  }
}

/**
 * Batch fetch with retry logic
 */
export async function batchRetryFetch(requests, options = {}) {
  const {
    concurrency = 5,
    retryConfig = {},
    onProgress = null
  } = options;
  
  const results = [];
  const errors = [];
  let completed = 0;
  
  // Process requests in batches
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (request, index) => {
      try {
        const { url, options: requestOptions = {} } = request;
        const result = await retryFetchJson(url, requestOptions, retryConfig);
        
        completed++;
        if (onProgress) {
          onProgress(completed, requests.length);
        }
        
        return { index: i + index, result, error: null };
      } catch (error) {
        completed++;
        if (onProgress) {
          onProgress(completed, requests.length);
        }
        
        return { index: i + index, result: null, error };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ index, result, error }) => {
      if (error) {
        errors.push({ index, error });
      } else {
        results[index] = result;
      }
    });
  }
  
  return {
    results,
    errors,
    successCount: results.filter(r => r !== undefined).length,
    errorCount: errors.length
  };
}

/**
 * Create a fetch function with predefined retry configuration
 */
export function createRetryFetch(defaultRetryConfig = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...defaultRetryConfig };
  
  return {
    fetch: (url, options = {}, retryConfig = {}) => 
      retryFetch(url, options, { ...config, ...retryConfig }),
    
    fetchJson: (url, options = {}, retryConfig = {}) => 
      retryFetchJson(url, options, { ...config, ...retryConfig }),
    
    batchFetch: (requests, options = {}) => 
      batchRetryFetch(requests, { retryConfig: config, ...options })
  };
}

/**
 * Predefined fetch instances for different use cases
 */

// For Pokemon API calls (more lenient retry policy)
export const pokemonFetch = createRetryFetch({
  retries: 3,
  retryDelay: 1000,
  timeout: 15000,
  onRetry: (error, attempt) => {
    logger.warn(`Pokemon API retry attempt ${attempt}:`, { error: error.message });
  }
});

// For card API calls (standard retry policy)
export const cardFetch = createRetryFetch({
  retries: 2,
  retryDelay: 500,
  timeout: 10000,
  onRetry: (error, attempt) => {
    logger.warn(`Card API retry attempt ${attempt}:`, { error: error.message });
  }
});

// For critical API calls (aggressive retry policy)
export const criticalFetch = createRetryFetch({
  retries: 5,
  retryDelay: 2000,
  retryDelayMultiplier: 1.5,
  timeout: 20000,
  onRetry: (error, attempt) => {
    logger.warn(`Critical API retry attempt ${attempt}:`, { error: error.message });
  }
});

export default retryFetch;