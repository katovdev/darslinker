#!/usr/bin/env node

/**
 * Performance Benchmark Script
 * Compares response times between original NestJS blog backend and new Express.js implementation
 */

import axios from 'axios';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

class PerformanceBenchmark {
  constructor() {
    this.expressBaseUrl = process.env.EXPRESS_API_URL || 'http://localhost:3000/api';
    this.nestjsBaseUrl = process.env.NESTJS_BLOG_API_URL || 'http://localhost:3001/api';
    this.results = {
      timestamp: new Date().toISOString(),
      express: {},
      nestjs: {},
      comparison: {},
      summary: {}
    };
  }

  /**
   * Measure response time for a single request
   */
  async measureRequest(url, options = {}) {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        ...options
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      return {
        success: true,
        responseTime,
        statusCode: response.status,
        dataSize: JSON.stringify(response.data).length,
        headers: response.headers
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      return {
        success: false,
        responseTime,
        error: error.message,
        statusCode: error.response?.status || 0
      };
    }
  }

  /**
   * Run multiple requests and calculate statistics
   */
  async benchmarkEndpoint(url, iterations = 10) {
    console.log(`Benchmarking: ${url} (${iterations} iterations)`);
    
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await this.measureRequest(url);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const successfulResults = results.filter(r => r.success);
    const responseTimes = successfulResults.map(r => r.responseTime);
    
    if (responseTimes.length === 0) {
      return {
        success: false,
        error: 'All requests failed',
        failureRate: 100
      };
    }
    
    const stats = {
      success: true,
      iterations,
      successfulRequests: successfulResults.length,
      failureRate: ((iterations - successfulResults.length) / iterations) * 100,
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        avg: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        median: this.calculateMedian(responseTimes),
        p95: this.calculatePercentile(responseTimes, 95),
        p99: this.calculatePercentile(responseTimes, 99)
      }
    };
    
    if (successfulResults.length > 0) {
      stats.avgDataSize = successfulResults.reduce((sum, r) => sum + (r.dataSize || 0), 0) / successfulResults.length;
    }
    
