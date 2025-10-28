import './style.css';
import axios from 'axios';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
    if (this.isAuthenticated) {
      this.showModeratorInterface();
    } else {
      this.showLoginPage();
    }
    this.setupLoginForm();
  }

  checkAuthStatus() {
    return localStorage.getItem('moderator_authenticated') === 'true';
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

  handleLogin(phone, password, errorDiv) {
    // Hide previous error
    errorDiv.style.display = 'none';

    // Validate credentials
    if (phone === VALID_CREDENTIALS.phone && password === VALID_CREDENTIALS.password) {
      // Successful login
      localStorage.setItem('moderator_authenticated', 'true');
      this.isAuthenticated = true;
      this.showModeratorInterface();
    } else {
      // Invalid credentials
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
  async loadBlogs() {
    const postsGrid = document.getElementById('posts-grid');
    postsGrid.innerHTML = '<div class="loading">Postlar yuklanmoqda...</div>';

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
        // Group sections by type
        const mainSections = [];
        const h2Sections = [];
        const h3Sections = [];

        post.sections.forEach(section => {
          if (section.header) {
            mainSections.push(section);
          } else if (section.h2) {
            h2Sections.push(section);
          } else if (section.h3) {
            h3Sections.push(section);
          }
        });

        // Create main sections first
        let sectionCounter = 0;
        mainSections.forEach(section => {
          this.addContentSection();
          sectionCounter++;

          // Fill main section data
          if (section.header) {
            document.querySelector(`input[name="section-header-${sectionCounter}"]`).value = section.header;
          }
          // Note: No content field anymore, only header
        });

        // Add H2 sections to the first main section (for backward compatibility)
        if (h2Sections.length > 0 && sectionCounter > 0) {
          h2Sections.forEach((h2Section, index) => {
            this.addH2Subsection(1); // Add to first section
            const h2Index = index + 1;

            setTimeout(() => {
              const h2HeaderInput = document.querySelector(`input[name="section-1-h2-${h2Index}-header"]`);
              const h2ContentInput = document.querySelector(`textarea[name="section-1-h2-${h2Index}-content"]`);

              if (h2HeaderInput && h2Section.h2) {
                h2HeaderInput.value = h2Section.h2;
              }
              if (h2ContentInput && h2Section.content) {
                h2ContentInput.value = h2Section.content;
              }
            }, 50);
          });
        }

        // Add H3 sections to the first main section (for backward compatibility)
        if (h3Sections.length > 0 && sectionCounter > 0) {
          h3Sections.forEach((h3Section, index) => {
            this.addH3Subsection(1); // Add to first section
            const h3Index = index + 1;

            setTimeout(() => {
              const h3HeaderInput = document.querySelector(`input[name="section-1-h3-${h3Index}-header"]`);
              const h3ContentInput = document.querySelector(`textarea[name="section-1-h3-${h3Index}-content"]`);

              if (h3HeaderInput && h3Section.h3) {
                h3HeaderInput.value = h3Section.h3;
              }
              if (h3ContentInput && h3Section.content) {
                h3ContentInput.value = h3Section.content;
              }
            }, 100);
          });
        }

        // If no main sections, create at least one
        if (mainSections.length === 0) {
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
}

// Initialize app
let moderatorApp;
let authSystem;

document.addEventListener('DOMContentLoaded', () => {
  authSystem = new AuthSystem();
  window.authSystem = authSystem; // Make it globally accessible for logout
});

export { api };
