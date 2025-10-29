// Import configuration
import { API_URL } from '../config.js';
import { updateSEO, resetToDefaultSEO, generateArticleSEO } from '../utils/seo.js';

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

export function initLandingPage() {
  const contentArea = document.querySelector('#content');

  // Setup page unload tracking (for when user closes browser/tab)
  setupPageUnloadTracking();

  contentArea.innerHTML = `
    <!-- Header -->
    <header class="main-header">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo header-title" onclick="window.location.reload()">dars<span class="highlight">linker</span></div>
        </div>

        <nav class="header-nav">
          <a href="#" class="nav-link active" onclick="return false;">Asosiy</a>
          <a href="#" class="nav-link" onclick="navigateToBlog(); return false;">Blog</a>
        </nav>
      </div>
    </header>

    <!-- Landing Articles Section -->
    <section class="landing-articles-section">
      <div class="container">
        <h2 class="landing-title">O'qituvchilar uchun maqolalar</h2>

        <div class="landing-articles-grid" id="landingArticlesGrid">
          <!-- 6 articles will be loaded here -->
          <div class="loading"><div class="loading-spinner"></div>Maqolalar yuklanmoqda...</div>
        </div>

        <div class="blog-section-action">
          <button class="btn-blog-section" onclick="navigateToBlog()">Blog bo'limiga o'tish</button>
        </div>
      </div>
    </section>

    <!-- Neon Dots Background -->
    <div class="neon-dots-container" id="neonDotsContainer"></div>
  `;

  // Reset SEO to default (homepage)
  resetToDefaultSEO();

  // Load 6 articles for landing page
  loadLandingArticles();

  // Initialize neon dots
  createNeonDots();

  // Add landing page specific styles
  addLandingPageStyles();
}

async function loadLandingArticles() {
  const articlesGrid = document.getElementById('landingArticlesGrid');

  try {
    const response = await fetch(`${API_URL}/blogs`);
    const data = await response.json();

    if (data.message === 'success' && data.data.length > 0) {
      // Take only first 6 articles
      const landingArticles = data.data.slice(0, 6);

      // Clear loading
      articlesGrid.innerHTML = '';

      // Display articles
      landingArticles.forEach((article, index) => {
        const articleCard = createLandingArticleCard(article, index);
        articlesGrid.appendChild(articleCard);
      });
    } else {
      articlesGrid.innerHTML = '<div class="loading">Maqolalar topilmadi.</div>';
    }
  } catch (error) {
    console.error('Error loading landing articles:', error);
    articlesGrid.innerHTML = '<div class="loading">Maqolalarni yuklashda xatolik yuz berdi.</div>';
  }
}

