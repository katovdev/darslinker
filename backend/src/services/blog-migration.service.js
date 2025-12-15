import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import Blog from '../models/blog.model.js';
import Category from '../models/category.model.js';
import logger from '../../config/logger.js';

/**
 * Blog Migration Service
 * Handles migration of blog data from NestJS MongoDB to Express.js MongoDB
 */
class BlogMigrationService {
  constructor() {
    this.sourceConnectionString = process.env.BLOG_SOURCE_DB_URI;
    this.targetConnectionString = process.env.MONGODB_URI;
    this.backupDir = path.join(process.cwd(), 'migration-backups');
    this.sourceConnection = null;
    this.migrationReport = {
      startTime: null,
      endTime: null,
      categoriesMigrated: 0,
      blogsMigrated: 0,
      errors: [],
      warnings: [],
      success: false
    };
  }

  /**
   * Initialize migration service
   */
  async initialize() {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Validate environment variables
      if (!this.sourceConnectionString) {
        throw new Error('BLOG_SOURCE_DB_URI environment variable is required');
      }
      
      if (!this.targetConnectionString) {
        throw new Error('MONGODB_URI environment variable is required');
      }

      logger.info('Blog migration service initialized', {
        backupDir: this.backupDir,
        sourceDb: this.sourceConnectionString.replace(/\/\/.*@/, '//***@'), // Hide credentials
        targetDb: this.targetConnectionString.replace(/\/\/.*@/, '//***@')
      });

      return true;
    } catch (error) {
      logger.error('Failed to initialize migration service', { error: error.message });
      throw error;
    }
  }

  /**
   * Connect to source database
   */
  async connectToSource() {
    try {
      this.sourceConnection = await mongoose.createConnection(this.sourceConnectionString);
      
      // Define source schemas (NestJS structure)
      const sourceCategorySchema = new mongoose.Schema({
        name: String,
        description: String,
        slug: String,
        isActive: { type: Boolean, default: true }
      }, { timestamps: true });

      const sourceBlogSchema = new mongoose.Schema({
        title: String,
        subtitle: String,
        sections: Array,
        tags: [{
          label: String,
          value: String
        }],
        seo: {
          metaTitle: String,
          metaDescription: String,
          keywords: [String],
          canonicalUrl: String
        },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        multiViews: { type: Number, default: 0 },
        uniqueViews: { type: [String], default: [] },
        isArchive: { type: Boolean, default: false }
      }, { timestamps: true });

      this.sourceModels = {
        Category: this.sourceConnection.model('Category', sourceCategorySchema),
        Blog: this.sourceConnection.model('Blog', sourceBlogSchema)
      };

      logger.info('Connected to source database successfully');
      return true;
    } catch (error) {
      logger.error('Failed to connect to source database', { error: error.message });
      throw error;
    }
  }

  /**
   * Create backup of existing target data
   */
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`);

      // Get existing data from target database
      const existingCategories = await Category.find({}).lean();
      const existingBlogs = await Blog.find({}).lean();

      const backupData = {
        timestamp: new Date().toISOString(),
        categories: existingCategories,
        blogs: existingBlogs,
        counts: {
          categories: existingCategories.length,
          blogs: existingBlogs.length
        }
      };

      await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));

      logger.info('Backup created successfully', {
        file: backupFile,
        categoriesBackedUp: existingCategories.length,
        blogsBackedUp: existingBlogs.length
      });

      return {
        file: backupFile,
        data: backupData
      };
    } catch (error) {
      logger.error('Failed to create backup', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate backup integrity
   */
  async validateBackup(backupFile) {
    try {
      const backupContent = await fs.readFile(backupFile, 'utf8');
      const backupData = JSON.parse(backupContent);

      // Validate backup structure
      if (!backupData.timestamp || !backupData.categories || !backupData.blogs) {
        throw new Error('Invalid backup file structure');
      }

      // Validate data integrity
      const categoriesValid = Array.isArray(backupData.categories);
      const blogsValid = Array.isArray(backupData.blogs);

      if (!categoriesValid || !blogsValid) {
        throw new Error('Backup data is corrupted');
      }

      // Check if counts match
      const actualCategoriesCount = backupData.categories.length;
      const actualBlogsCount = backupData.blogs.length;
      const expectedCategoriesCount = backupData.counts?.categories || 0;
      const expectedBlogsCount = backupData.counts?.blogs || 0;

      if (actualCategoriesCount !== expectedCategoriesCount || actualBlogsCount !== expectedBlogsCount) {
        this.migrationReport.warnings.push('Backup counts do not match actual data');
      }

      logger.info('Backup validation successful', {
        file: backupFile,
        categories: actualCategoriesCount,
        blogs: actualBlogsCount
      });

      return true;
    } catch (error) {
      logger.error('Backup validation failed', { error: error.message, file: backupFile });
      throw error;
    }
  }

  /**
   * Migrate categories from source to target
   */
  async migrateCategories() {
    try {
      const sourceCategories = await this.sourceModels.Category.find({}).lean();
      
      logger.info(`Starting category migration: ${sourceCategories.length} categories found`);

      const migratedCategories = [];
      const categoryIdMapping = new Map();

      for (const sourceCategory of sourceCategories) {
        try {
          // Check if category already exists by name
          const existingCategory = await Category.findOne({ 
            name: sourceCategory.name,
            isActive: true 
          });

          let targetCategory;

          if (existingCategory) {
            // Update existing category
            targetCategory = await Category.findByIdAndUpdate(
              existingCategory._id,
              {
                description: sourceCategory.description || existingCategory.description,
                slug: sourceCategory.slug || existingCategory.slug,
                isActive: sourceCategory.isActive !== undefined ? sourceCategory.isActive : existingCategory.isActive
              },
              { new: true, runValidators: true }
            );

            logger.info('Updated existing category', {
              sourceId: sourceCategory._id,
              targetId: targetCategory._id,
              name: targetCategory.name
            });
          } else {
            // Create new category
            const categoryData = {
              name: sourceCategory.name,
              description: sourceCategory.description || '',
              slug: sourceCategory.slug,
              isActive: sourceCategory.isActive !== undefined ? sourceCategory.isActive : true
            };

            targetCategory = await Category.create(categoryData);

            logger.info('Created new category', {
              sourceId: sourceCategory._id,
              targetId: targetCategory._id,
              name: targetCategory.name
            });
          }

          // Map source ID to target ID for blog migration
          categoryIdMapping.set(sourceCategory._id.toString(), targetCategory._id.toString());
          migratedCategories.push(targetCategory);
          this.migrationReport.categoriesMigrated++;

        } catch (error) {
          const errorMsg = `Failed to migrate category: ${sourceCategory.name} - ${error.message}`;
          logger.error(errorMsg, { sourceCategory, error: error.message });
          this.migrationReport.errors.push(errorMsg);
        }
      }

      logger.info('Category migration completed', {
        total: sourceCategories.length,
        migrated: this.migrationReport.categoriesMigrated,
        errors: this.migrationReport.errors.length
      });

      return categoryIdMapping;
    } catch (error) {
      logger.error('Category migration failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Migrate blogs from source to target
   */
  async migrateBlogPosts(categoryIdMapping) {
    try {
      const sourceBlogs = await this.sourceModels.Blog.find({}).lean();
      
      logger.info(`Starting blog migration: ${sourceBlogs.length} blogs found`);

      const migratedBlogs = [];

      for (const sourceBlog of sourceBlogs) {
        try {
          // Check if blog already exists by title
          const existingBlog = await Blog.findOne({ 
            title: sourceBlog.title,
            subtitle: sourceBlog.subtitle
          });

          if (existingBlog) {
            logger.info('Blog already exists, skipping', {
              sourceId: sourceBlog._id,
              existingId: existingBlog._id,
              title: sourceBlog.title
            });
            this.migrationReport.warnings.push(`Blog already exists: ${sourceBlog.title}`);
            continue;
          }

          // Map category ID if exists
          let targetCategoryId = null;
          if (sourceBlog.categoryId) {
            targetCategoryId = categoryIdMapping.get(sourceBlog.categoryId.toString());
            if (!targetCategoryId) {
              this.migrationReport.warnings.push(`Category not found for blog: ${sourceBlog.title}`);
            }
          }

          // Prepare blog data
          const blogData = {
            title: sourceBlog.title,
            subtitle: sourceBlog.subtitle,
            sections: sourceBlog.sections || [],
            tags: sourceBlog.tags || [],
            seo: sourceBlog.seo || {},
            categoryId: targetCategoryId,
            multiViews: sourceBlog.multiViews || 0,
            uniqueViews: sourceBlog.uniqueViews || [],
            isArchive: sourceBlog.isArchive || false,
            createdAt: sourceBlog.createdAt,
            updatedAt: sourceBlog.updatedAt
          };

          const targetBlog = await Blog.create(blogData);

          logger.info('Migrated blog successfully', {
            sourceId: sourceBlog._id,
            targetId: targetBlog._id,
            title: targetBlog.title,
            categoryId: targetCategoryId
          });

          migratedBlogs.push(targetBlog);
          this.migrationReport.blogsMigrated++;

        } catch (error) {
          const errorMsg = `Failed to migrate blog: ${sourceBlog.title} - ${error.message}`;
          logger.error(errorMsg, { sourceBlog, error: error.message });
          this.migrationReport.errors.push(errorMsg);
        }
      }

      logger.info('Blog migration completed', {
        total: sourceBlogs.length,
        migrated: this.migrationReport.blogsMigrated,
        errors: this.migrationReport.errors.length
      });

      return migratedBlogs;
    } catch (error) {
      logger.error('Blog migration failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate migrated data integrity
   */
  async validateMigration() {
    try {
      // Get counts from source
      const sourceCategoriesCount = await this.sourceModels.Category.countDocuments({});
      const sourceBlogsCount = await this.sourceModels.Blog.countDocuments({});

      // Get counts from target
      const targetCategoriesCount = await Category.countDocuments({});
      const targetBlogsCount = await Blog.countDocuments({});

      // Validate relationships
      const blogsWithInvalidCategories = await Blog.countDocuments({
        categoryId: { $ne: null },
        categoryId: { $nin: await Category.distinct('_id') }
      });

      const validationResults = {
        sourceCategories: sourceCategoriesCount,
        targetCategories: targetCategoriesCount,
        sourceBlogs: sourceBlogsCount,
        targetBlogs: targetBlogsCount,
        categoriesMigrated: this.migrationReport.categoriesMigrated,
        blogsMigrated: this.migrationReport.blogsMigrated,
        blogsWithInvalidCategories,
        isValid: true,
        issues: []
      };

      // Check for issues
      if (blogsWithInvalidCategories > 0) {
        validationResults.isValid = false;
        validationResults.issues.push(`${blogsWithInvalidCategories} blogs have invalid category references`);
      }

      // Sample data validation
      const sampleBlogs = await Blog.find({}).limit(5).populate('categoryId');
      for (const blog of sampleBlogs) {
        if (!blog.title || !blog.subtitle) {
          validationResults.isValid = false;
          validationResults.issues.push(`Blog ${blog._id} missing required fields`);
        }
      }

      logger.info('Migration validation completed', validationResults);

      return validationResults;
    } catch (error) {
      logger.error('Migration validation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute complete migration process
   */
  async executeMigration() {
    this.migrationReport.startTime = new Date();
    
    try {
      logger.info('Starting blog migration process');

      // Step 1: Initialize
      await this.initialize();

      // Step 2: Connect to source database
      await this.connectToSource();

      // Step 3: Create backup
      const backup = await this.createBackup();
      await this.validateBackup(backup.file);

      // Step 4: Migrate categories
      const categoryIdMapping = await this.migrateCategories();

      // Step 5: Migrate blogs
      await this.migrateBlogPosts(categoryIdMapping);

      // Step 6: Validate migration
      const validationResults = await this.validateMigration();

      // Step 7: Generate report
      this.migrationReport.endTime = new Date();
      this.migrationReport.success = validationResults.isValid && this.migrationReport.errors.length === 0;

      const finalReport = {
        ...this.migrationReport,
        validation: validationResults,
        backup: backup.file,
        duration: this.migrationReport.endTime - this.migrationReport.startTime
      };

      // Save report
      const reportFile = path.join(this.backupDir, `migration-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
      await fs.writeFile(reportFile, JSON.stringify(finalReport, null, 2));

      logger.info('Migration completed', {
        success: finalReport.success,
        categoriesMigrated: finalReport.categoriesMigrated,
        blogsMigrated: finalReport.blogsMigrated,
        errors: finalReport.errors.length,
        warnings: finalReport.warnings.length,
        reportFile
      });

      return finalReport;

    } catch (error) {
      this.migrationReport.endTime = new Date();
      this.migrationReport.success = false;
      this.migrationReport.errors.push(error.message);

      logger.error('Migration failed', { error: error.message, report: this.migrationReport });
      throw error;
    } finally {
      // Close source connection
      if (this.sourceConnection) {
        await this.sourceConnection.close();
      }
    }
  }

  /**
   * Rollback migration using backup
   */
  async rollback(backupFile) {
    try {
      logger.info('Starting migration rollback', { backupFile });

      const backupContent = await fs.readFile(backupFile, 'utf8');
      const backupData = JSON.parse(backupContent);

      // Clear current data
      await Blog.deleteMany({});
      await Category.deleteMany({});

      // Restore categories
      if (backupData.categories.length > 0) {
        await Category.insertMany(backupData.categories);
      }

      // Restore blogs
      if (backupData.blogs.length > 0) {
        await Blog.insertMany(backupData.blogs);
      }

      logger.info('Rollback completed successfully', {
        categoriesRestored: backupData.categories.length,
        blogsRestored: backupData.blogs.length
      });

      return {
        success: true,
        categoriesRestored: backupData.categories.length,
        blogsRestored: backupData.blogs.length
      };

    } catch (error) {
      logger.error('Rollback failed', { error: error.message, backupFile });
      throw error;
    }
  }
}

export default BlogMigrationService;