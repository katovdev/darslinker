import { router } from '../../utils/router.js';

// Initialize course detail page
export async function initCourseDetailPage(courseId) {
  console.log('📚 Loading course detail for:', courseId);
  
  // Fetch course data
  const courseData = await fetchCourseData(courseId);
  
  if (!courseData) {
    showErrorPage();
    return;
  }
  
  // Save teacher ID to sessionStorage for modals
  if (courseData.course.teacher?._id) {
    sessionStorage.setItem('currentTeacherId', courseData.course.teacher._id);
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
      
      // Fetch teacher's landing data for logo and theme
      const teacherId = result.course.teacher?._id || result.course.teacher;
      let landingData = null;
      
      if (teacherId) {
        try {
          const landingResponse = await fetch(`${apiBaseUrl}/landing/public/${teacherId}`);
          const landingResult = await landingResponse.json();
          if (landingResult.success) {
            landingData = landingResult.landing;
            console.log('✅ Landing data loaded:', landingData);
          }
        } catch (error) {
          console.error('Error fetching landing data:', error);
        }
      }
      
      return {
        course: result.course,
        landingData: landingData
      };
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
function renderCourseDetailPage(data) {
  const appElement = document.querySelector('#app');
  if (!appElement) return;
  
  const { course, landingData } = data;
  
  // Get teacher name
  console.log('🎓 Full course data:', course);
  console.log('🎓 Course teacher data:', course.teacher);
  console.log('🎓 Teacher firstName:', course.teacher?.firstName);
  console.log('🎓 Teacher lastName:', course.teacher?.lastName);
  
  const teacherName = course.teacher 
    ? `${course.teacher.firstName || ''} ${course.teacher.lastName || ''}`.trim() || 'O\'qituvchi'
    : 'O\'qituvchi';
  console.log('🎓 Teacher name:', teacherName);
  
  // Get course image
  const courseImage = course.thumbnail || course.courseImage || '';
  
  // Get logo and theme from landing data
  const logoText = landingData?.logoText || 'DarsLinker';
  const themeColor = landingData?.primaryColor || '#7EA2D4';
  
  // Calculate total lessons and duration (only videos)
  let totalLessons = 0;
  let totalDurationSeconds = 0; // Use seconds for accurate calculation
  
  if (course.modules && course.modules.length > 0) {
    course.modules.forEach(module => {
      if (module.lessons) {
        totalLessons += module.lessons.length;
        module.lessons.forEach(lesson => {
          // Only count video lessons for duration
          if (lesson.type === 'video' && lesson.duration) {
            const duration = lesson.duration.toString().trim();
            
            console.log('📹 Video duration:', duration);
            
            // Check for MM:SS format (e.g., "01:39" = 1 minute 39 seconds)
            if (duration.includes(':')) {
              const parts = duration.split(':');
              const minutes = parseInt(parts[0]) || 0;
              const seconds = parseInt(parts[1]) || 0;
              
              // Convert to total seconds
              const totalSec = (minutes * 60) + seconds;
              totalDurationSeconds += totalSec;
              console.log(`  → ${minutes}:${seconds} = ${totalSec} seconds`);
            } 
            // Check for "X min" or "X daqiqa"
            else if (duration.match(/(\d+)\s*(min|daqiqa)/i)) {
              const match = duration.match(/(\d+)/);
              if (match) {
                totalDurationSeconds += parseInt(match[1]) * 60;
              }
            }
            // Check for "X hour" or "X soat"
            else if (duration.match(/(\d+)\s*(hour|soat)/i)) {
              const match = duration.match(/(\d+)/);
              if (match) {
                totalDurationSeconds += parseInt(match[1]) * 3600;
              }
            }
            // Just a number - assume minutes
            else {
              const match = duration.match(/(\d+)/);
              if (match) {
                totalDurationSeconds += parseInt(match[1]) * 60;
              }
            }
          } else if (lesson.duration) {
            console.log('⏭️ Skipping non-video:', lesson.type, lesson.duration);
          }
        });
      }
    });
  }
  
  // Convert seconds to minutes and seconds for display
  const totalMinutes = Math.floor(totalDurationSeconds / 60);
  const remainingSeconds = totalDurationSeconds % 60;
  
  console.log(`⏱️ Total duration: ${totalDurationSeconds} seconds = ${totalMinutes} min ${remainingSeconds} sec`);
  
  appElement.innerHTML = `
    <style>
      :root {
        --theme-color: ${themeColor};
      }

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
        padding-top: 0 !important;
      }

      /* Hide global header from style.css */
      body > .header {
        display: none !important;
      }

      /* Header - Same as Teacher Landing */
      .course-detail-header {
        background: #232323;
        padding: 25px 0;
        box-shadow: 0 2px 10px rgba(126, 162, 212, 0.1);
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .course-detail-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }

      .course-detail-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .course-detail-logo {
        display: flex;
        align-items: center;
        font-family: 'League Spartan', sans-serif;
        font-size: 32px;
        font-weight: 600;
        cursor: pointer;
      }

      .course-detail-logo-text {
        color: #ffffff;
      }

      .course-detail-logo-colored {
        color: var(--theme-color);
      }

      .course-detail-header-actions {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .course-detail-auth-buttons {
        display: flex;
        gap: 12px;
      }

      .course-detail-btn {
        padding: 8px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
      }

      .course-detail-btn-login {
        background: transparent;
        color: var(--theme-color);
        border: 1px solid var(--theme-color);
      }

      .course-detail-btn-login:hover {
        background: rgba(126, 162, 212, 0.1);
        transform: translateY(-1px);
      }

      .course-detail-btn-register {
        background: var(--theme-color);
        color: #ffffff;
        border: none;
      }

      .course-detail-btn-register:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      /* Hero Section */
      .course-detail-hero {
        padding: 80px 0;
        background: linear-gradient(135deg, rgba(126, 162, 212, 0.1), rgba(35, 35, 35, 0.8));
        border-bottom: 1px solid var(--theme-color);
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom-color: rgba(126, 162, 212, 0.2);
      }

      .course-detail-hero-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
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
        background: var(--theme-color);
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
        opacity: 0.9;
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
        padding: 60px 20px;
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
        border: 1px solid var(--theme-color);
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
        border: 1px solid var(--theme-color);
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
        color: var(--theme-color);
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
        color: var(--theme-color);
        flex-shrink: 0;
      }
      
      .course-detail-lesson-icon svg {
        display: block;
      }

      .course-detail-lesson-title {
        font-size: 15px;
        color: #ffffff;
      }
      
      .course-detail-lesson-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .course-detail-view-btn {
        padding: 6px 16px;
        background: var(--theme-color);
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      
      .course-detail-view-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .course-detail-lesson-duration {
        font-size: 13px;
        color: #9CA3AF;
        white-space: nowrap;
      }

      /* Video Modal */
      .video-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .video-modal-content {
        background: #232323;
        border: 1px solid var(--theme-color);
        border-radius: 16px;
        padding: 24px;
        max-width: 900px;
        width: 90%;
        position: relative;
        animation: slideUp 0.3s ease;
      }
      
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .video-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #ffffff;
        font-size: 32px;
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        z-index: 1;
      }
      
      .video-modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .video-modal-title {
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 20px;
        padding-right: 50px;
      }
      
      .video-player-container {
        background: #000000;
        border-radius: 12px;
        overflow: hidden;
      }
      
      .video-player {
        width: 100%;
        height: auto;
        max-height: 70vh;
        display: block;
      }
      
      /* Quiz Modal */
      .quiz-modal-content {
        max-width: 700px;
        max-height: 90vh;
        overflow-y: auto;
      }
      
      .quiz-container {
        margin-top: 20px;
      }
      
      .quiz-question {
        background: rgba(40, 40, 40, 0.5);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      }
      
      .quiz-question-title {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 16px;
      }
      
      .quiz-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .quiz-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(60, 60, 60, 0.5);
        border: 2px solid rgba(126, 162, 212, 0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .quiz-option:hover {
        background: rgba(126, 162, 212, 0.1);
        border-color: var(--theme-color);
      }
      
      .quiz-option.correct {
        background: rgba(34, 197, 94, 0.2);
        border-color: #22c55e;
      }
      
      .quiz-option.incorrect {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
      }
      
      .quiz-radio {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      
      .quiz-option-text {
        flex: 1;
        color: #ffffff;
        font-size: 15px;
      }
      
      .quiz-submit-btn {
        width: 100%;
        padding: 14px;
        background: var(--theme-color);
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 20px;
      }
      
      .quiz-submit-btn:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-2px);
      }
      
      .quiz-result {
        margin-top: 24px;
        padding: 24px;
        background: rgba(126, 162, 212, 0.1);
        border: 1px solid var(--theme-color);
        border-radius: 12px;
        text-align: center;
      }
      
      .quiz-result h3 {
        font-size: 20px;
        color: #ffffff;
        margin-bottom: 12px;
      }
      
      .quiz-score {
        font-size: 32px;
        font-weight: 700;
        color: var(--theme-color);
        margin-bottom: 12px;
      }
      
      .quiz-message {
        font-size: 16px;
        color: #ffffff;
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
        
        .video-modal-content {
          width: 95%;
          padding: 16px;
        }
        
        .video-modal-title {
          font-size: 18px;
        }
      }
    </style>

    <div class="course-detail-page">
      <!-- Header -->
      <header class="course-detail-header">
        <div class="course-detail-container">
          <div class="course-detail-header-content">
            <div class="course-detail-logo" onclick="window.history.back()">
              <span class="course-detail-logo-colored">${logoText}</span>
            </div>
            
            <div class="course-detail-header-actions">
              <div class="course-detail-auth-buttons">
                <a href="#" class="course-detail-btn course-detail-btn-login" onclick="openLoginModal(event)">
                  Kirish
                </a>
                <a href="#" class="course-detail-btn course-detail-btn-register" onclick="openRegistrationModal(event)">
                  Ro'yxatdan o'tish
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="course-detail-hero">
        <div class="course-detail-hero-content">
          <div class="course-detail-hero-left">
            <h1>${course.title || 'Course Title'}</h1>
            <p>${course.description || 'Kurs haqida ma\'lumot...'}</p>
            <button class="course-detail-start-btn" onclick="openLoginModal()">
              Boshlash
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
            <div class="course-detail-info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div class="course-detail-info-value">${totalLessons}</div>
            <div class="course-detail-info-label">Darslar soni</div>
          </div>
          <div class="course-detail-info-card">
            <div class="course-detail-info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="course-detail-info-value">${
              totalMinutes >= 60 
                ? `${Math.floor(totalMinutes / 60)} soat ${totalMinutes % 60 > 0 ? (totalMinutes % 60) + ' daqiqa' : ''}`
                : totalMinutes > 0 
                  ? `${totalMinutes} daqiqa${remainingSeconds > 0 ? ' ' + remainingSeconds + ' soniya' : ''}`
                  : remainingSeconds + ' soniya'
            }</div>
            <div class="course-detail-info-label">Kurs davomiyligi</div>
          </div>
          <div class="course-detail-info-card">
            <div class="course-detail-info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="course-detail-info-value">${teacherName}</div>
            <div class="course-detail-info-label">O'qituvchi</div>
          </div>
        </div>

        <!-- Modules -->
        <div class="course-detail-modules">
          <h2 class="course-detail-section-title">Kurs tarkibi</h2>
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
                            <div class="course-detail-lesson-right">
                              ${lesson.type === 'video'
                                ? `<button class="course-detail-view-btn" onclick="viewLesson('${lesson._id || ''}', '${lesson.type}')">Ko'rish</button>`
                                : lesson.type === 'quiz'
                                ? `<button class="course-detail-view-btn" onclick="viewLesson('${lesson._id || ''}', '${lesson.type}')">Boshlash</button>`
                                : ''
                              }
                              <div class="course-detail-lesson-duration">${lesson.duration || ''}</div>
                            </div>
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
    
    <script>
      // Modal variables
      let currentStep = 1;
      let registrationData = {
        firstName: '',
        lastName: '',
        phone: '',
        verificationCode: ''
      };
      
      // Get teacher ID for registration
      const teacherId = sessionStorage.getItem('currentTeacherId');
    </script>
  `;
  
  // Save course data globally for video modal
  window.currentCourseData = data;
  
  // Attach event listeners
  attachEventListeners();
  
  // Add modal functions to window
  setupModalFunctions();
}

// Get lesson icon based on type (SVG)
function getLessonIcon(type) {
  const icons = {
    video: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>`,
    quiz: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M9 11l3 3L22 4"></path>
             <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
           </svg>`,
    assignment: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                   <polyline points="14 2 14 8 20 8"></polyline>
                   <line x1="16" y1="13" x2="8" y2="13"></line>
                   <line x1="16" y1="17" x2="8" y2="17"></line>
                   <polyline points="10 9 9 9 8 9"></polyline>
                 </svg>`,
    file: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
             <polyline points="13 2 13 9 20 9"></polyline>
           </svg>`,
    reading: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>`
  };
  return icons[type] || icons.file;
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

// View lesson - open video or quiz modal
window.viewLesson = function(lessonId, lessonType) {
  console.log('🎬 View lesson ID:', lessonId, 'Type:', lessonType);
  
  // Find lesson data
  const courseData = window.currentCourseData;
  if (!courseData) {
    console.error('❌ Course data not found');
    return;
  }
  
  let lessonData = null;
  courseData.course.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson._id === lessonId) {
        lessonData = lesson;
        console.log('✅ Found lesson:', lessonData);
      }
    });
  });
  
  if (!lessonData) {
    console.error('❌ Lesson not found with ID:', lessonId);
    return;
  }
  
  // Open appropriate modal based on lesson type
  if (lessonData.type === 'video') {
    openVideoModal(lessonData);
  } else if (lessonData.type === 'quiz') {
    openQuizModal(lessonData);
  }
};

