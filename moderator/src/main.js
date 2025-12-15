import './style.css';
import axios from 'axios';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('moderator_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Adding token to request:', config.url, 'Token exists:', !!token);
  } else {
    console.log('⚠️ No token found for request:', config.url);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    // Token expired or invalid, logout user
    localStorage.removeItem('moderator_authenticated');
    localStorage.removeItem('moderator_token');
    localStorage.removeItem('moderator_user');
    window.location.reload();
  }
  return Promise.reject(error);
});

// Global state
let currentEditingPost = null;

// Authentication Configuration
const VALID_CREDENTIALS = {
  phone: '+998 99 000 99 00',
  password: 'moderator_darslinker'
};

// Authentication System
class AuthSystem {
  constructor() {
    this.isAuthenticated = this.checkAuthStatus();
    this.init();
  }

  init() {
    // Force clear old tokens that might not have the status field
    const token = localStorage.getItem('moderator_token');
    if (token) {
      try {
        // Try to decode the token to check if it has status field
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.status) {
          console.log('🔄 Old token detected without status field, clearing...');
          this.forceLogout();
        }
      } catch (e) {
        console.log('🔄 Invalid token detected, clearing...');
        this.forceLogout();
      }
    }

    if (this.isAuthenticated) {
      this.showModeratorInterface();
    } else {
      this.showLoginPage();
    }
    this.setupLoginForm();
  }

  forceLogout() {
    localStorage.removeItem('moderator_authenticated');
    localStorage.removeItem('moderator_token');
    localStorage.removeItem('moderator_user');
    this.isAuthenticated = false;
  }

  checkAuthStatus() {
    const isAuth = localStorage.getItem('moderator_authenticated') === 'true';
    const hasToken = !!localStorage.getItem('moderator_token');
    
    console.log('🔍 Auth status check:', {
      isAuthenticated: isAuth,
      hasToken: hasToken,
      tokenLength: localStorage.getItem('moderator_token')?.length
    });
    
    // If authenticated but no token, clear auth status
    if (isAuth && !hasToken) {
      console.log('⚠️ Authenticated but no token found, clearing auth status');
      localStorage.removeItem('moderator_authenticated');
      return false;
    }
    
    return isAuth;
  }

  showLoginPage() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('moderator-interface').style.display = 'none';

    // Focus on phone input
    setTimeout(() => {
      const phoneInput = document.getElementById('phone-number');
      phoneInput.focus();
    }, 100);
  }

  showModeratorInterface() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('moderator-interface').style.display = 'block';
    // Initialize moderator app if not already initialized
    if (!window.moderatorApp) {
      window.moderatorApp = new ModeratorApp();
    }
  }

  setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const phoneInput = document.getElementById('phone-number');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('password-toggle');
    const eyeIcon = passwordToggle.querySelector('.eye-icon');
    const eyeOffIcon = passwordToggle.querySelector('.eye-off-icon');
    const errorDiv = document.getElementById('login-error');

    // Format phone input - new logic for separated input
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

      // Limit to 9 digits max
      if (value.length > 9) {
        value = value.substring(0, 9);
      }

      // Format the number without +998 prefix
      const formatted = this.formatPhoneNumberOnly(value);
      e.target.value = formatted;
    });

    // Password visibility toggle
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';

      if (isPassword) {
        // Show password
        passwordInput.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      } else {
        // Hide password
        passwordInput.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      }

      // Keep focus on input
      passwordInput.focus();
    });

    // Handle form submission
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullPhoneNumber = '+998 ' + phoneInput.value;
      this.handleLogin(fullPhoneNumber, passwordInput.value, errorDiv);
    });
  }

  formatPhoneNumber(value) {
    if (value.length === 0) return '+998 ';

    let formatted = '+998 ';

    // Add first 2 digits
    if (value.length >= 1) {
      formatted += value.substring(0, Math.min(2, value.length));
    }

    // Add space and next 3 digits
    if (value.length >= 3) {
      formatted += ' ' + value.substring(2, Math.min(5, value.length));
    }

    // Add space and next 2 digits
    if (value.length >= 6) {
      formatted += ' ' + value.substring(5, Math.min(7, value.length));
    }

    // Add space and last 2 digits
    if (value.length >= 8) {
      formatted += ' ' + value.substring(7, Math.min(9, value.length));
    }

    return formatted;
  }

  formatPhoneNumberOnly(value) {
    if (value.length === 0) return '';

    let formatted = '';

    // Add first 2 digits
    if (value.length >= 1) {
      formatted += value.substring(0, Math.min(2, value.length));
    }

    // Add space and next 3 digits
    if (value.length >= 3) {
      formatted += ' ' + value.substring(2, Math.min(5, value.length));
    }

    // Add space and next 2 digits
    if (value.length >= 6) {
      formatted += ' ' + value.substring(5, Math.min(7, value.length));
    }

    // Add space and last 2 digits
    if (value.length >= 8) {
      formatted += ' ' + value.substring(7, Math.min(9, value.length));
    }

    return formatted;
  }

  async handleLogin(phone, password, errorDiv) {
    // Hide previous error
    errorDiv.style.display = 'none';

    try {
      console.log('🔐 Attempting login with:', { phone, password: '***' });
      
      // Make API call to backend for authentication
      const response = await api.post('/sub-admins/admin-login', {
        phone: phone,
        password: password
      });

      if (response.data.success) {
        // Store authentication data
        localStorage.setItem('moderator_authenticated', 'true');
        localStorage.setItem('moderator_token', response.data.data.accessToken);
        localStorage.setItem('moderator_user', JSON.stringify(response.data.data.user));
        
        console.log('✅ Admin login successful, token stored:', {
          tokenExists: !!response.data.data.accessToken,
          tokenLength: response.data.data.accessToken?.length,
          user: response.data.data.user
        });
        
        this.isAuthenticated = true;
        this.showModeratorInterface();
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Show error message
      errorDiv.style.display = 'block';
      
      // Clear password field
      document.getElementById('password').value = '';

      // Shake animation for error
      errorDiv.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        errorDiv.style.animation = '';
      }, 500);
    }
  }

  logout() {
    localStorage.removeItem('moderator_authenticated');
    localStorage.removeItem('moderator_token');
    localStorage.removeItem('moderator_user');
    this.isAuthenticated = false;
    this.showLoginPage();

    // Clear form
    document.getElementById('phone-number').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').style.display = 'none';

    // Reset password visibility toggle
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('password-toggle');
    const eyeIcon = passwordToggle.querySelector('.eye-icon');
    const eyeOffIcon = passwordToggle.querySelector('.eye-off-icon');

    passwordInput.type = 'password';
    eyeIcon.style.display = 'block';
    eyeOffIcon.style.display = 'none';

    // Reset cursor position
    setTimeout(() => {
      const phoneInput = document.getElementById('phone-number');
      phoneInput.focus();
    }, 100);
  }
}

