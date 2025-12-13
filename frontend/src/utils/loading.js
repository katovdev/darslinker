/**
 * Loading states and error boundaries for better UX
 */

import { escapeHtml } from './security.js';
import { t } from './i18n.js';
import { logger } from './logger.js';

class LoadingManager {
  constructor() {
    this.activeLoaders = new Map();
    this.loadingIdCounter = 0;
  }

  /**
   * Show loading state in a specific container
   * @param {HTMLElement|string} container - Container element or selector
   * @param {Object} options - Loading options
   * @returns {Object} - Loading control object
   */
  show(container, options = {}) {
    try {
      // Get container element
      const element = typeof container === 'string'
        ? document.querySelector(container)
        : container;

      if (!element) {
        logger.warn('Loading container not found:', container);
        return null;
      }

      // Default options
      const config = {
        message: options.message || t('common.loading'),
        showSpinner: options.showSpinner !== false,
        overlay: options.overlay !== false,
        size: options.size || 'medium', // small, medium, large
        color: options.color || 'var(--primary-color)',
        backgroundColor: options.backgroundColor || 'rgba(255, 255, 255, 0.9)',
        ...options
      };

      // Generate unique loading ID
      const loadingId = `loading-${++this.loadingIdCounter}`;

      // Store original content
      const originalContent = element.innerHTML;
      const originalPosition = getComputedStyle(element).position;

      // Set relative positioning if needed for overlay
      if (config.overlay && originalPosition === 'static') {
        element.style.position = 'relative';
      }

      // Create loading HTML
      const loadingHTML = this.createLoadingHTML(config);

      // Add loading content
      if (config.overlay) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = loadingId;
        overlay.innerHTML = loadingHTML;
        element.appendChild(overlay);
      } else {
        // Replace content
        element.innerHTML = loadingHTML;
        element.setAttribute('data-loading-id', loadingId);
      }

      // Store loading state
      this.activeLoaders.set(loadingId, {
        element,
        originalContent,
        originalPosition,
        config,
        createdAt: Date.now()
      });

      logger.debug('Loading state shown:', { id: loadingId, container: element });

      // Return control object
      return {
        id: loadingId,
        hide: () => this.hide(loadingId),
        updateMessage: (newMessage) => this.updateMessage(loadingId, newMessage)
      };
    } catch (error) {
      logger.error('Error showing loading state:', error);
      return null;
    }
  }

  /**
   * Hide loading state
   * @param {string} loadingId - Loading ID to hide
   */
  hide(loadingId) {
    try {
      const loadingData = this.activeLoaders.get(loadingId);
      if (!loadingData) {
        logger.warn('Loading state not found:', loadingId);
        return;
      }

      const { element, originalContent, originalPosition, config } = loadingData;

      if (config.overlay) {
        // Remove overlay
        const overlay = document.getElementById(loadingId);
        if (overlay) {
          overlay.style.opacity = '0';
          setTimeout(() => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          }, 200);
        }

        // Restore original position if we changed it
        if (originalPosition === 'static') {
          element.style.position = '';
        }
      } else {
        // Restore original content
        element.innerHTML = originalContent;
        element.removeAttribute('data-loading-id');
      }

      // Remove from active loaders
      this.activeLoaders.delete(loadingId);

      logger.debug('Loading state hidden:', loadingId);
    } catch (error) {
      logger.error('Error hiding loading state:', error);
    }
  }

  /**
   * Update loading message
   * @param {string} loadingId - Loading ID
   * @param {string} newMessage - New message
   */
  updateMessage(loadingId, newMessage) {
    try {
      const loadingData = this.activeLoaders.get(loadingId);
      if (!loadingData) return;

      const messageElement = loadingData.config.overlay
        ? document.querySelector(`#${loadingId} .loading-message`)
        : loadingData.element.querySelector('.loading-message');

      if (messageElement) {
        messageElement.textContent = escapeHtml(newMessage);
      }
    } catch (error) {
      logger.error('Error updating loading message:', error);
    }
  }

  /**
   * Create loading HTML content
   * @param {Object} config - Loading configuration
   * @returns {string} - HTML string
   */
  createLoadingHTML(config) {
    const spinnerSize = {
      small: '20px',
      medium: '32px',
      large: '48px'
    }[config.size];

    const spinnerHTML = config.showSpinner ? `
      <div class="loading-spinner" style="
        width: ${spinnerSize};
        height: ${spinnerSize};
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-top: 3px solid ${config.color};
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px auto;
      "></div>
    ` : '';

    const containerStyle = config.overlay ? `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${config.backgroundColor};
      z-index: 1000;
      transition: opacity 0.2s ease;
    ` : `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    `;

    return `
      <div class="loading-container" style="${containerStyle}">
        ${spinnerHTML}
        <div class="loading-message" style="
          color: ${config.color};
          font-size: ${config.size === 'large' ? '16px' : '14px'};
          font-weight: 500;
          opacity: 0.8;
        ">
          ${escapeHtml(config.message)}
        </div>
      </div>
    `;
  }

  /**
   * Hide all active loading states
   */
  hideAll() {
    for (const [loadingId] of this.activeLoaders) {
      this.hide(loadingId);
    }
  }

  /**
   * Get all active loading states
   * @returns {Array} - Array of loading data
   */
  getAll() {
    return Array.from(this.activeLoaders.entries()).map(([id, data]) => ({
      id,
      element: data.element,
      createdAt: data.createdAt,
      config: data.config
    }));
  }
}

