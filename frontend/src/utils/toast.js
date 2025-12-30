/**
 * Production-ready toast notification system with enhanced security and accessibility
 */

import { escapeHtml, safeSetInnerHTML } from './security.js';
import { logger } from './logger.js';
import { t } from './i18n.js';

// Toast types and their configurations
const TOAST_TYPES = {
  success: {
    icon: '✓',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
    </svg>`,
    className: 'toast-success',
    duration: 3000,
    color: '#10B981',
    bgColor: '#ECFDF5'
  },
  error: {
    icon: '✕',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
    </svg>`,
    className: 'toast-error',
    duration: 5000,
    color: '#EF4444',
    bgColor: '#FEF2F2',
    showClose: false
  },
  warning: {
    icon: '⚠',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
    </svg>`,
    className: 'toast-warning',
    duration: 4000,
    color: '#F59E0B',
    bgColor: '#FFFBEB'
  },
  info: {
    icon: 'ℹ',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
    </svg>`,
    className: 'toast-info',
    duration: 3000,
    color: '#3B82F6',
    bgColor: '#EFF6FF'
  }
};

class ToastManager {
  constructor() {
    this.toasts = new Map();
    this.container = null;
    this.maxToasts = 5;
    this.toastIdCounter = 0;
    this.setupContainer();
    this.injectStyles();
  }

