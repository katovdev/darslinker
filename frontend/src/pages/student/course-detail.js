import { router } from '../../utils/router.js';
import { t } from '../../utils/i18n.js';

// Initialize course detail page
export async function initCourseDetailPage(courseId) {
  console.log('📚 Loading course detail for:', courseId);
  
  // Fetch course data
  const courseData = await fetchCourseData(courseId);
  
  if (!courseData) {
    showErrorPage();
    return;
  }
  
  renderCourseDetailPage(courseData);
}

// Fetch course data from API
async function fetchCourseData(courseId) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/courses/${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.success && result.course) {
      console.log('✅ Course data loaded:', result.course);
      return result.course;
    } else {
      console.error('❌ Failed to load course:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    return null;
  }
}

// Render course detail page
function renderCourseDetailPage(course) {
  const appElement = document.querySelector('#app');
  if (!appElement) return;
  
  // Get teacher name
  const teacherName = course.teacher 
    ? `${course.teacher.firstName || ''} ${course.teacher.lastName || ''}`.trim() || 'Instructor'
    : 'Instructor';
  
  // Get course image
  const courseImage = course.thumbnail || course.courseImage || '';
  
  // Calculate total lessons and duration
  let totalLessons = 0;
  let totalDuration = 0;
  
  if (course.modules && course.modules.length > 0) {
    course.modules.forEach(module => {
      if (module.lessons) {
        totalLessons += module.lessons.length;
        module.lessons.forEach(lesson => {
          // Parse duration (e.g., "10:30" or "10 min")
          if (lesson.duration) {
            const match = lesson.duration.match(/(\d+)/);
            if (match) {
              totalDuration += parseInt(match[1]);
            }
          }
        });
      }
    });
  }
  
  appElement.innerHTML = `
    <style>
      /* Reset */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: #232323;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow-x: hidden;
      }

      /* Header - Simplified */
      .course-detail-header {
        background: #232323;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
        padding: 20px 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 1000;
        backdrop-filter: blur(10px);
      }

      .course-detail-logo {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        cursor: pointer;
      }

      .course-detail-logo span {
        color: #7EA2D4;
      }

      .course-detail-auth-buttons {
        display: flex;
        gap: 12px;
      }

      .course-detail-btn {
        padding: 10px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }

      .course-detail-btn-login {
        background: transparent;
        color: #7EA2D4;
        border: 1px solid rgba(126, 162, 212, 0.5);
      }

      .course-detail-btn-login:hover {
        background: rgba(126, 162, 212, 0.1);
        border-color: #7EA2D4;
      }

      .course-detail-btn-register {
        background: #7EA2D4;
        color: #ffffff;
      }

      .course-detail-btn-register:hover {
        background: #6a8fc4;
      }

      /* Hero Section */
      .course-detail-hero {
        padding: 60px 40px;
        background: linear-gradient(135deg, rgba(126, 162, 212, 0.1), rgba(35, 35, 35, 0.8));
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
      }

      .course-detail-hero-content {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 60px;
        align-items: center;
      }

      .course-detail-hero-left h1 {
        font-size: 48px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 24px;
        line-height: 1.2;
      }

      .course-detail-hero-left p {
        font-size: 18px;
        color: #9CA3AF;
        line-height: 1.6;
        margin-bottom: 32px;
      }

      .course-detail-start-btn {
        padding: 16px 48px;
        background: #7EA2D4;
        color: #ffffff;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(126, 162, 212, 0.3);
      }

      .course-detail-start-btn:hover {
        background: #6a8fc4;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(126, 162, 212, 0.4);
      }

      .course-detail-hero-right {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .course-detail-hero-image {
        width: 100%;
        max-width: 500px;
        height: 350px;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .course-detail-hero-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .course-detail-hero-image-placeholder {
        width: 100%;
        height: 100%;
        background: rgba(40, 40, 40, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Course Content Section */
      .course-detail-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 60px 40px;
      }

      .course-detail-section-title {
        font-size: 32px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 32px;
      }

      /* Course Info Cards */
      .course-detail-info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 60px;
      }

      .course-detail-info-card {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 16px;
        padding: 24px;
        text-align: center;
      }

      .course-detail-info-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .course-detail-info-value {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .course-detail-info-label {
        font-size: 14px;
        color: #9CA3AF;
      }

      /* Modules Section */
      .course-detail-modules {
        margin-top: 40px;
      }

      .course-detail-module {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 16px;
        margin-bottom: 20px;
        overflow: hidden;
      }

      .course-detail-module-header {
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .course-detail-module-header:hover {
        background: rgba(126, 162, 212, 0.05);
      }

      .course-detail-module-title {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
      }

      .course-detail-module-arrow {
        color: #7EA2D4;
        transition: transform 0.3s ease;
      }

      .course-detail-module-arrow.rotated {
        transform: rotate(90deg);
      }

      .course-detail-module-lessons {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.4s ease;
      }

      .course-detail-module-lessons.expanded {
        max-height: 2000px;
      }

      .course-detail-lesson {
        padding: 16px 24px;
        border-top: 1px solid rgba(126, 162, 212, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .course-detail-lesson-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .course-detail-lesson-icon {
        width: 32px;
        height: 32px;
        background: rgba(126, 162, 212, 0.2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7EA2D4;
      }

      .course-detail-lesson-title {
        font-size: 15px;
        color: #ffffff;
      }

      .course-detail-lesson-duration {
        font-size: 13px;
        color: #9CA3AF;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .course-detail-hero-content {
          grid-template-columns: 1fr;
          gap: 40px;
        }

        .course-detail-hero-left h1 {
          font-size: 32px;
        }

        .course-detail-info-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="course-detail-page">
      <!-- Header -->
      <header class="course-detail-header">
        <div class="course-detail-logo" onclick="window.history.back()">
          dars<span>linker</span>
        </div>
        <div class="course-detail-auth-buttons">
          <button class="course-detail-btn course-detail-btn-login" onclick="openLoginModal()">
            ${t('header.login') || 'Kirish'}
          </button>
          <button class="course-detail-btn course-detail-btn-register" onclick="openRegisterModal()">
            ${t('header.register') || "Ro'yxatdan o'tish"}
          </button>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="course-detail-hero">
        <div class="course-detail-hero-content">
          <div class="course-detail-hero-left">
            <h1>${course.title || 'Course Title'}</h1>
            <p>${course.description || 'Course description goes here...'}</p>
            <button class="course-detail-start-btn" onclick="openLoginModal()">
              ${t('course.startLearning') || 'Boshlash'}
            </button>
          </div>
          <div class="course-detail-hero-right">
            <div class="course-detail-hero-image">
              ${courseImage 
                ? `<img src="${courseImage}" alt="${course.title}" />`
                : `<div class="course-detail-hero-image-placeholder">
                    <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
                      <rect width="120" height="90" rx="12" fill="#374151"/>
                      <rect x="30" y="22.5" width="60" height="45" rx="6" fill="#E5E7EB"/>
                    </svg>
                  </div>`
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Course Content -->
      <section class="course-detail-content">
        <!-- Info Cards -->
        <div class="course-detail-info-grid">
          <div class="course-detail-info-card">
            <div class="course-detail-info-icon">📚</div>
            <div class="course-detail-info-value">${totalLessons}</div>
            <div class="course-detail-info-label">${t('course.lessons') || 'ta dars'}</div>
          </div>
          <div class="course-detail-info-card">
            <div class="course-detail-info-icon">⏱️</div>
            <div class="course-detail-info-value">${totalDuration > 60 ? Math.floor(totalDuration / 60) + ' soat' : totalDuration + ' daqiqa'}</div>
            <div class="course-detail-info-label">${t('course.duration') || 'Kurs davomiyligi'}</div>
          </div>
          <div class="course-detail-info-card">
            <div class="course-detail-info-icon">👨‍🏫</div>
            <div class="course-detail-info-value">${teacherName}</div>
            <div class="course-detail-info-label">${t('course.instructor') || "O'qituvchi"}</div>
          </div>
        </div>

        <!-- Modules -->
        <div class="course-detail-modules">
          <h2 class="course-detail-section-title">${t('course.curriculum') || 'Kurs tarkibi'}</h2>
          ${course.modules && course.modules.length > 0 
            ? course.modules.map((module, index) => `
                <div class="course-detail-module">
                  <div class="course-detail-module-header" onclick="toggleModule(${index})">
                    <div class="course-detail-module-title">
                      ${String(index + 1).padStart(2, '0')} ${module.title || `Module ${index + 1}`}
                    </div>
                    <div class="course-detail-module-arrow" id="module-arrow-${index}">▶</div>
                  </div>
                  <div class="course-detail-module-lessons" id="module-lessons-${index}">
                    ${module.lessons && module.lessons.length > 0
                      ? module.lessons.map(lesson => `
                          <div class="course-detail-lesson">
                            <div class="course-detail-lesson-info">
                              <div class="course-detail-lesson-icon">
                                ${getLessonIcon(lesson.type)}
                              </div>
                              <div class="course-detail-lesson-title">${lesson.title || 'Lesson'}</div>
                            </div>
                            <div class="course-detail-lesson-duration">${lesson.duration || ''}</div>
                          </div>
                        `).join('')
                      : '<div class="course-detail-lesson">No lessons yet</div>'
                    }
                  </div>
                </div>
              `).join('')
            : '<p style="color: #9CA3AF; text-align: center;">No modules available</p>'
          }
        </div>
      </section>
    </div>
  `;
  
  // Attach event listeners
  attachEventListeners();
}

