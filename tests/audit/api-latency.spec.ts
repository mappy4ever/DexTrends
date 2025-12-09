/**
 * API Latency Monitoring Test
 *
 * Tests API endpoints for response time, payload size, and error rates.
 * Part of the production audit testing suite.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

// API endpoints to test with expected configurations
const ENDPOINTS = [
  // Health & Status (may return 503 if system is under stress - that's expected)
  { path: '/api/health', method: 'GET', name: 'Health Check', maxLatency: 500, allowedStatus: [200, 503] },
  { path: '/api/health?level=detailed', method: 'GET', name: 'Health Detailed', maxLatency: 2000, allowedStatus: [200, 503] },

  // TCG Endpoints
  { path: '/api/tcgexpansions?page=1&pageSize=20', method: 'GET', name: 'TCG Expansions', maxLatency: 3000 },
  { path: '/api/tcg-series', method: 'GET', name: 'TCG Series', maxLatency: 2000 },
  { path: '/api/tcg-cards?name=pikachu&pageSize=10', method: 'GET', name: 'TCG Card Search', maxLatency: 3000 },

  // Pocket Mode Endpoints
  { path: '/api/pocket-expansions', method: 'GET', name: 'Pocket Expansions', maxLatency: 2000 },
  { path: '/api/pocket-cards?name=pikachu', method: 'GET', name: 'Pocket Cards', maxLatency: 3000 },

  // Market Endpoints
  { path: '/api/market/trends', method: 'GET', name: 'Market Trends', maxLatency: 3000 },
];

interface LatencyResult {
  endpoint: string;
  name: string;
  latencies: number[];
  median: number;
  p90: number;
  p95: number;
  payloadSize: number;
  status: number;
  passed: boolean;
  issues: string[];
}

// Calculate percentiles
function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

test.describe('API Latency Monitoring', () => {
  const results: LatencyResult[] = [];

  for (const endpoint of ENDPOINTS) {
    test(`${endpoint.name} - latency < ${endpoint.maxLatency}ms`, async ({ request }) => {
      const latencies: number[] = [];
      let payloadSize = 0;
      let status = 0;
      const issues: string[] = [];

      // Run 5 requests to get stable latency measurements
      for (let i = 0; i < 5; i++) {
        const start = Date.now();

        try {
          const response = await request.get(`${BASE_URL}${endpoint.path}`, {
            timeout: 30000,
          });

          const elapsed = Date.now() - start;
          latencies.push(elapsed);

          // Capture first response details
          if (i === 0) {
            status = response.status();
            const body = await response.text();
            payloadSize = Buffer.byteLength(body, 'utf8');

            if (status >= 400) {
              issues.push(`HTTP ${status} error`);
            }
          }
        } catch (error) {
          latencies.push(30000); // Timeout value
          issues.push(`Request failed: ${error.message}`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Calculate statistics
      const median = percentile(latencies, 50);
      const p90 = percentile(latencies, 90);
      const p95 = percentile(latencies, 95);

      // Check for issues
      if (median > endpoint.maxLatency) {
        issues.push(`Median latency ${median}ms exceeds threshold ${endpoint.maxLatency}ms`);
      }
      if (payloadSize > 500000) {
        issues.push(`Large payload: ${Math.round(payloadSize / 1024)}KB`);
      }

      const result: LatencyResult = {
        endpoint: endpoint.path,
        name: endpoint.name,
        latencies,
        median,
        p90,
        p95,
        payloadSize,
        status,
        passed: issues.length === 0,
        issues,
      };

      results.push(result);

      // Log result
      console.log(`\n${endpoint.name}:`);
      console.log(`  Median: ${median}ms, P90: ${p90}ms, P95: ${p95}ms`);
      console.log(`  Payload: ${Math.round(payloadSize / 1024)}KB, Status: ${status}`);
      if (issues.length > 0) {
        issues.forEach(issue => console.log(`  ⚠️ ${issue}`));
      }

      // Assert latency is within threshold
      expect(median, `${endpoint.name} median latency should be < ${endpoint.maxLatency}ms`).toBeLessThan(endpoint.maxLatency);

      // Check status - either success (<400) or in allowed list
      const allowedStatuses = (endpoint as { allowedStatus?: number[] }).allowedStatus || [];
      const statusOk = status < 400 || allowedStatuses.includes(status);
      expect(statusOk, `${endpoint.name} should return success status (got ${status})`).toBe(true);
    });
  }

  test.afterAll(async () => {
    // Print summary
    console.log('\n\n=== API LATENCY SUMMARY ===\n');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log(`Endpoints Tested: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    // Sort by median latency
    const sortedByLatency = [...results].sort((a, b) => b.median - a.median);

    console.log('\nSlowest Endpoints:');
    sortedByLatency.slice(0, 5).forEach(r => {
      console.log(`  ${r.name}: ${r.median}ms (P95: ${r.p95}ms)`);
    });

    // Sort by payload size
    const sortedBySize = [...results].sort((a, b) => b.payloadSize - a.payloadSize);

    console.log('\nLargest Payloads:');
    sortedBySize.slice(0, 5).forEach(r => {
      console.log(`  ${r.name}: ${Math.round(r.payloadSize / 1024)}KB`);
    });

    if (failed > 0) {
      console.log('\nFailed Endpoints:');
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  ${r.name}:`);
        r.issues.forEach(issue => console.log(`    - ${issue}`));
      });
    }
  });
});
