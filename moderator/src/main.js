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

class ModeratorApp {
  constructor() {
    this.currentSection = 'blog';
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
    sectionDiv.innerHTML = `
      <div class="section-header">
        <h5 class="section-number">Bo'lim ${sectionCount}</h5>
        <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()">O'chirish</button>
      </div>

      <div class="form-group">
        <label>Bo'lim sarlavhasi *</label>
        <input type="text" name="section-header-${sectionCount}" placeholder="Bo'lim sarlavhasini kiriting" class="section-header-input" required>
      </div>

      <div class="form-group">
        <label>Sarlavha 2 (ixtiyoriy)</label>
        <input type="text" name="section-h2-${sectionCount}" placeholder="H2 sarlavhasini kiriting (ixtiyoriy)" class="section-h2-input">
      </div>

      <div class="form-group">
        <label>Sarlavha 3 (ixtiyoriy)</label>
        <input type="text" name="section-h3-${sectionCount}" placeholder="H3 sarlavhasini kiriting (ixtiyoriy)" class="section-h3-input">
      </div>

      <div class="form-group">
        <label>Paragraf *</label>
        <textarea name="section-content-${sectionCount}" rows="6" placeholder="Paragraf mazmunini kiriting" class="section-content-input" required></textarea>
      </div>
    `;

    sectionsContainer.appendChild(sectionDiv);
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
      document.getElementById('post-tags').value = post.tags?.map(t => t.value).join(', ') || '';
      document.getElementById('meta-title').value = post.seo?.metaTitle || '';
      document.getElementById('meta-description').value = post.seo?.metaDescription || '';

      // Clear existing sections
      const sectionsContainer = document.getElementById('content-sections');
      sectionsContainer.innerHTML = '';

      // Add sections from post data
      if (post.sections && post.sections.length > 0) {
        post.sections.forEach((section, index) => {
          this.addContentSection();
          const sectionNumber = index + 1;

          // Fill section data
          if (section.header) {
            document.querySelector(`input[name="section-header-${sectionNumber}"]`).value = section.header;
          }
          if (section.h2) {
            document.querySelector(`input[name="section-h2-${sectionNumber}"]`).value = section.h2;
          }
          if (section.h3) {
            document.querySelector(`input[name="section-h3-${sectionNumber}"]`).value = section.h3;
          }
          if (section.content) {
            document.querySelector(`textarea[name="section-content-${sectionNumber}"]`).value = section.content;
          }
        });
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

    // Collect all sections
    const sections = [];
    const sectionsContainer = document.getElementById('content-sections');

    for (let i = 1; i <= sectionsContainer.children.length; i++) {
      const sectionHeader = formData.get(`section-header-${i}`);
      const sectionH2 = formData.get(`section-h2-${i}`);
      const sectionH3 = formData.get(`section-h3-${i}`);
      const sectionContent = formData.get(`section-content-${i}`);

      if (sectionHeader && sectionContent) {
        const section = {
          header: sectionHeader,
          content: sectionContent
        };

        // Add optional headers if they exist
        if (sectionH2) section.h2 = sectionH2;
        if (sectionH3) section.h3 = sectionH3;

        sections.push(section);
      }
    }

    const data = {
      header: {
        title: formData.get('title'),
        subtitle: formData.get('description')  // Changed from subtitle to description
      },
      sections: sections,
      tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => ({
        label: tag.trim(),
        value: tag.trim().toLowerCase()
      })).filter(tag => tag.label) : [],
      seo: {
        metaTitle: formData.get('metaTitle') || '',
        metaDescription: formData.get('metaDescription') || '',
        keywords: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : []
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

      const totalViews = posts.reduce((sum, post) => sum + (post.multiViews || 0), 0);

      document.getElementById('total-posts').textContent = posts.length;
      document.getElementById('total-views').textContent = totalViews;
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }
}

// Initialize app
let moderatorApp;

document.addEventListener('DOMContentLoaded', () => {
  moderatorApp = new ModeratorApp();
  window.moderatorApp = moderatorApp; // Make it globally accessible
});

export { api };
