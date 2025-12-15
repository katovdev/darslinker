import { jest } from '@jest/globals';
import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Category from '../../models/category.model.js';
import Blog from '../../models/blog.model.js';
import * as categoryController from '../category.controller.js';
import { errorHandler } from '../../middlewares/error.middleware.js';

// Mock the models
jest.mock('../../models/category.model.js');
jest.mock('../../models/blog.model.js');

// Create Express app for testing
const app = express();
app.use(express.json());

// Add routes
app.get('/api/categories', categoryController.findAll);
app.get('/api/categories/slug/:slug', categoryController.findBySlug);
app.get('/api/categories/:id', categoryController.findOne);
app.get('/api/categories/:id/blogs', categoryController.getBlogsByCategory);
app.get('/api/categories/:id/stats', categoryController.getStats);
app.post('/api/categories', categoryController.create);
app.put('/api/categories/:id', categoryController.update);
app.put('/api/categories/:id/activate', categoryController.activate);
app.put('/api/categories/:id/deactivate', categoryController.deactivate);
app.delete('/api/categories/:id', categoryController.deleteCategory);

app.use(errorHandler);

describe('Category Controller Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 7: Moderator Interface Functionality', () => {
    /**
     * Property: All category management operations must work correctly
     * - CRUD operations maintain data integrity
     * - Validation prevents invalid states
     * - Relationships with blogs are preserved
     * - Response structures are consistent
     */
    test('findAll responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            active: fc.option(fc.boolean())
          }),
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
          )
        ),
        async (queryParams, mockCategories) => {
          Category.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockCategories)
          });

          const response = await request(app)
            .get('/api/categories')
            .query(queryParams);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
          
          // Property: All returned categories match filter criteria
          if (queryParams.active !== undefined) {
            const expectedActive = queryParams.active;
            expect(Category.find).toHaveBeenCalledWith({ isActive: expectedActive });
          } else {
            expect(Category.find).toHaveBeenCalledWith({ isActive: true });
          }
        }
      ), { numRuns: 100 });
    });

    test('findOne responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.string({ minLength: 1, maxLength: 100 }),
            isActive: fc.boolean(),
            createdAt: fc.date(),
            updatedAt: fc.date()
          })
        ),
        async (categoryId, mockCategory) => {
          Category.findById.mockResolvedValue(mockCategory);

          const response = await request(app)
            .get(`/api/categories/${categoryId}`);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          expect(response.body).toHaveProperty('category');
          expect(typeof response.body.category).toBe('object');
          
          // Property: Category object has required fields
          const category = response.body.category;
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('slug');
          expect(category).toHaveProperty('isActive');
          expect(category).toHaveProperty('createdAt');
          expect(category).toHaveProperty('updatedAt');
        }
      ), { numRuns: 100 });
    });

    test('findBySlug responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.string({ minLength: 1, maxLength: 100 }),
            isActive: fc.constant(true),
            createdAt: fc.date(),
            updatedAt: fc.date()
          })
        ),
        async (slug, mockCategory) => {
          Category.findOne.mockResolvedValue(mockCategory);

          const response = await request(app)
            .get(`/api/categories/slug/${slug}`);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('category');
          
          // Property: Correct query parameters used
          expect(Category.findOne).toHaveBeenCalledWith({ 
            slug: slug.trim(), 
            isActive: true 
          });
        }
      ), { numRuns: 100 });
    });

    test('getBlogsByCategory responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.record({
            limit: fc.option(fc.integer({ min: 1, max: 100 })),
            page: fc.option(fc.integer({ min: 1, max: 10 }))
          }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            slug: fc.string({ minLength: 1, maxLength: 100 }),
            isActive: fc.boolean()
          }),
          fc.array(
            fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              title: fc.string({ minLength: 1, maxLength: 200 }),
              subtitle: fc.string({ minLength: 1, maxLength: 300 }),
              categoryId: fc.hexaString({ minLength: 24, maxLength: 24 }),
              isArchive: fc.constant(false),
              createdAt: fc.date()
            }),
            { minLength: 0, maxLength: 20 }
          ),
          fc.integer({ min: 0, max: 1000 })
        ),
        async (categoryId, queryParams, mockCategory, mockBlogs, totalCount) => {
          Category.findById.mockResolvedValue(mockCategory);
          
          const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockBlogs)
          };
          
          Blog.find.mockReturnValue(mockQuery);
          Blog.countDocuments.mockResolvedValue(totalCount);

          const response = await request(app)
            .get(`/api/categories/${categoryId}/blogs`)
            .query(queryParams);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('category');
          expect(response.body).toHaveProperty('pagination');
          
          // Property: Pagination structure consistency
          const pagination = response.body.pagination;
          expect(pagination).toHaveProperty('total');
          expect(pagination).toHaveProperty('page');
          expect(pagination).toHaveProperty('limit');
          expect(pagination).toHaveProperty('pages');
          
          // Property: Correct blog filter applied
          expect(Blog.find).toHaveBeenCalledWith({ 
            categoryId: categoryId, 
            isArchive: false 
          });
        }
      ), { numRuns: 100 });
    });

    test('create responses have consistent structure and validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
          }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.string({ minLength: 1, maxLength: 100 }),
            isActive: fc.constant(true),
            createdAt: fc.date(),
            updatedAt: fc.date()
          })
        ),
        async (createData, mockCreatedCategory) => {
          // Mock no existing category with same name/slug
          Category.findOne.mockResolvedValue(null);
          Category.create.mockResolvedValue(mockCreatedCategory);

          const response = await request(app)
            .post('/api/categories')
            .send(createData);

          // Property: Response structure consistency
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('category');
          
          // Property: Created category has required fields
          const category = response.body.category;
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('slug');
          expect(category).toHaveProperty('isActive');
          
          // Property: Uniqueness validation is performed
          expect(Category.findOne).toHaveBeenCalledWith({
            name: createData.name.trim(),
            isActive: true
          });
        }
      ), { numRuns: 100 });
    });

    test('update responses have consistent structure and validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.record({
            name: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
          }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.string({ minLength: 1, maxLength: 100 }),
            isActive: fc.boolean(),
            createdAt: fc.date(),
            updatedAt: fc.date()
          })
        ),
        async (categoryId, updateData, mockUpdatedCategory) => {
          // Mock existing category
          Category.findById.mockResolvedValue({
            _id: categoryId,
            name: 'Existing Category',
            slug: 'existing-category'
          });
          
          // Mock no conflicts for uniqueness checks
          Category.findOne.mockResolvedValue(null);
          Category.findByIdAndUpdate.mockResolvedValue(mockUpdatedCategory);

          const response = await request(app)
            .put(`/api/categories/${categoryId}`)
            .send(updateData);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('category');
          
          // Property: Updated category has required fields
          const category = response.body.category;
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('slug');
          expect(category).toHaveProperty('isActive');
          
          // Property: Uniqueness validation is performed for name if provided
          if (updateData.name) {
            expect(Category.findOne).toHaveBeenCalledWith({
              name: updateData.name.trim(),
              _id: { $ne: categoryId },
              isActive: true
            });
          }
        }
      ), { numRuns: 100 });
    });

    test('activate/deactivate responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.boolean(),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            isActive: fc.boolean(),
            save: fc.constant(jest.fn().mockResolvedValue())
          })
        ),
        async (categoryId, shouldActivate, mockCategory) => {
          // Set initial state opposite to what we want to test
          mockCategory.isActive = !shouldActivate;
          
          Category.findById.mockResolvedValue(mockCategory);
          
          // Mock blog count check for deactivation
          if (!shouldActivate) {
            Blog.countDocuments.mockResolvedValue(0);
          }

          const endpoint = shouldActivate ? 'activate' : 'deactivate';
          const response = await request(app)
            .put(`/api/categories/${categoryId}/${endpoint}`);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          
          // Property: Active state is updated correctly
          expect(mockCategory.isActive).toBe(shouldActivate);
          expect(mockCategory.save).toHaveBeenCalled();
        }
      ), { numRuns: 100 });
    });

    test('delete responses have consistent structure and validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 })
          })
        ),
        async (categoryId, mockDeletedCategory) => {
          // Mock no associated blogs
          Blog.countDocuments.mockResolvedValue(0);
          Category.findByIdAndDelete.mockResolvedValue(mockDeletedCategory);

          const response = await request(app)
            .delete(`/api/categories/${categoryId}`);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          
          // Property: Blog association check is performed
          expect(Blog.countDocuments).toHaveBeenCalledWith({ categoryId: categoryId });
        }
      ), { numRuns: 100 });
    });

    test('getStats responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            slug: fc.string({ minLength: 1, maxLength: 100 }),
            isActive: fc.boolean()
          }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 10000 })
        ),
        async (categoryId, mockCategory, activeBlogCount, archivedBlogCount, totalViews) => {
          Category.findById.mockResolvedValue(mockCategory);
          
          // Mock Blog.countDocuments calls
          Blog.countDocuments
            .mockResolvedValueOnce(activeBlogCount)  // Active blogs
            .mockResolvedValueOnce(archivedBlogCount); // Archived blogs
          
          // Mock Blog.aggregate for total views
          Blog.aggregate.mockResolvedValue(
            totalViews > 0 ? [{ totalViews }] : []
          );

          const response = await request(app)
            .get(`/api/categories/${categoryId}/stats`);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('stats');
          
          // Property: Stats object has required fields
          const stats = response.body.stats;
          expect(stats).toHaveProperty('category');
          expect(stats).toHaveProperty('activeBlogCount');
          expect(stats).toHaveProperty('archivedBlogCount');
          expect(stats).toHaveProperty('totalBlogCount');
          expect(stats).toHaveProperty('totalViews');
          
          // Property: Calculations are correct
          expect(stats.activeBlogCount).toBe(activeBlogCount);
          expect(stats.archivedBlogCount).toBe(archivedBlogCount);
          expect(stats.totalBlogCount).toBe(activeBlogCount + archivedBlogCount);
          expect(stats.totalViews).toBe(totalViews);
        }
      ), { numRuns: 100 });
    });

    test('error responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 23 }) // Invalid ObjectId
        ),
        async (invalidId) => {
          const response = await request(app)
            .get(`/api/categories/${invalidId}`);

          // Property: Error response structure consistency
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('success', false);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
        }
      ), { numRuns: 100 });
    });

    test('validation prevents invalid category creation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.option(fc.string({ maxLength: 5 }).filter(s => !s || s.trim().length === 0)),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
          })
        ),
        async (invalidData) => {
          const response = await request(app)
            .post('/api/categories')
            .send(invalidData);

          // Property: Invalid data is rejected
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('success', false);
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('required');
        }
      ), { numRuns: 100 });
    });

    test('uniqueness constraints are enforced', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            description: fc.option(fc.string({ maxLength: 500 })),
            slug: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
          }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            slug: fc.string({ minLength: 1, maxLength: 100 })
          })
        ),
        async (createData, existingCategory) => {
          // Mock existing category with same name
          Category.findOne.mockResolvedValue(existingCategory);

          const response = await request(app)
            .post('/api/categories')
            .send(createData);

          // Property: Duplicate names are rejected
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('success', false);
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('already exists');
        }
      ), { numRuns: 100 });
    });
  });
});