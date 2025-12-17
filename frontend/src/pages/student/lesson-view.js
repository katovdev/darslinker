import { router } from '../../utils/router.js';

// Initialize lesson view page
export async function initLessonViewPage(courseId, lessonId) {
  console.log('📹 Loading lesson view for course:', courseId, 'lesson:', lessonId);
  
  // Fetch course data
  const courseData = await fetchCourseData(courseId);
  
  if (!courseData) {
    showErrorPage();
    return;
  }
  
  // Find the lesson
  let currentLesson = null;
  if (courseData.course.modules) {
    for (const module of courseData.course.modules) {
      if (module.lessons) {
        const found = module.lessons.find(lesson => lesson._id === lessonId);
        if (found) {
          currentLesson = found;
          break;
        }
      }
    }
  }
  
  if (!currentLesson) {
    showErrorPage();
    return;
  }
  
  renderLessonViewPage(courseData, currentLesson);
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
      // Fetch teacher's landing data for theme
      const teacherId = result.course.teacher?._id || result.course.teacher;
      let landingData = null;
      
      if (teacherId) {
        try {
          const landingResponse = await fetch(`${apiBaseUrl}/landing/public/${teacherId}`);
          const landingResult = await landingResponse.json();
          if (landingResult.success) {
            landingData = landingResult.landing;
          }
        } catch (error) {
          console.error('Error fetching landing data:', error);
        }
      }
      
      return {
        course: result.course,
        landingData: landingData
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    return null;
  }
}

