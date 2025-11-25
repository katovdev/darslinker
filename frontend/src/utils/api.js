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
}

export const apiService = new ApiService();