class ModeratorApp {
  constructor() {
    this.currentSection = 'blog';
    this.currentTags = []; // Store current tags
    this.maxTags = 15; // Maximum allowed tags
    this.currentSeoKeywords = []; // Store current SEO keywords
    this.maxSeoKeywords = 10; // Maximum allowed SEO keywords
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupModals();
    this.loadBlogs();
    this.loadAnalytics();
  }

  // Navigation System
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const sectionName = item.dataset.section;
        this.switchSection(sectionName);
      });
    });
  }

  switchSection(sectionName) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');

    this.currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
      case 'blog':
        this.loadBlogs();
        break;
      case 'advice':
        this.loadAdvices();
        break;
      case 'teachers':
        loadTeachers();
        setupTeachersSearch();
        break;
      case 'analytics':
        this.loadAnalytics();
        break;
    }
  }

  // Modal System
  setupModals() {
    // Post modal
    const postModal = document.getElementById('post-modal');
    const newPostBtn = document.getElementById('new-post-btn');
    const postForm = document.getElementById('post-form');

    newPostBtn.addEventListener('click', () => {
      this.openPostModal();
    });

    // Setup add section functionality
    this.setupAddSectionButton();

    // Setup word count validation
    this.setupWordCountValidation();

    // Setup tag input events
    this.setupTagInputEvents();

    // Setup SEO keyword input events
    this.setupSeoKeywordInputEvents();

    // Close modals
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('active');
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Form submissions
    postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
  }

  setupWordCountValidation() {
    const descriptionField = document.getElementById('post-description');
    const wordCountDisplay = document.getElementById('word-count');

    descriptionField.addEventListener('input', () => {
      const text = descriptionField.value.trim();
      const words = text ? text.split(/\s+/).filter(word => word.length > 0) : [];
      const wordCount = words.length;

      wordCountDisplay.textContent = `${wordCount}/15 so\'z`;

      if (wordCount > 15) {
        // Trim to 15 words
        const trimmedText = words.slice(0, 15).join(' ');
        descriptionField.value = trimmedText;
        wordCountDisplay.textContent = '15/15 so\'z';
        wordCountDisplay.style.color = '#e74c3c';
      } else if (wordCount >= 12) {
        wordCountDisplay.style.color = '#f39c12';
      } else {
        wordCountDisplay.style.color = '#7EA2D4';
      }
    });
  }

  // Tag Management System
  addTag() {
    const tagInput = document.getElementById('tag-input');
    const tagValue = tagInput.value.trim();

    // Validation
    if (!tagValue) {
      this.showErrorMessage('Tag bo\'sh bo\'lishi mumkin emas!');
      return;
    }

    if (tagValue.length < 2) {
      this.showErrorMessage('Tag kamida 2 ta harf bo\'lishi kerak!');
      return;
    }

    if (this.currentTags.length >= this.maxTags) {
      this.showErrorMessage(`Maksimal ${this.maxTags} ta tag qo'shishingiz mumkin!`);
      return;
    }

    // Check for duplicates
    const normalizedTag = tagValue.toLowerCase();
    if (this.currentTags.some(tag => tag.value === normalizedTag)) {
      this.showErrorMessage('Bu tag allaqachon mavjud!');
      return;
    }

    // Add tag
    const newTag = {
      label: tagValue,
      value: normalizedTag
    };

    this.currentTags.push(newTag);
    this.updateTagsDisplay();
    this.updateHiddenTagInput();

    // Clear input
    tagInput.value = '';
    tagInput.focus();
  }

  removeTag(index) {
    if (index >= 0 && index < this.currentTags.length) {
      this.currentTags.splice(index, 1);
      this.updateTagsDisplay();
      this.updateHiddenTagInput();
    }
  }

  updateTagsDisplay() {
    const tagsDisplay = document.getElementById('tags-display');

    if (this.currentTags.length === 0) {
      tagsDisplay.innerHTML = '<div class="no-tags">Hech qanday tag qo\'shilmagan</div>';
      return;
    }

    tagsDisplay.innerHTML = this.currentTags.map((tag, index) => `
      <div class="tag-chip">
        <span class="tag-text">${tag.label}</span>
        <button type="button" class="tag-remove" onclick="moderatorApp.removeTag(${index})" title="Tag ni o'chirish">×</button>
      </div>
    `).join('');
  }

  updateHiddenTagInput() {
    const hiddenInput = document.getElementById('post-tags');
    hiddenInput.value = this.currentTags.map(tag => tag.value).join(',');
  }

  setupTagInputEvents() {
    const tagInput = document.getElementById('tag-input');

    // Enter key to add tag
    tagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addTag();
      }
    });

    // Input validation
    tagInput.addEventListener('input', (e) => {
      // Only allow alphanumeric characters and basic punctuation
      const value = e.target.value;
      const cleanValue = value.replace(/[^a-zA-Z0-9а-яё\u0400-\u04ff\s'-]/gi, '');
      if (value !== cleanValue) {
        e.target.value = cleanValue;
      }
    });
  }

  loadTagsFromPost(post) {
    // Clear current tags
    this.currentTags = [];

    // Load tags from post
    if (post.tags && post.tags.length > 0) {
      this.currentTags = post.tags.map(tag => ({
        label: tag.label || tag.value,
        value: tag.value
      }));
    }

    this.updateTagsDisplay();
    this.updateHiddenTagInput();
  }

  // SEO Keywords Management System
  addSeoKeyword() {
    const keywordInput = document.getElementById('seo-keyword-input');
    const keywordValue = keywordInput.value.trim();

    // Validation
    if (!keywordValue) {
      this.showErrorMessage('SEO so\'z bo\'sh bo\'lishi mumkin emas!');
      return;
    }

    if (keywordValue.length < 2) {
      this.showErrorMessage('SEO so\'z kamida 2 ta harf bo\'lishi kerak!');
      return;
    }

    if (this.currentSeoKeywords.length >= this.maxSeoKeywords) {
      this.showErrorMessage(`Maksimal ${this.maxSeoKeywords} ta SEO so'z qo'shishingiz mumkin!`);
      return;
    }

    // Check for duplicates
    const normalizedKeyword = keywordValue.toLowerCase();
    if (this.currentSeoKeywords.includes(normalizedKeyword)) {
      this.showErrorMessage('Bu SEO so\'z allaqachon mavjud!');
      return;
    }

    // Add keyword
    this.currentSeoKeywords.push(normalizedKeyword);
    this.updateSeoKeywordsDisplay();
    this.updateHiddenSeoKeywordInput();

    // Clear input
    keywordInput.value = '';
    keywordInput.focus();
  }

  removeSeoKeyword(index) {
    if (index >= 0 && index < this.currentSeoKeywords.length) {
      this.currentSeoKeywords.splice(index, 1);
      this.updateSeoKeywordsDisplay();
      this.updateHiddenSeoKeywordInput();
    }
  }

  updateSeoKeywordsDisplay() {
    const keywordsDisplay = document.getElementById('seo-keywords-display');

    if (this.currentSeoKeywords.length === 0) {
      keywordsDisplay.innerHTML = '<div class="no-seo-keywords">Hech qanday SEO so\'z qo\'shilmagan</div>';
      return;
    }

    keywordsDisplay.innerHTML = this.currentSeoKeywords.map((keyword, index) => `
      <div class="seo-keyword-chip">
        <span class="seo-keyword-text">${keyword}</span>
        <button type="button" class="seo-keyword-remove" onclick="moderatorApp.removeSeoKeyword(${index})" title="SEO so'zni o'chirish">×</button>
      </div>
    `).join('');
  }

  updateHiddenSeoKeywordInput() {
    const hiddenInput = document.getElementById('meta-keywords');
    hiddenInput.value = this.currentSeoKeywords.join(',');
  }

  setupSeoKeywordInputEvents() {
    const keywordInput = document.getElementById('seo-keyword-input');

    // Enter key to add keyword
    keywordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addSeoKeyword();
      }
    });

    // Input validation
    keywordInput.addEventListener('input', (e) => {
      // Only allow alphanumeric characters and basic punctuation
      const value = e.target.value;
      const cleanValue = value.replace(/[^a-zA-Z0-9а-яё\u0400-\u04ff\s'-]/gi, '');
      if (value !== cleanValue) {
        e.target.value = cleanValue;
      }
    });
  }

  loadSeoKeywordsFromPost(post) {
    // Clear current keywords
    this.currentSeoKeywords = [];

    // Load keywords from post (check both old and new structure)
    if (post.seoKeywords && post.seoKeywords.length > 0) {
      this.currentSeoKeywords = [...post.seoKeywords];
    } else if (post.seo && post.seo.keywords && post.seo.keywords.length > 0) {
      // Backward compatibility with old structure
      this.currentSeoKeywords = [...post.seo.keywords];
    }

    this.updateSeoKeywordsDisplay();
    this.updateHiddenSeoKeywordInput();
  }

  setupAddSectionButton() {
    const addSectionBtn = document.getElementById('add-section-btn');
    addSectionBtn.addEventListener('click', () => {
      this.addContentSection();
    });
  }

  addContentSection() {
    const sectionsContainer = document.getElementById('content-sections');
    const sectionCount = sectionsContainer.children.length + 1;

    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'content-section-item';
    sectionDiv.dataset.sectionId = sectionCount;
    sectionDiv.innerHTML = `
      <div class="section-header">
        <h5 class="section-number">Bo'lim ${sectionCount}</h5>
        <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()">O'chirish</button>
      </div>

      <div class="form-group">
        <label>Bo'lim sarlavhasi</label>
        <input type="text" name="section-header-${sectionCount}" placeholder="Bo'lim sarlavhasini kiriting" class="section-header-input">
      </div>

      <!-- H2 Section Container -->
      <div class="subsection-container" id="h2-container-${sectionCount}">
        <div class="subsection-header">
          <label>H2 Sarlavhalar</label>
          <button type="button" class="btn-add-subsection" onclick="moderatorApp.addH2Subsection(${sectionCount})">
            <span>+</span> H2 qo'shish
          </button>
        </div>
        <div class="subsections-list" id="h2-list-${sectionCount}">
          <!-- H2 subsections will be added here -->
        </div>
      </div>

      <!-- H3 Section Container -->
      <div class="subsection-container" id="h3-container-${sectionCount}">
        <div class="subsection-header">
          <label>H3 Sarlavhalar</label>
          <button type="button" class="btn-add-subsection" onclick="moderatorApp.addH3Subsection(${sectionCount})">
            <span>+</span> H3 qo'shish
          </button>
        </div>
        <div class="subsections-list" id="h3-list-${sectionCount}">
          <!-- H3 subsections will be added here -->
        </div>
      </div>
    `;

    sectionsContainer.appendChild(sectionDiv);
  }

  // Add H2 subsection dynamically
  addH2Subsection(sectionId) {
    const h2List = document.getElementById(`h2-list-${sectionId}`);
    const h2Count = h2List.children.length + 1;
    const h2Id = `section-${sectionId}-h2-${h2Count}`;

    const h2Div = document.createElement('div');
    h2Div.className = 'subsection-item';
    h2Div.innerHTML = `
      <div class="subsection-controls">
        <button type="button" class="btn-remove-small" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="form-group">
        <label>H2 Sarlavha</label>
        <input type="text" name="${h2Id}-header" placeholder="H2 sarlavhasini kiriting" class="subsection-input">
      </div>
      <div class="form-group">
        <label>H2 Paragraf</label>
        <textarea name="${h2Id}-content" rows="4" placeholder="H2 paragraf mazmunini kiriting" class="subsection-textarea"></textarea>
      </div>
    `;

    h2List.appendChild(h2Div);
  }

  // Add H3 subsection dynamically
  addH3Subsection(sectionId) {
    const h3List = document.getElementById(`h3-list-${sectionId}`);
    const h3Count = h3List.children.length + 1;
    const h3Id = `section-${sectionId}-h3-${h3Count}`;

    const h3Div = document.createElement('div');
    h3Div.className = 'subsection-item';
    h3Div.innerHTML = `
      <div class="subsection-controls">
        <button type="button" class="btn-remove-small" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="form-group">
        <label>H3 Sarlavha</label>
        <input type="text" name="${h3Id}-header" placeholder="H3 sarlavhasini kiriting" class="subsection-input">
      </div>
      <div class="form-group">
        <label>H3 Paragraf</label>
        <textarea name="${h3Id}-content" rows="3" placeholder="H3 paragraf mazmunini kiriting" class="subsection-textarea"></textarea>
      </div>
    `;

    h3List.appendChild(h3Div);
  }

  // Blog Management
  async testAdminToken() {
    try {
      console.log('🧪 Testing admin token...');
      const response = await api.get('/sub-admins/admin-test');
      console.log('✅ Token test successful:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Token test failed:', error.response?.data || error.message);
      return false;
    }
  }

  async loadBlogs() {
    const postsGrid = document.getElementById('posts-grid');
    postsGrid.innerHTML = '<div class="loading">Postlar yuklanmoqda...</div>';

    // Test token first
    const tokenValid = await this.testAdminToken();
    if (!tokenValid) {
      postsGrid.innerHTML = '<div class="loading">Token yaroqsiz. Iltimos qayta kiring.</div>';
      return;
    }

    try {
      const response = await api.get('/blogs');
      const posts = response.data.data;

      if (posts.length === 0) {
        postsGrid.innerHTML = '<div class="loading">Hech qanday post topilmadi. Birinchi postingizni yarating!</div>';
        return;
      }

      postsGrid.innerHTML = posts.map(post => this.createPostCard(post)).join('');
    } catch (error) {
      console.error('Error loading posts:', error);
      postsGrid.innerHTML = '<div class="loading">Postlar yuklanishida xatolik. Backend ulanishini tekshiring.</div>';
    }
  }

  createPostCard(post) {
    const date = new Date(post.createdAt).toLocaleDateString('en-GB'); // DD/MM/YYYY format
    return `
      <div class="post-card">
        <div class="post-title">${post.title}</div>
        <div class="post-excerpt">${post.subtitle}</div>
        <div class="post-meta">
          <span class="views-count">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            ${(post.multiViews || 0).toLocaleString()}
          </span>
          <span>${date}</span>
        </div>
        <div class="post-actions">
          <button class="btn-icon preview-btn" onclick="moderatorApp.previewPost('${post.id}')">Batafsil o'qish</button>
          <button class="btn-icon" onclick="moderatorApp.editPost('${post.id}')">Tahrirlash</button>
          <button class="btn-icon" onclick="moderatorApp.deletePost('${post.id}')">O'chirish</button>
        </div>
      </div>
    `;
  }

  openPostModal(post = null) {
    const modal = document.getElementById('post-modal');
    const form = document.getElementById('post-form');
    const title = document.getElementById('modal-title');
    const sectionsContainer = document.getElementById('content-sections');

    if (post) {
      title.textContent = 'Maqolani tahrirlash';
      this.fillPostForm(post);
      currentEditingPost = post;
    } else {
      title.textContent = 'Yangi maqola';
      form.reset();
      sectionsContainer.innerHTML = '';

      // Clear tags for new post
      this.currentTags = [];
      this.updateTagsDisplay();
      this.updateHiddenTagInput();

      // Clear SEO keywords for new post
      this.currentSeoKeywords = [];
      this.updateSeoKeywordsDisplay();
      this.updateHiddenSeoKeywordInput();

      currentEditingPost = null;

      // Add first section automatically for new posts
      this.addContentSection();
    }

    modal.classList.add('active');
  }


  fillPostForm(post) {
    console.log('Filling form with post:', post);
    try {
      // Fill basic information
      document.getElementById('post-title').value = post.title || '';
      document.getElementById('post-description').value = post.subtitle || '';

      // Load tags into new system
      this.loadTagsFromPost(post);

      // Load SEO keywords into new system
      this.loadSeoKeywordsFromPost(post);

      // Clear existing sections
      const sectionsContainer = document.getElementById('content-sections');
      sectionsContainer.innerHTML = '';

      // Add sections from post data with new dynamic structure
      if (post.sections && post.sections.length > 0) {
        let sectionCounter = 0;
        post.sections.forEach(section => {
          if (section.header) {
            this.addContentSection();
            sectionCounter++;
            document.querySelector(`input[name="section-header-${sectionCounter}"]`).value = section.header;
          } else if (section.h2) {
            if (sectionCounter === 0) {
              this.addContentSection();
              sectionCounter++;
            }
            const h2List = document.getElementById(`h2-list-${sectionCounter}`);
            const h2Count = h2List.children.length + 1;
            this.addH2Subsection(sectionCounter);
            const h2HeaderInput = document.querySelector(`input[name="section-${sectionCounter}-h2-${h2Count}-header"]`);
            const h2ContentInput = document.querySelector(`textarea[name="section-${sectionCounter}-h2-${h2Count}-content"]`);
            if (h2HeaderInput) h2HeaderInput.value = section.h2;
            if (h2ContentInput) h2ContentInput.value = section.content;
          } else if (section.h3) {
            if (sectionCounter === 0) {
              this.addContentSection();
              sectionCounter++;
            }
            const h3List = document.getElementById(`h3-list-${sectionCounter}`);
            const h3Count = h3List.children.length + 1;
            this.addH3Subsection(sectionCounter);
            const h3HeaderInput = document.querySelector(`input[name="section-${sectionCounter}-h3-${h3Count}-header"]`);
            const h3ContentInput = document.querySelector(`textarea[name="section-${sectionCounter}-h3-${h3Count}-content"]`);
            if (h3HeaderInput) h3HeaderInput.value = section.h3;
            if (h3ContentInput) h3ContentInput.value = section.content;
          }
        });

        if (sectionCounter === 0) {
          this.addContentSection();
        }
      } else {
        // Add at least one section if no sections exist
        this.addContentSection();
      }
    } catch (error) {
      console.error('Error filling form:', error);
    }
  }

  async handlePostSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Collect all sections with new dynamic structure
    const sections = [];
    const sectionsContainer = document.getElementById('content-sections');

    for (let i = 1; i <= sectionsContainer.children.length; i++) {
      const sectionHeader = formData.get(`section-header-${i}`);

      // Add main section if header exists (now optional)
      if (sectionHeader && sectionHeader.trim()) {
        const section = {
          header: sectionHeader.trim(),
          content: '' // Empty content as we don't have main paragraph anymore
        };
        sections.push(section);
      }

      // Always collect H2 subsections (even if main header is empty)
      const h2List = document.getElementById(`h2-list-${i}`);
      if (h2List && h2List.children.length > 0) {
        for (let j = 1; j <= h2List.children.length; j++) {
          const h2Header = formData.get(`section-${i}-h2-${j}-header`);
          const h2Content = formData.get(`section-${i}-h2-${j}-content`);

          if (h2Header && h2Header.trim()) {
            const h2Section = {
              h2: h2Header.trim(),
              content: h2Content || ''
            };
            sections.push(h2Section);
          }
        }
      }

      // Always collect H3 subsections (even if main header is empty)
      const h3List = document.getElementById(`h3-list-${i}`);
      if (h3List && h3List.children.length > 0) {
        for (let j = 1; j <= h3List.children.length; j++) {
          const h3Header = formData.get(`section-${i}-h3-${j}-header`);
          const h3Content = formData.get(`section-${i}-h3-${j}-content`);

          if (h3Header && h3Header.trim()) {
            const h3Section = {
              h3: h3Header.trim(),
              content: h3Content || ''
            };
            sections.push(h3Section);
          }
        }
      }
    }

    const data = {
      header: {
        title: formData.get('title'),
        subtitle: formData.get('description')  // Changed from subtitle to description
      },
      sections: sections,
      tags: this.currentTags,
      seo: {
        keywords: this.currentSeoKeywords
      }
    };

    try {
      if (currentEditingPost) {
        await api.put(`/blogs/${currentEditingPost.id}`, data);
        this.showSuccessMessage('Maqola muvaffaqiyatli yangilandi!');
      } else {
        await api.post('/blogs', data);
        this.showSuccessMessage('Maqola muvaffaqiyatli yaratildi!');
      }

      document.getElementById('post-modal').classList.remove('active');
      this.loadBlogs();
    } catch (error) {
      console.error('Error saving post:', error);
      this.showErrorMessage('Maqolani saqlashda xatolik: ' + (error.response?.data?.message || error.message));
    }
  }

  async editPost(postId) {
    try {
      const response = await api.get(`/blogs/${postId}`);
      console.log('API Response:', response.data); // Debug log
      this.openPostModal(response.data.blog);
    } catch (error) {
      console.error('Error loading post:', error);
      this.showErrorMessage('Postni yuklashda xatolik');
    }
  }

  async deletePost(postId) {
    const confirmed = await this.showConfirmModal('Ushbu postni o\'chirishni xohlaysizmi?', 'Bu amalni bekor qilib bo\'lmaydi.');
    if (confirmed) {
      try {
        await api.delete(`/blogs/${postId}`);
        this.showSuccessMessage('Post muvaffaqiyatli o\'chirildi!');
        this.loadBlogs();
      } catch (error) {
        console.error('Error deleting post:', error);
        this.showErrorMessage('Postni o\'chirishda xatolik');
      }
    }
  }

  async previewPost(postId) {
    window.currentPreviewId = postId;
    await this.showPreviewPage(postId);
  }

  async showPreviewPage(postId) {
    try {
      const response = await api.get(`/blogs/${postId}`);
      const article = response.data.blog;

      // Generate sections HTML like in user interface
      const sectionsHTML = article.sections.map(section => {
        let sectionContent = '';

        // Section header (always present)
        if (section.header) {
          sectionContent += `<h2 class="section-header">${section.header}</h2>`;
        }

        // Optional H2
        if (section.h2) {
          sectionContent += `<h3 class="section-h2">${section.h2}</h3>`;
        }

        // Optional H3
        if (section.h3) {
          sectionContent += `<h4 class="section-h3">${section.h3}</h4>`;
        }

        // Paragraph content
        if (section.content) {
          sectionContent += `<p class="section-paragraph">${section.content}</p>`;
        }

        return `<div class="article-section">${sectionContent}</div>`;
      }).join('');

      // Hide sidebar and header elements
      document.querySelector('.sidebar').style.display = 'none';
      document.querySelector('.header').style.display = 'none';

      // Replace main content with preview page
      const mainContent = document.querySelector('.main-content');
      mainContent.style.marginLeft = '0';
      mainContent.style.marginTop = '0';
      mainContent.innerHTML = `
        <div class="preview-page">
          <div class="preview-navigation">
            <button class="back-to-moderator-btn" onclick="moderatorApp.goBackToModerator()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Boshqaruv paneliga qaytish
            </button>
          </div>

          <div class="preview-content-wrapper">
            <h1 class="article-main-title">${article.title}</h1>

            <div class="article-meta-info">
              <div class="article-date">${new Date(article.createdAt).toLocaleDateString('en-GB')}</div>
              <div class="article-views">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                ${(article.multiViews || 0).toLocaleString()}
              </div>
            </div>

            <div class="article-sections">
              ${sectionsHTML}
            </div>

            <div class="preview-tags">
              ${article.tags.map(tag => `<span class="preview-tag">${tag.label}</span>`).join('')}
            </div>
          </div>
        </div>
      `;

      // Add preview page styles
      this.addPreviewPageStyles();

      // Scroll to top
      window.scrollTo(0, 0);

      // Track view for preview
      api.post(`/blogs/${postId}/view`).catch(err => console.log('View tracking failed:', err));

    } catch (error) {
      console.error('Error loading post preview:', error);
      this.showErrorMessage('Post oldin ko\'rishini yuklashda xatolik');
    }
  }

  addPreviewPageStyles() {
    // Remove existing preview styles if any
    const existingStyle = document.getElementById('preview-page-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'preview-page-styles';
    style.textContent = `
      .preview-page {
        min-height: 100vh;
        background: var(--bg-main);
        color: white;
        padding: 1rem 2rem 2rem 2rem;
      }

      .preview-navigation {
        margin-bottom: 1rem;
        display: flex;
        justify-content: flex-end;
        margin-right: 210px;
      }

      .back-to-moderator-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(126, 162, 212, 0.1);
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }

      .back-to-moderator-btn:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(126, 162, 212, 0.3);
      }

      .preview-content-wrapper {
        max-width: 900px;
        margin: 0 auto;
        background: rgba(58, 56, 56, 0.2);
        border: 2px solid rgba(126, 162, 212, 0.3);
        border-radius: 16px;
        padding: 3rem;
        backdrop-filter: blur(20px);
      }

      .article-main-title {
        font-size: 3rem;
        font-weight: 700;
        color: #ffffff;
        text-align: center;
        margin-bottom: 1rem;
        line-height: 1.2;
      }

      .article-meta-info {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid rgba(126, 162, 212, 0.2);
      }

      .article-date, .article-views {
        color: var(--primary-color);
        font-weight: 500;
        font-size: 1.1rem;
      }

      .article-sections {
        margin-bottom: 2rem;
      }

      .article-section {
        margin-bottom: 2rem;
        text-align: left;
      }

      .section-header {
        font-size: 2rem;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        line-height: 1.3;
      }

      .section-h2 {
        font-size: 1.6rem;
        font-weight: 500;
        color: #a0c4e0;
        margin-bottom: 1rem;
        line-height: 1.4;
      }

      .section-h3 {
        font-size: 1.3rem;
        font-weight: 500;
        color: #c0d4e8;
        margin-bottom: 0.8rem;
        line-height: 1.4;
      }

      .section-paragraph {
        font-size: 1.1rem;
        line-height: 1.8;
        color: #e0e0e0;
        margin-bottom: 2rem;
        text-align: justify;
        white-space: pre-wrap;
      }

      .preview-tags {
        text-align: center;
        padding-top: 2rem;
        border-top: 2px solid rgba(126, 162, 212, 0.2);
      }

      .preview-tag {
        background: linear-gradient(135deg, var(--primary-color), #5a7db8);
        color: white;
        padding: 8px 16px;
        border-radius: 25px;
        margin: 6px;
        font-size: 16px;
        font-weight: 500;
        display: inline-block;
      }

      @media (max-width: 768px) {
        .preview-page {
          padding: 1rem;
        }

        .preview-content-wrapper {
          padding: 2rem;
        }

        .article-main-title {
          font-size: 2.2rem;
        }

        .article-meta-info {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }
      }
    `;

    document.head.appendChild(style);
  }

  goBackToModerator() {
    // Remove preview page styles
    const previewStyles = document.getElementById('preview-page-styles');
    if (previewStyles) {
      previewStyles.remove();
    }

    // Show sidebar and header
    document.querySelector('.sidebar').style.display = '';
    document.querySelector('.header').style.display = '';

    // Reset main content
    const mainContent = document.querySelector('.main-content');
    mainContent.style.marginLeft = '';
    mainContent.style.marginTop = '';

    // Restore the blog section content
    mainContent.innerHTML = `
      <!-- Blog Section -->
      <section id="blog-section" class="content-section active">
        <div class="section-header">
          <h2>Blog boshqaruvi</h2>
          <button class="btn-primary" id="new-post-btn">
            + Yangi post
          </button>
        </div>

        <div class="posts-container">
          <div class="posts-grid" id="posts-grid">
            <!-- Posts will be loaded here -->
            <div class="loading">Postlar yuklanmoqda...</div>
          </div>
        </div>
      </section>

      <!-- Analytics Section -->
      <section id="analytics-section" class="content-section">
        <h2>Analitika</h2>
        <div class="analytics-grid">
          <div class="stat-card">
            <h3>Jami postlar</h3>
            <p class="stat-number" id="total-posts">0</p>
          </div>
          <div class="stat-card">
            <h3>Jami ko'rishlar</h3>
            <p class="stat-number" id="total-views">0</p>
          </div>
        </div>
      </section>
    `;

    // Re-initialize the blog section
    this.currentSection = 'blog';
    this.loadBlogs();

    // Re-setup new post button
    const newPostBtn = document.getElementById('new-post-btn');
    if (newPostBtn) {
      newPostBtn.addEventListener('click', () => {
        this.openPostModal();
      });
    }
  }

  showConfirmModal(title, message) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'custom-modal-overlay';
      modal.innerHTML = `
        <div class="custom-modal">
          <div class="modal-header">
            <h3>${title}</h3>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" onclick="this.closest('.custom-modal-overlay').remove(); window.confirmResolve(false)">Bekor qilish</button>
            <button class="btn-confirm" onclick="this.closest('.custom-modal-overlay').remove(); window.confirmResolve(true)">O'chirish</button>
          </div>
        </div>
      `;

      // Add modal styles
      const style = document.createElement('style');
      style.textContent = `
        .custom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          backdrop-filter: blur(5px);
        }
        .custom-modal {
          background: rgba(58, 56, 56, 0.95);
          border: 2px solid rgba(126, 162, 212, 0.6);
          border-radius: 16px;
          max-width: 400px;
          width: 90%;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .custom-modal .modal-header {
          padding: 24px 24px 16px 24px;
          border-bottom: 1px solid rgba(126, 162, 212, 0.2);
        }
        .custom-modal .modal-header h3 {
          margin: 0;
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }
        .custom-modal .modal-body {
          padding: 16px 24px;
        }
        .custom-modal .modal-body p {
          margin: 0;
          color: #a0a0a0;
          font-size: 14px;
          line-height: 1.5;
        }
        .custom-modal .modal-footer {
          padding: 16px 24px 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .custom-modal .btn-cancel,
        .custom-modal .btn-confirm {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .custom-modal .btn-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .custom-modal .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .custom-modal .btn-confirm {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
        }
        .custom-modal .btn-confirm:hover {
          background: linear-gradient(135deg, #c0392b, #a93226);
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(modal);

      // Store resolve function globally
      window.confirmResolve = (result) => {
        document.head.removeChild(style);
        resolve(result);
      };

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
          document.head.removeChild(style);
          resolve(false);
        }
      });
    });
  }

  showSuccessMessage(message) {
    this.showToast(message, 'success');
  }

  showErrorMessage(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add toast styles
    const style = document.createElement('style');
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        backdrop-filter: blur(20px);
        border: 1px solid;
      }
      .toast-success {
        background: rgba(46, 204, 113, 0.9);
        border-color: rgba(46, 204, 113, 0.3);
      }
      .toast-error {
        background: rgba(231, 76, 60, 0.9);
        border-color: rgba(231, 76, 60, 0.3);
      }
      .toast.show {
        transform: translateX(0);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.remove();
      document.head.removeChild(style);
    }, 3000);
  }



  // Analytics
  async loadAnalytics() {
    try {
      const blogsResponse = await api.get('/blogs');
      const posts = blogsResponse.data.data;

      // Calculate totals
      const totalPosts = posts.length;
      const totalViews = posts.reduce((sum, post) => sum + (post.multiViews || 0), 0);

      // For now, we'll simulate some analytics data since backend might not have all this data yet
      const analyticsData = this.processAnalyticsData(posts);

      // Calculate unique visitors from table data to match
      const totalUniqueVisitors = analyticsData.reduce((sum, row) => sum + row.uniqueVisitors, 0);

      // Populate analytics table
      this.populateAnalyticsTable(analyticsData);

      // Update summary cards
      this.updateSummaryCards({
        totalPosts,
        totalViews,
        uniqueVisitors: totalUniqueVisitors
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      this.showAnalyticsError();
    }
  }

  processAnalyticsData(posts) {
    // Process posts data and create analytics rows
    const blogPages = posts.map(post => ({
      page: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
      uniqueVisitors: post.uniqueViews ? post.uniqueViews.length : 0, // Real unique visitors count
      pageViews: post.multiViews || 0
    }));

    return blogPages; // Show only blog posts
  }


  populateAnalyticsTable(data) {
    const tableBody = document.getElementById('analytics-table-body');

    if (data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3" class="loading-row">Ma\'lumot topilmadi</td></tr>';
      return;
    }

    tableBody.innerHTML = data.map(row => `
      <tr>
        <td>${row.page}</td>
        <td>${row.uniqueVisitors.toLocaleString()}</td>
        <td>${row.pageViews.toLocaleString()}</td>
      </tr>
    `).join('');
  }

  updateSummaryCards(summary) {
    document.getElementById('total-posts').textContent = summary.totalPosts;
    document.getElementById('total-views').textContent = summary.totalViews.toLocaleString();
    document.getElementById('unique-visitors').textContent = summary.uniqueVisitors.toLocaleString();
  }

  showAnalyticsError() {
    const tableBody = document.getElementById('analytics-table-body');
    tableBody.innerHTML = '<tr><td colspan="3" class="loading-row">Ma\'lumotlarni yuklashda xatolik yuz berdi</td></tr>';

    // Reset summary cards
    document.getElementById('total-posts').textContent = '0';
    document.getElementById('total-views').textContent = '0';
    document.getElementById('unique-visitors').textContent = '0';
  }

  // Advice Management System
  async loadAdvices() {
    try {
      // Load advice list
      await this.loadAdviceList();
      
      // Setup advice filters
      this.setupAdviceFilters();
      
    } catch (error) {
      console.error('Error loading advices:', error);
      this.showAdviceError();
    }
  }



  async loadAdviceList(page = 1, status = 'all', search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status !== 'all') {
        params.append('status', status);
      }
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await api.get(`/advices?${params}`);
      const data = response.data.data;
      
      this.renderAdviceTable(data.advices);
      this.renderAdvicePagination(data.pagination);
      
    } catch (error) {
      console.error('Error loading advice list:', error);
      this.showAdviceError();
    }
  }

  renderAdviceTable(advices) {
    const tableBody = document.getElementById('advice-table-body');
    
    if (!advices || advices.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="loading-row">Maslahat so\'rovlari topilmadi</td></tr>';
      return;
    }
    
    tableBody.innerHTML = advices.map(advice => `
      <tr>
        <td>${advice.name}</td>
        <td>${advice.phone}</td>
        <td>${advice.comment ? (advice.comment.length > 100 ? advice.comment.substring(0, 100) + '...' : advice.comment) : 'Izoh yo\'q'}</td>
        <td>${new Date(advice.createdAt).toLocaleDateString('uz-UZ')} ${new Date(advice.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</td>
        <td>
          <button class="btn-delete-icon" onclick="moderatorApp.showDeleteModal('${advice._id}', '${advice.name}')" title="O'chirish">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderAdvicePagination(pagination) {
    const paginationContainer = document.getElementById('advice-pagination');
    
    if (pagination.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (pagination.page > 1) {
      paginationHTML += `<button class="pagination-btn" onclick="moderatorApp.loadAdviceList(${pagination.page - 1})">‹ Oldingi</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (i === pagination.page) {
        paginationHTML += `<button class="pagination-btn active">${i}</button>`;
      } else {
        paginationHTML += `<button class="pagination-btn" onclick="moderatorApp.loadAdviceList(${i})">${i}</button>`;
      }
    }
    
    // Next button
    if (pagination.page < pagination.totalPages) {
      paginationHTML += `<button class="pagination-btn" onclick="moderatorApp.loadAdviceList(${pagination.page + 1})">Keyingi ›</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
  }

  setupAdviceFilters() {
    const searchInput = document.getElementById('advice-search');
    
    // Search input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.loadAdviceList(1, 'all', searchInput.value);
      }, 500);
    });
  }



  async deleteAdvice(adviceId) {
    if (!confirm('Haqiqatan ham bu maslahat so\'rovini o\'chirmoqchimisiz?')) {
      return;
    }
    
    try {
      await api.delete(`/advices/${adviceId}`);
      
      // Reload current page
      await this.loadAdviceList();
      
      this.showSuccessMessage('Maslahat so\'rovi muvaffaqiyatli o\'chirildi!');
      
    } catch (error) {
      console.error('Error deleting advice:', error);
      this.showErrorMessage('O\'chirishda xatolik yuz berdi!');
    }
  }

  showSuccessMessage(message) {
    // Simple success message - you can enhance this with toast notifications
    alert(message);
  }

  showErrorMessage(message) {
    // Simple error message - you can enhance this with toast notifications
    alert(message);
  }

  showAdviceError() {
    const tableBody = document.getElementById('advice-table-body');
    tableBody.innerHTML = '<tr><td colspan="5" class="loading-row">Ma\'lumotlarni yuklashda xatolik yuz berdi</td></tr>';
  }

  // Toast notification for moderator
  showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.moderator-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'moderator-toast-container';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `moderator-toast ${type}`;
    
    const icon = type === 'success' ? 
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : 
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    
    toast.innerHTML = `
      <div class="moderator-toast-content">
        <span class="moderator-toast-icon">${icon}</span>
        <span class="moderator-toast-message">${message}</span>
      </div>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Show toast with animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }
    }, 4000);
  }

  // Delete Modal Functions
  showDeleteModal(adviceId, adviceName) {
    const modalHTML = `
      <div class="delete-modal-overlay" id="deleteModalOverlay">
        <div class="delete-modal">
          <div class="delete-modal-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="delete-modal-title">Maslahat so'rovini o'chirish</h3>
          <p class="delete-modal-message">
            Haqiqatan ham <strong>${adviceName}</strong>ning maslahat so'rovini o'chirmoqchimisiz?
          </p>
          <div class="delete-modal-actions">
            <button class="delete-modal-cancel" onclick="moderatorApp.closeDeleteModal()">
              Bekor qilish
            </button>
            <button class="delete-modal-confirm" onclick="moderatorApp.confirmDelete('${adviceId}')">
              O'chirish
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add animation
    setTimeout(() => {
      document.getElementById('deleteModalOverlay').classList.add('show');
    }, 10);
  }

  closeDeleteModal() {
    const modal = document.getElementById('deleteModalOverlay');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  async confirmDelete(adviceId) {
    try {
      await api.delete(`/advices/${adviceId}`);
      
      // Close modal
      this.closeDeleteModal();
      
      // Reload advice list
      await this.loadAdviceList();
      
      // Show success toast
      this.showToast('Maslahat so\'rovi muvaffaqiyatli o\'chirildi!', 'success');
      
    } catch (error) {
      console.error('Error deleting advice:', error);
      // Show error toast
      this.showToast('O\'chirishda xatolik yuz berdi!', 'error');
    }
  }
}