// Render lesson view page
function renderLessonViewPage(courseData, currentLesson) {
  const appElement = document.querySelector('#app');
  if (!appElement) return;
  
  const { course, landingData } = courseData;
  const themeColor = landingData?.primaryColor || '#7EA2D4';
  const logoText = landingData?.logoText || 'DarsLinker';
  
  // Build lessons list HTML
  let lessonsListHtml = '';
  
  // Find first video lesson
  let firstVideoId = null;
  if (course.modules) {
    for (const mod of course.modules) {
      if (mod.lessons) {
        for (const les of mod.lessons) {
          if (les.type === 'video') {
            firstVideoId = les._id;
            break;
          }
        }
      }
      if (firstVideoId) break;
    }
  }
  
  if (course.modules) {
    course.modules.forEach((module, moduleIndex) => {
      lessonsListHtml += `
        <div class="lesson-view-module">
          <div class="lesson-view-module-header" onclick="toggleLessonModule(${moduleIndex})">
            <span class="lesson-view-module-title">${module.title || `Module ${moduleIndex + 1}`}</span>
            <span class="lesson-view-module-count">${module.lessons?.length || 0} dars</span>
            <span class="lesson-view-module-arrow" id="lesson-arrow-${moduleIndex}">▼</span>
          </div>
          <div class="lesson-view-module-lessons" id="lesson-lessons-${moduleIndex}">
            ${module.lessons && module.lessons.length > 0 
              ? module.lessons.map((lesson, lessonIndex) => {
                  const isFirstVideo = lesson._id === firstVideoId;
                  const isLocked = !isFirstVideo;
                  const isActive = lesson._id === currentLesson._id;
                  
                  return `
                  <div class="lesson-view-lesson ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" 
                       onclick="${isLocked ? 'showLessonLockedToast()' : `navigateToLesson('${course._id}', '${lesson._id}', '${lesson.type}')`}">
                    <div class="lesson-view-lesson-icon">
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
                    <div class="lesson-view-lesson-info">
                      <div class="lesson-view-lesson-title">${lesson.title || `Lesson ${lessonIndex + 1}`}</div>
                      ${lesson.duration ? `<div class="lesson-view-lesson-duration">${lesson.duration}</div>` : ''}
                    </div>
                    ${isActive 
                      ? `<div class="lesson-view-lesson-playing">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                             <path d="M8 5v14l11-7z"/>
                           </svg>
                         </div>` 
                      : isLocked
                      ? `<div class="lesson-view-lesson-lock">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                             <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                           </svg>
                         </div>`
                      : ''}
                  </div>
                `;
                }).join('')
              : '<div class="lesson-view-no-lessons">No lessons</div>'
            }
          </div>
        </div>
      `;
    });
  }
  
  // Get video URL - support both direct URLs and streaming
  let videoUrl = currentLesson.videoUrl || currentLesson.fileUrl || currentLesson.url;
  
  // If video URL is from R2, use streaming endpoint
  if (videoUrl && videoUrl.includes('r2.cloudflarestorage.com')) {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    // Extract the key from R2 URL
    const urlParts = videoUrl.split('/');
    const key = urlParts.slice(urlParts.indexOf('videos')).join('/');
    videoUrl = `${apiBaseUrl}/stream/r2/${key}`;
  }
  
  appElement.innerHTML = `
    <style>
      :root {
        --theme-color: ${themeColor};
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: #1a1a1a;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow-x: hidden;
        padding-top: 0 !important;
      }

      body > .header {
        display: none !important;
      }

      /* Header */
      .lesson-view-header {
        background: #232323;
        padding: 20px 0;
        border-bottom: 1px solid color-mix(in srgb, var(--theme-color) 20%, transparent);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .lesson-view-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 24px;
      }

      .lesson-view-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .lesson-view-logo {
        display: flex;
        align-items: center;
      }

      .lesson-view-back-btn {
        background: transparent;
        border: 1px solid color-mix(in srgb, var(--theme-color) 30%, transparent);
        color: #9CA3AF;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .lesson-view-back-btn:hover {
        border-color: var(--theme-color);
        color: var(--theme-color);
      }

      .lesson-view-logo-text {
        font-family: 'League Spartan', sans-serif;
        font-size: 28px;
        font-weight: 600;
        color: var(--theme-color);
      }

      .lesson-view-course-title {
        font-size: 16px;
        color: #9CA3AF;
      }

      /* Main Content */
      .lesson-view-main {
        display: grid;
        grid-template-columns: 380px 1fr;
        height: calc(100vh - 80px);
        transition: grid-template-columns 0.3s ease;
        position: relative;
      }

      .lesson-view-main.sidebar-hidden {
        grid-template-columns: 0 1fr;
      }

      /* Left Sidebar */
      .lesson-view-sidebar {
        background: #232323;
        border-right: 1px solid rgba(126, 162, 212, 0.2);
        overflow-y: auto;
        overflow-x: hidden;
        transition: all 0.3s ease;
      }

      .lesson-view-main.sidebar-hidden .lesson-view-sidebar {
        width: 0;
        min-width: 0;
        border-right: none;
      }

      /* Sidebar Toggle Button (when closed) */
      .lesson-view-sidebar-toggle-btn {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        background: #232323;
        border: 1px solid color-mix(in srgb, var(--theme-color) 30%, transparent);
        border-left: none;
        border-radius: 0 8px 8px 0;
        color: var(--theme-color);
        padding: 16px 8px;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;
        opacity: 0;
        pointer-events: none;
      }

      .lesson-view-main.sidebar-hidden .lesson-view-sidebar-toggle-btn {
        opacity: 1;
        pointer-events: auto;
      }

      .lesson-view-sidebar-toggle-btn:hover {
        background: color-mix(in srgb, var(--theme-color) 10%, transparent);
        padding-right: 12px;
      }

      .lesson-view-sidebar-header {
        padding: 20px 24px;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .lesson-view-sidebar-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        flex: 1;
      }

      .lesson-view-sidebar-close {
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

      .lesson-view-sidebar-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--theme-color);
      }

      .lesson-view-modules-list {
        padding: 12px 0;
      }

      .lesson-view-module {
        border-bottom: 1px solid color-mix(in srgb, var(--theme-color) 10%, transparent);
      }

      .lesson-view-module-header {
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .lesson-view-module-header:hover {
        background: color-mix(in srgb, var(--theme-color) 5%, transparent);
      }

      .lesson-view-module-title {
        flex: 1;
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
      }

      .lesson-view-module-count {
        font-size: 12px;
        color: #9CA3AF;
      }

      .lesson-view-module-arrow {
        color: var(--theme-color);
        font-size: 12px;
        transition: transform 0.3s;
      }

      .lesson-view-module-arrow.rotated {
        transform: rotate(-180deg);
      }

      .lesson-view-module-lessons {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .lesson-view-module-lessons.expanded {
        max-height: 2000px;
      }

      .lesson-view-lesson {
        padding: 14px 24px 14px 44px;
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
        transition: all 0.2s;
        border-left: 4px solid transparent;
        position: relative;
      }

      .lesson-view-lesson:hover {
        background: color-mix(in srgb, var(--theme-color) 10%, transparent);
      }

      .lesson-view-lesson.active {
        background: color-mix(in srgb, var(--theme-color) 20%, transparent);
        border-left-color: var(--theme-color);
      }

      .lesson-view-lesson.locked {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .lesson-view-lesson.locked .lesson-view-lesson-icon {
        color: #9CA3AF;
      }

      .lesson-view-lesson.locked .lesson-view-lesson-title {
        color: #9CA3AF;
      }

      .lesson-view-lesson-icon {
        color: var(--theme-color);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }
      
      .lesson-view-lesson-icon svg {
        display: block;
      }

      .lesson-view-lesson-info {
        flex: 1;
      }

      .lesson-view-lesson-title {
        font-size: 14px;
        color: #ffffff;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .lesson-view-lesson-duration {
        font-size: 12px;
        color: #9CA3AF;
      }

      .lesson-view-lesson-playing {
        color: var(--theme-color);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .lesson-view-lesson-playing svg {
        display: block;
      }

      .lesson-view-lesson-lock {
        color: #9CA3AF;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .lesson-view-lesson-lock svg {
        display: block;
      }

      /* Toast Notification */
      .lesson-toast {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--theme-color);
        color: #ffffff;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        font-weight: 500;
        z-index: 10001;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
      }

      .lesson-toast.show {
        opacity: 1;
        transform: translateY(0);
      }

      .lesson-toast svg {
        flex-shrink: 0;
      }

      /* Right Side - Video Player */
      .lesson-view-content {
        background: #1a1a1a;
        display: flex;
        flex-direction: column;
      }



      .lesson-view-video-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 80px;
        background: #1a1a1a;
        transition: padding 0.3s ease;
      }

      .lesson-view-main.sidebar-hidden .lesson-view-video-container {
        padding: 20px 120px;
      }

      .lesson-view-video-wrapper {
        width: 100%;
        max-width: 1400px;
        background: #000000;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }

      .lesson-view-video-player {
        width: 100%;
        height: auto;
        display: block;
      }

      /* Responsive */
      @media (max-width: 968px) {
        .lesson-view-main {
          grid-template-columns: 1fr;
        }
        
        .lesson-view-sidebar {
          display: none;
        }

        .lesson-view-video-container {
          padding: 20px 15px;
        }

        .lesson-view-video-wrapper {
          border-radius: 12px;
        }
      }

      @media (max-width: 480px) {
        .lesson-view-video-container {
          padding: 10px 8px;
        }

        .lesson-view-video-wrapper {
          border-radius: 8px;
        }

        .lesson-view-header {
          padding: 15px 0;
        }

        .lesson-view-container {
          padding: 0 15px;
        }

        .lesson-view-logo-text {
          font-size: 24px;
        }

        .lesson-view-back-btn {
          padding: 6px 12px;
          font-size: 13px;
        }
      }
    </style>

    <div class="lesson-view-page">
      <!-- Header -->
      <header class="lesson-view-header">
        <div class="lesson-view-container">
          <div class="lesson-view-header-content">
            <div class="lesson-view-logo">
              <div class="lesson-view-logo-text">${logoText}</div>
            </div>
            <button class="lesson-view-back-btn" onclick="window.history.back()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Orqaga
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="lesson-view-main" id="lesson-view-main">
        <!-- Sidebar Toggle Button (visible when sidebar is hidden) -->
        <button class="lesson-view-sidebar-toggle-btn" onclick="toggleSidebar()" title="Kurs tarkibini ko'rish">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <!-- Left Sidebar -->
        <div class="lesson-view-sidebar">
          <div class="lesson-view-sidebar-header">
            <div class="lesson-view-sidebar-title">${course.title}</div>
            <button class="lesson-view-sidebar-close" onclick="toggleSidebar()" title="Yopish">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          </div>
          <div class="lesson-view-modules-list">
            ${lessonsListHtml}
          </div>
        </div>

        <!-- Right Side - Video Player -->
        <div class="lesson-view-content">
          <div class="lesson-view-video-container">
            ${videoUrl 
              ? `<div class="lesson-view-video-wrapper">
                   <video 
                     id="lesson-video-player"
                     controls 
                     controlsList="nodownload nopictureinpicture"
                     autoplay 
                     preload="metadata"
                     class="lesson-view-video-player"
                     playsinline
                   >
                     <source src="${videoUrl}" type="video/mp4">
                     Your browser does not support the video tag.
                   </video>
                   <div id="video-loading" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;">
                     <div style="text-align: center;">
                       <div style="border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                       <p style="margin-top: 10px;">Loading video...</p>
                     </div>
                   </div>
                 </div>`
              : `<div style="color: #9CA3AF; text-align: center;">
                   <p>Video not available</p>
                 </div>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Auto-expand the module containing current lesson
  if (course.modules) {
    course.modules.forEach((module, index) => {
      if (module.lessons && module.lessons.some(l => l._id === currentLesson._id)) {
        setTimeout(() => {
          const lessonsDiv = document.getElementById(`lesson-lessons-${index}`);
          const arrow = document.getElementById(`lesson-arrow-${index}`);
          if (lessonsDiv && arrow) {
            lessonsDiv.classList.add('expanded');
            arrow.classList.add('rotated');
          }
        }, 100);
      }
    });
  }
  
  // Setup video player event listeners
  setupVideoPlayer(currentLesson._id);
}

