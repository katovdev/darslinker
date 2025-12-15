#!/usr/bin/env node

/**
 * End-to-End System Test
 * Comprehensive testing of the complete blog integration system
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class E2ESystemTest {
  constructor() {
    this.baseUrl = process.env.EXPRESS_API_URL || 'http://localhost:3000';
    this.apiUrl = `${this.baseUrl}/api`;
    this.adminToken = process.env.ADMIN_TOKEN || null;
    this.results = {
      timestamp: new Date().toISOString(),
      testSuites: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      errors: [],
      performance: {}
    };
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(method, endpoint, data = null, options = {}) {
    const config = {
      method,
      url: `${this.apiUrl}${endpoint}`,
      timeout: 10000,
      ...options
    };

    if (data) {
      config.data = data;
    }

    if (this.adminToken) {
      config.headers = {
        'Authorization': `Bearer ${this.adminToken}`,
        ...config.headers
      };
    }

    try {
      const startTime = Date.now();
      const response = await axios(config);
      const endTime = Date.now();
      
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
        responseTime: endTime - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status || 0,
        data: error.response?.data || null
      };
    }
  }

  /**
   * Test blog API endpoints
   */
  async testBlogAPI() {
    const suite = {
      name: 'Blog API Tests',
      tests: [],
      passed: 0,
      failed: 0
    };

    // Test 1: Get all blogs
    const getAllTest = await this.runTest('Get All Blogs', async () => {
      const result = await this.apiRequest('GET', '/blogs');
      
      if (!result.success) {
        throw new Error(`API request failed: ${result.error}`);
      }

      if (!result.data.success) {
        throw new Error('API response indicates failure');
      }

      if (!Array.isArray(result.data.data)) {
        throw new Error('Response data is not an array');
      }

      return {
        blogCount: result.data.data.length,
        responseTime: result.responseTime
      };
    });
    suite.tests.push(getAllTest);

    // Test 2: Get featured blogs
    const getFeaturedTest = await this.runTest('Get Featured Blogs', async () => {
      const result = await this.apiRequest('GET', '/blogs/featured?limit=6');
      
      if (!result.success) {
        throw new Error(`API request failed: ${result.error}`);
      }

      if (!result.data.success) {
        throw new Error('API response indicates failure');
      }

      const blogs = result.data.data;
      if (!Array.isArray(blogs)) {
        throw new Error('Featured blogs data is not an array');
      }

      if (blogs.length > 6) {
        throw new Error('Featured blogs exceeded limit');
      }

      return {
        featuredCount: blogs.length,
        responseTime: result.responseTime
      };
    });
    suite.tests.push(getFeaturedTest);

    // Test 3: Get categories
    const getCategoriesTest = await this.runTest('Get Categories', async () => {
      const result = await this.apiRequest('GET', '/categories');
      
      if (!result.success) {
        throw new Error(`API request failed: ${result.error}`);
      }

      if (!result.data.success) {
        throw new Error('API response indicates failure');
      }

      return {
        categoryCount: result.data.data.length,
        responseTime: result.responseTime
      };
    });
    suite.tests.push(getCategoriesTest);

    // Test 4: Get sitemap
    const getSitemapTest = await this.runTest('Get Sitemap', async () => {
      const result = await this.apiRequest('GET', '/blogs/sitemap.xml');
      
      if (!result.success) {
        throw new Error(`Sitemap request failed: ${result.error}`);
      }

      if (result.status !== 200) {
        throw new Error(`Sitemap returned status ${result.status}`);
      }

      const contentType = result.headers['content-type'];
      if (!contentType || !contentType.includes('xml')) {
        throw new Error('Sitemap content-type is not XML');
      }

      return {
        responseTime: result.responseTime,
        contentType
      };
    });
    suite.tests.push(getSitemapTest);

    // Test 5: Create and manage blog (if admin token available)
    if (this.adminToken) {
      const blogCRUDTest = await this.runTest('Blog CRUD Operations', async () => {
        // Create blog
        const createData = {
          header: {
            title: 'E2E Test Blog',
            subtitle: 'Test blog created by E2E system test'
          },
          sections: [
            {
              header: 'Test Section',
              content: 'This is a test section content'
            }
          ],
          tags: [
            { label: 'Test', value: 'test' }
          ],
          seo: {
            metaTitle: 'E2E Test Blog - Test',
            metaDescription: 'Test blog for E2E system testing'
          }
        };

        const createResult = await this.apiRequest('POST', '/blogs', createData);
        if (!createResult.success) {
          throw new Error(`Blog creation failed: ${createResult.error}`);
        }

        const blogId = createResult.data.blog.id || createResult.data.blog._id;

        // Read blog
        const readResult = await this.apiRequest('GET', `/blogs/${blogId}`);
        if (!readResult.success) {
          throw new Error(`Blog read failed: ${readResult.error}`);
        }

        // Update blog
        const updateData = {
          header: {
            title: 'E2E Test Blog Updated',
            subtitle: 'Updated test blog'
          }
        };

        const updateResult = await this.apiRequest('PUT', `/blogs/${blogId}`, updateData);
        if (!updateResult.success) {
          throw new Error(`Blog update failed: ${updateResult.error}`);
        }

        // Delete blog
        const deleteResult = await this.apiRequest('DELETE', `/blogs/${blogId}`);
        if (!deleteResult.success) {
          throw new Error(`Blog deletion failed: ${deleteResult.error}`);
        }

        return {
          blogId,
          operations: ['create', 'read', 'update', 'delete']
        };
      });
      suite.tests.push(blogCRUDTest);
    } else {
      suite.tests.push({
        name: 'Blog CRUD Operations',
        status: 'skipped',
        reason: 'No admin token provided'
      });
    }

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;

    return suite;
  }

  /**
   * Test frontend integration
   */
  async testFrontendIntegration() {
    const suite = {
      name: 'Frontend Integration Tests',
      tests: [],
      passed: 0,
      failed: 0
    };

    // Test 1: Landing page loads
    const landingPageTest = await this.runTest('Landing Page Load', async () => {
      const result = await this.apiRequest('GET', '', null, {
        baseURL: this.baseUrl,
        headers: {
          'Accept': 'text/html'
        }
      });

      if (!result.success) {
        throw new Error(`Landing page request failed: ${result.error}`);
      }

      if (result.status !== 200) {
        throw new Error(`Landing page returned status ${result.status}`);
      }

      return {
        responseTime: result.responseTime,
        contentLength: result.data?.length || 0
      };
    });
    suite.tests.push(landingPageTest);

    // Test 2: Blog page loads
    const blogPageTest = await this.runTest('Blog Page Load', async () => {
      const result = await this.apiRequest('GET', '/blog', null, {
        baseURL: this.baseUrl,
        headers: {
          'Accept': 'text/html'
        }
      });

      if (!result.success) {
        throw new Error(`Blog page request failed: ${result.error}`);
      }

      if (result.status !== 200) {
        throw new Error(`Blog page returned status ${result.status}`);
      }

      return {
        responseTime: result.responseTime,
        contentLength: result.data?.length || 0
      };
    });
    suite.tests.push(blogPageTest);

    // Test 3: API client functionality
    const apiClientTest = await this.runTest('API Client Integration', async () => {
      // Test if the frontend can successfully call the blog API
      const result = await this.apiRequest('GET', '/blogs/featured?limit=3');
      
      if (!result.success) {
        throw new Error(`API client test failed: ${result.error}`);
      }

      const blogs = result.data.data;
      if (!Array.isArray(blogs)) {
        throw new Error('API client returned invalid data structure');
      }

      // Verify blog structure matches frontend expectations
      if (blogs.length > 0) {
        const blog = blogs[0];
        const requiredFields = ['title', 'subtitle'];
        
        for (const field of requiredFields) {
          if (!blog[field]) {
            throw new Error(`Blog missing required field: ${field}`);
          }
        }
      }

      return {
        blogCount: blogs.length,
        responseTime: result.responseTime
      };
    });
    suite.tests.push(apiClientTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;

    return suite;
  }

  /**
   * Test data integrity
   */
  async testDataIntegrity() {
    const suite = {
      name: 'Data Integrity Tests',
      tests: [],
      passed: 0,
      failed: 0
    };

    // Test 1: Blog-Category relationships
    const relationshipTest = await this.runTest('Blog-Category Relationships', async () => {
      const blogsResult = await this.apiRequest('GET', '/blogs');
      const categoriesResult = await this.apiRequest('GET', '/categories');

      if (!blogsResult.success || !categoriesResult.success) {
        throw new Error('Failed to fetch blogs or categories');
      }

      const blogs = blogsResult.data.data;
      const categories = categoriesResult.data.data;
      const categoryIds = categories.map(c => c.id || c._id);

      let invalidRelationships = 0;
      let validRelationships = 0;

      for (const blog of blogs) {
        if (blog.categoryId) {
          if (categoryIds.includes(blog.categoryId)) {
            validRelationships++;
          } else {
            invalidRelationships++;
          }
        }
      }

      if (invalidRelationships > 0) {
        throw new Error(`Found ${invalidRelationships} blogs with invalid category references`);
      }

      return {
        totalBlogs: blogs.length,
        blogsWithCategories: validRelationships,
        blogsWithoutCategories: blogs.length - validRelationships
      };
    });
    suite.tests.push(relationshipTest);

    // Test 2: SEO data completeness
    const seoDataTest = await this.runTest('SEO Data Completeness', async () => {
      const result = await this.apiRequest('GET', '/blogs?limit=10');
      
      if (!result.success) {
        throw new Error('Failed to fetch blogs for SEO test');
      }

      const blogs = result.data.data;
      let blogsWithSEO = 0;
      let blogsWithoutSEO = 0;

      for (const blog of blogs) {
        if (blog.seo && (blog.seo.metaTitle || blog.seo.metaDescription)) {
          blogsWithSEO++;
        } else {
          blogsWithoutSEO++;
        }
      }

      return {
        totalBlogs: blogs.length,
        blogsWithSEO,
        blogsWithoutSEO,
        seoCompleteness: Math.round((blogsWithSEO / blogs.length) * 100)
      };
    });
    suite.tests.push(seoDataTest);

    // Test 3: View tracking functionality
    const viewTrackingTest = await this.runTest('View Tracking Functionality', async () => {
      const blogsResult = await this.apiRequest('GET', '/blogs?limit=1');
      
      if (!blogsResult.success || blogsResult.data.data.length === 0) {
        throw new Error('No blogs available for view tracking test');
      }

      const blog = blogsResult.data.data[0];
      const blogId = blog.id || blog._id;
      const initialViews = blog.multiViews || 0;

      // Track a view
      const trackResult = await this.apiRequest('POST', `/blogs/${blogId}/view`);
      
      if (!trackResult.success) {
        throw new Error(`View tracking failed: ${trackResult.error}`);
      }

      // Verify view was tracked
      const updatedBlogResult = await this.apiRequest('GET', `/blogs/${blogId}`);
      
      if (!updatedBlogResult.success) {
        throw new Error('Failed to fetch updated blog');
      }

      const updatedBlog = updatedBlogResult.data.blog;
      const newViews = updatedBlog.multiViews || 0;

      if (newViews <= initialViews) {
        throw new Error('View count did not increase');
      }

      return {
        blogId,
        initialViews,
        newViews,
        viewsIncreased: newViews - initialViews
      };
    });
    suite.tests.push(viewTrackingTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;

    return suite;
  }

  /**
   * Test performance requirements
   */
  async testPerformance() {
    const suite = {
      name: 'Performance Tests',
      tests: [],
      passed: 0,
      failed: 0
    };

    // Test 1: API response times
    const responseTimeTest = await this.runTest('API Response Times', async () => {
      const endpoints = [
        '/blogs',
        '/blogs/featured',
        '/categories',
        '/blogs/sitemap.xml'
      ];

      const results = {};
      
      for (const endpoint of endpoints) {
        const result = await this.apiRequest('GET', endpoint);
        
        if (!result.success) {
          throw new Error(`${endpoint} request failed: ${result.error}`);
        }

        results[endpoint] = result.responseTime;

        // Check if response time is acceptable (< 2 seconds)
        if (result.responseTime > 2000) {
          throw new Error(`${endpoint} response time too slow: ${result.responseTime}ms`);
        }
      }

      const avgResponseTime = Object.values(results).reduce((a, b) => a + b, 0) / Object.values(results).length;

      return {
        endpoints: results,
        averageResponseTime: Math.round(avgResponseTime),
        maxResponseTime: Math.max(...Object.values(results))
      };
    });
    suite.tests.push(responseTimeTest);

    // Test 2: Concurrent request handling
    const concurrencyTest = await this.runTest('Concurrent Request Handling', async () => {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(this.apiRequest('GET', '/blogs/featured'));
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      const successfulRequests = results.filter(r => r.success).length;
      const failedRequests = results.length - successfulRequests;

      if (failedRequests > 0) {
        throw new Error(`${failedRequests}/${concurrentRequests} concurrent requests failed`);
      }

      return {
        concurrentRequests,
        successfulRequests,
        totalTime: endTime - startTime,
        avgTimePerRequest: (endTime - startTime) / concurrentRequests
      };
    });
    suite.tests.push(concurrencyTest);

    suite.passed = suite.tests.filter(t => t.status === 'passed').length;
    suite.failed = suite.tests.filter(t => t.status === 'failed').length;

    return suite;
  }

  /**
   * Run a single test
   */
  async runTest(name, testFn) {
    console.log(`  Running: ${name}`);
    
    try {
      const result = await testFn();
      console.log(`  ✅ ${name}`);
      
      return {
        name,
        status: 'passed',
        result
      };
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message}`);
      
      return {
        name,
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Generate test summary
   */
  generateSummary() {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const suite of Object.values(this.results.testSuites)) {
      for (const test of suite.tests) {
        total++;
        
        switch (test.status) {
          case 'passed':
            passed++;
            break;
          case 'failed':
            failed++;
            this.results.errors.push(`${suite.name} - ${test.name}: ${test.error}`);
            break;
          case 'skipped':
            skipped++;
            break;
        }
      }
    }

    this.results.summary = {
      total,
      passed,
      failed,
      skipped,
      successRate: total > 0 ? Math.round((passed / total) * 100) : 0
    };
  }

  /**
   * Save test results
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `e2e-test-results-${timestamp}.json`;
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
   * Print test results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('END-TO-END SYSTEM TEST RESULTS');
    console.log('='.repeat(60));
    
    const summary = this.results.summary;
    const statusIcon = summary.successRate >= 90 ? '🟢' : summary.successRate >= 70 ? '🟡' : '🔴';
    
    console.log(`\n📊 OVERALL RESULTS: ${statusIcon} ${summary.successRate}% Success Rate`);
    console.log(`   Total tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed} ✅`);
    console.log(`   Failed: ${summary.failed} ❌`);
    console.log(`   Skipped: ${summary.skipped} ⏭️`);

    // Print suite summaries
    console.log(`\n📋 TEST SUITE RESULTS:`);
    for (const [suiteName, suite] of Object.entries(this.results.testSuites)) {
      const suiteTotal = suite.tests.length;
      const suiteRate = suiteTotal > 0 ? Math.round((suite.passed / suiteTotal) * 100) : 0;
      const suiteIcon = suiteRate >= 90 ? '🟢' : suiteRate >= 70 ? '🟡' : '🔴';
      
      console.log(`   ${suiteIcon} ${suiteName}: ${suite.passed}/${suiteTotal} (${suiteRate}%)`);
    }

    if (this.results.errors.length > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Run complete E2E test suite
   */
  async run() {
    try {
      console.log('🚀 Starting End-to-End System Tests...');
      console.log(`Base URL: ${this.baseUrl}`);
      console.log(`Admin Token: ${this.adminToken ? 'Provided' : 'Not provided'}`);
      
      // Run test suites
      console.log('\n🧪 Running Blog API Tests...');
      this.results.testSuites.blogAPI = await this.testBlogAPI();
      
      console.log('\n🌐 Running Frontend Integration Tests...');
      this.results.testSuites.frontendIntegration = await this.testFrontendIntegration();
      
      console.log('\n🔍 Running Data Integrity Tests...');
      this.results.testSuites.dataIntegrity = await this.testDataIntegrity();
      
      console.log('\n⚡ Running Performance Tests...');
      this.results.testSuites.performance = await this.testPerformance();
      
      // Generate summary and save results
      this.generateSummary();
      this.printResults();
      await this.saveResults();
      
      return this.results;
    } catch (error) {
      console.error('E2E test suite failed:', error.message);
      throw error;
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new E2ESystemTest();
  
  tester.run()
    .then((results) => {
      console.log('\n✅ E2E tests completed');
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('\n❌ E2E tests failed:', error.message);
      process.exit(1);
    });
}

export default E2ESystemTest;