import apiClient from './client.js';

/**
 * Blog API Service
 * Handles all blog-related API calls to the Express.js backend
 */
class BlogAPI {
  /**
   * Get featured blogs for landing page
   * @param {number} limit - Number of blogs to fetch (default: 6)
   * @returns {Promise<Object>} API response with featured blogs
   */
  async getFeaturedBlogs(limit = 6) {
    try {
      const response = await apiClient.get(`/blogs/featured?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      throw error;
    }
  }

  /**
   * Get all blogs with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.category - Category ID
   * @param {number} params.limit - Number of blogs per page
   * @param {number} params.page - Page number
   * @param {boolean} params.archived - Include archived blogs
   * @returns {Promise<Object>} API response with blogs and pagination
   */
  async getAllBlogs(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await apiClient.get(`/blogs?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }

  /**
   * Get single blog by ID
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} API response with blog data
   */
  async getBlogById(id) {
    try {
      const response = await apiClient.get(`/blogs/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  }

  /**
   * Get related blogs by same tags
   * @param {string} id - Blog ID
   * @param {number} limit - Number of related blogs to fetch
   * @returns {Promise<Object>} API response with related blogs
   */
  async getRelatedBlogs(id, limit = 5) {
    try {
      const response = await apiClient.get(`/blogs/${id}/related?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      throw error;
    }
  }

  /**
   * Track blog view
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} API response
   */
  async trackBlogView(id) {
    try {
      const response = await apiClient.post(`/blogs/${id}/view`);
      return response;
    } catch (error) {
      console.error('Error tracking blog view:', error);
      // Don't throw error for view tracking to avoid disrupting user experience
      return null;
    }
  }

  /**
   * Get all categories
   * @param {boolean} activeOnly - Only fetch active categories
   * @returns {Promise<Object>} API response with categories
   */
  async getCategories(activeOnly = true) {
    try {
      const params = activeOnly ? '?active=true' : '';
      const response = await apiClient.get(`/categories${params}`);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} API response with category data
   */
  async getCategoryById(id) {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} API response with category data
   */
  async getCategoryBySlug(slug) {
    try {
      const response = await apiClient.get(`/categories/slug/${slug}`);
      return response;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  }

  /**
   * Get blogs by category
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response with blogs and pagination
   */
  async getBlogsByCategory(categoryId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await apiClient.get(`/categories/${categoryId}/blogs?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching blogs by category:', error);
      throw error;
    }
  }

  /**
   * Get category statistics
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} API response with category stats
   */
  async getCategoryStats(categoryId) {
    try {
      const response = await apiClient.get(`/categories/${categoryId}/stats`);
      return response;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  }

  // Admin methods (require authentication and admin role)

  /**
   * Create new blog (Admin only)
   * @param {Object} blogData - Blog data
   * @returns {Promise<Object>} API response with created blog
   */
  async createBlog(blogData) {
    try {
      const response = await apiClient.post('/blogs', blogData);
      return response;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  /**
   * Update blog (Admin only)
   * @param {string} id - Blog ID
   * @param {Object} blogData - Updated blog data
   * @returns {Promise<Object>} API response with updated blog
   */
  async updateBlog(id, blogData) {
    try {
      const response = await apiClient.put(`/blogs/${id}`, blogData);
      return response;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  /**
   * Archive blog (Admin only)
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} API response
   */
  async archiveBlog(id) {
    try {
      const response = await apiClient.put(`/blogs/${id}/archive`);
      return response;
    } catch (error) {
      console.error('Error archiving blog:', error);
      throw error;
    }
  }

  /**
   * Unarchive blog (Admin only)
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} API response
   */
  async unarchiveBlog(id) {
    try {
      const response = await apiClient.put(`/blogs/${id}/unarchive`);
      return response;
    } catch (error) {
      console.error('Error unarchiving blog:', error);
      throw error;
    }
  }

  /**
   * Delete blog (Admin only)
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} API response
   */
  async deleteBlog(id) {
    try {
      const response = await apiClient.delete(`/blogs/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }

  /**
   * Get archived blogs (Admin only)
   * @returns {Promise<Object>} API response with archived blogs
   */
  async getArchivedBlogs() {
    try {
      const response = await apiClient.get('/blogs/archive');
      return response;
    } catch (error) {
      console.error('Error fetching archived blogs:', error);
      throw error;
    }
  }

  /**
   * Create new category (Admin only)
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} API response with created category
   */
  async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update category (Admin only)
   * @param {string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} API response with updated category
   */
  async updateCategory(id, categoryData) {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Activate category (Admin only)
   * @param {string} id - Category ID
   * @returns {Promise<Object>} API response
   */
  async activateCategory(id) {
    try {
      const response = await apiClient.put(`/categories/${id}/activate`);
      return response;
    } catch (error) {
      console.error('Error activating category:', error);
      throw error;
    }
  }

  /**
   * Deactivate category (Admin only)
   * @param {string} id - Category ID
   * @returns {Promise<Object>} API response
   */
  async deactivateCategory(id) {
    try {
      const response = await apiClient.put(`/categories/${id}/deactivate`);
      return response;
    } catch (error) {
      console.error('Error deactivating category:', error);
      throw error;
    }
  }

  /**
   * Delete category (Admin only)
   * @param {string} id - Category ID
   * @returns {Promise<Object>} API response
   */
  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blogAPI = new BlogAPI();
export default blogAPI;