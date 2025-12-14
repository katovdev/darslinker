// Course learning page - Full course view with modules and lessons
import { loadQuizPlayer } from './quiz-player.js';
import { renderAssignmentContent } from './assignment-player.js';
import { showCourseCompletionSuccess } from './course-success.js';
// Import i18n functions
import { t, getCurrentLanguage, setLanguage, initI18n } from '../../utils/i18n.js';
import { apiService } from '../../utils/api.js';
import { showSuccessToast, showErrorToast } from '../../utils/toast.js';

// Function to check if current lesson is the last lesson in the course
function isLastLesson(lessonId) {
  const course = window.currentCourse || window.loadedCourse;
  if (!course || !course.modules) return false;
  
  // Find the last lesson in the last module
  const lastModule = course.modules[course.modules.length - 1];
  if (!lastModule || !lastModule.lessons || lastModule.lessons.length === 0) return false;
  
  const lastLesson = lastModule.lessons[lastModule.lessons.length - 1];
  return lastLesson._id === lessonId;
}

// Function to complete course
async function completeCourse(courseId) {
  try {
    const response = await apiService.completeCourse(courseId);
    console.log('Course completion response:', response);
    return response;
  } catch (error) {
    console.error('Error completing course:', error);
    // Don't throw error, just log it - we still want to show success
    return { success: false, error: error.message };
  }
}

// Function to translate duration text
function translateDuration(duration) {
  if (!duration || typeof duration !== 'string') {
    return duration;
  }
  
  // Skip if it's already a non-time text
  const lowerDuration = duration.toLowerCase().trim();
  if (lowerDuration === 'quiz' || lowerDuration === 'assignment' || lowerDuration === 'file') {
    return duration;
  }
  
  console.log('🕐 Translating duration:', duration, 'Current language:', getCurrentLanguage());
  
  // Quick test - if it's exactly "11 daqiqa 33 soniya", force translate it
  if (duration === "11 daqiqa 33 soniya") {
    const currentLang = getCurrentLanguage();
    console.log('🎯 Found exact match for test duration, current lang:', currentLang);
    if (currentLang === 'ru') {
      return '11 минут 33 секунд';
    } else if (currentLang === 'en') {
      return '11 minutes 33 seconds';
    }
  }
  
  // Handle various Uzbek formats: "11 daqiqa 33 soniy", "11daqiqa33soniya", etc.
  const uzbekPatterns = [
    /(\d+)\s*daqiqa\s*(\d+)\s*soniya/i,
    /(\d+)\s*daqiqa\s*(\d+)\s*soniy/i,
    /(\d+)\s*daqiqa\s*(\d+)/i,
    /(\d+)\s*daqiqa/i
  ];
  
  for (const pattern of uzbekPatterns) {
    const match = duration.match(pattern);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2] || 0);
      
      console.log('✅ Matched Uzbek pattern:', { minutes, seconds });
      
      const currentLang = getCurrentLanguage();
      if (currentLang === 'en') {
        if (seconds > 0) {
          return `${minutes} ${minutes === 1 ? t('time.minute') : t('time.minutes')} ${seconds} ${seconds === 1 ? t('time.second') : t('time.seconds')}`;
        } else {
          return `${minutes} ${minutes === 1 ? t('time.minute') : t('time.minutes')}`;
        }
      } else if (currentLang === 'ru') {
        if (seconds > 0) {
          return `${minutes} ${t('time.minutes')} ${seconds} ${t('time.seconds')}`;
        } else {
          return `${minutes} ${t('time.minutes')}`;
        }
      } else {
        // Keep Uzbek as is or format it properly
        if (seconds > 0) {
          return `${minutes} ${t('time.minutes')} ${seconds} ${t('time.seconds')}`;
        } else {
          return `${minutes} ${t('time.minutes')}`;
        }
      }
    }
  }
  
  // Handle MM:SS format (e.g., "11:33")
  const timePattern = /^(\d+):(\d+)$/;
  const timeMatch = duration.match(timePattern);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1]);
    const seconds = parseInt(timeMatch[2]);
    
    console.log('✅ Matched time pattern:', { minutes, seconds });
    
    const currentLang = getCurrentLanguage();
    if (currentLang === 'uz') {
      if (seconds > 0) {
        return `${minutes} ${t('time.minutes')} ${seconds} ${t('time.seconds')}`;
      } else {
        return `${minutes} ${t('time.minutes')}`;
      }
    } else if (currentLang === 'ru') {
      if (seconds > 0) {
        return `${minutes} ${t('time.minutes')} ${seconds} ${t('time.seconds')}`;
      } else {
        return `${minutes} ${t('time.minutes')}`;
      }
    } else {
      if (seconds > 0) {
        return `${minutes} ${minutes === 1 ? t('time.minute') : t('time.minutes')} ${seconds} ${seconds === 1 ? t('time.second') : t('time.seconds')}`;
      } else {
        return `${minutes} ${minutes === 1 ? t('time.minute') : t('time.minutes')}`;
      }
    }
  }
  
  // Handle English formats
  const englishPattern = /(\d+)\s*minutes?\s*(\d+)?\s*seconds?/i;
  const englishMatch = duration.match(englishPattern);
  if (englishMatch) {
    const minutes = parseInt(englishMatch[1]);
    const seconds = parseInt(englishMatch[2] || 0);
    
    console.log('✅ Matched English pattern:', { minutes, seconds });
    
    const currentLang = getCurrentLanguage();
    if (currentLang === 'uz') {
      if (seconds > 0) {
        return `${minutes} ${t('time.minutes')} ${seconds} ${t('time.seconds')}`;
      } else {
        return `${minutes} ${t('time.minutes')}`;
      }
    } else if (currentLang === 'ru') {
      if (seconds > 0) {
        return `${minutes} ${t('time.minutes')} ${seconds} ${t('time.seconds')}`;
      } else {
        return `${minutes} ${t('time.minutes')}`;
      }
    }
  }
  
  console.log('❌ No pattern matched for duration:', duration);
  // Return original if no pattern matches
  return duration;
}

