import { config } from './config.js';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, mergedOptions);
      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors specially
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.message).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
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
}

export const apiService = new ApiService();