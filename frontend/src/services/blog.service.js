import blogAPI from '../api/blog.api.js';

/**
 * Blog Service
 * Handles blog-related business logic and data transformation for the frontend
 */
class BlogService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cache key for a request
   * @param {string} method - Method name
   * @param {*} params - Parameters
   * @returns {string} Cache key
   */
  getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  /**
   * Check if cached data is still valid
   * @param {Object} cacheEntry - Cache entry
   * @returns {boolean} True if cache is valid
   */
  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
  }

  /**
   * Get cached data or fetch from API
   * @param {string} cacheKey - Cache key
   * @param {Function} fetchFn - Function to fetch data
   * @returns {Promise<*>} Data
   */
  async getCachedOrFetch(cacheKey, fetchFn) {
    const cached = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      const data = await fetchFn();
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      // If API fails and we have stale cache, use it
      if (cached) {
        console.warn('API failed, using stale cache:', error);
        return cached.data;
      }
      // Return fallback data instead of throwing
      return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Get featured blogs for landing page with fallback content
   * @param {number} limit - Number of blogs to fetch
   * @returns {Promise<Array>} Featured blogs array
   */
  async getFeaturedBlogsForLanding(limit = 6) {
    const cacheKey = this.getCacheKey('featuredBlogs', { limit });
    
    try {
      console.log('🔄 Fetching featured blogs from API...');
      
      const response = await this.getCachedOrFetch(cacheKey, async () => {
        const apiResponse = await blogAPI.getFeaturedBlogs(limit);
        console.log('📡 API Response:', apiResponse);
        return apiResponse;
      });

      if (response && response.success && response.data && response.data.length > 0) {
        console.log('✅ Got real blogs from API:', response.data.length);
        return this.transformBlogsForLanding(response.data);
      } else {
        console.log('⚠️ No real blogs found, using fallback');
        return this.getFallbackBlogs(limit);
      }
    } catch (error) {
      console.error('❌ Failed to fetch featured blogs:', error);
      return this.getFallbackBlogs(limit);
    }
  }

  /**
   * Transform blog data for landing page display
   * @param {Array} blogs - Raw blog data from API
   * @returns {Array} Transformed blog data
   */
  transformBlogsForLanding(blogs) {
    return blogs.map(blog => ({
      id: blog.id || blog._id,
      title: blog.title,
      description: blog.subtitle || this.truncateText(blog.sections?.[0]?.content || '', 100),
      views: blog.multiViews || 0,
      date: this.formatDate(blog.createdAt),
      category: blog.categoryId?.name || null,
      slug: blog.slug || blog.id || blog._id,
      tags: blog.tags || [],
      isArchived: blog.isArchive || false
    }));
  }

  /**
   * Get fallback blogs when API is unavailable
   * @param {number} limit - Number of fallback blogs
   * @returns {Array} Fallback blog data
   */
  getFallbackBlogs(limit = 6) {
    const fallbackBlogs = [
      {
        id: 'fallback-1',
        title: 'Samarali Dars O\'tish Usullari',
        description: 'O\'qituvchilar uchun samarali dars o\'tish metodlari va zamonaviy yondashuvlar haqida batafsil ma\'lumot',
        views: 1245,
        date: '15/12/2024',
        category: 'Ta\'lim metodikasi',
        slug: 'samarali-dars-otish',
        tags: [{ label: 'Metodika', value: 'metodika' }],
        isArchived: false,
        isFallback: true
      },
      {
        id: 'fallback-2',
        title: 'Raqamli Ta\'lim Vositalari',
        description: 'Zamonaviy raqamli texnologiyalardan ta\'limda foydalanish va ularning samaradorligi',
        views: 987,
        date: '12/12/2024',
        category: 'Texnologiya',
        slug: 'raqamli-talim-vositalari',
        tags: [{ label: 'Texnologiya', value: 'texnologiya' }],
        isArchived: false,
        isFallback: true
      },
      {
        id: 'fallback-3',
        title: 'O\'quvchilar Motivatsiyasi',
        description: 'O\'quvchilarni darsga qiziqtirish va motivatsiyasini oshirish bo\'yicha amaliy maslahatlar',
        views: 1567,
        date: '10/12/2024',
        category: 'Psixologiya',
        slug: 'oquvchilar-motivatsiyasi',
        tags: [{ label: 'Motivatsiya', value: 'motivatsiya' }],
        isArchived: false,
        isFallback: true
      },
      {
        id: 'fallback-4',
        title: 'Onlayn Darslar Tashkil Etish',
        description: 'Masofaviy ta\'lim sharoitida sifatli onlayn darslar o\'tkazish bo\'yicha ko\'rsatmalar',
        views: 2134,
        date: '08/12/2024',
        category: 'Onlayn ta\'lim',
        slug: 'onlayn-darslar-tashkil-etish',
        tags: [{ label: 'Onlayn', value: 'onlayn' }],
        isArchived: false,
        isFallback: true
      },
      {
        id: 'fallback-5',
        title: 'Baholash Tizimlari',
        description: 'O\'quvchilar bilimini obyektiv baholash usullari va zamonaviy baholash tizimlari',
        views: 876,
        date: '05/12/2024',
        category: 'Baholash',
        slug: 'baholash-tizimlari',
        tags: [{ label: 'Baholash', value: 'baholash' }],
        isArchived: false,
        isFallback: true
      },
      {
        id: 'fallback-6',
        title: 'Kreativ Dars Rejalashtirish',
        description: 'Ijodiy va qiziqarli dars rejalarini tuzish, interaktiv mashg\'ulotlar o\'tkazish',
        views: 1432,
        date: '03/12/2024',
        category: 'Rejalashtirish',
        slug: 'kreativ-dars-rejalashtirish',
        tags: [{ label: 'Kreativlik', value: 'kreativlik' }],
        isArchived: false,
        isFallback: true
      }
    ];

    // Return requested number of fallback blogs
    return fallbackBlogs.slice(0, Math.min(limit, fallbackBlogs.length));
  }

  /**
   * Get empty state content when no blogs are available
   * @returns {Object} Empty state configuration
   */
  getEmptyStateContent() {
    return {
      title: 'Hozircha maqolalar mavjud emas',
      description: 'Tez orada yangi va qiziqarli maqolalar qo\'shiladi. Qaytib kelib ko\'ring!',
      icon: '📚',
      actionText: 'Sahifani yangilash',
      actionCallback: () => window.location.reload()
    };
  }

  /**
   * Get loading state content
   * @returns {Object} Loading state configuration
   */
  getLoadingStateContent() {
    return {
      title: 'Maqolalar yuklanmoqda...',
      description: 'Iltimos, biroz kuting',
      showSpinner: true
    };
  }

  /**
   * Get error state content
   * @param {Error} error - Error object
   * @returns {Object} Error state configuration
   */
  getErrorStateContent(error) {
    return {
      title: 'Maqolalarni yuklashda xatolik',
      description: error?.message || 'Tarmoq xatosi yuz berdi. Iltimos, qaytadan urinib ko\'ring.',
      icon: '⚠️',
      actionText: 'Qayta urinish',
      actionCallback: () => window.location.reload()
    };
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    if (!date) return '';
    
    try {
      const dateObj = new Date(date);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  /**
   * Get all blogs with pagination and filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Blogs with pagination info
   */
  async getAllBlogs(params = {}) {
    const cacheKey = this.getCacheKey('allBlogs', params);
    
    return await this.getCachedOrFetch(cacheKey, () => 
      blogAPI.getAllBlogs(params)
    );
  }

  /**
   * Get single blog by ID
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} Blog data
   */
  async getBlogById(id) {
    const cacheKey = this.getCacheKey('blogById', { id });
    
    const response = await this.getCachedOrFetch(cacheKey, () => 
      blogAPI.getBlogById(id)
    );

    // Track view asynchronously (don't wait for it)
    this.trackBlogView(id);

    return response;
  }

  /**
   * Track blog view (fire and forget)
   * @param {string} id - Blog ID
   */
  async trackBlogView(id) {
    try {
      await blogAPI.trackBlogView(id);
    } catch (error) {
      // Silently fail - view tracking shouldn't disrupt user experience
      console.debug('View tracking failed:', error);
    }
  }

  /**
   * Get related blogs
   * @param {string} id - Blog ID
   * @param {number} limit - Number of related blogs
   * @returns {Promise<Object>} Related blogs
   */
  async getRelatedBlogs(id, limit = 5) {
    const cacheKey = this.getCacheKey('relatedBlogs', { id, limit });
    
    return await this.getCachedOrFetch(cacheKey, () => 
      blogAPI.getRelatedBlogs(id, limit)
    );
  }

  /**
   * Get all categories
   * @param {boolean} activeOnly - Only active categories
   * @returns {Promise<Object>} Categories
   */
  async getCategories(activeOnly = true) {
    const cacheKey = this.getCacheKey('categories', { activeOnly });
    
    return await this.getCachedOrFetch(cacheKey, () => 
      blogAPI.getCategories(activeOnly)
    );
  }

  /**
   * Get blogs by category
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Blogs by category
   */
  async getBlogsByCategory(categoryId, params = {}) {
    const cacheKey = this.getCacheKey('blogsByCategory', { categoryId, ...params });
    
    return await this.getCachedOrFetch(cacheKey, () => 
      blogAPI.getBlogsByCategory(categoryId, params)
    );
  }

  /**
   * Clear cache (useful for admin operations)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear specific cache entries
   * @param {string} pattern - Pattern to match cache keys
   */
  clearCachePattern(pattern) {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of this.cache) {
      if ((now - entry.timestamp) < this.cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheTimeout: this.cacheTimeout
    };
  }
}

// Export singleton instance
export const blogService = new BlogService();
export default blogService;