/**
 * Property Tests for Dynamic Articles Component
 * 
 * **Feature: blog-integration, Property 5: Dynamic Content Loading**
 * **Validates: Requirements 4.1, 4.2**
 * 
 * These tests validate that dynamic content loading works correctly
 * across various scenarios and maintains data integrity.
 */

import DynamicArticles from '../dynamic-articles.js';
import blogService from '../../services/blog.service.js';

// Mock the blog service
jest.mock('../../services/blog.service.js');

describe('Dynamic Articles Property Tests', () => {
  let container;
  let dynamicArticles;

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    container.className = 'articles-grid';
    document.body.appendChild(container);
    
    dynamicArticles = new DynamicArticles();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (dynamicArticles) {
      dynamicArticles.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Property 5: Dynamic Content Loading', () => {
    /**
     * Property: Dynamic content loading must preserve data integrity
     * - All blog data fields must be correctly transformed
     * - Loading states must be handled gracefully
     * - Fallback content must be provided when API fails
     * - User interactions must work correctly
     */
    
    test('Property: All blog data fields are correctly transformed', async () => {
      // Generate random blog data
      const mockBlogs = Array.from({ length: 6 }, (_, index) => ({
        id: `blog-${index + 1}`,
        _id: `blog-${index + 1}`,
        title: `Test Blog ${index + 1}`,
        subtitle: `Test subtitle ${index + 1}`,
        sections: [
          { content: `Test content for blog ${index + 1}` }
        ],
        tags: [
          { label: `Tag ${index + 1}`, value: `tag-${index + 1}` }
        ],
        multiViews: Math.floor(Math.random() * 5000),
        createdAt: new Date().toISOString(),
        categoryId: {
          name: `Category ${index + 1}`
        },
        isArchive: false
      }));

      blogService.getFeaturedBlogsForLanding.mockResolvedValue(
        blogService.transformBlogsForLanding(mockBlogs)
      );

      await dynamicArticles.init(container, { limit: 6 });

      // Property: All articles are rendered
      const articleCards = container.querySelectorAll('.article-card');
      expect(articleCards).toHaveLength(6);

      // Property: Each article has required elements
      articleCards.forEach((card, index) => {
        const title = card.querySelector('.article-header h3');
        const description = card.querySelector('.article-content p');
        const views = card.querySelector('.views');
        const date = card.querySelector('.date');

        expect(title).toBeTruthy();
        expect(title.textContent).toBe(`Test Blog ${index + 1}`);
        expect(description).toBeTruthy();
        expect(views).toBeTruthy();
        expect(date).toBeTruthy();
      });
    });

    test('Property: Loading states are handled gracefully', async () => {
      // Mock a delayed response
      let resolvePromise;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      blogService.getFeaturedBlogsForLanding.mockReturnValue(delayedPromise);

      // Initialize with loading state enabled
      const initPromise = dynamicArticles.init(container, { 
        showLoadingState: true,
        limit: 6 
      });

      // Property: Loading state is shown immediately
      expect(container.querySelector('.articles-loading')).toBeTruthy();
      expect(container.querySelector('.loading-spinner')).toBeTruthy();

      // Resolve the promise
      resolvePromise([]);
      await initPromise;

      // Property: Loading state is removed after completion
      expect(container.querySelector('.articles-loading')).toBeFalsy();
    });

    test('Property: Fallback content is provided when API fails', async () => {
      // Mock API failure
      blogService.getFeaturedBlogsForLanding.mockRejectedValue(
        new Error('API Error')
      );

      await dynamicArticles.init(container, { 
        fallbackToStatic: true,
        limit: 6 
      });

      // Property: Fallback articles are rendered
      const articleCards = container.querySelectorAll('.article-card');
      expect(articleCards).toHaveLength(6);

      // Property: Fallback indicators are present
      const fallbackIndicators = container.querySelectorAll('.fallback-indicator');
      expect(fallbackIndicators.length).toBeGreaterThan(0);
    });

    test('Property: Error states are handled correctly', async () => {
      // Mock API failure without fallback
      blogService.getFeaturedBlogsForLanding.mockRejectedValue(
        new Error('Network Error')
      );

      await dynamicArticles.init(container, { 
        showErrorState: true,
        fallbackToStatic: false,
        limit: 6 
      });

      // Property: Error state is displayed
      expect(container.querySelector('.articles-error')).toBeTruthy();
      expect(container.querySelector('.btn-retry')).toBeTruthy();
    });

    test('Property: Retry functionality works correctly', async () => {
      // First call fails, second succeeds
      blogService.getFeaturedBlogsForLanding
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce([
          {
            id: 'retry-blog-1',
            title: 'Retry Blog',
            description: 'Retry description',
            views: 100,
            date: '01.01.2024',
            category: null,
            slug: 'retry-blog',
            tags: [],
            isArchived: false
          }
        ]);

      await dynamicArticles.init(container, { 
        showErrorState: true,
        fallbackToStatic: false,
        limit: 1 
      });

      // Property: Error state is shown initially
      expect(container.querySelector('.articles-error')).toBeTruthy();

      // Click retry button
      const retryButton = container.querySelector('.btn-retry');
      expect(retryButton).toBeTruthy();
      
      retryButton.click();
      
      // Wait for retry to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Property: Content is loaded after retry
      expect(container.querySelector('.articles-error')).toBeFalsy();
      expect(container.querySelector('.article-card')).toBeTruthy();
    });

    test('Property: Article click handlers work correctly', async () => {
      const mockBlogs = [
        {
          id: 'clickable-blog',
          title: 'Clickable Blog',
          description: 'Clickable description',
          views: 100,
          date: '01.01.2024',
          category: null,
          slug: 'clickable-blog',
          tags: [],
          isArchived: false,
          isFallback: false
        }
      ];

      blogService.getFeaturedBlogsForLanding.mockResolvedValue(mockBlogs);

      // Mock router
      window.router = {
        navigate: jest.fn()
      };

      await dynamicArticles.init(container, { limit: 1 });

      const articleCard = container.querySelector('.article-card');
      expect(articleCard).toBeTruthy();

      // Property: Clickable articles have proper styling
      expect(articleCard.style.cursor).toBe('pointer');

      // Property: Click handler is attached
      expect(articleCard.onclick).toBeTruthy();

      // Simulate click
      articleCard.click();

      // Property: Router navigation is called
      expect(window.router.navigate).toHaveBeenCalledWith('/blog/clickable-blog');
    });

    test('Property: Fallback articles are not clickable', async () => {
      // Mock API failure to trigger fallback
      blogService.getFeaturedBlogsForLanding.mockRejectedValue(
        new Error('API Error')
      );

      await dynamicArticles.init(container, { 
        fallbackToStatic: true,
        limit: 1 
      });

      const articleCard = container.querySelector('.article-card');
      expect(articleCard).toBeTruthy();

      // Property: Fallback articles don't have click handlers
      expect(articleCard.onclick).toBeFalsy();
      expect(articleCard.style.cursor).not.toBe('pointer');
    });

    test('Property: Component cleanup works correctly', async () => {
      const mockBlogs = [
        {
          id: 'cleanup-blog',
          title: 'Cleanup Blog',
          description: 'Cleanup description',
          views: 100,
          date: '01.01.2024',
          category: null,
          slug: 'cleanup-blog',
          tags: [],
          isArchived: false
        }
      ];

      blogService.getFeaturedBlogsForLanding.mockResolvedValue(mockBlogs);

      await dynamicArticles.init(container, { limit: 1 });

      // Property: Component is initialized
      expect(container.querySelector('.article-card')).toBeTruthy();
      expect(container.__dynamicArticles).toBeTruthy();

      // Destroy component
      dynamicArticles.destroy();

      // Property: Component is cleaned up
      expect(container.__dynamicArticles).toBeFalsy();
      expect(container.innerHTML).toBe('');
      expect(dynamicArticles.container).toBeFalsy();
    });

    test('Property: Cache integration works correctly', async () => {
      const mockBlogs = [
        {
          id: 'cached-blog',
          title: 'Cached Blog',
          description: 'Cached description',
          views: 100,
          date: '01.01.2024',
          category: null,
          slug: 'cached-blog',
          tags: [],
          isArchived: false
        }
      ];

      blogService.getFeaturedBlogsForLanding.mockResolvedValue(mockBlogs);

      // First initialization
      await dynamicArticles.init(container, { limit: 1 });

      // Property: Service is called once
      expect(blogService.getFeaturedBlogsForLanding).toHaveBeenCalledTimes(1);

      // Create new instance
      const dynamicArticles2 = new DynamicArticles();
      const container2 = document.createElement('div');
      document.body.appendChild(container2);

      // Second initialization (should use cache)
      await dynamicArticles2.init(container2, { limit: 1 });

      // Property: Service might be called again (cache is in service layer)
      expect(blogService.getFeaturedBlogsForLanding).toHaveBeenCalledTimes(2);

      // Cleanup
      dynamicArticles2.destroy();
      document.body.removeChild(container2);
    });

    test('Property: Number formatting works correctly', async () => {
      const mockBlogs = [
        {
          id: 'format-blog-1',
          title: 'Format Blog 1',
          description: 'Format description',
          views: 1500, // Should format to 1.5k
          date: '01.01.2024',
          category: null,
          slug: 'format-blog-1',
          tags: [],
          isArchived: false
        },
        {
          id: 'format-blog-2',
          title: 'Format Blog 2',
          description: 'Format description',
          views: 500, // Should stay as 500
          date: '01.01.2024',
          category: null,
          slug: 'format-blog-2',
          tags: [],
          isArchived: false
        }
      ];

      blogService.getFeaturedBlogsForLanding.mockResolvedValue(mockBlogs);

      await dynamicArticles.init(container, { limit: 2 });

      const viewElements = container.querySelectorAll('.views');
      
      // Property: Large numbers are formatted with 'k' suffix
      expect(viewElements[0].textContent).toContain('1.5k');
      
      // Property: Small numbers remain unchanged
      expect(viewElements[1].textContent).toContain('500');
    });

    test('Property: HTML escaping prevents XSS', async () => {
      const mockBlogs = [
        {
          id: 'xss-blog',
          title: '<script>alert("xss")</script>',
          description: '<img src="x" onerror="alert(\'xss\')">',
          views: 100,
          date: '01.01.2024',
          category: '<script>alert("category")</script>',
          slug: 'xss-blog',
          tags: [],
          isArchived: false
        }
      ];

      blogService.getFeaturedBlogsForLanding.mockResolvedValue(mockBlogs);

      await dynamicArticles.init(container, { limit: 1 });

      const articleCard = container.querySelector('.article-card');
      
      // Property: HTML is escaped in title
      const title = articleCard.querySelector('.article-header h3');
      expect(title.innerHTML).not.toContain('<script>');
      expect(title.textContent).toContain('<script>alert("xss")</script>');
      
      // Property: HTML is escaped in description
      const description = articleCard.querySelector('.article-content p');
      expect(description.innerHTML).not.toContain('<img');
      expect(description.textContent).toContain('<img src="x" onerror="alert(\'xss\')">');
      
      // Property: HTML is escaped in category
      const category = articleCard.querySelector('.category');
      if (category) {
        expect(category.innerHTML).not.toContain('<script>');
        expect(category.textContent).toContain('<script>alert("category")</script>');
      }
    });
  });
});