function createLandingArticleCard(article, index) {
  const card = document.createElement('div');
  card.className = 'landing-article-card';
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

// Global function for reading articles (reuse from blog.js)
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

      // Add header buttons and update header for article view
      const headerContent = document.querySelector('.header-content');
      const existingBackButton = document.querySelector('.back-to-landing-btn-header');
      const existingShareButton = document.querySelector('.share-btn-header');

      // Hide any existing landing title and section anywhere on page
      const landingTitles = document.querySelectorAll('.landing-title, h2.landing-title, .section-title');
      landingTitles.forEach(title => {
        title.style.display = 'none';
      });

      const landingSections = document.querySelectorAll('.landing-articles-section');
      landingSections.forEach(section => {
        section.style.display = 'none';
      });

      // Also hide any header titles that might be in the middle of header
      const headerTitles = document.querySelectorAll('.header-content h1, .header-content h2, .header-content .title, .header-content .section-title');
      headerTitles.forEach(title => {
        title.style.display = 'none';
      });

      // Clean header content completely and rebuild it
      if (headerContent) {
        // Save the logo and nav
        const logoContainer = headerContent.querySelector('.logo-container');
        const headerNav = headerContent.querySelector('.header-nav');

        // Clear everything else in header
        headerContent.innerHTML = '';

        // Add back only logo and nav
        if (logoContainer) headerContent.appendChild(logoContainer);
        if (headerNav) headerContent.appendChild(headerNav);
      }

      if (!existingBackButton && !existingShareButton) {
        headerContent.insertAdjacentHTML('beforeend', `
          <div class="header-buttons-group">
            <button class="share-btn-header" onclick="openShareModal('${articleId}', '${article.title.replace(/'/g, "\\'")}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              <span>Ulashish</span>
            </button>
            <button class="back-to-landing-btn-header" onclick="goBackToLanding()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              <span>Bosh sahifa</span>
            </button>
          </div>
        `);
      }

      // Update browser URL for sharing
      const articleUrl = `${window.location.origin}/blog/${articleId}`;
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

// Function to go back to landing
window.goBackToLanding = function() {
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

  // Reset URL to landing home
  window.history.pushState({}, '', `${window.location.origin}/`);

  // Restore landing page
  initLandingPage();
};

// Function to navigate to blog page
window.navigateToBlog = function() {
  // Track view if eligible before leaving
  trackViewIfEligible();

  // Navigate to blog page
  window.location.href = `${window.location.origin}/blog`;
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
  const articleUrl = `${window.location.origin}/blog/${articleId}`;

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

function addLandingPageStyles() {
  // Remove existing landing styles if any
  const existingStyle = document.getElementById('landing-page-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'landing-page-styles';
  style.textContent = `
    /* Landing Page Styles */
    .main-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(35, 35, 35, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(126, 162, 212, 0.2);
      z-index: 1000;
      padding: 0;
      transition: all 0.3s ease;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.75rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex: 0 0 auto;
    }

    .logo {
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff;
      cursor: pointer;
      transition: text-shadow 0.3s ease;
      user-select: none;
    }

    .logo .highlight {
      color: #7EA2D4;
    }

    .logo:hover {
      text-shadow: 0 0 20px rgba(126, 162, 212, 0.5);
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      font-size: 18px;
      font-weight: 500;
      padding: 10px 15px;
      border-radius: 6px;
      transition: all 0.3s ease;
      cursor: pointer;
      user-select: none;
    }

    .nav-link:hover {
      color: rgba(255, 255, 255, 0.9);
    }

    .nav-link.active {
      color: #ffffff;
    }

    .nav-link:active {
      color: rgba(255, 255, 255, 1);
      transform: translateY(0);
    }

    .landing-articles-section {
      min-height: auto;
      background: #232323;
      color: white;
      padding: 5px 0 20px 0;
      position: relative;
      overflow: hidden;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .landing-title {
      font-size: 2rem;
      font-weight: 700;
      text-align: center;
      color: #ffffff;
      margin-bottom: 1.5rem;
      text-shadow: 0 0 20px rgba(126, 162, 212, 0.3);
    }

    .landing-articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .landing-article-card {
      background: rgba(58, 56, 56, 0.3);
      border: 2px solid rgba(126, 162, 212, 0.4);
      border-radius: 16px;
      padding: 2rem;
      transition: all 0.3s ease;
      height: auto;
      min-height: 200px;
      display: flex;
      flex-direction: column;
    }

    .landing-article-card:hover {
      transform: translateY(-10px);
      border-color: #7EA2D4;
      box-shadow: 0 20px 40px rgba(126, 162, 212, 0.3);
      background: rgba(58, 56, 56, 0.5);
    }

    .article-header h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    .article-content p {
      color: #a0a0a0;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      flex: 1;
    }

    .article-meta {
      margin-top: auto;
    }

    .article-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #7EA2D4;
    }

    .views {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .blog-section-action {
      text-align: center;
      margin-top: 1rem;
    }

    .btn-blog-section {
      background: linear-gradient(135deg, #538bdb, #7ea2d4, #538bdb);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 6px 20px rgba(126, 162, 212, 0.3);
      position: relative;
      overflow: hidden;
    }

    .btn-blog-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.3s ease;
    }

    .btn-blog-section:hover::before {
      left: 100%;
    }

    .btn-blog-section:hover {
      background: linear-gradient(135deg, #4a7bb8, #6891c4, #4a7bb8);
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(126, 162, 212, 0.5);
    }

    /* Floating decorations removed */

    /* Loading animation */
    .loading {
      text-align: center;
      color: #7EA2D4;
      font-size: 1.2rem;
      padding: 3rem;
    }

    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(126, 162, 212, 0.3);
      border-radius: 50%;
      border-top-color: #7EA2D4;
      animation: spin 1s ease-in-out infinite;
      margin-right: 10px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Neon dots */
    .neon-dots-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    .neon-dot {
      position: absolute;
      width: 6px;
      height: 6px;
      background: #7EA2D4;
      border-radius: 50%;
      box-shadow: 0 0 10px #7EA2D4, 0 0 20px #7EA2D4, 0 0 30px #7EA2D4;
    }

    .neon-dot.white {
      background: #ffffff;
      box-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff;
    }

    .neon-dot.blink {
      animation: blink 3s ease-in-out infinite;
    }

    .neon-dot.pulse {
      animation: pulse 4s ease-in-out infinite;
    }

    .neon-dot.float {
      animation: dotFloat 5s ease-in-out infinite;
    }

    .neon-dot.glow {
      animation: glow 6s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.7; }
    }

    @keyframes dotFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
      50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .header-content {
        padding: 1rem;
      }

      .header-title {
        font-size: 1.5rem;
      }

      .landing-title {
        font-size: 2rem;
      }

      .landing-articles-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .container {
        padding: 0 1rem;
      }

      .nav-link {
        padding: 8px 12px;
        font-size: 16px;
      }

      .header-nav {
        gap: 0.5rem;
      }

      .logo {
        font-size: 1.5rem;
      }

      .btn-blog-section {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  `;

  document.head.appendChild(style);
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
      padding: 6rem 0 2rem 0;
    }

    /* Hide header title and landing title on article page */
    .full-article-page ~ * .header-title,
    .full-article-page .header-title {
      display: none !important;
    }

    /* Hide landing section completely on article page */
    .full-article-page .landing-articles-section,
    .full-article-page h2.landing-title,
    .full-article-page .landing-title {
      display: none !important;
    }

    /* Hide any remaining landing content on article page */
    body:has(.full-article-page) .landing-articles-section,
    body:has(.full-article-page) .landing-title,
    body:has(.full-article-page) h2.landing-title,
    .full-article-page ~ .landing-articles-section,
    .full-article-page + .landing-articles-section {
      display: none !important;
    }

    /* Global rule to hide landing section when article is open */
    .landing-articles-section:has(~ .full-article-page),
    .landing-title:has(~ .full-article-page) {
      display: none !important;
    }

    /* Hide any text content in header on article page */
    .full-article-page ~ * .header-content::before,
    .full-article-page ~ * .header-content::after,
    .header-content::before,
    .header-content::after {
      content: "" !important;
      display: none !important;
    }

    /* Hide any potential middle text in header */
    .full-article-page ~ * .header-content > *:not(.logo-container):not(.header-nav):not(.header-buttons-group) {
      display: none !important;
    }

    /* Header buttons group styling */
    .header-buttons-group {
      display: flex;
      align-items: center;
      gap: 12px;
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
    }

    .share-btn-header svg {
      transition: transform 0.3s ease;
    }

    /* Back button header - Border design */
    .back-to-landing-btn-header {
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

    .back-to-landing-btn-header:hover {
      background: #7EA2D4;
      color: white;
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
      white-space: pre-wrap;
    }

    /* Related Articles Section */
    #related-articles-section {
      margin-top: 10px;
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

      .header-buttons-group {
        gap: 6px;
      }

      .share-btn-header, .back-to-landing-btn-header {
        padding: 8px 12px;
        font-size: 12px;
        min-width: 100px;
      }

      .share-btn-header span, .back-to-landing-btn-header span {
        display: none;
      }

      .share-btn-header, .back-to-landing-btn-header {
        width: 36px;
        height: 36px;
        justify-content: center;
        padding: 8px;
      }
    }
  `;

  document.head.appendChild(style);
}