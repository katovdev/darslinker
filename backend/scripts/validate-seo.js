#!/usr/bin/env node

/**
 * SEO Validation Script
 * Validates SEO features and structured data functionality
 */

import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';

class SEOValidator {
  constructor() {
    this.baseUrl = process.env.EXPRESS_API_URL || 'http://localhost:3000';
    this.results = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      issues: [],
      recommendations: []
    };
  }

  /**
   * Fetch HTML content from URL
   */
  async fetchHTML(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Validator/1.0)'
        },
        timeout: 10000
      });
      
      return {
        success: true,
        html: response.data,
        statusCode: response.status,
        headers: response.headers
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status || 0
      };
    }
  }

  /**
   * Parse HTML and extract SEO elements
   */
  parseHTML(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    return {
      title: document.querySelector('title')?.textContent || '',
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      metaKeywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '',
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '',
      structuredData: this.extractStructuredData(document),
      headings: this.extractHeadings(document),
      images: this.extractImages(document),
      links: this.extractLinks(document)
    };
  }

  /**
   * Extract structured data (JSON-LD)
   */
  extractStructuredData(document) {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const structuredData = [];
    
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        structuredData.push(data);
      } catch (error) {
        // Invalid JSON-LD
      }
    });
    
    return structuredData;
  }

  /**
   * Extract heading structure
   */
  extractHeadings(document) {
    const headings = [];
    const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    headingTags.forEach(tag => {
      const elements = document.querySelectorAll(tag);
      elements.forEach(element => {
        headings.push({
          tag,
          text: element.textContent.trim(),
          level: parseInt(tag.substring(1))
        });
      });
    });
    
    return headings.sort((a, b) => {
      const aIndex = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).indexOf(
        document.querySelector(`${a.tag}:contains("${a.text}")`)
      );
      const bIndex = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).indexOf(
        document.querySelector(`${b.tag}:contains("${b.text}")`)
      );
      return aIndex - bIndex;
    });
  }

  /**
   * Extract images and their alt attributes
   */
  extractImages(document) {
    const images = [];
    const imgElements = document.querySelectorAll('img');
    
    imgElements.forEach(img => {
      images.push({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || ''
      });
    });
    
    return images;
  }

  /**
   * Extract links
   */
  extractLinks(document) {
    const links = [];
    const linkElements = document.querySelectorAll('a[href]');
    
    linkElements.forEach(link => {
      links.push({
        href: link.getAttribute('href'),
        text: link.textContent.trim(),
        title: link.getAttribute('title') || '',
        rel: link.getAttribute('rel') || ''
      });
    });
    
    return links;
  }

  /**
   * Validate basic SEO elements
   */
  validateBasicSEO(seoData, url) {
    const test = {
      name: 'Basic SEO Elements',
      url,
      passed: true,
      issues: [],
      warnings: []
    };

    // Title validation
    if (!seoData.title) {
      test.passed = false;
      test.issues.push('Missing page title');
    } else if (seoData.title.length < 30) {
      test.warnings.push('Title is too short (< 30 characters)');
    } else if (seoData.title.length > 60) {
      test.warnings.push('Title is too long (> 60 characters)');
    }

    // Meta description validation
    if (!seoData.metaDescription) {
      test.passed = false;
      test.issues.push('Missing meta description');
    } else if (seoData.metaDescription.length < 120) {
      test.warnings.push('Meta description is too short (< 120 characters)');
    } else if (seoData.metaDescription.length > 160) {
      test.warnings.push('Meta description is too long (> 160 characters)');
    }

    // Canonical URL validation
    if (!seoData.canonical) {
      test.warnings.push('Missing canonical URL');
    }

    // Keywords validation
    if (!seoData.metaKeywords) {
      test.warnings.push('Missing meta keywords');
    }

    return test;
  }

  /**
   * Validate Open Graph tags
   */
  validateOpenGraph(seoData, url) {
    const test = {
      name: 'Open Graph Tags',
      url,
      passed: true,
      issues: [],
      warnings: []
    };

    const requiredOgTags = ['ogTitle', 'ogDescription', 'ogImage', 'ogUrl'];
    
    requiredOgTags.forEach(tag => {
      if (!seoData[tag]) {
        test.passed = false;
        test.issues.push(`Missing ${tag.replace('og', 'og:')}`);
      }
    });

    // Validate og:image URL
    if (seoData.ogImage && !seoData.ogImage.startsWith('http')) {
      test.warnings.push('og:image should be an absolute URL');
    }

    return test;
  }

  /**
   * Validate Twitter Card tags
   */
  validateTwitterCard(seoData, url) {
    const test = {
      name: 'Twitter Card Tags',
      url,
      passed: true,
      issues: [],
      warnings: []
    };

    if (!seoData.twitterCard) {
      test.passed = false;
      test.issues.push('Missing twitter:card');
    } else if (!['summary', 'summary_large_image', 'app', 'player'].includes(seoData.twitterCard)) {
      test.warnings.push('Invalid twitter:card type');
    }

    return test;
  }

  /**
   * Validate structured data
   */
  validateStructuredData(seoData, url) {
    const test = {
      name: 'Structured Data (JSON-LD)',
      url,
      passed: true,
      issues: [],
      warnings: []
    };

    if (seoData.structuredData.length === 0) {
      test.passed = false;
      test.issues.push('No structured data found');
      return test;
    }

    seoData.structuredData.forEach((data, index) => {
      // Validate basic schema.org structure
      if (!data['@context']) {
        test.issues.push(`Structured data ${index + 1}: Missing @context`);
        test.passed = false;
      }

      if (!data['@type']) {
        test.issues.push(`Structured data ${index + 1}: Missing @type`);
        test.passed = false;
      }

      // Validate Article schema if present
      if (data['@type'] === 'Article') {
        const requiredFields = ['headline', 'author', 'datePublished', 'publisher'];
        requiredFields.forEach(field => {
          if (!data[field]) {
            test.warnings.push(`Article schema missing recommended field: ${field}`);
          }
        });
      }
    });

    return test;
  }

  /**
   * Validate heading structure
   */
  validateHeadingStructure(seoData, url) {
    const test = {
      name: 'Heading Structure',
      url,
      passed: true,
      issues: [],
      warnings: []
    };

    const headings = seoData.headings;
    
    // Check for H1
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      test.passed = false;
      test.issues.push('No H1 heading found');
    } else if (h1Count > 1) {
      test.warnings.push('Multiple H1 headings found');
    }

    // Check heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];
      
      if (current.level > previous.level + 1) {
        test.warnings.push(`Heading hierarchy skip: ${previous.tag} to ${current.tag}`);
      }
    }

    return test;
  }

  /**
   * Validate images
   */
  validateImages(seoData, url) {
    const test = {
      name: 'Image Optimization',
      url,
      passed: true,
      issues: [],
      warnings: []
    };

    const images = seoData.images;
    const imagesWithoutAlt = images.filter(img => !img.alt);
    
    if (imagesWithoutAlt.length > 0) {
      test.warnings.push(`${imagesWithoutAlt.length} images missing alt attributes`);
    }

    // Check for decorative images
    const decorativeImages = images.filter(img => img.alt === '');
    if (decorativeImages.length > 0) {
      test.warnings.push(`${decorativeImages.length} images with empty alt (decorative)`);
    }

    return test;
  }

  /**
   * Test sitemap accessibility
   */
  async validateSitemap() {
    const test = {
      name: 'Sitemap Validation',
      url: `${this.baseUrl}/api/blogs/sitemap.xml`,
      passed: true,
      issues: [],
      warnings: []
    };

    try {
      const response = await axios.get(test.url, {
        headers: {
          'Accept': 'application/xml,text/xml'
        },
        timeout: 10000
      });

      if (response.status !== 200) {
        test.passed = false;
        test.issues.push(`Sitemap returned status ${response.status}`);
        return test;
      }

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('xml')) {
        test.warnings.push('Sitemap content-type is not XML');
      }

      // Basic XML validation
      if (!response.data.includes('<?xml') || !response.data.includes('<urlset')) {
        test.passed = false;
        test.issues.push('Invalid sitemap XML structure');
      }

      // Check for URLs
      const urlCount = (response.data.match(/<url>/g) || []).length;
      if (urlCount === 0) {
        test.warnings.push('Sitemap contains no URLs');
      } else {
        test.warnings.push(`Sitemap contains ${urlCount} URLs`);
      }

    } catch (error) {
      test.passed = false;
      test.issues.push(`Sitemap request failed: ${error.message}`);
    }

    return test;
  }

  /**
   * Get sample blog ID for testing
   */
  async getSampleBlogId() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/blogs?limit=1`);
      if (response.data.success && response.data.data.length > 0) {
        return response.data.data[0].id || response.data.data[0]._id;
      }
    } catch (error) {
      console.warn('Could not fetch sample blog ID:', error.message);
    }
    return null;
  }

  /**
   * Run all SEO validation tests
   */
  async runValidation() {
    console.log('🔍 Starting SEO validation...');
    
    const testUrls = [
      `${this.baseUrl}/`,
      `${this.baseUrl}/blog`
    ];

    // Add sample blog post URL if available
    const sampleBlogId = await this.getSampleBlogId();
    if (sampleBlogId) {
      testUrls.push(`${this.baseUrl}/api/blogs/${sampleBlogId}`);
    }

    // Test each URL
    for (const url of testUrls) {
      console.log(`Testing: ${url}`);
      
      const htmlResult = await this.fetchHTML(url);
      if (!htmlResult.success) {
        this.results.tests[url] = {
          error: htmlResult.error,
          statusCode: htmlResult.statusCode
        };
        continue;
      }

      const seoData = this.parseHTML(htmlResult.html);
      
      const tests = [
        this.validateBasicSEO(seoData, url),
        this.validateOpenGraph(seoData, url),
        this.validateTwitterCard(seoData, url),
        this.validateStructuredData(seoData, url),
        this.validateHeadingStructure(seoData, url),
        this.validateImages(seoData, url)
      ];

      this.results.tests[url] = {
        seoData,
        tests,
        summary: {
          total: tests.length,
          passed: tests.filter(t => t.passed).length,
          failed: tests.filter(t => !t.passed).length
        }
      };
    }

    // Test sitemap
    const sitemapTest = await this.validateSitemap();
    this.results.tests['sitemap'] = sitemapTest;

    // Generate overall summary
    this.generateSummary();
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let totalWarnings = 0;

    for (const [url, result] of Object.entries(this.results.tests)) {
      if (result.error) {
        failedTests++;
        totalTests++;
        this.results.issues.push(`${url}: ${result.error}`);
        continue;
      }

      if (result.tests) {
        totalTests += result.tests.length;
        passedTests += result.tests.filter(t => t.passed).length;
        failedTests += result.tests.filter(t => !t.passed).length;

        result.tests.forEach(test => {
          totalWarnings += test.warnings.length;
          
          test.issues.forEach(issue => {
            this.results.issues.push(`${url} - ${test.name}: ${issue}`);
          });
        });
      } else if (result.passed !== undefined) {
        // Single test (like sitemap)
        totalTests++;
        if (result.passed) {
          passedTests++;
        } else {
          failedTests++;
        }
        totalWarnings += result.warnings?.length || 0;
        
        result.issues?.forEach(issue => {
          this.results.issues.push(`${result.name}: ${issue}`);
        });
      }
    }

    this.results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      warnings: totalWarnings,
      score: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };

    // Generate recommendations
    this.generateRecommendations();
  }

  /**
   * Generate SEO recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.results.summary.failed > 0) {
      recommendations.push('Fix critical SEO issues identified in the validation');
    }

    if (this.results.summary.warnings > 5) {
      recommendations.push('Address SEO warnings to improve search engine optimization');
    }

    if (this.results.summary.score < 80) {
      recommendations.push('SEO score is below 80%, consider implementing additional optimizations');
    }

    // Check for common issues
    const hasStructuredDataIssues = this.results.issues.some(issue => 
      issue.includes('structured data') || issue.includes('JSON-LD')
    );
    
    if (hasStructuredDataIssues) {
      recommendations.push('Implement proper structured data markup for better search visibility');
    }

    const hasSocialMediaIssues = this.results.issues.some(issue => 
      issue.includes('Open Graph') || issue.includes('Twitter')
    );
    
    if (hasSocialMediaIssues) {
      recommendations.push('Add complete social media meta tags for better sharing experience');
    }

    this.results.recommendations = recommendations;
  }

  /**
   * Save validation results
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `seo-validation-${timestamp}.json`;
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
   * Print validation results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('SEO VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    const summary = this.results.summary;
    const scoreColor = summary.score >= 80 ? '🟢' : summary.score >= 60 ? '🟡' : '🔴';
    
    console.log(`\n📊 OVERALL SCORE: ${scoreColor} ${summary.score}/100`);
    console.log(`   Total tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed} ✅`);
    console.log(`   Failed: ${summary.failed} ❌`);
    console.log(`   Warnings: ${summary.warnings} ⚠️`);

    if (this.results.issues.length > 0) {
      console.log(`\n❌ CRITICAL ISSUES:`);
      this.results.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }

    if (this.results.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      this.results.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Run complete SEO validation
   */
  async run() {
    try {
      console.log('🚀 Starting SEO validation...');
      console.log(`Base URL: ${this.baseUrl}`);
      
      await this.runValidation();
      this.printResults();
      await this.saveResults();
      
      return this.results;
    } catch (error) {
      console.error('SEO validation failed:', error.message);
      throw error;
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new SEOValidator();
  
  validator.run()
    .then((results) => {
      console.log('\n✅ SEO validation completed');
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('\n❌ SEO validation failed:', error.message);
      process.exit(1);
    });
}

export default SEOValidator;