// Setup video player with streaming support
function setupVideoPlayer(lessonId) {
  const videoPlayer = document.getElementById('lesson-video-player');
  const loadingIndicator = document.getElementById('video-loading');
  
  if (!videoPlayer) return;
  
  // Show loading indicator
  videoPlayer.addEventListener('waiting', () => {
    if (loadingIndicator) loadingIndicator.style.display = 'block';
  });
  
  videoPlayer.addEventListener('canplay', () => {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  });
  
  // Track video progress
  let progressInterval;
  videoPlayer.addEventListener('play', () => {
    progressInterval = setInterval(() => {
      const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
      console.log('Video progress:', progress.toFixed(2) + '%');
      // You can save progress to backend here
    }, 5000); // Update every 5 seconds
  });
  
  videoPlayer.addEventListener('pause', () => {
    if (progressInterval) clearInterval(progressInterval);
  });
  
  videoPlayer.addEventListener('ended', () => {
    if (progressInterval) clearInterval(progressInterval);
    console.log('Video completed!');
    // Mark lesson as completed
  });
  
  // Handle errors
  videoPlayer.addEventListener('error', (e) => {
    console.error('Video playback error:', e);
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    showLessonToast('Video playback error. Please try again.');
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
      case ' ':
        e.preventDefault();
        if (videoPlayer.paused) {
          videoPlayer.play();
        } else {
          videoPlayer.pause();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 10);
        break;
      case 'f':
        e.preventDefault();
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen();
        }
        break;
    }
  });
}

