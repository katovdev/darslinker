// Course learning page - Full course view with modules and lessons
import { loadQuizPlayer } from './quiz-player.js';

// Global flag to track if layout is already rendered
let isLayoutRendered = false;
let currentCourse = null;

export async function initCourseLearningPage(courseId) {
  console.log('📚 Loading course learning page for:', courseId);
  
  // Fetch course data
  const courseData = await fetchCourseData(courseId);
  
  if (!courseData) {
    showErrorPage();
    return;
  }
  
  // Store course data globally
  currentCourse = courseData;
  
  // Check if layout already exists
  if (!isLayoutRendered) {
    await renderCourseLearningPage(courseData);
    isLayoutRendered = true;
  } else {
    // Layout exists, just update content if needed
    console.log('Layout already rendered, skipping full render');
  }
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
      console.error('❌ Failed to load course');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    return null;
  }
}

// Helper to get student ID
async function getStudentId() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user._id) return user._id;
  
  const landingUser = sessionStorage.getItem('landingUser');
  if (landingUser) {
    try {
      const userData = JSON.parse(landingUser);
      if (userData._id) return userData._id;
    } catch (error) {
      console.error('Error parsing landing user:', error);
    }
  }
  return null;
}

// Render course learning page
async function renderCourseLearningPage(course) {
  // Fetch student progress
  let completedLessons = [];
  let lastAccessedLesson = null;
  
  const studentId = await getStudentId();
  if (studentId) {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const response = await fetch(`${apiBaseUrl}/students/${studentId}/progress/${course._id}`);
      const result = await response.json();
      if (result.success && result.progress) {
        completedLessons = result.progress.completedLessons || [];
        lastAccessedLesson = result.progress.lastAccessedLesson;
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }
  
  // Store progress globally for renderLessons
  window.courseProgress = { completedLessons, lastAccessedLesson };
  
  // Calculate total lessons and progress
  let totalLessons = 0;
  
  if (course.modules) {
    course.modules.forEach(module => {
      if (module.lessons) {
        totalLessons += module.lessons.length;
      }
    });
  }
  
  const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  
  // Calculate total duration from video lessons (same logic as course-detail.js)
  let totalDurationSeconds = 0;
  
  console.log('📊 Calculating course duration...');
  console.log('Modules:', course.modules);
  
  if (course.modules && course.modules.length > 0) {
    course.modules.forEach(module => {
      console.log('Module:', module.title);
      if (module.lessons) {
        module.lessons.forEach(lesson => {
          console.log('  Lesson:', lesson.title, 'Type:', lesson.type, 'Duration:', lesson.duration);
          // Only count video lessons for duration
          if (lesson.type === 'video' && lesson.duration) {
            const duration = lesson.duration.toString().trim();
            
            console.log(`  📝 Processing ${lesson.type} duration:`, duration);
            
            // Skip if duration is just text like "Quiz", "Assignment", "File"
            if (duration.toLowerCase() === 'quiz' || 
                duration.toLowerCase() === 'assignment' || 
                duration.toLowerCase() === 'file') {
              console.log('    → Skipping text-only duration');
              return;
            }
            
            // Check for MM:SS format (e.g., "01:39" = 1 minute 39 seconds)
            if (duration.includes(':') && !duration.includes('•')) {
              const parts = duration.split(':');
              const minutes = parseInt(parts[0]) || 0;
              const seconds = parseInt(parts[1]) || 0;
              
              // Convert to total seconds
              const totalSec = (minutes * 60) + seconds;
              totalDurationSeconds += totalSec;
              console.log(`    → ${minutes}:${seconds} = ${totalSec} seconds (total: ${totalDurationSeconds})`);
            } 
            // Check for "X min" or "X daqiqa" (including "Quiz • 23 min" format)
            else if (duration.match(/(\d+)\s*(min|daqiqa)/i)) {
              const match = duration.match(/(\d+)\s*(min|daqiqa)/i);
              if (match) {
                const mins = parseInt(match[1]) * 60;
                totalDurationSeconds += mins;
                console.log(`    → ${match[1]} min = ${mins} seconds (total: ${totalDurationSeconds})`);
              }
            }
            // Check for "X hour" or "X soat"
            else if (duration.match(/(\d+)\s*(hour|soat)/i)) {
              const match = duration.match(/(\d+)\s*(hour|soat)/i);
              if (match) {
                const hrs = parseInt(match[1]) * 3600;
                totalDurationSeconds += hrs;
                console.log(`    → ${match[1]} hour = ${hrs} seconds (total: ${totalDurationSeconds})`);
              }
            }
            // Just a number - assume minutes
            else if (duration.match(/^\d+$/)) {
              const mins = parseInt(duration) * 60;
              totalDurationSeconds += mins;
              console.log(`    → ${duration} (number) = ${mins} seconds (total: ${totalDurationSeconds})`);
            }
          }
        });
      }
    });
  }
  
  // Convert seconds to hours, minutes and seconds for display
  const totalMinutes = Math.floor(totalDurationSeconds / 60);
  const remainingSeconds = totalDurationSeconds % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;
  
  console.log(`⏱️ Total: ${totalDurationSeconds} seconds = ${totalHours}h ${displayMinutes}m ${remainingSeconds}s`);
  
  // Build duration text
  let durationText = '';
  if (totalHours > 0) {
    durationText = `${totalHours} soat`;
    if (displayMinutes > 0) {
      durationText += ` ${displayMinutes} daqiqa`;
    }
  } else if (displayMinutes > 0) {
    durationText = `${displayMinutes} daqiqa`;
    if (remainingSeconds > 0) {
      durationText += ` ${remainingSeconds} soniya`;
    }
  } else {
    durationText = `${remainingSeconds} soniya`;
  }

  // Clear body and set styles
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'auto';
  
  const appContainer = document.getElementById('app') || document.body;
  appContainer.innerHTML = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #232323;
        color: #ffffff;
        min-height: 100vh;
      }

      /* Header - Same as student dashboard */
      .course-learning-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 40px;
        background: #232323;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(10px);
      }

      .header-logo {
        display: flex;
        align-items: center;
      }

      .logo-text {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
      }

      .logo-highlight {
        color: #7EA2D4;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .icon-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 8px;
        color: #9CA3AF;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .icon-btn:hover {
        background: rgba(126, 162, 212, 0.1);
        color: #ffffff;
        border-color: #7ea2d4;
      }

      .meeting-btn,
      .notification-btn {
        color: #6B7280 !important;
      }

      .meeting-btn:hover,
      .notification-btn:hover {
        color: #9CA3AF !important;
      }

      .logout-btn {
        width: auto !important;
        padding: 0 16px !important;
        gap: 8px;
        border-color: #7ea2d4 !important;
        margin-left: 8px;
        color: #7ea2d4 !important;
      }

      .logout-btn:hover {
        background: rgba(126, 162, 212, 0.15) !important;
        border-color: #7ea2d4 !important;
        color: #7ea2d4 !important;
      }

      .logout-text {
        font-size: 14px;
        font-weight: 500;
        color: #7ea2d4;
      }

      /* Main Content */
      .course-learning-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 60px 40px;
      }

      /* Course Header */
      .course-header {
        margin-bottom: 40px;
      }

      .course-title {
        font-size: 48px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 24px;
      }

      .course-progress-section {
        margin-bottom: 32px;
      }

      .progress-label {
        font-size: 16px;
        color: #9CA3AF;
        margin-bottom: 16px;
      }

      .progress-percentage {
        color: #7ea2d4;
        font-weight: 600;
      }

      .progress-bar-container {
        width: 100%;
        height: 12px;
        background: rgba(58, 56, 56, 0.5);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
      }

      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #7ea2d4, #6b8fc4);
        border-radius: 6px;
        transition: width 0.3s ease;
        position: relative;
      }

      .progress-markers {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        padding: 0 25%;
      }

      .progress-marker {
        width: 2px;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
      }

      .progress-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
        color: #6B7280;
      }

      /* Course Info */
      .course-info {
        display: flex;
        gap: 32px;
        margin-bottom: 48px;
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #9CA3AF;
      }

      .info-icon {
        color: #7ea2d4;
      }

      /* Modules Section */
      .modules-section {
        margin-top: 48px;
      }

      .section-title {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 24px;
      }

      .modules-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .module-card {
        background: transparent;
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .module-card:hover {
        border-color: #7ea2d4;
      }

      .module-card.expanded {
        background: rgba(58, 56, 56, 0.2);
      }

      .module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        cursor: pointer;
        user-select: none;
      }

      .module-header:hover {
        background: rgba(126, 162, 212, 0.05);
      }

      .module-title-section {
        flex: 1;
      }

      .module-title {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 12px;
      }

      .module-meta {
        font-size: 14px;
        color: #9CA3AF;
        margin-bottom: 12px;
      }

      .module-progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        margin-top: 12px;
      }

      .module-progress-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .module-progress-fill.completed {
        background: linear-gradient(90deg, #10B981, #34D399);
      }

      .module-progress-fill.in-progress {
        background: linear-gradient(90deg, #3B82F6, #60A5FA);
      }

      .module-progress-fill.not-started {
        background: rgba(255, 255, 255, 0.1);
      }

      .module-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .module-progress {
        font-size: 14px;
        font-weight: 600;
        color: #7ea2d4;
      }

      .module-arrow {
        color: #7ea2d4;
        transition: transform 0.3s ease;
      }

      .module-arrow.rotated {
        transform: rotate(90deg);
      }

      /* Lessons List */
      .lessons-list {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: max-height 0.3s ease, opacity 0.3s ease;
        background: rgba(40, 40, 40, 0.5);
      }

      .lessons-list.expanded {
        max-height: 2000px;
        opacity: 1;
        border-top: 1px solid rgba(126, 162, 212, 0.1);
      }

      .lesson-item {
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 1px solid rgba(126, 162, 212, 0.05);
      }

      .lesson-item:last-child {
        border-bottom: none;
      }

      .lesson-item:hover {
        background: rgba(126, 162, 212, 0.1);
      }

      .lesson-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: rgba(126, 162, 212, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7ea2d4;
        flex-shrink: 0;
      }

      .lesson-info {
        flex: 1;
      }

      .lesson-title {
        font-size: 15px;
        font-weight: 500;
        color: #ffffff;
        margin-bottom: 4px;
      }

      .lesson-duration {
        font-size: 13px;
        color: #9CA3AF;
      }

      .lesson-status {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .lesson-status.completed {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #10B981;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Toast Notification */
      .toast-notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #7ea2d4;
        color: #ffffff;
        padding: 16px 32px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInBottomRight 0.3s ease;
      }

      @keyframes slideInBottomRight {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutBottomRight {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100px);
          opacity: 0;
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .course-learning-header {
          padding: 16px 20px;
        }

        .header-actions {
          gap: 8px;
        }

        .logout-text {
          display: none;
        }

        .course-learning-content {
          padding: 40px 20px;
        }

        .course-title {
          font-size: 32px;
        }

        .course-info {
          flex-direction: column;
          gap: 16px;
        }
      }
    </style>

    <div class="course-learning-page">
      <!-- Header -->
      <header class="course-learning-header">
        <div class="header-logo">
          <span class="logo-text">dars<span class="logo-highlight">linker</span></span>
        </div>
        <div class="header-actions">
          <button class="icon-btn meeting-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
          <button class="icon-btn notification-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </button>
          <button class="icon-btn" style="margin-right: 8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </button>
          <button class="icon-btn logout-btn" title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="logout-text">Log out</span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="course-learning-content">
        <!-- Course Header -->
        <div class="course-header">
          <h1 class="course-title">${course.title || 'Untitled Course'}</h1>
          
          <!-- Progress Section -->
          <div class="course-progress-section">
            <div class="progress-label">
              Siz kursni <span class="progress-percentage">${progress}%</span> tugatdingiz
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
              <div class="progress-markers">
                <div class="progress-marker"></div>
                <div class="progress-marker"></div>
                <div class="progress-marker"></div>
              </div>
            </div>
            <div class="progress-labels">
              <span>20%</span>
              <span>40%</span>
              <span>60%</span>
              <span>80%</span>
            </div>
          </div>

          <!-- Course Info -->
          <div class="course-info">
            <div class="info-item">
              <svg class="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span>${totalLessons} ta dars</span>
            </div>
            <div class="info-item">
              <svg class="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>${durationText}</span>
            </div>
          </div>
        </div>

        <!-- Modules Section -->
        <div class="modules-section">
          <h2 class="section-title">Kurs tarkibi</h2>
          <div class="modules-list">
            ${renderModules(course.modules || [])}
          </div>
        </div>
      </main>
    </div>
  `;

  attachEventListeners(course);
}

// Render modules
function renderModules(modules) {
  if (!modules || modules.length === 0) {
    return '<p style="color: #9CA3AF; text-align: center; padding: 40px;">No modules available</p>';
  }

  return modules.map((module, index) => {
    const lessonCount = module.lessons ? module.lessons.length : 0;
    const moduleProgress = 0; // Will be calculated based on user progress
    
    // Determine progress status
    let progressClass = 'not-started';
    let progressColor = '#6B7280';
    if (moduleProgress === 100) {
      progressClass = 'completed';
      progressColor = '#10B981';
    } else if (moduleProgress > 0) {
      progressClass = 'in-progress';
      progressColor = '#3B82F6';
    }

    return `
      <div class="module-card" data-module-id="${module._id}">
        <div class="module-header" onclick="toggleModule('${module._id}')">
          <div class="module-title-section">
            <h3 class="module-title">${index + 1}. ${module.title || 'Untitled Module'}</h3>
            <p class="module-meta">${lessonCount} ta dars</p>
            <div class="module-progress-bar">
              <div class="module-progress-fill ${progressClass}" style="width: ${moduleProgress}%"></div>
            </div>
          </div>
          <div class="module-right">
            <span class="module-progress" style="color: ${progressColor}">${moduleProgress}%</span>
            <svg class="module-arrow" id="arrow-${module._id}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
        <div class="lessons-list" id="lessons-${module._id}">
          ${renderLessons(module.lessons || [], module._id)}
        </div>
      </div>
    `;
  }).join('');
}

// Render lessons for a module
function renderLessons(lessons, moduleId) {
  if (!lessons || lessons.length === 0) {
    return '<p style="color: #9CA3AF; text-align: center; padding: 20px;">No lessons</p>';
  }

  const progress = window.courseProgress || { completedLessons: [], lastAccessedLesson: null };

  return lessons.map(lesson => {
    const lessonIcon = getLessonIcon(lesson.type);
    const isCompleted = progress.completedLessons.includes(lesson._id);
    const isInProgress = progress.lastAccessedLesson === lesson._id && !isCompleted;

    return `
      <div class="lesson-item" onclick="openLesson('${moduleId}', '${lesson._id}')">
        <div class="lesson-icon">
          ${lessonIcon}
        </div>
        <div class="lesson-info">
          <div class="lesson-title">${lesson.title || 'Untitled Lesson'}</div>
          <div class="lesson-duration">${lesson.duration || 'No duration'}</div>
        </div>
        ${isCompleted ? `
        <div class="lesson-status completed" style="width: 20px; height: 20px; border-radius: 50%; background: #10B981;"></div>
        ` : isInProgress ? `
        <div class="lesson-status in-progress" style="width: 20px; height: 20px; border-radius: 50%; background: #F59E0B;"></div>
        ` : '<div class="lesson-status"></div>'}
      </div>
    `;
  }).join('');
}

// Get icon for lesson type
function getLessonIcon(type) {
  switch(type) {
    case 'video':
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    case 'quiz':
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>';
    case 'assignment':
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';
    case 'file':
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>';
    default:
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  }
}

// Attach event listeners
function attachEventListeners(course, currentLesson = null) {
  // Meeting button
  const meetingBtn = document.querySelector('.meeting-btn');
  if (meetingBtn) {
    meetingBtn.addEventListener('click', () => {
      showToast('Coming soon');
    });
  }

  // Notification button
  const notificationBtn = document.querySelector('.notification-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      showToast('Coming soon');
    });
  }

  // Logout button
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      handleLogout();
    });
  }

  // Toggle module expansion
  window.toggleModule = function(moduleId) {
    const lessonsList = document.getElementById(`lessons-${moduleId}`);
    const arrow = document.getElementById(`arrow-${moduleId}`);
    const card = document.querySelector(`[data-module-id="${moduleId}"]`);
    
    if (lessonsList && arrow && card) {
      lessonsList.classList.toggle('expanded');
      arrow.classList.toggle('rotated');
      card.classList.toggle('expanded');
    }
  };

  // Open specific lesson - load in same page
  window.openLesson = async function(moduleId, lessonId) {
    console.log('Opening lesson:', moduleId, lessonId);
    
    // Update lastAccessedLesson in progress
    const studentId = await getStudentId();
    if (studentId) {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
        await fetch(`${apiBaseUrl}/students/${studentId}/complete-lesson`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course._id, lessonId, updateLastAccessed: true })
        });
        
        // Update local progress
        if (window.courseProgress) {
          window.courseProgress.lastAccessedLesson = lessonId;
        }
      } catch (error) {
        console.error('Error updating last accessed:', error);
      }
    }
    
    // Find the lesson
    let selectedLesson = null;
    const module = course.modules.find(m => m._id === moduleId);
    if (module && module.lessons) {
      selectedLesson = module.lessons.find(l => l._id === lessonId);
    }
    
    if (selectedLesson) {
      // Check lesson type and load appropriate player
      if (selectedLesson.type === 'video') {
        loadLessonPlayer(course, selectedLesson);
      } else if (selectedLesson.type === 'quiz') {
        // Build sidebar HTML for quiz player
        const sidebarHtml = `
          <div class="lesson-sidebar" id="lessonSidebar">
            <div class="sidebar-header">
              <span class="sidebar-course-title">${course.title || 'Course'}</span>
              <button class="sidebar-close" onclick="togglePlayerSidebar()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="sidebar-modules">
              ${buildLessonsListHtml(course, selectedLesson)}
            </div>
          </div>
        `;
        await loadQuizPlayer(course, selectedLesson, sidebarHtml);
      } else if (selectedLesson.type === 'assignment') {
        // Build sidebar HTML for assignment player
        const sidebarHtml = `
          <div class="assignment-sidebar">
            <div class="sidebar-header">
              <span class="sidebar-course-title">${course.title || 'Course'}</span>
            </div>
            <div class="sidebar-modules">
              ${buildLessonsListHtml(course, selectedLesson)}
            </div>
          </div>
        `;
        const { loadAssignmentPlayer } = await import('./assignment-player.js');
        await loadAssignmentPlayer(course, selectedLesson, sidebarHtml);
      } else {
        showToast('This lesson type is not supported yet');
      }
    }
  };
  
  // Back to course overview
  window.backToCourse = function() {
    // Reload the course learning page
    initCourseLearningPage(course._id);
  };
  
  // Mark lesson as complete (silent - no toast)
  window.markLessonComplete = async function(courseId, lessonId) {
    // Get student ID
    let studentId = null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id) {
      studentId = user._id;
    } else {
      const landingUser = sessionStorage.getItem('landingUser');
      if (landingUser) {
        try {
          const userData = JSON.parse(landingUser);
          if (userData._id) {
            studentId = userData._id;
          }
        } catch (error) {
          console.error('Error parsing landing user:', error);
        }
      }
    }

    if (!studentId) {
      console.log('No student ID - skipping progress tracking');
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const response = await fetch(`${apiBaseUrl}/students/${studentId}/complete-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, lessonId })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Lesson completed! Progress: ${result.progress}%`);
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };
  
  // Go to next lesson (and mark current as complete)
  window.goToNextLesson = async function(courseId, lessonId) {
    // First, mark current lesson as complete
    await window.markLessonComplete(courseId, lessonId);
    
    // Find current lesson in course modules
    let currentModuleIndex = -1;
    let currentLessonIndex = -1;
    
    course.modules.forEach((module, mIdx) => {
      module.lessons.forEach((lesson, lIdx) => {
        if (lesson._id === lessonId) {
          currentModuleIndex = mIdx;
          currentLessonIndex = lIdx;
        }
      });
    });
    
    if (currentModuleIndex === -1) {
      showToast('Cannot find next lesson');
      return;
    }
    
    // Try next lesson in same module
    const currentModule = course.modules[currentModuleIndex];
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[currentLessonIndex + 1];
      window.openLesson(currentModule._id, nextLesson._id);
      return;
    }
    
    // Try first lesson of next module
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        window.openLesson(nextModule._id, nextModule.lessons[0]._id);
        return;
      }
    }
    
    // No more lessons
    showToast('🎉 You completed all lessons!');
  };
  
  // Store current lesson globally for next lesson function
  if (currentLesson) {
    window.currentLesson = currentLesson;
  }
}

// Show toast notification
function showToast(message) {
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed !important;
    bottom: 30px !important;
    right: 30px !important;
    background: #7ea2d4 !important;
    color: #ffffff !important;
    padding: 16px 32px !important;
    border-radius: 12px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    z-index: 10000 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    width: auto !important;
    height: auto !important;
    min-height: auto !important;
    max-width: 400px !important;
    white-space: nowrap !important;
    display: inline-block !important;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutBottomRight 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Handle logout
function handleLogout() {
  sessionStorage.removeItem('landingUser');
  sessionStorage.removeItem('currentTeacherId');
  showToast('Logging out...');
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
}

// Load lesson player in content area
function loadLessonPlayer(course, lesson) {
  const mainContent = document.querySelector('.course-learning-page');
  if (!mainContent) return;
  
  // Get video URL
  const videoUrl = lesson.videoUrl || '';
  
  // Check if layout already exists
  const existingLayout = mainContent.querySelector('.lesson-player-layout');
  
  if (existingLayout) {
    // Layout exists, only update video player content
    updateVideoPlayerContent(existingLayout, lesson, videoUrl);
    return;
  }
  
  // First time - create full layout
  mainContent.innerHTML = `
    <style>
      .lesson-player-layout {
        display: flex;
        height: calc(100vh - 81px);
        overflow: hidden;
      }
      
      /* Sidebar - Collapsible */
      .lesson-sidebar {
        width: 280px;
        background: #2a2a2a;
        border-right: 1px solid rgba(126, 162, 212, 0.15);
        overflow-y: auto;
        overflow-x: hidden;
        flex-shrink: 0;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .lesson-sidebar.collapsed {
        width: 0;
        min-width: 0;
        border-right: none;
      }
      
      .lesson-sidebar::-webkit-scrollbar {
        width: 6px;
      }
      
      .lesson-sidebar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .lesson-sidebar::-webkit-scrollbar-thumb {
        background: rgba(126, 162, 212, 0.3);
        border-radius: 3px;
      }
      

      
      .sidebar-header {
        padding: 20px 24px;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      
      .sidebar-course-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        flex: 1;
      }
      
      .sidebar-close {
        background: transparent;
        border: none;
        color: #9CA3AF;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        border-radius: 4px;
      }
      
      .sidebar-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #7ea2d4;
      }
      
      .sidebar-modules {
        padding: 12px 0;
      }
      
      .sidebar-module {
        border-bottom: 1px solid rgba(126, 162, 212, 0.1);
      }
      
      .sidebar-module-header {
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .sidebar-module-header:hover {
        background: rgba(126, 162, 212, 0.05);
      }
      
      .sidebar-module-title {
        flex: 1;
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
      }
      
      .sidebar-module-count {
        font-size: 12px;
        color: #9CA3AF;
      }
      
      .sidebar-module-arrow {
        color: #7ea2d4;
        font-size: 12px;
        transition: transform 0.3s;
      }
      
      .sidebar-module-arrow.rotated {
        transform: rotate(-180deg);
      }
      
      .sidebar-module-lessons {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }
      
      .sidebar-module-lessons.expanded {
        max-height: 2000px;
      }
      
      .sidebar-lesson {
        padding: 14px 24px 14px 44px;
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
        transition: all 0.2s;
        border-left: 4px solid transparent;
        position: relative;
      }
      
      .sidebar-lesson:hover {
        background: rgba(126, 162, 212, 0.1);
      }
      
      .sidebar-lesson.active {
        background: rgba(126, 162, 212, 0.2);
        border-left-color: #7ea2d4;
      }
      
      .sidebar-lesson-icon {
        color: #7ea2d4;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }
      
      .sidebar-lesson-icon svg {
        display: block;
      }
      
      .sidebar-lesson-info {
        flex: 1;
      }
      
      .sidebar-lesson-title {
        font-size: 14px;
        color: #ffffff;
        margin-bottom: 4px;
        font-weight: 500;
      }
      
      .sidebar-lesson-duration {
        font-size: 12px;
        color: #9CA3AF;
      }
      
      /* Video Player Area */
      .lesson-player-container {
        flex: 1;
        overflow-y: auto;
        background: #1a1a1a;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 40px 60px;
        position: relative;
      }
      
      /* Open Sidebar Button */
      .open-sidebar-btn {
        position: absolute;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
        width: 40px;
        height: 64px;
        background: #232323;
        border: 1px solid rgba(126, 162, 212, 0.3);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #7ea2d4;
        z-index: 10;
        transition: all 0.2s ease;
      }
      
      .open-sidebar-btn:hover {
        background: rgba(126, 162, 212, 0.1);
        border-color: #7ea2d4;
      }
      
      .lesson-player-container::-webkit-scrollbar {
        width: 8px;
      }
      
      .lesson-player-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .lesson-player-container::-webkit-scrollbar-thumb {
        background: rgba(126, 162, 212, 0.3);
        border-radius: 4px;
      }
      
      .lesson-player-content {
        width: 100%;
        max-width: 1400px;
      }
      
      .video-wrapper {
        width: 100%;
        max-height: 600px;
        background: #000000;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .video-wrapper video {
        width: 100%;
        max-height: 600px;
        display: block;
        object-fit: contain;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      
      /* Hide video content during screen capture */
      @media (prefers-reduced-motion: reduce) {
        .video-wrapper video {
          filter: brightness(0);
        }
      }
      
      /* Detect screen recording via visibility API */
      .video-wrapper.recording-detected video {
        filter: brightness(0) !important;
      }
      
      /* Video Watermark */
      .video-watermark {
        position: absolute;
        color: rgba(220, 220, 220, 0.9);
        font-size: 16px;
        font-weight: 400;
        font-family: monospace;
        pointer-events: none;
        z-index: 999;
        user-select: none;
        -webkit-user-select: none;
        opacity: 0.9;
        display: block;
      }
      
      .video-watermark.hidden {
        opacity: 0 !important;
        display: none;
      }
      
      /* Play Button Overlay - Oddiy */
      .video-play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        transition: background 0.3s ease;
      }

      .video-play-overlay:hover {
        background: rgba(0, 0, 0, 0.7);
      }

      .play-button-circle {
        width: 80px;
        height: 80px;
        background: rgba(126, 162, 212, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .play-button-circle svg {
        margin-left: 5px;
      }

      .video-play-overlay.hidden {
        display: none;
      }
      
      /* Video Protection Overlay */
      .video-protection-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 998;
        background: transparent;
      }
      
      /* Black overlay when screenshot detected */
      .video-protection-overlay.screenshot-detected {
        background: #000000;
        z-index: 1000;
      }
      
      .video-placeholder {
        padding: 200px 40px;
        text-align: center;
        color: #9CA3AF;
        font-size: 16px;
      }
    </style>
    
    <!-- Header stays the same -->
    <header class="course-learning-header">
      <div class="header-logo">
        <span class="logo-text">dars<span class="logo-highlight">linker</span></span>
      </div>
      <div class="header-actions">
        <button class="icon-btn meeting-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
        <button class="icon-btn notification-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>
        <button class="icon-btn" style="margin-right: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </button>
        <button class="icon-btn logout-btn" title="Logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="logout-text">Log out</span>
        </button>
      </div>
    </header>
    
    <!-- Sidebar + Video Player Layout -->
    <div class="lesson-player-layout">
      <!-- Left Sidebar with Lessons -->
      <div class="lesson-sidebar" id="lessonSidebar">
        <div class="sidebar-header">
          <div class="sidebar-course-title">${course.title}</div>
          <button class="sidebar-close" onclick="togglePlayerSidebar()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>
        <div class="sidebar-modules">
          ${buildLessonsListHtml(course, lesson)}
        </div>
      </div>
      
      <!-- Right Video Player -->
      <div class="lesson-player-container">
        <!-- Open Sidebar Button (shown when sidebar is closed) -->
        <button class="open-sidebar-btn" id="openSidebarBtn" onclick="togglePlayerSidebar()" style="display: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        
        <div class="lesson-player-content">
          <div class="video-wrapper" id="video-wrapper-protected">
            ${videoUrl 
              ? `<!-- Play Button -->
                 <div id="video-play-overlay" class="video-play-overlay" onclick="startProtectedVideo()">
                   <div class="play-button-circle">
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                       <path d="M8 5v14l11-7z"/>
                     </svg>
                   </div>
                 </div>
                 
                 <div class="video-protection-overlay"></div>
                 <div class="video-watermark" id="video-watermark">ID: Loading...</div>
                 <video id="protected-video" controls controlsList="nodownload" disablePictureInPicture>
                   <source src="${videoUrl}" type="video/mp4">
                   Your browser does not support the video tag.
                 </video>`
              : `<div class="video-placeholder">
                   <p>Video not available</p>
                 </div>`
            }
          </div>
          
          <!-- Lesson Info and Actions -->
          <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; background: rgba(58, 56, 56, 0.3); border-radius: 12px; border: 1px solid rgba(126, 162, 212, 0.2);">
            <div style="flex: 1;">
              <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 4px;">${lesson.title}</h2>
              <p style="color: #9CA3AF; font-size: 13px; margin: 0;">${lesson.duration || ''}</p>
            </div>
            
            <button id="nextLessonBtn" onclick="goToNextLesson('${course._id}', '${lesson._id}')" style="padding: 12px 24px; background: #7ea2d4; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; margin-left: 20px;">
              Next Lesson →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Re-attach event listeners for header
  attachEventListeners(course, lesson);
  
  // Auto-expand module containing current lesson
  if (course.modules) {
    course.modules.forEach((module, index) => {
      if (module.lessons && module.lessons.some(l => l._id === lesson._id)) {
        setTimeout(() => {
          const lessonsDiv = document.getElementById(`player-lessons-${index}`);
          const arrow = document.getElementById(`player-arrow-${index}`);
          if (lessonsDiv && arrow) {
            lessonsDiv.classList.add('expanded');
            arrow.classList.add('rotated');
          }
        }, 100);
      }
    });
  }
  
  // Initialize video protection if video exists
  if (videoUrl) {
    setTimeout(() => initVideoProtection(), 200);
  }
}

// Helper function to update only video player content (without re-rendering header/sidebar)
function updateVideoPlayerContent(layout, lesson, videoUrl) {
  const playerContainer = layout.querySelector('.lesson-player-container');
  if (!playerContainer) return;
  
  // Update only the video player content
  playerContainer.innerHTML = `
    <div class="lesson-player-content">
      <div class="video-wrapper" id="video-wrapper-protected">
        ${videoUrl 
          ? `<div class="video-protection-overlay"></div>
             <div class="video-watermark" id="video-watermark">Loading...</div>
             <video id="protected-video" controls controlsList="nodownload" disablePictureInPicture>
               <source src="${videoUrl}" type="video/mp4">
               Your browser does not support the video tag.
             </video>`
          : `<div class="video-placeholder">
               <p>Video not available</p>
             </div>`
        }
      </div>
    </div>
  `;
  
  // Re-initialize video protection
  if (videoUrl) {
    setTimeout(() => initVideoProtection(), 200);
  }
  
  console.log('✅ Video player content updated without re-rendering layout');
}

// Video Protection System
function initVideoProtection() {
  const video = document.getElementById('protected-video');
  const watermark = document.getElementById('video-watermark');
  const videoWrapper = document.getElementById('video-wrapper-protected');
  const playOverlay = document.getElementById('video-play-overlay');
  
  if (!video || !watermark || !videoWrapper) {
    console.log('⚠️ Video protection elements not found');
    return;
  }
  
  // Start video function
  window.startProtectedVideo = function() {
    if (playOverlay) playOverlay.classList.add('hidden');
    video.play();
  };
  
  // Hide overlay when video starts playing
  video.addEventListener('play', () => {
    if (playOverlay) playOverlay.classList.add('hidden');
  });
  
  video.addEventListener('ended', () => {
    showToast('Lesson completed! 🎉');
  });
  
  // Get student ID from localStorage or sessionStorage
  let studentId = 'GUEST';
  
  // Try localStorage first (main dashboard)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user._id) {
    studentId = user._id.slice(-5).toUpperCase();
  } else {
    // Try sessionStorage (landing page users)
    const landingUser = sessionStorage.getItem('landingUser');
    if (landingUser) {
      try {
        const userData = JSON.parse(landingUser);
        if (userData._id) {
          studentId = userData._id.slice(-5).toUpperCase();
        }
      } catch (error) {
        console.error('Error parsing landing user:', error);
      }
    }
  }
  
  console.log('🔑 Student ID for watermark:', studentId);
  
  watermark.textContent = studentId;
  
  // 1. Disable right-click on video
  video.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showToast('Video yuklab olish taqiqlangan!');
    return false;
  });
  
  videoWrapper.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  // 2. Disable keyboard shortcuts for screenshot and hide video
  const protectionOverlay = videoWrapper.querySelector('.video-protection-overlay');
  
  const handleKeyDown = (e) => {
    // Disable Print Screen, Cmd+Shift+3/4/5 (Mac), Windows+Shift+S
    if (
      e.key === 'PrintScreen' ||
      (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
      (e.key === 's' && e.metaKey && e.shiftKey)
    ) {
      e.preventDefault();
      
      // Show black overlay
      if (protectionOverlay) {
        protectionOverlay.classList.add('screenshot-detected');
        video.pause();
      }
      
      showToast('Screenshot taqiqlangan!');
      
      // Remove overlay after 2 seconds
      setTimeout(() => {
        if (protectionOverlay) {
          protectionOverlay.classList.remove('screenshot-detected');
        }
      }, 2000);
      
      return false;
    }
    
    // Disable F12, Ctrl+Shift+I, Cmd+Option+I (DevTools)
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.metaKey && e.altKey && e.key === 'I')
    ) {
      e.preventDefault();
      showToast('DevTools taqiqlangan!');
      return false;
    }
  };
  
  const handleKeyUp = (e) => {
    // Remove black overlay when key is released
    if (e.key === 'PrintScreen') {
      setTimeout(() => {
        if (protectionOverlay) {
          protectionOverlay.classList.remove('screenshot-detected');
        }
      }, 1000);
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  // 3. Random watermark position animation - disappear completely, then appear at new location
  function updateWatermarkPosition() {
    const wrapper = videoWrapper.getBoundingClientRect();
    const watermarkWidth = 100;
    const watermarkHeight = 25;
    
    // Random position (with padding from edges)
    const padding = 40;
    const maxX = wrapper.width - watermarkWidth - padding;
    const maxY = wrapper.height - watermarkHeight - padding;
    
    const randomX = Math.random() * maxX + padding;
    const randomY = Math.random() * maxY + padding;
    
    // Step 1: Hide completely (instant)
    watermark.style.transition = 'none';
    watermark.style.display = 'none';
    
    // Step 2: Wait, then change position while hidden
    setTimeout(() => {
      watermark.style.left = `${randomX}px`;
      watermark.style.top = `${randomY}px`;
      
      // Step 3: Show at new position (instant) - only show ID, no position info
      watermark.textContent = studentId; // Only student ID, no coordinates
      watermark.style.display = 'block';
    }, 500); // Hidden for 500ms
  }
  
  // Initial position (no fade on first load)
  const wrapper = videoWrapper.getBoundingClientRect();
  const watermarkWidth = 120;
  const watermarkHeight = 30;
  const padding = 40;
  const maxX = wrapper.width - watermarkWidth - padding;
  const maxY = wrapper.height - watermarkHeight - padding;
  const initialX = Math.random() * maxX + padding;
  const initialY = Math.random() * maxY + padding;
  watermark.style.left = `${initialX}px`;
  watermark.style.top = `${initialY}px`;
  watermark.textContent = studentId; // Only show student ID
  
  // Update position every 10 seconds (8s visible + 2s for fade animation)
  const positionInterval = setInterval(updateWatermarkPosition, 10000);
  
  // Update position when video size changes
  video.addEventListener('loadedmetadata', updateWatermarkPosition);
  const resizeHandler = () => updateWatermarkPosition();
  window.addEventListener('resize', resizeHandler);
  
  // 4. Detect DevTools opening
  let devtoolsOpen = false;
  const threshold = 160;
  
  const devtoolsInterval = setInterval(() => {
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        showToast('⚠️ DevTools aniqlandi! Video to\'xtatildi.');
        video.pause();
      }
    } else {
      devtoolsOpen = false;
    }
  }, 1000);
  
  // 5. Advanced screen recording detection with blur
  let isRecording = false;
  
  // Detect when page loses focus (screen recording apps often cause this)
  const visibilityHandler = () => {
    if (document.hidden) {
      // Pause video
      video.pause();
      
      // Add blur and black overlay
      video.style.filter = 'blur(50px) brightness(0)';
      videoWrapper.classList.add('recording-detected');
      isRecording = true;
      
      console.log('⚠️ Page hidden - video paused and blurred');
    } else {
      // Remove blur and overlay after delay
      setTimeout(() => {
        video.style.filter = 'none';
        videoWrapper.classList.remove('recording-detected');
        isRecording = false;
        console.log('✅ Page visible - video restored');
      }, 500);
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);
  
  // Also detect window blur (when user switches to another app)
  const windowBlurHandler = () => {
    video.pause();
    video.style.filter = 'blur(50px) brightness(0)';
    videoWrapper.classList.add('recording-detected');
    console.log('⚠️ Window blur - video paused');
  };
  
  const windowFocusHandler = () => {
    setTimeout(() => {
      video.style.filter = 'none';
      videoWrapper.classList.remove('recording-detected');
      console.log('✅ Window focus - video restored');
    }, 500);
  };
  
  window.addEventListener('blur', windowBlurHandler);
  window.addEventListener('focus', windowFocusHandler);
  
  // Detect screen capture via getDisplayMedia
  const detectScreenCapture = () => {
    // Check if screen is being captured
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      
      navigator.mediaDevices.getDisplayMedia = function(...args) {
        videoWrapper.classList.add('recording-detected');
        video.pause();
        showToast('⚠️ Screen recording aniqlandi!');
        isRecording = true;
        
        return originalGetDisplayMedia.apply(this, args);
      };
    }
  };
  
  detectScreenCapture();
  
  // Monitor for screen recording apps (check window focus frequently)
  const recordingCheckInterval = setInterval(() => {
    // If video is playing but document is not focused, likely recording
    if (!document.hasFocus() && !video.paused) {
      videoWrapper.classList.add('recording-detected');
      video.pause();
      isRecording = true;
    }
  }, 500);
  
  // 6. Prevent drag and drop
  video.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Cleanup function when navigating away
  const cleanup = () => {
    clearInterval(positionInterval);
    clearInterval(devtoolsInterval);
    clearInterval(recordingCheckInterval);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('visibilitychange', visibilityHandler);
    window.removeEventListener('blur', windowBlurHandler);
    window.removeEventListener('focus', windowFocusHandler);
    window.removeEventListener('resize', resizeHandler);
  };
  
  // Store cleanup function for later use
  window._videoProtectionCleanup = cleanup;
  
  console.log('🔒 Video protection enabled for student:', studentId);
}

