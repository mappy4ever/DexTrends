import logger from './logger';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  onRetry?: (error: Error, attempt: number) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Retry a function with exponential backoff
 * @param fn The async function to retry
 * @param options Retry configuration options
 * @returns Promise with the result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    onRetry,
    shouldRetry = (error) => {
      // Default: retry on network errors, timeouts, and 5xx errors
      if (error.message?.includes('fetch')) return true;
      if (error.message?.includes('timeout')) return true;
      if (error.message?.includes('network')) return true;
      if ('status' in error && typeof error.status === 'number') {
        return error.status >= 500 && error.status < 600;
      }
      return true;
    }
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Log the error
      logger.warn(`[RetryWithBackoff] Attempt ${attempt + 1} failed:`, {
        error: lastError.message,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1
      });
      
      // Check if we should retry
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }
      
      // Wait before retrying
      logger.debug(`[RetryWithBackoff] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Retry multiple async operations in parallel with individual retry logic
 * @param operations Array of async functions to execute
 * @param options Retry configuration options
 * @returns Promise with array of results
 */
export async function retryMultipleWithBackoff<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
  const results = await Promise.allSettled(
    operations.map(op => retryWithBackoff(op, options))
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value };
    } else {
      logger.error(`[RetryMultiple] Operation ${index} failed after retries:`, {
        error: result.reason
      });
      return { success: false, error: result.reason };
    }
  });
}

/**
 * Create a wrapped version of a function with built-in retry logic
 * @param fn The async function to wrap
 * @param options Retry configuration options
 * @returns Wrapped function with retry logic
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}