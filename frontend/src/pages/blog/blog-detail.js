import { router } from '../../utils/router.js';
import blogAPI from '../../api/blog.api.js';

/**
 * Blog Detail Page
 * Shows individual blog post with full content
 */
export function initBlogDetailPage(blogId) {
  const app = document.querySelector('#app');
  
  // Make router available globally
  window.router = router;
  
  let blog = null;
  let relatedBlogs = [];
  let loading = true;

  app.innerHTML = `
    <div class="blog-detail-container">
      <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-container">
          <div class="spinner"></div>
          <p class="loading-text">Maqola yuklanmoqda...</p>
        </div>
      </div>
      
      <div class="blog-detail-content" id="blogContent" style="display: none;">
        <!-- Content will be loaded here -->
      </div>
    </div>

    <style>
      .blog-detail-container {
        min-height: 100vh;
        background: var(--bg-color);
      }

      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-color);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        flex-shrink: 0;
      }

      .loading-text {
        margin: 0;
        font-size: 1rem;
        color: var(--text-secondary);
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .blog-header {
        background: var(--bg-color);
        border-bottom: 1px solid var(--border-color);
        padding: 1rem 0;
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .blog-nav {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .back-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: none;
        border: none;
        color: var(--primary-color);
        cursor: pointer;
        font-size: 1rem;
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
      }

      .back-btn:hover {
        background: var(--primary-color);
        color: white;
      }

      .blog-article {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .blog-title {
        font-size: 2.5rem;
        color: var(--text-color);
        margin: 0 0 1rem 0;
        line-height: 1.2;
      }

      .blog-subtitle {
        font-size: 1.2rem;
        color: var(--text-secondary);
        margin: 0 0 2rem 0;
        line-height: 1.4;
        font-weight: 400;
      }

      .blog-meta {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding: 1rem 0;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 2rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .blog-meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .blog-content {
        line-height: 1.8;
        color: var(--text-color);
      }

      .blog-content h2 {
        color: var(--primary-color);
        font-size: 1.8rem;
        margin: 2rem 0 1rem 0;
        line-height: 1.3;
      }

      .blog-content h3 {
        color: var(--text-color);
        font-size: 1.4rem;
        margin: 1.5rem 0 0.8rem 0;
        line-height: 1.3;
      }

      .blog-content h4 {
        color: var(--text-color);
        font-size: 1.2rem;
        margin: 1rem 0 0.5rem 0;
        line-height: 1.3;
      }

      .blog-content p {
        margin: 0 0 1.5rem 0;
        line-height: 1.8;
      }

      .blog-content ul, .blog-content ol {
        margin: 0 0 1.5rem 0;
        padding-left: 2rem;
      }

      .blog-content li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
      }

      .blog-content blockquote {
        border-left: 4px solid var(--primary-color);
        padding: 1rem 1.5rem;
        margin: 2rem 0;
        background: var(--hover-bg);
        border-radius: 0 8px 8px 0;
        font-style: italic;
      }

      .blog-content code {
        background: var(--hover-bg);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
      }

      .blog-content pre {
        background: var(--hover-bg);
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        margin: 1.5rem 0;
      }

      .blog-content pre code {
        background: none;
        padding: 0;
      }

      .blog-tags {
        margin: 3rem 0 2rem 0;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
      }

      .blog-tags h4 {
        color: var(--text-color);
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
      }

      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .tag {
        background: var(--primary-color);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        text-decoration: none;
        transition: all 0.3s ease;
      }

      .tag:hover {
        background: var(--primary-hover);
        transform: translateY(-1px);
      }

      .related-blogs {
        margin-top: 4rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
      }

      .related-blogs h3 {
        color: var(--text-color);
        margin: 0 0 2rem 0;
        font-size: 1.5rem;
      }

      .related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .related-card {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .related-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-color);
      }

      .related-card h4 {
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        line-height: 1.3;
      }

      .related-card p {
        color: var(--text-secondary);
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .related-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }

      .error-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
      }

      .error-state h2 {
        color: var(--text-color);
        margin-bottom: 1rem;
      }

      .error-state p {
        margin-bottom: 2rem;
      }

      .error-state button {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
      }

      .error-state button:hover {
        background: var(--primary-hover);
      }

      @media (max-width: 768px) {
        .blog-article {
          padding: 1rem;
        }

        .blog-title {
          font-size: 2rem;
        }

        .blog-subtitle {
          font-size: 1.1rem;
        }

        .blog-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .related-grid {
          grid-template-columns: 1fr;
        }

        .tags-list {
          gap: 0.3rem;
        }

        .tag {
          font-size: 0.8rem;
          padding: 0.25rem 0.6rem;
        }
      }
    </style>
  `;

  // Initialize page
  initializePage();

  async function initializePage() {
    try {
      await loadBlog();
      await loadRelatedBlogs();
      hideLoading();
    } catch (error) {
      console.error('Failed to initialize blog detail page:', error);
      showError();
    }
  }

  async function loadBlog() {
    try {
      const response = await blogAPI.getBlogById(blogId);
      
      if (response.success) {
        blog = response.blog;
        renderBlog();
        
        // Track view
        blogAPI.trackBlogView(blogId).catch(err => {
          console.debug('View tracking failed:', err);
        });
      } else {
        throw new Error(response.message || 'Blog not found');
      }
    } catch (error) {
      console.error('Failed to load blog:', error);
      throw error;
    }
  }

  async function loadRelatedBlogs() {
    try {
      const response = await blogAPI.getRelatedBlogs(blogId, 3);
      
      if (response.success) {
        relatedBlogs = response.data || [];
      }
    } catch (error) {
      console.error('Failed to load related blogs:', error);
      // Don't throw - related blogs are optional
    }
  }

  function renderBlog() {
    if (!blog) return;

    const contentEl = document.getElementById('blogContent');
    
    contentEl.innerHTML = `
      <!-- Header -->
      <header class="blog-header">
        <div class="container">
          <div class="blog-nav">
            <button class="back-btn" onclick="router.navigate('/blog'); return false;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 19-7-7 7-7"/>
                <path d="m19 12H5"/>
              </svg>
              Blog
            </button>
          </div>
        </div>
      </header>

      <!-- Article -->
      <article class="blog-article">
        <h1 class="blog-title">${escapeHtml(blog.title)}</h1>
        
        ${blog.subtitle ? `<p class="blog-subtitle">${escapeHtml(blog.subtitle)}</p>` : ''}
        
        <div class="blog-meta">
          <div class="blog-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${formatDate(blog.createdAt)}
          </div>
          
          <div class="blog-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            ${blog.multiViews || 0} ko'rildi
          </div>
          
          ${blog.categoryId ? `
            <div class="blog-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              ${escapeHtml(blog.categoryId.name)}
            </div>
          ` : ''}
        </div>

        <div class="blog-content">
          ${renderBlogSections(blog.sections || [])}
        </div>

        ${blog.tags && blog.tags.length > 0 ? `
          <div class="blog-tags">
            <h4>Teglar:</h4>
            <div class="tags-list">
              ${blog.tags.map(tag => `
                <span class="tag">${escapeHtml(tag.label || tag.value || tag)}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${relatedBlogs.length > 0 ? `
          <div class="related-blogs">
            <h3>Shunga o'xshash maqolalar</h3>
            <div class="related-grid">
              ${relatedBlogs.map(relatedBlog => `
                <div class="related-card" onclick="openBlog('${relatedBlog.id}')">
                  <h4>${escapeHtml(relatedBlog.title)}</h4>
                  <p>${escapeHtml(relatedBlog.subtitle || '')}</p>
                  <div class="related-meta">
                    <span>${relatedBlog.multiViews || 0} ko'rildi</span>
                    <span>${formatDate(relatedBlog.createdAt)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </article>
    `;
  }

  function renderBlogSections(sections) {
    if (!sections || sections.length === 0) {
      return '<p>Maqola mazmuni mavjud emas.</p>';
    }

    return sections.map(section => {
      let html = '';
      
      if (section.header) {
        html += `<h2>${escapeHtml(section.header)}</h2>`;
      }
      
      if (section.h2) {
        html += `<h3>${escapeHtml(section.h2)}</h3>`;
      }
      
      if (section.h3) {
        html += `<h4>${escapeHtml(section.h3)}</h4>`;
      }
      
      if (section.content) {
        // Convert line breaks to paragraphs
        const paragraphs = section.content.split('\n').filter(p => p.trim());
        html += paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
      }
      
      return html;
    }).join('');
  }

  function hideLoading() {
    const loadingEl = document.getElementById('loadingOverlay');
    const contentEl = document.getElementById('blogContent');
    
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
    
    if (contentEl) {
      contentEl.style.display = 'block';
    }
  }

  function showError() {
    const container = document.querySelector('.blog-detail-container');
    container.innerHTML = `
      <div class="error-state">
        <h2>Maqola topilmadi</h2>
        <p>Kechirasiz, siz qidirayotgan maqola mavjud emas yoki o'chirilgan.</p>
        <button onclick="router.navigate('/blog'); return false;">
          Blog sahifasiga qaytish
        </button>
      </div>
    `;
  }

  // Global functions
  window.openBlog = (blogId) => {
    router.navigate(`/blog/${blogId}`);
  };

  // Utility functions
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return '';
    }
  }
}