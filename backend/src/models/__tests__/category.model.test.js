import mongoose from 'mongoose';
import fc from 'fast-check';
import Category from '../category.model.js';

/**
 * Feature: blog-integration, Property 2: Complete Data Migration
 * Validates: Requirements 1.4, 2.1, 2.2
 */

describe('Category Model Property Tests', () => {
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
    // Clear the Category collection before each test
    await Category.deleteMany({});
  });

  describe('Property: Category data preservation during migration', () => {
    test('should preserve all category fields when saving and retrieving', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random category data
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.option(fc.string({ maxLength: 100 })),
            isActive: fc.boolean()
          }),
          async (categoryData) => {
            // Ensure unique name for this test
            const uniqueName = `${categoryData.name}_${Date.now()}_${Math.random()}`;
            const testData = { ...categoryData, name: uniqueName };

            // Create and save category
            const category = new Category(testData);
            const savedCategory = await category.save();

            // Retrieve the saved category
            const retrievedCategory = await Category.findById(savedCategory._id);

            // Verify all fields are preserved
            expect(retrievedCategory.name).toBe(testData.name.trim());
            expect(retrievedCategory.description).toBe(testData.description?.trim() || undefined);
            expect(retrievedCategory.isActive).toBe(testData.isActive);
            expect(retrievedCategory.createdAt).toBeDefined();
            expect(retrievedCategory.updatedAt).toBeDefined();

            // Verify slug generation
            if (testData.slug) {
              expect(retrievedCategory.slug).toBe(testData.slug.trim());
            } else {
              // Should auto-generate slug from name
              expect(retrievedCategory.slug).toBeDefined();
              expect(retrievedCategory.slug.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle required field validation correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
            description: fc.option(fc.string()),
            isActive: fc.boolean()
          }),
          async (categoryData) => {
            const category = new Category(categoryData);

            if (!categoryData.name) {
              // Should fail validation for missing required name field
              await expect(category.save()).rejects.toThrow();
            } else {
              // Should save successfully with required name field
              const savedCategory = await category.save();
              expect(savedCategory._id).toBeDefined();
              expect(savedCategory.name).toBe(categoryData.name.trim());
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should apply default values correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (name) => {
            // Ensure unique name
            const uniqueName = `${name}_${Date.now()}_${Math.random()}`;
            
            const category = new Category({ name: uniqueName });
            const savedCategory = await category.save();

            // Check default values are applied
            expect(savedCategory.isActive).toBe(true);
            expect(savedCategory.slug).toBeDefined();
            expect(savedCategory.slug.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should generate slug correctly from name', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            hasSpecialChars: fc.boolean()
          }),
          async ({ name, hasSpecialChars }) => {
            // Add special characters if flag is set
            const testName = hasSpecialChars 
              ? `${name} & Special! Characters@ #Test`
              : name;
            
            // Ensure unique name
            const uniqueName = `${testName}_${Date.now()}_${Math.random()}`;
            
            const category = new Category({ name: uniqueName });
            const savedCategory = await category.save();

            // Verify slug is generated and cleaned
            expect(savedCategory.slug).toBeDefined();
            expect(savedCategory.slug).not.toContain(' ');
            expect(savedCategory.slug).not.toContain('&');
            expect(savedCategory.slug).not.toContain('!');
            expect(savedCategory.slug).not.toContain('@');
            expect(savedCategory.slug).not.toContain('#');
            
            // Should be lowercase
            expect(savedCategory.slug).toBe(savedCategory.slug.toLowerCase());
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should maintain data integrity with JSON transformation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            description: fc.string({ maxLength: 200 }),
            isActive: fc.boolean()
          }),
          async (categoryData) => {
            // Ensure unique name
            const uniqueName = `${categoryData.name}_${Date.now()}_${Math.random()}`;
            const testData = { ...categoryData, name: uniqueName };

            const category = new Category(testData);
            const savedCategory = await category.save();

            // Convert to JSON (simulating API response)
            const jsonCategory = savedCategory.toJSON();

            // Verify JSON transformation
            expect(jsonCategory.id).toBeDefined();
            expect(jsonCategory._id).toBeUndefined();
            expect(jsonCategory.__v).toBeUndefined();
            expect(jsonCategory.name).toBe(testData.name.trim());
            expect(jsonCategory.description).toBe(testData.description.trim());
            expect(jsonCategory.isActive).toBe(testData.isActive);
            expect(jsonCategory.slug).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should enforce unique name constraint', async () => {
      const testName = `unique_test_${Date.now()}`;
      
      // Create first category
      const category1 = new Category({ name: testName });
      await category1.save();

      // Try to create second category with same name
      const category2 = new Category({ name: testName });
      
      // Should fail due to unique constraint
      await expect(category2.save()).rejects.toThrow();
    });
  });
});