// Build lessons list HTML (like lesson-view.js)
function buildLessonsListHtml(course, currentLesson) {
  let html = '';
  
  if (course.modules) {
    course.modules.forEach((module, moduleIndex) => {
      html += `
        <div class="sidebar-module">
          <div class="sidebar-module-header" onclick="togglePlayerModule(${moduleIndex})">
            <span class="sidebar-module-title">${module.title || `Module ${moduleIndex + 1}`}</span>
            <span class="sidebar-module-count">${module.lessons?.length || 0} dars</span>
            <span class="sidebar-module-arrow" id="player-arrow-${moduleIndex}">▼</span>
          </div>
          <div class="sidebar-module-lessons" id="player-lessons-${moduleIndex}">
            ${module.lessons && module.lessons.length > 0 
              ? module.lessons.map((lesson, lessonIndex) => {
                  const isActive = lesson._id === currentLesson._id;
                  
                  return `
                  <div class="sidebar-lesson ${isActive ? 'active' : ''}" 
                       onclick="openLesson('${module._id}', '${lesson._id}')">
                    <div class="sidebar-lesson-icon">
                      ${lesson.type === 'video' 
                        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                             <path d="M8 5v14l11-7z"/>
                           </svg>`
                        : lesson.type === 'quiz' 
                        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                             <path d="M9 11l3 3L22 4"></path>
                             <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                           </svg>`
                        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                             <polyline points="14 2 14 8 20 8"></polyline>
                           </svg>`
                      }
                    </div>
                    <div class="sidebar-lesson-info">
                      <div class="sidebar-lesson-title">${lesson.title || `Lesson ${lessonIndex + 1}`}</div>
                      ${lesson.duration ? `<div class="sidebar-lesson-duration">${lesson.duration}</div>` : ''}
                    </div>
                  </div>
                `;
                }).join('')
              : '<div style="padding: 20px; text-align: center; color: #9CA3AF;">No lessons</div>'
            }
          </div>
        </div>
      `;
    });
  }
  
  return html;
}

// Toggle sidebar visibility
window.togglePlayerSidebar = function() {
  const sidebar = document.getElementById('lessonSidebar');
  const openBtn = document.getElementById('openSidebarBtn');
  
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    
    // Toggle open button visibility
    if (openBtn) {
      openBtn.style.display = sidebar.classList.contains('collapsed') ? 'flex' : 'none';
    }
  }
};

// Toggle sidebar module
window.togglePlayerModule = function(index) {
  const lessonsDiv = document.getElementById(`player-lessons-${index}`);
  const arrow = document.getElementById(`player-arrow-${index}`);
  
  if (lessonsDiv && arrow) {
    lessonsDiv.classList.toggle('expanded');
    arrow.classList.toggle('rotated');
  }
}

// Render sidebar modules
function renderSidebarModules(modules, currentLessonId) {
  return modules.map((module, index) => {
    const lessons = module.lessons || [];
    return `
      <div class="sidebar-module">
        <div class="sidebar-module-header">
          <div class="sidebar-module-title">${index + 1}. ${module.title}</div>
        </div>
        ${lessons.map(lesson => `
          <div class="sidebar-lesson ${lesson._id === currentLessonId ? 'active' : ''}" onclick="openLesson('${module._id}', '${lesson._id}')">
            <div class="sidebar-lesson-icon">
              ${getLessonIcon(lesson.type)}
            </div>
            <div class="sidebar-lesson-info">
              <div class="sidebar-lesson-title">${lesson.title}</div>
              <div class="sidebar-lesson-duration">${lesson.duration || 'No duration'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}



function showErrorPage() {
  document.body.innerHTML = `
    <div style="text-align: center; padding: 60px 20px; background: #232323; min-height: 100vh; color: #ffffff;">
      <h1 style="color: #ef4444; margin-bottom: 16px;">Error</h1>
      <p style="color: #9CA3AF; margin-bottom: 24px;">Failed to load course</p>
      <button onclick="window.history.back()" style="padding: 12px 24px; background: #7ea2d4; color: white; border: none; border-radius: 8px; cursor: pointer;">Go Back</button>
    </div>
  `;
}
