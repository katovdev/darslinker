import { jest } from '@jest/globals';
import fc from 'fast-check';
import fs from 'fs/promises';
import path from 'path';
import BlogMigrationService from '../blog-migration.service.js';
import Blog from '../../models/blog.model.js';
import Category from '../../models/category.model.js';

// Mock the models and dependencies
jest.mock('../../models/blog.model.js');
jest.mock('../../models/category.model.js');
jest.mock('fs/promises');
jest.mock('../../config/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('Blog Migration Service Property Tests', () => {
  let migrationService;

  beforeEach(() => {
    jest.clearAllMocks();
    migrationService = new BlogMigrationService();
    
    // Mock environment variables
    process.env.BLOG_SOURCE_DB_URI = 'mongodb://localhost:27017/blog_source';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/blog_target';
  });

  describe('Property 8: Migration Data Integrity', () => {
    /**
     * Property: Backup creation and validation must preserve data integrity
     * - All data must be included in backup
     * - Backup structure must be valid
     * - Backup validation must detect corruption
     * - Counts must match actual data
     */
    test('backup creation preserves all data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string({ minLength: 1, maxLength: 100 }),
              description: fc.option(fc.string({ maxLength: 500 })),
              slug: fc.string({ minLength: 1, maxLength: 100 }),
              isActive: fc.boolean(),
              createdAt: fc.date(),
              updatedAt: fc.date()
            }),
            { minLength: 0, maxLength: 20 }
          ),
          fc.array(
            fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              title: fc.string({ minLength: 1, maxLength: 200 }),
              subtitle: fc.string({ minLength: 1, maxLength: 300 }),
              sections: fc.array(fc.record({
                header: fc.option(fc.string()),
                content: fc.option(fc.string())
              })),
              tags: fc.array(fc.record({
                label: fc.string(),
                value: fc.string()
              })),
              categoryId: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 })),
              multiViews: fc.integer({ min: 0, max: 10000 }),
              isArchive: fc.boolean(),
              createdAt: fc.date(),
              updatedAt: fc.date()
            }),
            { minLength: 0, maxLength: 50 }
          )
        ),
        async (mockCategories, mockBlogs) => {
          // Mock database responses
          Category.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockCategories)
          });
          
          Blog.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockBlogs)
          });

          // Mock file system
          fs.mkdir.mockResolvedValue();
          fs.writeFile.mockResolvedValue();

          const backup = await migrationService.createBackup();

          // Property: Backup includes all data
          expect(fs.writeFile).toHaveBeenCalled();
          const writeCall = fs.writeFile.mock.calls[0];
          const backupData = JSON.parse(writeCall[1]);

          expect(backupData).toHaveProperty('timestamp');
          expect(backupData).toHaveProperty('categories');
          expect(backupData).toHaveProperty('blogs');
          expect(backupData).toHaveProperty('counts');

          // Property: Data integrity is preserved
          expect(backupData.categories).toHaveLength(mockCategories.length);
          expect(backupData.blogs).toHaveLength(mockBlogs.length);
          expect(backupData.counts.categories).toBe(mockCategories.length);
          expect(backupData.counts.blogs).toBe(mockBlogs.length);

          // Property: Backup structure is valid
          expect(Array.isArray(backupData.categories)).toBe(true);
          expect(Array.isArray(backupData.blogs)).toBe(true);
          expect(typeof backupData.timestamp).toBe('string');
        }
      ), { numRuns: 100 });
    });

    test('backup validation detects corruption', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timestamp: fc.option(fc.string()),
            categories: fc.option(fc.array(fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string()
            }))),
            blogs: fc.option(fc.array(fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              title: fc.string()
            }))),
            counts: fc.option(fc.record({
              categories: fc.integer({ min: 0, max: 100 }),
              blogs: fc.integer({ min: 0, max: 100 })
            }))
          })
        ),
        async (corruptedBackup) => {
          const backupFile = '/test/backup.json';
          
          // Create corrupted backup data
          fs.readFile.mockResolvedValue(JSON.stringify(corruptedBackup));

          // Property: Validation detects missing required fields
          const hasRequiredFields = corruptedBackup.timestamp && 
                                   corruptedBackup.categories && 
                                   corruptedBackup.blogs;

          if (!hasRequiredFields) {
            await expect(migrationService.validateBackup(backupFile))
              .rejects.toThrow('Invalid backup file structure');
          } else {
            // Property: Validation detects invalid data types
            const categoriesValid = Array.isArray(corruptedBackup.categories);
            const blogsValid = Array.isArray(corruptedBackup.blogs);

            if (!categoriesValid || !blogsValid) {
              await expect(migrationService.validateBackup(backupFile))
                .rejects.toThrow('Backup data is corrupted');
            } else {
              // Should pass validation if structure is correct
              const result = await migrationService.validateBackup(backupFile);
              expect(result).toBe(true);
            }
          }
        }
      ), { numRuns: 100 });
    });

    test('backup validation detects count mismatches', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string()
          }), { minLength: 0, maxLength: 20 }),
          fc.array(fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            title: fc.string()
          }), { minLength: 0, maxLength: 30 }),
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 50 })
        ),
        async (categories, blogs, wrongCategoryCount, wrongBlogCount) => {
          const backupFile = '/test/backup.json';
          
          const backupData = {
            timestamp: new Date().toISOString(),
            categories,
            blogs,
            counts: {
              categories: wrongCategoryCount,
              blogs: wrongBlogCount
            }
          };

          fs.readFile.mockResolvedValue(JSON.stringify(backupData));

          const result = await migrationService.validateBackup(backupFile);

          // Property: Count mismatches are detected as warnings
          const actualCategoriesCount = categories.length;
          const actualBlogsCount = blogs.length;
          
          if (actualCategoriesCount !== wrongCategoryCount || actualBlogsCount !== wrongBlogCount) {
            expect(migrationService.migrationReport.warnings).toContain('Backup counts do not match actual data');
          }

          // Property: Validation still passes for structure correctness
          expect(result).toBe(true);
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 2: Complete Data Migration', () => {
    /**
     * Property: Category migration must preserve all data and relationships
     * - All categories must be migrated or updated
     * - Duplicate names must be handled correctly
     * - ID mapping must be maintained for blog relationships
     * - Data integrity must be preserved
     */
    test('category migration preserves data integrity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string({ minLength: 1, maxLength: 100 }),
              description: fc.option(fc.string({ maxLength: 500 })),
              slug: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
              isActive: fc.boolean(),
              createdAt: fc.date(),
              updatedAt: fc.date()
            }),
            { minLength: 1, maxLength: 10 }
          )
        ),
        async (sourceCategories) => {
          // Mock source connection and models
          migrationService.sourceModels = {
            Category: {
              find: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(sourceCategories)
              })
            }
          };

          // Mock target Category model
          Category.findOne.mockResolvedValue(null); // No existing categories
          Category.create.mockImplementation((data) => ({
            _id: 'new-' + Math.random().toString(36).substr(2, 9),
            ...data
          }));

          const categoryIdMapping = await migrationService.migrateCategories();

          // Property: All categories are processed
          expect(migrationService.migrationReport.categoriesMigrated).toBe(sourceCategories.length);

          // Property: ID mapping is created for all categories
          expect(categoryIdMapping.size).toBe(sourceCategories.length);

          // Property: Each source category has a mapping
          for (const sourceCategory of sourceCategories) {
            expect(categoryIdMapping.has(sourceCategory._id)).toBe(true);
          }

          // Property: Category.create is called for each new category
          expect(Category.create).toHaveBeenCalledTimes(sourceCategories.length);
        }
      ), { numRuns: 100 });
    });

    test('blog migration preserves relationships and data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              title: fc.string({ minLength: 1, maxLength: 200 }),
              subtitle: fc.string({ minLength: 1, maxLength: 300 }),
              sections: fc.array(fc.record({
                header: fc.option(fc.string()),
                content: fc.option(fc.string())
              })),
              tags: fc.array(fc.record({
                label: fc.string(),
                value: fc.string()
              })),
              categoryId: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 })),
              multiViews: fc.integer({ min: 0, max: 10000 }),
              uniqueViews: fc.array(fc.string()),
              isArchive: fc.boolean(),
              createdAt: fc.date(),
              updatedAt: fc.date()
            }),
            { minLength: 1, maxLength: 15 }
          ),
          fc.dictionary(
            fc.hexaString({ minLength: 24, maxLength: 24 }),
            fc.hexaString({ minLength: 24, maxLength: 24 })
          )
        ),
        async (sourceBlogs, categoryIdMapping) => {
          // Mock source models
          migrationService.sourceModels = {
            Blog: {
              find: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(sourceBlogs)
              })
            }
          };

          // Mock target Blog model
          Blog.findOne.mockResolvedValue(null); // No existing blogs
          Blog.create.mockImplementation((data) => ({
            _id: 'new-' + Math.random().toString(36).substr(2, 9),
            ...data
          }));

          const categoryMapping = new Map(Object.entries(categoryIdMapping));
          await migrationService.migrateBlogPosts(categoryMapping);

          // Property: All blogs are processed
          expect(migrationService.migrationReport.blogsMigrated).toBe(sourceBlogs.length);

          // Property: Blog.create is called for each new blog
          expect(Blog.create).toHaveBeenCalledTimes(sourceBlogs.length);

          // Property: Category relationships are preserved
          const createCalls = Blog.create.mock.calls;
          for (let i = 0; i < sourceBlogs.length; i++) {
            const sourceBlog = sourceBlogs[i];
            const createdBlogData = createCalls[i][0];

            // Property: All required fields are preserved
            expect(createdBlogData.title).toBe(sourceBlog.title);
            expect(createdBlogData.subtitle).toBe(sourceBlog.subtitle);
            expect(createdBlogData.sections).toEqual(sourceBlog.sections);
            expect(createdBlogData.tags).toEqual(sourceBlog.tags);
            expect(createdBlogData.multiViews).toBe(sourceBlog.multiViews);
            expect(createdBlogData.isArchive).toBe(sourceBlog.isArchive);

            // Property: Category ID is mapped correctly
            if (sourceBlog.categoryId) {
              const expectedCategoryId = categoryMapping.get(sourceBlog.categoryId);
              expect(createdBlogData.categoryId).toBe(expectedCategoryId);
            } else {
              expect(createdBlogData.categoryId).toBeNull();
            }
          }
        }
      ), { numRuns: 100 });
    });

    test('migration handles duplicate data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            subtitle: fc.string({ minLength: 1, maxLength: 300 }),
            sections: fc.array(fc.record({
              header: fc.option(fc.string()),
              content: fc.option(fc.string())
            })),
            categoryId: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 })),
            isArchive: fc.boolean()
          })
        ),
        async (duplicateBlog) => {
          // Mock source models
          migrationService.sourceModels = {
            Blog: {
              find: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([duplicateBlog])
              })
            }
          };

          // Mock existing blog in target
          Blog.findOne.mockResolvedValue({
            _id: 'existing-blog-id',
            title: duplicateBlog.title,
            subtitle: duplicateBlog.subtitle
          });

          const categoryMapping = new Map();
          await migrationService.migrateBlogPosts(categoryMapping);

          // Property: Duplicate blogs are not created
          expect(Blog.create).not.toHaveBeenCalled();
          expect(migrationService.migrationReport.blogsMigrated).toBe(0);

          // Property: Warning is added for duplicate
          expect(migrationService.migrationReport.warnings).toContain(
            `Blog already exists: ${duplicateBlog.title}`
          );
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 5: Migration Validation', () => {
    /**
     * Property: Migration validation must detect data integrity issues
     * - Count mismatches must be detected
     * - Invalid relationships must be identified
     * - Missing required fields must be caught
     * - Validation results must be accurate
     */
    test('validation detects relationship integrity issues', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 10 })
        ),
        async (sourceCats, targetCats, sourceBlogs, targetBlogs, invalidRefs) => {
          // Mock source models
          migrationService.sourceModels = {
            Category: {
              countDocuments: jest.fn().mockResolvedValue(sourceCats)
            },
            Blog: {
              countDocuments: jest.fn().mockResolvedValue(sourceBlogs)
            }
          };

          // Mock target models
          Category.countDocuments.mockResolvedValue(targetCats);
          Category.distinct.mockResolvedValue(['cat1', 'cat2', 'cat3']);
          Blog.countDocuments
            .mockResolvedValueOnce(targetBlogs)
            .mockResolvedValueOnce(invalidRefs);

          // Mock sample blogs
          Blog.find.mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue([
                { _id: 'blog1', title: 'Test Blog', subtitle: 'Test Subtitle' },
                { _id: 'blog2', title: 'Another Blog', subtitle: 'Another Subtitle' }
              ])
            })
          });

          const validationResults = await migrationService.validateMigration();

          // Property: Validation results include all required fields
          expect(validationResults).toHaveProperty('sourceCategories', sourceCats);
          expect(validationResults).toHaveProperty('targetCategories', targetCats);
          expect(validationResults).toHaveProperty('sourceBlogs', sourceBlogs);
          expect(validationResults).toHaveProperty('targetBlogs', targetBlogs);
          expect(validationResults).toHaveProperty('blogsWithInvalidCategories', invalidRefs);
          expect(validationResults).toHaveProperty('isValid');
          expect(validationResults).toHaveProperty('issues');

          // Property: Invalid relationships are detected
          if (invalidRefs > 0) {
            expect(validationResults.isValid).toBe(false);
            expect(validationResults.issues).toContain(
              `${invalidRefs} blogs have invalid category references`
            );
          }

          // Property: Issues array is always present
          expect(Array.isArray(validationResults.issues)).toBe(true);
        }
      ), { numRuns: 100 });
    });
  });
});