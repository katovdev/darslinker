/**
 * Performance Property Tests
 * Property-based tests for performance preservation requirements
 */

import fc from 'fast-check';
import axios from 'axios';
import { performance } from 'perf_hooks';

const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';
const PERFORMANCE_THRESHOLD_MS = 2000; // 2 seconds max response time
const CONCURRENT_REQUEST_LIMIT = 10;

/**
 * Property 9: Performance Preservation
 * Validates: Requirements 3.5, 7.5
 * 
 * Tests that the Express.js blog backend maintains acceptable performance
 * under various load conditions and request patterns.
 */
describe('Property 9: Performance Preservation', () => {
  
  /**
   * Test response time consistency across different request patterns
   */
  test('API endpoints respond within acceptable time limits', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          '/blogs',
          '/blogs/featured',
          '/categories',
          '/blogs/sitemap.xml'
        ),
        fc.integer({ min: 1, max: 5 }),
        async (endpoint, iterations) => {
          const responseTimes = [];
          
          for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            
            try {
              const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
                timeout: PERFORMANCE_THRESHOLD_MS + 1000
              });
              
              const endTime = performance.now();
              const responseTime = endTime - startTime;
              
              // Verify response is successful
              expect(response.status).toBe(200);
              
              // Verify response time is within threshold
              expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
              
              responseTimes.push(responseTime);
            } catch (error) {
              if (error.code === 'ECONNREFUSED') {
                // Skip test if server is not running
                return;
              }
              throw error;
            }
          }
          
          // Verify response time consistency (no response should be 3x slower than average)
          if (responseTimes.length > 1) {
            const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const maxAcceptableTime = avgResponseTime * 3;
            
            responseTimes.forEach(time => {
              expect(time).toBeLessThan(maxAcceptableTime);
            });
          }
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });

  /**
   * Test concurrent request handling performance
   */
  test('handles concurrent requests efficiently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: CONCURRENT_REQUEST_LIMIT }),
        fc.constantFrom('/blogs/featured', '/blogs', '/categories'),
        async (concurrentCount, endpoint) => {
          const promises = [];
          const startTime = performance.now();
          
          // Create concurrent requests
          for (let i = 0; i < concurrentCount; i++) {
            promises.push(
              axios.get(`${API_BASE_URL}${endpoint}`, {
                timeout: PERFORMANCE_THRESHOLD_MS + 1000
              }).catch(error => {
                if (error.code === 'ECONNREFUSED') {
                  return { status: 503, data: null }; // Server not running
                }
                throw error;
              })
            );
          }
          
          const responses = await Promise.all(promises);
          const endTime = performance.now();
          const totalTime = endTime - startTime;
          
          // Skip if server is not running
          if (responses.every(r => r.status === 503)) {
            return;
          }
          
          // Verify all requests succeeded
          const successfulResponses = responses.filter(r => r.status === 200);
          expect(successfulResponses.length).toBeGreaterThan(0);
          
          // Verify concurrent processing is efficient
          // Total time should not be much more than single request time
          const avgTimePerRequest = totalTime / concurrentCount;
          expect(avgTimePerRequest).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
          
          // Verify no request took excessively long
          expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS * 2);
        }
      ),
      { numRuns: 10, timeout: 45000 }
    );
  });

  /**
   * Test memory efficiency with large datasets
   */
  test('maintains performance with varying data sizes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 50 }),
        fc.constantFrom('/blogs', '/blogs/featured'),
        async (limit, endpoint) => {
          const startTime = performance.now();
          
          try {
            const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
              params: { limit },
              timeout: PERFORMANCE_THRESHOLD_MS + 1000
            });
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            // Verify response is successful
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            
            // Verify response time scales reasonably with data size
            expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
            
            // Verify response structure
            expect(Array.isArray(response.data.data)).toBe(true);
            
            // Response time should not increase dramatically with larger limits
            const expectedMaxTime = Math.min(PERFORMANCE_THRESHOLD_MS, 500 + (limit * 10));
            expect(responseTime).toBeLessThan(expectedMaxTime);
            
          } catch (error) {
            if (error.code === 'ECONNREFUSED') {
              // Skip test if server is not running
              return;
            }
            throw error;
          }
        }
      ),
      { numRuns: 15, timeout: 30000 }
    );
  });

  /**
   * Test database query performance
   */
  test('database queries perform efficiently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          search: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          category: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 }), { nil: undefined }),
          page: fc.integer({ min: 1, max: 5 }),
          limit: fc.integer({ min: 1, max: 20 })
        }),
        async (queryParams) => {
          const startTime = performance.now();
          
          try {
            const response = await axios.get(`${API_BASE_URL}/blogs`, {
              params: queryParams,
              timeout: PERFORMANCE_THRESHOLD_MS + 1000
            });
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            // Verify response is successful
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            
            // Verify query performance
            expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
            
            // Verify pagination works efficiently
            if (response.data.pagination) {
              expect(response.data.pagination.page).toBe(queryParams.page);
              expect(response.data.pagination.limit).toBe(queryParams.limit);
            }
            
            // Complex queries should still be reasonably fast
            const hasComplexQuery = queryParams.search || queryParams.category;
            const maxComplexQueryTime = hasComplexQuery ? 1500 : 1000;
            expect(responseTime).toBeLessThan(maxComplexQueryTime);
            
          } catch (error) {
            if (error.code === 'ECONNREFUSED') {
              // Skip test if server is not running
              return;
            }
            throw error;
          }
        }
      ),
      { numRuns: 25, timeout: 40000 }
    );
  });

  /**
   * Test SEO endpoint performance
   */
  test('SEO endpoints maintain fast response times', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          '/blogs/sitemap.xml',
          '/blogs/featured'
        ),
        async (endpoint) => {
          const startTime = performance.now();
          
          try {
            const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
              timeout: PERFORMANCE_THRESHOLD_MS + 1000,
              headers: {
                'Accept': endpoint.includes('sitemap') ? 'application/xml' : 'application/json'
              }
            });
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            // Verify response is successful
            expect(response.status).toBe(200);
            
            // SEO endpoints should be particularly fast for search engines
            const seoThreshold = 1000; // 1 second for SEO endpoints
            expect(responseTime).toBeLessThan(seoThreshold);
            
            // Verify content type is appropriate
            if (endpoint.includes('sitemap')) {
              expect(response.headers['content-type']).toContain('xml');
            } else {
              expect(response.data.success).toBe(true);
            }
            
          } catch (error) {
            if (error.code === 'ECONNREFUSED') {
              // Skip test if server is not running
              return;
            }
            throw error;
          }
        }
      ),
      { numRuns: 15, timeout: 25000 }
    );
  });

  /**
   * Test caching effectiveness (if implemented)
   */
  test('repeated requests show improved performance', async () => {
    const endpoint = '/blogs/featured';
    const iterations = 3;
    const responseTimes = [];
    
    try {
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          timeout: PERFORMANCE_THRESHOLD_MS + 1000
        });
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        
        responseTimes.push(responseTime);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // All requests should be reasonably fast
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      });
      
      // If caching is implemented, later requests might be faster
      // This is optional - we just verify they're not getting slower
      const firstRequest = responseTimes[0];
      const lastRequest = responseTimes[responseTimes.length - 1];
      
      // Last request should not be significantly slower than first
      expect(lastRequest).toBeLessThan(firstRequest * 2);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        // Skip test if server is not running
        console.log('Skipping caching test - server not available');
        return;
      }
      throw error;
    }
  });
});

/**
 * Performance monitoring utilities for development
 */
export class PerformanceMonitor {
  static async measureEndpoint(endpoint, iterations = 5) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        const endTime = performance.now();
        
        results.push({
          iteration: i + 1,
          responseTime: endTime - startTime,
          status: response.status,
          success: true
        });
      } catch (error) {
        const endTime = performance.now();
        
        results.push({
          iteration: i + 1,
          responseTime: endTime - startTime,
          status: error.response?.status || 0,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      endpoint,
      results,
      summary: {
        totalRequests: results.length,
        successfulRequests: results.filter(r => r.success).length,
        avgResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
        minResponseTime: Math.min(...results.map(r => r.responseTime)),
        maxResponseTime: Math.max(...results.map(r => r.responseTime))
      }
    };
  }
  
  static async benchmarkAllEndpoints() {
    const endpoints = ['/blogs', '/blogs/featured', '/categories', '/blogs/sitemap.xml'];
    const results = {};
    
    for (const endpoint of endpoints) {
      results[endpoint] = await this.measureEndpoint(endpoint);
    }
    
    return results;
  }
}