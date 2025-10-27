// Import images
import darslinkerLogo from '../assets/images/darslinker.png';
import image0010 from '../assets/images/0010 1.png';
import image0005 from '../assets/images/0005 1.png';

// Global variables for pagination
let allArticles = [];
let currentPage = 0;
const articlesPerPage = 6;

export function initBlogPage() {
  const contentArea = document.querySelector('#content');

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
    articlesGrid.innerHTML = '<div class="loading">Loading articles...</div>';
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs`);
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
      articlesGrid.innerHTML = '<div class="loading">No articles found. Create your first article in the moderator panel!</div>';
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading articles:', error);
    articlesGrid.innerHTML = '<div class="loading">Error loading articles. Please check the backend connection.</div>';
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
      <button class="read-more-btn" onclick="openArticle('${article.id}')">
        Batafsil o'qish
      </button>
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${articleId}`);
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
      const articleUrl = `${window.location.origin}/?article=${articleId}`;
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

      // Scroll to top of page
      window.scrollTo(0, 0);

      // Track view
      fetch(`${import.meta.env.VITE_API_URL}/blogs/${articleId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.log('View tracking failed:', err));

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
      margin: 0 auto !important;
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
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(126, 162, 212, 0.5);
    }

    .share-btn-header svg {
      transition: transform 0.3s ease;
    }

    .share-btn-header:hover svg {
      transform: rotate(360deg) scale(1.1);
    }

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
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(126, 162, 212, 0.3);
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
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.8rem;
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

      /* Mobile header buttons styling */
      .header-buttons-group {
        gap: 8px;
        flex-wrap: wrap;
      }

      .share-btn-header {
        padding: 10px 14px;
        font-size: 12px;
        border-radius: 20px;
      }

      .share-btn-header span {
        display: none;
      }

      .back-to-blogs-btn-header {
        padding: 8px 12px;
        font-size: 12px;
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs`);
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
            <div class="related-article-card">
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
                <button class="related-read-btn" onclick="openArticle('${article.id}')">
                  Batafsil o'qish
                </button>
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

  // Reset URL to home
  window.history.pushState({}, '', window.location.origin);

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

// Social Media Sharing Functions
window.openShareModal = function(articleId, articleTitle) {
  const articleUrl = `${window.location.origin}/?article=${articleId}`;
  const encodedTitle = encodeURIComponent(articleTitle);
  const encodedUrl = encodeURIComponent(articleUrl);

  // Create modal if it doesn't exist
  let modal = document.getElementById('shareModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.className = 'share-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="share-modal-content">
      <div class="share-modal-header">
        <h3>Maqolani ulashing</h3>
        <button class="share-modal-close" onclick="closeShareModal()">&times;</button>
      </div>

      <div class="share-url-section">
        <label>Link:</label>
        <div class="share-url-input-group">
          <input type="text" id="shareUrl" value="${articleUrl}" readonly>
          <button class="copy-btn" onclick="copyToClipboard()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            Nusxalash
          </button>
        </div>
      </div>

      <div class="share-platforms">
        <h4>Ijtimoiy tarmoqlarda ulashing:</h4>
        <div class="share-buttons-grid">
          <button class="share-platform-btn telegram" onclick="shareToTelegram('${encodedUrl}', '${encodedTitle}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
            </svg>
            Telegram
          </button>

          <button class="share-platform-btn facebook" onclick="shareToFacebook('${encodedUrl}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>

          <button class="share-platform-btn twitter" onclick="shareToTwitter('${encodedUrl}', '${encodedTitle}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>

          <button class="share-platform-btn linkedin" onclick="shareToLinkedIn('${encodedUrl}', '${encodedTitle}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>

          <button class="share-platform-btn whatsapp" onclick="shareToWhatsApp('${encodedUrl}', '${encodedTitle}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp
          </button>

          <button class="share-platform-btn instagram" onclick="shareToInstagram('${encodedUrl}', '${encodedTitle}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </button>
        </div>
      </div>
    </div>
  `;

  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Add modal styles
  addShareModalStyles();
};

window.closeShareModal = function() {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
};

window.copyToClipboard = function() {
  const urlInput = document.getElementById('shareUrl');
  urlInput.select();
  urlInput.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(urlInput.value).then(() => {
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Nusxalandi!';
    copyBtn.style.background = '#4CAF50';

    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = '';
    }, 2000);
  });
};

// Social media sharing functions
window.shareToTelegram = function(url, title) {
  const text = `${decodeURIComponent(title)} - ${decodeURIComponent(url)}`;
  window.open(`https://t.me/share/url?url=${url}&text=${encodeURIComponent(text)}`, '_blank');
};

window.shareToFacebook = function(url) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
};