// Show toast notification
function showLessonToast(message) {
  const existingToast = document.querySelector('.lesson-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'lesson-toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Show locked lesson toast
window.showLessonLockedToast = function() {
  showLessonToast('Ro\'yxatdan o\'ting va kursni to\'liq ko\'ring!');
};

// Toggle sidebar
window.toggleSidebar = function() {
  const main = document.getElementById('lesson-view-main');
  const toggleText = document.getElementById('sidebar-toggle-text');
  
  if (main) {
    main.classList.toggle('sidebar-hidden');
    
    if (main.classList.contains('sidebar-hidden')) {
      if (toggleText) toggleText.textContent = 'Kurs tarkibini ko\'rish';
    } else {
      if (toggleText) toggleText.textContent = 'Kurs tarkibi';
    }
  }
};

// Toggle module
window.toggleLessonModule = function(index) {
  const lessonsDiv = document.getElementById(`lesson-lessons-${index}`);
  const arrow = document.getElementById(`lesson-arrow-${index}`);
  
  if (lessonsDiv && arrow) {
    lessonsDiv.classList.toggle('expanded');
    arrow.classList.toggle('rotated');
  }
};

// Navigate to lesson
window.navigateToLesson = function(courseId, lessonId, lessonType) {
  if (lessonType === 'video') {
    router.navigate(`/lesson/${courseId}/${lessonId}`);
  } else if (lessonType === 'assignment') {
    // For assignment, just show alert for now
    alert('Assignment feature coming soon!');
  } else if (lessonType === 'quiz') {
    alert('Quiz feature coming soon!');
  }
};

// Show error page
function showErrorPage() {
  const appElement = document.querySelector('#app');
  if (!appElement) return;
  
  appElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #232323; color: #ffffff;">
      <h1 style="font-size: 48px; margin-bottom: 16px;">404</h1>
      <p style="font-size: 18px; color: #9CA3AF; margin-bottom: 32px;">Lesson not found</p>
      <button onclick="window.history.back()" style="padding: 12px 32px; background: var(--theme-color); color: #ffffff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
        Orqaga
      </button>
    </div>
  `;
}
