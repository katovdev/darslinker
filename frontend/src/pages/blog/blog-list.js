import { router } from '../../utils/router.js';
import blogAPI from '../../api/blog.api.js';

/**
 * Blog List Page
 * Shows all blog posts with pagination and filtering
 */
export function initBlogListPage() {
  const app = document.querySelector('#app');
  
  // Make router available globally
  window.router = router;
  
  let currentPage = 1;
  let currentSearch = '';
  let currentCategory = '';
  let blogs = [];
  let categories = [];
  let pagination = {};
  let loading = false;

  app.innerHTML = `
    <!-- Header -->
    <header class="blog-header">
      <div class="container">
        <div class="blog-nav">
          <button class="back-btn" onclick="router.navigate('/'); return false;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 19-7-7 7-7"/>
              <path d="m19 12H5"/>
            </svg>
            Bosh sahifa
          </button>
          <h1>Blog</h1>
        </div>
      </div>
    </header>

    <!-- Blog Content -->
    <main class="blog-main">
      <div class="container">
        <!-- Filters -->
        <div class="blog-filters">
          <div class="search-box">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Maqolalarni qidirish..." 
              value="${currentSearch}"
            />
            <button id="searchBtn" class="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
          
          <div class="category-filter">
            <select id="categorySelect">
              <option value="">Barcha kategoriyalar</option>
            </select>
          </div>
        </div>

        <!-- Blog Grid -->
        <div class="blog-grid" id="blogGrid">
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">Yuklanmoqda...</div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" id="pagination" style="display: none;">
          <!-- Pagination buttons will be inserted here -->
        </div>
      </div>
    </main>

    <style>
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

      .blog-nav h1 {
        color: var(--text-color);
        margin: 0;
        font-size: 2rem;
      }

      .blog-main {
        padding: 2rem 0;
        min-height: 80vh;
      }

      .blog-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .search-box {
        display: flex;
        flex: 1;
        min-width: 300px;
        position: relative;
      }

      .search-box input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        font-size: 1rem;
        background: var(--bg-color);
        color: var(--text-color);
      }

      .search-box input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .search-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
      }

      .search-btn:hover {
        color: var(--primary-color);
        background: var(--hover-bg);
      }

      .category-filter select {
        padding: 0.75rem 1rem;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        font-size: 1rem;
        background: var(--bg-color);
        color: var(--text-color);
        min-width: 200px;
      }

      .category-filter select:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
      }

      .blog-card {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        cursor: pointer;
        height: 240px;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .blog-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-color);
      }

      .blog-card h3 {
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        line-height: 1.3;
        height: 2.6rem;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        flex-shrink: 0;
      }

      .blog-card p {
        color: var(--text-secondary);
        margin: 0 0 1rem 0;
        line-height: 1.4;
        font-size: 0.9rem;
        height: 4.2rem;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        flex: 1;
      }

      .blog-card h3 {
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        line-height: 1.3;
        height: 2.6rem;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        flex-shrink: 0;
        position: relative;
        padding-bottom: 0.8rem;
      }

      .blog-card h3::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: -10px;
        right: -10px;
        height: 2px;
        background: linear-gradient(90deg, #7EA2D4, rgba(126, 162, 212, 0.5), #7EA2D4);
        border-radius: 1px;
      }
        right: 0;
        height: 1px;
        background: rgba(126, 162, 212, 0.3);
      }

      .blog-meta {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .blog-stats {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .blog-stats span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .blog-stats svg {
        width: 12px;
        height: 12px;
        flex-shrink: 0;
      }

      .blog-date {
        font-size: 0.75rem;
      }

      .loading-container {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem;
        text-align: center;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        color: var(--text-secondary);
        font-size: 1.1rem;
        margin: 0;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-top: 2rem;
      }

      .pagination button {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        background: var(--bg-color);
        color: var(--text-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .pagination button:hover:not(:disabled) {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .pagination button.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .pagination-info {
        margin: 0 1rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
      }

      .empty-state h3 {
        color: var(--text-color);
        margin-bottom: 1rem;
      }

      .empty-state p {
        margin-bottom: 2rem;
      }

      .empty-state button {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
      }

      .empty-state button:hover {
        background: var(--primary-hover);
      }

      @media (max-width: 768px) {
        .blog-filters {
          flex-direction: column;
        }

        .search-box {
          min-width: auto;
        }

        .blog-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .blog-card {
          height: 260px;
          padding: 1rem;
        }

        .blog-card h3 {
          font-size: 1rem;
        }

        .blog-card p {
          font-size: 0.85rem;
        }

        .blog-meta {
          font-size: 0.75rem;
        }

        .blog-stats {
          gap: 0.5rem;
        }

        .blog-stats span {
          min-width: 50px;
        }

        .blog-date {
          min-width: 70px;
        }

        .blog-nav h1 {
          font-size: 1.5rem;
        }

        .pagination {
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .pagination button {
          padding: 0.4rem 0.8rem;
          font-size: 0.9rem;
        }
      }
    </style>
  `;

  // Initialize page
  initializePage();

  async function initializePage() {
    await loadCategories();
    await loadBlogs();
    setupEventListeners();
  }

  async function loadCategories() {
    try {
      const response = await blogAPI.getCategories();
      if (response.success) {
        categories = response.data;
        renderCategoryOptions();
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  function renderCategoryOptions() {
    const select = document.getElementById('categorySelect');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Barcha kategoriyalar</option>';
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      if (category.id === currentValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  async function loadBlogs() {
    if (loading) return;
    
    loading = true;
    const grid = document.getElementById('blogGrid');
    
    if (currentPage === 1) {
      grid.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <div class="loading-text">Yuklanmoqda...</div>
        </div>
      `;
    }

    try {
      const params = {
        page: currentPage,
        limit: 12
      };

      if (currentSearch) params.search = currentSearch;
      if (currentCategory) params.category = currentCategory;

      const response = await blogAPI.getAllBlogs(params);
      
      if (response.success) {
        blogs = response.data;
        pagination = response.pagination || {};
        renderBlogs();
        renderPagination();
      } else {
        throw new Error(response.message || 'Failed to load blogs');
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
      grid.innerHTML = `
        <div class="empty-state">
          <h3>Xatolik yuz berdi</h3>
          <p>Maqolalarni yuklashda muammo bo'ldi. Iltimos, qaytadan urinib ko'ring.</p>
          <button onclick="loadBlogs()">Qayta urinish</button>
        </div>
      `;
    } finally {
      loading = false;
    }
  }

  function renderBlogs() {
    const grid = document.getElementById('blogGrid');
    
    if (!blogs || blogs.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>Maqolalar topilmadi</h3>
          <p>Hozircha bu bo'limda maqolalar mavjud emas yoki qidiruv natijasida hech narsa topilmadi.</p>
          <button onclick="clearFilters()">Filtrlarni tozalash</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = blogs.map(blog => `
      <div class="blog-card" onclick="openBlog('${blog.id}')">
        <h3>${escapeHtml(blog.title)}</h3>
        <p>${escapeHtml(blog.subtitle || '')}</p>
        <div class="blog-meta">
          <div class="blog-stats">
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              ${blog.multiViews || 0}
            </span>
            <span class="blog-date">${formatDate(blog.createdAt)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderPagination() {
    const paginationEl = document.getElementById('pagination');
    
    if (!pagination.pages || pagination.pages <= 1) {
      paginationEl.style.display = 'none';
      return;
    }

    paginationEl.style.display = 'flex';
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
      <button onclick="goToPage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>
        Oldingi
      </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    
    if (startPage > 1) {
      paginationHTML += `<button onclick="goToPage(1)">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="pagination-dots">...</span>`;
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button onclick="goToPage(${i})" ${i === pagination.page ? 'class="active"' : ''}>
          ${i}
        </button>
      `;
    }
    
    if (endPage < pagination.pages) {
      if (endPage < pagination.pages - 1) {
        paginationHTML += `<span class="pagination-dots">...</span>`;
      }
      paginationHTML += `<button onclick="goToPage(${pagination.pages})">${pagination.pages}</button>`;
    }
    
    // Next button
    paginationHTML += `
      <button onclick="goToPage(${pagination.page + 1})" ${pagination.page >= pagination.pages ? 'disabled' : ''}>
        Keyingi
      </button>
    `;
    
    // Pagination info
    paginationHTML += `
      <div class="pagination-info">
        ${pagination.page} / ${pagination.pages} (${pagination.total} ta maqola)
      </div>
    `;
    
    paginationEl.innerHTML = paginationHTML;
  }

  function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });

    // Category filter
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      currentPage = 1;
      loadBlogs();
    });
  }

  function performSearch() {
    const searchInput = document.getElementById('searchInput');
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    loadBlogs();
  }

  // Global functions
  window.goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages && page !== currentPage) {
      currentPage = page;
      loadBlogs();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  window.clearFilters = () => {
    currentSearch = '';
    currentCategory = '';
    currentPage = 1;
    document.getElementById('searchInput').value = '';
    document.getElementById('categorySelect').value = '';
    loadBlogs();
  };

  window.openBlog = (blogId) => {
    console.log('🔗 Blog card clicked from blog list:', blogId);
    
    // Navigate immediately to blog detail page
    // The blog detail page will handle the 10-second view tracking
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