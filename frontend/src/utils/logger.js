/**
 * Production-ready logger utility
 * Automatically disables console logs in production environment
 */

class Logger {
  constructor() {
    // Detect environment
    this.isDevelopment = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.search.includes('debug=true');

    this.isProduction = !this.isDevelopment;
  }

  log(...args) {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  error(...args) {
    if (this.isDevelopment) {
      console.error(...args);
    } else {
      // In production, send errors to monitoring service
      this.sendToMonitoring('error', args);
    }
  }

  warn(...args) {
    if (this.isDevelopment) {
      console.warn(...args);
    } else {
      this.sendToMonitoring('warn', args);
    }
  }

  info(...args) {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  debug(...args) {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }

  // Send critical errors to monitoring service in production
  sendToMonitoring(level, args) {
    try {
      // This would integrate with Sentry, LogRocket, etc.
      const errorData = {
        level,
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      // For now, store in sessionStorage for later analysis
      const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');
      errors.push(errorData);

      // Keep only last 50 errors to prevent memory issues
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }

      sessionStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      // Fail silently in production
    }
  }

  // Method to retrieve errors for debugging
  getStoredErrors() {
    return JSON.parse(sessionStorage.getItem('app_errors') || '[]');
  }

  // Clear stored errors
  clearErrors() {
    sessionStorage.removeItem('app_errors');
  }
}

export const logger = new Logger();

// For backward compatibility during migration
export const log = (...args) => logger.log(...args);
export const error = (...args) => logger.error(...args);
export const warn = (...args) => logger.warn(...args);
export const info = (...args) => logger.info(...args);
export const debug = (...args) => logger.debug(...args);