// Open video modal
function openVideoModal(lesson) {
  console.log('📹 Opening video modal for lesson:', lesson);
  
  // Get video URL - try different field names
  const videoUrl = lesson.videoUrl || lesson.fileUrl || lesson.url;
  console.log('📹 Video URL:', videoUrl);
  
  const modal = document.createElement('div');
  modal.className = 'video-modal-overlay';
  modal.innerHTML = `
    <div class="video-modal-content">
      <button class="video-modal-close" onclick="closeVideoModal()">&times;</button>
      <h2 class="video-modal-title">${lesson.title}</h2>
      <div class="video-player-container">
        ${videoUrl 
          ? `<video controls autoplay class="video-player">
               <source src="${videoUrl}" type="video/mp4">
               Your browser does not support the video tag.
             </video>`
          : `<div style="color: #9CA3AF; text-align: center; padding: 40px;">
               <p>Video not available</p>
               <p style="font-size: 12px; margin-top: 10px;">No video URL found</p>
             </div>`
        }
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

// Close video modal
window.closeVideoModal = function() {
  const modal = document.querySelector('.video-modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
};

// Open quiz modal
function openQuizModal(lesson) {
  console.log('📝 Opening quiz modal for lesson:', lesson);
  console.log('📝 All lesson fields:', Object.keys(lesson));
  console.log('📝 Full lesson data:', JSON.stringify(lesson, null, 2));
  
  // Try different field names for questions
  // If quiz is an object (populated), get questions from it
  let questions = [];
  if (lesson.quiz && typeof lesson.quiz === 'object' && lesson.quiz.questions) {
    questions = lesson.quiz.questions;
  } else if (lesson.questions) {
    questions = lesson.questions;
  } else if (lesson.quizQuestions) {
    questions = lesson.quizQuestions;
  }
  
  console.log('📝 Quiz object:', lesson.quiz);
  console.log('📝 Quiz questions:', questions);
  
  const modal = document.createElement('div');
  modal.className = 'video-modal-overlay'; // Reuse same overlay style
  modal.innerHTML = `
    <div class="video-modal-content quiz-modal-content">
      <button class="video-modal-close" onclick="closeQuizModal()">&times;</button>
      <h2 class="video-modal-title">${lesson.title}</h2>
      <div class="quiz-container">
        ${questions && questions.length > 0
          ? renderQuizQuestions(questions)
          : `<div style="color: #9CA3AF; text-align: center; padding: 40px;">
               <p>No questions available</p>
               <p style="font-size: 12px; margin-top: 10px;">Available fields: ${Object.keys(lesson).join(', ')}</p>
             </div>`
        }
        ${questions && questions.length > 0
          ? '<button class="quiz-submit-btn" onclick="submitQuiz()">Javoblarni tekshirish</button>'
          : ''
        }
      </div>
      <div class="quiz-result" id="quizResult" style="display: none;"></div>
    </div>
  `;
  
  // Save questions globally for submit function
  window.currentQuizQuestions = questions;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

// Render quiz questions
function renderQuizQuestions(questions) {
  console.log('🎯 renderQuizQuestions called with:', questions);
  return questions.map((q, index) => {
    console.log(`🎯 Question ${index}:`, q);
    // Support both formats:
    // 1. {question, options: [], correctAnswer: number}
    // 2. {question, answers: [{text, isCorrect}]}
    let options = [];
    
    // Check answers first (new format), then options (old format)
    if (q.answers && Array.isArray(q.answers) && q.answers.length > 0) {
      console.log(`🎯 Using answers format:`, q.answers);
      options = q.answers.map(a => a.text || a);
    } else if (q.options && Array.isArray(q.options) && q.options.length > 0) {
      console.log(`🎯 Using options format:`, q.options);
      options = q.options;
    }
    
    console.log(`🎯 Final options for question ${index}:`, options);
    
    return `
      <div class="quiz-question" data-question-index="${index}">
        <h3 class="quiz-question-title">${index + 1}. ${q.question}</h3>
        <div class="quiz-options">
          ${options.length > 0 
            ? options.map((option, optIndex) => `
                <label class="quiz-option">
                  <input type="radio" name="question-${index}" value="${optIndex}" class="quiz-radio">
                  <span class="quiz-option-text">${option}</span>
                </label>
              `).join('')
            : '<p style="color: #9CA3AF;">No options available</p>'
          }
        </div>
      </div>
    `;
  }).join('');
}

// Submit quiz
window.submitQuiz = function() {
  const questionElements = document.querySelectorAll('.quiz-question');
  const quizQuestions = window.currentQuizQuestions || [];
  let correctCount = 0;
  let totalQuestions = questionElements.length;
  
  questionElements.forEach((questionEl, index) => {
    const selectedOption = questionEl.querySelector('input[type="radio"]:checked');
    const questionData = quizQuestions[index];
    
    if (selectedOption && questionData) {
      const selectedAnswer = parseInt(selectedOption.value);
      
      // Find correct answer - support both formats
      let correctAnswer = -1;
      if (typeof questionData.correctAnswer === 'number') {
        correctAnswer = questionData.correctAnswer;
      } else if (questionData.answers) {
        correctAnswer = questionData.answers.findIndex(a => a.isCorrect);
      }
      
      // Mark as correct or incorrect
      const optionLabels = questionEl.querySelectorAll('.quiz-option');
      optionLabels.forEach((label, optIndex) => {
        if (optIndex === correctAnswer) {
          label.classList.add('correct');
        }
        if (optIndex === selectedAnswer && selectedAnswer !== correctAnswer) {
          label.classList.add('incorrect');
        }
      });
      
      if (selectedAnswer === correctAnswer) {
        correctCount++;
      }
    }
  });
  
  // Show result
  const resultDiv = document.getElementById('quizResult');
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  resultDiv.innerHTML = `
    <h3>Natija</h3>
    <p class="quiz-score">${correctCount} / ${totalQuestions} to'g'ri javob (${percentage}%)</p>
    <p class="quiz-message">${percentage >= 70 ? '🎉 Ajoyib! Siz testdan o\'tdingiz!' : '📚 Yana bir bor urinib ko\'ring!'}</p>
  `;
  resultDiv.style.display = 'block';
  
  // Disable submit button
  const submitBtn = document.querySelector('.quiz-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Tekshirildi';
    submitBtn.style.opacity = '0.5';
  }
};

// Close quiz modal
window.closeQuizModal = function() {
  const modal = document.querySelector('.video-modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
};

// Setup modal functions
function setupModalFunctions() {
  const teacherId = sessionStorage.getItem('currentTeacherId');
  
  // Redirect to teacher landing page where modal will open
  window.openLoginModal = function(e) {
    if (e) e.preventDefault();
    
    if (teacherId) {
      // Save return URL to come back after login
      sessionStorage.setItem('returnUrl', window.location.pathname);
      sessionStorage.setItem('openLoginModal', 'true');
      
      // Redirect to teacher landing page
      window.location.href = `/teacher/${teacherId}`;
    } else {
      router.navigate('/login');
    }
  };

  window.openRegistrationModal = function(e) {
    if (e) e.preventDefault();
    
    if (teacherId) {
      // Save return URL to come back after registration
      sessionStorage.setItem('returnUrl', window.location.pathname);
      sessionStorage.setItem('openRegisterModal', 'true');
      
      // Redirect to teacher landing page
      window.location.href = `/teacher/${teacherId}`;
    } else {
      router.navigate('/register');
    }
  };
}

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