  /**
   * Setup toast container with proper accessibility
   */
  setupContainer() {
    // Remove existing container if any
    const existing = document.getElementById('toast-container');
    if (existing) {
      existing.remove();
    }

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    this.container.className = 'toast-container';

    // Position container
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 11000;
      max-width: 400px;
      width: 100%;
      pointer-events: none;
    `;

    document.body.appendChild(this.container);
  }

  /**
   * Inject CSS styles for toasts
   */
  injectStyles() {
    const styleId = 'toast-styles';

    // Remove existing styles
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .toast-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .toast-notification {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        max-width: 100%;
        word-wrap: break-word;
        position: relative;
      }

      .toast-notification.show {
        opacity: 1;
        transform: translateX(0);
      }

      .toast-notification.hide {
        opacity: 0;
        transform: translateX(100%);
      }

      .toast-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-right: 12px;
        margin-top: 2px;
      }

      .toast-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
        color: #374151;
        font-weight: 500;
      }

      .toast-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        border: none;
        background: none;
        cursor: pointer;
        opacity: 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: opacity 0.2s;
      }

      .toast-close:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
      }

      .toast-close:focus {
        outline: 2px solid currentColor;
        outline-offset: 1px;
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: currentColor;
        border-radius: 0 0 8px 8px;
        opacity: 0.3;
        animation: toast-progress linear;
      }

      @keyframes toast-progress {
        from { width: 100%; }
        to { width: 0%; }
      }

      .toast-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .toast-action {
        padding: 4px 12px;
        border: 1px solid currentColor;
        background: transparent;
        color: currentColor;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .toast-action:hover {
        background: currentColor;
        color: white;
      }

      /* Responsive design */
      @media (max-width: 480px) {
        .toast-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .toast-notification {
          padding: 12px;
        }

        .toast-message {
          font-size: 13px;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .toast-notification {
          border-width: 2px;
          border-color: currentColor;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .toast-notification {
          transition: opacity 0.2s;
        }

        .toast-notification.show {
          transform: none;
        }

        .toast-progress {
          animation: none;
          width: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Duration in ms (0 for persistent)
   * @param {Array} actions - Optional action buttons
   * @returns {Object} - Toast control object
   */
  show(message, type = 'info', duration = null, actions = []) {
    try {
      if (!this.container || !document.body.contains(this.container)) {
        this.setupContainer();
      }
      if (!document.getElementById('toast-styles')) {
        this.injectStyles();
      }
      // Validate inputs
      if (!message || typeof message !== 'string') {
        logger.warn('Invalid toast message:', message);
        return null;
      }

      if (!TOAST_TYPES[type]) {
        logger.warn('Invalid toast type:', type);
        type = 'info';
      }

      // Sanitize message
      const sanitizedMessage = escapeHtml(message);

      // Get toast configuration
      const config = TOAST_TYPES[type];
      const toastDuration = duration !== null ? duration : config.duration;

      // Limit number of toasts
      if (this.toasts.size >= this.maxToasts) {
        const oldestToast = this.toasts.keys().next().value;
        this.remove(oldestToast);
      }

      // Generate unique ID
      const toastId = `toast-${++this.toastIdCounter}`;

      // Create toast element
      const toast = document.createElement('div');
      toast.id = toastId;
      toast.className = `toast-notification ${config.className}`;
      toast.setAttribute('role', 'alert');
      toast.style.color = config.color;
      toast.style.backgroundColor = config.bgColor;

      // Build toast content
      let toastContent = `
        <div class="toast-icon">${config.iconSvg}</div>
        <div class="toast-message">${sanitizedMessage}</div>
      `;
      if (config.showClose !== false) {
        toastContent += `
          <button class="toast-close" aria-label="${t('common.close') || 'Close'}" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M13 1L1 13M1 1l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        `;
      }

      // Add progress bar for timed toasts
      if (toastDuration > 0) {
        toastContent += `<div class="toast-progress" style="animation-duration: ${toastDuration}ms;"></div>`;
      }

      // Add action buttons if provided
      if (actions && actions.length > 0) {
        const actionsHtml = actions.map(action => {
          const sanitizedLabel = escapeHtml(action.label || 'Action');
          return `<button class="toast-action" data-action="${escapeHtml(action.id)}">${sanitizedLabel}</button>`;
        }).join('');

        toastContent += `<div class="toast-actions">${actionsHtml}</div>`;
      }

      safeSetInnerHTML(toast, toastContent);

      // Add event listeners
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.remove(toastId));
      }

      // Add action button listeners
      actions.forEach(action => {
        const actionBtn = toast.querySelector(`[data-action="${escapeHtml(action.id)}"]`);
        if (actionBtn && action.handler) {
          actionBtn.addEventListener('click', () => {
            action.handler();
            if (action.closeOnClick !== false) {
              this.remove(toastId);
            }
          });
        }
      });

      // Add to container
      this.container.appendChild(toast);

      // Store toast reference
      const toastData = {
        element: toast,
        timeout: null,
        type,
        message: sanitizedMessage,
        createdAt: Date.now()
      };

      this.toasts.set(toastId, toastData);

      // Trigger show animation
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      // Set auto-remove timeout
      if (toastDuration > 0) {
        toastData.timeout = setTimeout(() => {
          this.remove(toastId);
        }, toastDuration);
      }

      logger.debug('Toast shown:', { id: toastId, type, message: sanitizedMessage });

      // Return control object
      return {
        id: toastId,
        remove: () => this.remove(toastId),
        update: (newMessage) => this.update(toastId, newMessage)
      };
    } catch (error) {
      logger.error('Error showing toast:', error);
      // Fallback to alert in case of critical error
      if (window.confirm) {
        alert(message);
      }
      return null;
    }
  }

  /**
   * Remove a specific toast
   * @param {string} toastId - Toast ID to remove
   */
  remove(toastId) {
    const toastData = this.toasts.get(toastId);
    if (!toastData) return;

    const { element, timeout } = toastData;

    // Clear timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // Animate out
    element.classList.add('hide');

    // Remove from DOM after animation
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toasts.delete(toastId);
    }, 300);

    logger.debug('Toast removed:', toastId);
  }

  /**
   * Update toast message
   * @param {string} toastId - Toast ID
   * @param {string} newMessage - New message
   */
  update(toastId, newMessage) {
    const toastData = this.toasts.get(toastId);
    if (!toastData) return;

    const messageElement = toastData.element.querySelector('.toast-message');
    if (messageElement) {
      const sanitizedMessage = escapeHtml(newMessage);
      messageElement.textContent = sanitizedMessage;
      toastData.message = sanitizedMessage;
    }
  }

  /**
   * Remove all toasts
   */
  removeAll() {
    for (const [toastId] of this.toasts) {
      this.remove(toastId);
    }
  }

  /**
   * Get all active toasts
   * @returns {Array} - Array of toast data
   */
  getAll() {
    return Array.from(this.toasts.entries()).map(([id, data]) => ({
      id,
      type: data.type,
      message: data.message,
      createdAt: data.createdAt
    }));
  }
}

// Create global toast manager instance
const toastManager = new ToastManager();

// Export convenience functions
export const showToast = (message, type = 'info', duration = null, actions = []) =>
  toastManager.show(message, type, duration, actions);

export const showSuccessToast = (message, duration = null) =>
  toastManager.show(message, 'success', duration);

export const showErrorToast = (message, duration = null) =>
  toastManager.show(message, 'error', duration);

export const showWarningToast = (message, duration = null) =>
  toastManager.show(message, 'warning', duration);

export const showInfoToast = (message, duration = null) =>
  toastManager.show(message, 'info', duration);

export const removeAllToasts = () => toastManager.removeAll();

export const getAllToasts = () => toastManager.getAll();

// Export the manager for advanced usage
export { toastManager };
