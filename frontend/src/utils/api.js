import { config } from './config.js';
import { logger } from './logger.js';
import { validateInput, generateCSRFToken, validateCSRFToken } from './security.js';
import { errorHandler, ErrorTypes, ErrorSeverity } from './errorHandler.js';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseUrl;
    this.defaultTimeout = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second base delay
    this.activeRequests = new Map();
  }

  /**
   * Main request method with enhanced security and error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - API response
   */
  async request(endpoint, options = {}) {
    // Generate request ID for tracking
    const requestId = this.generateRequestId();
    const url = `${this.baseURL}${endpoint}`;

    // Validate endpoint
    if (!this.isValidEndpoint(endpoint)) {
      throw new Error('Invalid API endpoint');
    }

    // Prepare request options
    const requestOptions = this.prepareRequestOptions(options);

    // Add request to active requests for cancellation support
    const controller = new AbortController();
    requestOptions.signal = controller.signal;
    this.activeRequests.set(requestId, controller);

    try {
      logger.debug(`API Request [${requestId}]:`, { url, options: requestOptions });

      const response = await this.executeRequest(url, requestOptions);
      const data = await this.parseResponse(response);

      logger.debug(`API Response [${requestId}]:`, { status: response.status, data });

      return data;
    } catch (error) {
      const enhancedError = this.enhanceError(error, endpoint, options);

      // Handle error through error handler
      errorHandler.handleError(
        enhancedError,
        this.getErrorType(enhancedError),
        this.getErrorSeverity(enhancedError),
        { endpoint, requestId, retryFunction: () => this.request(endpoint, options) }
      );

      throw enhancedError;
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Execute request with timeout and retry logic
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} - Fetch response
   */
  async executeRequest(url, options) {
    const timeout = options.timeout || this.defaultTimeout;

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    // Execute request with retry logic
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await Promise.race([
          fetch(url, options),
          timeoutPromise
        ]);

        // If response is ok or non-retryable error, return
        if (response.ok || !this.isRetryableStatus(response.status)) {
          return response;
        }

        // If this was the last attempt, return the response anyway
        if (attempt === this.retryAttempts) {
          return response;
        }

        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      } catch (error) {
        // If this was the last attempt, throw the error
        if (attempt === this.retryAttempts) {
          throw error;
        }

        // If error is not retryable, throw immediately
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Wait before retry
        await this.delay(this.retryDelay * attempt);
        logger.warn(`Request retry attempt ${attempt} for ${url}:`, error.message);
      }
    }
  }

  /**
   * Prepare request options with security headers
   * @param {Object} options - Original options
   * @returns {Object} - Enhanced options
   */
  prepareRequestOptions(options) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    };

    // Skip CSRF token for now to avoid CORS issues
    // TODO: Configure CORS on backend to allow X-CSRF-Token header

    // Add authentication if available
    const authHeaders = this.getAuthHeaders();

    // Validate and sanitize request body
    if (options.body && typeof options.body === 'string') {
      try {
        const bodyData = JSON.parse(options.body);
        const sanitizedBody = this.sanitizeRequestBody(bodyData);
        options.body = JSON.stringify(sanitizedBody);
      } catch (e) {
        logger.warn('Failed to parse request body for sanitization:', e);
      }
    }

    return {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...authHeaders,
        ...options.headers,
      },
    };
  }

  /**
   * Parse and validate API response
   * @param {Response} response - Fetch response
   * @returns {Promise} - Parsed data
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorData;

      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
      } else {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }

      // Handle specific error types
      if (response.status === 401) {
        this.handleAuthenticationError();
      } else if (response.status === 403) {
        errorData.type = 'authorization';
      } else if (response.status === 404) {
        errorData.type = 'not_found';
      } else if (response.status >= 500) {
        errorData.type = 'server';
      } else if (response.status >= 400) {
        errorData.type = 'client';
      }

      const error = new Error(errorData.message || 'API request failed');
      error.status = response.status;
      error.data = errorData;
      error.type = errorData.type || 'unknown';

      throw error;
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  /**
   * Sanitize request body to prevent injection attacks
   * @param {Object} data - Request data
   * @returns {Object} - Sanitized data
   */
  sanitizeRequestBody(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        const validation = validateInput(value, 'text');
        sanitized[key] = validation.sanitized;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeRequestBody(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Handle authentication errors
   */
  handleAuthenticationError() {
    // Clear authentication data
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('csrf_token');

    // Redirect to login after delay
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 2000);
  }

  /**
   * Check if endpoint is valid and safe
   * @param {string} endpoint - API endpoint
   * @returns {boolean} - Is valid
   */
  isValidEndpoint(endpoint) {
    // Basic validation - endpoint should start with /
    if (!endpoint.startsWith('/')) {
      return false;
    }

    // Check for path traversal attempts
    if (endpoint.includes('..') || endpoint.includes('//')) {
      return false;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(endpoint));
  }

  /**
   * Generate unique request ID
   * @returns {string} - Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if HTTP status is retryable
   * @param {number} status - HTTP status code
   * @returns {boolean} - Is retryable
   */
  isRetryableStatus(status) {
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error object
   * @returns {boolean} - Is retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'network error',
      'timeout',
      'fetch error',
      'connection failed'
    ];

    return retryableErrors.some(type =>
      error.message.toLowerCase().includes(type)
    );
  }

  /**
   * Delay execution for retry
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhance error with additional context
   * @param {Error} error - Original error
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Error} - Enhanced error
   */
  enhanceError(error, endpoint, options) {
    error.endpoint = endpoint;
    error.method = options.method || 'GET';
    error.timestamp = new Date().toISOString();
    return error;
  }

  /**
   * Get error type for error handler
   * @param {Error} error - Error object
   * @returns {string} - Error type
   */
  getErrorType(error) {
    if (error.message.includes('timeout') || error.message.includes('network')) {
      return ErrorTypes.NETWORK;
    }
    if (error.status === 401) {
      return ErrorTypes.AUTHENTICATION;
    }
    if (error.status === 403) {
      return ErrorTypes.AUTHORIZATION;
    }
    if (error.status === 404) {
      return ErrorTypes.NOT_FOUND;
    }
    if (error.status >= 500) {
      return ErrorTypes.SERVER;
    }
    if (error.status >= 400) {
      return ErrorTypes.CLIENT;
    }
    return ErrorTypes.UNKNOWN;
  }

  /**
   * Get error severity for error handler
   * @param {Error} error - Error object
   * @returns {string} - Error severity
   */
  getErrorSeverity(error) {
    if (error.status >= 500) {
      return ErrorSeverity.HIGH;
    }
    if (error.status === 401 || error.status === 403) {
      return ErrorSeverity.HIGH;
    }
    if (error.message.includes('timeout')) {
      return ErrorSeverity.MEDIUM;
    }
    return ErrorSeverity.LOW;
  }

  /**
   * Cancel all active requests
   */
  cancelAllRequests() {
    for (const [requestId, controller] of this.activeRequests) {
      controller.abort();
      logger.debug(`Cancelled request: ${requestId}`);
    }
    this.activeRequests.clear();
  }

  // Auth endpoints
  async checkUser(identifier) {
    return this.request('/auth/check-user', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyRegistrationOtp(identifier, otp) {
    return this.request('/auth/verify-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp }),
    });
  }

  async resendRegistrationOtp(identifier) {
    const body = identifier.includes('@')
      ? { email: identifier }
      : { phone: identifier };

    return this.request('/auth/resend-registration-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(identifier, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  async changePassword(currentPassword, newPassword, confirmPassword) {
    const token = localStorage.getItem('accessToken');
    return this.request('/auth/change-password', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  }

  async logout() {
    const token = localStorage.getItem('accessToken');
    return this.request('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Teacher endpoints
  async getTeacherDashboard(teacherId) {
    return this.request(`/teachers/${teacherId}/dashboard`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getTeacherProfile(teacherId) {
    return this.request(`/teachers/${teacherId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async updateTeacherProfile(teacherId, profileData) {
    return this.request(`/teachers/${teacherId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
  }

  async createTeacherProfile(profileData) {
    return this.request('/teachers/create-profile', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
  }

  async getAllTeachers() {
    return this.request('/teachers', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  // Course endpoints
  async getCourses(teacherId = null) {
    const endpoint = teacherId ? `/courses?teacherId=${teacherId}` : '/courses';
    return this.request(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getCourse(courseId) {
    return this.request(`/courses/${courseId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(courseId, courseData) {
    return this.request(`/courses/${courseId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(courseId) {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  // Module endpoints
  async getModules(courseId) {
    return this.request(`/modules?courseId=${courseId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async createModule(moduleData) {
    return this.request('/modules', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(moduleData),
    });
  }

  async updateModule(moduleId, moduleData) {
    return this.request(`/modules/${moduleId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(moduleData),
    });
  }

  async deleteModule(moduleId) {
    return this.request(`/modules/${moduleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  // Lesson endpoints
  async getLessons(moduleId) {
    return this.request(`/lessons?moduleId=${moduleId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async createLesson(lessonData) {
    return this.request('/lessons', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(lessonId, lessonData) {
    return this.request(`/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(lessonId) {
    return this.request(`/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  // Assignment endpoints
  async getAssignments(courseId) {
    return this.request(`/assignments?courseId=${courseId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async createAssignment(assignmentData) {
    return this.request('/assignments', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
  }

  async updateAssignment(assignmentId, assignmentData) {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteAssignment(assignmentId) {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  // Sub-Admin API methods
  async createSubAdmin(teacherId, subAdminData) {
    return this.request(`/sub-admins/teachers/${teacherId}/sub-admins`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(subAdminData),
    });
  }

  async getTeacherSubAdmins(teacherId, queryParams = {}) {
    const params = new URLSearchParams(queryParams).toString();
    const url = `/sub-admins/teachers/${teacherId}/sub-admins${params ? `?${params}` : ''}`;
    return this.request(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getSubAdmin(subAdminId) {
    return this.request(`/sub-admins/${subAdminId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async updateSubAdmin(subAdminId, updateData) {
    return this.request(`/sub-admins/${subAdminId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
  }

  async updateSubAdminPassword(subAdminId, newPassword) {
    return this.request(`/sub-admins/${subAdminId}/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });
  }

  async deleteSubAdmin(subAdminId) {
    return this.request(`/sub-admins/${subAdminId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  async loginSubAdmin(phone, password) {
    return this.request('/sub-admins/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
  }

  async getSubAdminDashboard(subAdminId) {
    return this.request(`/sub-admins/${subAdminId}/dashboard`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }
}

export const apiService = new ApiService();