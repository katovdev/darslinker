/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Environment-based API configuration
const getApiConfig = () => {
  const env = import.meta.env.MODE || 'development';
  
  const configs = {
    development: {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      apiPrefix: '/api',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000
    },
    production: {
      baseURL: import.meta.env.VITE_API_URL || 'https://darslinker-backend.onrender.com/api',
      apiPrefix: '',
      timeout: 15000,
      retryAttempts: 2,
      retryDelay: 2000
    },
    test: {
      baseURL: 'http://localhost:3000',
      apiPrefix: '/api',
      timeout: 5000,
      retryAttempts: 1,
      retryDelay: 500
    }
  };
  
  return configs[env] || configs.development;
};

export const apiConfig = getApiConfig();

// Blog API endpoints
export const blogEndpoints = {
  // Public endpoints
  getAllBlogs: '/blogs',
  getFeaturedBlogs: '/blogs/featured',
  getBlogById: (id) => `/blogs/${id}`,
  getRelatedBlogs: (id) => `/blogs/${id}/related`,
  trackBlogView: (id) => `/blogs/${id}/view`,
  getSitemap: '/blogs/sitemap.xml',
  
  // Category endpoints
  getCategories: '/categories',
  getCategoryById: (id) => `/categories/${id}`,
  getBlogsByCategory: (categoryId) => `/blogs?category=${categoryId}`,
  
  // Admin endpoints (require authentication)
  createBlog: '/blogs',
  updateBlog: (id) => `/blogs/${id}`,
  deleteBlog: (id) => `/blogs/${id}`,
  archiveBlog: (id) => `/blogs/${id}/archive`,
  unarchiveBlog: (id) => `/blogs/${id}/unarchive`,
  getArchivedBlogs: '/blogs/archive',
  
  createCategory: '/categories',
  updateCategory: (id) => `/categories/${id}`,
  deleteCategory: (id) => `/categories/${id}`
};

// Request configuration helpers
export const createRequestConfig = (options = {}) => {
  const config = {
    baseURL: `${apiConfig.baseURL}${apiConfig.apiPrefix}`,
    timeout: apiConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    ...options
  };
  
  // Add authentication token if available
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

// Retry configuration
export const retryConfig = {
  attempts: apiConfig.retryAttempts,
  delay: apiConfig.retryDelay,
  shouldRetry: (error) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

// Cache configuration
export const cacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // Maximum number of cached items
  
  // Cache keys for different types of requests
  keys: {
    featuredBlogs: 'featured_blogs',
    allBlogs: (params) => `all_blogs_${JSON.stringify(params)}`,
    blogById: (id) => `blog_${id}`,
    categories: 'categories',
    relatedBlogs: (id) => `related_blogs_${id}`
  }
};

export default {
  apiConfig,
  blogEndpoints,
  createRequestConfig,
  retryConfig,
  cacheConfig
};