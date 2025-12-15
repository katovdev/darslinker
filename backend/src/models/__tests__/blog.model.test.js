import mongoose from 'mongoose';
import fc from 'fast-check';
import Blog from '../blog.model.js';

/**
 * Feature: blog-integration, Property 2: Complete Data Migration
 * Validates: Requirements 1.4, 2.1, 2.2
 */

describe('Blog Model Property Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/darslinker_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the Blog collection before each test
    await Blog.deleteMany({});
  });

  describe('Property: Blog data preservation during migration', () => {
    test('should preserve all blog fields when saving and retrieving', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random blog data
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }),
            subtitle: fc.string({ minLength: 1, maxLength: 300 }),
            sections: fc.array(fc.anything(), { maxLength: 10 }),
            tags: fc.array(
              fc.record({
                label: fc.string({ minLength: 1, maxLength: 50 }),
                value: fc.string({ minLength: 1, maxLength: 50 })
              }),
              { maxLength: 5 }
            ),
            seo: fc.record({
              metaTitle: fc.string({ maxLength: 100 }),
              metaDescription: fc.string({ maxLength: 200 }),
              keywords: fc.array(fc.string({ maxLength: 30 }), { maxLength: 10 }),
              canonicalUrl: fc.string({ maxLength: 200 })
            }),
            multiViews: fc.nat({ max: 1000000 }),
            uniqueViews: fc.array(fc.string(), { maxLength: 100 }),
            isArchive: fc.boolean()
          }),
          async (blogData) => {
            // Create and save blog
            const blog = new Blog(blogData);
            const savedBlog = await blog.save();

            // Retrieve the saved blog
            const retrievedBlog = await Blog.findById(savedBlog._id);

            // Verify all fields are preserved
            expect(retrievedBlog.title).toBe(blogData.title.trim());
            expect(retrievedBlog.subtitle).toBe(blogData.subtitle.trim());
            expect(retrievedBlog.sections).toEqual(blogData.sections);
            expect(retrievedBlog.tags).toEqual(blogData.tags);
            expect(retrievedBlog.seo.metaTitle).toBe(blogData.seo.metaTitle);
            expect(retrievedBlog.seo.metaDescription).toBe(blogData.seo.metaDescription);
            expect(retrievedBlog.seo.keywords).toEqual(blogData.seo.keywords);
            expect(retrievedBlog.seo.canonicalUrl).toBe(blogData.seo.canonicalUrl);
            expect(retrievedBlog.multiViews).toBe(blogData.multiViews);
            expect(retrievedBlog.uniqueViews).toEqual(blogData.uniqueViews);
            expect(retrievedBlog.isArchive).toBe(blogData.isArchive);
            expect(retrievedBlog.createdAt).toBeDefined();
            expect(retrievedBlog.updatedAt).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle required field validation correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
            subtitle: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
            sections: fc.array(fc.anything(), { maxLength: 5 }),
            tags: fc.array(
              fc.record({
                label: fc.string({ minLength: 1 }),
                value: fc.string({ minLength: 1 })
              }),
              { maxLength: 3 }
            )
          }),
          async (blogData) => {
            const blog = new Blog(blogData);

            if (!blogData.title || !blogData.subtitle) {
              // Should fail validation for missing required fields
              await expect(blog.save()).rejects.toThrow();
            } else {
              // Should save successfully with required fields
              const savedBlog = await blog.save();
              expect(savedBlog._id).toBeDefined();
              expect(savedBlog.title).toBe(blogData.title.trim());
              expect(savedBlog.subtitle).toBe(blogData.subtitle.trim());
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should apply default values correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            subtitle: fc.string({ minLength: 1, maxLength: 100 })
          }),
          async (blogData) => {
            const blog = new Blog(blogData);
            const savedBlog = await blog.save();

            // Check default values are applied
            expect(savedBlog.sections).toEqual([]);
            expect(savedBlog.tags).toEqual([]);
            expect(savedBlog.seo.metaTitle).toBe('');
            expect(savedBlog.seo.metaDescription).toBe('');
            expect(savedBlog.seo.keywords).toEqual([]);
            expect(savedBlog.seo.canonicalUrl).toBe('');
            expect(savedBlog.multiViews).toBe(0);
            expect(savedBlog.uniqueViews).toEqual([]);
            expect(savedBlog.isArchive).toBe(false);
            expect(savedBlog.categoryId).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should maintain data integrity with JSON transformation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            subtitle: fc.string({ minLength: 1, maxLength: 100 }),
            sections: fc.array(fc.record({
              type: fc.constantFrom('text', 'image', 'video'),
              content: fc.string()
            }), { maxLength: 5 }),
            tags: fc.array(
              fc.record({
                label: fc.string({ minLength: 1, maxLength: 20 }),
                value: fc.string({ minLength: 1, maxLength: 20 })
              }),
              { maxLength: 3 }
            )
          }),
          async (blogData) => {
            const blog = new Blog(blogData);
            const savedBlog = await blog.save();

            // Convert to JSON (simulating API response)
            const jsonBlog = savedBlog.toJSON();

            // Verify JSON transformation
            expect(jsonBlog.id).toBeDefined();
            expect(jsonBlog._id).toBeUndefined();
            expect(jsonBlog.__v).toBeUndefined();
            expect(jsonBlog.title).toBe(blogData.title.trim());
            expect(jsonBlog.subtitle).toBe(blogData.subtitle.trim());
            expect(jsonBlog.sections).toEqual(blogData.sections);
            expect(jsonBlog.tags).toEqual(blogData.tags);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});