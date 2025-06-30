/**
 * Simple circuit breaker implementation
 */

class CircuitBreaker {
  constructor(name, options = {}) {
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

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        return this.fallback();
      }
    }

    this.requests++;

    try {
      const timeoutPromise = new Promise((_, reject) => {
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

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  shouldTrip() {
    return this.requests >= this.volumeThreshold && 
           this.failures >= this.failureThreshold;
  }

  trip() {
    this.state = 'OPEN';
    console.warn(`Circuit breaker ${this.name} tripped. Failures: ${this.failures}`);
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.requests = 0;
    this.lastFailureTime = null;
    console.info(`Circuit breaker ${this.name} reset`);
  }

  getStats() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      requests: this.requests,
      lastFailureTime: this.lastFailureTime
    };
  }
}

export const createCircuitBreaker = (name, options) => {
  return new CircuitBreaker(name, options);
};

// Global registry for monitoring (simplified)
export const globalRegistry = {
  register: () => {},
  getMetricsAsString: () => 'circuit_breaker_metrics 0',
  clear: () => {}
};

export default CircuitBreaker;