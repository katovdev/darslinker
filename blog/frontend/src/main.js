import './style.css';
import { initBlogPage } from './pages/blog.js';

class BlogApp {
  constructor() {
    this.init();
  }

  init() {
    console.log('Initializing Blog Frontend...');

    // Initialize blog page
    initBlogPage();
  }
}

// Start the blog app
new BlogApp();