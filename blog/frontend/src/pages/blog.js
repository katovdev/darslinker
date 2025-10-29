// Import images
import darslinkerLogo from '../assets/images/darslinker.png';
import image0010 from '../assets/images/0010 1.png';
import image0005 from '../assets/images/0005 1.png';
import { API_URL } from '../config.js';
import { updateSEO, resetToDefaultSEO, generateArticleSEO } from '../utils/seo.js';

// Global variables for pagination
let allArticles = [];
let currentPage = 0;
const articlesPerPage = 6;

// View tracking variables
let currentViewTimer = null;
let currentArticleId = null;
let viewEligible = false;
const VIEW_DELAY = 10000; // 10 seconds

// View tracking functions
function startViewTimer(articleId) {
  // Clear any existing timer
  clearViewTimer();

  // Set current article
  currentArticleId = articleId;
  viewEligible = false;

  console.log(`Starting view timer for article ${articleId} (${VIEW_DELAY / 1000} seconds)`);

  // Start new timer
  currentViewTimer = setTimeout(() => {
    viewEligible = true;
    console.log(`View timer completed for article ${articleId} - eligible for view tracking`);
  }, VIEW_DELAY);
}

function clearViewTimer() {
  if (currentViewTimer) {
    clearTimeout(currentViewTimer);
    currentViewTimer = null;
  }
  viewEligible = false;
}