    return stats;
  }

  /**
   * Calculate median value
   */
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  /**
   * Calculate percentile value
   */
  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Test blog endpoints
   */
  async benchmarkBlogEndpoints() {
    const endpoints = [
      { name: 'getAllBlogs', path: '/blogs' },
      { name: 'getFeaturedBlogs', path: '/blogs/featured' },
      { name: 'getCategories', path: '/categories' },
      { name: 'getBlogById', path: '/blogs/507f1f77bcf86cd799439011' }, // Sample ID
      { name: 'getSitemap', path: '/blogs/sitemap.xml' }
    ];

    console.log('Starting Express.js backend benchmarks...');
    
    for (const endpoint of endpoints) {
      const url = `${this.expressBaseUrl}${endpoint.path}`;
      this.results.express[endpoint.name] = await this.benchmarkEndpoint(url);
    }

    console.log('Starting NestJS backend benchmarks...');
    
    for (const endpoint of endpoints) {
      const url = `${this.nestjsBaseUrl}${endpoint.path}`;
      this.results.nestjs[endpoint.name] = await this.benchmarkEndpoint(url);
    }
  }

  /**
   * Compare performance between backends
   */
  comparePerformance() {
    console.log('Analyzing performance comparison...');
    
    for (const endpointName of Object.keys(this.results.express)) {
      const expressResult = this.results.express[endpointName];
      const nestjsResult = this.results.nestjs[endpointName];
      
      if (!expressResult.success || !nestjsResult.success) {
        this.results.comparison[endpointName] = {
          status: 'error',
          expressWorking: expressResult.success,
          nestjsWorking: nestjsResult.success
        };
        continue;
      }
      
      const expressAvg = expressResult.responseTime.avg;
      const nestjsAvg = nestjsResult.responseTime.avg;
      const improvement = ((nestjsAvg - expressAvg) / nestjsAvg) * 100;
      
      this.results.comparison[endpointName] = {
        status: 'success',
        expressAvgMs: Math.round(expressAvg * 100) / 100,
        nestjsAvgMs: Math.round(nestjsAvg * 100) / 100,
        improvementPercent: Math.round(improvement * 100) / 100,
        isFaster: expressAvg < nestjsAvg,
        expressFailureRate: expressResult.failureRate,
        nestjsFailureRate: nestjsResult.failureRate
      };
    }
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    const comparisons = Object.values(this.results.comparison).filter(c => c.status === 'success');
    
    if (comparisons.length === 0) {
      this.results.summary = {
        status: 'error',
        message: 'No successful comparisons available'
      };
      return;
    }
    
    const fasterCount = comparisons.filter(c => c.isFaster).length;
    const avgImprovement = comparisons.reduce((sum, c) => sum + c.improvementPercent, 0) / comparisons.length;
    const avgExpressTime = comparisons.reduce((sum, c) => sum + c.expressAvgMs, 0) / comparisons.length;
    const avgNestjsTime = comparisons.reduce((sum, c) => sum + c.nestjsAvgMs, 0) / comparisons.length;
    
    this.results.summary = {
      status: 'success',
      totalEndpoints: comparisons.length,
      fasterEndpoints: fasterCount,
      slowerEndpoints: comparisons.length - fasterCount,
      avgImprovementPercent: Math.round(avgImprovement * 100) / 100,
      avgExpressResponseTime: Math.round(avgExpressTime * 100) / 100,
      avgNestjsResponseTime: Math.round(avgNestjsTime * 100) / 100,
      overallFaster: avgImprovement > 0,
      recommendation: avgImprovement > 0 ? 'Express.js backend shows better performance' : 'NestJS backend shows better performance'
    };
  }

  /**
   * Save results to file
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-benchmark-${timestamp}.json`;
    const filepath = path.join(process.cwd(), 'logs', filename);
    
    try {
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
      console.log(`Results saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Failed to save results:', error.message);
      return null;
    }
  }

  /**
   * Print results to console
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('PERFORMANCE BENCHMARK RESULTS');
    console.log('='.repeat(60));
    
    if (this.results.summary.status === 'error') {
      console.log('❌ Benchmark failed:', this.results.summary.message);
      return;
    }
    
    const summary = this.results.summary;
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total endpoints tested: ${summary.totalEndpoints}`);
    console.log(`   Express.js faster: ${summary.fasterEndpoints}/${summary.totalEndpoints}`);
    console.log(`   Average improvement: ${summary.avgImprovementPercent}%`);
    console.log(`   Express.js avg response: ${summary.avgExpressResponseTime}ms`);
    console.log(`   NestJS avg response: ${summary.avgNestjsResponseTime}ms`);
    console.log(`   ${summary.overallFaster ? '✅' : '⚠️'} ${summary.recommendation}`);
    
    console.log(`\n📋 DETAILED RESULTS:`);
    
    for (const [endpoint, comparison] of Object.entries(this.results.comparison)) {
      if (comparison.status === 'error') {
        console.log(`   ${endpoint}: ❌ Error (Express: ${comparison.expressWorking ? '✅' : '❌'}, NestJS: ${comparison.nestjsWorking ? '✅' : '❌'})`);
      } else {
        const icon = comparison.isFaster ? '🚀' : '🐌';
        const sign = comparison.improvementPercent > 0 ? '+' : '';
        console.log(`   ${endpoint}: ${icon} ${comparison.expressAvgMs}ms vs ${comparison.nestjsAvgMs}ms (${sign}${comparison.improvementPercent}%)`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Run complete benchmark
   */
  async run() {
    try {
      console.log('🚀 Starting performance benchmark...');
      console.log(`Express.js API: ${this.expressBaseUrl}`);
      console.log(`NestJS API: ${this.nestjsBaseUrl}`);
      
      await this.benchmarkBlogEndpoints();
      this.comparePerformance();
      this.generateSummary();
      
      this.printResults();
      await this.saveResults();
      
      return this.results;
    } catch (error) {
      console.error('Benchmark failed:', error.message);
      throw error;
    }
  }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark();
  
  benchmark.run()
    .then(() => {
      console.log('\n✅ Benchmark completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Benchmark failed:', error.message);
      process.exit(1);
    });
}

export default PerformanceBenchmark;