// Create global loading manager instance
const loadingManager = new LoadingManager();

// Add CSS for loading animations
function injectLoadingStyles() {
  const styleId = 'loading-styles';

  // Remove existing styles
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-overlay {
      pointer-events: auto;
    }

    .loading-container {
      user-select: none;
    }

    /* Responsive loading states */
    @media (max-width: 480px) {
      .loading-message {
        font-size: 13px !important;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .loading-spinner {
        animation-duration: 2s !important;
      }
    }
  `;

  document.head.appendChild(style);
}

// Inject styles on module load
injectLoadingStyles();

// Export convenience functions
export const showLoading = (container, options = {}) =>
  loadingManager.show(container, options);

export const hideLoading = (loadingId) =>
  loadingManager.hide(loadingId);

export const hideAllLoading = () =>
  loadingManager.hideAll();

export const updateLoadingMessage = (loadingId, message) =>
  loadingManager.updateMessage(loadingId, message);

// Export the manager for advanced usage
export { loadingManager };

/**
 * Error boundary utility for React-like error handling in vanilla JS
 */
class ErrorBoundary {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.options = {
      fallbackMessage: options.fallbackMessage || t('errors.generalError'),
      showRetry: options.showRetry !== false,
      onError: options.onError || null,
      onRetry: options.onRetry || null,
      ...options
    };

    this.originalContent = '';
    this.setupErrorHandling();
  }

  /**
   * Set up error handling for the container
   */
  setupErrorHandling() {
    if (!this.container) return;

    // Store original content
    this.originalContent = this.container.innerHTML;

    // Handle uncaught errors in this container
    this.container.addEventListener('error', (event) => {
      this.handleError(event.error);
    }, true);
  }

  /**
   * Handle errors and show fallback UI
   * @param {Error} error - Error that occurred
   */
  handleError(error) {
    logger.error('Error boundary caught error:', error);

    // Call error callback
    if (this.options.onError) {
      try {
        this.options.onError(error);
      } catch (callbackError) {
        logger.error('Error in error callback:', callbackError);
      }
    }

    // Show error UI
    this.showErrorUI(error);
  }

  /**
   * Show error UI
   * @param {Error} error - Error that occurred
   */
  showErrorUI(error) {
    const retryButton = this.options.showRetry ? `
      <button class="error-retry-btn" style="
        margin-top: 16px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
        ${t('common.retry')}
      </button>
    ` : '';

    const errorHTML = `
      <div class="error-boundary" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
        color: #6B7280;
      ">
        <div style="
          width: 48px;
          height: 48px;
          background: #FEE2E2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#DC2626">
            <path fill-rule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zM11 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm2 8a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        ">
          ${escapeHtml(this.options.fallbackMessage)}
        </div>
        <div style="
          font-size: 14px;
          color: #6B7280;
          max-width: 400px;
          line-height: 1.5;
        ">
          ${escapeHtml(t('errors.temporaryError'))}
        </div>
        ${retryButton}
      </div>
    `;

    this.container.innerHTML = errorHTML;

    // Add retry functionality
    if (this.options.showRetry) {
      const retryBtn = this.container.querySelector('.error-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this.retry());
      }
    }
  }

  /**
   * Retry operation
   */
  retry() {
    try {
      // Call retry callback
      if (this.options.onRetry) {
        this.options.onRetry();
      } else {
        // Default retry - restore original content
        this.container.innerHTML = this.originalContent;
      }
    } catch (error) {
      logger.error('Error during retry:', error);
      this.handleError(error);
    }
  }

  /**
   * Reset error boundary
   */
  reset() {
    this.container.innerHTML = this.originalContent;
  }
}

export { ErrorBoundary };