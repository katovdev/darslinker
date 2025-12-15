import { jest } from '@jest/globals';
import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Blog from '../../models/blog.model.js';
import Category from '../../models/category.model.js';
import * as blogController from '../blog.controller.js';
import { errorHandler } from '../../middlewares/error.middleware.js';

// Mock the models
jest.mock('../../models/blog.model.js');
jest.mock('../../models/category.model.js');

// Create Express app for testing
const app = express();
app.use(express.json());

// Add routes
app.get('/api/blogs', blogController.findAll);
app.get('/api/blogs/featured', blogController.getFeatured);
app.get('/api/blogs/archive', blogController.getArchived);
app.get('/api/blogs/:id', blogController.findOne);
app.get('/api/blogs/:id/related', blogController.getRelated);
app.post('/api/blogs', blogController.create);
app.put('/api/blogs/:id', blogController.update);
app.post('/api/blogs/:id/view', blogController.trackView);
app.put('/api/blogs/:id/archive', blogController.archive);
app.put('/api/blogs/:id/unarchive', blogController.unarchive);
app.delete('/api/blogs/:id', blogController.deleteBlog);
app.get('/api/blogs/sitemap.xml', blogController.generateSitemap);

app.use(errorHandler);

describe('Blog Controller Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 1: API Response Consistency', () => {
    /**
     * Property: All successful API responses must have consistent structure
     * - success: boolean (true for successful responses)
     * - message: string (descriptive message)
     * - data/blog: object (response payload)
     * - pagination: object (for paginated responses)
     */
    test('findAll responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            search: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            category: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 })),
            limit: fc.option(fc.integer({ min: 1, max: 100 })),
            page: fc.option(fc.integer({ min: 1, max: 10 })),
            archived: fc.option(fc.boolean())
          }),
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
            { minLength: 0, maxLength: 20 }
          ),
          fc.integer({ min: 0, max: 1000 })
        ),
        async (queryParams, mockBlogs, totalCount) => {
          // Mock Blog.find chain
          const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockBlogs)
          };
          
          Blog.find.mockReturnValue(mockQuery);
          Blog.countDocuments.mockResolvedValue(totalCount);

          const response = await request(app)
            .get('/api/blogs')
            .query(queryParams);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
          expect(response.body).toHaveProperty('pagination');
          
          // Property: Pagination structure consistency
          const pagination = response.body.pagination;
          expect(pagination).toHaveProperty('total');
          expect(pagination).toHaveProperty('page');
          expect(pagination).toHaveProperty('limit');
          expect(pagination).toHaveProperty('pages');
          expect(typeof pagination.total).toBe('number');
          expect(typeof pagination.page).toBe('number');
          expect(typeof pagination.limit).toBe('number');
          expect(typeof pagination.pages).toBe('number');
          
          // Property: Pagination calculations are correct
          const expectedLimit = parseInt(queryParams.limit) || 10;
          const expectedPage = parseInt(queryParams.page) || 1;
          const expectedPages = Math.ceil(totalCount / expectedLimit);
          
          expect(pagination.total).toBe(totalCount);
          expect(pagination.page).toBe(expectedPage);
          expect(pagination.limit).toBe(expectedLimit);
          expect(pagination.pages).toBe(expectedPages);
        }
      ), { numRuns: 100 });
    });

    test('findOne responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
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
            seo: fc.record({
              metaTitle: fc.option(fc.string()),
              metaDescription: fc.option(fc.string()),
              keywords: fc.array(fc.string()),
              canonicalUrl: fc.option(fc.string())
            }),
            categoryId: fc.option(fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string(),
              slug: fc.string()
            })),
            multiViews: fc.integer({ min: 0, max: 10000 }),
            isArchive: fc.boolean(),
            createdAt: fc.date(),
            updatedAt: fc.date()
          })
        ),
        async (blogId, mockBlog) => {
          // Mock Blog.findById chain
          const mockQuery = {
            populate: jest.fn().mockResolvedValue(mockBlog)
          };
          
          Blog.findById.mockReturnValue(mockQuery);

          const response = await request(app)
            .get(`/api/blogs/${blogId}`)
            .set('Accept', 'application/json');

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          expect(response.body).toHaveProperty('blog');
          expect(typeof response.body.blog).toBe('object');
          
          // Property: Blog object has required fields
          const blog = response.body.blog;
          expect(blog).toHaveProperty('title');
          expect(blog).toHaveProperty('subtitle');
          expect(blog).toHaveProperty('sections');
          expect(blog).toHaveProperty('tags');
          expect(blog).toHaveProperty('multiViews');
          expect(blog).toHaveProperty('isArchive');
          expect(blog).toHaveProperty('createdAt');
          expect(blog).toHaveProperty('updatedAt');
        }
      ), { numRuns: 100 });
    });

    test('create responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            header: fc.record({
              title: fc.string({ minLength: 1, maxLength: 200 }),
              subtitle: fc.string({ minLength: 1, maxLength: 300 })
            }),
            sections: fc.array(fc.record({
              header: fc.option(fc.string()),
              content: fc.option(fc.string())
            })),
            tags: fc.array(fc.record({
              label: fc.string(),
              value: fc.string()
            })),
            seo: fc.record({
              metaTitle: fc.option(fc.string()),
              metaDescription: fc.option(fc.string()),
              keywords: fc.array(fc.string()),
              canonicalUrl: fc.option(fc.string())
            }),
            categoryId: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 }))
          }),
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
            categoryId: fc.option(fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string(),
              slug: fc.string()
            })),
            multiViews: fc.integer({ min: 0, max: 10000 }),
            isArchive: fc.boolean(),
            createdAt: fc.date(),
            updatedAt: fc.date(),
            populate: fc.constant(jest.fn().mockResolvedValue())
          })
        ),
        async (createData, mockCreatedBlog) => {
          // Mock Category.findById if categoryId provided
          if (createData.categoryId) {
            Category.findById.mockResolvedValue({
              _id: createData.categoryId,
              name: 'Test Category',
              slug: 'test-category'
            });
          }

          // Mock Blog.create
          Blog.create.mockResolvedValue(mockCreatedBlog);

          const response = await request(app)
            .post('/api/blogs')
            .send(createData);

          // Property: Response structure consistency
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          expect(response.body).toHaveProperty('blog');
          expect(typeof response.body.blog).toBe('object');
          
          // Property: Created blog has required fields
          const blog = response.body.blog;
          expect(blog).toHaveProperty('title');
          expect(blog).toHaveProperty('subtitle');
          expect(blog).toHaveProperty('sections');
          expect(blog).toHaveProperty('tags');
          expect(blog).toHaveProperty('multiViews');
          expect(blog).toHaveProperty('isArchive');
        }
      ), { numRuns: 100 });
    });

    test('update responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.record({
            header: fc.option(fc.record({
              title: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
              subtitle: fc.option(fc.string({ minLength: 1, maxLength: 300 }))
            })),
            sections: fc.option(fc.array(fc.record({
              header: fc.option(fc.string()),
              content: fc.option(fc.string())
            }))),
            tags: fc.option(fc.array(fc.record({
              label: fc.string(),
              value: fc.string()
            }))),
            categoryId: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 }))
          }),
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
            categoryId: fc.option(fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string(),
              slug: fc.string()
            })),
            multiViews: fc.integer({ min: 0, max: 10000 }),
            isArchive: fc.boolean(),
            createdAt: fc.date(),
            updatedAt: fc.date(),
            populate: fc.constant(jest.fn().mockResolvedValue())
          })
        ),
        async (blogId, updateData, mockUpdatedBlog) => {
          // Mock Category.findById if categoryId provided
          if (updateData.categoryId) {
            Category.findById.mockResolvedValue({
              _id: updateData.categoryId,
              name: 'Test Category',
              slug: 'test-category'
            });
          }

          // Mock Blog.findByIdAndUpdate chain
          const mockQuery = {
            populate: jest.fn().mockResolvedValue(mockUpdatedBlog)
          };
          
          Blog.findByIdAndUpdate.mockReturnValue(mockQuery);

          const response = await request(app)
            .put(`/api/blogs/${blogId}`)
            .send(updateData);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          expect(response.body).toHaveProperty('blog');
          expect(typeof response.body.blog).toBe('object');
          
          // Property: Updated blog has required fields
          const blog = response.body.blog;
          expect(blog).toHaveProperty('title');
          expect(blog).toHaveProperty('subtitle');
          expect(blog).toHaveProperty('sections');
          expect(blog).toHaveProperty('tags');
          expect(blog).toHaveProperty('multiViews');
          expect(blog).toHaveProperty('isArchive');
        }
      ), { numRuns: 100 });
    });

    test('trackView responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            subtitle: fc.string({ minLength: 1, maxLength: 300 }),
            multiViews: fc.integer({ min: 0, max: 10000 }),
            uniqueViews: fc.array(fc.string()),
            save: fc.constant(jest.fn().mockResolvedValue())
          })
        ),
        async (blogId, mockBlog) => {
          Blog.findById.mockResolvedValue(mockBlog);

          const response = await request(app)
            .post(`/api/blogs/${blogId}/view`)
            .set('User-Agent', 'Test Browser')
            .set('X-Forwarded-For', '192.168.1.1');

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          
          // Property: View tracking increments multiViews
          expect(mockBlog.save).toHaveBeenCalled();
        }
      ), { numRuns: 100 });
    });

    test('archive/unarchive responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.boolean(),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            isArchive: fc.boolean(),
            save: fc.constant(jest.fn().mockResolvedValue())
          })
        ),
        async (blogId, shouldArchive, mockBlog) => {
          // Set initial archive state opposite to what we want to test
          mockBlog.isArchive = !shouldArchive;
          
          Blog.findById.mockResolvedValue(mockBlog);

          const endpoint = shouldArchive ? 'archive' : 'unarchive';
          const response = await request(app)
            .put(`/api/blogs/${blogId}/${endpoint}`);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
          
          // Property: Archive state is updated correctly
          expect(mockBlog.isArchive).toBe(shouldArchive);
          expect(mockBlog.save).toHaveBeenCalled();
        }
      ), { numRuns: 100 });
    });

    test('delete responses have consistent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            title: fc.string({ minLength: 1, maxLength: 200 })
          })
        ),
        async (blogId, mockDeletedBlog) => {
          Blog.findByIdAndDelete.mockResolvedValue(mockDeletedBlog);

          const response = await request(app)
            .delete(`/api/blogs/${blogId}`);

          // Property: Response structure consistency
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
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
            .get(`/api/blogs/${invalidId}`)
            .set('Accept', 'application/json');

          // Property: Error response structure consistency
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('success', false);
          expect(response.body).toHaveProperty('message');
          expect(typeof response.body.message).toBe('string');
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 2: SEO HTML Generation Consistency', () => {
    test('HTML responses have proper SEO structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
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
            seo: fc.record({
              metaTitle: fc.option(fc.string()),
              metaDescription: fc.option(fc.string()),
              keywords: fc.array(fc.string()),
              canonicalUrl: fc.option(fc.string())
            }),
            multiViews: fc.integer({ min: 0, max: 10000 }),
            createdAt: fc.date(),
            updatedAt: fc.date()
          })
        ),
        async (blogId, mockBlog) => {
          // Mock Blog.findById chain
          const mockQuery = {
            populate: jest.fn().mockResolvedValue(mockBlog)
          };
          
          Blog.findById.mockReturnValue(mockQuery);

          const response = await request(app)
            .get(`/api/blogs/${blogId}`)
            .set('Accept', 'text/html');

          // Property: HTML response has proper SEO structure
          expect(response.status).toBe(200);
          expect(response.headers['content-type']).toContain('text/html');
          
          const html = response.text;
          
          // Property: HTML contains required SEO elements
          expect(html).toContain('<!DOCTYPE html>');
          expect(html).toContain('<html lang="uz">');
          expect(html).toContain('<meta charset="UTF-8">');
          expect(html).toContain('<meta name="viewport"');
          expect(html).toContain('<title>');
          expect(html).toContain('<meta name="description"');
          expect(html).toContain('<meta name="keywords"');
          expect(html).toContain('<meta property="og:');
          expect(html).toContain('<meta name="twitter:');
          expect(html).toContain('<script type="application/ld+json">');
          expect(html).toContain('<link rel="canonical"');
          
          // Property: HTML contains blog content
          expect(html).toContain(mockBlog.title);
          expect(html).toContain(mockBlog.subtitle);
        }
      ), { numRuns: 100 });
    });
  });
});