// Function to retranslate all durations on the page
function retranslateDurations() {
  console.log('🔄 Retranslating all durations on page...');
  
  // Find all lesson duration elements
  const durationElements = document.querySelectorAll('.lesson-duration, .sidebar-lesson-duration');
  
  durationElements.forEach(element => {
    const originalText = element.textContent;
    if (originalText && originalText !== t('courseLearning.noDuration')) {
      const translatedText = translateDuration(originalText);
      if (translatedText !== originalText) {
        console.log('🔄 Updating duration:', originalText, '→', translatedText);
        element.textContent = translatedText;
      }
    }
  });
}

// Global flag to track if layout is already rendered
let isLayoutRendered = false;
let currentCourse = null;
let teacherLandingSettings = null; // Store teacher landing settings globally

// Load teacher landing settings
async function loadTeacherLandingSettings(teacherId) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/landing/public/${teacherId}`);
    const result = await response.json();
    
    if (result.success && result.landing) {
      console.log('✅ Teacher landing settings loaded:', result.landing);
      teacherLandingSettings = result.landing;
      
      // Apply CSS variables immediately
      const primaryColor = result.landing.primaryColor || '#7ea2d4';
      const backgroundColor = result.landing.backgroundColor || '#232323';
      const textColor = result.landing.textColor || '#ffffff';
      
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      document.documentElement.style.setProperty('--background-color', backgroundColor);
      document.documentElement.style.setProperty('--text-color', textColor);
      
      return result.landing;
    }
  } catch (error) {
    console.error('⚠️ Could not load teacher landing settings:', error);
  }
  return null;
}

// Get logo HTML based on teacher settings
function getLogoHTML() {
  if (!teacherLandingSettings) {
    return '<span class="logo-text">dars<span class="logo-highlight">linker</span></span>';
  }
  
  const logoText = teacherLandingSettings.logoText || 'darslinker';
  const lowerText = logoText.toLowerCase();
  
  if (lowerText.includes('linker')) {
    const parts = logoText.split(/linker/i);
    const firstPart = parts[0] || '';
    return `<span class="logo-text">${firstPart}<span class="logo-highlight">linker</span></span>`;
  } else {
    return `<span class="logo-text">${logoText}</span>`;
  }
}

export async function initCourseLearningPage(courseId) {
  console.log('📚 Loading course learning page for:', courseId);
  
  // Initialize i18n
  await initI18n();
  
  // Add language change listener to re-translate durations
  window.addEventListener('languageChanged', () => {
    console.log('🌍 Language changed, re-translating durations...');
    setTimeout(() => {
      retranslateDurations();
    }, 100);
  });

  // Fetch course data
  const courseData = await fetchCourseData(courseId);

  if (!courseData) {
    showErrorPage();
    return;
  }

  // Check if course is paid and payment is required
  if (courseData.courseType !== 'free' && courseData.price > 0) {
    const landingUser = sessionStorage.getItem('landingUser');
    if (landingUser) {
      try {
        const userData = JSON.parse(landingUser);
        const studentId = userData._id;

        // Check payment status
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
        const paymentResponse = await fetch(`${apiBaseUrl}/payments/student/${studentId}/course/${courseId}`);
        const paymentResult = await paymentResponse.json();

        if (!paymentResult.success || !paymentResult.isApproved) {
          // Payment not approved, redirect to payment page
          console.log('💳 Payment required, redirecting to payment page');
          import('../../utils/router.js').then(({ router }) => {
            router.navigate(`/course-payment/${courseId}`);
          }).catch(() => {
            window.location.href = `/course-payment/${courseId}`;
          });
          return;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        // On error, redirect to payment page for paid courses
        import('../../utils/router.js').then(({ router }) => {
          router.navigate(`/course-payment/${courseId}`);
        }).catch(() => {
          window.location.href = `/course-payment/${courseId}`;
        });
        return;
      }
    }
  }

  // Store course data globally
  currentCourse = courseData;

  // Load teacher theme BEFORE rendering to prevent color flash
  if (courseData.teacher && courseData.teacher._id) {
    await loadTeacherLandingSettings(courseData.teacher._id);
  } else if (courseData.teacher) {
    // If teacher is just an ID string
    await loadTeacherLandingSettings(courseData.teacher);
  }

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
  // Teacher settings already loaded in initCourseLearningPage
  
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
    const hoursText = totalHours === 1 ? t('time.hour') : t('time.hours');
    durationText = `${totalHours} ${hoursText}`;
    if (displayMinutes > 0) {
      const minutesText = displayMinutes === 1 ? t('time.minute') : t('time.minutes');
      durationText += ` ${displayMinutes} ${minutesText}`;
    }
  } else if (displayMinutes > 0) {
    const minutesText = displayMinutes === 1 ? t('time.minute') : t('time.minutes');
    durationText = `${displayMinutes} ${minutesText}`;
    if (remainingSeconds > 0) {
      const secondsText = remainingSeconds === 1 ? t('time.second') : t('time.seconds');
      durationText += ` ${remainingSeconds} ${secondsText}`;
    }
  } else {
    const secondsText = remainingSeconds === 1 ? t('time.second') : t('time.seconds');
    durationText = `${remainingSeconds} ${secondsText}`;
  }

  // Clear body and set styles
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'auto';
  
  const appContainer = document.getElementById('app') || document.body;
  appContainer.innerHTML = `
    <style>
      /* CSS Variables for theming */
      :root {
        --primary-color: #7ea2d4;
        --background-color: #232323;
        --text-color: #ffffff;
      }

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
        border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
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
        color: var(--primary-color, #7ea2d4);
      }

      .logo-highlight {
        color: var(--primary-color);
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
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 8px;
        color: #9CA3AF;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .icon-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        color: #ffffff;
        border-color: var(--primary-color);
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
        border-color: var(--primary-color) !important;
        margin-left: 8px;
        color: var(--primary-color) !important;
      }

      .logout-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 15%, transparent) !important;
        border-color: var(--primary-color) !important;
        color: var(--primary-color) !important;
      }

      .logout-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-color);
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
        color: var(--primary-color);
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
        background: var(--primary-color);
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
        pointer-events: none;
      }

      .progress-marker {
        position: absolute;
        top: 0;
        width: 2px;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(-1px);
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
        color: var(--primary-color);
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
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .module-card:hover {
        border-color: var(--primary-color);
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
        background: color-mix(in srgb, var(--primary-color) 5%, transparent);
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
        background: linear-gradient(90deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, #fff));
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
        color: var(--primary-color);
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
        border-top: 1px solid color-mix(in srgb, var(--primary-color) 10%, transparent);
      }

      .lesson-item {
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 5%, transparent);
      }

      .lesson-item:last-child {
        border-bottom: none;
      }

      .lesson-item:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }
      
      .lesson-item.locked {
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      .lesson-item.locked:hover {
        background: transparent;
      }

      .lesson-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--primary-color) 20%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
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
        background: var(--primary-color);
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

      /* Mobile Menu Toggle Button */
      .course-mobile-menu-toggle {
        display: none;
        position: fixed;
        top: 22px;
        left: 18px;
        z-index: 1001;
        background: transparent;
        border: none;
        color: var(--primary-color);
        padding: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .course-mobile-menu-toggle:hover {
        opacity: 0.8;
        transform: scale(1.1);
      }

      /* Mobile Sidebar Overlay */
      .course-sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .course-sidebar-overlay.active {
        opacity: 1;
        display: block;
      }

      /* Responsive */
      @media (max-width: 968px) {
        .course-mobile-menu-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .course-learning-header {
          padding: 16px 20px 16px 60px;
        }

        .course-learning-content {
          padding: 30px 20px;
        }

        .course-title {
          font-size: 28px;
        }

        .course-info {
          flex-direction: column;
          gap: 16px;
        }

        .modules-list {
          gap: 12px;
        }

        .module-header {
          padding: 20px;
        }

        .module-title {
          font-size: 16px;
        }

        .lesson-item {
          padding: 14px 20px;
        }

        .lesson-icon {
          width: 36px;
          height: 36px;
        }
      }

      @media (max-width: 480px) {
        .course-learning-header {
          padding: 15px 15px 15px 55px;
        }

        .course-learning-content {
          padding: 20px 15px;
        }

        .course-title {
          font-size: 24px;
        }

        .welcome-card {
          padding: 20px;
        }

        .module-header {
          padding: 16px;
        }

        .lesson-item {
          padding: 12px 16px;
        }

        .lesson-icon {
          width: 32px;
          height: 32px;
        }

        .header-actions {
          gap: 6px;
        }

        .logout-text {
          display: none;
        }

        .logout-btn {
          width: 40px !important;
          padding: 0 !important;
        }

        /* Make video play button even smaller on small mobile */
        .video-play-button {
          width: 50px !important;
          height: 50px !important;
        }

        .video-play-button svg {
          width: 25px !important;
          height: 25px !important;
        }
      }
    </style>

    <div class="course-learning-page">
      <!-- Mobile Menu Toggle -->
      <button class="course-mobile-menu-toggle" onclick="toggleCourseMobileSidebar()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <!-- Sidebar Overlay -->
      <div class="course-sidebar-overlay" onclick="closeCourseMobileSidebar()"></div>

      <!-- Header -->
      <header class="course-learning-header">
        <div class="header-logo">
          ${getLogoHTML()}
        </div>
        <div class="header-actions">
          <button class="icon-btn logout-btn" title="${t('courseLearning.logoutTitle')}"
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="logout-text">${t('courseLearning.logout')}</span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="course-learning-content">
        <!-- Course Header -->
        <div class="course-header">
          <h1 class="course-title">${course.title || t('courseLearning.untitledCourse')}</h1>
          
          <!-- Progress Section -->
          <div class="course-progress-section">
            <div class="progress-label">
              ${t('courseLearning.progressText', { progress })}
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
              <div class="progress-markers">
                <div class="progress-marker" style="left: 25%;"></div>
                <div class="progress-marker" style="left: 50%;"></div>
                <div class="progress-marker" style="left: 75%;"></div>
              </div>
            </div>
            <div class="progress-labels">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <!-- Course Info -->
          <div class="course-info">
            <div class="info-item">
              <svg class="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span>${t('courseLearning.lessonsCount', { count: totalLessons })}</span>
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
          <h2 class="section-title">${t('courseLearning.courseContent')}</h2>
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
    
    // Calculate module progress based on completed lessons
    const progress = window.courseProgress || { completedLessons: [], lastAccessedLesson: null };
    let completedInModule = 0;
    if (module.lessons && module.lessons.length > 0) {
      completedInModule = module.lessons.filter(lesson => 
        progress.completedLessons.includes(lesson._id)
      ).length;
    }
    const moduleProgress = lessonCount > 0 ? Math.round((completedInModule / lessonCount) * 100) : 0;
    
    // Determine progress status
    let progressClass = 'not-started';
    let progressColor = '#6B7280';
    if (moduleProgress === 100) {
      progressClass = 'completed';
      progressColor = '#10B981';
    } else if (moduleProgress > 0) {
      progressClass = 'in-progress';
      progressColor = 'var(--primary-color)';
    }

    return `
      <div class="module-card" data-module-id="${module._id}">
        <div class="module-header" onclick="toggleModule('${module._id}')">
          <div class="module-title-section">
            <h3 class="module-title">${index + 1}. ${module.title || t('courseLearning.untitledModule')}</h3>
            <p class="module-meta">${t('courseLearning.lessonsCount', { count: lessonCount })}</p>
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
    return `<p style="color: #9CA3AF; text-align: center; padding: 20px;">${t('courseLearning.noLessons')}</p>`;
  }

  const progress = window.courseProgress || { completedLessons: [], lastAccessedLesson: null };

  return lessons.map((lesson, index) => {
    const lessonIcon = getLessonIcon(lesson.type);
    const isCompleted = progress.completedLessons.includes(lesson._id);
    const isInProgress = progress.lastAccessedLesson === lesson._id && !isCompleted;
    
    // Check if lesson is unlocked (sequential access)
    const isFirstLesson = index === 0;
    const previousLessonCompleted = index > 0 && progress.completedLessons.includes(lessons[index - 1]._id);
    const isUnlocked = isFirstLesson || previousLessonCompleted || isCompleted || isInProgress;
    
    const clickHandler = isUnlocked 
      ? `openLesson('${moduleId}', '${lesson._id}')`
      : `showLockedLessonToast()`;

    return `
      <div class="lesson-item ${!isUnlocked ? 'locked' : ''}" onclick="${clickHandler}">
        <div class="lesson-icon" style="${!isUnlocked ? 'opacity: 0.5;' : ''}">
          ${lessonIcon}
        </div>
        <div class="lesson-info">
          <div class="lesson-title" style="${!isUnlocked ? 'opacity: 0.6;' : ''}">${lesson.title || t('courseLearning.untitledLesson')}</div>
          <div class="lesson-duration" style="${!isUnlocked ? 'opacity: 0.5;' : ''}">${lesson.duration ? translateDuration(lesson.duration) : t('courseLearning.noDuration')}</div>
        </div>
        ${isCompleted ? `
        <div class="lesson-status completed" style="width: 20px; height: 20px; border-radius: 50%; background: #10B981;"></div>
        ` : isInProgress ? `
        <div class="lesson-status in-progress" style="width: 20px; height: 20px; border-radius: 50%; background: #F59E0B;"></div>
        ` : !isUnlocked ? `
        <div class="lesson-status locked" style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
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
      showSuccessToast(t('courseLearning.comingSoon'));
    });
  }

  // Notification button
  const notificationBtn = document.querySelector('.notification-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      showSuccessToast(t('courseLearning.comingSoon'));
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

  // Mobile sidebar functions for course overview
  window.toggleCourseMobileSidebar = function() {
    // This function is for the course overview page (not the lesson player)
    showSuccessToast(t('courseLearning.mobileSidebarComingSoon'));
  };

  window.closeCourseMobileSidebar = function() {
    // This function is for the course overview page (not the lesson player)
  };

  // Mobile sidebar functions for lesson player
  window.togglePlayerSidebar = function() {
    const sidebar = document.getElementById('lessonSidebar');
    const overlay = document.querySelector('.course-sidebar-overlay');
    
    if (sidebar && overlay) {
      // Check if we're on mobile
      if (window.innerWidth <= 968) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
        
        if (sidebar.classList.contains('mobile-open')) {
          overlay.style.display = 'block';
          document.body.style.overflow = 'hidden';
        } else {
          setTimeout(() => {
            overlay.style.display = 'none';
          }, 300);
          document.body.style.overflow = 'auto';
        }
      } else {
        // Desktop behavior
        sidebar.classList.toggle('collapsed');
        const openBtn = document.getElementById('openSidebarBtn');
        if (openBtn) {
          openBtn.style.display = sidebar.classList.contains('collapsed') ? 'flex' : 'none';
        }
      }
    }
  };

  window.closePlayerSidebar = function() {
    const sidebar = document.getElementById('lessonSidebar');
    const overlay = document.querySelector('.course-sidebar-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
      
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
      document.body.style.overflow = 'auto';
    }
  };
  
  // Show locked lesson toast
  window.showLockedLessonToast = function() {
    showErrorToast(t('courseLearning.pleaseWatchInOrder'));
  };

  // Open specific lesson - unified loader for ALL lesson types
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
      // Load unified lesson player (handles ALL lesson types)
      await loadUnifiedLessonPlayer(course, selectedLesson);
    } else {
      showErrorToast(t('courseLearning.lessonNotFound'));
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
  
  // NEW: Mark complete and go to next lesson (called by "Keyingi" button)
  window.markCompleteAndGoNext = async function(courseId, lessonId) {
    console.log('📝 Marking lesson complete and moving to next:', lessonId);
    
    // Mark current lesson as complete
    await window.markLessonComplete(courseId, lessonId);
    
    // Update UI to show completion
    if (window.courseProgress) {
      if (!window.courseProgress.completedLessons.includes(lessonId)) {
        window.courseProgress.completedLessons.push(lessonId);
      }
    }
    
    // Reload sidebar to show updated progress
    updateSidebarActiveLesson(course, window.currentLesson);
    
    // Find and navigate to next lesson
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
      showErrorToast(t('courseLearning.nextLessonNotFound'));
      return;
    }
    
    // Try next lesson in same module
    const currentModule = course.modules[currentModuleIndex];
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[currentLessonIndex + 1];
      showSuccessToast(t('courseLearning.lessonCompleted'));
      setTimeout(() => {
        window.openLesson(currentModule._id, nextLesson._id);
      }, 500);
      return;
    }
    
    // Try first lesson of next module
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        showSuccessToast(t('courseLearning.moduleCompleted'));
        setTimeout(() => {
          window.openLesson(nextModule._id, nextModule.lessons[0]._id);
        }, 500);
        return;
      }
    }
    
    // No more lessons - course completed!
    try {
      await completeCourse(courseId);
      showSuccessToast(t('courseLearning.courseCompleted'));
      setTimeout(() => {
        // Navigate to success page
        showCourseCompletionSuccess(course);
      }, 1500);
    } catch (error) {
      console.error('Course completion error:', error);
      // Still show success to user, but log the error
      showSuccessToast(t('courseLearning.courseCompleted'));
      setTimeout(() => {
        // Navigate to success page anyway
        showCourseCompletionSuccess(course);
      }, 1500);
    }
  };
  
  // DEPRECATED: Old function - kept for backward compatibility
  window.goToNextLesson = async function(courseId, lessonId) {
    // Just navigate without marking complete (used by quiz/assignment after they handle completion)
    let currentModuleIndex = -1;
    let currentLessonIndex = -1;
    
    const course = window.currentCourse || window.loadedCourse;
    if (!course) return;
    
    course.modules.forEach((module, mIdx) => {
      module.lessons.forEach((lesson, lIdx) => {
        if (lesson._id === lessonId) {
          currentModuleIndex = mIdx;
          currentLessonIndex = lIdx;
        }
      });
    });
    
    if (currentModuleIndex === -1) return;
    
    const currentModule = course.modules[currentModuleIndex];
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[currentLessonIndex + 1];
      window.openLesson(currentModule._id, nextLesson._id);
      return;
    }
    
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        window.openLesson(nextModule._id, nextModule.lessons[0]._id);
        return;
      }
    }
    
    showSuccessToast(t('courseLearning.allLessonsCompleted'));
  };
  
  // Store current lesson globally for next lesson function
  if (currentLesson) {
    window.currentLesson = currentLesson;
  }
}


// Handle logout
function handleLogout() {
  sessionStorage.removeItem('landingUser');
  sessionStorage.removeItem('currentTeacherId');
  showSuccessToast(t('courseLearning.loggingOut'));
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
}

// Unified lesson player that handles ALL lesson types with consistent header/sidebar
export async function loadUnifiedLessonPlayer(course, lesson) {
  console.log(`🎯 Loading unified player for ${lesson.type}:`, lesson.title);
  console.log(`📊 Course data:`, course);

  const mainContent = document.querySelector('.course-learning-page');
  if (!mainContent) return;

  // Store course data globally for sidebar and navigation functions
  window.loadedCourse = course;
  window.currentCourse = course;
  window.currentLesson = lesson;

  // Check if layout already exists
  const existingLayout = mainContent.querySelector('.lesson-player-layout');

  if (existingLayout) {
    // Layout exists, only update content area and sidebar with current lesson
    await updateLessonContent(existingLayout, course, lesson);
    updateSidebarActiveLesson(course, lesson);
    return;
  }

  // Create unified layout with consistent header and sidebar
  await renderUnifiedPlayerLayout(mainContent, course, lesson);
}

// Render the unified player layout
async function renderUnifiedPlayerLayout(mainContent, course, lesson) {
  console.log('🎨 renderUnifiedPlayerLayout:', {
    courseTitle: course?.title,
    lessonTitle: lesson?.title,
    courseModules: course?.modules?.length
  });

  mainContent.innerHTML = `
    <style>
      /* CSS Variables for theming - inherit from parent */
      :root {
        --primary-color: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#7ea2d4'};
        --background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--background-color') || '#232323'};
        --text-color: ${getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#ffffff'};
      }

      .lesson-player-layout {
        display: flex;
        height: calc(100vh - 81px);
        overflow: hidden;
      }

      /* Unified Sidebar */
      .lesson-sidebar {
        width: 280px;
        background: #2a2a2a;
        border-right: 1px solid color-mix(in srgb, var(--primary-color) 15%, transparent);
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

      /* Mobile responsive for lesson sidebar */
      @media (max-width: 968px) {
        .lesson-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 1000;
          transform: translateX(-100%);
          background: #2a2a2a;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
        }

        .lesson-sidebar.mobile-open {
          transform: translateX(0);
        }

        .lesson-content-area {
          width: 100%;
        }

        .open-sidebar-btn {
          display: none !important;
        }

        /* Ensure sidebar overlay covers everything */
        .course-sidebar-overlay {
          z-index: 999;
        }

        .course-sidebar-overlay.active {
          display: block;
        }

        /* Make video play button smaller on mobile */
        .video-play-button {
          width: 60px !important;
          height: 60px !important;
        }

        .video-play-button svg {
          width: 30px !important;
          height: 30px !important;
        }
      }

      .lesson-sidebar::-webkit-scrollbar {
        width: 6px;
      }

      .lesson-sidebar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      .lesson-sidebar::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--primary-color) 30%, transparent);
        border-radius: 3px;
      }

      .sidebar-header {
        padding: 20px 24px;
        border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
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
        color: var(--primary-color);
      }

      .sidebar-modules {
        padding: 12px 0;
      }

      .sidebar-module {
        border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 10%, transparent);
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
        background: color-mix(in srgb, var(--primary-color) 5%, transparent);
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
        color: var(--primary-color);
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
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }

      .sidebar-lesson.active {
        background: color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-left-color: var(--primary-color);
      }
      
      .sidebar-lesson.locked {
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      .sidebar-lesson.locked:hover {
        background: transparent;
      }

      .sidebar-lesson-icon {
        color: var(--primary-color);
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

      /* Content Area */
      .lesson-content-area {
        flex: 1;
        overflow-y: auto;
        background: #1a1a1a;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        position: relative;
        width: 100%;
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
        border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--primary-color);
        z-index: 10;
        transition: all 0.2s ease;
      }

      .open-sidebar-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        border-color: var(--primary-color);
      }

      .lesson-content-area::-webkit-scrollbar {
        width: 8px;
      }

      .lesson-content-area::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      .lesson-content-area::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--primary-color) 30%, transparent);
        border-radius: 4px;
      }
    </style>

    <!-- Mobile Menu Toggle for Lesson Player -->
    <button class="course-mobile-menu-toggle" onclick="togglePlayerSidebar()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- Sidebar Overlay for Lesson Player -->
    <div class="course-sidebar-overlay" onclick="closePlayerSidebar()"></div>

    <!-- Header stays the same -->
    <header class="course-learning-header">
      <div class="header-logo">
        ${getLogoHTML()}
      </div>
      <div class="header-actions">
        <button class="icon-btn logout-btn" title="${t('courseLearning.logoutTitle')}"
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="logout-text">${t('courseLearning.logout')}</span>
        </button>
      </div>
    </header>

    <!-- Unified Layout -->
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

      <!-- Content Area -->
      <div class="lesson-content-area" id="lessonContentArea">
        <!-- Open Sidebar Button (shown when sidebar is closed) -->
        <button class="open-sidebar-btn" id="openSidebarBtn" onclick="togglePlayerSidebar()" style="display: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <!-- Content will be loaded here -->
        <div id="dynamicLessonContent" style="width: 100%; display: flex; flex: 1;">
          Loading...
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

  // Load the specific lesson content
  await updateLessonContent(mainContent.querySelector('.lesson-player-layout'), course, lesson);
}

