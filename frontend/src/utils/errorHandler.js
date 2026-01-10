/**
 * Comprehensive error handling and user feedback system
 */

import { logger } from './logger.js';
import { t } from './i18n.js';

/**
 * Error types for categorized handling
 */
export const ErrorTypes = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class ErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Setup network connectivity listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showToast(t('network.backOnline'), 'success');
      this.retryFailedRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showToast(t('network.offline'), 'warning', 5000);
    });
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, ErrorTypes.CLIENT, ErrorSeverity.HIGH);
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      logger.error('JavaScript error:', event.error);
      this.handleError(event.error, ErrorTypes.CLIENT, ErrorSeverity.HIGH);
    });
  }

  /**
   * Main error handling method
   * @param {Error|string} error - Error to handle
   * @param {string} type - Error type from ErrorTypes
   * @param {string} severity - Error severity from ErrorSeverity
   * @param {Object} context - Additional context about the error
   * @returns {Object} - Error handling result
   */
  handleError(error, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, context = {}) {
    try {
      const errorInfo = this.normalizeError(error);
      const errorData = {
        ...errorInfo,
        type,
        severity,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        online: this.isOnline
      };

      // Log error
      logger.error('Error handled:', errorData);

      // Determine user message and action
      const userFeedback = this.getUserFeedback(errorData);

      // Show user feedback
      if (userFeedback.showToUser) {
        this.showToast(userFeedback.message, userFeedback.type, userFeedback.duration);
      }

      // Handle offline errors
      if (!this.isOnline && type === ErrorTypes.NETWORK) {
        this.queueForRetry(errorData);
      }

      // Execute recovery action if available
      if (userFeedback.action) {
        this.executeRecoveryAction(userFeedback.action, errorData);
      }

      return {
        handled: true,
        userMessage: userFeedback.message,
        retry: userFeedback.action === 'retry'
      };
    } catch (handlingError) {
      logger.error('Error in error handler:', handlingError);
      this.showToast(t('errors.generalError'), 'error');
      return { handled: false };
    }
  }

  /**
   * Normalize error into consistent format
   * @param {Error|string|Object} error - Error to normalize
   * @returns {Object} - Normalized error
   */
  normalizeError(error) {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        stack: null,
        name: 'StringError'
      };
    }

    if (error && typeof error === 'object') {
      return {
        message: error.message || error.error || 'Unknown error',
        stack: error.stack || null,
        name: error.name || 'ObjectError',
        status: error.status || null,
        code: error.code || null
      };
    }

    return {
      message: 'Unknown error occurred',
      stack: null,
      name: 'UnknownError'
    };
  }

  /**
   * Get appropriate user feedback for error
   * @param {Object} errorData - Error data object
   * @returns {Object} - User feedback configuration
   */
  getUserFeedback(errorData) {
    const { type, severity, message, context } = errorData;

    switch (type) {
      case ErrorTypes.NETWORK:
        if (!this.isOnline) {
          return {
            message: t('errors.offline'),
            type: 'warning',
            duration: 0,
            showToUser: true,
            action: 'retry'
          };
        }
        return {
          message: t('errors.networkError'),
          type: 'error',
          duration: 5000,
          showToUser: true,
          action: 'retry'
        };

      case ErrorTypes.AUTHENTICATION:
        return {
          message: t('errors.authenticationError'),
          type: 'error',
          duration: 0,
          showToUser: true,
          action: 'redirect_login'
        };

      case ErrorTypes.AUTHORIZATION:
        return {
          message: t('errors.accessDenied'),
          type: 'warning',
          duration: 5000,
          showToUser: true,
          action: 'go_back'
        };

      case ErrorTypes.VALIDATION:
        return {
          message: message || t('errors.validationError'),
          type: 'warning',
          duration: 5000,
          showToUser: true,
          action: null
        };

      case ErrorTypes.NOT_FOUND:
        return {
          message: t('errors.notFound'),
          type: 'warning',
          duration: 5000,
          showToUser: true,
          action: 'go_back'
        };

      case ErrorTypes.SERVER:
        if (severity === ErrorSeverity.CRITICAL) {
          return {
            message: t('errors.serverError'),
            type: 'error',
            duration: 0,
            showToUser: true,
            action: 'retry'
          };
        }
        return {
          message: t('errors.temporaryError'),
          type: 'warning',
          duration: 5000,
          showToUser: true,
          action: 'retry'
        };

      default:
        if (severity === ErrorSeverity.CRITICAL) {
          return {
            message: t('errors.criticalError'),
            type: 'error',
            duration: 0,
            showToUser: true,
            action: 'reload'
          };
        }
        return {
          message: t('errors.generalError'),
          type: 'error',
          duration: 5000,
          showToUser: severity !== ErrorSeverity.LOW,
          action: null
        };
    }
  }

  /**
   * Execute recovery action
   * @param {string} action - Action to execute
   * @param {Object} errorData - Error data
   */
  executeRecoveryAction(action, errorData) {
    switch (action) {
      case 'retry':
        // Retry after 3 seconds
        setTimeout(() => {
          if (errorData.context.retryFunction) {
            errorData.context.retryFunction();
          }
        }, 3000);
        break;

      case 'redirect_login':
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        break;

      case 'go_back':
        setTimeout(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = '/';
          }
        }, 2000);
        break;

      case 'reload':
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        break;
    }
  }

  /**
   * Show toast notification
   * @param {string} message - Message to show
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Duration in ms (0 = persist)
   */
  showToast(message, type = 'info', duration = 5000) {
    // Import toast utility dynamically to avoid circular dependencies
    import('./toast.js').then(({ showToast }) => {
      showToast(message, type, duration);
    }).catch(() => {
      // Fallback to simple alert if toast fails
      console.warn('Toast system failed, using fallback alert');
      alert(message);
    });
  }

  /**
   * Queue failed request for retry when online
   * @param {Object} errorData - Error data to queue
   */
  queueForRetry(errorData) {
    if (this.errorQueue.length < 10) { // Limit queue size
      this.errorQueue.push(errorData);
    }
  }

  /**
   * Retry all failed requests when back online
   */
  async retryFailedRequests() {
    const queue = [...this.errorQueue];
    this.errorQueue = [];

    for (const errorData of queue) {
      try {
        if (errorData.context.retryFunction) {
          await errorData.context.retryFunction();
        }
      } catch (retryError) {
        logger.error('Retry failed:', retryError);
      }
    }
  }

  /**
   * Wrap async function with error handling
   * @param {Function} fn - Async function to wrap
   * @param {string} errorType - Error type for categorization
   * @param {Object} context - Additional context
   * @returns {Function} - Wrapped function
   */
  wrapAsync(fn, errorType = ErrorTypes.UNKNOWN, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        const enhancedContext = {
          ...context,
          retryFunction: () => fn(...args)
        };
        this.handleError(error, errorType, ErrorSeverity.MEDIUM, enhancedContext);
        throw error; // Re-throw for caller handling
      }
    };
  }
}

export const errorHandler = new ErrorHandler();

// Convenience functions
export const handleError = (error, type, severity, context) =>
  errorHandler.handleError(error, type, severity, context);

export const wrapAsync = (fn, errorType, context) =>
  errorHandler.wrapAsync(fn, errorType, context);
