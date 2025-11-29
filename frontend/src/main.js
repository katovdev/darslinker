import './style.css';
import { router } from './utils/router.js';
import { store } from './utils/store.js';
import { config } from './utils/config.js';

import { initHomePage } from './pages/common/home.js';
import { initLoginPage } from './pages/auth/login.js';
import { initPasswordPage } from './pages/auth/password.js';
import { initRegisterPage } from './pages/auth/register.js';
import { initDashboard } from './pages/common/dashboard.js';
import { initStudentDashboard } from './pages/student/student-dashboard.js';
import { initPricingPage } from './pages/pricing.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    console.log(`Initializing ${config.app.name}...`);

    this.setupRoutes();

    store.subscribe((state) => {
      console.log('State updated:', state);
    });

    router.init();
  }

  setupRoutes() {
    router.register('/', initHomePage);
    router.register('/login', initLoginPage);
    router.register('/password', initPasswordPage);
    router.register('/register', initRegisterPage);
    router.register('/dashboard', initDashboard);
    router.register('/student-dashboard', initStudentDashboard);
    router.register('/pricing', initPricingPage);

    router.register('*', () => {
      // Check if it's a teacher landing page or student dashboard
      const currentPath = window.location.pathname;
      
      // Check for student dashboard pattern: /teacher/:teacherId/student-dashboard
      const studentDashboardPattern = /^\/teacher\/([a-zA-Z0-9]+)\/student-dashboard$/;
      const studentMatch = currentPath.match(studentDashboardPattern);
      
      if (studentMatch) {
        const teacherId = studentMatch[1];
        console.log('📚 Loading student dashboard for teacher:', teacherId);
        
        // Save teacherId to sessionStorage
        sessionStorage.setItem('currentTeacherId', teacherId);
        
        // Load student dashboard
        import('./pages/student/landing-student-dashboard.js').then(module => {
          module.initLandingStudentDashboard();
        }).catch(err => {
          console.error('Error loading student dashboard:', err);
        });
        return;
      }
      
      // Check for teacher landing page pattern: /teacher/:teacherId
      const teacherPagePattern = /^\/teacher\/([a-zA-Z0-9]+)$/;
      const teacherMatch = currentPath.match(teacherPagePattern);
      
      if (teacherMatch) {
        const teacherId = teacherMatch[1];
        console.log('📄 Loading teacher landing page for ID:', teacherId);
        
        // Save teacherId to sessionStorage
        sessionStorage.setItem('currentTeacherId', teacherId);
        
        // Load teacher landing page
        initDashboard();
        return;
      }
      
      // Default 404 page
      document.querySelector('#app').innerHTML = `
        <div class="error-page">
          <h1>404 - Sahifa topilmadi</h1>
          <p>Siz qidirayotgan sahifa mavjud emas.</p>
          <a href="/" onclick="router.navigate('/'); return false;">Bosh sahifaga qaytish</a>
        </div>
      `;
    });
  }
}

new App();