function trackViewIfEligible() {
  if (viewEligible && currentArticleId) {
    console.log(`Tracking view for article ${currentArticleId}`);

    fetch(`${API_URL}/blogs/${currentArticleId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(() => {
      console.log(`View tracked successfully for article ${currentArticleId}`);
    }).catch(err => {
      console.error('View tracking failed:', err);
    });

    // Reset tracking state
    clearViewTimer();
    currentArticleId = null;
  }
}

function setupPageUnloadTracking() {
  // Track view on page unload (browser close, navigation, etc.)
  window.addEventListener('beforeunload', () => {
    if (viewEligible && currentArticleId) {
      // Use sendBeacon for reliable tracking on page unload
      const data = JSON.stringify({});
      navigator.sendBeacon(`${API_URL}/blogs/${currentArticleId}/view`, data);
      console.log(`View tracked via beacon for article ${currentArticleId} on page unload`);
    }
  });

  // Also track on visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackViewIfEligible();
    }
  });
}

export function initBlogPage() {
  const contentArea = document.querySelector('#content');

  // Setup page unload tracking (for when user closes browser/tab)
  setupPageUnloadTracking();

  contentArea.innerHTML = `
    <!-- Blog Articles Section -->
    <section class="articles-section">
      <div class="container">
        <!-- 3D Floating Decorations -->
        <div class="floating-decorations">
          <div class="decoration-3d decoration-left">
            <img src="${image0010}" alt="3D Books Decoration" class="decoration-image" />
          </div>
          <div class="decoration-3d decoration-right">
            <img src="${image0005}" alt="3D Box Decoration" class="decoration-image" />
          </div>
        </div>

        <div class="articles-grid" id="articlesGrid">
          <!-- Articles will be loaded here -->
        </div>

        <div class="load-more-section">
          <button class="btn-load-more" id="loadMoreBtn">Ko'proq yuklash</button>
        </div>
      </div>
    </section>

    <!-- Neon Dots Background -->
    <div class="neon-dots-container" id="neonDotsContainer"></div>
  `;

  // Reset pagination
  allArticles = [];
  currentPage = 0;

  // Reset SEO to default (homepage)
  resetToDefaultSEO();

  // Load initial articles
  loadArticles();

  // Initialize load more functionality
  initLoadMore();

  // Initialize neon dots
  createNeonDots();
}

async function loadArticles() {
  const articlesGrid = document.getElementById('articlesGrid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  // Only show loading for initial load
  if (currentPage === 0) {
    articlesGrid.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Maqolalar yuklanmoqda...</div>';
  }

  try {
    const response = await fetch(`${API_URL}/blogs`);
    const data = await response.json();

    if (data.message === 'success' && data.data.length > 0) {
      allArticles = data.data;

      // Clear grid for initial load
      if (currentPage === 0) {
        articlesGrid.innerHTML = '';
      }

      displayArticlesPage();
      updateLoadMoreButton();
    } else {
      articlesGrid.innerHTML = '<div class="loading">Hech qanday maqola topilmadi.</div>';
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading articles:', error);
    articlesGrid.innerHTML = '<div class="loading">Maqolalarni yuklashda xatolik yuz berdi.</div>';
    loadMoreBtn.style.display = 'none';
  }
}

function displayArticlesPage() {
  const articlesGrid = document.getElementById('articlesGrid');
  const startIndex = currentPage * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const articlesToShow = allArticles.slice(startIndex, endIndex);

  articlesToShow.forEach((article, index) => {
    const articleCard = createArticleCard(article, startIndex + index);
    articlesGrid.appendChild(articleCard);
  });

  currentPage++;
}

function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const totalShown = currentPage * articlesPerPage;

  if (totalShown >= allArticles.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
    loadMoreBtn.textContent = 'Ko\'proq yuklash';
  }
}

function createArticleCard(article, index) {
  const card = document.createElement('div');
  card.className = 'article-card';
  card.style.cursor = 'pointer';

  // Make entire card clickable
  card.addEventListener('click', () => {
    openArticle(article.id);
  });

  // Format date to DD/MM/YYYY
  const date = new Date(article.createdAt).toLocaleDateString('en-GB');

  // Use subtitle (description) as preview content
  const content = article.subtitle || 'No description available';

  card.innerHTML = `
    <div class="article-header">
      <h3>${article.title}</h3>
    </div>

    <div class="article-content">
      <p>${content}</p>
    </div>

    <div class="article-meta">
      <div class="article-stats">
        <span class="views">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          ${(article.multiViews || 0).toLocaleString()}
        </span>
        <span class="date">${date}</span>
      </div>
    </div>
  `;

  return card;
}

function initLoadMore() {
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  loadMoreBtn.addEventListener('click', function() {
    // Show loading state
    const originalText = this.textContent;
    this.textContent = 'Yuklanmoqda...';
    this.disabled = true;

    // Add delay for smooth UX
    setTimeout(() => {
      // Load next page
      displayArticlesPage();
      updateLoadMoreButton();

      // Reset button state
      this.disabled = false;
    }, 500);
  });
}

// Global function for reading articles
window.openArticle = async function(articleId) {
  window.currentArticleId = articleId;
  await showArticlePage(articleId);
};

async function showArticlePage(articleId) {
  try {
    const response = await fetch(`${API_URL}/blogs/${articleId}`);
    const data = await response.json();

    if (data.message === 'success') {
      const article = data.blog;

      // Generate sections HTML
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

      // Add header buttons (only if they don't exist)
      const headerRight = document.querySelector('.header-content');
      const existingBackButton = document.querySelector('.back-to-blogs-btn-header');
      const existingShareButton = document.querySelector('.share-btn-header');

      if (!existingBackButton && !existingShareButton) {
        headerRight.insertAdjacentHTML('beforeend', `
          <div class="header-buttons-group">
            <button class="share-btn-header" onclick="openShareModal('${articleId}', '${article.title.replace(/'/g, "\\'")}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              <span>Ulashish</span>
            </button>
            <button class="back-to-blogs-btn-header" onclick="goBackToBlogs()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              <span>Barcha maqolalar</span>
            </button>
          </div>
        `);
      }

      // Update browser URL for sharing
      const articleUrl = `${window.location.origin}/blog?article=${articleId}`;
      window.history.pushState({ articleId }, article.title, articleUrl);

      // Replace entire content with article page
      const contentArea = document.querySelector('#content');
      contentArea.innerHTML = `
        <article class="full-article-page">
          <div class="article-container">
            <div class="article-content-wrapper">
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

              <!-- Related Articles Section -->
              <div id="related-articles-section">
                <h3 class="related-title">O'xshash maqolalar</h3>
                <div id="related-articles-grid" class="related-grid">
                  <!-- Related articles will be loaded here -->
                </div>
              </div>
            </div>
          </div>
        </article>
      `;

      // Add article page styles
      addArticlePageStyles();

      // Update SEO for this article
      const seoData = generateArticleSEO(article);
      updateSEO(seoData);

      // Scroll to top of page
      window.scrollTo(0, 0);

      // Track previous article if eligible before starting new one
      trackViewIfEligible();

      // Start view tracking timer (10 seconds)
      startViewTimer(articleId);

      // Load related articles automatically
      await loadRelatedArticles(article);

    }
  } catch (error) {
    console.error('Error opening article:', error);
    alert('Maqolani ochishda xatolik yuz berdi.');
  }
}

function addArticlePageStyles() {
  // Remove existing article styles if any
  const existingStyle = document.getElementById('article-page-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'article-page-styles';
  style.textContent = `
    .full-article-page {
      min-height: 100vh;
      background: #232323;
      color: white;
      padding: 2rem 0;
    }

    /* Hide header title on article page */
    .full-article-page ~ * .header-title,
    .header-title {
      display: none !important;
    }

    /* Header layout for article page */
    .full-article-page ~ * .header-content {
      justify-content: space-between !important;
      align-items: center !important;
    }

    .full-article-page ~ * .logo {
      position: static !important;
      transform: none !important;
      margin: 0 !important;
    }

    /* Header buttons group styling */
    .header-buttons-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: auto;
    }

    /* Share button header - Blue gradient design */
    .share-btn-header {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #538bdb, #7ea2d4, #538bdb);
      border: none;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(126, 162, 212, 0.3);
      position: relative;
      overflow: hidden;
      min-width: 120px;
      justify-content: center;
    }

    .share-btn-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.3s ease;
    }

    .share-btn-header:hover::before {
      left: 100%;
    }

    .share-btn-header:hover {
      background: linear-gradient(135deg, #4a7bb8, #6891c4, #4a7bb8);
      // transform: translateY(-2px);
      // box-shadow: 0 8px 25px rgba(126, 162, 212, 0.5);
    }

    .share-btn-header svg {
      transition: transform 0.3s ease;
    }

    // .share-btn-header:hover svg {
    //   transform: rotate(360deg) scale(1.1);
    // }

    /* Back button header - Border design */
    .back-to-blogs-btn-header {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(126, 162, 212, 0.1);
      border: 2px solid #7EA2D4;
      color: #7EA2D4;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      position: relative;
      min-width: 120px;
      justify-content: center;
    }

    .back-to-blogs-btn-header:hover {
      background: #7EA2D4;
      color: white;
      // transform: translateY(-2px);
      // box-shadow: 0 5px 15px rgba(126, 162, 212, 0.3);
    }

    .article-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 2rem;
    }


    .article-content-wrapper {
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
      color: #7EA2D4;
      font-weight: 500;
      font-size: 1.1rem;
    }

    .article-views {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .article-views svg {
      opacity: 0.8;
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
      color: #7EA2D4;
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


    /* Related Articles Section */
    #related-articles-section {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid rgba(126, 162, 212, 0.3);
    }

    .related-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #7EA2D4;
      text-align: center;
      margin-bottom: 2rem;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .related-article-card {
      background: rgba(58, 56, 56, 0.3);
      border: 2px solid rgba(126, 162, 212, 0.4);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      height: auto;
      min-height: 180px;
      display: flex;
      flex-direction: column;
    }

    .related-article-card:hover {
      transform: translateY(-5px);
      border-color: #7EA2D4;
      box-shadow: 0 10px 25px rgba(126, 162, 212, 0.3);
      background: rgba(58, 56, 56, 0.4);
    }

    .related-article-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.8rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .related-article-excerpt {
      color: #a0a0a0;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .related-article-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.8rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: auto;
    }

    .related-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      width: 100%;
    }

    .related-views {
      color: #7EA2D4;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .related-views svg {
      opacity: 0.8;
    }

    .related-date {
      color: #8a8a8a;
    }

    .related-read-btn {
      background: linear-gradient(135deg, #538bdb, #7ea2d4);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .related-read-btn:hover {
      background: linear-gradient(135deg, #538bdb, #7ea2d4);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(107, 123, 255, 0.4);
    }

    .no-related {
      text-align: center;
      color: #a0a0a0;
      font-style: italic;
      padding: 2rem;
      grid-column: 1 / -1;
    }

    @media (max-width: 768px) {
      .article-container {
        padding: 0 1rem;
      }

      .article-content-wrapper {
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

      .related-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .related-title {
        font-size: 1.5rem;
      }

      .related-article-card {
        padding: 1rem;
        min-height: 160px;
      }

      .related-article-title {
        font-size: 1.1rem;
      }

      .related-article-meta {
        flex-direction: column;
        gap: 0.8rem;
        align-items: stretch;
      }

      .related-stats {
        align-self: flex-start;
      }

      .related-read-btn {
        align-self: flex-end;
        padding: 10px 20px;
      }

      /* Mobile header layout - Article page override */
      @media (max-width: 768px) {
        .header-content {
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 0 20px !important;
        }

        .logo {
          font-size: 24px !important;
          margin: 0 !important;
        }

        .main-header {
          height: 60px !important;
          padding: 0 !important;
        }

        /* Force mobile button sizes */
        .header-buttons-group .share-btn-header {
          width: 50px !important;
          height: 28px !important;
          padding: 4px !important;
          font-size: 10px !important;
          border-radius: 6px !important;
          min-width: 28px !important;
        }

        .header-buttons-group .back-to-blogs-btn-header {
          width: 50px !important;
          height: 28px !important;
          padding: 4px !important;
          font-size: 10px !important;
          border-radius: 6px !important;
          min-width: 28px !important;
        }
      }

      .header-buttons-group {
        gap: 6px;
        flex-wrap: nowrap;
        margin-left: auto !important;
      }

      .share-btn-header {
        padding: 6px 8px !important;
        font-size: 11px !important;
        border-radius: 8px !important;
        width: 28px !important;
        height: 28px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .share-btn-header span {
        display: none;
      }

      .back-to-blogs-btn-header {
        padding: 6px 8px !important;
        font-size: 11px !important;
        border-radius: 8px !important;
        width: 28px !important;
        height: 28px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .back-to-blogs-btn-header span {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);
}

// Function to load related articles automatically
async function loadRelatedArticles(currentArticle) {
  try {
    const response = await fetch(`${API_URL}/blogs`);
    const data = await response.json();

    if (data.message === 'success') {
      // Get all tag values from current article
      const currentTags = currentArticle.tags.map(tag => tag.value);

      // Filter articles that have any matching tag and exclude current article
      const relatedArticles = data.data.filter(article =>
        article.id !== window.currentArticleId &&
        article.tags.some(tag => currentTags.includes(tag.value))
      );

      const relatedGrid = document.getElementById('related-articles-grid');

      if (relatedArticles.length > 0) {
        // Show maximum 3 related articles
        const articlesToShow = relatedArticles.slice(0, 3);

        relatedGrid.innerHTML = articlesToShow.map(article => {
          const date = new Date(article.createdAt).toLocaleDateString('en-GB');
          const content = article.subtitle || 'No description available';

          return `
            <div class="related-article-card" onclick="openArticle('${article.id}')" style="cursor: pointer;">
              <h4 class="related-article-title">${article.title}</h4>
              <p class="related-article-excerpt">${content}</p>
              <div class="related-article-meta">
                <div class="related-stats">
                  <span class="related-views">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    ${(article.multiViews || 0).toLocaleString()}
                  </span>
                  <span class="related-date">${date}</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        relatedGrid.innerHTML = '<p class="no-related">Bu mavzu bo\'yicha boshqa maqolalar topilmadi.</p>';
      }
    }
  } catch (error) {
    console.error('Error loading related articles:', error);
    const relatedGrid = document.getElementById('related-articles-grid');
    if (relatedGrid) {
      relatedGrid.innerHTML = '<p class="no-related">Maqolalarni yuklashda xatolik yuz berdi.</p>';
    }
  }
}

// Function to go back to blogs
window.goBackToBlogs = function() {
  // Track view if eligible before leaving
  trackViewIfEligible();

  // Remove article page styles
  const articleStyles = document.getElementById('article-page-styles');
  if (articleStyles) {
    articleStyles.remove();
  }

  // Remove header buttons group
  const headerButtonsGroup = document.querySelector('.header-buttons-group');
  if (headerButtonsGroup) {
    headerButtonsGroup.remove();
  }

  // Reset URL to blog home
  window.history.pushState({}, '', `${window.location.origin}/blog`);

  // Restore blog page instead of reloading
  initBlogPage();
};

// Function to create neon dots
function createNeonDots() {
  const container = document.getElementById('neonDotsContainer');
  if (!container) return;

  // Strategic positions for 10 dots - balanced distribution
  const positions = [
    { x: 15, y: 20 },    // Top left corner area
    { x: 85, y: 15 },    // Top right corner area
    { x: 20, y: 75 },    // Bottom left area
    { x: 75, y: 80 },    // Bottom right area
    { x: 45, y: 35 },    // Center-top area
    { x: 60, y: 65 },    // Center-bottom area
    { x: 5, y: 90 },     // Bottom left corner
    { x: 90, y: 85 },    // Bottom right corner
    { x: 30, y: 50 },    // Middle left
    { x: 70, y: 45 }     // Middle right
  ];

  const colors = ['blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'white'];

  const animations = ['blink', 'pulse', 'float', 'glow', 'blink', 'pulse', 'float', 'blink', 'pulse', 'glow'];

  positions.forEach((pos, i) => {
    const dot = document.createElement('div');
    dot.className = 'neon-dot';

    // Add color class - only white (blue is default)
    if (colors[i] === 'white') {
      dot.classList.add('white');
    }

    // Add animation class
    dot.classList.add(animations[i]);

    // Position the dot
    dot.style.left = pos.x + '%';
    dot.style.top = pos.y + '%';

    // Staggered animation delays
    dot.style.animationDelay = (i * 1.2) + 's';

    // Add slight random position offset for more natural look
    const randomOffsetX = (Math.random() - 0.5) * 3; // ±1.5% random offset
    const randomOffsetY = (Math.random() - 0.5) * 3;
    dot.style.left = (pos.x + randomOffsetX) + '%';
    dot.style.top = (pos.y + randomOffsetY) + '%';

    container.appendChild(dot);
  });
}

// Simple Web Share API Function
window.openShareModal = async function(articleId, articleTitle) {
  const articleUrl = `${window.location.origin}/?article=${articleId}`;

  // Use Web Share API when available (modern browsers and mobile devices)
  if (navigator.share) {
    try {
      await navigator.share({
        title: articleTitle,
        text: `${articleTitle} - Darslinker blog`,
        url: articleUrl
      });
    } catch (error) {
      // User cancelled the share or error occurred
      console.log('Sharing cancelled or failed:', error);
    }
  } else {
    // Fallback: Copy URL to clipboard for browsers without Web Share API
    try {
      await navigator.clipboard.writeText(articleUrl);
      alert('Link nusxalandi! Endi uni istalgan joyda pastege qoyishingiz mumkin.');
    } catch (error) {
      // If clipboard API also fails, show the URL
      prompt('Link nusxalash uchun Ctrl+C bosing:', articleUrl);
    }
  }
};
