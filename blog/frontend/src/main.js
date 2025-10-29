import './style.css';
import { initBlogPage } from './pages/blog.js';
import { initLandingPage } from './pages/landing.js';

class BlogApp {
  constructor() {
    this.init();
  }

  init() {
    console.log('Initializing Blog Frontend...');

    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('article');

    // Check for new URL format /blog/articleId
    const blogPathMatch = currentPath.match(/^\/blog\/([^\/]+)$/);
    const articleIdFromPath = blogPathMatch ? blogPathMatch[1] : null;

    if (articleId || articleIdFromPath) {
      // If article ID is in URL (either old or new format), show that specific article
      const targetArticleId = articleIdFromPath || articleId;
      console.log('Loading article:', targetArticleId);

      // Check if we're on root path or blog path
      if (currentPath === '/' || currentPath === '' || articleId) {
        // Initialize landing page structure first for old format or root
        initLandingPage();
      } else {
        // Initialize blog page structure first for new format
        initBlogPage();
      }

      // Then open the specific article
      // Wait a bit for the page to initialize
      setTimeout(() => {
        if (window.openArticle) {
          window.openArticle(targetArticleId);
        }
      }, 100);
    } else {
      // Check what page to show based on URL path
      if (currentPath === '/blog') {
        // Show blog page with all articles
        initBlogPage();
      } else if (currentPath === '/' || currentPath === '') {
        // Show landing page with 6 articles
        initLandingPage();
      } else {
        // Default to landing page for any other path
        window.history.replaceState({}, '', '/');
        initLandingPage();
      }
    }
  }
}

// Start the blog app
new BlogApp();