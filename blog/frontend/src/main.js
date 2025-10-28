import './style.css';
import { initBlogPage } from './pages/blog.js';

class BlogApp {
  constructor() {
    this.init();
  }

  init() {
    console.log('Initializing Blog Frontend...');

    // Set URL path to /blog if we're on root path
    if (window.location.pathname === '/' || window.location.pathname === '') {
      const baseUrl = window.location.origin;
      const searchParams = window.location.search;
      const hash = window.location.hash;

      // Construct new URL with /blog path
      const newUrl = `${baseUrl}/blog${searchParams}${hash}`;

      // Update URL without page reload
      window.history.replaceState({}, '', newUrl);
    }

    // Check if URL contains article parameter
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('article');

    if (articleId) {
      // If article ID is in URL, show that specific article
      console.log('Loading article:', articleId);

      // First initialize the blog page structure
      initBlogPage();

      // Then open the specific article
      // Wait a bit for the page to initialize
      setTimeout(() => {
        if (window.openArticle) {
          window.openArticle(articleId);
        }
      }, 100);
    } else {
      // Initialize blog page normally (show all articles)
      initBlogPage();
    }
  }
}

// Start the blog app
new BlogApp();