// Initialize app
let moderatorApp;
let authSystem;

document.addEventListener('DOMContentLoaded', () => {
  authSystem = new AuthSystem();
  window.authSystem = authSystem; // Make it globally accessible for logout
});

export { api };

// Teachers Management Functions
let teachersData = [];
let currentTeacherDetails = null;

// Load teachers data
async function loadTeachers() {
  try {
    console.log('📚 Loading teachers data...');
    
    // Show loading state
    const teachersGrid = document.getElementById('teachers-grid');
    if (teachersGrid) {
      teachersGrid.innerHTML = '<div class="loading">O\'qituvchilar ma\'lumotlari yuklanmoqda...</div>';
    }

    // Fetch teachers from API
    const response = await api.get('/teachers/moderator/all');
    console.log('📚 Teachers API response:', response.data);

    if (response.data.success) {
      teachersData = response.data.data || [];
      displayTeachers(teachersData);
    } else {
      throw new Error(response.data.message || 'Failed to load teachers');
    }
  } catch (error) {
    console.error('❌ Error loading teachers:', error);
    const teachersGrid = document.getElementById('teachers-grid');
    if (teachersGrid) {
      teachersGrid.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19Z"/>
          </svg>
          <p>O'qituvchilar ma'lumotlarini yuklashda xatolik yuz berdi</p>
          <button onclick="loadTeachers()" class="btn-primary" style="margin-top: 1rem;">Qayta urinish</button>
        </div>
      `;
    }
  }
}

// Display teachers in grid
function displayTeachers(teachers) {
  const teachersGrid = document.getElementById('teachers-grid');
  if (!teachersGrid) return;

  if (!teachers || teachers.length === 0) {
    teachersGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8.5 4C10.7 4 12.5 5.8 12.5 8S10.7 12 8.5 12 4.5 10.2 4.5 8 6.3 4 8.5 4M8.5 14C13 14 16.5 15.8 16.5 18V20H0V18C0 15.8 4 14 8.5 14Z"/>
        </svg>
        <p>Hozircha ro'yxatdan o'tgan o'qituvchilar yo'q</p>
      </div>
    `;
    return;
  }

  const teachersHTML = teachers.map(teacher => {
    const initials = getInitials(teacher.firstName, teacher.lastName);
    const joinDate = new Date(teacher.createdAt).toLocaleDateString('en-GB');
    
    return `
      <div class="teacher-card" onclick="openTeacherDetails('${teacher._id}')">
        <div class="teacher-header">
          <div class="teacher-avatar">${initials}</div>
          <div class="teacher-info">
            <h3>${teacher.firstName} ${teacher.lastName}</h3>
            <p>${teacher.email || 'Email ko\'rsatilmagan'}</p>
            <p>${teacher.phone || 'Telefon ko\'rsatilmagan'}</p>
            <p>Ro'yxatdan o'tgan: ${joinDate}</p>
          </div>
        </div>
        <div class="teacher-actions">
          <button class="view-details-btn">Batafsil ko'rish</button>
        </div>
      </div>
    `;
  }).join('');

  teachersGrid.innerHTML = teachersHTML;
}

// Get initials from name
function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last || 'O';
}

