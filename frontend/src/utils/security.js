/**
 * Security utilities for preventing XSS attacks and data sanitization
 */

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Raw text to escape
 * @returns {string} - HTML-escaped text
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return text;

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize HTML content by removing dangerous elements and attributes
 * @param {string} html - HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';

  // Create a temporary DOM element
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // List of allowed tags (whitelist approach)
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'button', 'input', 'label', 'svg', 'path'
  ];

  // List of allowed attributes per tag
  const allowedAttributes = {
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'input': ['type', 'placeholder', 'value', 'id', 'class'],
    'button': ['type', 'id', 'class', 'onclick'],
    'div': ['id', 'class', 'style'],
    'span': ['id', 'class', 'style'],
    'svg': ['width', 'height', 'viewBox', 'fill'],
    'path': ['d', 'fill', 'stroke']
  };

  // Remove dangerous elements
  const dangerousElements = temp.querySelectorAll('script, object, embed, iframe, form');
  dangerousElements.forEach(el => el.remove());

  // Remove dangerous attributes from all elements
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(element => {
    const tagName = element.tagName.toLowerCase();

    // Remove if tag is not allowed
    if (!allowedTags.includes(tagName)) {
      element.remove();
      return;
    }

    // Remove dangerous attributes
    Array.from(element.attributes).forEach(attr => {
      const attrName = attr.name.toLowerCase();

      // Remove event handlers (onclick, onload, etc.)
      if (attrName.startsWith('on')) {
        element.removeAttribute(attrName);
        return;
      }

      // Remove javascript: URLs
      if (attr.value && attr.value.toLowerCase().includes('javascript:')) {
        element.removeAttribute(attrName);
        return;
      }

      // Check if attribute is allowed for this tag
      const allowedAttrs = allowedAttributes[tagName] || [];
      if (!allowedAttrs.includes(attrName) && !['id', 'class'].includes(attrName)) {
        element.removeAttribute(attrName);
      }
    });
  });

  return temp.innerHTML;
}

/**
 * Safe innerHTML setter that sanitizes content
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content to set
 */
export function safeSetInnerHTML(element, html) {
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error('Invalid element provided to safeSetInnerHTML');
  }

  const sanitizedHtml = sanitizeHtml(html);
  element.innerHTML = sanitizedHtml;
}

/**
 * Validate and sanitize user input
 * @param {string} input - User input to validate
 * @param {string} type - Type of validation ('email', 'phone', 'text', 'url')
 * @returns {Object} - {isValid: boolean, sanitized: string, error?: string}
 */
export function validateInput(input, type = 'text') {
  if (typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: 'Invalid input type' };
  }

  // Basic sanitization - remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0E-\x1F\x7F]/g, '');

  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(sanitized),
        sanitized: sanitized.toLowerCase().trim(),
        error: emailRegex.test(sanitized) ? undefined : 'Invalid email format'
      };

    case 'phone':
      // Remove all non-digits
      const phoneDigits = sanitized.replace(/\D/g, '');
      const isValidPhone = phoneDigits.length >= 9 && phoneDigits.length <= 15;
      return {
        isValid: isValidPhone,
        sanitized: phoneDigits,
        error: isValidPhone ? undefined : 'Invalid phone number'
      };

    case 'url':
      try {
        const url = new URL(sanitized);
        const isHttps = url.protocol === 'https:' || url.protocol === 'http:';
        return {
          isValid: isHttps,
          sanitized: url.toString(),
          error: isHttps ? undefined : 'Invalid URL'
        };
      } catch {
        return { isValid: false, sanitized: '', error: 'Invalid URL format' };
      }

    case 'text':
    default:
      // Basic text sanitization
      sanitized = sanitized.trim();
      const isValid = sanitized.length > 0 && sanitized.length <= 1000;
      return {
        isValid,
        sanitized,
        error: isValid ? undefined : 'Text must be between 1 and 1000 characters'
      };
  }
}

/**
 * Generate CSRF token for form submissions
 * @returns {string} - CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(16)).join('');
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} - Is token valid
 */
export function validateCSRFToken(token) {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
}

/**
 * Set CSRF token for session
 * @param {string} token - Token to store
 */
export function setCSRFToken(token) {
  sessionStorage.setItem('csrf_token', token);
}