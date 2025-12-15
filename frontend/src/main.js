import './style.css';
import { router } from './utils/router.js';
import { store } from './utils/store.js';
import { config } from './utils/config.js';
import { showToast, showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from './utils/toast.js';

import { initHomePage } from './pages/common/home.js';
import { initLoginPage } from './pages/auth/login.js';
import { initPasswordPage } from './pages/auth/password.js';
import { initRegisterPage } from './pages/auth/register.js';
import { initDashboard } from './pages/common/dashboard.js';
import { initStudentDashboard } from './pages/student/student-dashboard.js';
import { initPricingPage } from './pages/pricing.js';
import { initCourseDetailPage } from './pages/student/course-detail.js';
import { initCourseStartPage } from './pages/student/course-start.js';
import { initCourseLearningPage } from './pages/student/course-learning.js';
import { initLessonViewPage } from './pages/student/lesson-view.js';
import { initLessonPlayerPage } from './pages/student/lesson-player.js';
import { initCoursePaymentPage } from './pages/student/course-payment.js';
import { initBlogListPage } from './pages/blog/blog-list.js';
import { initBlogDetailPage } from './pages/blog/blog-detail.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    console.log(`Initializing ${config.app.name}...`);

    // Make toast functions globally available
    window.showToast = showToast;
    window.showSuccessToast = showSuccessToast;
    window.showErrorToast = showErrorToast;
    window.showWarningToast = showWarningToast;
    window.showInfoToast = showInfoToast;

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
    router.register('/course/:courseId', (params) => initCourseDetailPage(params.courseId));
    router.register('/course-start/:courseId', (params) => initCourseStartPage(params.courseId));
    router.register('/course-learning/:courseId', (params) => initCourseLearningPage(params.courseId));
    router.register('/lesson/:courseId/:lessonId', (params) => initLessonViewPage(params.courseId, params.lessonId));
    router.register('/lesson-player/:courseId/:lessonId', (params) => initLessonPlayerPage(params.courseId, params.lessonId));
    router.register('/course-payment/:courseId', (params) => initCoursePaymentPage(params.courseId));
    
    // Blog routes
    router.register('/blog', initBlogListPage);
    router.register('/blog/:blogId', (params) => initBlogDetailPage(params.blogId));

    router.register('/teacher/:teacherId/student-dashboard', (params) => {
      const teacherId = params.teacherId;
      console.log('📚 Loading student dashboard for teacher:', teacherId);
      
      // Save teacherId to sessionStorage
      sessionStorage.setItem('currentTeacherId', teacherId);
      
      // Load student dashboard
      import('./pages/student/landing-student-dashboard.js').then(module => {
        module.initLandingStudentDashboard();
      }).catch(err => {
        console.error('Error loading student dashboard:', err);
      });
    });

    router.register('*', () => {
      // Check if it's a teacher landing page
      const currentPath = window.location.pathname;
      
      // Check for teacher landing page pattern: /teacher/:teacherId
      const teacherPagePattern = /^\/teacher\/([a-zA-Z0-9]+)$/;
      const teacherMatch = currentPath.match(teacherPagePattern);
      
      if (teacherMatch) {
        const teacherId = teacherMatch[1];
        console.log('📄 Loading teacher landing page for ID:', teacherId);
        
        // Save teacherId to sessionStorage
        sessionStorage.setItem('currentTeacherId', teacherId);
        
        // Check if landing page function exists in dashboard.js
        if (typeof window.loadTeacherLandingPage === 'function') {
          window.loadTeacherLandingPage(teacherId);
        } else {
          // Load dashboard.js which contains the landing page function
          import('./pages/common/dashboard.js').then(() => {
            if (typeof window.loadTeacherLandingPage === 'function') {
              window.loadTeacherLandingPage(teacherId);
            }
          });
        }
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