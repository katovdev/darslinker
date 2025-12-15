import blogService from '../services/blog.service.js';
import realTimeBlogService from '../services/real-time-blog.service.js';

/**
 * Dynamic Articles Component
 * Replaces hardcoded articles with dynamic blog content from API
 */
class DynamicArticles {
  constructor() {
    this.isLoading = false;
    this.articles = [];
    this.error = null;
    this.realTimeSubscriptionId = null;
    this.lastUpdateNotification = null;
  }

  /**
   * Initialize the dynamic articles component
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  async init(container, options = {}) {
    this.container = container;
    this.options = {
      limit: 6,
      showLoadingState: true,
      showErrorState: true,
      fallbackToStatic: true,
      enableRealTime: true,
      showUpdateNotifications: true,
      ...options
    };

    await this.loadArticles();
    this.render();
    
    // Setup real-time updates if enabled
    if (this.options.enableRealTime) {
      this.setupRealTimeUpdates();
    }
  }

  /**
   * Load articles from the blog service
   */
  async loadArticles() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.error = null;

    try {
      this.articles = await blogService.getFeaturedBlogsForLanding(this.options.limit);
    } catch (error) {
      console.error('Failed to load articles:', error);
      this.error = error;
      
      if (this.options.fallbackToStatic) {
        this.articles = blogService.getFallbackBlogs(this.options.limit);
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render the articles section
   */
  render() {
    if (!this.container) return;

    if (this.isLoading && this.options.showLoadingState) {
      this.renderLoadingState();
      return;
    }

    if (this.error && !this.articles.length && this.options.showErrorState) {
      this.renderErrorState();
      return;
    }

    if (!this.error && this.articles.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.renderArticles();
  }

  /**
   * Render loading state
   */
  renderLoadingState() {
    const loadingContent = blogService.getLoadingStateContent();
    
    this.container.innerHTML = `
      <div class="articles-loading">
        <div class="loading-container">
          ${loadingContent.showSpinner ? '<div class="loading-spinner"></div>' : ''}
          <div class="loading-text">
            <h3>${loadingContent.title}</h3>
            <p>${loadingContent.description}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render error state
   */
  renderErrorState() {
    const errorContent = blogService.getErrorStateContent(this.error);
    
    this.container.innerHTML = `
      <div class="articles-error">
        <div class="error-icon">${errorContent.icon}</div>
        <h3>${errorContent.title}</h3>
        <p>${errorContent.description}</p>
        <button class="btn-retry" onclick="this.parentElement.parentElement.__dynamicArticles?.reload()">
          ${errorContent.actionText}
        </button>
      </div>
    `;
  }

  /**
   * Render empty state when no articles are available
   */
  renderEmptyState() {
    const emptyContent = blogService.getEmptyStateContent();
    
    this.container.innerHTML = `
      <div class="articles-empty">
        <div class="empty-icon">${emptyContent.icon}</div>
        <h3>${emptyContent.title}</h3>
        <p>${emptyContent.description}</p>
        <button class="btn-retry" onclick="this.parentElement.parentElement.__dynamicArticles?.reload()">
          ${emptyContent.actionText}
        </button>
      </div>
    `;
  }

  /**
   * Render articles grid
   */
  renderArticles() {
    const articlesHTML = this.articles.map((article, index) => 
      this.renderArticleCard(article, index)
    ).join('');

    this.container.innerHTML = `
      <div class="articles-grid">
        ${this.renderDecorations()}
        ${articlesHTML}
      </div>
    `;

    // Store reference for reload functionality
    this.container.__dynamicArticles = this;
  }

  /**
   * Render individual article card
   * @param {Object} article - Article data
   * @param {number} index - Article index
   * @returns {string} Article card HTML
   */
  renderArticleCard(article, index) {
    const cardClass = this.getCardClass(index);
    const isClickable = !article.isFallback;
    const clickHandler = isClickable ? `onclick="window.router?.navigate('/blog/${article.id}'); return false;"` : '';
    const cursorStyle = isClickable ? 'cursor: pointer;' : '';

    return `
      <div class="article-card ${cardClass}" ${clickHandler} style="${cursorStyle}">
        <div class="article-header">
          <h3>${this.escapeHtml(article.title)}</h3>
        </div>
        <div class="article-content">
          <p>${this.escapeHtml(article.description)}</p>
        </div>
        <div class="article-meta">
          <div class="article-stats">
            <span class="views">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              ${this.formatNumber(article.views)}
            </span>
            <span class="date">${article.date}</span>
          </div>
          ${article.isFallback ? '<span class="fallback-indicator" title="Ma\'lumot yuklanmadi">⚠</span>' : ''}
        </div>
      </div>
    `;
  }

  /**
   * Get CSS class for article card based on index
   * @param {number} index - Article index
   * @returns {string} CSS class
   */
  getCardClass(index) {
    switch (index) {
      case 0:
        return 'samarali-dars-card';
      case 5:
        return 'oxirgi-dars-card';
      default:
        return '';
    }
  }

  /**
   * Render decorative elements
   * @returns {string} Decorations HTML
   */
  renderDecorations() {
    return `
      <div class="samarali-dars-decoration">
        <img src="/images/0010 1.png" alt="Samarali Dars Decoration" class="samarali-dars-image">
      </div>
      <div class="oxirgi-dars-decoration">
        <img src="/images/0005 1.png" alt="Oxirgi Dars Decoration" class="oxirgi-dars-image">
      </div>
    `;
  }

  /**
   * Format number for display
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Reload articles
   */
  async reload() {
    await this.loadArticles();
    this.render();
  }

  /**
   * Update articles with new data
   * @param {Array} newArticles - New articles data
   */
  updateArticles(newArticles) {
    this.articles = newArticles;
    this.error = null;
    this.render();
  }

  /**
   * Setup real-time updates
   */
  setupRealTimeUpdates() {
    if (this.realTimeSubscriptionId) return;

    this.realTimeSubscriptionId = `dynamic-articles-${Date.now()}`;
    
    realTimeBlogService.subscribe(
      this.realTimeSubscriptionId,
      this.handleRealTimeUpdate.bind(this),
      { immediate: false }
    );
  }

  /**
   * Handle real-time content updates
   * @param {Object} update - Update data
   */
  async handleRealTimeUpdate(update) {
    try {
      switch (update.type) {
        case 'content-updated':
          if (this.options.showUpdateNotifications) {
            this.showUpdateNotification();
          }
          this.updateArticles(update.data);
          break;
          
        case 'content-loaded':
          // Initial load, update silently
          this.updateArticles(update.data);
          break;
          
        case 'manual-update':
          if (this.options.showUpdateNotifications) {
            this.showUpdateNotification('Yangi maqolalar qo\'shildi!');
          }
          this.updateArticles(update.data);
          break;
          
        case 'error':
          console.warn('Real-time update error:', update.error);
          break;
      }
    } catch (error) {
      console.error('Error handling real-time update:', error);
    }
  }

  /**
   * Show update notification to user
   * @param {string} message - Custom message
   */
  showUpdateNotification(message = 'Maqolalar yangilandi!') {
    // Remove existing notification
    this.hideUpdateNotification();

    const notification = document.createElement('div');
    notification.className = 'articles-update-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">🔄</span>
        <span class="notification-text">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Insert notification above articles
    if (this.container && this.container.parentElement) {
      this.container.parentElement.insertBefore(notification, this.container);
      this.lastUpdateNotification = notification;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideUpdateNotification();
      }, 5000);
    }
  }

  /**
   * Hide update notification
   */
  hideUpdateNotification() {
    if (this.lastUpdateNotification && this.lastUpdateNotification.parentElement) {
      this.lastUpdateNotification.parentElement.removeChild(this.lastUpdateNotification);
      this.lastUpdateNotification = null;
    }
  }

  /**
   * Force real-time update check
   */
  async forceUpdateCheck() {
    if (this.realTimeSubscriptionId) {
      await realTimeBlogService.forceUpdate();
    }
  }

  /**
   * Enable/disable real-time updates
   * @param {boolean} enabled - Whether to enable real-time updates
   */
  setRealTimeEnabled(enabled) {
    if (enabled && !this.realTimeSubscriptionId) {
      this.setupRealTimeUpdates();
    } else if (!enabled && this.realTimeSubscriptionId) {
      realTimeBlogService.unsubscribe(this.realTimeSubscriptionId);
      this.realTimeSubscriptionId = null;
    }
  }

  /**
   * Get real-time update status
   * @returns {Object} Status information
   */
  getRealTimeStatus() {
    return {
      enabled: !!this.realTimeSubscriptionId,
      subscriptionId: this.realTimeSubscriptionId,
      serviceStatus: realTimeBlogService.getStatus()
    };
  }

  /**
   * Destroy the component
   */
  destroy() {
    // Cleanup real-time subscription
    if (this.realTimeSubscriptionId) {
      realTimeBlogService.unsubscribe(this.realTimeSubscriptionId);
      this.realTimeSubscriptionId = null;
    }

    // Hide any notifications
    this.hideUpdateNotification();

    if (this.container) {
      this.container.__dynamicArticles = null;
      this.container.innerHTML = '';
    }
    this.container = null;
    this.articles = [];
    this.error = null;
  }
}

/**
 * Initialize dynamic articles in the landing page
 * @param {string} containerSelector - CSS selector for container
 * @param {Object} options - Configuration options
 * @returns {Promise<DynamicArticles>} Dynamic articles instance
 */
export async function initDynamicArticles(containerSelector, options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Dynamic articles container not found:', containerSelector);
    return null;
  }

  const dynamicArticles = new DynamicArticles();
  await dynamicArticles.init(container, options);
  return dynamicArticles;
}

/**
 * Replace static articles with dynamic ones
 * @param {Object} options - Configuration options
 * @returns {Promise<DynamicArticles>} Dynamic articles instance
 */
export async function replaceLandingArticles(options = {}) {
  // Find the articles grid container
  const articlesGrid = document.querySelector('.articles-section .articles-grid');
  if (!articlesGrid) {
    console.warn('Articles grid not found, cannot replace with dynamic content');
    return null;
  }

  return await initDynamicArticles('.articles-section .articles-grid', {
    limit: 6,
    showLoadingState: true,
    showErrorState: true,
    fallbackToStatic: true,
    ...options
  });
}

export default DynamicArticles;