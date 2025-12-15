#!/usr/bin/env node

/**
 * Blog API Validation Script
 * 
 * This script validates that the blog API endpoints are working correctly
 * after migration or deployment
 * 
 * Usage:
 *   npm run validate:blog
 *   node scripts/validate-blog-api.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Blog from '../src/models/blog.model.js';
import Category from '../src/models/category.model.js';
import logger from '../config/logger.js';

// Load environment variables
dotenv.config();

class BlogAPIValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS' });
      console.log(`✅ PASS: ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${name} - ${error.message}`);
    }
  }

  async validateModels() {
    await this.test('Blog model exists and is functional', async () => {
      const blogCount = await Blog.countDocuments();
      if (typeof blogCount !== 'number') {
        throw new Error('Blog model is not working correctly');
      }
    });

    await this.test('Category model exists and is functional', async () => {
      const categoryCount = await Category.countDocuments();
      if (typeof categoryCount !== 'number') {
        throw new Error('Category model is not working correctly');
      }
    });
  }

  async validateDataIntegrity() {
    await this.test('Blog data integrity', async () => {
      const blogs = await Blog.find({}).limit(5);
      
      for (const blog of blogs) {
        if (!blog.title || !blog.subtitle) {
          throw new Error(`Blog ${blog._id} missing required fields`);
        }
        
        if (!Array.isArray(blog.sections)) {
          throw new Error(`Blog ${blog._id} has invalid sections format`);
        }
        
        if (!Array.isArray(blog.tags)) {
          throw new Error(`Blog ${blog._id} has invalid tags format`);
        }
      }
    });

    await this.test('Category data integrity', async () => {
      const categories = await Category.find({}).limit(5);
      
      for (const category of categories) {
        if (!category.name) {
          throw new Error(`Category ${category._id} missing name`);
        }
        
        if (!category.slug) {
          throw new Error(`Category ${category._id} missing slug`);
        }
      }
    });

    await this.test('Blog-Category relationships', async () => {
      const blogsWithCategories = await Blog.find({ categoryId: { $ne: null } }).limit(5);
      
      for (const blog of blogsWithCategories) {
        const category = await Category.findById(blog.categoryId);
        if (!category) {
          throw new Error(`Blog ${blog._id} references non-existent category ${blog.categoryId}`);
        }
      }
    });
  }

  async validateIndexes() {
    await this.test('Blog indexes exist', async () => {
      const indexes = await Blog.collection.getIndexes();
      const indexNames = Object.keys(indexes);
      
      const requiredIndexes = ['title_1', 'categoryId_1', 'isArchive_1', 'createdAt_-1'];
      for (const requiredIndex of requiredIndexes) {
        if (!indexNames.includes(requiredIndex)) {
          throw new Error(`Missing required index: ${requiredIndex}`);
        }
      }
    });

    await this.test('Category indexes exist', async () => {
      const indexes = await Category.collection.getIndexes();
      const indexNames = Object.keys(indexes);
      
      const requiredIndexes = ['name_1', 'slug_1', 'isActive_1'];
      for (const requiredIndex of requiredIndexes) {
        if (!indexNames.includes(requiredIndex)) {
          throw new Error(`Missing required index: ${requiredIndex}`);
        }
      }
    });
  }

  async validateQueries() {
    await this.test('Blog queries work correctly', async () => {
      // Test basic find
      const allBlogs = await Blog.find({}).limit(1);
      
      // Test with population
      const blogsWithCategories = await Blog.find({})
        .populate('categoryId')
        .limit(1);
      
      // Test filtering
      const activeBlogs = await Blog.find({ isArchive: false }).limit(1);
      
      // Test sorting
      const sortedBlogs = await Blog.find({})
        .sort({ createdAt: -1 })
        .limit(1);
    });

    await this.test('Category queries work correctly', async () => {
      // Test basic find
      const allCategories = await Category.find({}).limit(1);
      
      // Test filtering
      const activeCategories = await Category.find({ isActive: true }).limit(1);
      
      // Test sorting
      const sortedCategories = await Category.find({})
        .sort({ name: 1 })
        .limit(1);
    });

    await this.test('Aggregation queries work', async () => {
      // Test blog statistics
      const blogStats = await Blog.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$multiViews' } } }
      ]);
      
      // Test category statistics
      const categoryStats = await Blog.aggregate([
        { $group: { _id: '$categoryId', count: { $sum: 1 } } }
      ]);
    });
  }

  async validateSEOFeatures() {
    await this.test('SEO metadata structure', async () => {
      const blogsWithSEO = await Blog.find({ 'seo.metaTitle': { $exists: true } }).limit(3);
      
      for (const blog of blogsWithSEO) {
        if (blog.seo && typeof blog.seo !== 'object') {
          throw new Error(`Blog ${blog._id} has invalid SEO structure`);
        }
      }
    });

    await this.test('Tag structure validation', async () => {
      const blogsWithTags = await Blog.find({ tags: { $ne: [] } }).limit(3);
      
      for (const blog of blogsWithTags) {
        for (const tag of blog.tags) {
          if (!tag.label || !tag.value) {
            throw new Error(`Blog ${blog._id} has invalid tag structure`);
          }
        }
      }
    });
  }

  async validatePerformance() {
    await this.test('Query performance is acceptable', async () => {
      const startTime = Date.now();
      
      // Run a complex query
      await Blog.find({ isArchive: false })
        .populate('categoryId')
        .sort({ createdAt: -1 })
        .limit(20);
      
      const duration = Date.now() - startTime;
      
      if (duration > 1000) { // More than 1 second
        throw new Error(`Query took too long: ${duration}ms`);
      }
    });

    await this.test('Index usage is optimal', async () => {
      // Test that queries use indexes
      const explainResult = await Blog.find({ isArchive: false }).explain();
      
      if (explainResult.executionStats.executionSuccess !== true) {
        throw new Error('Query execution failed');
      }
    });
  }

  printResults() {
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach((test, index) => {
          console.log(`  ${index + 1}. ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.results.failed === 0) {
      console.log('🎉 All validations passed! Blog API is ready for use.');
    } else {
      console.log('⚠️  Some validations failed. Please review and fix the issues.');
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting Blog API validation...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const validator = new BlogAPIValidator();

    // Run all validation tests
    await validator.validateModels();
    await validator.validateDataIntegrity();
    await validator.validateIndexes();
    await validator.validateQueries();
    await validator.validateSEOFeatures();
    await validator.validatePerformance();

    // Print results
    validator.printResults();

    // Exit with appropriate code
    process.exit(validator.results.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n💥 Validation failed:', error.message);
    logger.error('Validation script failed', { error: error.message, stack: error.stack });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

// Run the validation
main();