window.shareToTwitter = function(url, title) {
  const text = `${decodeURIComponent(title)} ${decodeURIComponent(url)}`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
};

window.shareToLinkedIn = function(url, title) {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
};

window.shareToWhatsApp = function(url, title) {
  const text = `${decodeURIComponent(title)} - ${decodeURIComponent(url)}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

window.shareToInstagram = function(url, title) {
  // Instagram doesn't have direct URL sharing, so copy to clipboard with instruction
  const text = `${decodeURIComponent(title)} - ${decodeURIComponent(url)}`;
  navigator.clipboard.writeText(text).then(() => {
    alert('Link nusxalandi! Instagram\'da story yoki post yaratishda pastega qoyishingiz mumkin.');
  });
};

function addShareModalStyles() {
  // Remove existing share modal styles if any
  const existingStyle = document.getElementById('share-modal-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'share-modal-styles';
  style.textContent = `
    .share-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      z-index: 10000;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .share-modal-content {
      background: #2a2a2a;
      border: 2px solid #7EA2D4;
      border-radius: 16px;
      padding: 30px;
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    }

    .share-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid rgba(126, 162, 212, 0.3);
    }

    .share-modal-header h3 {
      color: #7EA2D4;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    .share-modal-close {
      background: none;
      border: none;
      color: #7EA2D4;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      line-height: 1;
      transition: all 0.3s ease;
    }

    .share-modal-close:hover {
      color: #fff;
      transform: scale(1.1);
    }

    .share-url-section {
      margin-bottom: 25px;
    }

    .share-url-section label {
      display: block;
      color: #7EA2D4;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 1rem;
    }

    .share-url-input-group {
      display: flex;
      gap: 10px;
    }

    .share-url-input-group input {
      flex: 1;
      background: rgba(58, 56, 56, 0.5);
      border: 2px solid rgba(126, 162, 212, 0.3);
      border-radius: 8px;
      padding: 12px 15px;
      color: #fff;
      font-size: 14px;
      outline: none;
      transition: all 0.3s ease;
    }

    .share-url-input-group input:focus {
      border-color: #7EA2D4;
      background: rgba(58, 56, 56, 0.7);
    }

    .copy-btn {
      background: #7EA2D4;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .copy-btn:hover {
      background: #5a7db8;
      transform: translateY(-2px);
    }

    .share-platforms h4 {
      color: #7EA2D4;
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 15px;
    }

    .share-buttons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .share-platform-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #fff;
    }

    .share-platform-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .share-platform-btn.telegram {
      background: linear-gradient(135deg, #229ED9, #0088cc);
    }

    .share-platform-btn.telegram:hover {
      box-shadow: 0 8px 20px rgba(34, 158, 217, 0.4);
    }

    .share-platform-btn.facebook {
      background: linear-gradient(135deg, #1877F2, #166fe5);
    }

    .share-platform-btn.facebook:hover {
      box-shadow: 0 8px 20px rgba(24, 119, 242, 0.4);
    }

    .share-platform-btn.twitter {
      background: linear-gradient(135deg, #1DA1F2, #0d8bd9);
    }

    .share-platform-btn.twitter:hover {
      box-shadow: 0 8px 20px rgba(29, 161, 242, 0.4);
    }

    .share-platform-btn.linkedin {
      background: linear-gradient(135deg, #0A66C2, #004182);
    }

    .share-platform-btn.linkedin:hover {
      box-shadow: 0 8px 20px rgba(10, 102, 194, 0.4);
    }

    .share-platform-btn.whatsapp {
      background: linear-gradient(135deg, #25D366, #128C7E);
    }

    .share-platform-btn.whatsapp:hover {
      box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
    }

    .share-platform-btn.instagram {
      background: linear-gradient(135deg, #E4405F, #C13584, #833AB4);
    }

    .share-platform-btn.instagram:hover {
      box-shadow: 0 8px 20px rgba(228, 64, 95, 0.4);
    }

    @media (max-width: 768px) {
      .share-modal {
        padding: 15px;
      }

      .share-modal-content {
        padding: 20px;
        max-height: 85vh;
      }

      .share-url-input-group {
        flex-direction: column;
      }

      .share-buttons-grid {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .share-platform-btn {
        padding: 14px 20px;
        font-size: 15px;
      }
    }

  `;

  document.head.appendChild(style);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('shareModal');
  if (modal && event.target === modal) {
    closeShareModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeShareModal();
  }
});