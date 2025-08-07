/**
 * Simple circuit breaker implementation
 */

import logger from '@/utils/logger';

// Types
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  timeout?: number;
  volumeThreshold?: number;
  fallback?: () => Promise<any>;
}

interface CircuitBreakerStats {
  name: string;
  state: CircuitState;
  failures: number;
  requests: number;
  lastFailureTime: number | null;
}

class CircuitBreaker {
  private name: string;
  private failureThreshold: number;
  private resetTimeout: number;
  private timeout: number;
  private volumeThreshold: number;
  private fallback: () => Promise<any>;
  
  private state: CircuitState;
  private failures: number;
  private requests: number;
  private lastFailureTime: number | null;
  private resetTimer: NodeJS.Timeout | null;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.timeout = options.timeout || 10000; // 10 seconds
    this.volumeThreshold = options.volumeThreshold || 10;
    this.fallback = options.fallback || (() => Promise.reject(new Error('Circuit breaker fallback')));
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.requests = 0;
    this.lastFailureTime = null;
    this.resetTimer = null;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        return this.fallback() as Promise<T>;
      }
    }

    this.requests++;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Circuit breaker timeout')), this.timeout);
      });

      const result = await Promise.race([operation(), timeoutPromise]);
      
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      
      if (this.shouldTrip()) {
        this.trip();
      }
      
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  private shouldTrip(): boolean {
    return this.requests >= this.volumeThreshold && 
           this.failures >= this.failureThreshold;
  }

  private trip(): void {
    this.state = 'OPEN';
    logger.warn(`Circuit breaker ${this.name} tripped. Failures: ${this.failures}`);
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.requests = 0;
    this.lastFailureTime = null;
    logger.info(`Circuit breaker ${this.name} reset`);
  }

  getStats(): CircuitBreakerStats {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      requests: this.requests,
      lastFailureTime: this.lastFailureTime
    };
  }
}

export const createCircuitBreaker = (name: string, options?: CircuitBreakerOptions): CircuitBreaker => {
  return new CircuitBreaker(name, options);
};

// Global registry for monitoring (simplified)
interface GlobalRegistry {
  register: () => void;
  getMetricsAsString: () => string;
  clear: () => void;
}

export const globalRegistry: GlobalRegistry = {
  register: () => {},
  getMetricsAsString: () => 'circuit_breaker_metrics 0',
  clear: () => {}
};

export default CircuitBreaker;
export type { CircuitBreakerOptions, CircuitBreakerStats, CircuitState };