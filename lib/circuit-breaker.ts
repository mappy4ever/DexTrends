/**
 * Circuit Breaker Pattern for External API Resilience
 *
 * Prevents cascading failures when external APIs are down or slow.
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Circuit tripped, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 */

import logger from '@/utils/logger';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold?: number;
  /** Time in ms before attempting recovery */
  resetTimeout?: number;
  /** Number of successful calls needed to close circuit */
  successThreshold?: number;
  /** Request timeout in ms */
  timeout?: number;
  /** Name for logging */
  name?: string;
}

interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  totalRequests: number;
  failedRequests: number;
  successfulRequests: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private totalRequests: number = 0;
  private failedRequests: number = 0;
  private successfulRequests: number = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly successThreshold: number;
  private readonly timeout: number;
  private readonly name: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 30000; // 30 seconds
    this.successThreshold = options.successThreshold ?? 2;
    this.timeout = options.timeout ?? 10000; // 10 seconds
    this.name = options.name ?? 'unnamed';
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        logger.info(`[CircuitBreaker:${this.name}] Transitioning to HALF_OPEN`);
      } else {
        this.failedRequests++;
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN for ${this.name}`,
          this.name,
          this.state
        );
      }
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Circuit breaker timeout after ${this.timeout}ms`));
      }, this.timeout);

      fn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.successfulRequests++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        logger.info(`[CircuitBreaker:${this.name}] Circuit CLOSED - service recovered`);
      }
    } else {
      // Reset failure count on success in CLOSED state
      this.failures = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failedRequests++;
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in HALF_OPEN immediately opens circuit
      this.state = CircuitState.OPEN;
      this.successes = 0;
      logger.warn(`[CircuitBreaker:${this.name}] Circuit OPENED - failed during recovery test`);
    } else if (this.failures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      logger.warn(`[CircuitBreaker:${this.name}] Circuit OPENED - failure threshold reached (${this.failures}/${this.failureThreshold})`);
    }
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.resetTimeout;
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests,
      successfulRequests: this.successfulRequests
    };
  }

  /**
   * Force the circuit to a specific state (for testing/admin)
   */
  forceState(state: CircuitState): void {
    logger.info(`[CircuitBreaker:${this.name}] Force state change: ${this.state} -> ${state}`);
    this.state = state;
    if (state === CircuitState.CLOSED) {
      this.failures = 0;
      this.successes = 0;
    }
  }

  /**
   * Check if circuit is allowing requests
   */
  isAvailable(): boolean {
    if (this.state === CircuitState.CLOSED) return true;
    if (this.state === CircuitState.HALF_OPEN) return true;
    if (this.state === CircuitState.OPEN && this.shouldAttemptReset()) return true;
    return false;
  }
}

/**
 * Custom error for circuit breaker failures
 */
export class CircuitBreakerError extends Error {
  readonly circuitName: string;
  readonly circuitState: CircuitState;

  constructor(message: string, circuitName: string, state: CircuitState) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
    this.circuitState = state;
  }
}

// Pre-configured circuit breakers for external APIs
export const circuitBreakers = {
  tcgdex: new CircuitBreaker({
    name: 'TCGDex',
    failureThreshold: 5,
    resetTimeout: 30000,
    timeout: 15000
  }),
  pokeapi: new CircuitBreaker({
    name: 'PokeAPI',
    failureThreshold: 5,
    resetTimeout: 60000, // PokeAPI is critical, wait longer
    timeout: 10000
  }),
  pokemontcg: new CircuitBreaker({
    name: 'PokemonTCG',
    failureThreshold: 3,
    resetTimeout: 30000,
    timeout: 10000
  }),
  github: new CircuitBreaker({
    name: 'GitHub',
    failureThreshold: 3,
    resetTimeout: 60000,
    timeout: 10000
  })
};

/**
 * Get health status of all circuit breakers
 */
export function getCircuitBreakerHealth(): Record<string, CircuitBreakerStats> {
  const health: Record<string, CircuitBreakerStats> = {};
  for (const [name, breaker] of Object.entries(circuitBreakers)) {
    health[name] = breaker.getStats();
  }
  return health;
}

export default CircuitBreaker;