// Get lesson icon based on type
function getLessonIcon(type) {
  const icons = {
    video: '▶️',
    quiz: '📝',
    assignment: '📋',
    file: '📄',
    reading: '📖'
  };
  return icons[type] || '📄';
}

// Toggle module expansion
window.toggleModule = function(index) {
  const lessons = document.getElementById(`module-lessons-${index}`);
  const arrow = document.getElementById(`module-arrow-${index}`);
  
  if (lessons && arrow) {
    lessons.classList.toggle('expanded');
    arrow.classList.toggle('rotated');
  }
};

// Open login modal
window.openLoginModal = function() {
  // TODO: Implement login modal
  // For now, navigate to login page
  router.navigate('/login');
};

// Open register modal
window.openRegisterModal = function() {
  // TODO: Implement register modal
  // For now, navigate to register page
  router.navigate('/register');
};

// Show error page
function showErrorPage() {
  const appElement = document.querySelector('#app');
  if (!appElement) return;
  
  appElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #232323; color: #ffffff;">
      <h1 style="font-size: 48px; margin-bottom: 16px;">404</h1>
      <p style="font-size: 18px; color: #9CA3AF; margin-bottom: 32px;">Course not found</p>
      <button onclick="window.history.back()" style="padding: 12px 32px; background: #7EA2D4; color: #ffffff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
        Go Back
      </button>
    </div>
  `;
}

function attachEventListeners() {
  // Add any additional event listeners here
}