// Update lesson content based on type
async function updateLessonContent(layout, course, lesson) {
  const contentArea = layout.querySelector('#dynamicLessonContent');
  if (!contentArea) return;

  console.log(`📄 Updating content for ${lesson.type}:`, lesson.title);

  // Load content based on lesson type
  switch (lesson.type) {
    case 'video':
      await loadVideoContent(contentArea, lesson);
      break;
    case 'file':
      await loadFileContent(contentArea, lesson);
      break;
    case 'assignment':
      await loadAssignmentContent(contentArea, course, lesson);
      break;
    case 'quiz':
      await loadQuizContent(contentArea, course, lesson);
      break;
    default:
      contentArea.innerHTML = `
        <div style="text-align: center; padding: 60px; color: #9CA3AF;">
          <p>This lesson type (${lesson.type}) is not supported yet</p>
        </div>
      `;
  }
}

// Load lesson player in content area
export function loadLessonPlayer(course, lesson) {
  // For backward compatibility, redirect to unified player
  return loadUnifiedLessonPlayer(course, lesson);
}

// Content loading functions for each lesson type
async function loadVideoContent(contentArea, lesson) {
  const videoUrl = lesson.videoUrl || '';

  contentArea.innerHTML = `
    <div style="width: 100%; max-width: none; padding: 40px 60px; flex: 1;">
      <div style="width: 100%; max-height: 600px; background: #000000; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); position: relative; display: flex; align-items: center; justify-content: center;">
        ${videoUrl
          ? `<!-- Play Button -->
             <div id="video-play-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; transition: background 0.3s ease;" onclick="startProtectedVideo()">
               <div class="video-play-button" style="width: 80px; height: 80px; background: color-mix(in srgb, var(--primary-color) 90%, transparent); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="white" style="margin-left: 5px;">
                   <path d="M8 5v14l11-7z"/>
                 </svg>
               </div>
             </div>

             <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 998; background: transparent;" class="video-protection-overlay"></div>
             <div style="position: absolute; color: rgba(220, 220, 220, 0.9); font-size: 16px; font-weight: 400; font-family: monospace; pointer-events: none; z-index: 999; user-select: none; opacity: 0.9;" id="video-watermark">ID: Loading...</div>
             <video id="protected-video" controls controlsList="nodownload" disablePictureInPicture style="width: 100%; max-height: 600px; display: block; object-fit: contain; user-select: none;">
               <source src="${videoUrl}" type="video/mp4">
               Your browser does not support the video tag.
             </video>`
          : `<div style="padding: 200px 40px; text-align: center; color: #9CA3AF; font-size: 16px;">
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

        <button id="nextLessonBtn" onclick="markCompleteAndGoNext('${window.currentCourse?._id}', '${lesson._id}')" style="padding: 12px 24px; background: var(--primary-color); color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; margin-left: 20px; display: flex; align-items: center; gap: 8px;">
          ${isLastLesson(lesson._id) ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            ${t('courseLearning.finishCourse')}
          ` : `
            ${t('courseLearning.nextLesson')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          `}
        </button>
      </div>
    </div>
  `;

  // Initialize video protection if video exists
  if (videoUrl) {
    setTimeout(() => initVideoProtection(), 200);
  }
}

// Video protection functions - make them globally accessible
window.initVideoProtection = function() {
  const video = document.getElementById('protected-video');
  const watermark = document.getElementById('video-watermark');
  const overlay = document.querySelector('.video-protection-overlay');
  
  if (!video || !watermark) {
    console.log('⚠️ Video protection elements not found');
    return;
  }

  // Get student ID for watermark (last 5 characters only)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const landingUser = sessionStorage.getItem('landingUser');
  let studentId = 'XXXXX';
  
  if (user._id) {
    studentId = user._id.slice(-5).toUpperCase();
  } else if (landingUser) {
    try {
      const userData = JSON.parse(landingUser);
      if (userData._id) {
        studentId = userData._id.slice(-5).toUpperCase();
      }
    } catch (error) {
      console.error('Error parsing landing user:', error);
    }
  }

  // Set watermark text (only the ID, no prefix)
  watermark.textContent = studentId;

  // Position watermark randomly
  function updateWatermarkPosition() {
    const videoRect = video.getBoundingClientRect();
    const maxX = videoRect.width - 150;
    const maxY = videoRect.height - 30;
    
    const x = Math.random() * Math.max(0, maxX);
    const y = Math.random() * Math.max(0, maxY);
    
    watermark.style.left = `${x}px`;
    watermark.style.top = `${y}px`;
  }

  // Update position every 5 seconds
  updateWatermarkPosition();
  setInterval(updateWatermarkPosition, 5000);

  // Prevent right-click on video
  video.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Detect screenshot attempts (basic detection)
  document.addEventListener('keydown', (e) => {
    // Detect common screenshot keys
    if (
      (e.key === 'PrintScreen') ||
      (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) || // Mac
      (e.ctrlKey && e.shiftKey && e.key === 'S') // Windows Snipping Tool
    ) {
      if (overlay) {
        overlay.style.background = '#000000';
        overlay.style.zIndex = '1000';
        setTimeout(() => {
          overlay.style.background = 'transparent';
          overlay.style.zIndex = '998';
        }, 500);
      }
    }
  });

  console.log('✅ Video protection initialized');
};

window.startProtectedVideo = function() {
  const video = document.getElementById('protected-video');
  const playOverlay = document.getElementById('video-play-overlay');
  
  if (!video) {
    console.log('⚠️ Video element not found');
    return;
  }

  // Hide play overlay
  if (playOverlay) {
    playOverlay.style.display = 'none';
  }

  // Start playing video
  video.play().catch(error => {
    console.error('Error playing video:', error);
  });
};

async function loadFileContent(contentArea, lesson) {
  contentArea.innerHTML = `
    <div style="width: 100%; max-width: none; padding: 40px 60px; flex: 1;">
      <!-- File Header -->
      <h1 style="font-size: 36px; font-weight: 700; color: #ffffff; margin-bottom: 16px;">${lesson.title || 'File Resource'}</h1>

      <div style="display: flex; gap: 24px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid rgba(126, 162, 212, 0.2);">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #9CA3AF;">
          <svg style="color: var(--primary-color);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <span>File</span>
        </div>
      </div>

      <!-- Description -->
      ${lesson.description ? `
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 14px; font-weight: 500; color: #ffffff; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          About This File
        </h2>
        <div style="background: rgba(58, 56, 56, 0.3); border: 1px solid rgba(126, 162, 212, 0.2); border-radius: 12px; padding: 24px; color: #E5E7EB; line-height: 1.6;">
          ${lesson.description}
        </div>
      </div>
      ` : ''}

      <!-- File Download -->
      ${lesson.fileUrl ? `
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 14px; font-weight: 500; color: #ffffff; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/>
          </svg>
          Download File
        </h2>
        <div style="background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 10%, transparent), color-mix(in srgb, var(--primary-color) 5%, transparent)); border: 2px solid color-mix(in srgb, var(--primary-color) 30%, transparent); border-radius: 16px; padding: 32px; text-align: center; transition: all 0.3s ease; cursor: pointer;" onclick="downloadFile('${lesson.fileUrl}', getFileName('${lesson.fileUrl}', '${lesson.title}'))">
          <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: linear-gradient(135deg, var(--primary-color), #6b8fc4); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-color) 30%, transparent);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <div style="margin-bottom: 24px;">
            <div style="font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">${lesson.title || 'Download File'}</div>
            <div style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Click to download</div>
            <div style="font-size: 14px; color: #9CA3AF;">File available for download</div>
          </div>
          <button style="background: linear-gradient(135deg, var(--primary-color), #6b8fc4); color: white; border: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 12px; box-shadow: 0 4px 16px color-mix(in srgb, var(--primary-color) 30%, transparent);" onclick="event.stopPropagation(); downloadFile('${lesson.fileUrl}', getFileName('${lesson.fileUrl}', '${lesson.title}'))">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/>
            </svg>
            Download File
          </button>
        </div>
      </div>
      ` : ''}

      <!-- Next Lesson Button -->
      <div style="margin-top: 32px; display: flex; justify-content: flex-end; padding-top: 24px; border-top: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);">
        <button id="nextLessonBtn" onclick="markCompleteAndGoNext('${window.currentCourse?._id}', '${lesson._id}')" style="padding: 12px 24px; background: var(--primary-color); color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 8px;">
          ${isLastLesson(lesson._id) ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            ${t('courseLearning.finishCourse')}
          ` : `
            ${t('courseLearning.nextLesson')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          `}
        </button>
      </div>
    </div>
  `;

  // Add file download functionality
  window.downloadFile = function(url, filename) {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'downloaded_file';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  window.getFileName = function(url, title) {
    try {
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split('/').pop();
      if (fileName && fileName.includes('.')) {
        return fileName;
      }
    } catch (error) {
      console.log('Could not extract filename from URL');
    }
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    return cleanTitle || 'download';
  };
}

async function loadAssignmentContent(contentArea, course, lesson) {
  try {
    // Use static import instead of dynamic import
    await renderAssignmentContent(contentArea, course, lesson);
  } catch (error) {
    console.error('Error loading assignment content:', error);
    contentArea.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #ef4444;">
        <h3>Error loading assignment</h3>
        <p>Please refresh the page and try again.</p>
      </div>
    `;
  }
}

async function loadQuizContent(contentArea, course, lesson) {
  // Import and use the quiz player content
  const { renderQuizContent } = await import('./quiz-player.js');
  await renderQuizContent(contentArea, course, lesson);
}

// Build sidebar lessons list HTML for unified player
function buildLessonsListHtml(course, currentLesson) {
  console.log('🔧 buildLessonsListHtml called with:', course, currentLesson);

  if (!course || !course.modules || course.modules.length === 0) {
    console.log('❌ No course or modules found');
    return '<p style="color: #9CA3AF; text-align: center; padding: 40px;">No modules available</p>';
  }

  console.log('✅ Course data:', {
    title: course.title,
    modules: course.modules.length,
    moduleNames: course.modules.map(m => m.title)
  });

  return course.modules.map((module, index) => {
    const lessonCount = module.lessons ? module.lessons.length : 0;

    return `
      <div class="sidebar-module">
        <div class="sidebar-module-header" onclick="togglePlayerModule('${module._id}', ${index})">
          <div class="sidebar-module-title">${index + 1}. ${module.title || t('courseLearning.untitledModule')}</div>
          <div class="sidebar-module-count">${lessonCount}</div>
          <svg class="sidebar-module-arrow" id="player-arrow-${index}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
        <div class="sidebar-module-lessons" id="player-lessons-${index}">
          ${buildSidebarLessons(module.lessons || [], module._id, currentLesson)}
        </div>
      </div>
    `;
  }).join('');
}

// Build sidebar lessons HTML
function buildSidebarLessons(lessons, moduleId, currentLesson) {
  if (!lessons || lessons.length === 0) {
    return `<div style="color: #9CA3AF; text-align: center; padding: 20px; font-size: 14px;">${t('courseLearning.noLessons')}</div>`;
  }

  const progress = window.courseProgress || { completedLessons: [], lastAccessedLesson: null };

  return lessons.map((lesson, index) => {
    const lessonIcon = getLessonIcon(lesson.type);
    const isCompleted = progress.completedLessons.includes(lesson._id);
    const isActive = currentLesson && currentLesson._id === lesson._id;
    const isInProgress = progress.lastAccessedLesson === lesson._id && !isCompleted;
    
    // Check if lesson is unlocked (sequential access)
    const isFirstLesson = index === 0;
    const previousLessonCompleted = index > 0 && progress.completedLessons.includes(lessons[index - 1]._id);
    const isUnlocked = isFirstLesson || previousLessonCompleted || isCompleted || isInProgress;
    
    const clickHandler = isUnlocked 
      ? `openLesson('${moduleId}', '${lesson._id}')`
      : `showLockedLessonToast()`;

    return `
      <div class="sidebar-lesson ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}" onclick="${clickHandler}">
        <div class="sidebar-lesson-icon" style="${!isUnlocked ? 'opacity: 0.5;' : ''}">
          ${lessonIcon}
        </div>
        <div class="sidebar-lesson-info">
          <div class="sidebar-lesson-title" style="${!isUnlocked ? 'opacity: 0.6;' : ''}">${lesson.title || t('courseLearning.untitledLesson')}</div>
          <div class="sidebar-lesson-duration" style="${!isUnlocked ? 'opacity: 0.5;' : ''}">${lesson.duration ? translateDuration(lesson.duration) : t('courseLearning.noDuration')}</div>
        </div>
        ${isCompleted ? `
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #10B981; margin-left: auto;"></div>
        ` : isInProgress ? `
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #F59E0B; margin-left: auto;"></div>
        ` : !isUnlocked ? `
          <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; margin-left: auto;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Toggle module expansion in sidebar
window.togglePlayerModule = function(moduleId, index) {
  const lessonsDiv = document.getElementById(`player-lessons-${index}`);
  const arrow = document.getElementById(`player-arrow-${index}`);

  if (!lessonsDiv || !arrow) return;

  if (lessonsDiv.classList.contains('expanded')) {
    lessonsDiv.classList.remove('expanded');
    arrow.classList.remove('rotated');
  } else {
    lessonsDiv.classList.add('expanded');
    arrow.classList.add('rotated');
  }
};

// Update sidebar active lesson when navigating
function updateSidebarActiveLesson(course, lesson) {
  // Remove active class from all lessons
  const allLessons = document.querySelectorAll('.sidebar-lesson');
  allLessons.forEach(lessonEl => lessonEl.classList.remove('active'));

  // Add active class to current lesson
  const currentLessonEl = document.querySelector(`[onclick="openLesson('${lesson.moduleId || ''}', '${lesson._id}')"]`);
  if (currentLessonEl) {
    currentLessonEl.classList.add('active');
  }

  // Update sidebar content with fresh data if needed
  const sidebarModules = document.querySelector('.sidebar-modules');
  if (sidebarModules && course && lesson) {
    sidebarModules.innerHTML = buildLessonsListHtml(course, lesson);

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
  }
}

// Sidebar toggle functionality for unified player
window.togglePlayerSidebar = function() {
  const sidebar = document.getElementById('lessonSidebar');
  const openBtn = document.getElementById('openSidebarBtn');

  if (!sidebar) return;

  if (sidebar.classList.contains('collapsed')) {
    // Show sidebar
    sidebar.classList.remove('collapsed');
    if (openBtn) openBtn.style.display = 'none';
  } else {
    // Hide sidebar
    sidebar.classList.add('collapsed');
    if (openBtn) openBtn.style.display = 'flex';
  }
};

// Global navigation functionality
window.goToNextLesson = function(courseId, currentLessonId) {
  // Find next lesson in the current course
  const course = window.loadedCourse;
  if (!course || !course.modules) return;

  let foundCurrent = false;
  let nextLesson = null;

  for (const module of course.modules) {
    if (!module.lessons) continue;

    for (const lesson of module.lessons) {
      if (foundCurrent) {
        nextLesson = { lesson, moduleId: module._id };
        break;
      }
      if (lesson._id === currentLessonId) {
        foundCurrent = true;
      }
    }
    if (nextLesson) break;
  }

  if (nextLesson) {
    window.openLesson(nextLesson.moduleId, nextLesson.lesson._id);
  } else {
    // No more lessons - could show completion or return to course overview
    showSuccessToast(t('courseLearning.courseCompleted'));
  }
};


// Toast functions are imported from utils/toast.js