// Open teacher details modal
async function openTeacherDetails(teacherId) {
  try {
    console.log('👤 Loading teacher details for ID:', teacherId);
    
    // Show modal with loading state
    const modal = document.getElementById('teacher-details-modal');
    const modalBody = document.getElementById('teacher-modal-body');
    const modalTitle = document.getElementById('teacher-modal-title');
    
    if (!modal || !modalBody || !modalTitle) return;
    
    modalTitle.textContent = 'O\'qituvchi ma\'lumotlari yuklanmoqda...';
    modalBody.innerHTML = '<div class="loading">Ma\'lumotlar yuklanmoqda...</div>';
    modal.style.display = 'flex';
    
    // Fetch detailed teacher data
    const response = await api.get(`/teachers/moderator/${teacherId}/details`);
    console.log('👤 Teacher details response:', response.data);
    
    if (response.data.success) {
      currentTeacherDetails = response.data.data;
      displayTeacherDetails(currentTeacherDetails);
    } else {
      throw new Error(response.data.message || 'Failed to load teacher details');
    }
  } catch (error) {
    console.error('❌ Error loading teacher details:', error);
    const modalBody = document.getElementById('teacher-modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="empty-state">
          <p>O'qituvchi ma'lumotlarini yuklashda xatolik yuz berdi</p>
          <button onclick="openTeacherDetails('${teacherId}')" class="btn-primary" style="margin-top: 1rem;">Qayta urinish</button>
        </div>
      `;
    }
  }
}

// Display teacher details in modal
function displayTeacherDetails(teacher) {
  const modalTitle = document.getElementById('teacher-modal-title');
  const modalBody = document.getElementById('teacher-modal-body');
  
  if (!modalTitle || !modalBody) return;
  
  modalTitle.textContent = `${teacher.firstName} ${teacher.lastName}`;
  
  const initials = getInitials(teacher.firstName, teacher.lastName);
  const joinDate = new Date(teacher.createdAt).toLocaleDateString('en-GB');
  
  const coursesHTML = teacher.courses && teacher.courses.length > 0 
    ? teacher.courses.map(course => `
        <div class="course-item">
          <h4>${course.title}</h4>
          <p>Yaratilgan: ${new Date(course.createdAt).toLocaleDateString('en-GB')}</p>
          <p>O'quvchilar: ${course.studentsCount || 0}</p>
          <p>Narx: ${course.price ? course.price.toLocaleString() + ' so\'m' : 'Bepul'}</p>
        </div>
      `).join('')
    : '<div class="empty-state"><p>Hozircha kurslar yaratilmagan</p></div>';
  
  const studentsHTML = teacher.students && teacher.students.length > 0
    ? `
        <table class="students-table">
          <thead>
            <tr>
              <th>Ism</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Ro'yxatdan o'tgan</th>
            </tr>
          </thead>
          <tbody>
            ${teacher.students.map(student => `
              <tr>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.email || 'Ko\'rsatilmagan'}</td>
                <td>${student.phone || 'Ko\'rsatilmagan'}</td>
                <td>${new Date(student.createdAt).toLocaleDateString('en-GB')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    : '<div class="empty-state"><p>Hozircha o\'quvchilar yo\'q</p></div>';
  
  modalBody.innerHTML = `
    <div class="teacher-details">
      <div class="teacher-profile">
        <div class="teacher-profile-avatar">${initials}</div>
        <div class="teacher-profile-info">
          <h2>${teacher.firstName} ${teacher.lastName}</h2>
          <p><strong>Email:</strong> ${teacher.email || 'Ko\'rsatilmagan'}</p>
          <p><strong>Telefon:</strong> ${teacher.phone || 'Ko\'rsatilmagan'}</p>
          <p><strong>Ro'yxatdan o'tgan:</strong> ${joinDate}</p>
          <p><strong>Status:</strong> ${teacher.isActive ? 'Faol' : 'Nofaol'}</p>
          

        </div>
      </div>
      
      <div class="courses-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19Z"/>
          </svg>
          Yaratgan kurslar (${teacher.courses?.length || 0})
        </h3>
        <div class="courses-grid">
          ${coursesHTML}
        </div>
      </div>
      
      <div class="students-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14Z"/>
          </svg>
          O'quvchilar (${teacher.students?.length || 0})
        </h3>
        ${studentsHTML}
      </div>
    </div>
  `;
}

// Close teacher details modal
function closeTeacherModal() {
  const modal = document.getElementById('teacher-details-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  currentTeacherDetails = null;
}

// Search and filter teachers
function setupTeachersSearch() {
  const searchInput = document.getElementById('teachers-search');
  const sortSelect = document.getElementById('teachers-sort');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredTeachers = teachersData.filter(teacher => 
        teacher.firstName.toLowerCase().includes(searchTerm) ||
        teacher.lastName.toLowerCase().includes(searchTerm) ||
        teacher.email.toLowerCase().includes(searchTerm) ||
        (teacher.phone && teacher.phone.includes(searchTerm))
      );
      displayTeachers(filteredTeachers);
    });
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const sortBy = e.target.value;
      const sortedTeachers = [...teachersData].sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'name':
            return (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName);
          case 'courses':
            return (b.coursesCount || 0) - (a.coursesCount || 0);
          default:
            return 0;
        }
      });
      displayTeachers(sortedTeachers);
    });
  }
}

// Make functions globally available
window.openTeacherDetails = openTeacherDetails;
window.closeTeacherModal = closeTeacherModal;